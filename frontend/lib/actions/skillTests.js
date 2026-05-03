'use server';

import { apiFetch } from '@/utils/api';

// ─── Student: Test ────────────────────────────────────────────────────────────

/**
 * Get 15 MCQ questions for a skill (no answers included).
 */
export async function getSkillTest(skillId) {
  const { data, error } = await apiFetch(`/skills/${skillId}/test`, { method: 'GET' });
  if (error) return { error };
  return data;
}

/**
 * Submit test answers and get score.
 * @param {string} skillId
 * @param {Array} answers - [{questionId, selected}]
 * @param {number} timeTakenSeconds
 */
export async function submitSkillTest(skillId, answers, timeTakenSeconds) {
  const { data, error } = await apiFetch(`/skills/${skillId}/test/submit`, {
    method: 'POST',
    body: JSON.stringify({ answers, timeTakenSeconds }),
  });
  if (error) return { error };
  return data;
}

/**
 * Get all past test attempts for a skill.
 */
export async function getSkillTestHistory(skillId) {
  const { data, error } = await apiFetch(`/skills/${skillId}/test/history`, { method: 'GET' });
  if (error) return { error };
  return data;
}

/**
 * Get the user's best score percentage for a skill.
 */
export async function getBestSkillScore(skillId) {
  const { data, error } = await apiFetch(`/skills/${skillId}/test/best`, { method: 'GET' });
  if (error) return { error };
  return data;
}

/**
 * Get curated resource links (videos/articles) for a skill from the DB.
 * Returns { data: [] } if none exist — caller should fall back to YouTube API.
 */
export async function getSkillResources(skillId) {
  const { data, error } = await apiFetch(`/skills/${skillId}/resources`, { method: 'GET' });
  if (error) return { data: [], error };
  
  // Ensure we only return an array. If data is a string (e.g. 404 HTML) or missing the data array, return []
  if (typeof data === 'string' || !data || !Array.isArray(data.data)) {
    return { data: [] };
  }
  
  return { data: data.data };
}

// ─── Student: Projects ────────────────────────────────────────────────────────

/**
 * Get all gated projects for a skill with unlock status.
 */
export async function getSkillProjects(skillId) {
  const { data, error } = await apiFetch(`/skills/${skillId}/projects`, { method: 'GET' });
  if (error) return { error };
  return data;
}

/**
 * Get details for a single project.
 */
export async function getSkillProjectDetails(projectId) {
  const { data, error } = await apiFetch(`/skills/projects/${projectId}`, { method: 'GET' });
  if (error) return { error };
  return data;
}

/**
 * Submit work for a gated project.
 */
export async function submitSkillProject(skillId, projectId, content) {
  const { data, error } = await apiFetch(`/skills/${skillId}/projects/${projectId}/submit`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  });
  if (error) return { error };
  return data;
}
