'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Crown, Check, X, Zap, Trophy, Star,
  Code, Shield, Rocket, Gift, Sparkles
} from 'lucide-react';
import Button from '@/components/Button';
import Card from '@/components/Card';
import Badge from '@/components/Badge';
import { useToast } from '@/components/ToastContext';

const freeTier = {
  name: 'Basic',
  price: 'Free',
  description: 'Get started with career readiness.',
  features: [
    { label: 'Access to roadmaps', included: true },
    { label: 'Platform tasks', included: true },
    { label: 'Basic portfolio', included: true },
    { label: 'Leaderboard access', included: true },
    { label: 'Industry simulator (basic)', included: true },
    { label: 'Premium challenges', included: false },
    { label: 'Priority review', included: false },
    { label: 'Verified badge', included: false },
    { label: 'Direct recruiter access', included: false },
  ],
};

const proTier = {
  name: 'Pro',
  price: 'Rs xxx',
  period: '/month',
  description: 'Unlock full career potential.',
  features: [
    { label: 'Everything in Basic', included: true },
    { label: 'All premium challenges', included: true },
    { label: 'Enhanced portfolio', included: true },
    { label: 'Priority review queue', included: true },
    { label: 'Verified PRO badge', included: true },
    { label: 'Advanced simulator', included: true },
    { label: 'Direct recruiter access', included: true },
    { label: 'Career insights', included: true },
    { label: 'Early access to features', included: true },
  ],
};

export default function ProPage() {
  const router = useRouter();
  const toast = useToast();
  const [isPro, setIsPro] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    // Simulate checkout
    await new Promise(r => setTimeout(r, 1500));
    setIsPro(true);
    toast.success('Welcome to PRO! 🎉');
    setLoading(false);
  };

  if (isPro) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-bg flex items-center justify-center p-4">
        <Card variant="purple" padding="lg" className="max-w-md text-center animate-fade-in-up">
          <div className="w-20 h-20 bg-black text-purple border-brutal mx-auto flex items-center justify-center mb-6 animate-pulse-brutal">
            <Trophy size={40} />
          </div>
          <h2 className="heading-brutal text-3xl mb-3">YOU&apos;RE PRO!</h2>
          <p className="font-mono text-sm mb-6">
            All premium features are now unlocked. Go build something amazing.
          </p>
          <div className="flex gap-3">
            <Button variant="dark" fullWidth icon={Zap} onClick={() => router.push('/simulator')}>
              Simulator
            </Button>
            <Button variant="outline" fullWidth icon={Rocket} onClick={() => router.push('/dashboard/student')}>
              Dashboard
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <Badge variant="purple" className="mb-4">
          <Sparkles size={12} className="mr-1" /> PRICING
        </Badge>
        <h1 className="heading-brutal text-4xl sm:text-5xl lg:text-6xl mb-4">
          LEVEL UP YOUR
          <br />
          <span className="text-purple">CAREER GAME</span>
        </h1>
        <p className="font-mono text-sm text-muted max-w-md mx-auto">
          Start free, upgrade when you&apos;re ready to unlock the full Provn experience.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
        {/* Free Tier */}
        <Card variant="default" padding="lg" className="flex flex-col">
          <div className="mb-6">
            <h3 className="heading-brutal text-2xl mb-1">{freeTier.name}</h3>
            <div className="flex items-baseline gap-1">
              <span className="heading-brutal text-4xl">{freeTier.price}</span>
            </div>
            <p className="font-mono text-xs text-muted mt-2">{freeTier.description}</p>
          </div>
          <div className="flex flex-col gap-3 flex-1 mb-6">
            {freeTier.features.map((f, i) => (
              <div key={i} className="flex items-center gap-2">
                {f.included ? (
                  <Check size={16} className="text-lime shrink-0" />
                ) : (
                  <X size={16} className="text-muted-light shrink-0" />
                )}
                <span className={`font-mono text-xs ${f.included ? 'text-black font-bold' : 'text-muted-light'}`}>
                  {f.label}
                </span>
              </div>
            ))}
          </div>
          <Button variant="outline" fullWidth size="lg" disabled>
            Current Plan
          </Button>
        </Card>

        {/* Pro Tier */}
        <Card variant="purple" padding="lg" className="flex flex-col relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <Badge variant="dark">
              <Star size={10} className="mr-1" /> MOST POPULAR
            </Badge>
          </div>
          <div className="mb-6">
            <h3 className="heading-brutal text-2xl mb-1 flex items-center gap-2">
              {proTier.name} <Crown size={24} />
            </h3>
            <div className="flex items-baseline gap-1">
              <span className="heading-brutal text-4xl">{proTier.price}</span>
              <span className="font-mono text-xs font-bold">{proTier.period}</span>
            </div>
            <p className="font-mono text-xs mt-2">{proTier.description}</p>
          </div>
          <div className="flex flex-col gap-3 flex-1 mb-6">
            {proTier.features.map((f, i) => (
              <div key={i} className="flex items-center gap-2">
                <Check size={16} className="shrink-0" />
                <span className="font-mono text-xs font-bold">{f.label}</span>
              </div>
            ))}
          </div>
          <Button
            variant="dark"
            fullWidth
            size="lg"
            icon={Zap}
            onClick={handleUpgrade}
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Upgrade Now'}
          </Button>
        </Card>
      </div>
    </div>
  );
}
