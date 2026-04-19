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
        
        if (userRes?.data) setUser(userRes.data);
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="heading-brutal text-3xl sm:text-4xl">
              HEY, {user?.name?.split(' ')[0]?.toUpperCase() || 'THERE'}!
            </h1>
            <Badge variant="lime">
              <Trophy size={12} className="mr-1" />
              {stats.totalScore} PTS
            </Badge>
          </div>
          <p className="font-mono text-sm text-muted">Ready to level up today?</p>
        </div>
        <div className="flex gap-3">
          {user?.subscription_tier !== 'pro' && (
            <Link href="/pro">
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'SCORE', value: stats.totalScore, icon: Trophy, color: 'lime' },
          { label: 'COMPLETED', value: stats.tasksCompleted, icon: CheckCircle, color: 'purple' },
          { label: 'PENDING', value: stats.tasksPending, icon: Clock, color: 'yellow' },
          { label: 'AVAILABLE', value: stats.tasksAvailable, icon: Target, color: 'default' },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} variant={stat.color} padding="default">
              <Icon size={20} className="mb-2" />
              <div className="heading-brutal text-3xl">{stat.value}</div>
              <div className="label-brutal text-muted mt-1">{stat.label}</div>
            </Card>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Current Roadmap */}
        <div className="lg:col-span-1">
          <Card variant="default" padding="lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="heading-brutal text-lg">YOUR ROADMAP</h2>
              <Badge variant="dark" size="sm">
                <BookOpen size={10} className="mr-1" />
                ACTIVE
              </Badge>
            </div>
            <h3 className="font-black text-xl uppercase mb-4">{roadmap?.title || 'No Roadmap Selected'}</h3>
            {roadmap ? (
              <div className="flex flex-col gap-2">
                {getRoadmapSkills().map((skill, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between px-3 py-2 bg-bg border-2 border-black/10"
                  >
                    <span className="font-mono text-xs font-bold">{typeof skill === 'string' ? skill : skill.name}</span>
                    {skill.resources?.[0] && (
                      <a
                        href={skill.resources[0]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted hover:text-lime transition-colors"
                      >
                        <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="font-mono text-xs text-muted">Choose a roadmap to get started.</p>
            )}
            <div className="flex gap-2 mt-4">
              {roadmap?.id && (
                <Link href={`/roadmap/${roadmap.id}`} className="flex-1">
                  <Button variant="primary" size="sm" fullWidth icon={Map}>
                    View Roadmap
                  </Button>
                </Link>
              )}
              <Link href="/discover" className={roadmap?.id ? 'flex-1' : 'flex-1'}>
                <Button variant="outline" size="sm" fullWidth icon={ArrowRight} iconPosition="right">
                  {roadmap?.id ? 'Change' : 'Explore Roadmaps'}
                </Button>
              </Link>
            </div>
          </Card>

          {/* Pending Reviews */}
          <Card variant="yellow" padding="default" className="mt-6">
            <h2 className="heading-brutal text-lg mb-4">PENDING REVIEWS</h2>
            {pending.length > 0 ? (
              <div className="flex flex-col gap-3">
                {pending.map(p => (
                  <div key={p.id} className="flex items-center justify-between bg-white border-2 border-black px-3 py-2">
                    <div>
                      <span className="font-bold text-sm">{p.task}</span>
                      <span className="font-mono text-[10px] text-muted block">{p.submittedAt}</span>
                    </div>
                    <Badge variant="yellow" size="sm">
                      <Clock size={10} className="mr-1" />
                      Pending
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="font-mono text-xs text-muted">No pending reviews.</p>
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
          <div className="flex flex-col gap-4">
            {tasks.map(task => (
              <Card key={task.id} variant="default" hoverable>
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={difficultyColor(task.difficulty)} size="sm">
                        {task.difficulty}
                      </Badge>
                      <Badge variant="dark" size="sm">
                        <Star size={10} className="mr-1" />
                        {task.points} pts
                      </Badge>
                      <Badge variant="default" size="sm">{task.type}</Badge>
                    </div>
                    <h3 className="font-black text-lg uppercase">{task.title}</h3>
                    <p className="font-mono text-xs text-muted mt-1">{task.description}</p>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    icon={Send}
                    onClick={() => {
                      setSelectedTask(task);
                      setSubmitModalOpen(true);
                    }}
                  >
                    Submit
                  </Button>
                </div>
              </Card>
            ))}
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
