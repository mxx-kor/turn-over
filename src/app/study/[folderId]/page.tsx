import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { StudySession } from '@/components/study/study-session';

export default async function StudyPage({
  params,
}: {
  params: Promise<{ folderId: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/');
  }

  const resolvedParams = await params;
  const folderId = resolvedParams.folderId;

  // Fetch folder
  const { data: folder } = await supabase
    .from('folders')
    .select('name')
    .eq('id', folderId)
    .single();

  // Fetch cards
  const { data: cards, error } = await supabase
    .from('cards')
    .select('*')
    .eq('folder_id', folderId);

  if (error || !cards || cards.length === 0) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-8 text-center">
        <h1 className="text-2xl font-bold">No cards to study</h1>
        <Button asChild className="mt-4" variant="outline">
          <Link href={`/folder/${folderId}`}>Go Back</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans flex flex-col">
      <Navbar email={user.email} />

      <main className="flex-1 flex flex-col p-6">
        <div className="w-full max-w-2xl mx-auto flex items-center justify-between mb-8">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/folder/${folderId}`}>
              <ChevronLeft className="w-4 h-4 mr-2" />
              Exit Study
            </Link>
          </Button>
          <span className="font-medium text-zinc-500">{folder?.name}</span>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <StudySession initialCards={cards} />
        </div>
      </main>
    </div>
  );
}
