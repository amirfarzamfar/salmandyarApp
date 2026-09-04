import Link from 'next/link';
import { LucideIcon, Clock, ChevronLeft } from 'lucide-react';
import type { HealthTest } from '@/lib/health-tests/types';
import { cn } from '@/lib/utils';

interface HealthTestCardProps {
  test: HealthTest;
  className?: string;
  ctaLabel?: string;
}

const DEFAULT_STYLE = {
  from: 'from-teal-500',
  to: 'to-sky-600',
  dot: 'bg-teal-500',
  ring: 'ring-teal-500/20',
  shadow: 'shadow-teal-500/10',
  badge: 'bg-teal-50 text-teal-700 border-teal-200',
  textGradient: 'from-teal-600 to-sky-600',
};

const STYLE_BY_SLUG: Record<string, typeof DEFAULT_STYLE> = {
  'elderly-health': {
    from: 'from-rose-500',
    to: 'to-orange-500',
    dot: 'bg-rose-500',
    ring: 'ring-rose-500/20',
    shadow: 'shadow-rose-500/10',
    badge: 'bg-rose-50 text-rose-700 border-rose-200',
    textGradient: 'from-rose-600 to-orange-600',
  },
  memory: {
    from: 'from-violet-500',
    to: 'to-fuchsia-600',
    dot: 'bg-violet-500',
    ring: 'ring-violet-500/20',
    shadow: 'shadow-violet-500/10',
    badge: 'bg-violet-50 text-violet-700 border-violet-200',
    textGradient: 'from-violet-600 to-fuchsia-600',
  },
  'fall-risk': {
    from: 'from-amber-500',
    to: 'to-rose-500',
    dot: 'bg-amber-500',
    ring: 'ring-amber-500/20',
    shadow: 'shadow-amber-500/10',
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
    textGradient: 'from-amber-600 to-rose-600',
  },
  'care-needs': {
    from: 'from-teal-500',
    to: 'to-sky-600',
    dot: 'bg-teal-500',
    ring: 'ring-teal-500/20',
    shadow: 'shadow-teal-500/10',
    badge: 'bg-teal-50 text-teal-700 border-teal-200',
    textGradient: 'from-teal-600 to-sky-600',
  },
  nutrition: {
    from: 'from-lime-500',
    to: 'to-emerald-600',
    dot: 'bg-lime-500',
    ring: 'ring-lime-500/20',
    shadow: 'shadow-lime-500/10',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    textGradient: 'from-lime-600 to-emerald-600',
  },
  'home-safety': {
    from: 'from-indigo-500',
    to: 'to-blue-600',
    dot: 'bg-indigo-500',
    ring: 'ring-indigo-500/20',
    shadow: 'shadow-indigo-500/10',
    badge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    textGradient: 'from-indigo-600 to-blue-600',
  },
};

function getStyle(test: HealthTest): typeof DEFAULT_STYLE {
  const bySlug = STYLE_BY_SLUG[test.slug];
  if (bySlug) return bySlug;
  if (test.accentGradientFrom && test.accentGradientTo) {
    return {
      from: test.accentGradientFrom,
      to: test.accentGradientTo,
      dot: 'bg-slate-500',
      ring: 'ring-slate-500/10',
      shadow: 'shadow-slate-500/10',
      badge: 'bg-slate-50 text-slate-700 border-slate-200',
      textGradient: `${test.accentGradientFrom} ${test.accentGradientTo}`,
    };
  }
  return DEFAULT_STYLE;
}

export default function HealthTestCard({
  test,
  className,
  ctaLabel = 'شروع تست',
}: HealthTestCardProps) {
  const style = getStyle(test);
  const Icon = test.icon as LucideIcon;

  return (
    <Link
      href={`/health-tests/${test.slug}`}
      aria-label={`${test.title} — ${test.shortDescription}`}
      className={cn(
        'group relative bg-white rounded-3xl p-6 sm:p-7 border-2 border-gray-100 hover:border-transparent transition-all duration-500 overflow-hidden focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2',
        className,
      )}
    >
      <div
        className={cn(
          'absolute inset-x-0 top-0 h-44 bg-gradient-to-br opacity-[0.08] group-hover:opacity-[0.14] transition duration-500',
          style.from,
          style.to,
        )}
        aria-hidden="true"
      />

      <div className="relative">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div
            className={cn(
              'w-16 h-16 rounded-2xl bg-gradient-to-br text-white flex items-center justify-center shadow-xl ring-8 group-hover:scale-110 group-hover:rotate-[-3deg] transition-all duration-500',
              style.from,
              style.to,
              style.shadow,
              style.ring,
            )}
            aria-hidden="true"
          >
            {Icon ? <Icon size={30} strokeWidth={2.25} /> : null}
          </div>

          <span
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border',
              style.badge,
            )}
          >
            <span className={cn('w-1.5 h-1.5 rounded-full', style.dot)} aria-hidden="true" />
            تست سلامت
          </span>
        </div>

        <h3 className="font-black text-xl sm:text-2xl text-gray-900 mb-2.5 leading-tight group-hover:text-slate-900">
          {test.title}
        </h3>

        <p className="text-sm text-gray-600 leading-relaxed mb-4 min-h-[48px] line-clamp-2">
          {test.shortDescription}
        </p>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100 group-hover:border-gray-200 transition">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-gray-500">
            <Clock size={14} />
            حدود {test.durationMinutes} دقیقه
          </span>
          <span
            className={cn(
              'inline-flex items-center gap-1.5 font-black text-sm bg-gradient-to-l bg-clip-text text-transparent group-hover:-translate-x-1.5 group-hover:gap-2 transition-all duration-300',
              style.from,
              style.to,
            )}
          >
            {ctaLabel}
            <ChevronLeft size={15} strokeWidth={2.5} />
          </span>
        </div>
      </div>
    </Link>
  );
}
