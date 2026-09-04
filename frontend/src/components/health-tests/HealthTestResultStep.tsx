'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, RotateCcw, AlertTriangle, CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import type { HealthTest, HealthTestResult } from '@/lib/health-tests/types';
import type { UseHealthTestApi } from './useHealthTest';
import { useHealthTestResult } from './useHealthTest';
import ShareResultPanel from './ShareResultPanel';
import ViralLoopSection from './ViralLoopSection';
import type { ComponentType } from 'react';

const STATUS_META: Record<
  'good' | 'warning' | 'danger',
  { label: string; icon: ComponentType<{ size?: number; className?: string; strokeWidth?: number }>; ring: string; text: string; bg: string; border: string; dot: string }
> = {
  good: {
    label: 'وضعیت مناسب',
    icon: CheckCircle2,
    ring: 'ring-emerald-500/15',
    text: 'text-emerald-700',
    bg: 'from-emerald-50 to-teal-50',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500',
  },
  warning: {
    label: 'نیازمند توجه',
    icon: AlertCircle,
    ring: 'ring-amber-500/15',
    text: 'text-amber-700',
    bg: 'from-amber-50 to-orange-50',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
  },
  danger: {
    label: 'نیازمند بررسی',
    icon: AlertTriangle,
    ring: 'ring-rose-500/15',
    text: 'text-rose-700',
    bg: 'from-rose-50 to-pink-50',
    border: 'border-rose-200',
    dot: 'bg-rose-500',
  },
};

interface Props {
  test: HealthTest;
  api: UseHealthTestApi;
  onReset: () => void;
  onBack: () => void;
}

export default function HealthTestResultStep({ test, api, onReset, onBack }: Props) {
  const result = useHealthTestResult(test, api.state.answers);
  if (!result) {
    return (
      <article className="rounded-[2rem] bg-white border border-slate-100 p-8 text-center">
        <p className="text-slate-600 mb-4">هنوز پاسخ‌های لازم برای نمایش نتیجه کامل نشده‌اند.</p>
        <div className="flex justify-center gap-3">
          <Button variant="outline" onClick={onBack}>
            بازگشت به سؤالات
          </Button>
        </div>
      </article>
    );
  }
  return <HealthTestResultView test={test} result={result} onReset={onReset} onBack={onBack} forSelf={api.state.forSelf} />;
}

interface ViewProps {
  test: HealthTest;
  result: HealthTestResult;
  onReset: () => void;
  onBack: () => void;
  forSelf: boolean | null;
}

function AnimatedScore({ value }: { value: number }) {
  return (
    <motion.span
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' as const }}
      className="tabular-nums"
    >
      {value}
    </motion.span>
  );
}

function HealthTestResultView({ test, result, onReset, onBack, forSelf }: ViewProps) {
  const status = STATUS_META[result.overallStatus];
  const StatusIcon = status.icon;
  const score = result.totalScore;

  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.4, ease: 'easeOut' as const }}
      aria-labelledby="health-test-result-heading"
    >
      <article className="rounded-[2rem] bg-white border border-slate-100 shadow-sm p-6 sm:p-8 lg:p-10 overflow-hidden">
        <header className="flex flex-wrap items-start justify-between gap-4 mb-8">
          <div>
            <p className="text-xs sm:text-sm font-black uppercase tracking-widest text-teal-700 bg-teal-50 border border-teal-100 inline-flex items-center px-3 py-1 rounded-full mb-3">
              نتیجه تست سلامت
            </p>
            <h2
              id="health-test-result-heading"
              className="font-black text-2xl sm:text-3xl lg:text-4xl text-slate-900 leading-tight mb-2"
            >
              نتیجه ارزیابی {forSelf === false ? 'سالمند خانواده' : 'شما'}
            </h2>
            <p className="text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed">
              در ادامهٔ این صفحه می‌توانید جزئیات دسته‌بندی‌ها، توصیه متناسب با نتیجه و راه‌های
              اشتراک‌گذاری را ببینید.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft size={15} /> بازگشت
            </Button>
            <Button variant="outline" size="sm" onClick={onReset}>
              <RotateCcw size={15} /> انجام مجدد تست
            </Button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 mb-8">
          <div className="lg:col-span-5">
            <div
              className={cn(
                'relative rounded-[1.75rem] p-6 sm:p-7 border-2',
                status.bg,
                status.border,
              )}
            >
              <div className="flex items-start justify-between gap-4 mb-6">
                <div
                  className={cn(
                    'w-12 h-12 rounded-2xl flex items-center justify-center ring-8 shadow-lg',
                    status.ring,
                    status.text,
                    status.dot ? `bg-white` : '',
                  )}
                >
                  <StatusIcon size={26} strokeWidth={2.4} />
                </div>
                <span
                  className={cn(
                    'text-xs font-black px-3 py-1.5 rounded-full bg-white border shadow-sm',
                    status.text,
                    status.border,
                  )}
                >
                  {status.label}
                </span>
              </div>

              <div className="text-right">
                <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-2">
                  امتیاز کلی
                </p>
                <div className="flex items-end gap-3 mb-3">
                  <div className="flex items-baseline gap-2">
                    <div className="font-black text-6xl sm:text-7xl text-slate-900 leading-none">
                      <AnimatedScore value={score} />
                    </div>
                    <span className="text-slate-400 font-black text-2xl mb-1.5">/ 100</span>
                  </div>
                </div>
                <div className="w-full h-2.5 bg-white/80 rounded-full overflow-hidden border border-white">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${score}%` }}
                    transition={{ type: 'spring' as const, stiffness: 80, damping: 18, delay: 0.1 }}
                    className={cn('h-full rounded-full', status.dot)}
                  />
                </div>
              </div>

              <div className="mt-6 space-y-3.5 text-sm leading-relaxed text-slate-700">
                <p className="font-bold text-slate-800">{result.recommendation.title}</p>
                <p>{result.recommendation.description}</p>
              </div>

              {result.recommendation.primaryCtaHref && result.recommendation.primaryCtaLabel ? (
                <div className="mt-6 flex flex-wrap gap-3">
                  <Button
                    variant="primary"
                    size="lg"
                    asChild
                    className="rounded-full bg-gradient-to-l from-teal-600 to-sky-600 hover:from-teal-700 hover:to-sky-700 border-0 shadow-md shadow-teal-500/20"
                  >
                    <Link href={result.recommendation.primaryCtaHref}>
                      {result.recommendation.primaryCtaLabel}
                      <ArrowLeft size={17} strokeWidth={2.4} />
                    </Link>
                  </Button>
                </div>
              ) : null}
            </div>
          </div>

          <div className="lg:col-span-7 space-y-5 sm:space-y-6">
            <div className="rounded-3xl bg-slate-50 border border-slate-100 p-5 sm:p-6">
              <h3 className="font-black text-xl text-slate-900 mb-4 flex items-center gap-2">
                <span className="w-1.5 h-6 rounded-full bg-gradient-to-b from-teal-500 to-sky-500" />
                تفکیک امتیاز بر اساس دسته‌ها
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {result.breakdown.map(item => {
                  const meta = STATUS_META[item.status];
                  const Icon = meta.icon;
                  return (
                    <li
                      key={item.categoryTag}
                      className={cn(
                        'rounded-2xl bg-white border p-4 shadow-sm',
                        meta.border,
                      )}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2.5">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className={cn(
                              'w-9 h-9 rounded-xl flex items-center justify-center shrink-0',
                              meta.text,
                              'bg-white border',
                              meta.border,
                            )}
                          >
                            <Icon size={18} strokeWidth={2.4} />
                          </span>
                          <div className="min-w-0">
                            <p className="font-black text-[15px] text-slate-900 truncate">
                              {item.categoryLabel}
                            </p>
                            <p className={cn('text-[11px] font-black', meta.text)}>
                              {meta.label}
                            </p>
                          </div>
                        </div>
                        <div className="text-left font-black tabular-nums text-slate-900 shrink-0">
                          {item.score}
                          <span className="text-slate-400 text-xs font-bold mr-0.5">/100</span>
                        </div>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-2.5">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${item.score}%` }}
                          transition={{ type: 'spring' as const, stiffness: 90, damping: 20 }}
                          className={cn('h-full rounded-full', meta.dot)}
                        />
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {item.humanReadableNote}
                      </p>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="rounded-2xl bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 border border-amber-100 p-4 sm:p-5 flex items-start gap-3">
              <AlertTriangle
                size={22}
                className="text-amber-600 shrink-0 mt-0.5"
                aria-hidden="true"
              />
              <p className="text-sm leading-relaxed text-amber-900/90">
                <strong className="font-black text-amber-900">نکته مهم:</strong> این تست یک ابزار
                غربالگری و آموزشی است و هیچ‌گاه جایگزین تشخیص، معاینه یا درمان پزشک و متخصص
                نمی‌شود. اگر نگران وضعیت سلامتی هستید، حتماً به پزشک مراجعه کنید.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
          <div className="lg:col-span-7">
            <ShareResultPanel test={test} result={result} forSelf={forSelf} />
          </div>
          <div className="lg:col-span-5">
            <ViralLoopSection test={test} forSelf={forSelf} />
          </div>
        </div>
      </article>
    </motion.section>
  );
}
