'use server';

import { apiFetch } from '@/utils/api';

export async function getRoadmapWithSkills(roadmapId) {
  const { data, error } = await apiFetch(`/roadmaps/${roadmapId}/skills`, { method: 'GET' });
  if (error || data?.error) return { error: error || data?.error, data: null };
  return { data: data?.data || { roadmap: null, skills: [], usingFallback: true } };
}

export async function getTasksBySkill(skillId) {
  const { data, error } = await apiFetch(`/tasks/skill/${skillId}`, { method: 'GET' });
  if (error || data?.error) return { error: error || data?.error, data: [] };
  return { data: data?.data || [] };
}

export async function getTasksByRoadmap(roadmapId) {
  const { data, error } = await apiFetch(`/roadmaps/${roadmapId}/tasks`, { method: 'GET' });
  if (error || data?.error) return { error: error || data?.error, data: [] };
  return { data: data?.data || [] };
}

export async function getUserRoadmapProgress(roadmapId) {
  const { data, error } = await apiFetch(`/submissions/progress/${roadmapId}`, { method: 'GET' });
  if (error || data?.error) return { error: error || data?.error, data: null };
  return { data: data?.data || { submissions: [], completedSkills: [], inProgressSkills: [], totalScore: 0, totalPoints: 0, submissionMap: {} } };
}

export async function submitTaskWork(taskId, content) {
  const { data, error } = await apiFetch('/submissions', {
    method: 'POST',
    body: JSON.stringify({ task_id: taskId, content }),
  });

  if (error || data?.error) return { error: error || data?.error, success: false };

  // Backend automatically triggers autoReview. Let's return the standard response.
  const finalStatus = data?.data?.status || 'pending';
  const message = finalStatus === 'approved' 
    ? '✅ Submitted and approved!' 
    : finalStatus === 'needs_revision'
    ? '📝 Submitted! Some improvements needed.'
    : 'Submitted! Review in progress...';

  return { success: true, data: { ...data?.data, status: finalStatus }, message };
}

export async function provisionTaskRepo(taskId) {
  const { data, error } = await apiFetch(`/tasks/${taskId}/provision`, {
    method: 'POST',
  });
  if (error || data?.error) return { error: error || data?.error, success: false };
  return { success: true, data: data };
}

export async function getUserTotalScore() {
  const { data, error } = await apiFetch('/scores/dashboard', { method: 'GET' });
  if (error || data?.error) return { error: error || data?.error, data: 0 };
  return { data: data?.data?.totalScore || 0 };
}

export async function createSkill({ roadmapId, name, description, positionX, positionY, orderIndex }) {
  const { data, error } = await apiFetch(`/roadmaps/${roadmapId}/skills`, {
    method: 'POST',
    body: JSON.stringify({ name, description, positionX, positionY, orderIndex }),
  });

  if (error || data?.error) return { error: error || data?.error, success: false };
  return { success: true, data: data?.data };
}

export async function getRoadmapsWithSkillCounts() {
  const { data, error } = await apiFetch('/roadmaps/with-skill-counts', { method: 'GET' });
  if (error || data?.error) return { error: error || data?.error, data: [] };
  return { data: data?.data || [] };
}
