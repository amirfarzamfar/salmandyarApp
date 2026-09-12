'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { track } from '@/lib/analytics';
import type {
  MemoryGameAnswers,
  MemoryGameResult,
  MemoryGameStageName,
  Stage4AnswerItem,
  Stage5AnswerItem,
} from '@/lib/memory-game/types';
import { TOTAL_STAGES } from '@/lib/memory-game/content';
import { buildResultFromAnswers, saveLastResult } from '@/lib/memory-game/scoring';
import { GameHeader } from './GameHeader';
import { IntroPanel } from './stages/IntroPanel';
import { Stage1ShowImages } from './stages/Stage1ShowImages';
import { Stage2SelectSeenImages } from './stages/Stage2SelectSeenImages';
import { Stage3SpotTheChange } from './stages/Stage3SpotTheChange';
import {
  Stage4Quiz,
  Stage4StoryWithImages,
} from './stages/Stage4StoryWithImages';
import { Stage5MixedChallenge } from './stages/Stage5MixedChallenge';
import { MemoryGameResult as GameResultView } from './MemoryGameResult';

export interface MemoryGameProps {
  autoStart?: boolean;
  onExit?: () => void;
}

export function MemoryGame({ autoStart, onExit }: MemoryGameProps) {
  const [phase, setPhase] = useState<MemoryGameStageName>(autoStart ? 'stage1_show' : 'intro');
  const [, setAnswers] = useState<MemoryGameAnswers>({});
  const [startedAt, setStartedAt] = useState<number | undefined>(() => autoStart ? Date.now() : undefined);
  const [result, setResult] = useState<MemoryGameResult | null>(null);
  const [announcement, setAnnouncement] = useState<string>('');

  useEffect(() => {
    if (announcement) {
      const t = window.setTimeout(() => setAnnouncement(''), 2000);
      return () => window.clearTimeout(t);
    }
  }, [announcement]);

  const stageIndex = useMemo(() => {
    switch (phase) {
      case 'intro':
        return 0;
      case 'stage1_show':
      case 'stage1_answer':
        return 0;
      case 'stage2_select':
        return 1;
      case 'stage3_before':
      case 'stage3_after':
        return 2;
      case 'stage4_story':
      case 'stage4_questions':
        return 3;
      case 'stage5':
        return 4;
      case 'result':
        return 5;
      default:
        return 0;
    }
  }, [phase]);

  const progressPct = phase === 'result' ? 100 : Math.round(((stageIndex) / TOTAL_STAGES) * 100);

  const handleExit = useCallback(() => {
    setAnnouncement('از بازی خارج شدی. هر زمان خواستی دوباره شروع کن.');
    if (onExit) onExit();
    else {
      try {
        const top = document.getElementById('top') || document.body;
        top.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } catch {
        // noop
      }
    }
  }, [onExit]);

  const handleReset = useCallback(() => {
    setPhase(autoStart ? 'stage1_show' : 'intro');
    setAnswers({});
    setStartedAt(autoStart ? Date.now() : undefined);
    setResult(null);
    setAnnouncement('بازی از اول شروع شد. موفق باشی 🍀');
  }, [autoStart]);

  const startGame = useCallback(() => {
    setStartedAt(Date.now());
    setAnswers({});
    setResult(null);
    setPhase('stage1_show');
    track('memory_game_started', { source: 'hero' });
  }, []);

  const finalize = useCallback(
    (finalAnswers: MemoryGameAnswers) => {
      if (!startedAt) return;
      const r = buildResultFromAnswers(finalAnswers, startedAt);
      saveLastResult(r);
      setResult(r);
      setPhase('result');
      setAnnouncement('نتیجه بازی آماده شد.');
      track('memory_game_completed', {
        score: r.score.total,
        visualMemory: r.score.visualMemory,
        attention: r.score.attention,
        recall: r.score.recall,
        correctCount: r.correctCount,
        totalQuestions: r.totalQuestions,
        stageScores: r.stageScores,
        durationMs: r.durationMs,
      });
    },
    [startedAt],
  );

  const onStage1Done = () => {
    setAnswers(a => ({ ...a, stage1: { correct: true } }));
    setPhase('stage2_select');
    setAnnouncement('مرحله دوم: انتخاب تصاویر دیده‌شده');
  };

  const onStage2Answered = (ans: MemoryGameAnswers['stage2']) => {
    setAnswers(a => {
      const next = { ...a, stage2: ans };
      window.setTimeout(() => setPhase('stage3_before'), 100);
      setAnnouncement('مرحله سوم: تشخیص تغییر تصویر');
      return next;
    });
  };

  const onStage3Answered = (ans: MemoryGameAnswers['stage3']) => {
    setAnswers(a => {
      const next = { ...a, stage3: ans };
      window.setTimeout(() => setPhase('stage4_story'), 100);
      setAnnouncement('مرحله چهارم: داستان کوتاه و چند سؤال');
      return next;
    });
  };

  // For stage 3, we treat phase transition simply: after entering stage3_before,
  // we render Stage3SpotTheChange component which internally handles before/after.
  // We map our orchestrator's phase to that component directly.

  const onStage4Completed = () => setPhase('stage4_questions');

  const onStage4QuizAnswered = (ans: Stage4AnswerItem[]) => {
    setAnswers(a => {
      const next = { ...a, stage4: ans };
      window.setTimeout(() => setPhase('stage5'), 100);
      setAnnouncement('مرحله پنجم: چالش نهایی');
      return next;
    });
  };

  const onStage5Answered = (ans: Stage5AnswerItem[]) => {
    setAnswers(a => {
      const next: MemoryGameAnswers = { ...a, stage5: ans };
      window.setTimeout(() => finalize(next), 120);
      return next;
    });
  };

  const onResultReset = () => handleReset();

  return (
    <section
      id="game"
      className="relative rounded-[2rem] border-2 border-slate-100 bg-white/80 shadow-sm p-4 sm:p-6 lg:p-8"
      aria-labelledby="mg-section-heading"
    >
      <span id="mg-section-heading" className="sr-only">
        بازی تقویت حافظه سالمندیار
      </span>

      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {announcement}
      </div>

      {phase !== 'intro' && phase !== 'result' && (
        <GameHeader
          stageIndex={stageIndex}
          totalStages={TOTAL_STAGES}
          progressPct={progressPct}
          onReset={handleReset}
          onExit={handleExit}
          className="mb-6"
        />
      )}

      <div className="min-h-[320px]">
        {phase === 'intro' && <IntroPanel onStart={startGame} />}

        {phase === 'stage1_show' && <Stage1ShowImages onCompleted={onStage1Done} />}

        {phase === 'stage2_select' && (
          <Stage2SelectSeenImages onAnswered={onStage2Answered} />
        )}

        {(phase === 'stage3_before' || phase === 'stage3_after') && (
          <Stage3SpotTheChange onAnswered={onStage3Answered} />
        )}

        {phase === 'stage4_story' && <Stage4StoryWithImages onCompleted={onStage4Completed} />}

        {phase === 'stage4_questions' && <Stage4Quiz onAnswered={onStage4QuizAnswered} />}

        {phase === 'stage5' && <Stage5MixedChallenge onAnswered={onStage5Answered} />}

        {phase === 'result' && result && (
          <GameResultView
            result={result}
            onReset={onResultReset}
            onExit={handleExit}
          />
        )}
      </div>
    </section>
  );
}
