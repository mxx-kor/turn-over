'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { translateText, getTargetLang } from '@/lib/translate';
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
import { Switch } from '@/components/ui/switch';
import { Plus, Wand2 } from 'lucide-react';

const AUTO_TRANSLATE_KEY = 'autoTranslate_enabled';

export function CreateCardDialog({ folderId }: { folderId: string }) {
  const [open, setOpen] = useState(false);
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [autoTranslated, setAutoTranslated] = useState(false);
  const [autoTranslateEnabled, setAutoTranslateEnabled] = useState(() => {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem(AUTO_TRANSLATE_KEY) !== 'false';
  });

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortController = useRef<AbortController | null>(null);
  const backEditedByUser = useRef(false);

  const router = useRouter();
  const supabase = createClient();

  function cancelTranslation() {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    if (abortController.current) abortController.current.abort();
    setTranslating(false);
  }

  function toggleAutoTranslate() {
    const next = !autoTranslateEnabled;
    setAutoTranslateEnabled(next);
    localStorage.setItem(AUTO_TRANSLATE_KEY, String(next));
    if (!next) {
      cancelTranslation();
      setAutoTranslated(false);
    }
  }

  // Auto-translate front → back with debounce
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    if (!autoTranslateEnabled || !front.trim() || backEditedByUser.current) return;

    debounceTimer.current = setTimeout(async () => {
      abortController.current = new AbortController();
      setTranslating(true);
      setAutoTranslated(false);
      try {
        const targetLang = getTargetLang();
        const translated = await translateText(front.trim(), targetLang, abortController.current.signal);
        setBack(translated);
        setAutoTranslated(true);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          // 번역 실패 시 조용히 무시
        }
      } finally {
        setTranslating(false);
      }
    }, 900);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [front, autoTranslateEnabled]);

  const handleOpenChange = (value: boolean) => {
    setOpen(value);
    if (!value) {
      cancelTranslation();
      setFront('');
      setBack('');
      backEditedByUser.current = false;
      setAutoTranslated(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!front.trim()) return;

    setIsLoading(true);

    const { error } = await supabase.from('cards').insert([
      {
        folder_id: folderId,
        front: front.trim(),
        back: back.trim(),
      },
    ]);

    setIsLoading(false);
    if (!error) {
      handleOpenChange(false);
      router.refresh();
    } else {
      console.error('Failed to create card:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Card
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-106.25">
        <form onSubmit={handleCreate}>
          <DialogHeader>
            <DialogTitle>Add a flashcard</DialogTitle>
            <DialogDescription>
              Create a new flashcard in this folder.
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
                autoFocus
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <div className="flex flex-col items-end gap-2 pt-2">
                <Label htmlFor="back">Back</Label>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-muted-foreground">Auto</span>
                  <Switch
                    checked={autoTranslateEnabled}
                    onCheckedChange={toggleAutoTranslate}
                    aria-label="Toggle auto-translate"
                  />
                </div>
              </div>
              {translating ? (
                <div className="col-span-3 h-9 rounded-md border border-input bg-muted/30 px-3 py-2 flex items-center gap-2">
                  <div className="h-2 w-2/3 rounded-full bg-muted animate-pulse" />
                </div>
              ) : (
                <div className="col-span-3 flex flex-col gap-1">
                  <Input
                    id="back"
                    value={back}
                    onChange={(e) => {
                      setBack(e.target.value);
                      backEditedByUser.current = true;
                      setAutoTranslated(false);
                    }}
                    placeholder="Answer or definition..."
                    disabled={isLoading}
                  />
                  {autoTranslated && autoTranslateEnabled && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Wand2 className="w-3 h-3" />
                      Auto-translated
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              disabled={isLoading || translating || !front.trim()}>
              {isLoading ? 'Saving...' : 'Add Card'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
