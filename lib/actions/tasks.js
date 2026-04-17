'use server';

import { apiFetch } from '@/utils/api';

export async function getTasks() {
  const { data, error } = await apiFetch('/tasks', { method: 'GET' });
  if (error || data?.error) return { error: error || data?.error, data: [] };
  return { data: data?.data || [] };
}

export async function getMyRoadmapTasks() {
  const { data, error } = await apiFetch('/tasks/my-roadmap', { method: 'GET' });
  if (error || data?.error) return { error: error || data?.error, data: [] };
  return { data: data?.data || [] };
}

export async function createTask(formData) {
  const task = {
    title: formData.get('title'),
    description: formData.get('description'),
    type: formData.get('type') || 'platform',
    difficulty: formData.get('difficulty') || 'beginner',
    points: parseInt(formData.get('points') || '10'),
    roadmap_id: formData.get('roadmap_id') || null,
  };

  const { data, error } = await apiFetch('/tasks', {
    method: 'POST',
    body: JSON.stringify(task),
  });

  if (error || data?.error) return { error: error || data?.error };
  return { success: true, data: data?.data };
}
