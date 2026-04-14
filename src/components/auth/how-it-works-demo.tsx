'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Wand2 } from 'lucide-react';

const DEMO_ITEMS = [
    {
        pre: 'The process of ',
        word: 'photosynthesis',
        post: ' occurs in chloroplasts, converting sunlight into glucose.',
        translation: '광합성',
    },
    {
        pre: 'Water moves via ',
        word: 'osmosis',
        post: ' across semi-permeable membranes to balance solute levels.',
        translation: '삼투압',
    },
    {
        pre: 'The ',
        word: 'mitochondria',
        post: ' generate ATP through cellular respiration to power the cell.',
        translation: '미토콘드리아',
    },
];

type Phase = 'idle' | 'highlight' | 'shortcut' | 'popup' | 'translated' | 'success' | 'fadeout';

// [phase, duration in ms]
const SEQUENCE: [Phase, number][] = [
    ['idle', 600],
    ['highlight', 750],
    ['shortcut', 850],
    ['popup', 950],
    ['translated', 700],
    ['success', 1100],
    ['fadeout', 500],
];

export function HowItWorksDemo() {
    const [phase, setPhase] = useState<Phase>('idle');
    const [wordIdx, setWordIdx] = useState(0);

    useEffect(() => {
        let phaseIdx = 0;
        let timerId: ReturnType<typeof setTimeout>;

        const step = () => {
            phaseIdx = (phaseIdx + 1) % SEQUENCE.length;
            const [nextPhase, duration] = SEQUENCE[phaseIdx];
            setPhase(nextPhase);
            if (nextPhase === 'idle') {
                setWordIdx((prev) => (prev + 1) % DEMO_ITEMS.length);
            }
            timerId = setTimeout(step, duration);
        };

        timerId = setTimeout(step, SEQUENCE[0][1]);
        return () => clearTimeout(timerId);
    }, []);

    const item = DEMO_ITEMS[wordIdx];
    const showUnderline = ['highlight', 'shortcut', 'popup', 'translated', 'success'].includes(phase);
    const showShortcut = ['shortcut', 'popup', 'translated', 'success'].includes(phase);
    const showPopup = ['popup', 'translated', 'success'].includes(phase);
    const showSkeleton = phase === 'popup';
    const showTranslation = ['translated', 'success'].includes(phase);
    const isSuccess = phase === 'success';

    return (
        <div className="space-y-1.5">
            {/* Section label */}
            <p className="text-center text-[11px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                How it works
            </p>

            {/* Document card */}
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
                {/* Mac window chrome */}
                <div className="flex items-center gap-1.5 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-950/60 px-3 py-2">
                    <div className="h-2 w-2 rounded-full bg-red-400/70" />
                    <div className="h-2 w-2 rounded-full bg-yellow-400/70" />
                    <div className="h-2 w-2 rounded-full bg-green-400/70" />
                    <span className="ml-1.5 text-[10px] text-zinc-400">biology_notes.md</span>
                </div>

                {/* Text */}
                <div className="px-4 py-3 text-[13px] leading-relaxed text-zinc-600 dark:text-zinc-300">
                    <span>{item.pre}</span>

                    {/* Animated word */}
                    <span className="relative inline">
                        {/* selection bg */}
                        <AnimatePresence>
                            {showUnderline && (
                                <motion.span
                                    key={`bg-${wordIdx}`}
                                    className="absolute inset-y-0 -inset-x-0.5 rounded bg-blue-100 dark:bg-blue-500/20"
                                    initial={{ scaleX: 0, opacity: 0 }}
                                    animate={{ scaleX: 1, opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    style={{ transformOrigin: 'left' }}
                                    transition={{ duration: 0.28, ease: 'easeOut' }}
                                />
                            )}
                        </AnimatePresence>

                        {/* Word text */}
                        <span className="relative font-semibold text-zinc-900 dark:text-zinc-50">
                            {item.word}
                        </span>

                        {/* Underline draw */}
                        <AnimatePresence>
                            {showUnderline && (
                                <motion.span
                                    key={`ul-${wordIdx}`}
                                    className="absolute bottom-0 left-0 h-[2px] rounded-full bg-blue-500"
                                    initial={{ width: '0%' }}
                                    animate={{ width: '100%' }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.38, ease: 'easeOut' }}
                                />
                            )}
                        </AnimatePresence>
                    </span>

                    <span>{item.post}</span>
                </div>
            </div>

            {/* Shortcut area — fixed height so layout doesn't shift */}
            <div className="flex h-8 items-center justify-center">
                <AnimatePresence>
                    {showShortcut && (
                        <motion.div
                            key={`shortcut-${wordIdx}`}
                            className="flex items-center gap-1"
                            initial={{ opacity: 0, y: 6, scale: 0.8 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 22 }}
                        >
                            {['⌥', '⇧', 'A'].map((k) => (
                                <kbd
                                    key={k}
                                    className="inline-flex h-[22px] min-w-[22px] items-center justify-center rounded-md border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-1.5 text-[11px] font-semibold text-zinc-600 dark:text-zinc-300 shadow-[0_1px_2px_rgba(0,0,0,0.15)]"
                                >
                                    {k}
                                </kbd>
                            ))}
                            <span className="ml-1 text-[11px] text-zinc-400">press to save</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Popup area — fixed height */}
            <div className="h-37">
                <AnimatePresence>
                    {showPopup && (
                        <motion.div
                            key={`popup-${wordIdx}`}
                            className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl"
                            initial={{ opacity: 0, y: 10, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.96 }}
                            transition={{ duration: 0.24, ease: [0.32, 0.72, 0, 1] }}
                        >
                            {/* Popup titlebar */}
                            <div className="flex items-center border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-950/60 px-3 py-1.5">
                                <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
                                    Quick Add Card
                                </span>
                            </div>

                            {/* Popup body */}
                            <div className="flex flex-col gap-1.5 px-3 py-2.5">
                                {/* Front + Back fields */}
                                <div className="flex gap-2">
                                    {/* Front */}
                                    <div className="flex flex-col gap-1 flex-1">
                                        <span className="text-[9px] font-semibold uppercase tracking-widest text-zinc-400">Front</span>
                                        <div className="rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-2 py-1 text-[12px] font-medium text-zinc-800 dark:text-zinc-100">
                                            {item.word}
                                        </div>
                                    </div>

                                    {/* Back */}
                                    <div className="flex flex-col gap-1 flex-1">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[9px] font-semibold uppercase tracking-widest text-zinc-400">Back</span>
                                            <AnimatePresence>
                                                {showTranslation && (
                                                    <motion.span
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        className="flex items-center gap-0.5 text-[9px] text-zinc-400"
                                                    >
                                                        <Wand2 className="w-2.5 h-2.5" />
                                                        Auto
                                                    </motion.span>
                                                )}
                                            </AnimatePresence>
                                        </div>

                                        {/* Skeleton → translated text */}
                                        <div className="relative rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-2 py-1 h-6.5 overflow-hidden">
                                            <AnimatePresence mode="wait">
                                                {showSkeleton ? (
                                                    <motion.div
                                                        key="skeleton"
                                                        className="absolute inset-0 flex items-center px-2 gap-1.5"
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        exit={{ opacity: 0 }}
                                                        transition={{ duration: 0.15 }}
                                                    >
                                                        <div className="h-2 w-10 rounded-full bg-zinc-200 dark:bg-zinc-700 animate-pulse" />
                                                        <div className="h-2 w-6 rounded-full bg-zinc-200 dark:bg-zinc-700 animate-pulse" />
                                                    </motion.div>
                                                ) : (
                                                    <motion.span
                                                        key="translation"
                                                        className="absolute inset-0 flex items-center px-2 text-[12px] font-medium text-zinc-800 dark:text-zinc-100"
                                                        initial={{ opacity: 0, y: 4 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ duration: 0.2 }}
                                                    >
                                                        {item.translation}
                                                    </motion.span>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                </div>

                                {/* Done button */}
                                <div className="flex justify-end">
                                    <motion.div
                                        className={`rounded-lg px-3 py-1 text-[11px] font-semibold transition-colors ${
                                            isSuccess
                                                ? 'bg-green-500 text-white'
                                                : 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                                        }`}
                                        animate={isSuccess ? { scale: [1, 0.9, 1] } : {}}
                                        transition={{ duration: 0.18 }}
                                    >
                                        <AnimatePresence mode="wait">
                                            {isSuccess ? (
                                                <motion.span
                                                    key="saved"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    className="flex items-center gap-1"
                                                >
                                                    <CheckCircle2 className="h-3 w-3" />
                                                    Saved!
                                                </motion.span>
                                            ) : (
                                                <motion.span key="done">Done</motion.span>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
