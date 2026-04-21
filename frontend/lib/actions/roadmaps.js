'use server';

import { apiFetch } from '@/utils/api';

export async function getRoadmaps() {
  const { data, error } = await apiFetch('/roadmaps', { method: 'GET' });
  if (error || data?.error) return { data: [], error: error || data?.error };
  return { data: data?.data || [] };
}

export async function getMyRoadmap() {
  const { data, error } = await apiFetch('/roadmaps/me', { method: 'GET' });
  if (error || data?.error) return null;
  // Express returns { data: roadmap_object } where roadmap might be null if not assigned
  if (!data?.data) return null;
  return { data: data.data };
}

export async function assignRoadmap(roadmapId) {
  const { data, error } = await apiFetch(`/roadmaps/${roadmapId}/assign`, {
    method: 'POST'
  });

  if (error || data?.error) return { error: error || data?.error };
  
  // Revalidate cache to ensure dashboard shows updated roadmap
  const { revalidatePath } = await import('next/cache');
  revalidatePath('/dashboard/student');
  
  return { success: true };
}
