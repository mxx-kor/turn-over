import { createClient } from '@/lib/supabase/server';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { LandingPage } from '@/components/auth/landing-page';

export default async function Home() {
  const headersList = await headers();
  const userAgent = headersList.get('user-agent') ?? '';
  if (userAgent.includes('Electron')) {
    redirect('/login');
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect('/dashboard');
  }

  return (
    <main className="drag-region flex min-h-screen flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 px-4 py-12">
      <LandingPage />
    </main>
  );
}
