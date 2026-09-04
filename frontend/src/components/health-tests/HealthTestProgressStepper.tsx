'use client';

import { motion } from 'framer-motion';
import { Check, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

const STAGE_LABELS: Array<{
  kind: 'start' | 'awareness' | 'evaluation' | 'result';
  label: string;
  shortLabel: string;
}> = [
  { kind: 'start', label: 'شروع', shortLabel: 'شروع' },
  { kind: 'awareness', label: 'شناخت', shortLabel: 'شناخت' },
  { kind: 'evaluation', label: 'بررسی', shortLabel: 'بررسی' },
  { kind: 'result', label: 'نتیجه', shortLabel: 'نتیجه' },
];

interface HealthTestProgressStepperProps {
  currentStageKind: 'start' | 'awareness' | 'evaluation' | 'result';
  stageProgress: number;
  progressPercentage: number;
  questionLabel: string;
  className?: string;
}

export default function HealthTestProgressStepper({
  currentStageKind,
  stageProgress,
  progressPercentage,
  questionLabel,
  className,
}: HealthTestProgressStepperProps) {
  const currentIndex = STAGE_LABELS.findIndex(s => s.kind === currentStageKind);
  const safeIndex = currentIndex === -1 ? 0 : currentIndex;

  return (
    <div
      className={cn(
        'w-full rounded-3xl bg-white border border-slate-100 shadow-sm p-4 sm:p-5 mb-6',
        className,
      )}
      aria-label="پیشرفت تست"
      role="region"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          {STAGE_LABELS.map((stage, idx) => {
            const isDone = idx < safeIndex;
            const isActive = idx === safeIndex;
            const CircleIcon = isDone ? Check : Circle;
            return (
              <div key={stage.kind} className="flex items-center gap-1.5">
                <div
                  className={cn(
                    'w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all',
                    isActive
                      ? 'bg-teal-600 text-white ring-4 ring-teal-500/20 shadow-md shadow-teal-500/10'
                      : isDone
                        ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/20'
                        : 'bg-slate-100 text-slate-400',
                  )}
                  aria-hidden="true"
                >
                  <CircleIcon size={isDone ? 14 : 10} strokeWidth={isDone ? 2.8 : 3.5} />
                </div>
                <span
                  className={cn(
                    'text-xs sm:text-sm font-bold hidden sm:inline',
                    isActive ? 'text-teal-700' : isDone ? 'text-emerald-700' : 'text-slate-400',
                  )}
                >
                  {stage.label}
                </span>
                {idx < STAGE_LABELS.length - 1 ? (
                  <div
                    className={cn(
                      'w-5 sm:w-10 h-1 rounded-full mx-1',
                      idx < safeIndex ? 'bg-emerald-400' : 'bg-slate-200',
                    )}
                    aria-hidden="true"
                  />
                ) : null}
              </div>
            );
          })}
        </div>
        <div
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600"
          aria-live="polite"
        >
          <span>{questionLabel}</span>
          <span className="text-slate-400">·</span>
          <span className="text-teal-700">{progressPercentage}٪ تکمیل</span>
        </div>
      </div>

      <div className="relative w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-l from-teal-500 to-sky-500"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ type: 'spring' as const, stiffness: 120, damping: 22 }}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progressPercentage}
        />
        {stageProgress > 0 && safeIndex < STAGE_LABELS.length ? (
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-l from-rose-400/40 to-amber-400/40 mix-blend-multiply"
            style={{
              width: `${stageProgress}%`,
            }}
            aria-hidden="true"
          />
        ) : null}
      </div>
    </div>
  );
}
