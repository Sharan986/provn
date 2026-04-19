'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  Trophy, Star, CheckCircle, Clock, Send, ArrowLeft,
  Loader2, X, ExternalLink, BookOpen, Target, Play,
  Users, BarChart3, Zap, TrendingUp, Youtube, Eye,
  ThumbsUp, GraduationCap, ChevronRight, Award, Flame,
  Code, Brain, ShieldCheck, AlertCircle
} from 'lucide-react';
import Button from '@/components/Button';
import Card from '@/components/Card';
import Badge from '@/components/Badge';
import Input from '@/components/Input';
import { useToast } from '@/components/ToastContext';
import {
  getRoadmapWithSkills,
  getTasksByRoadmap,
  getUserRoadmapProgress,
  submitTaskWork
} from '@/lib/actions/roadmapFlow';
import { searchYouTubeCourses } from '@/lib/actions/youtube';
import { getSimulatorChallenges, getSimulatorProgress, getReadinessScore } from '@/lib/actions/simulator';
import SkillNode from '@/components/roadmap/SkillNode';

// Node types for React Flow
const nodeTypes = {
  skill: SkillNode,
};

export default function RoadmapFlowPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();

  // Get refresh timestamp from URL (used to force refetch after simulator)
  const refreshKey = searchParams.get('t') || '';

  const [loading, setLoading] = useState(true);
  const [roadmap, setRoadmap] = useState(null);
  const [skills, setSkills] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [progress, setProgress] = useState(null);
  const [isPro, setIsPro] = useState(true);

  // Side panel state
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [submitUrl, setSubmitUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  // YouTube courses state
  const [youtubeVideos, setYoutubeVideos] = useState([]);
  const [loadingVideos, setLoadingVideos] = useState(false);
  const [activeTab, setActiveTab] = useState('tasks'); // 'tasks' | 'resources'

  // Simulator/Assessment state
  const [simulatorChallenges, setSimulatorChallenges] = useState([]);
  const [simulatorProgress, setSimulatorProgress] = useState(null);
  const [readinessScore, setReadinessScore] = useState(null);
  const [showAssessment, setShowAssessment] = useState(false);

  // React Flow state
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Load roadmap data (refreshKey triggers refetch after simulator completion)
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [roadmapRes, tasksRes, progressRes, challengesRes, simProgressRes, readinessRes] = await Promise.all([
          getRoadmapWithSkills(params.id),
          getTasksByRoadmap(params.id),
          getUserRoadmapProgress(params.id),
          getSimulatorChallenges(params.id),
          getSimulatorProgress(params.id),
          getReadinessScore(null, params.id) // null = current user
        ]);

        if (roadmapRes?.data) {
          setRoadmap(roadmapRes.data.roadmap);
          setSkills(roadmapRes.data.skills || []);
          if (roadmapRes.data.isPro !== undefined) setIsPro(roadmapRes.data.isPro);
        } else if (roadmapRes?.error) {
          toast.error(roadmapRes.error);
        }

        if (tasksRes?.data) {
          setTasks(tasksRes.data);
        }

        if (progressRes?.data) {
          setProgress(progressRes.data);
        }

        if (challengesRes?.data) {
          setSimulatorChallenges(challengesRes.data);
        }

        if (simProgressRes?.data) {
          setSimulatorProgress(simProgressRes.data);
        }

        if (readinessRes?.data) {
          setReadinessScore(readinessRes.data);
        }
      } catch (error) {
        console.error('Error loading roadmap:', error);
        toast.error('Failed to load roadmap');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [params.id, refreshKey]); // refreshKey forces refetch

  // Build React Flow nodes and edges from skills
  useEffect(() => {
    if (!skills.length) return;

    const completedSkills = progress?.completedSkills || [];
    const inProgressSkills = progress?.inProgressSkills || [];

    const flowNodes = skills.map((skill, index) => ({
      id: skill.id,
      type: 'skill',
      position: {
        x: skill.position_x || 250,
        y: skill.position_y || (100 + index * 120)
      },
      data: {
        label: skill.name,
        description: skill.description,
        status: completedSkills.includes(skill.id)
          ? 'completed'
          : inProgressSkills.includes(skill.id)
            ? 'in-progress'
            : 'pending',
        orderIndex: skill.order_index || index,
        onClick: () => handleNodeClick(skill)
      },
    }));

    // Create edges connecting sequential skills
    const flowEdges = skills.slice(0, -1).map((skill, index) => ({
      id: `edge-${index}`,
      source: skill.id,
      target: skills[index + 1].id,
      type: 'smoothstep',
      animated: !completedSkills.includes(skill.id),
      style: {
        stroke: completedSkills.includes(skill.id) ? '#84cc16' : '#000',
        strokeWidth: 3
      }
    }));

    setNodes(flowNodes);
    setEdges(flowEdges);
  }, [skills, progress]);

  const handleNodeClick = useCallback((skill) => {
    setSelectedSkill(skill);
    setPanelOpen(true);
    setActiveTab('tasks');
    setYoutubeVideos([]);
  }, []);

  // Fetch YouTube videos when switching to resources tab
  useEffect(() => {
    async function fetchVideos() {
      if (activeTab === 'resources' && selectedSkill && youtubeVideos.length === 0) {
        setLoadingVideos(true);
        const result = await searchYouTubeCourses(selectedSkill.name);
        if (result.data) {
          setYoutubeVideos(result.data);
        }
        setLoadingVideos(false);
      }
    }
    fetchVideos();
  }, [activeTab, selectedSkill]);

  // Get tasks for selected skill
  const skillTasks = useMemo(() => {
    if (!selectedSkill || !tasks.length) return [];
    // Match tasks by skill_id or by order (fallback)
    return tasks.filter(t =>
      t.skill_id === selectedSkill.id ||
      (!t.skill_id && selectedSkill.order_index !== undefined)
    );
  }, [selectedSkill, tasks]);

  // Get submission status for a task
  const getTaskStatus = (taskId) => {
    if (!progress?.submissionMap) return null;
    return progress.submissionMap[taskId];
  };

  // Handle task submission
  const handleSubmit = async () => {
    if (!submitUrl || !selectedTask) return;

    setSubmitting(true);
    try {
      const result = await submitTaskWork(selectedTask.id, submitUrl);

      if (result.success) {
        toast.success('Task submitted successfully!');
        setSubmitUrl('');
        setSelectedTask(null);
        // Refresh progress
        const progressRes = await getUserRoadmapProgress(params.id);
        if (progressRes?.data) {
          setProgress(progressRes.data);
        }
      } else {
        toast.error(result.error || 'Failed to submit');
      }
    } catch (error) {
      toast.error('Failed to submit task');
    } finally {
      setSubmitting(false);
    }
  };

  const diffColor = (d) => d === 'beginner' ? 'lime' : d === 'intermediate' ? 'yellow' : 'purple';

  // Calculate progress percentage
  const progressPercent = progress?.totalPoints
    ? Math.round((progress.totalScore / progress.totalPoints) * 100)
    : 0;

  // Count completed skills
  const completedSkillsCount = progress?.completedSkills?.length || 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-black rounded-full animate-pulse" />
            <Loader2 size={32} className="absolute inset-0 m-auto animate-spin text-lime" />
          </div>
          <span className="font-mono text-sm text-muted">Loading your roadmap...</span>
        </div>
      </div>
    );
  }

  if (!roadmap) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-4">
        <Card variant="default" padding="lg" className="max-w-md text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 border-3 border-black flex items-center justify-center">
            <X size={32} className="text-red-500" />
          </div>
          <h2 className="heading-brutal text-2xl mb-2">ROADMAP NOT FOUND</h2>
          <p className="font-mono text-sm text-muted mb-6">
            This roadmap doesn&apos;t exist or may have been removed.
          </p>
          <Button variant="primary" onClick={() => router.push('/discover')} icon={ArrowLeft}>
            Browse Roadmaps
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-bg">
      {/* Enhanced Header */}
      <div className="bg-white border-b-4 border-black">
        <div className="px-4 sm:px-6 py-4">
          <div className="flex items-start sm:items-center justify-between gap-4 flex-wrap">
            {/* Left: Back + Title */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2.5 bg-bg border-3 border-black shadow-brutal-sm hover:shadow-brutal hover:-translate-y-0.5 transition-all"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="purple" size="sm">
                    <GraduationCap size={10} className="mr-1" />
                    LEARNING PATH
                  </Badge>
                  {progressPercent === 100 && (
                    <Badge variant="lime" size="sm">
                      <Award size={10} className="mr-1" />
                      COMPLETED
                    </Badge>
                  )}
                </div>
                <h1 className="heading-brutal text-xl sm:text-2xl">{roadmap.title}</h1>
              </div>
            </div>

            {/* Right: Stats */}
            <div className="flex items-center gap-3 flex-wrap">
              {/* Skills Progress */}
              <div className="flex items-center gap-2 px-3 py-2 bg-bg border-2 border-black">
                <BookOpen size={16} className="text-purple" />
                <span className="font-mono text-sm font-bold">
                  {completedSkillsCount}/{skills.length}
                </span>
                <span className="font-mono text-xs text-muted">skills</span>
              </div>

              {/* Tasks Count */}
              <div className="flex items-center gap-2 px-3 py-2 bg-bg border-2 border-black">
                <Target size={16} className="text-cyan-500" />
                <span className="font-mono text-sm font-bold">{tasks.length}</span>
                <span className="font-mono text-xs text-muted">tasks</span>
              </div>

              {/* Score Card */}
              <div className="flex items-center gap-3 px-4 py-2 bg-lime border-3 border-black shadow-brutal">
                <div className="flex items-center gap-2">
                  <Trophy size={20} className="text-black" />
                  <div>
                    <div className="heading-brutal text-lg leading-none">
                      {progress?.totalScore || 0}
                    </div>
                    <div className="font-mono text-[10px] text-black/60">
                      / {progress?.totalPoints || 0} pts
                    </div>
                  </div>
                </div>
                <div className="w-px h-8 bg-black/20" />
                <div className="text-center">
                  <div className="heading-brutal text-lg leading-none">{progressPercent}%</div>
                  <div className="font-mono text-[10px] text-black/60">done</div>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="h-3 bg-bg-dark border-2 border-black overflow-hidden">
              <div
                className="h-full bg-lime transition-all duration-500 relative"
                style={{ width: `${progressPercent}%` }}
              >
                {progressPercent > 10 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Flame size={10} className="text-black animate-pulse" />
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-between mt-1">
              <span className="font-mono text-[10px] text-muted">START</span>
              <span className="font-mono text-[10px] text-muted">MASTERY</span>
            </div>
          </div>

          {/* Industry Simulator Button - In Header */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {readinessScore && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-bg border-2 border-black">
                  <ShieldCheck size={14} className={readinessScore.score >= 70 ? 'text-lime-600' : 'text-muted'} />
                  <span className="font-mono text-xs">
                    Readiness: <strong className={readinessScore.score >= 70 ? 'text-lime-600' : ''}>{readinessScore.score || 0}</strong>/100
                  </span>
                </div>
              )}
              {simulatorProgress && simulatorChallenges.length > 0 && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-bg border-2 border-black">
                  <Code size={14} className="text-purple" />
                  <span className="font-mono text-xs">
                    Challenges: <strong>{simulatorProgress.completedCount || 0}</strong>/{simulatorChallenges.length}
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={() => isPro ? setShowAssessment(true) : toast.error('Pro Feature: Upgrade to take tests')}
              className={`flex items-center gap-2 px-4 py-2 border-3 border-black transition-all ${
                isPro 
                  ? 'bg-gradient-to-r from-purple to-cyan-500 shadow-brutal hover:shadow-brutal-lg hover:-translate-y-0.5' 
                  : 'bg-bg-dark opacity-70 cursor-not-allowed'
              }`}
            >
              <Brain size={18} className="text-white" />
              <span className="font-bold text-white text-sm">Industry Simulator</span>
              <span className="px-2 py-0.5 bg-white/20 rounded font-mono text-xs text-white">
                {simulatorChallenges.length} challenges
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex relative">
        {/* React Flow Canvas */}
        <div className={`flex-1 transition-all duration-300 ${panelOpen ? 'mr-[420px]' : ''}`}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.3 }}
            minZoom={0.5}
            maxZoom={2}
          >
            <Background color="#d4d4d4" gap={24} size={2} />
            <Controls
              className="border-3 border-black bg-white shadow-brutal"
              showInteractive={false}
            />
            <MiniMap
              className="border-3 border-black bg-white shadow-brutal"
              nodeColor={(node) => {
                if (node.data?.status === 'completed') return '#84cc16';
                if (node.data?.status === 'in-progress') return '#facc15';
                return '#fff';
              }}
              maskColor="rgba(0,0,0,0.1)"
            />
          </ReactFlow>

          {/* Empty state hint */}
          {skills.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 bg-bg-dark border-3 border-black flex items-center justify-center">
                  <BookOpen size={32} className="text-muted" />
                </div>
                <h3 className="heading-brutal text-lg mb-2">No Skills Yet</h3>
                <p className="font-mono text-sm text-muted max-w-xs">
                  This roadmap doesn&apos;t have any skills defined yet.
                </p>
              </div>
            </div>
          )}

          {/* Click hint */}
          {skills.length > 0 && !panelOpen && (
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 pointer-events-none">
              <div className="px-4 py-2 bg-black text-white font-mono text-xs flex items-center gap-2 animate-bounce">
                <ChevronRight size={14} />
                Click a skill node to see tasks
              </div>
            </div>
          )}
        </div>

        {/* Assessment Panel (Overlay) */}
        {showAssessment && (
          <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex">
            {/* Assessment Content */}
            <div className="w-full max-w-4xl mx-auto my-8 bg-white border-4 border-black shadow-brutal-lg overflow-auto">
              {/* Header */}
              <div className="p-6 border-b-4 border-black bg-gradient-to-r from-purple/10 via-cyan-500/10 to-lime/10">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="purple" size="sm">
                        <Brain size={10} className="mr-1" />
                        FINAL ASSESSMENT
                      </Badge>
                      {readinessScore?.score >= 70 && (
                        <Badge variant="lime" size="sm">
                          <ShieldCheck size={10} className="mr-1" />
                          INDUSTRY READY
                        </Badge>
                      )}
                    </div>
                    <h2 className="heading-brutal text-2xl mb-1">Industry Simulator</h2>
                    <p className="font-mono text-sm text-muted">
                      Complete these challenges to prove your skills and earn your Industry Readiness Score
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAssessment(false)}
                    className="p-3 bg-white border-3 border-black shadow-brutal hover:shadow-brutal-lg transition-all"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Readiness Score Card */}
                {readinessScore && (
                  <div className="mt-6 p-4 bg-bg border-3 border-black">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-mono text-xs text-muted mb-1">YOUR READINESS SCORE</div>
                        <div className="flex items-center gap-3">
                          <div className={`heading-brutal text-4xl ${readinessScore.score >= 80 ? 'text-lime-600' :
                              readinessScore.score >= 60 ? 'text-yellow-500' :
                                'text-red-500'
                            }`}>
                            {readinessScore.score || 0}
                          </div>
                          <div className="font-mono text-sm text-muted">/100</div>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div className="text-center px-4 py-2 bg-white border-2 border-black">
                          <div className="heading-brutal text-lg">{readinessScore.taskScore || 0}</div>
                          <div className="font-mono text-[10px] text-muted">Tasks (50)</div>
                        </div>
                        <div className="text-center px-4 py-2 bg-white border-2 border-black">
                          <div className="heading-brutal text-lg">{readinessScore.simulatorScore || 0}</div>
                          <div className="font-mono text-[10px] text-muted">Simulator (30)</div>
                        </div>
                        <div className="text-center px-4 py-2 bg-white border-2 border-black">
                          <div className="heading-brutal text-lg">{readinessScore.qualityScore || 0}</div>
                          <div className="font-mono text-[10px] text-muted">Quality (20)</div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 h-2 bg-bg-dark border border-black">
                      <div
                        className={`h-full transition-all duration-500 ${readinessScore.score >= 80 ? 'bg-lime' :
                            readinessScore.score >= 60 ? 'bg-yellow-400' :
                              'bg-red-400'
                          }`}
                        style={{ width: `${readinessScore.score || 0}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Challenges Grid */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="heading-brutal text-lg">Coding Challenges</h3>
                  <div className="font-mono text-sm text-muted">
                    {simulatorProgress?.completedCount || 0} / {simulatorChallenges.length} completed
                  </div>
                </div>

                {simulatorChallenges.length === 0 ? (
                  <div className="text-center py-12 border-3 border-dashed border-black/20">
                    <Code size={48} className="mx-auto text-muted mb-4" />
                    <h4 className="heading-brutal text-lg mb-2">No Challenges Yet</h4>
                    <p className="font-mono text-sm text-muted">
                      Simulator challenges for this roadmap coming soon!
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {simulatorChallenges.map((challenge, idx) => {
                      const attempt = simulatorProgress?.attempts?.find(a => a.challenge_id === challenge.id);
                      const isCompleted = attempt?.passed;
                      const isPending = attempt && !attempt.passed;

                      return (
                        <div
                          key={challenge.id}
                          className={`
                            p-4 border-3 border-black transition-all
                            ${isCompleted ? 'bg-lime/20' : isPending ? 'bg-yellow-100' : 'bg-white hover:shadow-brutal'}
                          `}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4">
                              <div className={`
                                w-12 h-12 flex items-center justify-center border-2 border-black
                                ${isCompleted ? 'bg-lime' : 'bg-bg'}
                              `}>
                                {isCompleted ? (
                                  <CheckCircle size={24} className="text-black" />
                                ) : (
                                  <span className="heading-brutal text-lg">{idx + 1}</span>
                                )}
                              </div>
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="heading-brutal text-base">{challenge.title}</h4>
                                  <Badge
                                    variant={challenge.difficulty === 'advanced' ? 'red' : challenge.difficulty === 'intermediate' ? 'orange' : 'lime'}
                                    size="xs"
                                  >
                                    {challenge.difficulty}
                                  </Badge>
                                </div>
                                <p className="font-mono text-xs text-muted line-clamp-2">
                                  {challenge.description}
                                </p>
                                <div className="flex items-center gap-4 mt-2">
                                  <span className="font-mono text-xs text-purple flex items-center gap-1">
                                    <Zap size={12} />
                                    {challenge.points} pts
                                  </span>
                                  <span className="font-mono text-xs text-muted flex items-center gap-1">
                                    <Clock size={12} />
                                    {challenge.time_limit_mins || 30} min
                                  </span>
                                  {challenge.category && (
                                    <span className="font-mono text-xs text-cyan-600 flex items-center gap-1">
                                      <Code size={12} />
                                      {challenge.category}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div>
                              {isCompleted ? (
                                <div className="text-center">
                                  <div className="heading-brutal text-lg text-lime-600">
                                    {attempt.score}/{challenge.points}
                                  </div>
                                  <div className="font-mono text-[10px] text-muted">PASSED</div>
                                </div>
                              ) : (
                                <Button
                                  variant="primary"
                                  size="sm"
                                  icon={Play}
                                  onClick={() => {
                                    // Navigate to simulator challenge page
                                    router.push(`/simulator/${challenge.id}`);
                                  }}
                                >
                                  {isPending ? 'Retry' : 'Start'}
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Info Box */}
                <div className="mt-6 p-4 bg-purple/10 border-2 border-purple/30">
                  <div className="flex items-start gap-3">
                    <AlertCircle size={20} className="text-purple flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-sm mb-1">How Your Score is Calculated</h4>
                      <ul className="font-mono text-xs text-muted space-y-1">
                        <li>• <strong>Tasks (50 pts):</strong> Complete roadmap tasks to earn up to 50 points</li>
                        <li>• <strong>Simulator (30 pts):</strong> Pass coding challenges to earn up to 30 points</li>
                        <li>• <strong>Quality (20 pts):</strong> Get high ratings on your task submissions</li>
                      </ul>
                      <p className="font-mono text-xs text-purple mt-2">
                        Scores 70+ are visible to industry partners for hiring opportunities!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Side Panel */}
        <div className={`
          fixed right-0 top-0 h-full w-[420px] bg-white border-l-4 border-black
          transform transition-transform duration-300 z-50 flex flex-col
          ${panelOpen ? 'translate-x-0' : 'translate-x-full'}
        `}>
          {selectedSkill && (
            <>
              {/* Panel Header */}
              <div className="p-4 border-b-4 border-black bg-gradient-to-br from-purple/10 to-transparent">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <Badge variant="purple" size="sm" className="mb-2">
                      <BookOpen size={10} className="mr-1" />
                      SKILL {(selectedSkill.order_index || 0) + 1} OF {skills.length}
                    </Badge>
                    <h2 className="heading-brutal text-xl leading-tight">{selectedSkill.name}</h2>
                    {selectedSkill.description && (
                      <p className="font-mono text-xs text-muted mt-2 leading-relaxed">
                        {selectedSkill.description}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => setPanelOpen(false)}
                    className="p-2 bg-white border-2 border-black shadow-brutal-xs hover:shadow-brutal hover:-translate-y-0.5 transition-all"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Skill progress indicator */}
                <div className="mt-4 flex items-center gap-3">
                  <div className="flex-1 h-2 bg-bg-dark border border-black overflow-hidden">
                    <div
                      className="h-full bg-purple transition-all"
                      style={{
                        width: `${skillTasks.length ? (skillTasks.filter(t => getTaskStatus(t.id)?.status === 'approved').length / skillTasks.length * 100) : 0}%`
                      }}
                    />
                  </div>
                  <span className="font-mono text-xs font-bold">
                    {skillTasks.filter(t => getTaskStatus(t.id)?.status === 'approved').length}/{skillTasks.length}
                  </span>
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="flex border-b-2 border-black">
                <button
                  onClick={() => setActiveTab('tasks')}
                  className={`flex-1 py-3 font-mono text-xs font-bold uppercase flex items-center justify-center gap-2 transition-colors ${activeTab === 'tasks'
                      ? 'bg-black text-white'
                      : 'bg-white text-black hover:bg-bg-dark'
                    }`}
                >
                  <Target size={14} />
                  Tasks ({skillTasks.length})
                </button>
                <button
                  onClick={() => setActiveTab('resources')}
                  className={`flex-1 py-3 font-mono text-xs font-bold uppercase flex items-center justify-center gap-2 transition-colors border-l-2 border-black ${activeTab === 'resources'
                      ? 'bg-red-600 text-white'
                      : 'bg-white text-black hover:bg-bg-dark'
                    }`}
                >
                  <Youtube size={14} />
                  Learn
                </button>
                <button
                  onClick={() => setActiveTab('test')}
                  className={`flex-1 py-3 font-mono text-xs font-bold uppercase flex items-center justify-center gap-2 transition-colors border-l-2 border-black ${activeTab === 'test'
                      ? 'bg-purple text-white'
                      : 'bg-white text-black hover:bg-bg-dark'
                    }`}
                >
                  <Zap size={14} />
                  Test
                </button>
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto">
                {activeTab === 'tasks' ? (
                  /* Tasks List */
                  <div className="p-4">
                    {skillTasks.length > 0 ? (
                      <div className="flex flex-col gap-3">
                        {skillTasks.map(task => {
                          const submission = getTaskStatus(task.id);
                          const status = submission?.status;

                          return (
                            <div
                              key={task.id}
                              className={`
                                p-4 border-3 border-black transition-all
                                ${status === 'approved'
                                  ? 'bg-lime/20 shadow-brutal-lime'
                                  : status === 'pending'
                                    ? 'bg-yellow/20 shadow-brutal-yellow'
                                    : 'bg-white shadow-brutal hover:shadow-brutal-lg hover:-translate-y-0.5'
                                }
                              `}
                            >
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <Badge variant={diffColor(task.difficulty)} size="sm">
                                    {task.difficulty}
                                  </Badge>
                                  <Badge variant="dark" size="sm">
                                    <Zap size={10} className="mr-1" />
                                    {task.points} pts
                                  </Badge>
                                  {task.type === 'industry' && (
                                    <Badge variant="purple" size="sm">
                                      <TrendingUp size={10} className="mr-1" />
                                      INDUSTRY
                                    </Badge>
                                  )}
                                </div>
                                {status === 'approved' && (
                                  <div className="p-1 bg-lime border-2 border-black">
                                    <CheckCircle size={14} />
                                  </div>
                                )}
                                {status === 'pending' && (
                                  <div className="p-1 bg-yellow border-2 border-black">
                                    <Clock size={14} />
                                  </div>
                                )}
                              </div>

                              <h4 className="font-black text-sm uppercase mb-1">{task.title}</h4>
                              <p className="font-mono text-xs text-muted mb-3 leading-relaxed">
                                {task.description}
                              </p>

                              {status === 'approved' ? (
                                <div className="flex items-center justify-between bg-lime/30 border-2 border-lime px-3 py-2">
                                  <span className="font-mono text-xs font-bold flex items-center gap-2">
                                    <CheckCircle size={12} /> Completed
                                  </span>
                                  <span className="font-mono text-xs font-bold">
                                    {submission.score}/{task.points}
                                  </span>
                                </div>
                              ) : status === 'pending' ? (
                                <div className="flex items-center gap-2 bg-yellow/30 border-2 border-yellow px-3 py-2">
                                  <Loader2 size={12} className="animate-spin" />
                                  <span className="font-mono text-xs font-bold">
                                    Awaiting Review
                                  </span>
                                </div>
                              ) : status === 'rejected' ? (
                                <div className="flex flex-col gap-2">
                                  <div className="bg-red-100 border-2 border-red-500 px-3 py-2">
                                    <span className="font-mono text-xs font-bold text-red-600">
                                      ✗ {submission.feedback || 'Needs revision'}
                                    </span>
                                  </div>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    fullWidth
                                    icon={Send}
                                    onClick={() => setSelectedTask(task)}
                                  >
                                    Resubmit Work
                                  </Button>
                                </div>
                              ) : (
                                <Button
                                  variant="primary"
                                  size="sm"
                                  fullWidth
                                  icon={Send}
                                  onClick={() => setSelectedTask(task)}
                                >
                                  Submit Work
                                </Button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 mx-auto mb-4 bg-bg-dark border-2 border-black flex items-center justify-center">
                          <Target size={24} className="text-muted" />
                        </div>
                        <p className="font-mono text-sm text-muted">
                          No tasks for this skill yet.
                        </p>
                      </div>
                    )}
                  </div>
                ) : activeTab === 'resources' ? (
                  /* YouTube Resources */
                  <div className="p-4">
                    {loadingVideos ? (
                      <div className="flex flex-col items-center justify-center py-12">
                        <Loader2 size={24} className="animate-spin text-red-500 mb-3" />
                        <span className="font-mono text-xs text-muted">
                          Finding courses for &quot;{selectedSkill.name}&quot;...
                        </span>
                      </div>
                    ) : youtubeVideos.length > 0 ? (
                      <div className="flex flex-col gap-3">
                        <p className="font-mono text-xs text-muted mb-2">
                          Top-rated tutorials for <span className="font-bold">{selectedSkill.name}</span>:
                        </p>
                        {youtubeVideos.map((video, index) => (
                          <a
                            key={video.id}
                            href={video.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group block bg-white border-2 border-black p-3 shadow-brutal-sm hover:shadow-brutal hover:-translate-y-0.5 transition-all relative"
                          >
                            {/* Top pick badge */}
                            {index === 0 && (
                              <div className="absolute -top-2 -left-2 px-2 py-0.5 bg-lime border-2 border-black font-mono text-[10px] font-black">
                                ⭐ TOP PICK
                              </div>
                            )}

                            <div className="flex gap-3">
                              {/* Thumbnail */}
                              <div className="relative w-32 h-20 flex-shrink-0 bg-black border-2 border-black overflow-hidden">
                                {video.thumbnail && (
                                  <img
                                    src={video.thumbnail}
                                    alt={video.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                  />
                                )}
                                {video.duration && (
                                  <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/80 text-white font-mono text-[10px] font-bold">
                                    {video.duration}
                                  </div>
                                )}
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                                  <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center">
                                    <Play size={18} className="text-white ml-0.5" fill="white" />
                                  </div>
                                </div>
                              </div>

                              {/* Info */}
                              <div className="flex-1 min-w-0">
                                <h5 className="font-bold text-xs uppercase leading-tight line-clamp-2 group-hover:text-red-600 transition-colors">
                                  {video.title}
                                </h5>
                                <p className="font-mono text-[10px] text-muted mt-1 truncate">
                                  {video.channelTitle}
                                </p>
                                <div className="flex items-center gap-2 mt-2 flex-wrap">
                                  <span className="font-mono text-[10px] text-muted flex items-center gap-1">
                                    <Eye size={10} />
                                    {video.viewCountFormatted}
                                  </span>
                                  {video.likeRatio && parseFloat(video.likeRatio) >= 4 && (
                                    <span className="px-1.5 py-0.5 bg-lime/30 border border-lime font-mono text-[9px] font-bold text-green-700 flex items-center gap-1">
                                      <ThumbsUp size={8} />
                                      {video.likeRatio}%
                                    </span>
                                  )}
                                  {video.durationMinutes >= 60 && (
                                    <span className="px-1.5 py-0.5 bg-purple/20 border border-purple font-mono text-[9px] font-bold text-purple">
                                      FULL COURSE
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </a>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 mx-auto mb-4 bg-red-100 border-2 border-black flex items-center justify-center">
                          <Youtube size={24} className="text-red-500" />
                        </div>
                        <p className="font-mono text-sm text-muted mb-1">
                          No tutorials found.
                        </p>
                        <p className="font-mono text-xs text-muted">
                          Try searching YouTube directly.
                        </p>
                        <a
                          href={`https://www.youtube.com/results?search_query=${encodeURIComponent(selectedSkill.name + ' tutorial')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block mt-4"
                        >
                          <Button variant="outline" size="sm" icon={ExternalLink}>
                            Search YouTube
                          </Button>
                        </a>
                      </div>
                    )}
                  </div>
                ) : activeTab === 'test' ? (
                  /* Test & Projects */
                  <div className="p-4">
                    {/* Best Score Card */}
                    <div className="p-4 bg-bg border-3 border-black mb-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-black text-sm uppercase">Topic Test</h4>
                      </div>
                      <p className="font-mono text-xs text-muted mb-3">
                        Take the test to unlock projects. 30 seconds per question.
                      </p>
                      <Button
                        variant="primary"
                        size="sm"
                        fullWidth
                        icon={Zap}
                        iconPosition="right"
                        onClick={() => {
                          if (!isPro) {
                            toast.error('Pro Feature: Upgrade to take tests');
                          } else {
                            toast.error('Test feature coming soon');
                          }
                        }}
                        disabled={!isPro}
                      >
                        {!isPro ? 'Pro Only: Give Test' : 'Give Test'}
                      </Button>
                    </div>

                    {/* Gated Projects */}
                    <h4 className="font-black text-sm uppercase mb-3">GATED PROJECTS</h4>
                    <div className="flex flex-col gap-3 relative">
                      {/* Fake blurred projects */}
                      {[
                        { title: 'Personal Profile Card', desc: 'Create a fully responsive personal profile card using semantic HTML and flexbox.', req: 33, order: 1, color: 'lime' },
                        { title: 'Responsive Landing Page', desc: 'Build a modern landing page for a SaaS product.', req: 66, order: 2, color: 'yellow' },
                        { title: 'Interactive Dashboard', desc: 'Develop a complex dashboard with multiple grids and interactive elements.', req: 85, order: 3, color: 'purple' }
                      ].map((proj) => (
                        <div key={proj.order} className="p-4 border-3 border-black bg-bg-dark opacity-70 relative overflow-hidden blur-[2px] pointer-events-none">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant={proj.color} size="sm">Project {proj.order}</Badge>
                            <Badge variant="default" size="sm">≥{proj.req}%</Badge>
                          </div>
                          <h5 className="font-black text-sm uppercase mb-1">{proj.title}</h5>
                          <p className="font-mono text-[10px] text-muted mb-2">{proj.desc}</p>
                        </div>
                      ))}

                      {/* Lock overlay */}
                      <div className="absolute inset-0 bg-black/5 flex items-center justify-center z-10 pointer-events-none">
                        <div className="text-center">
                          <div className="w-10 h-10 mx-auto mb-2 bg-white border-2 border-black flex items-center justify-center rounded-full shadow-brutal-sm">
                            <span className="text-lg">🔒</span>
                          </div>
                          <span className="font-mono text-[10px] font-bold bg-white px-2 py-1 border-2 border-black shadow-brutal-sm">
                            Score high to unlock
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </>
          )}
        </div>

        {/* Submit Modal */}
        {selectedTask && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div className="w-full max-w-md bg-white border-4 border-black shadow-brutal-lg animate-in fade-in zoom-in-95 duration-200">
              {/* Modal Header */}
              <div className="p-4 border-b-3 border-black bg-gradient-to-r from-lime/20 to-transparent">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={diffColor(selectedTask.difficulty)} size="sm">
                        {selectedTask.difficulty}
                      </Badge>
                      <Badge variant="dark" size="sm">
                        <Zap size={10} className="mr-1" />
                        {selectedTask.points} pts
                      </Badge>
                    </div>
                    <h3 className="heading-brutal text-lg">{selectedTask.title}</h3>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedTask(null);
                      setSubmitUrl('');
                    }}
                    className="p-2 bg-white border-2 border-black shadow-brutal-xs hover:shadow-brutal transition-all"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-4">
                <p className="font-mono text-xs text-muted mb-4 leading-relaxed">
                  {selectedTask.description}
                </p>

                <div className="mb-4 p-3 bg-bg border-2 border-black">
                  <h4 className="font-bold text-xs uppercase mb-2 flex items-center gap-2">
                    <CheckCircle size={12} /> Submission Guidelines
                  </h4>
                  <ul className="font-mono text-xs text-muted space-y-1">
                    <li>• Submit a GitHub repo link or deployed URL</li>
                    <li>• Make sure your work is publicly accessible</li>
                    <li>• Include a README with instructions</li>
                  </ul>
                </div>

                <Input
                  label="Project URL"
                  placeholder="https://github.com/you/project"
                  value={submitUrl}
                  onChange={(e) => setSubmitUrl(e.target.value)}
                  icon={ExternalLink}
                />

                <div className="flex gap-3 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedTask(null);
                      setSubmitUrl('');
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    className="flex-1"
                    icon={submitting ? Loader2 : Send}
                    onClick={() => isPro ? handleSubmit() : toast.error('Pro Feature: Upgrade to submit tasks')}
                    disabled={(!submitUrl || submitting) && isPro}
                  >
                    {!isPro ? 'Pro Only' : submitting ? 'Submitting...' : 'Submit'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
