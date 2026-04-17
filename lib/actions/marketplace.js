'use server';

import { apiFetch } from '@/utils/api';

// ==========================================
// JOB POSTINGS
// ==========================================

export async function getJobPostings(filters = {}) {
  const params = new URLSearchParams();
  if (filters.jobType) params.append('jobType', filters.jobType);
  if (filters.experienceLevel) params.append('experienceLevel', filters.experienceLevel);
  if (filters.isRemote !== undefined) params.append('isRemote', filters.isRemote);
  if (filters.minSalary) params.append('minSalary', filters.minSalary);

  const qs = params.toString() ? `?${params.toString()}` : '';
  const { data, error } = await apiFetch(`/marketplace/jobs${qs}`, { method: 'GET' });
  
  if (error || data?.error) return { data: [], error: error || data?.error };
  return { data: data?.data || [] };
}

export async function getJobPosting(jobId) {
  const { data, error } = await apiFetch(`/marketplace/jobs/${jobId}`, { method: 'GET' });
  if (error || data?.error) return { data: null, error: error || data?.error };
  return { data: data?.data || null };
}

export async function createJobPosting(formData) {
  const { data, error } = await apiFetch('/marketplace/jobs', {
    method: 'POST',
    body: JSON.stringify(formData),
  });

  if (error || data?.error) return { error: error || data?.error };
  return { success: true, data: data?.data };
}

export async function updateJobStatus(jobId, status) {
  const { data, error } = await apiFetch(`/marketplace/jobs/${jobId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });

  if (error || data?.error) return { error: error || data?.error };
  return { success: true };
}

export async function getMyJobPostings() {
  const { data, error } = await apiFetch('/marketplace/jobs/mine', { method: 'GET' });
  if (error || data?.error) return { data: [], error: error || data?.error };
  return { data: data?.data || [] };
}

// ==========================================
// TASK OPENINGS (Paid Gigs)
// ==========================================

export async function getTaskOpenings(filters = {}) {
  const params = new URLSearchParams();
  if (filters.category) params.append('category', filters.category);
  if (filters.minBudget) params.append('minBudget', filters.minBudget);

  const qs = params.toString() ? `?${params.toString()}` : '';
  const { data, error } = await apiFetch(`/marketplace/tasks${qs}`, { method: 'GET' });

  if (error || data?.error) return { data: [], error: error || data?.error };
  return { data: data?.data || [] };
}

export async function getTaskOpening(taskId) {
  const { data, error } = await apiFetch(`/marketplace/tasks/${taskId}`, { method: 'GET' });
  if (error || data?.error) return { data: null, error: error || data?.error };
  return { data: data?.data || null };
}

export async function createTaskOpening(formData) {
  const { data, error } = await apiFetch('/marketplace/tasks', {
    method: 'POST',
    body: JSON.stringify(formData),
  });

  if (error || data?.error) return { error: error || data?.error };
  return { success: true, data: data?.data };
}

// ==========================================
// APPLICATIONS
// ==========================================

export async function applyToOpportunity(type, opportunityId, formData) {
  const { data, error } = await apiFetch('/marketplace/apply', {
    method: 'POST',
    body: JSON.stringify({ type, opportunityId, ...formData }),
  });

  if (error || data?.error) return { error: error || data?.error };
  return { success: true, data: data?.data };
}

export async function getMyApplications() {
  const { data, error } = await apiFetch('/marketplace/applications/mine', { method: 'GET' });
  if (error || data?.error) return { data: [], error: error || data?.error };
  return { data: data?.data || [] };
}

export async function getApplicationsForOpportunity(type, opportunityId) {
  const { data, error } = await apiFetch(`/marketplace/applications/${type}/${opportunityId}`, { method: 'GET' });
  if (error || data?.error) return { data: [], error: error || data?.error };
  return { data: data?.data || [] };
}

export async function updateApplicationStatus(applicationId, status) {
  const { data, error } = await apiFetch(`/marketplace/applications/${applicationId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });

  if (error || data?.error) return { error: error || data?.error };
  return { success: true };
}

// ==========================================
// CANDIDATE SEARCH (for industry)
// ==========================================

export async function searchCandidates(filters = {}) {
  const params = new URLSearchParams();
  if (filters.minScore) params.append('minScore', filters.minScore);
  if (filters.roadmapId) params.append('roadmapId', filters.roadmapId);
  if (filters.limit) params.append('limit', filters.limit);

  const qs = params.toString() ? `?${params.toString()}` : '';
  const { data, error } = await apiFetch(`/marketplace/candidates${qs}`, { method: 'GET' });

  if (error || data?.error) return { data: [], error: error || data?.error };
  return { data: data?.data || [] };
}
