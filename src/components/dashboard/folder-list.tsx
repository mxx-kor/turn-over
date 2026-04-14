'use client';

import { Folder } from '@/store/useStore';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Trash2, FolderOpen } from 'lucide-react';
import { useState } from 'react';
import { EditFolderDialog } from '@/components/dashboard/edit-folder-dialog';

export function FolderList({ initialFolders }: { initialFolders: Folder[] }) {
  const router = useRouter();
  const supabase = createClient();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (
      !confirm('Are you sure you want to delete this folder and all its cards?')
    )
      return;

    setIsDeleting(id);
    await supabase.from('folders').delete().eq('id', id);
    setIsDeleting(null);
    router.refresh();
  };

  const navigateToFolder = (id: string) => {
    router.push(`/folder/${id}`);
  };

  if (initialFolders.length === 0) {
    return (
      <div className="text-center py-20 border-2 border-dashed rounded-xl border-zinc-200 dark:border-zinc-800">
        <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
          No folders yet
        </h3>
        <p className="mt-1 text-zinc-500">
          Get started by creating a new flashcard folder.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transform-gpu">
      {initialFolders.map((folder) => (
        <Card
          key={folder.id}
          className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 relative overflow-hidden"
          onClick={() => navigateToFolder(folder.id)}>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FolderOpen className="w-5 h-5 text-indigo-500" />
              <span className="truncate">{folder.name}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {folder.description && (
              <p className="text-sm text-zinc-700 dark:text-zinc-300 mb-2 line-clamp-2">
                {folder.description}
              </p>
            )}
            <p className="text-xs text-zinc-500">
              Created {new Date(folder.created_at).toLocaleDateString()}
            </p>
          </CardContent>
          <CardFooter className="justify-end space-x-2 pt-2 pb-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <EditFolderDialog folder={folder} />
            <Button
              size="icon"
              variant="outline"
              className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
              onClick={(e) => handleDelete(folder.id, e)}
              disabled={isDeleting === folder.id}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
