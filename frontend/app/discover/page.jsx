'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search, Compass, BookOpen, Users, Clock,
  Zap, Star, ArrowRight, Plus, BarChart3, Loader2, Map,
  Code, Database, Smartphone, Cloud, Palette, Brain, TrendingUp
} from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/Button';
import Card from '@/components/Card';
import Badge from '@/components/Badge';
import { useToast } from '@/components/ToastContext';
import { getRoadmaps, assignRoadmap } from '@/lib/actions/roadmaps';

const categories = [
  { id: 'all', label: 'ALL' },
  { id: 'frontend', label: 'FRONTEND' },
  { id: 'backend', label: 'BACKEND' },
  { id: 'data', label: 'DATA' },
  { id: 'mobile', label: 'MOBILE' },
  { id: 'devops', label: 'DEVOPS' },
];

// Category-specific styling for cards
const categoryStyles = {
  frontend: {
    gradient: 'from-lime/20 via-lime/5 to-transparent',
    accent: 'bg-lime',
    icon: Code,
    pattern: 'radial-gradient(circle at 90% 10%, rgba(163, 230, 53, 0.15) 0%, transparent 50%)',
  },
  backend: {
    gradient: 'from-purple/20 via-purple/5 to-transparent',
    accent: 'bg-purple',
    icon: Database,
    pattern: 'radial-gradient(circle at 10% 90%, rgba(168, 85, 247, 0.15) 0%, transparent 50%)',
  },
  data: {
    gradient: 'from-cyan-400/20 via-cyan-400/5 to-transparent',
    accent: 'bg-cyan-400',
    icon: Brain,
    pattern: 'radial-gradient(circle at 90% 90%, rgba(34, 211, 238, 0.15) 0%, transparent 50%)',
  },
  mobile: {
    gradient: 'from-orange-400/20 via-orange-400/5 to-transparent',
    accent: 'bg-orange-400',
    icon: Smartphone,
    pattern: 'radial-gradient(circle at 10% 10%, rgba(251, 146, 60, 0.15) 0%, transparent 50%)',
  },
  devops: {
    gradient: 'from-pink-400/20 via-pink-400/5 to-transparent',
    accent: 'bg-pink-400',
    icon: Cloud,
    pattern: 'radial-gradient(circle at 50% 0%, rgba(244, 114, 182, 0.15) 0%, transparent 50%)',
  },
  default: {
    gradient: 'from-gray-200/30 via-gray-100/10 to-transparent',
    accent: 'bg-gray-400',
    icon: BookOpen,
    pattern: 'none',
  }
};

export default function DiscoverPage() {
  const toast = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [assigningId, setAssigningId] = useState(null);
  
  const [roadmaps, setRoadmaps] = useState([]);

  useEffect(() => {
    async function loadData() {
      try {
        const result = await getRoadmaps();
        if (result?.data) {
          setRoadmaps(result.data.map(rm => ({
            id: rm.id,
            title: rm.title,
            category: rm.category || 'frontend',
            description: rm.description || '',
            difficulty: rm.difficulty || 'Beginner',
            demand: rm.demand || 'HIGH',
            skills: rm.curriculum || [],
            duration: rm.duration || '12 weeks',
            enrolled: rm.enrolled_count || 0
          })));
        }
      } catch (error) {
        console.error('Error loading roadmaps:', error);
        toast.error('Failed to load roadmaps');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filtered = roadmaps.filter(rm => {
    const matchSearch = !search ||
      rm.title.toLowerCase().includes(search.toLowerCase()) ||
      rm.description.toLowerCase().includes(search.toLowerCase());
    const matchCategory = activeCategory === 'all' || rm.category === activeCategory;
    return matchSearch && matchCategory;
  });

  const handleStart = async (roadmap) => {
    setAssigningId(roadmap.id);
    try {
      const result = await assignRoadmap(roadmap.id);
      if (result.success) {
        toast.success(`Started learning "${roadmap.title}"!`);
        // Force refresh to clear any cached data, then navigate
        router.refresh();
        router.push('/dashboard/student');
      } else {
        toast.error(result.error || 'Failed to start roadmap');
      }
    } catch (error) {
      toast.error('Failed to start roadmap');
    } finally {
      setAssigningId(null);
    }
  };

  const demandColor = (d) => {
    if (d === 'VERY HIGH') return 'danger';
    if (d === 'HIGH') return 'purple';
    return 'default';
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={32} className="animate-spin text-lime" />
          <span className="font-mono text-sm text-muted">Loading roadmaps...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <Badge variant="dark" className="mb-2">
            <Compass size={10} className="mr-1" /> DISCOVERY ENGINE
          </Badge>
          <h1 className="heading-brutal text-3xl sm:text-4xl">DISCOVER SKILLS</h1>
          <p className="font-mono text-sm text-muted mt-1">
            Explore curated roadmaps designed by industry experts.
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Search roadmaps..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 bg-white border-brutal font-mono text-xs shadow-brutal-sm focus:outline-none focus:shadow-brutal"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`
              px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider
              border-2 border-black transition-all cursor-pointer
              ${activeCategory === cat.id
                ? 'bg-black text-white shadow-brutal-lime'
                : 'bg-white text-black shadow-brutal-sm hover:bg-bg-dark'}
            `}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Roadmap Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(rm => {
          const style = categoryStyles[rm.category] || categoryStyles.default;
          const IconComponent = style.icon;
          
          return (
            <div
              key={rm.id}
              className="group relative bg-white border-3 border-black shadow-brutal hover:shadow-brutal-lg transition-all duration-200 hover:-translate-y-1"
            >
              {/* Decorative gradient background */}
              <div 
                className={`absolute inset-0 bg-gradient-to-br ${style.gradient} pointer-events-none`}
                style={{ background: style.pattern }}
              />
              
              {/* Category icon watermark */}
              <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <IconComponent size={64} strokeWidth={1} />
              </div>
              
              {/* Accent bar */}
              <div className={`absolute top-0 left-0 w-full h-1 ${style.accent}`} />
              
              <div className="relative p-6 flex flex-col h-full">
                {/* Header badges */}
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="lime" size="sm" className="font-black">
                    {rm.difficulty}
                  </Badge>
                  <Badge variant={demandColor(rm.demand)} size="sm">
                    <TrendingUp size={10} className="mr-1" />
                    {rm.demand}
                  </Badge>
                </div>
                
                {/* Title with icon */}
                <div className="flex items-start gap-3 mb-3">
                  <div className={`p-2 ${style.accent} border-2 border-black shadow-brutal-xs`}>
                    <IconComponent size={20} className="text-black" />
                  </div>
                  <h3 className="font-black text-xl uppercase leading-tight flex-1">
                    {rm.title}
                  </h3>
                </div>
                
                {/* Description */}
                <p className="font-mono text-xs text-muted leading-relaxed mb-4 flex-1">
                  {rm.description || 'Master in-demand skills with hands-on projects and industry mentorship.'}
                </p>

                {/* Skills pills */}
                <div className="mb-4">
                  <label className="label-brutal mb-2 block text-[10px]">SKILLS YOU&apos;LL LEARN</label>
                  <div className="flex flex-wrap gap-1.5">
                    {(rm.skills && rm.skills.length > 0 ? rm.skills.slice(0, 4) : ['Core Concepts', 'Hands-on Projects']).map((skill, i) => (
                      <span 
                        key={i} 
                        className="px-2 py-1 bg-bg-dark border border-black/20 font-mono text-[10px] font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                    {rm.skills && rm.skills.length > 4 && (
                      <span className="px-2 py-1 bg-black text-white font-mono text-[10px] font-bold">
                        +{rm.skills.length - 4}
                      </span>
                    )}
                  </div>
                </div>

                {/* Stats row */}
                <div className="flex items-center gap-4 mb-5 py-3 border-y-2 border-black/10">
                  <div className="flex items-center gap-1.5">
                    <Clock size={14} className="text-muted" />
                    <span className="font-mono text-xs font-bold">{rm.duration}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users size={14} className="text-muted" />
                    <span className="font-mono text-xs font-bold">{rm.enrolled} enrolled</span>
                  </div>
                  <div className="flex items-center gap-1.5 ml-auto">
                    <Star size={14} className="text-yellow-500 fill-yellow-500" />
                    <span className="font-mono text-xs font-bold">4.9</span>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2">
                  <Link href={`/roadmap/${rm.id}`} className="flex-1">
                    <Button
                      variant="outline"
                      fullWidth
                      icon={Map}
                      className="group-hover:bg-bg-dark transition-colors"
                    >
                      Preview
                    </Button>
                  </Link>
                  <Button
                    variant="primary"
                    icon={assigningId === rm.id ? Loader2 : Zap}
                    iconPosition="right"
                    onClick={() => handleStart(rm)}
                    disabled={assigningId !== null}
                    className="flex-1"
                  >
                    {assigningId === rm.id ? 'Starting...' : 'Enroll'}
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="text-center py-16">
          <div className="inline-block p-4 bg-bg-dark border-2 border-black mb-4">
            <Search size={32} className="text-muted" />
          </div>
          <h3 className="font-black text-lg uppercase mb-2">No roadmaps found</h3>
          <p className="font-mono text-sm text-muted">Try adjusting your search or category filter.</p>
        </div>
      )}

      {/* Request CTA */}
      <div className="mt-12 text-center">
        <Card variant="muted" padding="lg" className="max-w-md mx-auto">
          <Plus size={24} className="mx-auto mb-3 text-muted" />
          <h3 className="font-black text-lg uppercase mb-2">REQUEST A NEW ROADMAP</h3>
          <p className="font-mono text-xs text-muted mb-4">
            Don&apos;t see what you&apos;re looking for? Let us know and we&apos;ll build it.
          </p>
          <Button variant="outline" size="sm" onClick={() => toast.info('Feature coming soon!')}>
            Submit Request
          </Button>
        </Card>
      </div>
    </div>
  );
}
