import { ShieldCheck, Sparkles, Zap, BadgeCheck, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TrustSignal {
  icon: LucideIcon;
  title: string;
  description?: string;
}

export const DEFAULT_TRUST_SIGNALS: TrustSignal[] = [
  {
    icon: Sparkles,
    title: 'کاملاً رایگان',
    description: 'بدون هزینه یا اشتراک',
  },
  {
    icon: ShieldCheck,
    title: 'بدون ثبت نام',
    description: 'شروع فوری و بدون فرم ورود',
  },
  {
    icon: Zap,
    title: 'نتیجه فوری',
    description: 'پس از تکمیل تست، گام‌به‌گام',
  },
  {
    icon: BadgeCheck,
    title: 'آموزشی و غربالگری',
    description: 'برای افزایش آگاهی خانواده',
  },
];

interface TrustSignalsBarProps {
  signals?: TrustSignal[];
  className?: string;
  tone?: 'default' | 'dark' | 'soft';
}

export default function TrustSignalsBar({
  signals = DEFAULT_TRUST_SIGNALS,
  className,
  tone = 'default',
}: TrustSignalsBarProps) {
  const wrapper =
    tone === 'dark'
      ? 'bg-slate-900/80 border-white/10 text-white'
      : tone === 'soft'
        ? 'bg-gradient-to-l from-teal-50/80 to-sky-50/80 border-teal-100 text-slate-800'
        : 'bg-white border-slate-100 text-slate-800';

  const iconBg =
    tone === 'dark'
      ? 'bg-white/10 text-white'
      : tone === 'soft'
        ? 'bg-white text-teal-700 border border-teal-100'
        : 'bg-gradient-to-br from-teal-500/10 to-sky-500/10 text-teal-700';

  return (
    <section
      aria-label="ویژگی‌های تست‌های سلامت"
      className={cn(
        'rounded-3xl border shadow-sm backdrop-blur',
        wrapper,
        className,
      )}
    >
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-5 sm:p-6">
        {signals.map(signal => {
          const Icon = signal.icon;
          return (
            <li
              key={signal.title}
              className="flex items-center gap-3 p-3 sm:p-3.5 rounded-2xl hover:bg-white/60 transition"
            >
              <span
                className={cn(
                  'w-11 h-11 rounded-xl flex items-center justify-center shadow-sm shrink-0',
                  iconBg,
                )}
                aria-hidden="true"
              >
                <Icon size={20} strokeWidth={2.2} />
              </span>
              <div className="min-w-0">
                <p className="font-black text-[15px] leading-tight">{signal.title}</p>
                {signal.description ? (
                  <p
                    className={cn(
                      'text-xs mt-0.5 font-medium',
                      tone === 'dark' ? 'text-white/70' : 'text-slate-500',
                    )}
                  >
                    {signal.description}
                  </p>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
