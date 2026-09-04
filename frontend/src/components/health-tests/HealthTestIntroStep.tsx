'use client';

import type { ComponentType } from 'react';
import { motion } from 'framer-motion';
import { User, Users, HeartHandshake, ArrowLeft, Sparkles, Clock } from 'lucide-react';
import type { HealthTest } from '@/lib/health-tests/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

interface HealthTestIntroStepProps {
  test: HealthTest;
  forSelf: boolean | null;
  onSelectForSelf: (value: boolean) => void;
  onStart: () => void;
  onBack?: () => void;
  canGoBack?: boolean;
  className?: string;
}

const FADE_VARIANTS = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

export default function HealthTestIntroStep({
  test,
  forSelf,
  onSelectForSelf,
  onStart,
  onBack,
  canGoBack,
  className,
}: HealthTestIntroStepProps) {
  const hasSelection = forSelf !== null;
  const Icon = test.icon as unknown as ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;

  return (
    <motion.section
      initial="hidden"
      animate="show"
      exit="hidden"
      variants={FADE_VARIANTS}
      transition={{ duration: 0.35, ease: 'easeOut' as const }}
      aria-labelledby="health-test-intro-heading"
      className={cn('relative', className)}
    >
      <article className="rounded-[2rem] bg-white border border-slate-100 shadow-sm p-6 sm:p-8 lg:p-10 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-6">
            {canGoBack && onBack ? (
              <Button variant="ghost" size="sm" onClick={onBack} className="mb-1">
                <ArrowLeft size={16} strokeWidth={2.5} />
                بازگشت به صفحه قبل
              </Button>
            ) : null}

            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-black">
                <Sparkles size={13} />
                تست تعاملی و رایگان
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 text-slate-600 border border-slate-200 text-[11px] font-black">
                <Clock size={13} />
                حدود {test.durationMinutes} دقیقه
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200 text-[11px] font-black">
                {test.questions.length} سؤال کوتاه
              </span>
            </div>

            <div className="space-y-3">
              <p className="text-xs sm:text-sm font-black uppercase tracking-widest text-teal-700">
                {test.title}
              </p>
              <h2
                id="health-test-intro-heading"
                className="font-black text-2xl sm:text-3xl lg:text-4xl text-slate-900 leading-tight"
              >
                اول مشخص کنیم این تست برای چه کسی است؟
              </h2>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl">
                انتخاب شما در نحوه توضیح و ارائهٔ نتیجه و توصیه‌ها تأثیر می‌گذارد. شما می‌توانید در
                هر مرحله دوباره این انتخاب را تغییر دهید.
              </p>
            </div>

            <div
              className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4"
              role="radiogroup"
              aria-label="تست برای چه کسی است؟"
            >
              <motion.button
                whileHover={forSelf === true ? { scale: 1 } : { scale: 1.01 }}
                whileTap={forSelf === true ? { scale: 0.99 } : { scale: 0.995 }}
                type="button"
                onClick={() => onSelectForSelf(true)}
                role="radio"
                aria-checked={forSelf === true}
                className={cn(
                  'group relative text-right p-5 sm:p-6 rounded-3xl border-2 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-teal-500/20',
                  forSelf === true
                    ? 'bg-gradient-to-br from-teal-50 via-white to-sky-50 border-teal-500 shadow-xl shadow-teal-500/10'
                    : 'bg-white border-slate-200 hover:border-teal-300 hover:shadow-md',
                )}
              >
                <div
                  className={cn(
                    'w-14 h-14 rounded-2xl flex items-center justify-center mb-3 transition-all',
                    forSelf === true
                      ? 'bg-gradient-to-br from-teal-500 to-sky-600 text-white shadow-lg shadow-teal-500/25'
                      : 'bg-slate-100 text-slate-500 group-hover:bg-teal-50 group-hover:text-teal-700',
                  )}
                  aria-hidden="true"
                >
                  <User size={28} strokeWidth={2.2} />
                </div>
                <h3 className="font-black text-lg sm:text-xl text-slate-900 mb-1.5">برای خودم</h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  من می‌خواهم وضعیت سلامت خودم را بررسی کنم.
                </p>
                {forSelf === true ? (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 inline-flex items-center gap-1.5 text-xs font-black text-teal-700 bg-teal-100/70 px-3 py-1.5 rounded-full"
                  >
                    انتخاب شد ✓
                  </motion.div>
                ) : null}
              </motion.button>

              <motion.button
                whileHover={forSelf === false ? { scale: 1 } : { scale: 1.01 }}
                whileTap={forSelf === false ? { scale: 0.99 } : { scale: 0.995 }}
                type="button"
                onClick={() => onSelectForSelf(false)}
                role="radio"
                aria-checked={forSelf === false}
                className={cn(
                  'group relative text-right p-5 sm:p-6 rounded-3xl border-2 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-rose-500/20',
                  forSelf === false
                    ? 'bg-gradient-to-br from-rose-50 via-white to-amber-50 border-rose-500 shadow-xl shadow-rose-500/10'
                    : 'bg-white border-slate-200 hover:border-rose-300 hover:shadow-md',
                )}
              >
                <div
                  className={cn(
                    'w-14 h-14 rounded-2xl flex items-center justify-center mb-3 transition-all',
                    forSelf === false
                      ? 'bg-gradient-to-br from-rose-500 to-orange-500 text-white shadow-lg shadow-rose-500/25'
                      : 'bg-slate-100 text-slate-500 group-hover:bg-rose-50 group-hover:text-rose-700',
                  )}
                  aria-hidden="true"
                >
                  <Users size={28} strokeWidth={2.2} />
                </div>
                <h3 className="font-black text-lg sm:text-xl text-slate-900 mb-1.5">برای سالمند خانواده</h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  می‌خواهم برای پدر، مادر یا یکی از عزیزانم انجام دهم.
                </p>
                {forSelf === false ? (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 inline-flex items-center gap-1.5 text-xs font-black text-rose-700 bg-rose-100/70 px-3 py-1.5 rounded-full"
                  >
                    انتخاب شد ✓
                  </motion.div>
                ) : null}
              </motion.button>
            </div>

            <motion.footer
              initial={hasSelection ? { opacity: 0, y: 8 } : {}}
              animate={hasSelection ? { opacity: 1, y: 0 } : { opacity: 0.6 }}
              className="flex flex-wrap items-center justify-between gap-3 pt-2 sm:pt-4"
            >
              <div className="flex items-start gap-2 text-xs sm:text-sm text-slate-500 max-w-md">
                <HeartHandshake size={18} className="text-teal-600 shrink-0 mt-0.5" />
                <p>
                  پاسخ‌ها فقط روی دستگاه شما ذخیره می‌شوند و تنها صرفاً برای تولید نتیجهٔ این تست
                  استفاده می‌شوند.
                </p>
              </div>
              <Button
                size="lg"
                onClick={onStart}
                disabled={!hasSelection}
                className={cn(
                  'rounded-full shadow-lg transition-all',
                  hasSelection
                    ? 'bg-gradient-to-l from-rose-600 via-orange-500 to-amber-500 hover:from-rose-700 hover:via-orange-600 hover:to-amber-600 border-0 shadow-rose-500/20'
                    : '',
                )}
              >
                شروع ارزیابی سلامت
                <ArrowLeft size={18} strokeWidth={2.5} />
              </Button>
            </motion.footer>
          </div>

          <div className="lg:col-span-5 flex items-center justify-center">
            <div className="relative w-full max-w-sm">
              <div className="absolute -inset-6 bg-gradient-to-br from-teal-500/10 via-sky-500/5 to-rose-500/10 rounded-[2.5rem] blur-2xl" aria-hidden="true" />
              <div className="relative rounded-[2rem] bg-gradient-to-br from-slate-50 to-white border border-slate-100 p-6 sm:p-8 shadow-inner shadow-slate-200/50">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-sky-600 text-white flex items-center justify-center shadow-xl shadow-teal-500/20 ring-8 ring-teal-500/10">
                    {Icon ? <Icon size={30} strokeWidth={2.3} /> : <HeartHandshake size={30} strokeWidth={2.3} />}
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                      قبل از شروع
                    </p>
                    <p className="font-black text-lg text-slate-900 leading-tight">
                      این تست تشخیص پزشکی نیست
                    </p>
                  </div>
                </div>
                <ul className="space-y-3 text-sm text-slate-600 leading-relaxed">
                  <li className="flex items-start gap-2.5">
                    <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0" />
                    <span>
                      یک ابزار <strong className="text-slate-800">آموزشی و غربالگری</strong> است؛
                      هرگز جایگزین مشاوره یا تشخیص پزشک و متخصص نمی‌شود.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                    <span>
                      سؤال‌ها را <strong className="text-slate-800">واقعی و بدون تعصب</strong>{' '}
                      پاسخ دهید تا نتیجه به واقعیت نزدیک‌تر باشد.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                    <span>
                      در پایان تست، نتیجه را می‌توانید با خانواده{' '}
                      <strong className="text-slate-800">به اشتراک بگذارید</strong>.
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </article>
    </motion.section>
  );
}
