'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { X, CheckCircle2, Loader2, Wand2 } from 'lucide-react';
import { translateText, getTargetLang } from '@/lib/translate';
import { Switch } from '@/components/ui/switch';

const AUTO_TRANSLATE_KEY = 'autoTranslate_enabled';

interface Folder {
  id: string;
  name: string;
  created_at: string;
}

export function QuickAddCardForm() {
  const searchParams = useSearchParams();
  const initialText = searchParams.get('text') ?? '';

  const [front, setFront] = useState(initialText);
  const [back, setBack] = useState('');
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [autoTranslated, setAutoTranslated] = useState(false);
  const [autoTranslateEnabled, setAutoTranslateEnabled] = useState(() => {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem(AUTO_TRANSLATE_KEY) !== 'false';
  });

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortController = useRef<AbortController | null>(null);
  const backEditedByUser = useRef(false);

  const supabase = useMemo(() => createClient(), []);

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

  const loadFolders = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError('Login required. Please log in from the main app window.');
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('folders')
        .select('id, name, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        setFolders(data);
        const lastFolderId = localStorage.getItem('quickAdd_lastFolderId');
        const remembered = lastFolderId && data.find((f) => f.id === lastFolderId);
        setSelectedFolderId(remembered ? lastFolderId : data[0].id);
      } else {
        setError('No folders found. Please create a folder in the app first.');
      }
    } catch {
      setError('Failed to load folders.');
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    loadFolders();

    if (typeof window !== 'undefined' && window.electron) {
      window.electron.onUpdateSelectedText((text: string) => {
        setFront(text);
        setBack('');
        backEditedByUser.current = false;
        setAutoTranslated(false);
        setSuccess(false);
        setError('');
      });
    }
  }, [loadFolders]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!front.trim() || !selectedFolderId) return;

    setSaving(true);
    setError('');

    try {
      const { error } = await supabase.from('cards').insert({
        folder_id: selectedFolderId,
        front: front.trim(),
        back: back.trim(),
      });

      if (error) throw error;

      localStorage.setItem('quickAdd_lastFolderId', selectedFolderId);
      setSuccess(true);
      setTimeout(() => {
        closePopup();
      }, 1200);
    } catch {
      setError('Failed to save card.');
    } finally {
      setSaving(false);
    }
  }

  function closePopup() {
    if (typeof window !== 'undefined' && window.electron) {
      window.electron.closePopup();
    } else {
      window.close();
    }
  }

  return (
    <div className="flex flex-col h-screen bg-background text-foreground select-none">
      {/* Draggable title bar */}
      <div className="drag-region flex items-center justify-between px-4 py-3 border-b border-border bg-muted/50">
        <span className="text-sm font-semibold">Quick Add Card</span>
        <button
          onClick={closePopup}
          className="no-drag rounded-md p-1 hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
          aria-label="Close">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : success ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
            <CheckCircle2 className="w-12 h-12 text-green-500" />
            <p className="font-semibold">Card added!</p>
          </div>
        ) : error && folders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
            <p className="text-sm text-muted-foreground">{error}</p>
            <button
              onClick={closePopup}
              className="text-sm underline text-muted-foreground hover:text-foreground">
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Folder selector */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Folder
              </label>
              <select
                value={selectedFolderId}
                onChange={(e) => {
                  setSelectedFolderId(e.target.value);
                  localStorage.setItem('quickAdd_lastFolderId', e.target.value);
                }}
                className="no-drag w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                disabled={saving}>
                {folders.map((folder) => (
                  <option key={folder.id} value={folder.id}>
                    {folder.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Front */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Front
              </label>
              <textarea
                value={front}
                onChange={(e) => setFront(e.target.value)}
                className="no-drag w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 resize-none"
                rows={3}
                placeholder="Enter a word or question..."
                disabled={saving}
                autoFocus
              />
            </div>

            {/* Back */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Back
                </label>
                <div className="flex items-center gap-2">
                  {autoTranslated && !translating && autoTranslateEnabled && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Wand2 className="w-3 h-3" />
                      Auto-translated
                    </span>
                  )}
                  <div className="no-drag flex items-center gap-1.5">
                    <span className="text-xs text-muted-foreground">Auto</span>
                    <Switch
                      checked={autoTranslateEnabled}
                      onCheckedChange={toggleAutoTranslate}
                      aria-label="Toggle auto-translate"
                    />
                  </div>
                </div>
              </div>

              {translating ? (
                <div className="w-full rounded-md border border-input bg-muted/30 px-3 py-2 h-19 flex flex-col justify-center gap-2">
                  <div className="h-2.5 w-3/4 rounded-full bg-muted animate-pulse" />
                  <div className="h-2.5 w-1/2 rounded-full bg-muted animate-pulse" />
                </div>
              ) : (
                <textarea
                  value={back}
                  onChange={(e) => {
                    setBack(e.target.value);
                    backEditedByUser.current = true;
                    setAutoTranslated(false);
                  }}
                  className="no-drag w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 resize-none"
                  rows={3}
                  placeholder="Enter the answer or explanation... (can be filled in later)"
                  disabled={saving}
                />
              )}
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            {/* Actions */}
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={closePopup}
                className="no-drag flex-1 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
                disabled={saving}>
                Cancel
              </button>
              <button
                type="submit"
                className="no-drag flex-1 rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                disabled={saving || translating || !front.trim() || !selectedFolderId}>
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Done'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
