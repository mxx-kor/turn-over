import { Suspense } from 'react';
import { QuickAddCardForm } from '@/components/popup/quick-add-card-form';

export default function PopupPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen bg-background">
          <p className="text-muted-foreground text-sm">Loading...</p>
        </div>
      }>
      <QuickAddCardForm />
    </Suspense>
  );
}
