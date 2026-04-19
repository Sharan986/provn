'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  GraduationCap, Briefcase, Shield,
  ArrowRight, ArrowLeft, Mail, Lock, User, Zap
} from 'lucide-react';
import Button from '@/components/Button';
import Card from '@/components/Card';
import Input from '@/components/Input';
import Badge from '@/components/Badge';
import { useToast } from '@/components/ToastContext';
import { signUp, signIn } from '@/lib/actions/auth';

const roles = [
  { id: 'student', label: 'Student', description: 'Build skills & get hired', icon: GraduationCap, color: 'lime' },
  { id: 'industry', label: 'Industry', description: 'Post tasks & hire talent', icon: Briefcase, color: 'purple' },
  { id: 'college', label: 'College', description: 'Track student progress', icon: Shield, color: 'yellow' },
];

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();

  const mode = searchParams.get('mode') || 'login';
  const isRegister = mode === 'register';

  const [step, setStep] = useState(isRegister ? 1 : 2);
  const [selectedRole, setSelectedRole] = useState('student');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.target);
    formData.set('role', selectedRole);

    try {
      if (isRegister) {
        const result = await signUp(formData);
        if (result.error) {
          setError(result.error);
          toast.error(result.error);
        } else {
          toast.success('Account created! Setting up your profile...');
          router.push(`/onboarding/${selectedRole}`);
        }
      } else {
        const result = await signIn(formData);
        if (result.error) {
          setError(result.error);
          toast.error(result.error);
        } else {
          toast.success('Welcome back!');
          router.push(`/dashboard/${result.role}`);
        }
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-lime border-brutal shadow-brutal mb-4">
            <Zap size={32} />
          </div>
          <h1 className="heading-brutal text-3xl sm:text-4xl mb-2">
            {isRegister ? 'JOIN PROVN' : 'WELCOME BACK'}
          </h1>
          <p className="font-mono text-sm text-muted">
            {isRegister
              ? 'Create your account and start building your career.'
              : 'Log in to your account.'}
          </p>
        </div>

        {/* Step 1: Role Picker (Register only) */}
        {isRegister && step === 1 && (
          <div className="animate-fade-in-up">
            <p className="label-brutal text-center mb-4">SELECT YOUR ROLE</p>
            <div className="grid grid-cols-3 gap-4 mb-6">
              {roles.map((role) => {
                const Icon = role.icon;
                const isSelected = selectedRole === role.id;
                return (
                  <Card
                    key={role.id}
                    variant={isSelected ? role.color : 'default'}
                    hoverable
                    padding="sm"
                    className={`text-center cursor-pointer transition-all ${isSelected ? 'ring-2 ring-black ring-offset-2' : ''
                      }`}
                    onClick={() => setSelectedRole(role.id)}
                  >
                    <Icon size={28} className="mx-auto mb-2" />
                    <h3 className="font-black text-sm uppercase">{role.label}</h3>
                    <p className="font-mono text-[10px] text-muted mt-1">{role.description}</p>
                  </Card>
                );
              })}
            </div>
            {selectedRole === 'student' ? (
              <Button
                variant="dark"
                fullWidth
                size="lg"
                icon={ArrowRight}
                iconPosition="right"
                onClick={() => setStep(2)}
              >
                Continue as Student
              </Button>
            ) : (
              <Card variant={roles.find(r => r.id === selectedRole)?.color} padding="lg" className="text-center mt-2">
                <Mail size={32} className="mx-auto mb-3" />
                <h3 className="heading-brutal text-xl mb-2">CONTACT US</h3>
                <p className="font-mono text-xs leading-relaxed mb-4">
                  {selectedRole === 'industry'
                    ? 'Interested in posting tasks and hiring talent through Provn?'
                    : 'Want to track your students\' progress and boost placement rates?'}
                  <br />
                  Reach out to us and we'll get you set up.
                </p>
                <a href="mailto:hello@provn.live">
                  <Button variant="dark" fullWidth size="lg" icon={Mail}>
                    hello@provn.live
                  </Button>
                </a>
              </Card>
            )}
          </div>
        )}

        {/* Step 2: Auth Form */}
        {(step === 2 || !isRegister) && (
          <Card variant="default" padding="lg" className="animate-fade-in-up">
            {isRegister && (
              <button
                onClick={() => setStep(1)}
                className="flex items-center gap-1 font-mono text-xs font-bold uppercase mb-4 hover:text-lime transition-colors cursor-pointer"
              >
                <ArrowLeft size={14} />
                Change Role
              </button>
            )}

            {isRegister && (
              <div className="flex items-center gap-2 mb-6">
                <Badge variant={roles.find(r => r.id === selectedRole)?.color}>
                  {selectedRole}
                </Badge>
                <span className="font-mono text-xs text-muted">account</span>
              </div>
            )}

            {error && (
              <div className="bg-danger/10 border-2 border-danger text-danger px-4 py-3 mb-4 font-mono text-sm font-bold animate-shake">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {isRegister && (
                <Input
                  label="Full Name"
                  name="name"
                  placeholder="Jane Doe"
                  required
                />
              )}
              <Input
                label="Email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
              />
              <Input
                label="Password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                disabled={loading}
                icon={loading ? null : ArrowRight}
                iconPosition="right"
              >
                {loading ? 'Loading...' : isRegister ? 'Create Account' : 'Log In'}
              </Button>
            </form>

            <div className="mt-6 pt-4 border-t-2 border-black/10 text-center">
              <p className="font-mono text-xs text-muted">
                {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
                <a
                  href={isRegister ? '/auth?mode=login' : '/auth?mode=register'}
                  className="font-bold text-black underline hover:text-lime transition-colors"
                >
                  {isRegister ? 'Log in' : 'Sign up'}
                </a>
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[calc(100vh-64px)] bg-bg flex items-center justify-center">
        <div className="heading-brutal text-2xl">Loading...</div>
      </div>
    }>
      <AuthContent />
    </Suspense>
  );
}
