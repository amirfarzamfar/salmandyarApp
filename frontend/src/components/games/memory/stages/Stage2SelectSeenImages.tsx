import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { STAGE2_CORRECT_IDS, STAGE2_OPTIONS } from '@/lib/memory-game/content';
import type { Stage2Answer } from '@/lib/memory-game/types';
import { EmojiCard } from '../EmojiCard';
import { CheckCircle2, HelpCircle } from 'lucide-react';

export interface Stage2SelectSeenImagesProps {
  onAnswered: (answer: Stage2Answer) => void;
}

const TONES: Array<'teal' | 'rose' | 'amber' | 'sky' | 'violet' | 'slate'> = [
  'teal',
  'sky',
  'amber',
  'violet',
  'rose',
  'slate',
  'teal',
  'amber',
];

export function Stage2SelectSeenImages({ onAnswered }: Stage2SelectSeenImagesProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const [showFeedback, setShowFeedback] = useState<null | 'right' | 'warm'>(null);
  const [score, setScore] = useState<number | null>(null);

  const [shuffled] = useState(() => {
    const arr = [...STAGE2_OPTIONS];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  });

  const toggle = (id: string) => {
    if (showFeedback) return;
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const submit = () => {
    const correctSet = new Set(STAGE2_CORRECT_IDS);
    const selectedSet = new Set(selected);
    let tp = 0;
    selectedSet.forEach(id => { if (correctSet.has(id)) tp++; });
    const fp = selectedSet.size - tp;
    const fn = correctSet.size - tp;
    const union = tp + fp + fn || 1;
    const ratio = tp / union;
    const computed = Math.round(ratio * 100);

    setScore(computed);
    if (computed >= 80) setShowFeedback('right');
    else setShowFeedback('warm');

    setTimeout(() => {
      onAnswered({
        selectedIds: selected,
        correctIds: STAGE2_CORRECT_IDS,
        score: computed,
      });
    }, 1200);
  };

  return (
    <section aria-labelledby="mg-s2-heading" className="space-y-5">
      <header className="rounded-2xl border border-slate-100 bg-white p-4 sm:p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 shrink-0">
            <CheckCircle2 size={20} strokeWidth={2.3} />
          </span>
          <div>
            <h3 id="mg-s2-heading" className="text-lg sm:text-xl font-black text-slate-900">
              مرحله ۲: کدام‌ها را دیده بودیم؟
            </h3>
            <p className="text-sm sm:text-base text-slate-600 mt-0.5 leading-relaxed">
              همه تصویرهایی که در مرحله قبل دیدی را انتخاب کن. چند مورد تازه‌تر هم اضافه شده‌اند.
            </p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
        {shuffled.map((opt, i) => (
          <EmojiCard
            key={opt.id}
            emoji={opt.emoji}
            label={opt.label}
            tone={TONES[i % TONES.length]}
            selected={selected.includes(opt.id)}
            onClick={() => toggle(opt.id)}
            aria-label={`${opt.label}${selected.includes(opt.id) ? '، انتخاب شده' : ''}`}
          />
        ))}
      </div>

      {showFeedback && score !== null && (
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
            {showFeedback === 'right' ? 'آفرین! 👏' : 'اشکالی ندارد، دوباره امتحان کن ❤️'}
          </div>
          <div className="text-sm sm:text-base mt-1 leading-relaxed">
            {showFeedback === 'right'
              ? 'خیلی خوب به خاطر آوردی. می‌ریم مرحله بعد.'
              : `چندتا رو درست حدس زدی (${score}٪). در ادامه تمرین می‌کنیم.`}
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-1.5 text-sm text-slate-600">
          <HelpCircle size={16} />
          انتخاب‌شده: <span className="font-black text-slate-900">{selected.length}</span> مورد
        </div>
        <Button onClick={submit} disabled={selected.length === 0 || !!showFeedback} className="rounded-2xl">
          ثبت پاسخ‌های مرحله ۲
        </Button>
      </div>
    </section>
  );
}
