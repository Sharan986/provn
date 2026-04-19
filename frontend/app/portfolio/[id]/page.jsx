'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  Trophy, Star, CheckCircle, Mail, Share2, ExternalLink,
  BookOpen, Crown, Clock, GraduationCap, Copy, Loader2
} from 'lucide-react';
import Button from '@/components/Button';
import Card from '@/components/Card';
import Badge from '@/components/Badge';
import { useToast } from '@/components/ToastContext';
import { getPublicStudentProfile } from '@/lib/actions/scores';

export default function PortfolioPage() {
  const params = useParams();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [completed, setCompleted] = useState([]);
  const [pending, setPending] = useState([]);

  useEffect(() => {
    async function loadData() {
      try {
        const result = await getPublicStudentProfile(params.id);
        if (result?.data) {
          setProfile({
            name: result.data.name || 'Unknown User',
            email: result.data.email || '',
            branch: result.data.branch || 'N/A',
            interests: result.data.interests || [],
            subscription_tier: result.data.subscription_tier || 'free',
            roadmap: result.data.current_roadmap?.title || 'No roadmap selected',
            totalScore: result.data.totalScore || 0,
            tasksCompleted: result.data.tasksCompleted || 0
          });
          
          // Process completed submissions
          if (result.data.completedSubmissions) {
            setCompleted(result.data.completedSubmissions.map(s => ({
              id: s.id,
              task: s.tasks?.title || 'Unknown Task',
              type: s.tasks?.type || 'platform',
              difficulty: s.tasks?.difficulty || 'beginner',
              points: s.tasks?.points || 0,
              score: s.score || 0,
              feedback: s.feedback || '',
              content: s.content || ''
            })));
          }
          
          // Process pending submissions
          if (result.data.pendingSubmissions) {
            setPending(result.data.pendingSubmissions.map(s => ({
              id: s.id,
              task: s.tasks?.title || 'Unknown Task',
              type: s.tasks?.type || 'platform',
              difficulty: s.tasks?.difficulty || 'beginner',
              points: s.tasks?.points || 0,
              submittedAt: formatTimeAgo(s.created_at)
            })));
          }
        } else {
          toast.error('User profile not found');
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [params.id]);

  function formatTimeAgo(dateString) {
    if (!dateString) return 'recently';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'today';
    if (diffDays === 1) return '1 day ago';
    return `${diffDays} days ago`;
  }

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    toast.success('Portfolio link copied!');
  };

  const handleHire = () => {
    if (!profile?.email) {
      toast.error('Email not available');
      return;
    }
    toast.info(`Opening email to ${profile.email}...`);
    window.open(`mailto:${profile.email}?subject=Opportunity from Provn&body=Hi ${profile.name},`);
  };

  const diffColor = (d) => d === 'beginner' ? 'lime' : d === 'intermediate' ? 'yellow' : 'purple';

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={32} className="animate-spin text-lime" />
          <span className="font-mono text-sm text-muted">Loading portfolio...</span>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="text-center">
          <h2 className="heading-brutal text-2xl mb-2">PROFILE NOT FOUND</h2>
          <p className="font-mono text-sm text-muted">This user doesn&apos;t exist or their profile is private.</p>
        </div>
      </div>
    );
  }

  const initials = profile.name?.split(' ').map(n => n[0]).join('') || '?';
  const readinessScore = profile.tasksCompleted > 0 
    ? Math.round((profile.totalScore / (profile.tasksCompleted * 30)) * 100)
    : 0;

  return (
    <div className="min-h-[calc(100vh-64px)]">
      {/* Banner */}
      <div className="bg-black text-white py-12 px-4 border-b-4 border-lime">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center gap-6">
          <div className="w-24 h-24 bg-lime text-black border-4 border-white rounded-full flex items-center justify-center">
            <span className="heading-brutal text-3xl">{initials}</span>
          </div>
          <div className="text-center sm:text-left flex-1">
            <div className="flex items-center justify-center sm:justify-start gap-3 mb-1">
              <h1 className="heading-brutal text-3xl sm:text-4xl">{profile.name}</h1>
              {profile.subscription_tier === 'pro' && (
                <Badge variant="purple">
                  <Crown size={12} className="mr-1" /> PRO
                </Badge>
              )}
            </div>
            <div className="flex items-center justify-center sm:justify-start gap-3 mt-2">
              <span className="font-mono text-sm text-white/60 flex items-center gap-1">
                <GraduationCap size={14} /> {profile.branch}
              </span>
              <span className="font-mono text-sm text-white/60 flex items-center gap-1">
                <Mail size={14} /> {profile.email}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="bg-white border-b-4 border-black">
        <div className="max-w-5xl mx-auto grid grid-cols-3">
          <div className="p-6 text-center border-r-2 border-black">
            <div className="label-brutal text-muted mb-1">ROADMAP</div>
            <div className="font-black uppercase">{profile.roadmap}</div>
          </div>
          <div className="p-6 text-center border-r-2 border-black">
            <div className="label-brutal text-muted mb-1">READINESS</div>
            <div className="heading-brutal text-2xl text-purple">{readinessScore}%</div>
          </div>
          <div className="p-6 text-center">
            <div className="label-brutal text-muted mb-1">TASKS</div>
            <div className="heading-brutal text-2xl">{profile.tasksCompleted}</div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Sidebar */}
          <div className="lg:col-span-1">
            {/* Skills */}
            <Card variant="default" padding="default" className="mb-6">
              <h3 className="heading-brutal text-lg mb-3">SKILLS</h3>
              <div className="flex flex-wrap gap-2">
                {['React', 'JavaScript', 'TypeScript', 'Node.js', 'CSS', 'Git', 'REST APIs', 'Testing'].map(skill => (
                  <Badge key={skill} variant="lime" size="sm">{skill}</Badge>
                ))}
              </div>
            </Card>

            {/* Interests */}
            <Card variant="default" padding="default" className="mb-6">
              <h3 className="heading-brutal text-lg mb-3">INTERESTS</h3>
              <div className="flex flex-wrap gap-2">
                {profile.interests.map(i => (
                  <Badge key={i} variant="purple" size="sm">{i}</Badge>
                ))}
              </div>
            </Card>

            {/* Contact */}
            <Card variant="default" padding="default">
              <h3 className="heading-brutal text-lg mb-3">CONTACT</h3>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 font-mono text-xs text-muted">
                  <Mail size={14} /> {profile.email}
                </div>
                <div className="flex gap-2 mt-2">
                  <Button variant="primary" size="sm" fullWidth icon={Mail} onClick={handleHire}>
                    Hire
                  </Button>
                  <Button variant="outline" size="sm" fullWidth icon={Share2} onClick={handleShare}>
                    Share
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Content */}
          <div className="lg:col-span-2">
            {/* Completed Tasks */}
            <h2 className="heading-brutal text-xl mb-4 flex items-center gap-2">
              <CheckCircle size={20} />
              COMPLETED TASKS
              <Badge variant="lime" size="sm">{completed.length}</Badge>
            </h2>
            <div className="flex flex-col gap-4 mb-8">
              {completed.length > 0 ? completed.map(sub => (
                <Card key={sub.id} variant="default">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={diffColor(sub.difficulty)} size="sm">{sub.difficulty}</Badge>
                        <Badge variant="dark" size="sm">
                          <Star size={10} className="mr-1" />{sub.score}/{sub.points}
                        </Badge>
                        <Badge variant="lime" size="sm">
                          <CheckCircle size={10} className="mr-1" /> Verified
                        </Badge>
                      </div>
                      <h3 className="font-black text-lg uppercase">{sub.task}</h3>
                      {sub.feedback && (
                        <p className="font-mono text-xs text-muted mt-2 italic border-l-2 border-lime pl-3">
                          &ldquo;{sub.feedback}&rdquo;
                        </p>
                      )}
                    </div>
                    {sub.content && (
                      <a
                        href={sub.content}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 px-3 py-2 border-2 border-black font-mono text-xs font-bold uppercase hover:bg-lime transition-colors"
                      >
                        <ExternalLink size={12} />
                        View
                      </a>
                    )}
                  </div>
                </Card>
              )) : (
                <Card variant="muted" padding="default">
                  <p className="font-mono text-xs text-muted text-center py-4">No completed tasks yet.</p>
                </Card>
              )}
            </div>

            {/* Pending */}
            {pending.length > 0 && (
              <>
                <h2 className="heading-brutal text-xl mb-4 flex items-center gap-2">
                  <Clock size={20} />
                  PENDING
                  <Badge variant="yellow" size="sm">{pending.length}</Badge>
                </h2>
                <div className="flex flex-col gap-3">
                  {pending.map(sub => (
                    <Card key={sub.id} variant="muted" padding="sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant={diffColor(sub.difficulty)} size="sm">{sub.difficulty}</Badge>
                            <Badge variant="dark" size="sm">
                              <Star size={10} className="mr-1" />{sub.points} pts
                            </Badge>
                          </div>
                          <span className="font-black text-sm uppercase">{sub.task}</span>
                        </div>
                        <Badge variant="yellow" size="sm">
                          <Clock size={10} className="mr-1" /> {sub.submittedAt}
                        </Badge>
                      </div>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
