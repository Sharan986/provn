'use server';

import { apiFetch } from '@/utils/api';

export async function getSimulatorChallenges(roadmapId) {
  const { data, error } = await apiFetch(`/simulator/challenges/${roadmapId}`, { method: 'GET' });
  if (error || data?.error) return { error: error || data?.error, data: [] };
  return { data: data?.data || [] };
}

export async function getChallenge(challengeId) {
  const { data, error } = await apiFetch(`/simulator/challenge/${challengeId}`, { method: 'GET' });
  if (error || data?.error) return { error: error || data?.error, data: null };
  return { data: data?.data || null };
}

export async function startSimulatorAttempt(challengeId, roadmapId) {
  const { data, error } = await apiFetch('/simulator/attempts', {
    method: 'POST',
    body: JSON.stringify({ challengeId, roadmapId }),
  });
  if (error || data?.error) return { error: error || data?.error };
  return { data: data?.data || {}, message: data?.message };
}

export async function submitSimulatorAttempt(attemptId, code, testResults) {
  const { data, error } = await apiFetch(`/simulator/attempts/${attemptId}/submit`, {
    method: 'PUT',
    body: JSON.stringify({ code, testResults }),
  });
  
  if (error || data?.error) return { error: error || data?.error };
  
  // Revalidate roadmap page to show updated progress
  if (data?.data?.roadmapId) {
    const { revalidatePath } = await import('next/cache');
    revalidatePath(`/roadmap/${data.data.roadmapId}`);
  }

  return { success: true, data: data?.data };
}

export async function getSimulatorProgress(roadmapId) {
  const { data, error } = await apiFetch(`/simulator/progress/${roadmapId}`, { method: 'GET' });
  if (error || data?.error) return { data: null };
  return { data: data?.data || null };
}

export async function calculateReadinessScore(userId, roadmapId) {
  // If backend expects userId it could be passed, but typically backend uses req.user.id for 'mine'
  // Backend's `triggerReadinessScore` uses req.user.id. So userId might be redundant but keeping signature.
  const { data, error } = await apiFetch(`/simulator/readiness/${roadmapId}`, { method: 'POST' });
  if (error || data?.error) return { error: error || data?.error };
  return { success: true, data: data?.data };
}

export async function getReadinessScore(userId, roadmapId) {
  // Similarly, backend uses req.user.id
  const { data, error } = await apiFetch(`/simulator/readiness/${roadmapId}`, { method: 'GET' });
  if (error || data?.error) return { data: null, error: error || data?.error };
  return { data: data?.data || null };
}

export async function getAllReadinessScores(userId) {
  const { data, error } = await apiFetch(`/simulator/readiness`, { method: 'GET' });
  if (error || data?.error) return { data: [], error: error || data?.error };
  return { data: data?.data || [] };
}

export async function getReadinessLeaderboard(roadmapId, limit = 20) {
  const { data, error } = await apiFetch(`/simulator/leaderboard/${roadmapId}?limit=${limit}`, { method: 'GET' });
  if (error || data?.error) return { data: [], error: error || data?.error };
  return { data: data?.data || [] };
}
