import type { LucideIcon } from 'lucide-react';

export type HealthTestStatus = 'good' | 'warning' | 'danger';

export type HealthTestStageKind = 'start' | 'awareness' | 'evaluation' | 'result';

export type HealthTestStep = 'intro' | 'question' | 'result';

export type HealthTestRecommendationLevel = 'low' | 'medium' | 'high';

export interface HealthTestQuestionOption {
  id: string;
  label: string;
  score: number;
  icon?: LucideIcon | string;
  description?: string;
}

export interface HealthTestQuestion {
  id: string;
  text: string;
  description?: string;
  options: HealthTestQuestionOption[];
  categoryTag?: string;
}

export interface HealthTestCategory {
  id: string;
  slug: string;
  title: string;
  description?: string;
  icon?: LucideIcon | string;
}

export interface HealthTestStage {
  kind: HealthTestStageKind;
  title: string;
  startQuestionIndex: number;
  endQuestionIndexExclusive: number;
}

export interface HealthTestScoreThresholds {
  low: number;
  mid: number;
}

export interface HealthTestResultRecommendation {
  level: HealthTestRecommendationLevel;
  title: string;
  description: string;
  primaryCtaLabel?: string;
  primaryCtaHref?: string;
}

export interface HealthTest {
  id: string;
  slug: string;
  title: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  shortDescription: string;
  durationMinutes: number;
  icon: LucideIcon | string;
  accentGradientFrom?: string;
  accentGradientTo?: string;
  categories: string[];
  featured?: boolean;
  stages?: HealthTestStage[];
  questions: HealthTestQuestion[];
  scoring: {
    thresholds: HealthTestScoreThresholds;
    categoryWeights?: Record<string, number>;
  };
  recommendations: {
    low: HealthTestResultRecommendation;
    medium: HealthTestResultRecommendation;
    high: HealthTestResultRecommendation;
  };
  relatedLinks?: { label: string; href: string }[];
  faqs?: { id: number; question: string; answer: string; displayOrder: number }[];
}

export type HealthTestAnswerState = Record<string, string>;

export interface HealthTestRuntimeState {
  testId: string;
  forSelf: boolean | null;
  currentStep: HealthTestStep;
  currentQuestionIndex: number;
  answers: HealthTestAnswerState;
  startedAt: number;
  lastAnsweredQuestionIndex?: number;
  _schemaVersion: 1;
}

export interface HealthTestResultBreakdown {
  categoryTag: string;
  categoryLabel: string;
  score: number;
  status: HealthTestStatus;
  humanReadableNote: string;
}

export interface HealthTestResult {
  totalScore: number;
  overallStatus: HealthTestStatus;
  overallLevel: HealthTestRecommendationLevel;
  breakdown: HealthTestResultBreakdown[];
  recommendation: HealthTestResultRecommendation;
  computedAt: number;
}

export interface ScoreBreakdownPerCategory {
  total: number;
  maxPossible: number;
  questionsCount: number;
  percentage: number;
}
