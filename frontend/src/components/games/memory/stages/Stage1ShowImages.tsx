import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { STAGE1_DISPLAY_SECONDS, STAGE1_IMAGES } from '@/lib/memory-game/content';
import { EmojiCard } from '../EmojiCard';
import { Eye } from 'lucide-react';

export interface Stage1ShowImagesProps {
  onCompleted: () => void;
}

const TONES: Array<'teal' | 'rose' | 'amber' | 'sky' | 'violet'> = [
  'teal',
  'rose',
  'amber',
  'sky',
  'violet',
];

export function Stage1ShowImages({ onCompleted }: Stage1ShowImagesProps) {
  const [remaining, setRemaining] = useState(STAGE1_DISPLAY_SECONDS);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    if (remaining <= 0) {
      return;
    }
    const t = window.setTimeout(() => setRemaining(r => r - 1), 1000);
    return () => window.clearTimeout(t);
  }, [remaining, paused]);

  const progress = Math.round(((STAGE1_DISPLAY_SECONDS - remaining) / STAGE1_DISPLAY_SECONDS) * 100);

  return (
    <section aria-labelledby="mg-s1-heading" className="space-y-5">
      <header className="rounded-2xl border border-slate-100 bg-white p-4 sm:p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-teal-100 text-teal-700">
              <Eye size={20} strokeWidth={2.3} />
            </span>
            <div>
              <h3 id="mg-s1-heading" className="text-lg sm:text-xl font-black text-slate-900">
                مرحله ۱: نگاه کن و به خاطر بسپار
              </h3>
              <p className="text-sm sm:text-base text-slate-600 mt-0.5">
                این تصاویر را با دقت نگاه کن؛ به‌زودی مخفی می‌شوند.
              </p>
            </div>
          </div>
          <div className="text-left sm:text-right">
            <div className="text-2xl sm:text-3xl font-black text-teal-600 leading-none">
              {remaining > 0 ? `${remaining} ثانیه` : 'پایان نمایش'}
            </div>
            <div className="text-xs text-slate-500 mt-1">زمان باقی‌مانده</div>
          </div>
        </div>
        <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
          <div
            className="h-full bg-gradient-to-l from-teal-500 to-emerald-500 transition-[width] duration-1000 linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </header>

      <div
        className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4 transition-opacity duration-700 ${
          remaining <= 0 ? 'opacity-0 pointer-events-none select-none' : 'opacity-100'
        }`}
        aria-hidden={remaining <= 0}
      >
        {STAGE1_IMAGES.map((item, i) => (
          <EmojiCard
            key={item.id}
            emoji={item.emoji}
            label={item.label}
            tone={TONES[i % TONES.length]}
            aria-disabled
            className="!cursor-default"
            onClick={undefined}
          />
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <Button
          variant="outline"
          onClick={() => setPaused(p => !p)}
          className="rounded-2xl"
        >
          {paused ? 'ادامه نمایش' : 'توقف موقت'}
        </Button>
        <Button
          onClick={onCompleted}
          className="rounded-2xl"
          disabled={remaining > 0}
        >
          {remaining > 0 ? `هنوز ${remaining} ثانیه مانده...` : 'حالا به سوالات پاسخ بده'}
        </Button>
      </div>
    </section>
  );
}
