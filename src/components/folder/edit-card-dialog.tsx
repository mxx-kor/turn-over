'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Edit2 } from 'lucide-react';
import { Card as CardType } from '@/store/useStore';

export function EditCardDialog({ card }: { card: CardType }) {
  const [open, setOpen] = useState(false);
  const [front, setFront] = useState(card.front);
  const [back, setBack] = useState(card.back);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!front.trim() || !back.trim()) return;

    setIsLoading(true);

    const { error } = await supabase
      .from('cards')
      .update({
        front: front.trim(),
        back: back.trim(),
      })
      .eq('id', card.id);

    setIsLoading(false);
    if (!error) {
      setOpen(false);
      router.refresh();
    } else {
      console.error('Failed to update card:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 font-medium h-8">
          <Edit2 className="w-4 h-4 mr-2" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-106.25">
        <form onSubmit={handleEdit}>
          <DialogHeader>
            <DialogTitle>Edit flashcard</DialogTitle>
            <DialogDescription>
              Make changes to your flashcard.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="front" className="text-right">
                Front
              </Label>
              <Input
                id="front"
                value={front}
                onChange={(e) => setFront(e.target.value)}
                className="col-span-3"
                placeholder="Question or term..."
                required
                disabled={isLoading}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="back" className="text-right">
                Back
              </Label>
              <Input
                id="back"
                value={back}
                onChange={(e) => setBack(e.target.value)}
                className="col-span-3"
                placeholder="Answer or definition..."
                required
                disabled={isLoading}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              disabled={
                isLoading ||
                !front.trim() ||
                !back.trim() ||
                (front === card.front && back === card.back)
              }>
              {isLoading ? 'Saving...' : 'Save changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
