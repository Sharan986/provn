'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Trophy, Zap, Star, CheckCircle, Clock, ArrowRight,
  BookOpen, ExternalLink, Send, Crown, Rocket, Target, Loader2, Map
} from 'lucide-react';
import Button from '@/components/Button';
import Card from '@/components/Card';
import Badge from '@/components/Badge';
import Input from '@/components/Input';
import Modal from '@/components/Modal';
import { useToast } from '@/components/ToastContext';
import { getDashboardStats } from '@/lib/actions/scores';
import { getMyRoadmap } from '@/lib/actions/roadmaps';
import { getMyRoadmapTasks } from '@/lib/actions/tasks';
import { getMySubmissions, submitTask } from '@/lib/actions/submissions';
import { getCurrentUser } from '@/lib/actions/auth';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

export default function StudentDashboard() {
  const toast = useToast();
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [submitUrl, setSubmitUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ totalScore: 0, tasksCompleted: 0, tasksPending: 0, tasksAvailable: 0 });
  const [roadmap, setRoadmap] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [pending, setPending] = useState([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [userRes, statsRes, roadmapRes, tasksRes, submissionsRes] = await Promise.all([
          getCurrentUser(),
          getDashboardStats(),
          getMyRoadmap(),
          getMyRoadmapTasks(),
          getMySubmissions()
        ]);

        if (userRes) setUser(userRes);
        if (statsRes?.data) setStats(statsRes.data);
        if (roadmapRes?.data) setRoadmap(roadmapRes.data);
        if (tasksRes?.data) setTasks(tasksRes.data.slice(0, 4)); // Show first 4 tasks

        // Filter for pending submissions
        if (submissionsRes?.data) {
          const pendingSubmissions = submissionsRes.data
            .filter(s => s.status === 'pending')
            .map(s => ({
              id: s.id,
              task: s.tasks?.title || 'Unknown Task',
              submittedAt: formatTimeAgo(s.created_at),
              status: s.status
            }));
          setPending(pendingSubmissions);
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  function formatTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'today';
    if (diffDays === 1) return '1 day ago';
    return `${diffDays} days ago`;
  }

  const handleSubmit = async () => {
    if (!submitUrl || !selectedTask) return;

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('task_id', selectedTask.id);
      formData.append('content', submitUrl);

      const result = await submitTask(formData);

      if (result.success) {
        toast.success(`Submitted work for "${selectedTask.title}"!`);
        setSubmitModalOpen(false);
        setSubmitUrl('');
        // Refresh pending submissions
        const submissionsRes = await getMySubmissions();
        if (submissionsRes?.data) {
          const pendingSubmissions = submissionsRes.data
            .filter(s => s.status === 'pending')
            .map(s => ({
              id: s.id,
              task: s.tasks?.title || 'Unknown Task',
              submittedAt: formatTimeAgo(s.created_at),
              status: s.status
            }));
          setPending(pendingSubmissions);
        }
        // Refresh stats
        const statsRes = await getDashboardStats();
        if (statsRes?.data) setStats(statsRes.data);
      } else {
        toast.error(result.error || 'Failed to submit task');
      }
    } catch (error) {
      toast.error('Failed to submit task');
    } finally {
      setSubmitting(false);
    }
  };

  const difficultyColor = (d) => {
    if (d === 'beginner') return 'lime';
    if (d === 'intermediate') return 'yellow';
    return 'purple';
  };

  // Parse roadmap skills from curriculum array or JSON
  const getRoadmapSkills = () => {
    if (!roadmap) return [];
    if (roadmap.curriculum && Array.isArray(roadmap.curriculum)) {
      return roadmap.curriculum.map(skill => ({ name: skill, resources: [] }));
    }
    if (roadmap.skills && Array.isArray(roadmap.skills)) {
      return roadmap.skills;
    }
    return [];
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={32} className="animate-spin text-lime" />
          <span className="font-mono text-sm text-muted">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  // Use real data from backend, fallback to empty/placeholder if no data yet
  const activityData = stats.activityData?.length > 0 ? stats.activityData : [
    { day: 'Mon', pts: 3 }, { day: 'Tue', pts: 5 }, { day: 'Wed', pts: 8 },
    { day: 'Thu', pts: 6 }, { day: 'Fri', pts: 9 }, { day: 'Sat', pts: 14 }, { day: 'Sun', pts: 16 }
  ];

  const radarData = stats.radarData?.length > 0 ? stats.radarData : [
    { subject: 'Skills', value: 69, fullMark: 100 },
    { subject: 'Pending', value: 42, fullMark: 100 },
    { subject: 'Review', value: 67, fullMark: 100 }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="heading-brutal text-3xl sm:text-4xl">
              HEY, {user?.profile?.name?.split(' ')[0]?.toUpperCase() || 'THERE'}!
            </h1>
            <Badge variant="lime">
              <Trophy size={12} className="mr-1" />
              {stats.totalScore} PTS
            </Badge>
          </div>
          <p className="font-mono text-sm text-muted">Ready to level up today?</p>
        </div>
        <div className="flex gap-3">
          {user?.profile?.subscription_tier !== 'pro' && (
            <Link href="/pricing">
              <Button variant="purple" size="sm" icon={Crown}>
                Upgrade to PRO
              </Button>
            </Link>
          )}
          <Link href="/simulator">
            <Button variant="dark" size="sm" icon={Zap}>
              Simulator
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        {[
          { label: 'SCORE', value: stats.totalScore, icon: Trophy, color: 'lime', shadow: 'shadow-brutal-lime' },
          { label: 'COMPLETED', value: stats.tasksCompleted, icon: CheckCircle, color: 'purple', shadow: 'shadow-[4px_4px_0px_0px_#C084FC]' },
          { label: 'PENDING', value: stats.tasksPending, icon: Clock, color: 'yellow', shadow: 'shadow-brutal-yellow' },
          { label: 'AVAILABLE', value: stats.tasksAvailable, icon: Target, color: 'default', shadow: 'shadow-brutal' },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} variant={stat.color} padding="default" className={`transition-transform hover:-translate-y-1 ${stat.shadow}`}>
              <div className="flex flex-col h-full justify-between">
                <div className="w-8 h-8 sm:w-10 sm:h-10 border-2 border-black bg-white flex items-center justify-center mb-3">
                  <Icon size={18} className="text-black" />
                </div>
                <div>
                  <div className="heading-brutal text-3xl sm:text-4xl">{stat.value}</div>
                  <div className="label-brutal text-black/70 mt-1">{stat.label}</div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Analytics Charts */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Activity Chart */}
        <Card variant="default" padding="default" className="border-3 shadow-brutal flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="heading-brutal text-lg">WEEKLY ACTIVITY</h2>
            <Badge variant="lime" size="sm">7 DAYS</Badge>
          </div>
          <div className="h-[250px] w-full mt-auto">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={activityData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontFamily: 'monospace', fontSize: 10, fill: '#6b7280' }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontFamily: 'monospace', fontSize: 10, fill: '#6b7280' }}
                />
                <Tooltip
                  contentStyle={{
                    border: '2px solid black',
                    borderRadius: 0,
                    boxShadow: '4px 4px 0 0 #BEF264',
                    fontFamily: 'monospace',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}
                  itemStyle={{ color: 'black' }}
                />
                <Line
                  type="monotone"
                  dataKey="pts"
                  stroke="#000"
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2, fill: '#BEF264', stroke: '#000' }}
                  activeDot={{ r: 6, fill: '#BEF264', stroke: '#000', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Radar Chart */}
        <Card variant="default" padding="default" className="border-3 shadow-[4px_4px_0px_0px_#C084FC] flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <h2 className="heading-brutal text-lg">SKILL DISTRIBUTION</h2>
            <Badge variant="purple" size="sm">ANALYSIS</Badge>
          </div>
          <div className="h-[250px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="#e5e5e5" />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fontFamily: 'monospace', fontSize: 10, fill: '#000', fontWeight: 'bold' }}
                />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                  name="Skill Level"
                  dataKey="value"
                  stroke="#000"
                  strokeWidth={2}
                  fill="#C084FC"
                  fillOpacity={0.5}
                />
                <Tooltip
                  contentStyle={{
                    border: '2px solid black',
                    borderRadius: 0,
                    boxShadow: '4px 4px 0 0 #000',
                    fontFamily: 'monospace',
                    fontSize: '12px'
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Current Roadmap */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <Card variant="default" padding="lg" className="border-3">
            <div className="flex items-center justify-between mb-4">
              <h2 className="heading-brutal text-lg">YOUR ROADMAP</h2>
              <Badge variant="dark" size="sm" className="animate-pulse-brutal">
                <BookOpen size={10} className="mr-1" />
                ACTIVE
              </Badge>
            </div>
            <h3 className="font-black text-xl uppercase mb-4 leading-tight">{roadmap?.title || 'No Roadmap Selected'}</h3>

            {roadmap ? (
              <div className="flex flex-col gap-2">
                <div className="h-3 w-full bg-bg-dark border-2 border-black overflow-hidden mb-2">
                  <div className="h-full bg-lime transition-all" style={{ width: `${Math.min(100, (stats.tasksCompleted / (stats.tasksAvailable || 1)) * 100)}%` }} />
                </div>

                {getRoadmapSkills().slice(0, 4).map((skill, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between px-3 py-2 bg-white border-2 border-black shadow-[2px_2px_0px_0px_#000000] hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_#000000] transition-all"
                  >
                    <span className="font-mono text-xs font-bold line-clamp-1 flex-1">{typeof skill === 'string' ? skill : skill.name}</span>
                    {skill.resources?.[0] && (
                      <a
                        href={skill.resources[0]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted hover:text-black ml-2"
                      >
                        <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                ))}
                {getRoadmapSkills().length > 4 && (
                  <div className="text-center mt-1">
                    <span className="font-mono text-[10px] font-bold text-muted">+ {getRoadmapSkills().length - 4} MORE SKILLS</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 bg-bg border-2 border-black border-dashed text-center">
                <p className="font-mono text-xs text-muted mb-3">Choose a roadmap to get started and unlock your potential.</p>
                <Link href="/discover">
                  <Button variant="primary" size="sm" fullWidth>Browse</Button>
                </Link>
              </div>
            )}

            {roadmap?.id && (
              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <Link href={`/roadmap/${roadmap.id}`} className="flex-1">
                  <Button variant="primary" size="default" fullWidth icon={Map} className="shadow-[4px_4px_0px_0px_#000000]">
                    Open Area
                  </Button>
                </Link>
                <Link href="/discover" className="sm:w-auto">
                  <Button variant="outline" size="default" fullWidth icon={ArrowRight} className="bg-bg">
                    Change
                  </Button>
                </Link>
              </div>
            )}
          </Card>

          {/* Pending Reviews */}
          <Card variant="yellow" padding="default" className="border-3 shadow-brutal-yellow">
            <h2 className="heading-brutal text-lg mb-4 flex items-center gap-2">
              <Clock size={18} /> PENDING REVIEWS
            </h2>
            {pending.length > 0 ? (
              <div className="flex flex-col gap-3">
                {pending.map(p => (
                  <div key={p.id} className="flex items-center justify-between bg-white border-2 border-black p-3 hover:-translate-y-0.5 hover:shadow-[2px_2px_0px_0px_#000000] transition-all">
                    <div className="min-w-0 pr-2">
                      <span className="font-bold text-sm line-clamp-1 uppercase">{p.task}</span>
                      <span className="font-mono text-[10px] font-bold text-muted block mt-0.5">{p.submittedAt}</span>
                    </div>
                    <div className="flex-shrink-0 w-8 h-8 bg-yellow border-2 border-black flex items-center justify-center animate-pulse">
                      <Clock size={14} className="text-black" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-white/50 border-2 border-black border-dashed text-center">
                <p className="font-mono text-xs font-bold text-black/70">ALL CAUGHT UP!</p>
              </div>
            )}
          </Card>
        </div>

        {/* Available Tasks */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="heading-brutal text-xl">AVAILABLE TASKS</h2>
            <Link href="/tasks">
              <Button variant="ghost" size="sm" icon={ArrowRight} iconPosition="right">
                View All
              </Button>
            </Link>
          </div>
          <div className="flex flex-col gap-4 sm:gap-5">
            {tasks.map(task => (
              <div
                key={task.id}
                className="bg-white border-3 border-black p-4 sm:p-5 shadow-[4px_4px_0px_0px_#000000] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_#000000] transition-all duration-200"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <Badge variant={difficultyColor(task.difficulty)} size="sm">
                        {task.difficulty}
                      </Badge>
                      <Badge variant="dark" size="sm">
                        <Star size={10} className="mr-1" />
                        {task.points} pts
                      </Badge>
                      <span className="font-mono text-[10px] font-bold px-2 py-1 bg-bg border border-black uppercase">
                        {task.type}
                      </span>
                    </div>
                    <h3 className="font-black text-lg sm:text-xl uppercase leading-tight mb-2">{task.title}</h3>
                    <p className="font-mono text-xs text-muted leading-relaxed line-clamp-2">{task.description}</p>
                  </div>
                  <div className="flex-shrink-0 w-full sm:w-auto mt-2 sm:mt-0">
                    <Button
                      variant="primary"
                      size="default"
                      icon={Send}
                      className="w-full sm:w-auto shadow-[4px_4px_0px_0px_#000000]"
                      onClick={() => {
                        setSelectedTask(task);
                        setSubmitModalOpen(true);
                      }}
                    >
                      Submit
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {tasks.length === 0 && (
              <div className="p-8 text-center bg-white border-3 border-black border-dashed">
                <Target size={32} className="mx-auto mb-4 text-muted" />
                <h3 className="font-black text-xl uppercase mb-2">No Active Tasks</h3>
                <p className="font-mono text-sm text-muted mb-4">You need to select a roadmap and navigate to a skill to find tasks.</p>
                <Link href="/discover">
                  <Button variant="primary">Explore Roadmaps</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Submit Modal */}
      <Modal
        isOpen={submitModalOpen}
        onClose={() => setSubmitModalOpen(false)}
        title="SUBMIT WORK"
        size="md"
      >
        {selectedTask && (
          <div>
            <div className="mb-4">
              <Badge variant={difficultyColor(selectedTask.difficulty)} size="sm">
                {selectedTask.difficulty}
              </Badge>
              <h3 className="font-black text-xl uppercase mt-2">{selectedTask.title}</h3>
              <p className="font-mono text-xs text-muted mt-1">{selectedTask.description}</p>
            </div>
            <Input
              label="Project URL"
              placeholder="https://github.com/you/project"
              value={submitUrl}
              onChange={(e) => setSubmitUrl(e.target.value)}
            />
            <div className="mt-6 flex gap-3">
              <Button variant="outline" onClick={() => setSubmitModalOpen(false)}>Cancel</Button>
              <Button
                variant="primary"
                fullWidth
                icon={submitting ? Loader2 : Send}
                onClick={handleSubmit}
                disabled={!submitUrl || submitting}
              >
                {submitting ? 'Submitting...' : 'Submit Work'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
