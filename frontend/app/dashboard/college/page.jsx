'use client';

import { useState } from 'react';
import {
  GraduationCap, Users, Trophy, TrendingUp,
  Search, Eye, Mail, BarChart3, BookOpen,
  CheckCircle, Clock
} from 'lucide-react';
import Button from '@/components/Button';
import Card from '@/components/Card';
import Badge from '@/components/Badge';
import Modal from '@/components/Modal';
import Link from 'next/link';

const mockStats = { totalStudents: 342, activeRoadmaps: 12, avgScore: 245, placementRate: '78%' };
const mockStudents = [
  { id: '1', name: 'Alex Chen', branch: 'Computer Science', totalScore: 340, tasksCompleted: 12, roadmap: 'Frontend Developer', status: 'active' },
  { id: '2', name: 'Jane Smith', branch: 'Information Technology', totalScore: 280, tasksCompleted: 9, roadmap: 'Backend Developer', status: 'active' },
  { id: '3', name: 'Mike Johnson', branch: 'Computer Science', totalScore: 210, tasksCompleted: 7, roadmap: 'Full Stack', status: 'active' },
  { id: '4', name: 'Sara Lee', branch: 'Electronics', totalScore: 185, tasksCompleted: 6, roadmap: 'Data Science', status: 'inactive' },
  { id: '5', name: 'Tom Wilson', branch: 'Computer Science', totalScore: 150, tasksCompleted: 5, roadmap: 'Frontend Developer', status: 'active' },
  { id: '6', name: 'Emma Davis', branch: 'Information Technology', totalScore: 120, tasksCompleted: 4, roadmap: 'Backend Developer', status: 'active' },
];

export default function CollegeDashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const filtered = mockStudents.filter(s => {
    const m1 = !searchQuery || s.name.toLowerCase().includes(searchQuery.toLowerCase());
    const m2 = !branchFilter || s.branch === branchFilter;
    return m1 && m2;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="heading-brutal text-3xl sm:text-4xl flex items-center gap-3">
            <GraduationCap size={32} />
            COLLEGE DASHBOARD
          </h1>
          <p className="font-mono text-sm text-muted mt-1">Track student progress and placement readiness.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'TOTAL STUDENTS', value: mockStats.totalStudents, icon: Users, color: 'lime' },
          { label: 'ACTIVE ROADMAPS', value: mockStats.activeRoadmaps, icon: BookOpen, color: 'purple' },
          { label: 'AVG SCORE', value: mockStats.avgScore, icon: Trophy, color: 'yellow' },
          { label: 'PLACEMENT RATE', value: mockStats.placementRate, icon: TrendingUp, color: 'default' },
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

      {/* Students Table */}
      <Card variant="default" padding="lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <h2 className="heading-brutal text-xl">STUDENTS</h2>
          <div className="flex gap-3">
            <div className="relative flex-1 sm:flex-none">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-48 pl-9 pr-3 py-2 bg-white border-brutal font-mono text-xs shadow-brutal-sm focus:outline-none focus:shadow-brutal"
              />
            </div>
            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="bg-white border-brutal px-3 py-2 font-mono text-xs shadow-brutal-sm cursor-pointer focus:outline-none"
            >
              <option value="">All Branches</option>
              <option value="Computer Science">CS</option>
              <option value="Information Technology">IT</option>
              <option value="Electronics">ECE</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-black">
                <th className="label-brutal text-left py-3 px-2">#</th>
                <th className="label-brutal text-left py-3 px-2">Student</th>
                <th className="label-brutal text-left py-3 px-2 hidden sm:table-cell">Branch</th>
                <th className="label-brutal text-left py-3 px-2 hidden md:table-cell">Roadmap</th>
                <th className="label-brutal text-left py-3 px-2">Score</th>
                <th className="label-brutal text-left py-3 px-2">Tasks</th>
                <th className="label-brutal text-left py-3 px-2">Status</th>
                <th className="label-brutal text-right py-3 px-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((student, i) => (
                <tr key={student.id} className="border-b border-black/10 hover:bg-bg-dark transition-colors">
                  <td className="py-3 px-2 font-mono text-xs font-bold">{i + 1}</td>
                  <td className="py-3 px-2">
                    <span className="font-black text-sm uppercase">{student.name}</span>
                  </td>
                  <td className="py-3 px-2 font-mono text-xs hidden sm:table-cell">{student.branch}</td>
                  <td className="py-3 px-2 hidden md:table-cell">
                    <Badge variant="default" size="sm">{student.roadmap}</Badge>
                  </td>
                  <td className="py-3 px-2">
                    <Badge variant="lime" size="sm">
                      <Trophy size={10} className="mr-1" />{student.totalScore}
                    </Badge>
                  </td>
                  <td className="py-3 px-2 font-mono text-xs font-bold">{student.tasksCompleted}</td>
                  <td className="py-3 px-2">
                    <Badge variant={student.status === 'active' ? 'lime' : 'default'} size="sm">
                      {student.status === 'active' ? <CheckCircle size={10} className="mr-1" /> : <Clock size={10} className="mr-1" />}
                      {student.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-2 text-right">
                    <button
                      onClick={() => { setSelectedStudent(student); setProfileOpen(true); }}
                      className="p-2 border-2 border-black hover:bg-lime transition-colors cursor-pointer inline-flex"
                    >
                      <Eye size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Profile Modal */}
      <Modal isOpen={profileOpen} onClose={() => setProfileOpen(false)} title="STUDENT PROFILE">
        {selectedStudent && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-lime border-brutal flex items-center justify-center">
                <span className="heading-brutal text-xl">
                  {selectedStudent.name?.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div>
                <h3 className="font-black text-xl uppercase">{selectedStudent.name}</h3>
                <p className="font-mono text-xs text-muted">{selectedStudent.branch}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Card variant="lime" padding="sm">
                <div className="heading-brutal text-2xl">{selectedStudent.totalScore}</div>
                <div className="label-brutal text-muted">Score</div>
              </Card>
              <Card variant="purple" padding="sm">
                <div className="heading-brutal text-2xl">{selectedStudent.tasksCompleted}</div>
                <div className="label-brutal text-muted">Tasks</div>
              </Card>
            </div>
            <div className="flex gap-3">
              <Link href={`/portfolio/${selectedStudent.id}`} className="flex-1">
                <Button variant="outline" fullWidth icon={Eye}>Portfolio</Button>
              </Link>
              <Button variant="primary" icon={Mail} className="flex-1">Contact</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
