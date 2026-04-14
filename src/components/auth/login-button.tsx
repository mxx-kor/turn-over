'use client';

import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export function LoginButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const supabase = createClient();

  const handleLogin = async () => {
    setIsLoading(true);
    setErrorMsg(null);

    try {
      if (typeof window !== 'undefined' && window.electron?.isElectron) {
        // In Electron, open Google sign-in in the system browser so platform
        // authenticators (passkeys, Touch ID, etc.) work natively.
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: 'http://localhost:3000/auth/callback?via=electron',
            skipBrowserRedirect: true,
          },
        });

        if (error) {
          setErrorMsg(error.message);
          setIsLoading(false);
          return;
        }

        if (!data.url) {
          setErrorMsg('No URL returned from Supabase — check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
          setIsLoading(false);
          return;
        }

        window.electron.openExternalAuth(data.url);
        // Keep isLoading=true — shows "Waiting..." until deep-link returns.
      } else {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/auth/callback`,
          },
        });

        if (error) {
          setErrorMsg(error.message);
          setIsLoading(false);
        }
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : String(err));
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm space-y-2">
      <Button
        onClick={handleLogin}
        disabled={isLoading}
        size="lg"
        className="w-full font-medium">
        {isLoading ? 'Waiting for browser...' : 'Continue with Google'}
      </Button>
      {errorMsg && (
        <p className="text-sm text-red-500 text-center break-words">{errorMsg}</p>
      )}
    </div>
  );
}
