'use client';

import { useState, useEffect } from 'react';
import {
  Search, Star, Send, Code, Briefcase, Zap,
  Trophy, Filter, CheckCircle, Globe, Loader2
} from 'lucide-react';
import Button from '@/components/Button';
import Card from '@/components/Card';
import Badge from '@/components/Badge';
import Input from '@/components/Input';
import Modal from '@/components/Modal';
import { useToast } from '@/components/ToastContext';
import { getTasks } from '@/lib/actions/tasks';
import { submitTask, getMySubmissions } from '@/lib/actions/submissions';

const filters = [
  { id: 'all', label: 'All' },
  { id: 'platform', label: 'Platform' },
  { id: 'industry', label: 'Industry' },
  { id: 'beginner', label: 'Beginner' },
  { id: 'intermediate', label: 'Intermediate' },
  { id: 'advanced', label: 'Advanced' },
];

const typeIcon = (type) => {
  if (type === 'industry') return Briefcase;
  if (type === 'platform') return Code;
  return Globe;
};

export default function TaskMarketplace() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [submitOpen, setSubmitOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [submitUrl, setSubmitUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const [tasks, setTasks] = useState([]);
  const [submittedTaskIds, setSubmittedTaskIds] = useState(new Set());

  useEffect(() => {
    async function loadData() {
      try {
        const [tasksRes, submissionsRes] = await Promise.all([
          getTasks(),
          getMySubmissions()
        ]);
        
        if (tasksRes?.data) {
          setTasks(tasksRes.data.map(t => ({
            id: t.id,
            title: t.title,
            type: t.type || 'platform',
            difficulty: t.difficulty || 'beginner',
            points: t.points || 0,
            description: t.description || '',
            roadmap: t.roadmaps?.title || null
          })));
        }
        
        // Track which tasks the user has already submitted
        if (submissionsRes?.data) {
          const submittedIds = new Set(submissionsRes.data.map(s => s.task_id));
          setSubmittedTaskIds(submittedIds);
        }
      } catch (error) {
        console.error('Error loading tasks:', error);
        toast.error('Failed to load tasks');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filtered = tasks.filter(task => {
    const matchSearch = !search ||
      task.title.toLowerCase().includes(search.toLowerCase()) ||
      task.description.toLowerCase().includes(search.toLowerCase());
    const matchFilter = activeFilter === 'all' ||
      task.type === activeFilter ||
      task.difficulty === activeFilter;
    return matchSearch && matchFilter;
  });

  const handleSubmit = async () => {
    if (!submitUrl || !selectedTask) return;
    
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('task_id', selectedTask.id);
      formData.append('content', submitUrl);
      
      const result = await submitTask(formData);
      
      if (result.success) {
        toast.success(`Work submitted for "${selectedTask.title}"!`);
        setSubmitOpen(false);
        setSubmitUrl('');
        // Mark task as submitted
        setSubmittedTaskIds(prev => new Set([...prev, selectedTask.id]));
      } else {
        toast.error(result.error || 'Failed to submit task');
      }
    } catch (error) {
      toast.error('Failed to submit task');
    } finally {
      setSubmitting(false);
    }
  };

  const diffColor = (d) => d === 'beginner' ? 'lime' : d === 'intermediate' ? 'yellow' : 'purple';

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={32} className="animate-spin text-lime" />
          <span className="font-mono text-sm text-muted">Loading tasks...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="heading-brutal text-3xl sm:text-4xl">TASK MARKETPLACE</h1>
          <p className="font-mono text-sm text-muted mt-1">
            {filtered.length} tasks available — pick one and start building.
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 bg-white border-brutal font-mono text-xs shadow-brutal-sm focus:outline-none focus:shadow-brutal"
          />
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex flex-wrap gap-2 mb-8">
        {filters.map(f => (
          <button
            key={f.id}
            onClick={() => setActiveFilter(f.id)}
            className={`
              px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider
              border-2 border-black transition-all cursor-pointer
              ${activeFilter === f.id
                ? 'bg-black text-white shadow-brutal-lime'
                : 'bg-white text-black shadow-brutal-sm hover:bg-bg-dark'}
            `}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Task Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map(task => {
          const TypeIcon = typeIcon(task.type);
          const isSubmitted = submittedTaskIds.has(task.id);
          return (
            <Card
              key={task.id}
              variant={isSubmitted ? 'muted' : 'default'}
              className={`flex flex-col ${isSubmitted ? 'opacity-70' : ''}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-bg border-2 border-black flex items-center justify-center">
                  <TypeIcon size={18} />
                </div>
                <Badge variant="dark" size="sm">
                  <Star size={10} className="mr-1" />
                  {task.points} pts
                </Badge>
              </div>
              <h3 className="font-black text-lg uppercase mb-2">{task.title}</h3>
              <p className="font-mono text-xs text-muted leading-relaxed flex-1 mb-4">
                {task.description}
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant={task.type === 'industry' ? 'purple' : 'default'} size="sm">
                  {task.type}
                </Badge>
                <Badge variant={diffColor(task.difficulty)} size="sm">
                  {task.difficulty}
                </Badge>
                {task.roadmap && (
                  <Badge variant="default" size="sm">{task.roadmap}</Badge>
                )}
              </div>
              {isSubmitted ? (
                <Button variant="outline" fullWidth disabled size="sm" icon={CheckCircle}>
                  Submitted
                </Button>
              ) : (
                <Button
                  variant="primary"
                  fullWidth
                  size="sm"
                  icon={Send}
                  onClick={() => {
                    setSelectedTask(task);
                    setSubmitOpen(true);
                  }}
                >
                  Submit Work
                </Button>
              )}
            </Card>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <div className="heading-brutal text-2xl text-muted mb-2">NO TASKS FOUND</div>
          <p className="font-mono text-sm text-muted">Try adjusting your search or filters.</p>
        </div>
      )}

      {/* Submit Modal */}
      <Modal isOpen={submitOpen} onClose={() => setSubmitOpen(false)} title="SUBMIT WORK" size="md">
        {selectedTask && (
          <div>
            <div className="mb-4">
              <div className="flex gap-2 mb-2">
                <Badge variant={diffColor(selectedTask.difficulty)} size="sm">{selectedTask.difficulty}</Badge>
                <Badge variant="dark" size="sm">
                  <Star size={10} className="mr-1" />{selectedTask.points} pts
                </Badge>
              </div>
              <h3 className="font-black text-xl uppercase">{selectedTask.title}</h3>
              <p className="font-mono text-xs text-muted mt-1">{selectedTask.description}</p>
            </div>
            <Input
              label="Project URL"
              placeholder="https://github.com/you/project"
              value={submitUrl}
              onChange={(e) => setSubmitUrl(e.target.value)}
            />
            <div className="mt-6 flex gap-3">
              <Button variant="outline" onClick={() => setSubmitOpen(false)}>Cancel</Button>
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
