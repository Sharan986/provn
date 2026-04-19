'use client';

import { useEffect } from 'react';
import posthog from 'posthog-js';
import { PostHogProvider as PHProvider } from 'posthog-js/react';
import { ToastProvider } from '@/components/ToastContext';
import ErrorBoundary from '@/components/ErrorBoundary';

export default function Providers({ children }) {
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN) {
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
        defaults: '2026-01-30'
      });
    }
  }, []);

  return (
    <ErrorBoundary>
      <PHProvider client={posthog}>
        <ToastProvider>
          <div className="app-container">
            {children}
          </div>
        </ToastProvider>
      </PHProvider>
    </ErrorBoundary>
  );
}
