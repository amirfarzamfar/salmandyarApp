import Link from 'next/link';
import {
  HandHeart,
  PhoneCall,
  ChevronLeft,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

export interface HealthCTAButton {
  label: string;
  href: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  icon?: LucideIcon;
  external?: boolean;
}

interface HealthTestsCTABannerProps {
  eyebrow?: string;
  title: string;
  description?: string;
  primaryCta?: HealthCTAButton;
  secondaryCta?: HealthCTAButton;
  tone?: 'sunset' | 'ocean' | 'slate';
  className?: string;
  id?: string;
}

export default function HealthTestsCTABanner({
  eyebrow = 'نیاز به کمک دارید؟',
  title = 'اگر سالمند خانواده‌تان به حمایت روزانه نیاز دارد، سالمندیار کنار شماست.',
  description = 'پرستار و مراقب حرفه‌ای و معتمد، در شیفت‌های روزانه، شبانه‌روزی یا ویژیت نیم‌روزه. مشاوره رایگان و بدون تعهد.',
  primaryCta = {
    label: 'درخواست فوری پرستار',
    href: '/portal/home-care/request',
    variant: 'primary',
    icon: PhoneCall,
  },
  secondaryCta = {
    label: 'مشاهده خدمات سالمندیار',
    href: '/services',
    variant: 'outline',
    icon: HandHeart,
  },
  tone = 'sunset',
  className,
  id,
}: HealthTestsCTABannerProps) {
  const paletteByTone = {
    sunset: 'from-rose-600 via-orange-500 to-amber-400 text-white',
    ocean: 'from-teal-600 via-sky-600 to-indigo-600 text-white',
    slate: 'from-slate-800 via-slate-900 to-slate-900 text-white',
  } as const;

  const palette = paletteByTone[tone];

  const PrimaryIcon = primaryCta.icon || PhoneCall;
  const SecondaryIcon = secondaryCta?.icon || HandHeart;

  return (
    <section
      id={id}
      aria-labelledby={id ? `${id}-heading` : undefined}
      className={cn(
        'relative rounded-[2.25rem] overflow-hidden shadow-2xl shadow-rose-500/10',
        className,
      )}
    >
      <div className={cn('absolute inset-0 bg-gradient-to-br', palette)} aria-hidden="true" />

      {/* Decorative blurs */}
      <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-white/10 blur-3xl pointer-events-none" aria-hidden="true" />
      <div className="absolute -bottom-28 -right-20 w-96 h-96 rounded-full bg-white/10 blur-3xl pointer-events-none" aria-hidden="true" />

      <div className="relative p-7 sm:p-10 lg:p-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8">
            <p className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 border border-white/20 backdrop-blur text-[11px] font-black uppercase tracking-widest mb-5">
              <Sparkles size={14} />
              {eyebrow}
            </p>
            <h2
              id={id ? `${id}-heading` : undefined}
              className="font-black text-2xl sm:text-3xl lg:text-4xl leading-tight mb-4"
            >
              {title}
            </h2>
            {description ? (
              <p className="text-white/85 text-base sm:text-lg leading-relaxed max-w-2xl mb-0">
                {description}
              </p>
            ) : null}
          </div>

          <div className="lg:col-span-4 flex flex-col items-stretch sm:items-end gap-3">
            {primaryCta ? (
              <Button
                variant={primaryCta.variant ?? 'primary'}
                size="lg"
                asChild
                className={cn(
                  'w-full sm:w-auto justify-center bg-white text-rose-700 hover:bg-white/95 border-0 shadow-xl shadow-black/10 ring-4 ring-white/20',
                  tone === 'ocean' && 'text-teal-700 hover:text-teal-800',
                  tone === 'slate' && 'text-slate-800 hover:text-slate-900',
                )}
              >
                <Link href={primaryCta.href}>
                  <PrimaryIcon size={18} strokeWidth={2.5} />
                  {primaryCta.label}
                  <ChevronLeft size={16} strokeWidth={2.5} />
                </Link>
              </Button>
            ) : null}

            {secondaryCta ? (
              <Button
                variant={secondaryCta.variant ?? 'outline'}
                size="lg"
                asChild
                className="w-full sm:w-auto justify-center border-2 border-white/30 bg-white/10 text-white hover:bg-white/15 backdrop-blur shadow-lg shadow-black/5"
              >
                <Link href={secondaryCta.href}>
                  <SecondaryIcon size={18} strokeWidth={2.3} />
                  {secondaryCta.label}
                </Link>
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
