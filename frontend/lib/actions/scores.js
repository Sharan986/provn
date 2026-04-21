'use server';

import { apiFetch } from '@/utils/api';

export async function getDashboardStats() {
  const { data, error } = await apiFetch('/scores/dashboard', { method: 'GET' });
  if (error || data?.error) return { error: error || data?.error, data: null };
  return { data: data?.data || {} };
}

export async function getStudentScore(userId) {
  // Can determine score locally by fetching profile
  const { data, error } = await apiFetch(`/scores/profile/${userId}`, { method: 'GET' });
  if (error || data?.error) return { data: { totalScore: 0, tasksCompleted: 0 } };
  return { data: { totalScore: data.data.totalScore || 0, tasksCompleted: data.data.tasksCompleted || 0 } };
}

export async function getStudentLeaderboard() {
  const { data, error } = await apiFetch('/scores/leaderboard', { method: 'GET' });
  if (error || data?.error) return { data: [] };
  return { data: data?.data || [] };
}

export async function getStudentProfile(userId) {
  const { data, error } = await apiFetch(`/scores/profile/${userId}`, { method: 'GET' });
  if (error || data?.error) return { data: null };
  return { data: data?.data || null };
}

export async function getPublicStudentProfile(userId) {
  const { data: res, error } = await apiFetch(`/scores/profile/${userId}`, { method: 'GET' });
  if (error || res?.error || !res?.data) return { error: error || res?.error || 'Student not found', data: null };

  const profileData = res.data;
  const submissions = profileData.submissions || [];
  
  const completed = submissions.filter(s => s.status === 'approved');
  const pending = submissions.filter(s => s.status === 'pending');

  return {
    data: {
      ...profileData,
      completedSubmissions: completed,
      pendingSubmissions: pending,
    }
  };
}
