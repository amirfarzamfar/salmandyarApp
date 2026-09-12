import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { STAGE5_QUESTIONS } from '@/lib/memory-game/content';
import type { Stage5AnswerItem } from '@/lib/memory-game/types';
import { Brain } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Stage5MixedChallengeProps {
  onAnswered: (answers: Stage5AnswerItem[]) => void;
}

export function Stage5MixedChallenge({ onAnswered }: Stage5MixedChallengeProps) {
  const [current, setCurrent] = useState(0);
  const [selections, setSelections] = useState<Record<string, string | null>>(
    Object.fromEntries(STAGE5_QUESTIONS.map(q => [q.id, null])),
  );
  const [showFeedback, setShowFeedback] = useState<Record<string, boolean>>({});

  const q = STAGE5_QUESTIONS[current];
  const correctOpt = q.options.find(o => o.correct)!;

  const pick = (optionId: string) => {
    if (showFeedback[q.id]) return;
    const isCorrect = optionId === correctOpt.id;
    setSelections(s => ({ ...s, [q.id]: optionId }));
    setShowFeedback(f => ({ ...f, [q.id]: isCorrect }));
  };

  const next = () => {
    if (current < STAGE5_QUESTIONS.length - 1) {
      setCurrent(c => c + 1);
      return;
    }
    const answers: Stage5AnswerItem[] = STAGE5_QUESTIONS.map(qq => {
      const c = qq.options.find(o => o.correct)!;
      const sel = selections[qq.id] ?? null;
      return {
        questionId: qq.id,
        selectedOptionId: sel,
        correctOptionId: c.id,
        correct: sel === c.id,
      };
    });
    setTimeout(() => onAnswered(answers), 800);
  };

  const sel = selections[q.id];
  const fb = showFeedback[q.id];
  const isLast = current === STAGE5_QUESTIONS.length - 1;

  const kindLabel =
    q.kind === 'recognize'
      ? 'شناسایی'
      : q.kind === 'spot'
        ? 'تشخیص تغییر'
        : 'یادآوری داستان';

  return (
    <section aria-labelledby="mg-s5-heading" className="space-y-5">
      <header className="rounded-2xl border border-slate-100 bg-white p-4 sm:p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-rose-100 text-rose-700 shrink-0">
            <Brain size={20} strokeWidth={2.3} />
          </span>
          <div className="flex-1">
            <h3 id="mg-s5-heading" className="text-lg sm:text-xl font-black text-slate-900">
              مرحله ۵: چالش نهایی
            </h3>
            <p className="text-sm sm:text-base text-slate-600 mt-0.5 leading-relaxed">
              چند سؤال کوتاه از همه مراحل • سؤال {current + 1} از {STAGE5_QUESTIONS.length}
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs sm:text-sm font-black border border-rose-100">
            {kindLabel}
          </span>
        </div>
      </header>

      <div className="rounded-3xl border-2 border-slate-100 bg-gradient-to-br from-white via-slate-50 to-white p-5 sm:p-7 shadow-sm space-y-4">
        <p className="text-lg sm:text-2xl font-black text-slate-900 leading-relaxed">
          {q.prompt}
        </p>

        <div className="grid gap-2.5 sm:gap-3 pt-1 sm:grid-cols-3">
          {q.options.map(opt => {
            const isSel = sel === opt.id;
            const showR = showFeedback[q.id] !== undefined;
            const correctHighlight = showR && opt.id === correctOpt.id;
            const wrongHighlight = showR && isSel && opt.id !== correctOpt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => pick(opt.id)}
                disabled={showR}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 rounded-2xl border-2 p-4 sm:p-5 transition-all duration-300',
                  'focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2',
                  correctHighlight
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-900'
                    : wrongHighlight
                      ? 'bg-amber-50 border-amber-400 text-amber-900'
                      : isSel
                        ? 'bg-teal-50 border-teal-400 text-teal-900'
                        : 'bg-white border-slate-200 text-slate-800 hover:border-teal-300 hover:bg-teal-50/40',
                )}
                aria-pressed={isSel || undefined}
              >
                {opt.emoji && (
                  <span className="text-4xl sm:text-5xl select-none" aria-hidden>
                    {opt.emoji}
                  </span>
                )}
                <span className="text-sm sm:text-lg font-black text-center leading-tight">
                  {opt.label}
                </span>
              </button>
            );
          })}
        </div>

        {fb !== undefined && (
          <div
            className={cn(
              'rounded-2xl p-3 sm:p-4 border-2',
              fb
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-amber-50 border-amber-200 text-amber-800',
            )}
            role="status"
            aria-live="polite"
          >
            <div className="font-black text-base sm:text-lg">
              {fb ? 'آفرین! 👏 انتهای مسیر نزدیک شد.' : 'اشکالی ندارد، دوباره امتحان کن ❤️'}
            </div>
            {!fb && (
              <div className="text-sm mt-1 leading-relaxed">
                پاسخ درست: «{correctOpt.label}»
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex justify-end pt-1">
        <Button
          onClick={next}
          disabled={showFeedback[q.id] === undefined}
          className="rounded-2xl"
          size="lg"
        >
          {isLast ? 'مشاهده نتیجه بازی' : 'سؤال بعدی'}
        </Button>
      </div>
    </section>
  );
}
