'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { MouseEvent } from 'react';
import {
  LucideIcon,
  Clock,
  ChevronLeft,
  Award,
  Sparkles,
  HeartPulse,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { getHealthTestBySlug } from '@/lib/health-tests/tests';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

interface FeaturedHealthTestCardProps {
  slug: string;
  className?: string;
  highlightBadge?: string;
}

export default function FeaturedHealthTestCard({
  slug,
  className,
  highlightBadge = 'پیشنهاد سالمندیار',
}: FeaturedHealthTestCardProps) {
  const test = getHealthTestBySlug(slug);
  const router = useRouter();
  const targetHref = `/health-tests/${slug}`;

  if (!test) {
    return (
      <div
        className={cn(
          'group relative rounded-[2rem] overflow-hidden shadow-2xl shadow-rose-500/10 bg-white focus:outline-none focus:ring-4 focus:ring-rose-500/20 p-8 sm:p-10',
          className,
        )}
      >
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200 shrink-0">
            <AlertTriangle size={32} />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-black text-xl sm:text-2xl text-slate-900 mb-1">تست در دسترس نیست</h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              تست موردنظر حذف شده یا اسلاگ آن تغییر کرده است. لطفاً از صفحه همه تست‌ها، تست دیگری را انتخاب کنید.
            </p>
          </div>
          <Button variant="outline" asChild className="shrink-0">
            <Link href="/health-tests">
              مشاهده همه تست‌ها
              <ChevronLeft size={16} strokeWidth={2.4} />
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const Icon = (test.icon as LucideIcon) || HeartPulse;

  const handleStartClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(targetHref);
  };

  return (
    <Link
      href={`/health-tests/${test.slug}`}
      aria-label={`${highlightBadge}: ${test.title}`}
      className={cn(
        'group relative rounded-[2rem] overflow-hidden shadow-2xl shadow-rose-500/10 bg-white focus:outline-none focus:ring-4 focus:ring-rose-500/20',
        className,
      )}
    >
      {/* Gradient border effect */}
      <div
        className="absolute inset-0 p-[2px] rounded-[2rem] pointer-events-none opacity-95 group-hover:opacity-100 transition-opacity"
        aria-hidden="true"
      >
        <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-rose-500 via-orange-500 to-amber-400" />
      </div>

      <div className="relative bg-white rounded-[2rem] overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-7 sm:p-9 lg:p-10">
          {/* Visual / Icon Area */}
          <div className="lg:col-span-4 flex items-start lg:items-center justify-start lg:justify-center">
            <div className="relative">
              <div className="absolute -inset-6 bg-gradient-to-br from-rose-500/15 via-orange-500/10 to-amber-400/10 rounded-[2rem] blur-2xl" />
              <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-br from-rose-500 via-orange-500 to-amber-400 text-white flex items-center justify-center shadow-xl shadow-rose-500/30 ring-8 ring-rose-500/10 group-hover:scale-105 transition-transform duration-500">
                <Icon size={48} strokeWidth={2.25} />
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-8 flex flex-col gap-5">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-l from-amber-500 to-orange-500 text-white text-[11px] font-black shadow-lg shadow-orange-500/20">
                    <Sparkles size={13} fill="currentColor" />
                    {highlightBadge}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 text-slate-600 border border-slate-200 text-[11px] font-bold">
                    <Clock size={13} />
                    حدود {test.durationMinutes} دقیقه
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
                    <Award size={13} />
                    {test.questions.length} سؤال تعاملی
                  </span>
                </div>

                <h2 className="font-black text-2xl sm:text-3xl lg:text-4xl text-slate-900 leading-tight">
                  {test.title}
                </h2>
              </div>
            </div>

            <p className="text-slate-600 leading-relaxed text-base sm:text-lg max-w-3xl">
              {test.shortDescription}
            </p>

            {/* Quick bullets */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="inline-flex items-center gap-2 text-sm text-slate-600 bg-slate-50/70 border border-slate-100 rounded-2xl px-3.5 py-2.5">
                <CheckCircle2 size={16} className="text-emerald-600" />
                <span className="font-bold text-slate-700">رایگان</span>
              </div>
              <div className="inline-flex items-center gap-2 text-sm text-slate-600 bg-slate-50/70 border border-slate-100 rounded-2xl px-3.5 py-2.5">
                <CheckCircle2 size={16} className="text-emerald-600" />
                <span className="font-bold text-slate-700">بدون ثبت نام</span>
              </div>
              <div className="inline-flex items-center gap-2 text-sm text-slate-600 bg-slate-50/70 border border-slate-100 rounded-2xl px-3.5 py-2.5">
                <CheckCircle2 size={16} className="text-emerald-600" />
                <span className="font-bold text-slate-700">نتیجه فوری و قابل فهم</span>
              </div>
            </div>

            {/* CTA Row */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button
                size="lg"
                variant="primary"
                onClick={handleStartClick}
                className="rounded-full shadow-lg shadow-rose-500/20 hover:shadow-rose-500/30 transition-shadow bg-gradient-to-l from-rose-600 via-orange-600 to-amber-500 hover:from-rose-700 hover:via-orange-700 hover:to-amber-600 border-0"
              >
                شروع تست
                <ChevronLeft size={18} strokeWidth={2.5} />
              </Button>
              <div className="text-sm text-slate-500 font-semibold pr-1">
                نتیجه تست فقط برای شما نمایش داده می‌شود.
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
