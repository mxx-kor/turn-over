'use client';

import { useState } from 'react';
import { Card as CardType } from '@/store/useStore';
import { TiltedCard } from '@/components/ui/tilted-card';
import { FlipCard } from '@/components/ui/flip-card';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Shuffle,
  ArrowDownAZ,
  ArrowUpZA,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function StudySession({ initialCards }: { initialCards: CardType[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [order, setOrder] = useState<'forward' | 'backward' | 'random'>(
    'forward',
  );

  const orderedCards =
    order === 'forward'
      ? initialCards
      : order === 'backward'
        ? [...initialCards].reverse()
        : shuffleArray(initialCards);

  const handleOrderChange = (newOrder: 'forward' | 'backward' | 'random') => {
    setOrder(newOrder);
    setCurrentIndex(0);
  };

  const handleNext = () => {
    // Move forward normally, but when we're on the last card,
    // advance the index one step past the end so `isFinished` becomes true.
    if (currentIndex < orderedCards.length - 1) {
      setCurrentIndex((curr) => curr + 1);
      return;
    }

    if (currentIndex === orderedCards.length - 1) {
      setCurrentIndex(orderedCards.length);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((curr) => curr - 1);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
  };

  const isFinished = currentIndex >= orderedCards.length;

  if (orderedCards.length === 0) return null;

  // We ensure the index doesn't go completely out of bounds for rendering the card
  const safeIndex = Math.min(currentIndex, orderedCards.length - 1);
  const currentCard = orderedCards[safeIndex];

  // To prevent severe performance degradation when there are too many items (e.g., 100,000+ cards),
  // we use a continuous progress bar instead of individual nodes if the number is large.
  const isLargeSet = orderedCards.length > 50;

  return (
    <div className="w-full max-w-md flex flex-col items-center">
      {/* Order Controls */}
      <div className="flex justify-end gap-0.5 w-full items-center mb-6">
        <Button
          variant={order === 'forward' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleOrderChange('forward')}>
          <ArrowDownAZ className="size-4" />
        </Button>
        <Button
          variant={order === 'backward' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleOrderChange('backward')}>
          <ArrowUpZA className="size-4" />
        </Button>
        <Button
          variant={order === 'random' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleOrderChange('random')}>
          <Shuffle className="size-4" />
        </Button>
      </div>

      <div className="w-full flex justify-between items-center mb-8 text-sm font-medium text-zinc-500">
        <span>
          Card {safeIndex + 1} of {orderedCards.length}
        </span>
        <div className="flex gap-1 flex-1 ml-4 justify-end">
          {isLargeSet ? (
            <div className="h-1.5 w-full max-w-[200px] bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 transition-all duration-300 ease-out"
                style={{
                  width: `${(safeIndex / (orderedCards.length - 1 || 1)) * 100}%`,
                }}
              />
            </div>
          ) : (
            orderedCards.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 w-4 rounded-full transition-colors ${
                  idx === currentIndex
                    ? 'bg-indigo-600'
                    : idx < currentIndex
                      ? 'bg-indigo-200 dark:bg-indigo-900/40'
                      : 'bg-zinc-200 dark:bg-zinc-800'
                }`}
              />
            ))
          )}
        </div>
      </div>

      <div className="relative w-full aspect-3/4 max-h-[60vh]">
        <AnimatePresence mode="wait">
          {!isFinished ? (
            <motion.div
              key={currentCard.id || currentIndex}
              initial={{ opacity: 0, x: 50, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -50, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="w-full h-full">
              <TiltedCard>
                <FlipCard
                  frontContent={
                    <div className="text-center">
                      <p className="text-sm font-semibold text-zinc-400 uppercase tracking-widest mb-4">
                        Front
                      </p>
                      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-zinc-900 dark:text-zinc-50 leading-tight">
                        {currentCard.front}
                      </h2>
                    </div>
                  }
                  backContent={
                    <div className="text-center w-full h-full flex flex-col items-center justify-center">
                      <p className="text-sm font-semibold text-zinc-400 uppercase tracking-widest mb-4">
                        Back
                      </p>
                      <h2 className="text-xl sm:text-2xl font-serif text-zinc-800 dark:text-zinc-200 leading-relaxed max-w-[90%] break-words">
                        {currentCard.back}
                      </h2>
                    </div>
                  }
                  className="rounded-2xl"
                />
              </TiltedCard>
            </motion.div>
          ) : (
            <motion.div
              key="finished"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full h-full flex flex-col items-center justify-center text-center space-y-6">
              <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 text-green-500 rounded-full flex items-center justify-center">
                <svg
                  className="w-12 h-12"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2">Session Complete!</h2>
                <p className="text-zinc-500">
                  You&apos;ve reviewed all cards in this folder.
                </p>
              </div>
              <Button onClick={handleRestart} variant="outline" size="lg">
                <RotateCcw className="w-4 h-4 mr-2" />
                Study Again
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-center space-x-4 mt-8 w-full">
        <Button
          variant="outline"
          size="lg"
          onClick={handlePrev}
          disabled={currentIndex === 0 || isFinished}
          className="flex-1 max-w-35">
          <ArrowLeft className="w-4 h-4 mr-2" /> Prev
        </Button>
        <Button
          size="lg"
          onClick={handleNext}
          disabled={isFinished}
          className="flex-1 max-w-35 bg-indigo-600 hover:bg-indigo-700 text-white">
          {currentIndex === orderedCards.length - 1 ? 'Finish' : 'Next'}{' '}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
