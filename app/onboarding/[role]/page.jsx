'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowRight, Check, BookOpen, Code, Database,
  Cloud, Smartphone, Shield, Brain, Palette
} from 'lucide-react';
import Button from '@/components/Button';
import Card from '@/components/Card';
import Input from '@/components/Input';
import Badge from '@/components/Badge';
import { useToast } from '@/components/ToastContext';
import { updateOnboarding } from '@/lib/actions/auth';
import { getRoadmaps, assignRoadmap } from '@/lib/actions/roadmaps';

const branches = [
  'Computer Science', 'Information Technology', 'Electronics',
  'Mechanical', 'Civil', 'Electrical', 'Other'
];

const interestOptions = [
  { id: 'frontend', label: 'Frontend', icon: Palette },
  { id: 'backend', label: 'Backend', icon: Database },
  { id: 'mobile', label: 'Mobile', icon: Smartphone },
  { id: 'devops', label: 'DevOps', icon: Cloud },
  { id: 'ai-ml', label: 'AI / ML', icon: Brain },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'data', label: 'Data Science', icon: Code },
  { id: 'fullstack', label: 'Full Stack', icon: BookOpen },
];

// Mock roadmaps for when DB is empty
const mockRoadmaps = [
  { id: '1', title: 'Frontend Developer', description: 'HTML, CSS, JS, React', skills: [{ name: 'HTML/CSS' }, { name: 'JavaScript' }, { name: 'React' }, { name: 'TypeScript' }] },
  { id: '2', title: 'Backend Developer', description: 'Node.js, APIs, Databases', skills: [{ name: 'Node.js' }, { name: 'Express' }, { name: 'PostgreSQL' }, { name: 'APIs' }] },
  { id: '3', title: 'Full Stack Developer', description: 'Frontend + Backend + DevOps', skills: [{ name: 'React' }, { name: 'Node.js' }, { name: 'Docker' }, { name: 'AWS' }] },
  { id: '4', title: 'Data Scientist', description: 'Python, ML, Analytics', skills: [{ name: 'Python' }, { name: 'Pandas' }, { name: 'Scikit-learn' }, { name: 'TensorFlow' }] },
];

export default function OnboardingPage() {
  const router = useRouter();
  const params = useParams();
  const toast = useToast();
  const role = params.role || 'student';

  const [step, setStep] = useState(1);
  const [branch, setBranch] = useState('');
  const [interests, setInterests] = useState([]);
  const [selectedRoadmap, setSelectedRoadmap] = useState(null);
  const [orgName, setOrgName] = useState('');
  const [roadmaps, setRoadmaps] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (role === 'student') {
      getRoadmaps().then(result => {
        setRoadmaps(result.data?.length ? result.data : mockRoadmaps);
      }).catch(() => setRoadmaps(mockRoadmaps));
    }
  }, [role]);

  const toggleInterest = (id) => {
    setInterests(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const totalSteps = role === 'student' ? 3 : 2;

  const handleComplete = async () => {
    setLoading(true);
    try {
      await updateOnboarding({
        branch: branch || null,
        interests: interests.length ? interests : null,
        currentRoadmapId: selectedRoadmap || null,
        orgName: orgName || null,
      });
      toast.success('Profile set up! Welcome to Provn.');
      router.push(`/dashboard/${role}`);
    } catch {
      toast.error('Failed to save. Redirecting...');
      router.push(`/dashboard/${role}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-bg py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="label-brutal">STEP {step} OF {totalSteps}</span>
            <Badge variant="lime">{role}</Badge>
          </div>
          <div className="w-full h-3 bg-white border-2 border-black">
            <div
              className="h-full bg-lime transition-all duration-500"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Student Flow */}
        {role === 'student' && (
          <>
            {/* Step 1: Branch */}
            {step === 1 && (
              <div className="animate-fade-in-up">
                <h2 className="heading-brutal text-3xl mb-2">WHAT&apos;S YOUR BRANCH?</h2>
                <p className="font-mono text-sm text-muted mb-6">This helps us personalize your experience.</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
                  {branches.map(b => (
                    <Card
                      key={b}
                      variant={branch === b ? 'lime' : 'default'}
                      hoverable
                      padding="sm"
                      className="text-center cursor-pointer"
                      onClick={() => setBranch(b)}
                    >
                      <span className="font-bold text-sm uppercase">{b}</span>
                    </Card>
                  ))}
                </div>
                <Button
                  variant="dark"
                  fullWidth
                  size="lg"
                  icon={ArrowRight}
                  iconPosition="right"
                  onClick={() => setStep(2)}
                  disabled={!branch}
                >
                  Next
                </Button>
              </div>
            )}

            {/* Step 2: Interests */}
            {step === 2 && (
              <div className="animate-fade-in-up">
                <h2 className="heading-brutal text-3xl mb-2">YOUR INTERESTS</h2>
                <p className="font-mono text-sm text-muted mb-6">Pick what excites you. Select multiple.</p>
                <div className="grid grid-cols-2 gap-3 mb-8">
                  {interestOptions.map(opt => {
                    const Icon = opt.icon;
                    const isSelected = interests.includes(opt.id);
                    return (
                      <Card
                        key={opt.id}
                        variant={isSelected ? 'purple' : 'default'}
                        hoverable
                        padding="sm"
                        className="flex items-center gap-3 cursor-pointer"
                        onClick={() => toggleInterest(opt.id)}
                      >
                        <Icon size={20} />
                        <span className="font-bold text-sm uppercase">{opt.label}</span>
                        {isSelected && <Check size={16} className="ml-auto" />}
                      </Card>
                    );
                  })}
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                  <Button
                    variant="dark"
                    fullWidth
                    size="lg"
                    icon={ArrowRight}
                    iconPosition="right"
                    onClick={() => setStep(3)}
                    disabled={interests.length === 0}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Roadmap */}
            {step === 3 && (
              <div className="animate-fade-in-up">
                <h2 className="heading-brutal text-3xl mb-2">PICK YOUR ROADMAP</h2>
                <p className="font-mono text-sm text-muted mb-6">Choose a learning path to get started.</p>
                <div className="flex flex-col gap-4 mb-8">
                  {roadmaps.map(rm => (
                    <Card
                      key={rm.id}
                      variant={selectedRoadmap === rm.id ? 'yellow' : 'default'}
                      hoverable
                      className="cursor-pointer"
                      onClick={() => setSelectedRoadmap(rm.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-black text-lg uppercase">{rm.title}</h3>
                          <p className="font-mono text-xs text-muted mt-1">{rm.description}</p>
                        </div>
                        {selectedRoadmap === rm.id && (
                          <div className="w-8 h-8 bg-black text-white flex items-center justify-center">
                            <Check size={18} />
                          </div>
                        )}
                      </div>
                      {rm.skills && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {(Array.isArray(rm.skills) ? rm.skills : []).slice(0, 4).map((skill, i) => (
                            <Badge key={i} variant="default" size="sm">
                              {skill.name || skill}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
                  <Button
                    variant="primary"
                    fullWidth
                    size="lg"
                    icon={ArrowRight}
                    iconPosition="right"
                    onClick={handleComplete}
                    disabled={loading}
                  >
                    {loading ? 'Setting up...' : 'Complete Setup'}
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Industry Flow */}
        {role === 'industry' && (
          <>
            {step === 1 && (
              <div className="animate-fade-in-up">
                <h2 className="heading-brutal text-3xl mb-2">YOUR ORGANIZATION</h2>
                <p className="font-mono text-sm text-muted mb-6">Tell us about your company.</p>
                <div className="flex flex-col gap-4 mb-8">
                  <Input
                    label="Organization Name"
                    placeholder="Acme Corp"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                  />
                </div>
                <Button
                  variant="dark"
                  fullWidth
                  size="lg"
                  icon={ArrowRight}
                  iconPosition="right"
                  onClick={() => setStep(2)}
                  disabled={!orgName}
                >
                  Next
                </Button>
              </div>
            )}
            {step === 2 && (
              <div className="animate-fade-in-up">
                <h2 className="heading-brutal text-3xl mb-2">FOCUS AREA</h2>
                <p className="font-mono text-sm text-muted mb-6">What kind of talent are you looking for?</p>
                <div className="grid grid-cols-2 gap-3 mb-8">
                  {interestOptions.map(opt => {
                    const Icon = opt.icon;
                    const isSelected = interests.includes(opt.id);
                    return (
                      <Card
                        key={opt.id}
                        variant={isSelected ? 'purple' : 'default'}
                        hoverable
                        padding="sm"
                        className="flex items-center gap-3 cursor-pointer"
                        onClick={() => toggleInterest(opt.id)}
                      >
                        <Icon size={20} />
                        <span className="font-bold text-sm uppercase">{opt.label}</span>
                        {isSelected && <Check size={16} className="ml-auto" />}
                      </Card>
                    );
                  })}
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                  <Button
                    variant="primary"
                    fullWidth
                    size="lg"
                    icon={ArrowRight}
                    iconPosition="right"
                    onClick={handleComplete}
                    disabled={loading}
                  >
                    {loading ? 'Setting up...' : 'Complete Setup'}
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

        {/* College Flow */}
        {role === 'college' && (
          <>
            {step === 1 && (
              <div className="animate-fade-in-up">
                <h2 className="heading-brutal text-3xl mb-2">YOUR INSTITUTION</h2>
                <p className="font-mono text-sm text-muted mb-6">Your college or university name.</p>
                <div className="flex flex-col gap-4 mb-8">
                  <Input
                    label="Institution Name"
                    placeholder="MIT"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                  />
                </div>
                <Button
                  variant="primary"
                  fullWidth
                  size="lg"
                  icon={ArrowRight}
                  iconPosition="right"
                  onClick={handleComplete}
                  disabled={loading || !orgName}
                >
                  {loading ? 'Setting up...' : 'Complete Setup'}
                </Button>
              </div>
            )}
          </>
        )}

        {/* Admin Flow */}
        {role === 'admin' && (
          <div className="animate-fade-in-up">
            <h2 className="heading-brutal text-3xl mb-2">ADMIN ACCESS</h2>
            <p className="font-mono text-sm text-muted mb-6">You&apos;re all set. Head to the dashboard.</p>
            <Button
              variant="primary"
              fullWidth
              size="lg"
              icon={ArrowRight}
              iconPosition="right"
              onClick={() => router.push('/dashboard/admin')}
            >
              Go to Dashboard
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
