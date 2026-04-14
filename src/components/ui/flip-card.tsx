'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface FlipCardProps {
  frontContent: React.ReactNode;
  backContent: React.ReactNode;
  className?: string;
}

export function FlipCard({
  frontContent,
  backContent,
  className,
}: FlipCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div
      className={cn(
        'relative w-full h-full cursor-pointer perspective-[1000px]',
        className,
      )}
      onClick={() => setIsFlipped(!isFlipped)}>
      <motion.div
        className="w-full h-full relative transform-3d"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{
          duration: 0.6,
          type: 'spring',
          stiffness: 260,
          damping: 20,
        }}>
        {/* Front Side */}
        <div className="absolute inset-0 w-full h-full backface-hidden bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center p-6">
          {frontContent}
        </div>

        {/* Back Side */}
        <div className="absolute inset-0 w-full h-full backface-hidden bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center p-6 transform-[rotateY(180deg)]">
          {backContent}
        </div>
      </motion.div>
    </div>
  );
}
