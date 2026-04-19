'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  GraduationCap, Briefcase, Shield, Settings,
  ArrowRight, ArrowLeft, Mail, Lock, User, Zap
} from 'lucide-react';
import Button from '@/components/Button';
import Card from '@/components/Card';
import Input from '@/components/Input';
import Badge from '@/components/Badge';
import { useToast } from '@/components/ToastContext';
import { signUp, signIn } from '@/lib/actions/auth';
import GoogleButton from '@/components/GoogleButton';



const roles = [
  { id: 'student', label: 'Student', description: 'Build skills & get hired', icon: GraduationCap, color: 'lime' },
  { id: 'industry', label: 'Industry', description: 'Post tasks & hire talent', icon: Briefcase, color: 'purple' },
  { id: 'college', label: 'College', description: 'Track student progress', icon: Shield, color: 'yellow' },
  { id: 'admin', label: 'Admin', description: 'Manage the platform', icon: Settings, color: 'dark' },
];

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();

  const mode = searchParams.get('mode') || 'login';
  const isRegister = mode === 'register';

  const [step, setStep] = useState(2); // Start at step 2 (form)
  const [selectedRole, setSelectedRole] = useState('student');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(searchParams.get('error') === 'google_failed' ? 'Google authentication failed' : '');


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



          <Card variant="default" padding="lg" className="animate-fade-in-up">
            <div className="mb-6">
              <GoogleButton loading={loading} />
              
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t-2 border-black/10"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase font-mono">
                  <span className="bg-white px-4 text-muted">Or continue with email</span>
                </div>
              </div>
            </div>

            {isRegister && (
              <div className="flex items-center gap-2 mb-6 bg-lime/10 border-2 border-lime p-2">
                <GraduationCap size={16} className="text-lime-700" />
                <span className="font-mono text-xs text-lime-800 font-bold">Registering as a STUDENT</span>
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
