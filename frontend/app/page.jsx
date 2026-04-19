'use client';

import Link from 'next/link';
import {
  Zap, ArrowRight, ChevronRight, Rocket,
  Target, Trophy, Users, Star, Code,
  Briefcase, GraduationCap, Shield, Sparkles, TrendingUp,
  Crown, Check
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import Button from '@/components/Button';
import Card from '@/components/Card';
import Badge from '@/components/Badge';

const marqueeWords = [
  'FRONTEND', 'BACKEND', 'DEVOPS', 'DATA SCIENCE', 'AI/ML',
  'MOBILE', 'CLOUD', 'SECURITY', 'BLOCKCHAIN', 'UI/UX',
  'FRONTEND', 'BACKEND', 'DEVOPS', 'DATA SCIENCE', 'AI/ML',
  'MOBILE', 'CLOUD', 'SECURITY', 'BLOCKCHAIN', 'UI/UX',
];

const steps = [
  {
    num: '01',
    title: 'Choose a Path',
    description: 'Explore curated roadmaps designed by industry experts. Pick the career trajectory that excites you.',
    icon: Target,
    color: 'lime',
  },
  {
    num: '02',
    title: 'Build Projects',
    description: 'Complete real-world tasks and challenges. Build a portfolio that speaks louder than any resume.',
    icon: Code,
    color: 'purple',
  },
  {
    num: '03',
    title: 'Get Hired',
    description: 'Industry partners review your work directly. Skip the queue — your skills are your ticket.',
    icon: Trophy,
    color: 'yellow',
  },
];

const stats = [
  { value: '500+', label: 'STUDENTS', icon: Users },
  { value: '50+', label: 'INDUSTRY PARTNERS', icon: Briefcase },
  { value: '200+', label: 'TASKS COMPLETED', icon: Star },
  { value: '95%', label: 'PLACEMENT RATE', icon: Rocket },
];

const trendingSkillsData = [
  { name: 'AI & Machine Learning', growth: 88, color: '#BEF264' },
  { name: 'Cloud & DevOps', growth: 74, color: '#C084FC' },
  { name: 'Cybersecurity', growth: 68, color: '#FDE047' },
  { name: 'Data Engineering', growth: 62, color: '#000000' },
  { name: 'Full-Stack (Next.js)', growth: 55, color: '#ef4444' },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border-brutal shadow-brutal-sm p-3 font-mono text-xs z-50">
        <p className="font-bold mb-1 uppercase">{label}</p>
        <p className="text-muted">{`Demand Growth: `}<span className="text-black font-black">{payload[0].value}%</span></p>
      </div>
    );
  }
  return null;
};

export default function LandingPage() {
  return (
    <div className="overflow-hidden">
      {/* ─── Hero Section ─────────────────────── */}
      <section className="relative bg-lime border-b-4 border-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 lg:py-32">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6 animate-fade-in-up stagger-1">
              <Badge variant="dark">BETA</Badge>
              <Badge variant="default">
                <Sparkles size={12} className="mr-1" />
                NOW LIVE
              </Badge>
            </div>

            <h1 className="heading-brutal text-5xl sm:text-7xl lg:text-8xl xl:text-9xl mb-6 animate-fade-in-up stagger-2">
              START YOUR
              <br />
              <span className="relative">
                CAREER.
                <svg className="absolute -bottom-2 left-0 w-full h-4" viewBox="0 0 400 12">
                  <path d="M0 6 Q100 0 200 6 Q300 12 400 6" stroke="black" strokeWidth="3" fill="none" /> 
                </svg>
              </span>
            </h1>

            <p className="max-w-xl text-lg sm:text-xl font-mono font-bold mb-8 animate-fade-in-up stagger-3">
              The platform that bridges the gap between
              <span className="bg-black text-lime px-2 mx-1">campus learning</span>
              and
              <span className="bg-black text-purple px-2 mx-1">industry hiring</span>.
            </p>

            <div className="flex flex-wrap gap-4 animate-fade-in-up stagger-4">
              <Link href="/auth?mode=register">
                <Button variant="dark" size="lg" icon={ArrowRight} iconPosition="right">
                  Get Started Free
                </Button>
              </Link>
              <a href="#playbook">
                <Button variant="outline" size="lg">
                  How It Works
                </Button>
              </a>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute top-8 right-8 w-16 h-16 bg-purple border-brutal rotate-12 hidden lg:block" />
          <div className="absolute bottom-12 right-24 w-12 h-12 bg-yellow border-brutal -rotate-6 hidden lg:block" />
          <div className="absolute top-1/2 right-16 w-8 h-8 bg-black rotate-45 hidden lg:block" />
        </div>
      </section>

      {/* ─── Marquee Ticker ───────────────────── */}
      <section className="bg-black text-white border-b-4 border-black overflow-hidden py-4">
        <div className="flex whitespace-nowrap animate-marquee">
          {marqueeWords.map((word, i) => (
            <span key={i} className="inline-flex items-center mx-4">
              <span className="font-black text-sm tracking-widest">{word}</span>
              <Zap size={14} className="text-lime ml-4" />
            </span>
          ))}
        </div>
      </section>

      {/* ─── Stats Bar ────────────────────────── */}
      <section className="border-b-4 border-black bg-white">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className={`
                  p-6 sm:p-8 text-center
                  ${i < 3 ? 'border-r-0 lg:border-r-2 border-black' : ''}
                  ${i < 2 ? 'border-b-2 lg:border-b-0 border-black' : ''}
                  ${i === 2 ? 'border-b-2 lg:border-b-0 border-black border-r-2 lg:border-r-2' : ''}
                `}
              >
                <Icon size={24} className="mx-auto mb-2 text-muted" />
                <div className="heading-brutal text-3xl sm:text-4xl mb-1">{stat.value}</div>
                <div className="label-brutal text-muted">{stat.label}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── Trending Skills 2026 ──────────────── */}
      <section className="py-16 sm:py-24 bg-white border-b-4 border-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 text-center lg:text-left">
              <Badge variant="dark" className="mb-4">
                <TrendingUp size={12} className="mr-1" />
                2026 JOB TRENDS
              </Badge>
              <h2 className="heading-brutal text-4xl sm:text-5xl lg:text-6xl mb-6">
                THE FUTURE IS
                <br />
                <span className="inline-block mt-2 text-lime bg-black px-3 pb-1 shadow-brutal-lime">DATA-DRIVEN</span>
              </h2>
              <p className="font-mono text-sm leading-relaxed text-muted max-w-lg mx-auto lg:mx-0 mb-8">
                Based on projected industry demands for 2026, tech roles are polarizing. Specialized skills in AI, Cloud architecture, and secure data pipelines are skyrocketing.
                <br /><br />
                Our roadmaps prioritize the skills that future employers actually hire for.
              </p>
              <div className="flex gap-4 justify-center lg:justify-start">
                <Link href="/discover">
                  <Button variant="primary" icon={ArrowRight} iconPosition="right">Explore Roadmaps</Button>
                </Link>
              </div>
            </div>
            
            {/* Chart Area */}
            <div className="flex-1 w-full max-w-xl">
              <Card variant="muted" padding="lg" className="w-full h-80 bg-bg-dark relative">
                <div className="absolute top-4 left-4 z-10">
                  <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-muted">YoY Growth Demand</h3>
                </div>
                <div className="w-full h-full pt-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={trendingSkillsData} layout="vertical" margin={{ top: 0, right: 30, left: 10, bottom: 0 }}>
                      <XAxis type="number" hide domain={[0, 100]} />
                      <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontFamily: 'monospace', fontWeight: 'bold', fill: '#000' }} width={120} />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
                      <Bar dataKey="growth" barSize={24} background={{ fill: 'rgba(0,0,0,0.05)' }}>
                        {trendingSkillsData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* ─── The Playbook ─────────────────────── */}
      <section id="playbook" className="py-16 sm:py-24 bg-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <Badge variant="dark" className="mb-4">THE PLAYBOOK</Badge>
            <h2 className="heading-brutal text-4xl sm:text-5xl lg:text-6xl">
              THREE STEPS TO
              <br />
              <span className="text-purple">YOUR DREAM JOB</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <Card
                  key={step.num}
                  variant={step.color}
                  padding="lg"
                  className={`animate-fade-in-up stagger-${i + 1}`}
                >
                  <div className="flex items-start justify-between mb-6">
                    <span className="heading-brutal text-6xl opacity-20">{step.num}</span>
                    <div className="w-12 h-12 bg-black text-white flex items-center justify-center border-2 border-black">
                      <Icon size={24} />
                    </div>
                  </div>
                  <h3 className="heading-brutal text-2xl mb-3">{step.title}</h3>
                  <p className="font-mono text-sm font-medium leading-relaxed">{step.description}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Role Cards ───────────────────────── */}
      <section className="py-16 sm:py-24 bg-white border-y-4 border-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="heading-brutal text-4xl sm:text-5xl mb-4">WHO IS PROVN FOR?</h2>
            <p className="font-mono text-sm text-muted max-w-lg mx-auto">
              Whether you&apos;re a student, recruiter, or institution — there&apos;s a seat for you at the table.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            <Card variant="lime" padding="lg" hoverable>
              <GraduationCap size={32} className="mb-4" />
              <h3 className="heading-brutal text-xl mb-2">Students</h3>
              <p className="font-mono text-xs font-medium leading-relaxed">
                Build real skills, complete projects, and create a verified portfolio that gets you hired.
              </p>
            </Card>
            <Card variant="purple" padding="lg" hoverable>
              <Briefcase size={32} className="mb-4" />
              <h3 className="heading-brutal text-xl mb-2">Industry</h3>
              <p className="font-mono text-xs font-medium leading-relaxed">
                Post challenges, review work, and hire candidates who&apos;ve already proved their skills.
              </p>
            </Card>
            <Card variant="yellow" padding="lg" hoverable>
              <Shield size={32} className="mb-4" />
              <h3 className="heading-brutal text-xl mb-2">Colleges</h3>
              <p className="font-mono text-xs font-medium leading-relaxed">
                Track student progress, boost placement rates, and partner with industry leaders.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* ─── Pricing Preview ───────────────────── */}
      <section id="pricing" className="py-16 sm:py-24 bg-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <Badge variant="purple" className="mb-4">
              <Crown size={12} className="mr-1" /> PRICING
            </Badge>
            <h2 className="heading-brutal text-4xl sm:text-5xl lg:text-6xl mb-4">
              ONE PLAN.
              <br />
              <span className="text-purple">EVERYTHING INCLUDED.</span>
            </h2>
            <p className="font-mono text-sm text-muted max-w-lg mx-auto">
              No free tier, no feature gating. One subscription gets you the full Provn experience.
            </p>
          </div>

          <div className="grid lg:grid-cols-[1fr_380px] gap-8 items-center max-w-5xl mx-auto">
            {/* Left — Highlights */}
            <div>
              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                {[
                  { icon: Target, label: 'All career roadmaps', desc: 'Curated by industry experts' },
                  { icon: Code, label: 'Unlimited tasks', desc: 'Real-world projects & challenges' },
                  { icon: Zap, label: 'Industry Simulator', desc: 'Full advanced access' },
                  { icon: Shield, label: 'Verified PRO badge', desc: 'Stand out to recruiters' },
                  { icon: Trophy, label: 'Global leaderboard', desc: 'Compete & prove your skills' },
                  { icon: Briefcase, label: 'Recruiter access', desc: 'Get hired directly' },
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} className="flex items-start gap-3 p-3 bg-white border-brutal shadow-brutal-sm">
                      <div className="w-8 h-8 bg-lime border-2 border-black flex items-center justify-center shrink-0">
                        <Icon size={16} />
                      </div>
                      <div>
                        <div className="font-mono text-xs font-bold uppercase">{item.label}</div>
                        <div className="font-mono text-[11px] text-muted">{item.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right — Mini Pricing Card */}
            <Card variant="purple" padding="lg" className="relative border-[3px] text-center">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <Badge variant="dark">
                  <Star size={10} className="mr-1" /> ALL ACCESS
                </Badge>
              </div>
              <h3 className="heading-brutal text-2xl mb-2 flex items-center justify-center gap-2 pt-2">
                PRO <Crown size={24} />
              </h3>
              <div className="flex items-baseline justify-center gap-1 mb-2">
                <span className="heading-brutal text-5xl">Rs xxx</span>
                <span className="font-mono text-sm font-bold">/month</span>
              </div>
              <p className="font-mono text-xs mb-5 leading-relaxed">
                Full platform access. No limits.
                <br />Cancel anytime.
              </p>
              <div className="flex flex-col gap-2 text-left mb-6 bg-white/30 p-4 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                {['All roadmaps & tasks', 'Advanced simulator', 'Priority code review', 'Recruiter visibility'].map((f, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Check size={14} strokeWidth={3} className="shrink-0" />
                    <span className="font-mono text-xs font-bold">{f}</span>
                  </div>
                ))}
              </div>
              <Link href="/pricing">
                <Button variant="dark" fullWidth size="lg" icon={ArrowRight} iconPosition="right">
                  View Full Details
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </section>

      {/* ─── CTA Section ──────────────────────── */}
      <section className="bg-black text-white py-16 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="heading-brutal text-4xl sm:text-6xl lg:text-7xl mb-6">
            STOP READING.
            <br />
            <span className="text-lime">START DOING.</span>
          </h2>
          <p className="font-mono text-sm text-muted-light mb-8 max-w-md mx-auto">
            Join hundreds of students already building their careers on Provn. Free to start, no credit card required.
          </p>
          <Link href="/auth?mode=register">
            <Button variant="primary" size="lg" icon={Rocket} iconPosition="right">
              Create Free Account
            </Button>
          </Link>
        </div>
      </section>

      {/* ─── Footer ───────────────────────────── */}
      <footer className="bg-white border-t-4 border-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid sm:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-lime border-2 border-black flex items-center justify-center">
                  <Zap size={16} />
                </div>
                <span className="heading-brutal text-lg">PROVN</span>
              </div>
              <p className="font-mono text-xs text-muted">
                Campus to Careers.
                <br />
                © {new Date().getFullYear()} Provn
              </p>
            </div>
            <div>
              <h4 className="label-brutal mb-3">PLATFORM</h4>
              <div className="flex flex-col gap-2">
                <Link href="/discover" className="font-mono text-xs hover:text-lime transition-colors">Discover</Link>
                <Link href="/tasks" className="font-mono text-xs hover:text-lime transition-colors">Tasks</Link>
                <Link href="/simulator" className="font-mono text-xs hover:text-lime transition-colors">Simulator</Link>
              </div>
            </div>
            <div>
              <h4 className="label-brutal mb-3">COMPANY</h4>
              <div className="flex flex-col gap-2">
                <span className="font-mono text-xs text-muted">About (Coming Soon)</span>
                <span className="font-mono text-xs text-muted">Blog (Coming Soon)</span>
                <Link href="/pricing" className="font-mono text-xs hover:text-lime transition-colors">Pricing</Link>
                <a href="mailto:hello@provn.live" className="font-mono text-xs hover:text-lime transition-colors">hello@provn.live</a>
                <a href="mailto:support@provn.live" className="font-mono text-xs hover:text-lime transition-colors">support@provn.live</a>
              </div>
            </div>
            <div>
              <h4 className="label-brutal mb-3">LEGAL</h4>
              <div className="flex flex-col gap-2">
                <span className="font-mono text-xs text-muted">Privacy Policy</span>
                <span className="font-mono text-xs text-muted">Terms of Service</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
