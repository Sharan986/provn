'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Briefcase, DollarSign, MapPin, Clock, Users, Zap, Filter,
  Search, Building2, Star, ChevronRight, Loader2, Wifi, Target,
  GraduationCap, TrendingUp, ArrowRight, ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/Button';
import Card from '@/components/Card';
import Badge from '@/components/Badge';
import { useToast } from '@/components/ToastContext';
import { getJobPostings, getTaskOpenings } from '@/lib/actions/marketplace';
import { getRoadmaps } from '@/lib/actions/roadmaps';

const jobTypes = [
  { id: 'all', label: 'All Types' },
  { id: 'full-time', label: 'Full-Time' },
  { id: 'part-time', label: 'Part-Time' },
  { id: 'internship', label: 'Internship' },
  { id: 'contract', label: 'Contract' },
];

const experienceLevels = [
  { id: 'all', label: 'All Levels' },
  { id: 'fresher', label: 'Fresher' },
  { id: 'junior', label: 'Junior' },
  { id: 'mid', label: 'Mid-Level' },
  { id: 'senior', label: 'Senior' },
];

export default function MarketplacePage() {
  const router = useRouter();
  const toast = useToast();
  
  const [activeTab, setActiveTab] = useState('jobs'); // 'jobs' | 'gigs'
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [gigs, setGigs] = useState([]);
  const [roadmaps, setRoadmaps] = useState([]);
  const [isPro, setIsPro] = useState(true);
  
  // Filters
  const [search, setSearch] = useState('');
  const [jobType, setJobType] = useState('all');
  const [experienceLevel, setExperienceLevel] = useState('all');
  const [remoteOnly, setRemoteOnly] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [jobsRes, gigsRes, roadmapsRes] = await Promise.all([
          getJobPostings(),
          getTaskOpenings(),
          getRoadmaps()
        ]);
        
        if (jobsRes?.data) {
          setJobs(jobsRes.data);
          if (jobsRes.isPro !== undefined) setIsPro(jobsRes.isPro);
        }
        
        if (gigsRes?.data) setGigs(gigsRes.data);
        if (roadmapsRes?.data) setRoadmaps(roadmapsRes.data);
      } catch (error) {
        console.error('Error loading marketplace:', error);
        toast.error('Failed to load marketplace');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Filter jobs
  const filteredJobs = jobs.filter(job => {
    if (search && !job.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (jobType !== 'all' && job.job_type !== jobType) return false;
    if (experienceLevel !== 'all' && job.experience_level !== experienceLevel) return false;
    if (remoteOnly && !job.is_remote) return false;
    return true;
  });

  // Filter gigs
  const filteredGigs = gigs.filter(gig => {
    if (search && !gig.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const formatSalary = (min, max, currency = 'INR') => {
    const format = (num) => {
      if (num >= 100000) return `${(num / 100000).toFixed(1)}L`;
      if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
      return num;
    };
    if (min && max) return `${currency} ${format(min)} - ${format(max)}`;
    if (min) return `${currency} ${format(min)}+`;
    if (max) return `Up to ${currency} ${format(max)}`;
    return 'Not disclosed';
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={32} className="animate-spin text-lime" />
          <span className="font-mono text-sm text-muted">Loading opportunities...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <Badge variant="purple" className="mb-2">
          <Briefcase size={10} className="mr-1" /> INDUSTRY MARKETPLACE
        </Badge>
        <h1 className="heading-brutal text-3xl sm:text-4xl mb-2">
          FIND YOUR NEXT OPPORTUNITY
        </h1>
        <p className="font-mono text-sm text-muted max-w-2xl">
          Browse job openings and paid gigs from industry partners. 
          Your Industry Readiness Score helps you stand out.
        </p>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="p-4 bg-lime border-3 border-black shadow-brutal">
          <div className="flex items-center gap-2 mb-1">
            <Briefcase size={16} />
            <span className="font-mono text-xs">JOBS</span>
          </div>
          <span className="heading-brutal text-2xl">{jobs.length}</span>
        </div>
        <div className="p-4 bg-purple text-white border-3 border-black shadow-brutal">
          <div className="flex items-center gap-2 mb-1">
            <Zap size={16} />
            <span className="font-mono text-xs">PAID GIGS</span>
          </div>
          <span className="heading-brutal text-2xl">{gigs.length}</span>
        </div>
        <div className="p-4 bg-white border-3 border-black shadow-brutal">
          <div className="flex items-center gap-2 mb-1">
            <Building2 size={16} />
            <span className="font-mono text-xs">COMPANIES</span>
          </div>
          <span className="heading-brutal text-2xl">
            {new Set([...jobs.map(j => j.company_id), ...gigs.map(g => g.company_id)]).size}
          </span>
        </div>
        <div className="p-4 bg-cyan-400 border-3 border-black shadow-brutal">
          <div className="flex items-center gap-2 mb-1">
            <Wifi size={16} />
            <span className="font-mono text-xs">REMOTE</span>
          </div>
          <span className="heading-brutal text-2xl">
            {jobs.filter(j => j.is_remote).length}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-3 border-black mb-6">
        <button
          onClick={() => setActiveTab('jobs')}
          className={`flex-1 py-3 font-mono text-sm font-bold uppercase flex items-center justify-center gap-2 transition-colors ${
            activeTab === 'jobs' ? 'bg-black text-white' : 'bg-white text-black hover:bg-bg-dark'
          }`}
        >
          <Briefcase size={16} />
          Jobs ({jobs.length})
        </button>
        <button
          onClick={() => setActiveTab('gigs')}
          className={`flex-1 py-3 font-mono text-sm font-bold uppercase flex items-center justify-center gap-2 transition-colors border-l-3 border-black ${
            activeTab === 'gigs' ? 'bg-purple text-white' : 'bg-white text-black hover:bg-bg-dark'
          }`}
        >
          <Zap size={16} />
          Paid Gigs ({gigs.length})
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Search opportunities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border-3 border-black font-mono text-sm shadow-brutal-sm focus:shadow-brutal focus:outline-none transition-shadow"
          />
        </div>
        
        {activeTab === 'jobs' && (
          <>
            <select
              value={jobType}
              onChange={(e) => setJobType(e.target.value)}
              className="px-4 py-3 bg-white border-3 border-black font-mono text-sm shadow-brutal-sm focus:shadow-brutal focus:outline-none cursor-pointer"
            >
              {jobTypes.map(type => (
                <option key={type.id} value={type.id}>{type.label}</option>
              ))}
            </select>
            <select
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value)}
              className="px-4 py-3 bg-white border-3 border-black font-mono text-sm shadow-brutal-sm focus:shadow-brutal focus:outline-none cursor-pointer"
            >
              {experienceLevels.map(level => (
                <option key={level.id} value={level.id}>{level.label}</option>
              ))}
            </select>
            <button
              onClick={() => setRemoteOnly(!remoteOnly)}
              className={`px-4 py-3 border-3 border-black font-mono text-sm font-bold flex items-center gap-2 transition-colors ${
                remoteOnly ? 'bg-cyan-400 shadow-brutal' : 'bg-white shadow-brutal-sm hover:bg-bg-dark'
              }`}
            >
              <Wifi size={14} />
              Remote
            </button>
          </>
        )}
      </div>

      {/* Content */}
      {activeTab === 'jobs' ? (
        <div className="space-y-4 relative">
          {!isPro && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/40 backdrop-blur-[4px]">
              <div className="bg-white border-3 border-black p-6 max-w-sm text-center shadow-brutal">
                <div className="w-12 h-12 mx-auto bg-purple border-2 border-black flex items-center justify-center rounded-full mb-3">
                  <Star size={20} className="text-white fill-white" />
                </div>
                <h3 className="font-black text-lg uppercase mb-2">Pro Feature</h3>
                <p className="font-mono text-sm text-muted mb-4">
                  Upgrade to Pro to view and apply to industry job opportunities.
                </p>
                <Link href="/pro">
                  <Button variant="primary" fullWidth icon={Zap}>
                    Upgrade to Pro
                  </Button>
                </Link>
              </div>
            </div>
          )}
          {filteredJobs.length > 0 ? (
            filteredJobs.map(job => (
              <div
                key={job.id}
                className={`group p-5 bg-white border-3 border-black shadow-brutal transition-all ${isPro ? 'hover:shadow-brutal-lg hover:-translate-y-1' : ''}`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  {/* Company Logo Placeholder */}
                  <div className="w-14 h-14 bg-bg-dark border-2 border-black flex items-center justify-center flex-shrink-0">
                    <Building2 size={24} className="text-muted" />
                  </div>
                  
                  {/* Job Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <h3 className="font-black text-lg uppercase group-hover:text-purple transition-colors">
                          {job.title}
                        </h3>
                        <p className="font-mono text-sm text-muted">
                          {job.users?.company_name || job.users?.name || 'Company'}
                        </p>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        {job.is_remote && (
                          <Badge variant="cyan" size="sm">
                            <Wifi size={10} className="mr-1" /> Remote
                          </Badge>
                        )}
                        <Badge variant="lime" size="sm">
                          {job.job_type?.replace('-', ' ').toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                    
                    <p className="font-mono text-xs text-muted line-clamp-2 mb-3">
                      {job.description}
                    </p>
                    
                    <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-muted">
                      <span className="flex items-center gap-1">
                        <MapPin size={12} />
                        {job.location || 'Location not specified'}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign size={12} />
                        {formatSalary(job.salary_min, job.salary_max, job.salary_currency)}
                      </span>
                      <span className="flex items-center gap-1">
                        <GraduationCap size={12} />
                        {job.experience_level?.charAt(0).toUpperCase() + job.experience_level?.slice(1)}
                      </span>
                      {job.min_readiness_score > 0 && (
                        <span className="flex items-center gap-1 text-purple font-bold">
                          <Target size={12} />
                          Min Score: {job.min_readiness_score}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Apply Button */}
                  <div className="flex-shrink-0">
                    <Link href={`/marketplace/job/${job.id}`}>
                      <Button variant="primary" icon={ArrowRight} iconPosition="right">
                        View & Apply
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <Card variant="muted" padding="lg" className="text-center">
              <Briefcase size={32} className="mx-auto mb-3 text-muted" />
              <h3 className="heading-brutal text-lg mb-2">NO JOBS FOUND</h3>
              <p className="font-mono text-sm text-muted">
                Try adjusting your filters or check back later.
              </p>
            </Card>
          )}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGigs.length > 0 ? (
            filteredGigs.map(gig => (
              <div
                key={gig.id}
                className="group p-5 bg-white border-3 border-black shadow-brutal hover:shadow-brutal-lg hover:-translate-y-1 transition-all flex flex-col"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="purple" size="sm">
                    {gig.category?.toUpperCase() || 'GENERAL'}
                  </Badge>
                  {gig.payment_type === 'fixed' ? (
                    <Badge variant="lime" size="sm">FIXED PRICE</Badge>
                  ) : (
                    <Badge variant="yellow" size="sm">HOURLY</Badge>
                  )}
                </div>
                
                <h3 className="font-black text-base uppercase mb-2 group-hover:text-purple transition-colors">
                  {gig.title}
                </h3>
                
                <p className="font-mono text-xs text-muted line-clamp-2 mb-4 flex-1">
                  {gig.description}
                </p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between font-mono text-xs">
                    <span className="text-muted flex items-center gap-1">
                      <DollarSign size={12} />
                      Budget
                    </span>
                    <span className="font-bold">
                      {formatSalary(gig.budget_min, gig.budget_max, gig.budget_currency)}
                    </span>
                  </div>
                  {gig.estimated_hours && (
                    <div className="flex items-center justify-between font-mono text-xs">
                      <span className="text-muted flex items-center gap-1">
                        <Clock size={12} />
                        Est. Time
                      </span>
                      <span className="font-bold">{gig.estimated_hours} hours</span>
                    </div>
                  )}
                  {gig.min_readiness_score > 0 && (
                    <div className="flex items-center justify-between font-mono text-xs">
                      <span className="text-muted flex items-center gap-1">
                        <Target size={12} />
                        Min Score
                      </span>
                      <span className="font-bold text-purple">{gig.min_readiness_score}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-2 pt-3 border-t-2 border-black/10">
                  <div className="w-8 h-8 bg-bg-dark border border-black flex items-center justify-center">
                    <Building2 size={14} />
                  </div>
                  <span className="font-mono text-xs text-muted flex-1 truncate">
                    {gig.users?.company_name || gig.users?.name}
                  </span>
                  <Link href={`/marketplace/gig/${gig.id}`}>
                    <Button variant="outline" size="sm" icon={ChevronRight}>
                      Apply
                    </Button>
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <Card variant="muted" padding="lg" className="text-center col-span-full">
              <Zap size={32} className="mx-auto mb-3 text-muted" />
              <h3 className="heading-brutal text-lg mb-2">NO GIGS AVAILABLE</h3>
              <p className="font-mono text-sm text-muted">
                Check back soon for paid task opportunities.
              </p>
            </Card>
          )}
        </div>
      )}

      {/* CTA for Industry */}
      <div className="mt-12">
        <Card variant="dark" padding="lg" className="text-center">
          <Building2 size={32} className="mx-auto mb-3 text-lime" />
          <h3 className="heading-brutal text-xl text-white mb-2">
            ARE YOU AN INDUSTRY PARTNER?
          </h3>
          <p className="font-mono text-sm text-white/70 mb-4 max-w-md mx-auto">
            Post job openings and paid gigs. Find verified talent with Industry Readiness Scores.
          </p>
          <Link href="/dashboard/industry">
            <Button variant="lime" icon={ArrowRight} iconPosition="right">
              Post an Opportunity
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  );
}
