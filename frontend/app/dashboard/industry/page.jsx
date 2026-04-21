'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Briefcase, Plus, Users, Clock, CheckCircle, XCircle,
  Search, Star, Eye, Mail, Trophy, ArrowRight, Filter,
  Send, ChevronDown, Loader2, ExternalLink
} from 'lucide-react';
import Button from '@/components/Button';
import Card from '@/components/Card';
import Badge from '@/components/Badge';
import Input from '@/components/Input';
import Modal from '@/components/Modal';
import { useToast } from '@/components/ToastContext';
import { getDashboardStats, getStudentLeaderboard } from '@/lib/actions/scores';
import { getSubmissionsForReview, reviewSubmission } from '@/lib/actions/submissions';
import { createTask } from '@/lib/actions/tasks';

export default function IndustryDashboard() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  const [reviewScore, setReviewScore] = useState(50);
  const [reviewFeedback, setReviewFeedback] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [creatingTask, setCreatingTask] = useState(false);

  // Data states
  const [stats, setStats] = useState({ myTasks: 0, pendingReviews: 0, totalStudents: 0 });
  const [submissions, setSubmissions] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);

  // Create task form
  const [taskForm, setTaskForm] = useState({
    title: '', description: '', type: 'industry', difficulty: 'intermediate', points: 25
  });

  useEffect(() => {
    async function loadData() {
      try {
        const [statsRes, submissionsRes, leaderboardRes] = await Promise.all([
          getDashboardStats(),
          getSubmissionsForReview({ status: 'pending' }),
          getStudentLeaderboard()
        ]);
        
        if (statsRes?.data) setStats(statsRes.data);
        if (submissionsRes?.data) {
          setSubmissions(submissionsRes.data.map(s => ({
            id: s.id,
            student: s.users?.name || 'Unknown',
            email: s.users?.email || '',
            branch: s.users?.branch || 'N/A',
            task: s.tasks?.title || 'Unknown Task',
            content: s.content,
            submittedAt: formatTimeAgo(s.created_at),
            type: s.tasks?.type || 'platform',
            difficulty: s.tasks?.difficulty || 'beginner',
            points: s.tasks?.points || 0
          })));
        }
        if (leaderboardRes?.data) {
          setLeaderboard(leaderboardRes.data.map(s => ({
            id: s.id,
            name: s.name || 'Unknown',
            email: s.email || '',
            branch: s.branch || 'N/A',
            totalScore: s.totalScore || 0,
            tasksCompleted: s.tasksCompleted || 0,
            interests: s.interests || []
          })));
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

  const filteredLeaderboard = leaderboard.filter(s => {
    const matchSearch = !searchQuery ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchBranch = !branchFilter || s.branch === branchFilter;
    return matchSearch && matchBranch;
  });

  const handleCreateTask = async () => {
    if (!taskForm.title) return;
    
    setCreatingTask(true);
    try {
      const formData = new FormData();
      formData.append('title', taskForm.title);
      formData.append('description', taskForm.description);
      formData.append('type', taskForm.type);
      formData.append('difficulty', taskForm.difficulty);
      formData.append('points', taskForm.points);
      
      const result = await createTask(formData);
      
      if (result.success) {
        toast.success(`Task "${taskForm.title}" created!`);
        setCreateTaskOpen(false);
        setTaskForm({ title: '', description: '', type: 'industry', difficulty: 'intermediate', points: 25 });
        // Refresh stats
        const statsRes = await getDashboardStats();
        if (statsRes?.data) setStats(statsRes.data);
      } else {
        toast.error(result.error || 'Failed to create task');
      }
    } catch (error) {
      toast.error('Failed to create task');
    } finally {
      setCreatingTask(false);
    }
  };

  const handleReview = async (status) => {
    if (!selectedSubmission) return;
    
    setSubmittingReview(true);
    try {
      const formData = new FormData();
      formData.append('status', status);
      formData.append('score', status === 'approved' ? reviewScore : 0);
      formData.append('feedback', reviewFeedback);
      
      const result = await reviewSubmission(selectedSubmission.id, formData);
      
      if (result.success) {
        toast.success(`Submission ${status === 'approved' ? 'approved' : 'rejected'}!`);
        setReviewOpen(false);
        setReviewScore(50);
        setReviewFeedback('');
        // Refresh submissions
        const submissionsRes = await getSubmissionsForReview({ status: 'pending' });
        if (submissionsRes?.data) {
          setSubmissions(submissionsRes.data.map(s => ({
            id: s.id,
            student: s.users?.name || 'Unknown',
            email: s.users?.email || '',
            branch: s.users?.branch || 'N/A',
            task: s.tasks?.title || 'Unknown Task',
            content: s.content,
            submittedAt: formatTimeAgo(s.created_at),
            type: s.tasks?.type || 'platform',
            difficulty: s.tasks?.difficulty || 'beginner',
            points: s.tasks?.points || 0
          })));
        }
        // Refresh stats
        const statsRes = await getDashboardStats();
        if (statsRes?.data) setStats(statsRes.data);
      } else {
        toast.error(result.error || 'Failed to review submission');
      }
    } catch (error) {
      toast.error('Failed to review submission');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={32} className="animate-spin text-purple" />
          <span className="font-mono text-sm text-muted">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="heading-brutal text-3xl sm:text-4xl flex items-center gap-3">
            <Briefcase size={32} />
            TALENT PIPELINE
          </h1>
          <p className="font-mono text-sm text-muted mt-1">Manage tasks, review work, hire top talent.</p>
        </div>
        <Button
          variant="primary"
          icon={Plus}
          onClick={() => setCreateTaskOpen(true)}
        >
          New Task
        </Button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'MY TASKS', value: stats.myTasks, icon: Briefcase, color: 'purple' },
          { label: 'PENDING REVIEWS', value: stats.pendingReviews, icon: Clock, color: 'yellow' },
          { label: 'TOTAL STUDENTS', value: stats.totalStudents, icon: Users, color: 'lime' },
        ].map(stat => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} variant={stat.color}>
              <Icon size={20} className="mb-2" />
              <div className="heading-brutal text-3xl">{stat.value}</div>
              <div className="label-brutal text-muted mt-1">{stat.label}</div>
            </Card>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Pending Submissions */}
        <div>
          <h2 className="heading-brutal text-xl mb-4 flex items-center gap-2">
            <Clock size={20} />
            PENDING SUBMISSIONS
          </h2>
          <div className="flex flex-col gap-3">
            {submissions.length > 0 ? submissions.map(sub => (
              <Card key={sub.id} variant="default">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-black text-sm uppercase">{sub.student}</span>
                      <Badge variant="default" size="sm">{sub.branch}</Badge>
                    </div>
                    <div className="font-mono text-xs text-muted">{sub.task}</div>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="dark" size="sm">
                        <Star size={10} className="mr-1" />{sub.points} pts
                      </Badge>
                      <span className="font-mono text-[10px] text-muted">{sub.submittedAt}</span>
                    </div>
                  </div>
                  <Button
                    variant="dark"
                    size="sm"
                    icon={Eye}
                    onClick={() => {
                      setSelectedSubmission(sub);
                      setReviewOpen(true);
                    }}
                  >
                    Review
                  </Button>
                </div>
              </Card>
            )) : (
              <Card variant="muted">
                <p className="font-mono text-xs text-muted text-center py-4">No pending submissions to review.</p>
              </Card>
            )}
          </div>
        </div>

        {/* Leaderboard */}
        <div>
          <h2 className="heading-brutal text-xl mb-4 flex items-center gap-2">
            <Trophy size={20} />
            TOP CANDIDATES
          </h2>
          <div className="flex gap-3 mb-4">
            <div className="flex-1 relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="text"
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-white border-brutal font-mono text-xs shadow-brutal-sm focus:outline-none focus:shadow-brutal"
              />
            </div>
            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="bg-white border-brutal px-3 py-2 font-mono text-xs shadow-brutal-sm cursor-pointer focus:outline-none"
            >
              <option value="">All Branches</option>
              <option value="Computer Science">CS</option>
              <option value="Information Technology">IT</option>
              <option value="Electronics">ECE</option>
            </select>
          </div>
          <div className="flex flex-col gap-3">
            {filteredLeaderboard.map((student, rank) => (
              <Card key={student.id} variant="default">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 flex items-center justify-center font-black text-sm border-2 border-black
                    ${rank === 0 ? 'bg-lime' : rank === 1 ? 'bg-purple' : rank === 2 ? 'bg-yellow' : 'bg-white'}
                  `}>
                    {rank + 1}
                  </div>
                  <div className="flex-1">
                    <span className="font-black text-sm uppercase">{student.name}</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="font-mono text-[10px] text-muted">{student.branch}</span>
                      <span className="font-mono text-[10px] text-muted">•</span>
                      <span className="font-mono text-[10px] text-muted">{student.tasksCompleted} tasks</span>
                    </div>
                  </div>
                  <Badge variant="lime" size="sm">
                    <Trophy size={10} className="mr-1" />{student.totalScore}
                  </Badge>
                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        setSelectedStudent(student);
                        setProfileOpen(true);
                      }}
                      className="p-2 border-2 border-black hover:bg-bg-dark transition-colors cursor-pointer"
                    >
                      <Eye size={14} />
                    </button>
                    <button className="p-2 border-2 border-black bg-lime hover:bg-lime-dark transition-colors cursor-pointer">
                      <Mail size={14} />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Create Task Modal */}
      <Modal isOpen={createTaskOpen} onClose={() => setCreateTaskOpen(false)} title="CREATE NEW TASK" size="md">
        <div className="flex flex-col gap-4">
          <Input
            label="Task Title"
            placeholder="Build a REST API"
            value={taskForm.title}
            onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
          />
          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-xs font-bold uppercase tracking-wider">Description</label>
            <textarea
              placeholder="Describe the task requirements..."
              value={taskForm.description}
              onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 bg-white text-black border-brutal shadow-brutal-sm font-mono text-sm placeholder:text-muted-light focus:outline-none focus:shadow-brutal resize-none"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-xs font-bold uppercase tracking-wider">Type</label>
              <select
                value={taskForm.type}
                onChange={(e) => setTaskForm({ ...taskForm, type: e.target.value })}
                className="w-full px-3 py-3 bg-white border-brutal shadow-brutal-sm font-mono text-xs cursor-pointer focus:outline-none"
              >
                <option value="industry">Industry</option>
                <option value="platform">Platform</option>
                <option value="internship">Internship</option>
                <option value="job">Job</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-xs font-bold uppercase tracking-wider">Difficulty</label>
              <select
                value={taskForm.difficulty}
                onChange={(e) => setTaskForm({ ...taskForm, difficulty: e.target.value })}
                className="w-full px-3 py-3 bg-white border-brutal shadow-brutal-sm font-mono text-xs cursor-pointer focus:outline-none"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <Input
              label="Points"
              type="number"
              value={taskForm.points}
              onChange={(e) => setTaskForm({ ...taskForm, points: parseInt(e.target.value) })}
            />
          </div>
          <div className="flex gap-3 mt-2">
            <Button variant="outline" onClick={() => setCreateTaskOpen(false)}>Cancel</Button>
            <Button 
              variant="primary" 
              fullWidth 
              icon={creatingTask ? Loader2 : Plus} 
              onClick={handleCreateTask} 
              disabled={!taskForm.title || creatingTask}
            >
              {creatingTask ? 'Creating...' : 'Create Task'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Review Modal */}
      <Modal isOpen={reviewOpen} onClose={() => setReviewOpen(false)} title="REVIEW SUBMISSION" size="md">
        {selectedSubmission && (
          <div className="flex flex-col gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-black uppercase">{selectedSubmission.student}</span>
                <Badge variant="default" size="sm">{selectedSubmission.branch}</Badge>
              </div>
              <h3 className="font-black text-xl uppercase">{selectedSubmission.task}</h3>
            </div>
            <div className="bg-bg-dark border-brutal p-4">
              <label className="label-brutal block mb-1">SUBMITTED WORK</label>
              <a href={selectedSubmission.content} target="_blank" rel="noopener noreferrer"
                className="font-mono text-sm text-black underline hover:text-lime flex items-center gap-1">
                {selectedSubmission.content} <ExternalLink size={12} />
              </a>
            </div>
            <div>
              <label className="label-brutal block mb-2">SCORE: {reviewScore}</label>
              <input
                type="range"
                min="0"
                max="100"
                value={reviewScore}
                onChange={(e) => setReviewScore(parseInt(e.target.value))}
                className="w-full accent-lime"
              />
              <div className="flex justify-between font-mono text-[10px] text-muted">
                <span>0</span><span>100</span>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-xs font-bold uppercase tracking-wider">Feedback</label>
              <textarea
                placeholder="Write feedback for the student..."
                value={reviewFeedback}
                onChange={(e) => setReviewFeedback(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 bg-white border-brutal shadow-brutal-sm font-mono text-sm placeholder:text-muted-light focus:outline-none focus:shadow-brutal resize-none"
              />
            </div>
            <div className="flex gap-3">
              <Button 
                variant="danger" 
                icon={submittingReview ? Loader2 : XCircle} 
                onClick={() => handleReview('rejected')}
                disabled={submittingReview}
              >
                Reject
              </Button>
              <Button 
                variant="primary" 
                fullWidth 
                icon={submittingReview ? Loader2 : CheckCircle} 
                onClick={() => handleReview('approved')}
                disabled={submittingReview}
              >
                Approve
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Student Profile Modal */}
      <Modal isOpen={profileOpen} onClose={() => setProfileOpen(false)} title="STUDENT PROFILE" size="md">
        {selectedStudent && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-lime border-brutal flex items-center justify-center">
                <span className="heading-brutal text-xl">
                  {selectedStudent.name?.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div>
                <h3 className="font-black text-xl uppercase">{selectedStudent.name}</h3>
                <p className="font-mono text-xs text-muted">{selectedStudent.branch}</p>
                <p className="font-mono text-xs text-muted">{selectedStudent.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Card variant="lime" padding="sm">
                <div className="heading-brutal text-2xl">{selectedStudent.totalScore}</div>
                <div className="label-brutal text-muted">Total Score</div>
              </Card>
              <Card variant="purple" padding="sm">
                <div className="heading-brutal text-2xl">{selectedStudent.tasksCompleted}</div>
                <div className="label-brutal text-muted">Tasks Done</div>
              </Card>
            </div>
            <div>
              <label className="label-brutal block mb-2">Interests</label>
              <div className="flex flex-wrap gap-2">
                {selectedStudent.interests?.map(i => (
                  <Badge key={i} variant="default">{i}</Badge>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <Link href={`/portfolio/${selectedStudent.id}`} className="flex-1">
                <Button variant="outline" fullWidth icon={Eye}>View Portfolio</Button>
              </Link>
              <Button variant="primary" icon={Mail} className="flex-1">Contact</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
