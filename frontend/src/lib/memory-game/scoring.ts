import type {
  MemoryGameAnswers,
  MemoryGameResult,
  MemoryGameScore,
  MemoryGameStageScores,
} from './types';

const clamp = (n: number, min = 0, max = 100): number => Math.max(min, Math.min(max, n));
const round = (n: number): number => Math.round(n);

function calcStage1(answers: MemoryGameAnswers): number {
  // Stage 1 is show phase; auto full if stage2 attempted
  if (!answers.stage2) return 100;
  return 100;
}

function calcStage2(answers: MemoryGameAnswers): number {
  const a = answers.stage2;
  if (!a) return 0;
  // Based on Jaccard-like: selected ∩ correct / (correct ∪ selected)
  const correct = new Set(a.correctIds);
  const selected = new Set(a.selectedIds);
  let tp = 0;
  selected.forEach(id => { if (correct.has(id)) tp++; });
  const fp = selected.size - tp;
  const fn = correct.size - tp;
  const union = tp + fp + fn || 1;
  const ratio = tp / union;
  return clamp(round(ratio * 100));
}

function calcStage3(answers: MemoryGameAnswers): number {
  const a = answers.stage3;
  if (!a) return 0;
  return a.selectedCardId === a.correctCardId ? 100 : 0;
}

function calcStage4(answers: MemoryGameAnswers): number {
  const a = answers.stage4;
  if (!a || a.length === 0) return 0;
  const correct = a.filter(x => x.correct).length;
  return clamp(round((correct / a.length) * 100));
}

function calcStage5(answers: MemoryGameAnswers): number {
  const a = answers.stage5;
  if (!a || a.length === 0) return 0;
  const correct = a.filter(x => x.correct).length;
  return clamp(round((correct / a.length) * 100));
}

export function calculateStageScores(answers: MemoryGameAnswers): MemoryGameStageScores {
  return {
    stage1: calcStage1(answers),
    stage2: calcStage2(answers),
    stage3: calcStage3(answers),
    stage4: calcStage4(answers),
    stage5: calcStage5(answers),
  };
}

export function calculateScore(answers: MemoryGameAnswers): MemoryGameScore {
  const s = calculateStageScores(answers);

  // Weights: each stage contributes to sub-scores
  const visualMemory = round(
    (s.stage1 * 0.25) + (s.stage2 * 0.35) + (s.stage3 * 0.4),
  );

  const attention = round(
    (s.stage2 * 0.35) + (s.stage3 * 0.35) + (s.stage5 * 0.3),
  );

  const recall = round(
    (s.stage2 * 0.3) + (s.stage4 * 0.4) + (s.stage5 * 0.3),
  );

  const total = round(
    (s.stage1 * 0.1) + (s.stage2 * 0.25) + (s.stage3 * 0.2) + (s.stage4 * 0.25) + (s.stage5 * 0.2),
  );

  return {
    total: clamp(total),
    visualMemory: clamp(visualMemory),
    attention: clamp(attention),
    recall: clamp(recall),
  };
}

export function countCorrectAnswers(answers: MemoryGameAnswers): { correct: number; total: number } {
  let correct = 0;
  let total = 0;

  // Stage2: considered 1 "item"
  total += 1;
  const s2 = answers.stage2;
  if (s2) {
    const c = new Set(s2.correctIds);
    const s = new Set(s2.selectedIds);
    let tp = 0;
    s.forEach(id => { if (c.has(id)) tp++; });
    if (tp === c.size && s.size === c.size) correct += 1;
    else if (tp > 0) correct += 0.5;
  }

  // Stage3: 1 item
  total += 1;
  const s3 = answers.stage3;
  if (s3 && s3.selectedCardId === s3.correctCardId) correct += 1;

  // Stage4
  const s4 = answers.stage4 || [];
  s4.forEach(q => { total += 1; if (q.correct) correct += 1; });

  // Stage5
  const s5 = answers.stage5 || [];
  s5.forEach(q => { total += 1; if (q.correct) correct += 1; });

  return { correct: Math.round(correct), total };
}

export function buildResultFromAnswers(
  answers: MemoryGameAnswers,
  startedAt: number,
): MemoryGameResult {
  const completedAt = Date.now();
  const { correct, total } = countCorrectAnswers(answers);
  const score = calculateScore(answers);
  const stageScores = calculateStageScores(answers);

  return {
    startedAt,
    completedAt,
    durationMs: Math.max(0, completedAt - startedAt),
    score,
    correctCount: correct,
    totalQuestions: total,
    stageScores,
    answers,
  };
}

const LOCAL_KEY = 'salmandyar.memory.lastResult';

export function saveLastResult(result: MemoryGameResult): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(result));
    }
  } catch {
    // ignore
  }
}

export function loadLastResult(): MemoryGameResult | null {
  try {
    if (typeof localStorage === 'undefined') return null;
    const raw = localStorage.getItem(LOCAL_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as MemoryGameResult;
  } catch {
    return null;
  }
}

export function scoreEncouragement(total: number): { emoji: string; title: string; subtitle: string } {
  if (total >= 90) {
    return {
      emoji: '🌟',
      title: 'عالیه! تمرین خوبی بود.',
      subtitle: 'امروز تمرکز و حافظه‌ات خیلی فعال بود. ادامه بده ❤️',
    };
  }
  if (total >= 70) {
    return {
      emoji: '💪',
      title: 'آفرین! عملکرد خوبی داشتی.',
      subtitle: 'با تمرین روزانه چند دقیقه‌ای، روز به روز بهتر می‌شوی.',
    };
  }
  if (total >= 50) {
    return {
      emoji: '🌿',
      title: 'مرحله خوبی را گذروندیم.',
      subtitle: 'هر روز کمی تمرین کنیم، نتیجه را بهتر می‌بینیم.',
    };
  }
  return {
    emoji: '🍵',
    title: 'نگران نباش، فقط بازی بود.',
    subtitle: 'با آرامش و تمرین کوتاه روزانه، تمرکز و حافظه را فعال نگه می‌داریم.',
  };
}
