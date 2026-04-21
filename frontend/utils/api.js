'use server';

import { cookies } from 'next/headers';

const isProd = process.env.NODE_ENV === 'production';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || (isProd ? 'https://api.provn.live' : 'http://localhost:3000');

/**
 * A server-side fetch wrapper that automatically forwards the provn_access 
 * and provn_refresh cookies to the Express backend.
 */
export async function apiFetch(endpoint, options = {}) {
  const cookieStore = await cookies();
  const provn_access = cookieStore.get('provn_access')?.value;
  const provn_refresh = cookieStore.get('provn_refresh')?.value;

  const headers = new Headers(options.headers || {});
  
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const cookieStringProps = [];
  if (provn_access) cookieStringProps.push(`provn_access=${provn_access}`);
  if (provn_refresh) cookieStringProps.push(`provn_refresh=${provn_refresh}`);
  
  if (cookieStringProps.length > 0) {
    headers.set('Cookie', cookieStringProps.join('; '));
  }

  const baseUrl = API_BASE_URL.replace(/\/+$/, '');
  const url = `${baseUrl}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers
    });

    // Extract potential cookies returned by backend (e.g. during auth login/refresh)
    // Next.js actions might not strictly need to forward them if the browser already gets them?
    // Wait, since this is a server-to-server call, the browser WON'T get the backend's Set-Cookie header automatically.
    // The server action MUST read the 'set-cookie' from backend response and pass it to Next.js cookies API.
    const setCookieHeaders = response.headers.getSetCookie();
    if (setCookieHeaders && setCookieHeaders.length > 0) {
      for (const cookieHeader of setCookieHeaders) {
        // Simple manual parse of cookie string to set it back in Next.js config
        const parts = cookieHeader.split(';');
        const [nameValue, ...rest] = parts;
        const indexOfEquals = nameValue.indexOf('=');
        const name = nameValue.slice(0, indexOfEquals);
        const value = nameValue.slice(indexOfEquals + 1);
        
        let maxAge, path, httpOnly, secure, sameSite;
        for (const p of rest) {
          const part = p.trim().toLowerCase();
          if (part.startsWith('max-age=')) maxAge = parseInt(part.split('=')[1]);
          if (part.startsWith('path=')) path = part.split('=')[1];
          if (part === 'httponly') httpOnly = true;
          if (part === 'secure') secure = true;
          if (part.startsWith('samesite=')) sameSite = part.split('=')[1];
        }

        // Apply it using the native Next.js server cookie store
        // Note: don't forward 'domain' — the Next.js server sets cookies on its
        // own response to the browser; domain is handled by the browser automatically.
        cookieStore.set({
          name: name.trim(),
          value: value.trim(),
          maxAge,
          path: path || '/',
          httpOnly,
          secure,
          sameSite
        });
      }
    }

    const isJson = response.headers.get('content-type')?.includes('application/json');
    let data = null;
    try {
      data = isJson ? await response.json() : await response.text();
    } catch(e) { /* swallow parsing errors */ }

    return { response, data };
  } catch (error) {
    console.error(`apiFetch error for ${endpoint}:`, error);
    return { error: 'Network configuration error or backend is unreachable' };
  }
}
