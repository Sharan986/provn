'use client';

import {
  Shield, Users, Briefcase, BookOpen, BarChart3,
  Trophy, AlertTriangle, Settings, Database
} from 'lucide-react';
import Card from '@/components/Card';
import Badge from '@/components/Badge';

const mockStats = {
  totalUsers: 584,
  students: 412,
  industry: 89,
  colleges: 43,
  admins: 4,
  totalTasks: 156,
  totalSubmissions: 892,
  totalRoadmaps: 24,
};

export default function AdminDashboard() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-black text-white border-brutal flex items-center justify-center">
          <Shield size={24} />
        </div>
        <div>
          <h1 className="heading-brutal text-3xl sm:text-4xl">ADMIN PANEL</h1>
          <p className="font-mono text-sm text-muted">Platform management & analytics.</p>
        </div>
      </div>

      {/* Overview Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'TOTAL USERS', value: mockStats.totalUsers, icon: Users, color: 'lime' },
          { label: 'TOTAL TASKS', value: mockStats.totalTasks, icon: Briefcase, color: 'purple' },
          { label: 'SUBMISSIONS', value: mockStats.totalSubmissions, icon: Trophy, color: 'yellow' },
          { label: 'ROADMAPS', value: mockStats.totalRoadmaps, icon: BookOpen, color: 'default' },
        ].map(stat => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} variant={stat.color}>
              <Icon size={20} className="mb-2" />
              <div className="heading-brutal text-3xl">{stat.value}</div>
              <div className="label-brutal text-muted mt-1">{stat.label}</div>
            </Card>
          );
        })}
      </div>

      {/* User Breakdown */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card variant="default" padding="lg">
          <h2 className="heading-brutal text-xl mb-4">USER BREAKDOWN</h2>
          <div className="flex flex-col gap-3">
            {[
              { role: 'Students', count: mockStats.students, pct: Math.round((mockStats.students / mockStats.totalUsers) * 100), color: 'bg-lime' },
              { role: 'Industry', count: mockStats.industry, pct: Math.round((mockStats.industry / mockStats.totalUsers) * 100), color: 'bg-purple' },
              { role: 'Colleges', count: mockStats.colleges, pct: Math.round((mockStats.colleges / mockStats.totalUsers) * 100), color: 'bg-yellow' },
              { role: 'Admins', count: mockStats.admins, pct: Math.round((mockStats.admins / mockStats.totalUsers) * 100), color: 'bg-black' },
            ].map(item => (
              <div key={item.role}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs font-bold uppercase">{item.role}</span>
                  <span className="font-mono text-xs text-muted">{item.count} ({item.pct}%)</span>
                </div>
                <div className="w-full h-4 bg-bg-dark border-2 border-black">
                  <div className={`h-full ${item.color} transition-all`} style={{ width: `${item.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card variant="default" padding="lg">
          <h2 className="heading-brutal text-xl mb-4">SYSTEM STATUS</h2>
          <div className="flex flex-col gap-3">
            {[
              { label: 'Database', status: 'Operational', ok: true, icon: Database },
              { label: 'Auth Service', status: 'Operational', ok: true, icon: Shield },
              { label: 'API', status: 'Operational', ok: true, icon: Settings },
              { label: 'CDN', status: 'Degraded', ok: false, icon: BarChart3 },
            ].map(item => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="flex items-center justify-between px-3 py-3 border-2 border-black/10 bg-bg">
                  <div className="flex items-center gap-2">
                    <Icon size={16} className="text-muted" />
                    <span className="font-mono text-xs font-bold uppercase">{item.label}</span>
                  </div>
                  <Badge variant={item.ok ? 'lime' : 'danger'} size="sm">
                    {item.ok ? '● ' : '▲ '}{item.status}
                  </Badge>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
