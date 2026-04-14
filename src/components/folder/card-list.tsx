'use client';

import { Card as CardType } from '@/store/useStore';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { EditCardDialog } from '@/components/folder/edit-card-dialog';

export function CardList({ initialCards }: { initialCards: CardType[] }) {
  const router = useRouter();
  const supabase = createClient();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this flashcard?')) return;

    setIsDeleting(id);
    await supabase.from('cards').delete().eq('id', id);
    setIsDeleting(null);
    router.refresh();
  };

  if (initialCards.length === 0) {
    return (
      <div className="text-center py-20 border-2 border-dashed rounded-xl border-zinc-200 dark:border-zinc-800">
        <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
          No cards yet
        </h3>
        <p className="mt-1 text-zinc-500">
          Create your first flashcard to start studying.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {initialCards.map((card) => (
        <Card
          key={card.id}
          className="group relative overflow-hidden flex flex-col justify-between">
          <div className="absolute inset-x-0 top-0 h-1 bg-zinc-200 dark:bg-zinc-800" />
          <CardHeader className="pb-2">
            <div className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
              Front
            </div>
            <p className="font-medium text-lg text-zinc-900 dark:text-zinc-100">
              {card.front}
            </p>
          </CardHeader>
          <CardContent className="pt-2 border-t border-dashed">
            <div className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
              Back
            </div>
            <p className="text-md text-zinc-700 dark:text-zinc-300">
              {card.back}
            </p>
          </CardContent>
          <CardFooter className="justify-end gap-2 pt-2 pb-4 opacity-0 group-hover:opacity-100 transition-opacity mt-2">
            <EditCardDialog card={card} />
            <Button
              size="sm"
              variant="outline"
              className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 font-medium h-8"
              onClick={(e) => handleDelete(card.id, e)}
              disabled={isDeleting === card.id}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
