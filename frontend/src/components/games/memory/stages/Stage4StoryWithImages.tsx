import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { STAGE4_QUESTIONS, STAGE4_STORY } from '@/lib/memory-game/content';
import type { Stage4AnswerItem } from '@/lib/memory-game/types';
import { BookOpenCheck, BookText } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Stage4StoryWithImagesProps {
  onCompleted: () => void;
}

export function Stage4StoryWithImages({ onCompleted }: Stage4StoryWithImagesProps) {
  return (
    <section aria-labelledby="mg-s4-story-heading" className="space-y-5">
      <header className="rounded-2xl border border-slate-100 bg-white p-4 sm:p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-sky-100 text-sky-700 shrink-0">
            <BookText size={20} strokeWidth={2.3} />
          </span>
          <div>
            <h3 id="mg-s4-story-heading" className="text-lg sm:text-xl font-black text-slate-900">
              مرحله ۴: داستان کوتاه را بخوان
            </h3>
            <p className="text-sm sm:text-base text-slate-600 mt-0.5 leading-relaxed">
              داستان زیر را با دقت بخوان؛ بعد چند سؤال ساده ازش می‌پرسیم.
            </p>
          </div>
        </div>
      </header>

      <article className="rounded-3xl border-2 border-sky-100 bg-gradient-to-br from-sky-50 via-white to-amber-50 p-5 sm:p-8 shadow-sm">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
          {STAGE4_STORY.images.map(img => (
            <div
              key={img.id}
              className="flex flex-col items-center gap-2 rounded-2xl bg-white/80 p-3 sm:p-4 border border-sky-100"
            >
              <span
                className="text-5xl sm:text-6xl select-none"
                role="img"
                aria-hidden
              >
                {img.emoji}
              </span>
              <span className="text-xs sm:text-sm font-black text-slate-700">{img.caption}</span>
            </div>
          ))}
        </div>

        <ol className="space-y-3 text-slate-800 text-base sm:text-lg leading-9">
          {STAGE4_STORY.paragraphs.map((p, i) => (
            <li key={i} className="flex items-start gap-3">
              <span
                className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-sky-500 text-white text-sm font-black shrink-0 mt-0.5"
                aria-hidden
              >
                {i + 1}
              </span>
              <p>{p}</p>
            </li>
          ))}
        </ol>
      </article>

      <div className="flex justify-end pt-1">
        <Button onClick={onCompleted} className="rounded-2xl" size="lg">
          آماده‌ام، سؤال‌ها را بپرس
        </Button>
      </div>
    </section>
  );
}

export interface Stage4QuizProps {
  onAnswered: (answers: Stage4AnswerItem[]) => void;
}

export function Stage4Quiz({ onAnswered }: Stage4QuizProps) {
  const [current, setCurrent] = useState(0);
  const [selections, setSelections] = useState<Record<string, string | null>>(
    Object.fromEntries(STAGE4_QUESTIONS.map(q => [q.id, null])),
  );
  const [showFeedback, setShowFeedback] = useState<Record<string, boolean>>({});

  const q = STAGE4_QUESTIONS[current];
  const correctOpt = q.options.find(o => o.correct)!;

  const pick = (optionId: string) => {
    if (showFeedback[q.id]) return;
    const isCorrect = optionId === correctOpt.id;
    setSelections(s => ({ ...s, [q.id]: optionId }));
    setShowFeedback(f => ({ ...f, [q.id]: isCorrect }));
  };

  const next = () => {
    if (current < STAGE4_QUESTIONS.length - 1) {
      setCurrent(c => c + 1);
      return;
    }
    // finalize
    const answers: Stage4AnswerItem[] = STAGE4_QUESTIONS.map(qq => {
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
  const isLast = current === STAGE4_QUESTIONS.length - 1;

  return (
    <section aria-labelledby="mg-s4-quiz-heading" className="space-y-5">
      <header className="rounded-2xl border border-slate-100 bg-white p-4 sm:p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 shrink-0">
            <BookOpenCheck size={20} strokeWidth={2.3} />
          </span>
          <div className="flex-1">
            <h3 id="mg-s4-quiz-heading" className="text-lg sm:text-xl font-black text-slate-900">
              مرحله ۴: سؤال‌های داستان
            </h3>
            <p className="text-sm sm:text-base text-slate-600 mt-0.5 leading-relaxed">
              سؤال {current + 1} از {STAGE4_QUESTIONS.length}
            </p>
          </div>
          <div className="text-xs sm:text-sm font-black text-slate-500">
            {Math.round(((current + 1) / STAGE4_QUESTIONS.length) * 100)}٪
          </div>
        </div>
      </header>

      <div className="rounded-3xl border-2 border-slate-100 bg-white p-5 sm:p-7 shadow-sm space-y-4">
        <p className="text-lg sm:text-2xl font-black text-slate-900 leading-relaxed">
          {q.question}
        </p>

        <div className="grid gap-2.5 sm:gap-3 pt-1">
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
                  'text-right w-full rounded-2xl border-2 p-4 sm:p-5 transition-all duration-300 text-base sm:text-lg font-bold leading-relaxed',
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
                {opt.text}
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
              {fb ? 'آفرین! 👏' : 'اشکالی ندارد، دوباره امتحان کن ❤️'}
            </div>
            {!fb && (
              <div className="text-sm mt-1 leading-relaxed">
                پاسخ درست: «{correctOpt.text}»
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
          {isLast ? 'ثبت پاسخ‌های مرحله ۴' : 'سؤال بعدی'}
        </Button>
      </div>
    </section>
  );
}
