'use client';

import { motion, type Variants } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { HealthTestQuestionOption } from '@/lib/health-tests/types';

const optionVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.04 * i, type: 'spring' as const, stiffness: 160, damping: 20 },
  }),
};

interface HealthTestOptionButtonProps {
  option: HealthTestQuestionOption;
  questionId: string;
  index: number;
  isSelected: boolean;
  onSelect: (questionId: string, optionId: string) => void;
  tone?: 'teal' | 'rose' | 'neutral';
}

export default function HealthTestOptionButton({
  option,
  questionId,
  index,
  isSelected,
  onSelect,
  tone = 'teal',
}: HealthTestOptionButtonProps) {
  const palette = {
    teal: {
      selected:
        'bg-gradient-to-br from-teal-50 via-white to-sky-50 border-teal-500 text-slate-900 shadow-xl shadow-teal-500/10 ring-4 ring-teal-500/10',
      hover: 'hover:border-teal-300 hover:shadow-md hover:-translate-y-0.5',
      dot: 'bg-teal-500',
      pill: 'bg-teal-100 text-teal-800',
    },
    rose: {
      selected:
        'bg-gradient-to-br from-rose-50 via-white to-amber-50 border-rose-500 text-slate-900 shadow-xl shadow-rose-500/10 ring-4 ring-rose-500/10',
      hover: 'hover:border-rose-300 hover:shadow-md hover:-translate-y-0.5',
      dot: 'bg-rose-500',
      pill: 'bg-rose-100 text-rose-800',
    },
    neutral: {
      selected:
        'bg-gradient-to-br from-slate-50 via-white to-slate-100 border-slate-500 text-slate-900 shadow-xl shadow-slate-500/10 ring-4 ring-slate-500/10',
      hover: 'hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5',
      dot: 'bg-slate-500',
      pill: 'bg-slate-100 text-slate-700',
    },
  }[tone];

  return (
    <motion.button
      custom={index}
      initial="hidden"
      animate="show"
      variants={optionVariants}
      type="button"
      onClick={() => onSelect(questionId, option.id)}
      aria-pressed={isSelected}
      className={cn(
        'group relative w-full text-right rounded-3xl border-2 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-offset-2 p-5 sm:p-6',
        isSelected ? palette.selected : 'bg-white border-slate-200 text-slate-800',
        !isSelected ? palette.hover : '',
      )}
    >
      <div className="flex items-start gap-4">
        <div
          aria-hidden="true"
          className={cn(
            'relative mt-1 w-6 h-6 rounded-full border-2 shrink-0 transition-colors',
            isSelected
              ? `${palette.dot} border-transparent`
              : 'border-slate-300 group-hover:border-slate-400',
          )}
        >
          {isSelected ? (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring' as const, stiffness: 220, damping: 22 }}
              className="absolute inset-0 rounded-full flex items-center justify-center text-white"
            >
              <Check size={15} strokeWidth={3.2} />
            </motion.span>
          ) : null}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-black text-base sm:text-lg leading-tight mb-1">{option.label}</p>
          {option.description ? (
            <p className="text-sm text-slate-500 leading-relaxed">{option.description}</p>
          ) : null}
        </div>
      </div>
      {isSelected ? (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute left-5 top-5"
        >
          <span
            className={cn(
              'inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-full',
              palette.pill,
            )}
          >
            انتخاب شد
            <Check size={10} strokeWidth={3.5} />
          </span>
        </motion.div>
      ) : null}
    </motion.button>
  );
}
