import type {
  HealthTest,
  HealthTestAnswerState,
  HealthTestResult,
  HealthTestResultBreakdown,
  HealthTestRuntimeState,
  HealthTestStatus,
  ScoreBreakdownPerCategory,
} from './types';

const STORAGE_PREFIX = 'salmandyar:health-test';
const SCHEMA_VERSION = 1;

export function getStorageKey(testId: string): string {
  return `${STORAGE_PREFIX}:${testId}:state:v${SCHEMA_VERSION}`;
}

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

export function saveState(state: HealthTestRuntimeState): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(getStorageKey(state.testId), JSON.stringify(state));
  } catch {
    // ignore quota / serialization errors
  }
}

export function loadState(testId: string): HealthTestRuntimeState | null {
  if (!isBrowser()) return null;
  try {
    const raw = localStorage.getItem(getStorageKey(testId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as HealthTestRuntimeState;
    if (parsed._schemaVersion !== SCHEMA_VERSION) {
      clearState(testId);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearState(testId: string): void {
  if (!isBrowser()) return;
  try {
    localStorage.removeItem(getStorageKey(testId));
  } catch {
    // ignore
  }
}

export function createInitialState(testId: string): HealthTestRuntimeState {
  return {
    testId,
    forSelf: null,
    currentStep: 'intro',
    currentQuestionIndex: 0,
    answers: {},
    startedAt: Date.now(),
    _schemaVersion: SCHEMA_VERSION,
  };
}

export function findQuestionIndexById(test: HealthTest, questionId: string): number {
  return test.questions.findIndex(q => q.id === questionId);
}

export function isTestComplete(test: HealthTest, answers: HealthTestAnswerState): boolean {
  return test.questions.every(q => answers[q.id]);
}

export function calculateScores(
  test: HealthTest,
  answers: HealthTestAnswerState,
): {
  totalScore: number;
  maxPossibleScore: number;
  percentage: number;
  perCategory: Record<string, ScoreBreakdownPerCategory>;
} {
  let totalScore = 0;
  let maxPossibleScore = 0;
  const perCategory: Record<string, ScoreBreakdownPerCategory> = {};

  test.questions.forEach(question => {
    const maxOptionScore = question.options.reduce((acc, opt) => Math.max(acc, opt.score), 0);
    maxPossibleScore += maxOptionScore;

    const selectedId = answers[question.id];
    const selected = question.options.find(o => o.id === selectedId);
    const obtained = selected ? selected.score : 0;
    totalScore += obtained;

    const categoryTag = question.categoryTag || '_uncategorized';
    const existing = perCategory[categoryTag];
    if (existing) {
      existing.total += obtained;
      existing.maxPossible += maxOptionScore;
      existing.questionsCount += 1;
    } else {
      perCategory[categoryTag] = {
        total: obtained,
        maxPossible: maxOptionScore,
        questionsCount: 1,
        percentage: 0,
      };
    }
  });

  Object.keys(perCategory).forEach(key => {
    const entry = perCategory[key];
    entry.percentage =
      entry.maxPossible > 0 ? Math.round((entry.total / entry.maxPossible) * 100) : 0;
  });

  const percentage =
    maxPossibleScore > 0 ? Math.round((totalScore / maxPossibleScore) * 100) : 0;

  return { totalScore, maxPossibleScore, percentage, perCategory };
}

export function categorizeResult(
  scorePercentage: number,
  thresholds: { low: number; mid: number },
): { status: HealthTestStatus; level: 'low' | 'medium' | 'high' } {
  // High score means user chose higher-score options.
  // Interpretation: higher score means better health (less risk).
  // low threshold: scores below this => high risk (danger / high recommendation)
  // mid threshold: between low and mid => medium risk
  // above mid => low risk (good status)
  if (scorePercentage <= thresholds.low) {
    return { status: 'danger', level: 'high' };
  }
  if (scorePercentage <= thresholds.mid) {
    return { status: 'warning', level: 'medium' };
  }
  return { status: 'good', level: 'low' };
}

function noteFor(
  status: HealthTestStatus,
  categoryLabel: string,
): string {
  switch (status) {
    case 'good':
      return `${categoryLabel} در وضعیت مناسبی قرار دارد؛ ادامه همین سبک زندگی توصیه می‌شود.`;
    case 'warning':
      return `برخی پاسخ‌ها نشان می‌دهد که بهتر است به بخش ${categoryLabel} توجه بیشتری شود.`;
    case 'danger':
      return `به نظر می‌رسد ${categoryLabel} نیازمند بررسی و توجه بیشتری است.`;
  }
}

const PERSIAN_LABEL_BY_TAG: Record<string, string> = {
  memory: 'حافظه و شناخت',
  mobility: 'تحرک و خطر سقوط',
  medication: 'مدیریت دارو',
  nutrition: 'تغذیه',
  home_safety: 'ایمنی منزل',
  daily_living: 'فعالیت‌های روزمره',
  mood: 'حال روان و اجتماعی',
  senses: 'بینایی و شنوایی',
  _uncategorized: 'سایر موارد',
};

function labelForCategoryTag(tag: string): string {
  return PERSIAN_LABEL_BY_TAG[tag] || tag;
}

export function buildBreakdown(
  test: HealthTest,
  perCategory: Record<string, ScoreBreakdownPerCategory>,
): HealthTestResultBreakdown[] {
  const { thresholds } = test.scoring;

  const orderedTags = Object.keys(perCategory).filter(tag => tag !== '_uncategorized');
  if (perCategory['_uncategorized'] && orderedTags.length === 0) {
    orderedTags.push('_uncategorized');
  }

  return orderedTags.map(tag => {
    const entry = perCategory[tag];
    const catStatus = categorizeResult(entry.percentage, thresholds).status;
    const label = labelForCategoryTag(tag);
    return {
      categoryTag: tag,
      categoryLabel: label,
      score: entry.percentage,
      status: catStatus,
      humanReadableNote: noteFor(catStatus, label),
    };
  });
}

export function computeResult(test: HealthTest, answers: HealthTestAnswerState): HealthTestResult {
  const { percentage, perCategory } = calculateScores(test, answers);
  const { status, level } = categorizeResult(percentage, test.scoring.thresholds);

  const recommendation = test.recommendations[level];

  return {
    totalScore: percentage,
    overallStatus: status,
    overallLevel: level,
    breakdown: buildBreakdown(test, perCategory),
    recommendation,
    computedAt: Date.now(),
  };
}
