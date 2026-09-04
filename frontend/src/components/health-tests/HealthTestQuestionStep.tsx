'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Lightbulb, Brain, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import type { HealthTest, HealthTestAnswerState } from '@/lib/health-tests/types';
import HealthTestOptionButton from './HealthTestOptionButton';

const QUESTION_VARIANTS = {
  enter: (dir: 1 | -1) => ({
    opacity: 0,
    x: dir * 24,
  }),
  center: {
    opacity: 1,
    x: 0,
    transition: { type: 'spring' as const, stiffness: 220, damping: 24, mass: 0.8 },
  },
  exit: (dir: 1 | -1) => ({
    opacity: 0,
    x: dir * -24,
    transition: { type: 'tween' as const, duration: 0.25, ease: 'easeInOut' as const },
  }),
} as const;

const ENCOURAGEMENTS = [
  'عالی پیش رفتی 👏',
  'نصف مسیر را طی کردی!',
  'فقط چند سؤال دیگر باقی مانده',
  'پاسخ‌های شما واقعاً مهم است ❤️',
  'ادامه بده، نتیجه در انتظارست',
];

function encouragementFor(progressPct: number): string | null {
  if (progressPct >= 90) return ENCOURAGEMENTS[4];
  if (progressPct >= 70) return ENCOURAGEMENTS[2];
  if (progressPct >= 50) return ENCOURAGEMENTS[1];
  if (progressPct >= 25) return ENCOURAGEMENTS[0];
  return null;
}

interface HealthTestQuestionStepProps {
  test: HealthTest;
  questionIndex: number;
  answers: HealthTestAnswerState;
  answeredCount: number;
  progressPercentage: number;
  scorePercentageSoFar: number;
  canGoBack: boolean;
  canGoForward: boolean;
  onSelect: (questionId: string, optionId: string) => void;
  onBack: () => void;
  onNext: () => void;
  className?: string;
}

export default function HealthTestQuestionStep({
  test,
  questionIndex,
  answers,
  progressPercentage,
  canGoBack,
  canGoForward,
  onSelect,
  onBack,
  onNext,
  className,
}: HealthTestQuestionStepProps) {
  const total = test.questions.length;
  const question = test.questions[questionIndex];
  const selectedOptionId = answers[question.id] || '';
  const questionNumber = questionIndex + 1;
  const dir: 1 | -1 = 1;
  const encouragement = encouragementFor(progressPercentage);
  const showEncouragementAt = questionIndex === Math.floor(total / 2) || questionIndex === total - 2;

  if (!question) return null;

  return (
    <motion.section
      aria-labelledby="health-test-question-heading"
      className={cn('relative', className)}
    >
      <article className="rounded-[2rem] bg-white border border-slate-100 shadow-sm p-6 sm:p-8 lg:p-10 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="inline-flex items-center gap-2 text-sm font-black text-slate-600 bg-slate-50 border border-slate-100 rounded-full px-3.5 py-1.5">
            <Brain size={15} className="text-teal-600" />
            سؤال <span className="text-teal-700">{questionNumber}</span> از{' '}
            <span className="text-slate-500">{total}</span>
          </div>

          <div className="inline-flex items-center gap-2 text-[11px] font-bold text-slate-500">
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" aria-hidden="true" />
            پاسخ‌ها به‌صورت خودکار ذخیره می‌شوند
          </div>
        </div>

        <AnimatePresence initial={false} mode="wait" custom={dir}>
          <motion.div
            key={question.id}
            custom={dir}
            variants={QUESTION_VARIANTS}
            initial="enter"
            animate="center"
            exit="exit"
          >
            <header className="mb-7 sm:mb-8">
              {question.categoryTag ? (
                <p className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-teal-700 bg-teal-50 border border-teal-100 px-3 py-1 rounded-full mb-3">
                  دسته: {question.categoryTag}
                </p>
              ) : null}
              <h3
                id="health-test-question-heading"
                className="font-black text-2xl sm:text-3xl lg:text-4xl text-slate-900 leading-tight mb-3"
              >
                {question.text}
              </h3>
              {question.description ? (
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-3xl flex items-start gap-2">
                  <Lightbulb size={17} className="text-amber-500 shrink-0 mt-0.5" />
                  {question.description}
                </p>
              ) : null}
            </header>

            <div
              className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-8"
              role="radiogroup"
              aria-label={question.text}
            >
              {question.options.map((option, i) => (
                <HealthTestOptionButton
                  key={option.id}
                  option={option}
                  questionId={question.id}
                  index={i}
                  isSelected={selectedOptionId === option.id}
                  onSelect={onSelect}
                  tone={questionIndex % 3 === 0 ? 'rose' : questionIndex % 3 === 1 ? 'teal' : 'neutral'}
                />
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {encouragement && showEncouragementAt ? (
          <motion.div
            key={questionIndex}
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="mb-6 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-l from-amber-50 to-orange-50 border border-orange-100 text-amber-800 text-xs sm:text-sm font-bold shadow-sm shadow-orange-100"
          >
            <Zap size={15} className="text-orange-500" />
            {encouragement}
          </motion.div>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
          <Button
            variant="outline"
            onClick={onBack}
            disabled={!canGoBack}
            className="rounded-full"
            aria-label="بازگشت به سؤال قبلی"
          >
            <ArrowRight size={17} strokeWidth={2.4} />
            سؤال قبلی
          </Button>

          <div className="flex items-center gap-2 text-xs text-slate-500 max-w-[60%] text-left sm:text-right">
            <span>
              <strong className="text-slate-700">نکته:</strong> سعی کنید بر اساس رفتار واقعی و
              روزمره پاسخ دهید، نه آرمانی.
            </span>
          </div>

          <Button
            variant="primary"
            onClick={onNext}
            disabled={!canGoForward}
            className="rounded-full bg-gradient-to-l from-teal-600 to-sky-600 hover:from-teal-700 hover:to-sky-700 border-0 shadow-md shadow-teal-500/20"
            aria-label={questionIndex >= total - 1 ? 'مشاهده نتیجه' : 'سؤال بعدی'}
          >
            {questionIndex >= total - 1 ? 'مشاهده نتیجه' : 'سؤال بعدی'}
            <ArrowLeft size={17} strokeWidth={2.4} />
          </Button>
        </div>
      </article>
    </motion.section>
  );
}
