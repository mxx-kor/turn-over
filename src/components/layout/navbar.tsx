'use client';

import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

export function Navbar({ email }: { email?: string }) {
  const supabase = createClient();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  return (
    <nav className="drag-region border-b bg-white dark:bg-black p-4">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="font-bold text-xl tracking-tight">Turn-over</span>
        </div>
        <div className="no-drag flex items-center space-x-4">
          <ThemeToggle />
          {email && <span className="text-sm text-zinc-500">{email}</span>}
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </nav>
  );
}
