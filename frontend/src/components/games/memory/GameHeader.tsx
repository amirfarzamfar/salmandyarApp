import { RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { TOTAL_STAGES } from '@/lib/memory-game/content';
import { cn } from '@/lib/utils';

export interface GameHeaderProps {
  stageIndex: number;
  totalStages?: number;
  onReset: () => void;
  onExit: () => void;
  className?: string;
  progressPct?: number;
}

export function GameHeader({
  stageIndex,
  totalStages = TOTAL_STAGES,
  onReset,
  onExit,
  className,
  progressPct,
}: GameHeaderProps) {
  const safeIndex = Math.max(1, Math.min(totalStages, stageIndex + 1));
  const pct = progressPct ?? Math.round((safeIndex / totalStages) * 100);

  return (
    <header className={cn('mb-6', className)}>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 text-teal-700 px-3.5 py-1.5 text-sm font-black border border-teal-100">
            مرحله {safeIndex} از {totalStages}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="md"
            onClick={onReset}
            aria-label="شروع مجدد بازی"
            className="rounded-2xl"
          >
            <RefreshCw size={18} />
            شروع مجدد
          </Button>
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={onExit}
            aria-label="خروج از بازی"
            className="rounded-2xl"
          >
            <X size={18} />
            خروج
          </Button>
        </div>
      </div>

      <div
        className="w-full h-3 rounded-full bg-slate-100 overflow-hidden border border-slate-200"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="پیشرفت بازی"
      >
        <div
          className="h-full bg-gradient-to-l from-teal-500 via-emerald-500 to-green-500 transition-[width] duration-700 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </header>
  );
}
