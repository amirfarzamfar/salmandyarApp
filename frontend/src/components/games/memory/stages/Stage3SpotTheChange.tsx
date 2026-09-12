import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { STAGE3_CARDS, STAGE3_CORRECT_CARD_ID } from '@/lib/memory-game/content';
import type { Stage3Answer, Stage3CardState } from '@/lib/memory-game/types';
import { EmojiCard } from '../EmojiCard';
import { Eye, EyeOff } from 'lucide-react';

export interface Stage3SpotTheChangeProps {
  onAnswered: (answer: Stage3Answer) => void;
}

export function Stage3SpotTheChange({ onAnswered }: Stage3SpotTheChangeProps) {
  const [phase, setPhase] = useState<Stage3CardState>('before');
  const [selected, setSelected] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState<null | 'right' | 'warm'>(null);

  useEffect(() => {
    if (phase !== 'before') return;
    const t = window.setTimeout(() => setPhase('after'), 4500);
    return () => window.clearTimeout(t);
  }, [phase]);

  const submit = () => {
    const isCorrect = selected === STAGE3_CORRECT_CARD_ID;
    setShowFeedback(isCorrect ? 'right' : 'warm');
    setTimeout(() => {
      onAnswered({
        selectedCardId: selected,
        correctCardId: STAGE3_CORRECT_CARD_ID,
        score: isCorrect ? 100 : 0,
      });
    }, 1200);
  };

  const getEmoji = (card: (typeof STAGE3_CARDS)[number]) =>
    phase === 'before' ? card.beforeEmoji : card.afterEmoji;

  const getTone = (i: number) =>
    (['teal', 'sky', 'rose', 'amber', 'violet', 'slate'] as const)[i % 6];

  return (
    <section aria-labelledby="mg-s3-heading" className="space-y-5">
      <header className="rounded-2xl border border-slate-100 bg-white p-4 sm:p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-violet-100 text-violet-700 shrink-0">
            {phase === 'before' ? <Eye size={20} strokeWidth={2.3} /> : <EyeOff size={20} strokeWidth={2.3} />}
          </span>
          <div className="flex-1">
            <h3 id="mg-s3-heading" className="text-lg sm:text-xl font-black text-slate-900">
              مرحله ۳: کدام عکس عوض شد؟
            </h3>
            <p className="text-sm sm:text-base text-slate-600 mt-0.5 leading-relaxed">
              {phase === 'before'
                ? 'این کارت‌ها را با دقت نگاه کن؛ به‌زودی یکی از تصاویر عوض می‌شود.'
                : 'یکی از کارت‌ها عوض شد! آن را پیدا و انتخاب کن.'}
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <span
              className={
                phase === 'before'
                  ? 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-100 text-violet-700 text-sm font-black'
                  : 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-sm font-black'
              }
            >
              {phase === 'before' ? 'حالت اول' : 'حالت دوم'}
            </span>
            {phase === 'before' && (
              <Button variant="outline" size="sm" onClick={() => setPhase('after')} className="rounded-2xl">
                الان ببینم تغییرش
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        {STAGE3_CARDS.map((card, i) => {
          const changedHighlight = phase === 'after' && card.isChanged && showFeedback === 'right';
          return (
            <EmojiCard
              key={card.id}
              emoji={getEmoji(card)}
              label={card.label}
              tone={getTone(i)}
              selected={selected === card.id}
              onClick={() => phase === 'after' && !showFeedback && setSelected(card.id)}
              aria-disabled={phase === 'before' || !!showFeedback}
              className={changedHighlight ? '!ring-emerald-500 !border-emerald-600' : ''}
            />
          );
        })}
      </div>

      {showFeedback && (
        <div
          className={
            showFeedback === 'right'
              ? 'rounded-2xl border-2 border-emerald-200 bg-emerald-50 text-emerald-800 p-4 sm:p-5'
              : 'rounded-2xl border-2 border-amber-200 bg-amber-50 text-amber-800 p-4 sm:p-5'
          }
          role="status"
          aria-live="polite"
        >
          <div className="font-black text-lg sm:text-xl">
            {showFeedback === 'right' ? 'آفرین! 👏 چشم تیز تو تغییر رو پیدا کرد.' : 'اشکالی ندارد، دوباره امتحان کن ❤️'}
          </div>
          <div className="text-sm sm:text-base mt-1 leading-relaxed">
            {showFeedback === 'warm' && 'عوض‌شده‌ی کارت‌های وسط چپ بود (گل → رز).'}
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="text-sm text-slate-600 font-bold">
          {phase === 'before' ? '🔎 در حال نمایش کارت‌ها...' : selected ? `انتخابی شما: کارت ${selected}` : 'هنوز کارتی انتخاب نشده.'}
        </div>
        <Button onClick={submit} disabled={!selected || phase === 'before' || !!showFeedback} className="rounded-2xl">
          ثبت پاسخ مرحله ۳
        </Button>
      </div>
    </section>
  );
}
