import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { CreateCardDialog } from '@/components/folder/create-card-dialog';
import { CardList } from '@/components/folder/card-list';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ChevronLeft, Play } from 'lucide-react';

export default async function FolderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/');
  }

  const resolvedParams = await params;
  const folderId = resolvedParams.id;

  // Fetch folder details
  const { data: folder, error: folderError } = await supabase
    .from('folders')
    .select('*')
    .eq('id', folderId)
    .single();

  if (folderError || !folder) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-8 text-center">
        <h1 className="text-2xl font-bold">Folder not found</h1>
        <Button asChild className="mt-4" variant="outline">
          <Link href="/dashboard">Return to Dashboard</Link>
        </Button>
      </div>
    );
  }

  // Fetch cards
  const { data: cards, error: cardsError } = await supabase
    .from('cards')
    .select('*')
    .eq('folder_id', folderId)
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans">
      <Navbar email={user.email} />

      <main className="max-w-5xl mx-auto p-6 md:p-8 space-y-8">
        <div className="flex items-center space-x-4 mb-8">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard">
              <ChevronLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div className="flex-1 space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">{folder.name}</h1>
            {folder.description && (
              <p className="text-zinc-700 dark:text-zinc-300">
                {folder.description}
              </p>
            )}
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {cards?.length || 0} cards in this folder
            </p>
          </div>

          <div className="flex space-x-3">
            <CreateCardDialog folderId={folder.id} />
            {(cards?.length ?? 0) > 0 && (
              <Button
                asChild
                className="bg-indigo-600 hover:bg-indigo-700 text-white">
                <Link href={`/study/${folder.id}`}>
                  <Play className="w-4 h-4 mr-2" fill="currentColor" />
                  Study Now
                </Link>
              </Button>
            )}
          </div>
        </div>

        {cardsError ? (
          <div className="p-4 bg-red-50 text-red-600 rounded-md">
            Error loading cards.
          </div>
        ) : (
          <CardList initialCards={cards || []} />
        )}
      </main>
    </div>
  );
}
