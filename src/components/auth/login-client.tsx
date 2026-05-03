'use client';

import Link from 'next/link';
import { useSyncExternalStore } from 'react';
import { ArrowLeft } from 'lucide-react';
import { LoginButton } from '@/components/auth/login-button';

const subscribe = () => () => {};
const getIsElectron = () => !!window.electron?.isElectron;
const getServerSnapshot = () => false;

export function LoginClient() {
  const isElectron = useSyncExternalStore(
    subscribe,
    getIsElectron,
    getServerSnapshot,
  );

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 p-8 shadow-sm">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">Sign in to Turn-over</h1>
          <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
            Continue with your Google account to access your cards and study sessions.
          </p>
        </div>

        <LoginButton />

        <p className="mt-6 text-xs text-zinc-400 dark:text-zinc-500">
          Authentication is handled via Google OAuth.
        </p>
      </div>

      {!isElectron && (
        <div className="mt-6 flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
          <ArrowLeft className="w-4 h-4" />
          <Link href="/" className="underline hover:text-zinc-900 dark:hover:text-zinc-100">
            Back to landing page
          </Link>
        </div>
      )}
    </main>
  );
}
