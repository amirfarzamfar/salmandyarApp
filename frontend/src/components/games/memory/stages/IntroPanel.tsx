import { Button } from '@/components/ui/Button';
import { Brain, Sparkles } from 'lucide-react';
import type { ReactNode } from 'react';

export interface IntroPanelProps {
  onStart: () => void;
  extraHint?: ReactNode;
}

export function IntroPanel({ onStart, extraHint }: IntroPanelProps) {
  return (
    <section
      aria-labelledby="mg-intro-heading"
      className="relative overflow-hidden rounded-[2rem] border-2 border-teal-100 bg-gradient-to-br from-teal-50 via-emerald-50 to-green-50 p-6 sm:p-10"
    >
      <div className="absolute inset-0 opacity-40 pointer-events-none" aria-hidden>
        <div className="absolute top-6 left-6 w-40 h-40 rounded-full bg-teal-200 blur-3xl" />
        <div className="absolute bottom-6 right-6 w-56 h-56 rounded-full bg-amber-200 blur-3xl" />
      </div>

      <div className="relative space-y-6 text-center">
        <div className="mx-auto w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-br from-teal-500 via-emerald-500 to-green-600 text-white flex items-center justify-center shadow-2xl shadow-teal-500/30 ring-8 ring-white">
          <Brain className="w-10 h-10 sm:w-12 sm:h-12" strokeWidth={2.3} />
        </div>

        <div>
          <h2
            id="mg-intro-heading"
            className="text-2xl sm:text-4xl font-black text-slate-900 leading-tight"
          >
            بازی تقویت حافظه با سالمندیار
          </h2>
          <p className="mt-3 text-base sm:text-lg text-slate-700 leading-relaxed max-w-2xl mx-auto">
            آرام و بی‌عجله برو. در ۵ مرحله کوتاه، حافظه دیداری و توجهت را با تصاویر آشنا تمرین می‌کنیم.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2.5 text-sm sm:text-base text-slate-600 font-bold">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/70 border border-white shadow-sm">
            <Sparkles size={15} className="text-teal-600" />
            ۵ مرحله کوتاه
          </span>
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/70 border border-white shadow-sm">
            بدون تایپ کردن
          </span>
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/70 border border-white shadow-sm">
            تصاویر بزرگ و خوانا
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            size="lg"
            onClick={onStart}
            className="rounded-2xl px-8 py-4 text-lg font-black shadow-xl shadow-teal-600/20"
          >
            شروع بازی
          </Button>
        </div>

        {extraHint && (
          <div className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto leading-relaxed pt-1">
            {extraHint}
          </div>
        )}
      </div>
    </section>
  );
}
