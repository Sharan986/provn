'use server';

import { apiFetch } from '@/utils/api';

export async function submitTask(formData) {
  const { data, error } = await apiFetch('/submissions', {
    method: 'POST',
    body: JSON.stringify({
      task_id: formData.get('task_id'),
      content: formData.get('content'),
    }),
  });

  if (error || data?.error) return { error: error || data?.error };
  return { success: true, data: data?.data };
}

export async function getMySubmissions() {
  const { data, error } = await apiFetch('/submissions/mine', { method: 'GET' });
  if (error || data?.error) return { error: error || data?.error, data: [] };
  return { data: data?.data || [] };
}

export async function getSubmissionsForReview({ status = 'pending' } = {}) {
  const { data, error } = await apiFetch(`/submissions/review?status=${encodeURIComponent(status)}`, { method: 'GET' });
  if (error || data?.error) return { error: error || data?.error, data: [] };
  return { data: data?.data || [] };
}

export async function reviewSubmission(id, formData) {
  const { data, error } = await apiFetch(`/submissions/${id}/review`, {
    method: 'PUT',
    body: JSON.stringify({
      status: formData.get('status'),
      score: parseInt(formData.get('score') || '0'),
      feedback: formData.get('feedback') || null,
    }),
  });

  if (error || data?.error) return { error: error || data?.error };
  return { success: true };
}
