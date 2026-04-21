'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Crown, Check, Zap, Star, Sparkles, Rocket,
  ArrowRight, Shield, Code, Target, Trophy,
  Users, Briefcase, GraduationCap, ChevronDown,
  MessageCircle, HelpCircle, Clock, Gift,
  Infinity as InfinityIcon, TrendingUp, Award
} from 'lucide-react';
import Button from '@/components/Button';
import Card from '@/components/Card';
import Badge from '@/components/Badge';

const GOOGLE_FORM_URL = 'https://forms.gle/XYQH6nA1JGu9Fdem7';

/* ─── Feature categories with icons ─── */
const featureCategories = [
  {
    title: 'LEARN',
    icon: Target,
    color: 'lime',
    features: [
      'Access to all curated career roadmaps',
      'Structured learning paths by industry experts',
      'Skill-gap analysis & personalized suggestions',
      'Progress tracking with milestones',
    ],
  },
  {
    title: 'BUILD',
    icon: Code,
    color: 'purple',
    features: [
      'Unlimited platform tasks & challenges',
      'Real-world project assignments',
      'Code review & priority feedback queue',
      'GitHub-integrated portfolio builder',
    ],
  },
  {
    title: 'COMPETE',
    icon: Trophy,
    color: 'yellow',
    features: [
      'Advanced Industry Simulator access',
      'All premium challenges unlocked',
      'Global leaderboard ranking',
      'Performance analytics & insights',
    ],
  },
  {
    title: 'GET HIRED',
    icon: Briefcase,
    color: 'lime',
    features: [
      'Verified PRO badge on profile',
      'Direct recruiter visibility',
      'Job & internship marketplace access',
      'Career insights & salary benchmarks',
    ],
  },
];

/* ─── Comparison table ─── */
const comparisonRows = [
  { feature: 'Roadmaps', without: 'None', with: 'All roadmaps' },
  { feature: 'Tasks & Challenges', without: 'None', with: 'Unlimited' },
  { feature: 'Industry Simulator', without: 'None', with: 'Full access' },
  { feature: 'Portfolio', without: 'None', with: 'Premium portfolio' },
  { feature: 'Code Review', without: 'None', with: 'Priority queue' },
  { feature: 'Leaderboard', without: 'None', with: 'Full ranking' },
  { feature: 'Recruiter Access', without: 'None', with: 'Direct access' },
  { feature: 'PRO Badge', without: '—', with: '✓ Verified' },
  { feature: 'Career Insights', without: '—', with: '✓ Full analytics' },
  { feature: 'Early Feature Access', without: '—', with: '✓ Always first' },
];

/* ─── FAQs ─── */
const faqs = [
  {
    q: 'What do I get with the Pro plan?',
    a: 'Everything. Literally. All roadmaps, tasks, the industry simulator, premium challenges, portfolio tools, recruiter access, leaderboards — the full Provn experience. There\'s no gated content behind higher tiers. One plan, everything included.',
  },
  {
    q: 'Is there a free tier?',
    a: 'Provn is a subscription-first platform. All our features — roadmaps, tasks, simulator, portfolio — are part of the Pro plan. We believe in giving you the complete toolkit to succeed, not a watered-down version.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Absolutely. No lock-in contracts, no cancellation fees. You can cancel your subscription at any time and retain access until the end of your billing period.',
  },
  {
    q: 'How does the recruiter access work?',
    a: 'Industry partners on Provn can browse verified student profiles, view completed projects, simulator scores, and directly reach out for internships or jobs. Your work speaks for itself.',
  },
  {
    q: 'Is my progress saved if I unsubscribe?',
    a: 'Yes. Your portfolio, completed tasks, and achievements are always tied to your account. If you re-subscribe later, everything is right where you left it.',
  },
  {
    q: 'Do you offer student discounts or scholarships?',
    a: 'We\'re working on scholarship programs and institutional partnerships. Fill out the signup form and mention if you need financial assistance — we\'ll work something out.',
  },
];

/* ─── Animated counter hook ─── */
function useCounter(end, duration = 2000, startOnView = true) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!startOnView) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          let start = 0;
          const increment = end / (duration / 16);
          const timer = setInterval(() => {
            start += increment;
            if (start >= end) {
              setCount(end);
              clearInterval(timer);
            } else {
              setCount(Math.floor(start));
            }
          }, 16);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration, startOnView]);

  return { count, ref };
}

/* ─── FAQ Accordion Item ─── */
function FAQItem({ question, answer, isOpen, onToggle }) {
  return (
    <div className="border-brutal bg-white">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-5 text-left cursor-pointer group"
      >
        <span className="font-mono text-sm font-bold uppercase tracking-tight pr-4">
          {question}
        </span>
        <ChevronDown
          size={20}
          className={`shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-60' : 'max-h-0'}`}
      >
        <div className="px-5 pb-5 border-t-2 border-black/10 pt-4">
          <p className="font-mono text-xs leading-relaxed text-muted">
            {answer}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function PricingPage() {
  const [openFaq, setOpenFaq] = useState(null);

  const stat1 = useCounter(500, 1800);
  const stat2 = useCounter(50, 1500);
  const stat3 = useCounter(95, 2000);

  return (
    <div className="overflow-hidden">
      {/* ─── Hero Section ─── */}
      <section className="relative bg-purple border-b-4 border-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 lg:py-28">
          <div className="relative z-10 text-center">
            <div className="flex items-center justify-center gap-3 mb-6 animate-fade-in-up stagger-1">
              <Badge variant="dark">
                <Crown size={12} className="mr-1" /> PRO MEMBERSHIP
              </Badge>
              <Badge variant="default">
                <Sparkles size={12} className="mr-1" /> LIMITED LAUNCH PRICE
              </Badge>
            </div>

            <h1 className="heading-brutal text-5xl sm:text-7xl lg:text-8xl mb-6 animate-fade-in-up stagger-2">
              ONE PLAN.
              <br />
              <span className="relative inline-block">
                ZERO LIMITS.
                <svg className="absolute -bottom-2 left-0 w-full h-4" viewBox="0 0 400 12">
                  <path d="M0 6 Q100 0 200 6 Q300 12 400 6" stroke="black" strokeWidth="3" fill="none" />
                </svg>
              </span>
            </h1>

            <p className="max-w-2xl mx-auto text-lg sm:text-xl font-mono font-bold mb-10 animate-fade-in-up stagger-3">
              Every feature. Every tool. Every opportunity.
              <br className="hidden sm:block" />
              <span className="bg-black text-purple px-2 mx-1">All-in-one</span>
              subscription to launch your career.
            </p>

            <div className="animate-fade-in-up stagger-4">
              <a href={GOOGLE_FORM_URL} target="_blank" rel="noopener noreferrer">
                <Button variant="dark" size="lg" icon={ArrowRight} iconPosition="right">
                  Get Pro Access
                </Button>
              </a>
            </div>
          </div>

          {/* Decorative blocks */}
          <div className="absolute top-8 right-8 w-16 h-16 bg-lime border-brutal rotate-12 hidden lg:block" />
          <div className="absolute bottom-12 right-24 w-12 h-12 bg-yellow border-brutal -rotate-6 hidden lg:block" />
          <div className="absolute top-1/2 left-12 w-10 h-10 bg-black rotate-45 hidden lg:block" />
          <div className="absolute bottom-8 left-20 w-6 h-6 bg-white border-brutal rotate-12 hidden lg:block" />
        </div>
      </section>

      {/* ─── Marquee Ticker ─── */}
      <section className="bg-black text-white border-b-4 border-black overflow-hidden py-3">
        <div className="flex whitespace-nowrap animate-marquee">
          {[...Array(2)].flatMap((_, j) =>
            ['ALL ACCESS', 'ROADMAPS', 'SIMULATOR', 'PORTFOLIO', 'RECRUITER ACCESS', 'PRO BADGE', 'CAREER INSIGHTS', 'PRIORITY REVIEW'].map((word, i) => (
              <span key={`${j}-${i}`} className="inline-flex items-center mx-4">
                <span className="font-black text-sm tracking-widest">{word}</span>
                <Zap size={14} className="text-purple ml-4" />
              </span>
            ))
          )}
        </div>
      </section>

      {/* ─── Pricing Card — Single Centered ─── */}
      <section className="py-16 sm:py-24 bg-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-[1fr_400px] gap-10 items-start">

            {/* Left — Feature Grid */}
            <div>
              <Badge variant="dark" className="mb-4">
                <Zap size={12} className="mr-1" /> WHAT YOU GET
              </Badge>
              <h2 className="heading-brutal text-4xl sm:text-5xl mb-8">
                EVERYTHING TO
                <br />
                <span className="text-purple">GO FROM ZERO TO HIRED</span>
              </h2>

              <div className="grid sm:grid-cols-2 gap-5">
                {featureCategories.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <Card key={cat.title} variant={cat.color} padding="default" className="flex flex-col">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-black text-white flex items-center justify-center border-2 border-black">
                          <Icon size={20} />
                        </div>
                        <h3 className="heading-brutal text-lg">{cat.title}</h3>
                      </div>
                      <div className="flex flex-col gap-2.5">
                        {cat.features.map((f, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <Check size={14} className="shrink-0 mt-0.5" strokeWidth={3} />
                            <span className="font-mono text-xs font-bold leading-relaxed">{f}</span>
                          </div>
                        ))}
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Right — Pricing Card (Sticky) */}
            <div className="lg:sticky lg:top-24">
              <Card variant="purple" padding="lg" className="relative border-[3px]">
                {/* Popular badge */}
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <Badge variant="dark">
                    <Star size={10} className="mr-1" /> ALL INCLUSIVE
                  </Badge>
                </div>

                {/* Plan header */}
                <div className="text-center mb-6 pt-2">
                  <h3 className="heading-brutal text-2xl mb-3 flex items-center justify-center gap-2">
                    PRO <Crown size={24} />
                  </h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="heading-brutal text-6xl">Rs xxx</span>
                    <span className="font-mono text-sm font-bold">/month</span>
                  </div>
                  <p className="font-mono text-xs mt-3 leading-relaxed">
                    Full access to the entire Provn platform.
                    <br />No hidden fees. Cancel anytime.
                  </p>
                </div>

                {/* Quick highlights */}
                <div className="bg-white/40 border-2 border-black p-4 mb-6 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { icon: InfinityIcon, label: 'Unlimited tasks' },
                      { icon: Shield, label: 'Verified PRO badge' },
                      { icon: Rocket, label: 'Priority review' },
                      { icon: Award, label: 'Recruiter access' },
                    ].map((h, i) => {
                      const HIcon = h.icon;
                      return (
                        <div key={i} className="flex items-center gap-2">
                          <HIcon size={14} strokeWidth={2.5} />
                          <span className="font-mono text-[11px] font-bold">{h.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* CTA */}
                <a href={GOOGLE_FORM_URL} target="_blank" rel="noopener noreferrer" className="block">
                  <Button variant="dark" fullWidth size="lg" icon={Zap}>
                    Subscribe Now
                  </Button>
                </a>
                <p className="font-mono text-[10px] text-center mt-3 opacity-70">
                  You&#39;ll be redirected to a signup form.
                </p>

                {/* Trust signals */}
                <div className="flex items-center justify-center gap-4 mt-5 pt-4 border-t-2 border-black/10">
                  <div className="flex items-center gap-1">
                    <Shield size={12} />
                    <span className="font-mono text-[10px] font-bold">SECURE</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={12} />
                    <span className="font-mono text-[10px] font-bold">CANCEL ANYTIME</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Social Proof / Stats ─── */}
      <section className="border-y-4 border-black bg-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-3">
          <div
            ref={stat1.ref}
            className="p-8 sm:p-10 text-center border-b-2 sm:border-b-0 sm:border-r-2 border-black"
          >
            <Users size={28} className="mx-auto mb-2 text-muted" />
            <div className="heading-brutal text-4xl sm:text-5xl mb-1">{stat1.count}+</div>
            <div className="label-brutal text-muted">STUDENTS ENROLLED</div>
          </div>
          <div
            ref={stat2.ref}
            className="p-8 sm:p-10 text-center border-b-2 sm:border-b-0 sm:border-r-2 border-black"
          >
            <Briefcase size={28} className="mx-auto mb-2 text-muted" />
            <div className="heading-brutal text-4xl sm:text-5xl mb-1">{stat2.count}+</div>
            <div className="label-brutal text-muted">INDUSTRY PARTNERS</div>
          </div>
          <div
            ref={stat3.ref}
            className="p-8 sm:p-10 text-center"
          >
            <TrendingUp size={28} className="mx-auto mb-2 text-muted" />
            <div className="heading-brutal text-4xl sm:text-5xl mb-1">{stat3.count}%</div>
            <div className="label-brutal text-muted">PLACEMENT RATE</div>
          </div>
        </div>
      </section>

      {/* ─── Comparison Table ─── */}
      <section className="py-16 sm:py-24 bg-bg">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <Badge variant="purple" className="mb-4">
              <HelpCircle size={12} className="mr-1" /> WHY PRO?
            </Badge>
            <h2 className="heading-brutal text-4xl sm:text-5xl mb-4">
              WITHOUT PRO
              <br />
              <span className="text-purple">VS. WITH PRO</span>
            </h2>
            <p className="font-mono text-sm text-muted max-w-md mx-auto">
              Provn is built around the Pro experience. Here&#39;s what access looks like.
            </p>
          </div>

          <Card variant="default" padding="none" className="overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-3 bg-black text-white">
              <div className="p-4 font-mono text-xs font-bold uppercase tracking-wider border-r border-white/20">
                Feature
              </div>
              <div className="p-4 font-mono text-xs font-bold uppercase tracking-wider text-center border-r border-white/20">
                Without Pro
              </div>
              <div className="p-4 font-mono text-xs font-bold uppercase tracking-wider text-center bg-purple text-black">
                <span className="flex items-center justify-center gap-1">
                  <Crown size={12} /> With Pro
                </span>
              </div>
            </div>
            {/* Table body */}
            {comparisonRows.map((row, i) => (
              <div
                key={i}
                className={`grid grid-cols-3 ${i < comparisonRows.length - 1 ? 'border-b-2 border-black/10' : ''} ${i % 2 === 0 ? 'bg-white' : 'bg-bg'}`}
              >
                <div className="p-4 font-mono text-xs font-bold border-r border-black/10">
                  {row.feature}
                </div>
                <div className="p-4 font-mono text-xs text-center text-muted-light border-r border-black/10">
                  {row.without}
                </div>
                <div className="p-4 font-mono text-xs text-center font-bold bg-purple/10">
                  {row.with}
                </div>
              </div>
            ))}
          </Card>

          <div className="text-center mt-8">
            <a href={GOOGLE_FORM_URL} target="_blank" rel="noopener noreferrer">
              <Button variant="dark" size="lg" icon={ArrowRight} iconPosition="right">
                Get Full Access
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* ─── How it works ─── */}
      <section className="py-16 sm:py-24 bg-white border-y-4 border-black">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <Badge variant="dark" className="mb-4">
              <Rocket size={12} className="mr-1" /> GET STARTED
            </Badge>
            <h2 className="heading-brutal text-4xl sm:text-5xl">
              THREE STEPS TO
              <br />
              <span className="text-purple">GO PRO</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                num: '01',
                title: 'Sign Up',
                description: 'Fill out the quick form. We\'ll set up your PRO account and send confirmation within 24 hours.',
                icon: GraduationCap,
                color: 'lime',
              },
              {
                num: '02',
                title: 'Start Building',
                description: 'Access all roadmaps, tasks, and the simulator immediately. Build projects that prove your skills.',
                icon: Code,
                color: 'purple',
              },
              {
                num: '03',
                title: 'Get Noticed',
                description: 'Your verified portfolio and PRO badge put you directly in front of recruiters and hiring managers.',
                icon: Trophy,
                color: 'yellow',
              },
            ].map((step) => {
              const Icon = step.icon;
              return (
                <Card key={step.num} variant={step.color} padding="lg">
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

      {/* ─── FAQ Section ─── */}
      <section className="py-16 sm:py-24 bg-bg">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <Badge variant="dark" className="mb-4">
              <MessageCircle size={12} className="mr-1" /> FAQ
            </Badge>
            <h2 className="heading-brutal text-4xl sm:text-5xl mb-4">
              GOT QUESTIONS?
              <br />
              <span className="text-purple">WE GOT ANSWERS.</span>
            </h2>
          </div>

          <div className="flex flex-col gap-3">
            {faqs.map((faq, i) => (
              <FAQItem
                key={i}
                question={faq.q}
                answer={faq.a}
                isOpen={openFaq === i}
                onToggle={() => setOpenFaq(openFaq === i ? null : i)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ─── Final CTA ─── */}
      <section className="bg-black text-white py-16 sm:py-24 border-t-4 border-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-block mb-6 animate-pulse-brutal">
            <div className="w-20 h-20 bg-purple border-brutal mx-auto flex items-center justify-center">
              <Crown size={40} className="text-black" />
            </div>
          </div>
          <h2 className="heading-brutal text-4xl sm:text-6xl lg:text-7xl mb-6">
            STOP WAITING.
            <br />
            <span className="text-purple">START BUILDING.</span>
          </h2>
          <p className="font-mono text-sm text-muted-light mb-8 max-w-md mx-auto">
            Every day you delay is a day someone else is building their portfolio, completing tasks, and getting hired. Join the Pro community now.
          </p>
          <a href={GOOGLE_FORM_URL} target="_blank" rel="noopener noreferrer">
            <Button variant="primary" size="lg" icon={Rocket} iconPosition="right">
              Become Pro Today
            </Button>
          </a>
        </div>
      </section>
    </div>
  );
}
