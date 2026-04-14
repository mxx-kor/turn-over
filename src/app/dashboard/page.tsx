import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { CreateFolderDialog } from '@/components/dashboard/create-folder-dialog';
import { FolderList } from '@/components/dashboard/folder-list';

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/');
  }

  // Fetch folders directly from Supabase
  const { data: folders, error } = await supabase
    .from('folders')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans">
      <Navbar email={user.email} />

      <main className="max-w-5xl mx-auto p-6 md:p-8 space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Your Folders</h1>
            <p className="text-zinc-500 dark:text-zinc-400">
              Manage your flashcard collections.
            </p>
          </div>
          <CreateFolderDialog />
        </div>

        {error ? (
          <div className="p-4 bg-red-50 text-red-600 rounded-md">
            Error loading folders. Please ensure your database is set up.
            <pre className="text-xs mt-2 overflow-auto">{error.message}</pre>
          </div>
        ) : (
          <FolderList initialFolders={folders || []} />
        )}
      </main>
    </div>
  );
}
