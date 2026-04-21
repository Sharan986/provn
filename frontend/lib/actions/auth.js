'use server';

import { apiFetch } from '@/utils/api';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { PostHog } from 'posthog-node';

export async function signUp(formData) {
  const email = formData.get('email');
  const password = formData.get('password');
  const name = formData.get('name');
  const role = formData.get('role');

  const { data, error } = await apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, name, role }),
  });

  if (error || data?.error) {
    return { error: error || data?.error };
  }

  if (data?.success && data?.data) {
    if (process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN) {
      const posthog = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN, {
        host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com'
      });
      posthog.capture({
        distinctId: data.data.id,
        event: 'user_signed_up',
        properties: { role: data.role, email }
      });
      await posthog.shutdown();
    }
    return { success: true, role: data.role };
  }

  return { error: 'Failed to sign up' };
}

export async function signIn(formData) {
  const email = formData.get('email');
  const password = formData.get('password');

  const { data, error } = await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  if (error || data?.error) {
    return { error: error || data?.error };
  }

  if (data?.success && data?.data) {
    if (process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN) {
      const posthog = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN, {
        host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com'
      });
      posthog.capture({
        distinctId: data.data.id,
        event: 'user_logged_in',
        properties: { role: data.role }
      });
      await posthog.shutdown();
    }
    return { success: true, role: data.role };
  }

  return { error: 'Failed to sign in' };
}

export async function signOut() {
  await apiFetch('/auth/logout', { method: 'POST' });
  
  const cookieStore = await cookies();
  const isProd = process.env.NODE_ENV === 'production';

  // Must use set() with maxAge=0 + matching domain instead of delete()
  // delete() omits the domain attribute, so the browser ignores it for
  // cookies set with domain=.provn.live
  const clearOpts = {
    value: '',
    maxAge: 0,
    path: '/',
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    ...(isProd ? { domain: '.provn.live' } : {}),
  };

  cookieStore.set({ name: 'provn_access', ...clearOpts });
  cookieStore.set({ name: 'provn_refresh', ...clearOpts });
  // Note: navigation is handled client-side in Navbar after this resolves
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const hasToken = !!cookieStore.get('provn_access')?.value;

  const { data, error, response } = await apiFetch('/auth/me', { method: 'GET', cache: 'no-store' });

  // If we had a token but the backend rejected it (401), clear stale cookies
  // This prevents the middleware from thinking we're logged in on the next request
  if (hasToken && (error || !data || data.error || response?.status === 401)) {
    cookieStore.delete('provn_access');
    cookieStore.delete('provn_refresh');
    return null;
  }

  if (error || !data || data.error) return null;

  // Expected: { data: userObject }
  if (data?.data) {
    return {
      id: data.data.id,
      email: data.data.email,
      profile: {
        id: data.data.id,
        email: data.data.email,
        name: data.data.name || 'User',
        role: data.data.role || 'student',
        subscription_tier: data.data.subscription_tier || 'free',
        branch: data.data.branch,
        interests: data.data.interests,
        current_roadmap_id: data.data.current_roadmap_id,
        company_name: data.data.company_name,
        avatar_url: data.data.avatar_url
      }
    };
  }
  return null;
}

export async function updateProfile(formData) {
  const name = formData.get('name');
  const branch = formData.get('branch');
  const interests = formData.get('interests');

  const { data, error } = await apiFetch('/auth/profile', {
    method: 'PUT',
    body: JSON.stringify({ name, branch, interests }),
  });

  if (error || data?.error) return { error: error || data?.error };
  return { success: true };
}

export async function updateOnboarding({ branch, interests, currentRoadmapId, orgName }) {
  const { data, error } = await apiFetch('/auth/onboarding', {
    method: 'PUT',
    body: JSON.stringify({ branch, interests, currentRoadmapId, orgName }),
  });

  if (error || data?.error) return { error: error || data?.error };
  return { success: true };
}

export async function upgradeToPro() {
  const { data, error } = await apiFetch('/auth/upgrade', {
    method: 'PUT'
  });

  if (error || data?.error) return { error: error || data?.error };
  return { success: true };
}
