import { Check } from 'lucide-react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface EmojiCardProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  emoji: string;
  label?: string;
  selected?: boolean;
  hideLabel?: boolean;
  tone?: 'teal' | 'violet' | 'rose' | 'amber' | 'sky' | 'slate';
  badge?: ReactNode;
}

const TONES: Record<NonNullable<EmojiCardProps['tone']>, string> = {
  teal: 'from-teal-50 via-emerald-50 to-cyan-50 border-teal-200 hover:border-teal-300',
  violet: 'from-violet-50 via-fuchsia-50 to-indigo-50 border-violet-200 hover:border-violet-300',
  rose: 'from-rose-50 via-pink-50 to-orange-50 border-rose-200 hover:border-rose-300',
  amber: 'from-amber-50 via-yellow-50 to-orange-50 border-amber-200 hover:border-amber-300',
  sky: 'from-sky-50 via-blue-50 to-cyan-50 border-sky-200 hover:border-sky-300',
  slate: 'from-slate-50 via-gray-50 to-stone-50 border-slate-200 hover:border-slate-300',
};

const TONES_SELECTED: Record<NonNullable<EmojiCardProps['tone']>, string> = {
  teal: 'ring-4 ring-teal-400/50 border-teal-500 bg-gradient-to-br from-teal-100 to-emerald-100',
  violet: 'ring-4 ring-violet-400/50 border-violet-500 bg-gradient-to-br from-violet-100 to-fuchsia-100',
  rose: 'ring-4 ring-rose-400/50 border-rose-500 bg-gradient-to-br from-rose-100 to-orange-100',
  amber: 'ring-4 ring-amber-400/50 border-amber-500 bg-gradient-to-br from-amber-100 to-yellow-100',
  sky: 'ring-4 ring-sky-400/50 border-sky-500 bg-gradient-to-br from-sky-100 to-blue-100',
  slate: 'ring-4 ring-slate-400/50 border-slate-500 bg-gradient-to-br from-slate-100 to-gray-100',
};

export function EmojiCard({
  emoji,
  label,
  selected,
  hideLabel,
  tone = 'teal',
  badge,
  className,
  type = 'button',
  ...rest
}: EmojiCardProps) {
  return (
    <button
      type={type}
      aria-pressed={selected ? true : undefined}
      aria-label={label ? `${label} ${selected ? 'انتخاب شده' : ''}` : undefined}
      className={cn(
        'relative group flex flex-col items-center justify-center gap-2 rounded-3xl border-2 p-3 sm:p-4 min-h-[110px] sm:min-h-[140px] bg-gradient-to-br transition-all duration-300',
        'hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2',
        TONES[tone],
        selected && TONES_SELECTED[tone],
        className,
      )}
      {...rest}
    >
      {badge && (
        <span className="absolute -top-2 -left-2 z-10">{badge}</span>
      )}
      <span
        className="text-5xl sm:text-7xl leading-none select-none"
        role="img"
        aria-hidden="true"
      >
        {emoji}
      </span>
      {!hideLabel && label && (
        <span className="text-sm sm:text-base font-black text-slate-700 text-center leading-tight">
          {label}
        </span>
      )}
      {selected && (
        <span className="absolute top-2 right-2 inline-flex items-center justify-center w-7 h-7 rounded-full bg-emerald-500 text-white shadow-md">
          <Check size={16} strokeWidth={3} />
        </span>
      )}
    </button>
  );
}
