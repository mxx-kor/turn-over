'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Monitor, Globe, ChevronLeft, Download } from 'lucide-react';
import { LoginButton } from '@/components/auth/login-button';
import { HowItWorksDemo } from '@/components/auth/how-it-works-demo';

type Step = 'select' | 'login';
type Platform = 'desktop' | 'web';

const DOWNLOAD_URL =
  process.env.NEXT_PUBLIC_DESKTOP_DOWNLOAD_URL ??
  'https://github.com/mxx-kor/turn-over/releases';

export function LandingPage() {
  const [step, setStep] = useState<Step>('select');
  const [platform, setPlatform] = useState<Platform | null>(null);

  const handleSelect = (p: Platform) => {
    if (p === 'desktop') {
      // 다운로드 시작 후 로그인 화면으로 이동 (다운로드 중 로그인 가능)
      const link = document.createElement('a');
      link.href = DOWNLOAD_URL;
      link.download = '';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    setPlatform(p);
    setStep('login');
  };

  const handleBack = () => {
    setStep('select');
    setPlatform(null);
  };

  return (
    <div className="no-drag relative w-full max-w-md text-center mx-auto">
      <AnimatePresence mode="wait">
        {step === 'select' ? (
          <motion.div
            key="select"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="space-y-10">
            {/* Hero */}
            <div className="space-y-3">
              <h1 className="text-5xl font-extrabold tracking-tight lg:text-6xl text-zinc-900 dark:text-zinc-50">
                Turn-over
              </h1>
              <p className="text-lg text-zinc-500 dark:text-zinc-400">
                A beautiful flashcard experience for your daily learning.
              </p>
            </div>

            {/* How it works demo */}
            <HowItWorksDemo />

            {/* Platform selection */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">
                Get started
              </p>
              <div className="grid grid-cols-2 gap-3">
                <PlatformCard
                  icon={<Download className="w-6 h-6" />}
                  title="Desktop App"
                  description="Download for macOS (Apple Silicon)"
                  onClick={() => handleSelect('desktop')}
                />
                <PlatformCard
                  icon={<Globe className="w-6 h-6" />}
                  title="Use on Web"
                  description="Start instantly in your browser"
                  onClick={() => handleSelect('web')}
                />
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="login"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="space-y-8">
            {/* Back button */}
            <div className="flex items-center">
              <button
                onClick={handleBack}
                className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
            </div>

            {/* Header */}
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2 text-zinc-400 dark:text-zinc-500">
                {platform === 'desktop' ? (
                  <Monitor className="w-5 h-5" />
                ) : (
                  <Globe className="w-5 h-5" />
                )}
                <span className="text-sm font-medium">
                  {platform === 'desktop'
                    ? 'Your download is starting — sign in while you wait'
                    : 'Continue with the web version'}
                </span>
              </div>
              <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                Sign in
              </h2>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm">
                Continue with your Google account
              </p>
            </div>

            {/* Login */}
            <div className="flex flex-col items-center space-y-4">
              <LoginButton />
              <p className="text-xs text-zinc-400 dark:text-zinc-500 w-full max-w-xs">
                By signing in, you agree to our Terms of Service and Privacy
                Policy. Authentication is handled via Google OAuth.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface PlatformCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}

function PlatformCard({
  icon,
  title,
  description,
  onClick,
}: PlatformCardProps) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      className="group flex flex-col items-center gap-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 cursor-pointer hover:border-zinc-400 dark:hover:border-zinc-600 hover:shadow-lg dark:hover:shadow-zinc-950/50 transition-all duration-200">
      <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 group-hover:bg-zinc-900 group-hover:text-white dark:group-hover:bg-zinc-100 dark:group-hover:text-zinc-900 transition-colors duration-200">
        {icon}
      </div>
      <div className="text-center">
        <p className="font-semibold text-zinc-900 dark:text-zinc-50 text-sm">
          {title}
        </p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
          {description}
        </p>
      </div>
    </motion.button>
  );
}
