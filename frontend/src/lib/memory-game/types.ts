export type MemoryGameStageName =
  | 'intro'
  | 'stage1_show'
  | 'stage1_answer'
  | 'stage2_select'
  | 'stage3_before'
  | 'stage3_after'
  | 'stage4_story'
  | 'stage4_questions'
  | 'stage5'
  | 'result';

export interface MemoryImageItem {
  id: string;
  emoji: string;
  label: string;
}

export interface Stage2Option extends MemoryImageItem {
  seenInStage1: boolean;
}

export type Stage3CardState = 'before' | 'after';

export interface Stage3Card {
  id: string;
  beforeEmoji: string;
  afterEmoji: string;
  label: string;
  isChanged: boolean;
}

export interface Stage4StoryImage {
  id: string;
  emoji: string;
  caption: string;
}

export interface Stage4Question {
  id: string;
  question: string;
  options: { id: string; text: string; correct: boolean }[];
}

export interface Stage5Question {
  id: string;
  kind: 'recognize' | 'spot' | 'recall';
  prompt: string;
  options: { id: string; label: string; correct: boolean; emoji?: string }[];
}

export interface Stage1Answer {
  correct: boolean;
}

export interface Stage2Answer {
  selectedIds: string[];
  correctIds: string[];
  score: number;
}

export interface Stage3Answer {
  selectedCardId: string | null;
  correctCardId: string;
  score: number;
}

export interface Stage4AnswerItem {
  questionId: string;
  selectedOptionId: string | null;
  correctOptionId: string;
  correct: boolean;
}

export interface Stage5AnswerItem {
  questionId: string;
  selectedOptionId: string | null;
  correctOptionId: string;
  correct: boolean;
}

export interface MemoryGameAnswers {
  stage1?: Stage1Answer;
  stage2?: Stage2Answer;
  stage3?: Stage3Answer;
  stage4?: Stage4AnswerItem[];
  stage5?: Stage5AnswerItem[];
}

export interface MemoryGameScore {
  total: number;
  visualMemory: number;
  attention: number;
  recall: number;
}

export interface MemoryGameStageScores {
  stage1: number;
  stage2: number;
  stage3: number;
  stage4: number;
  stage5: number;
}

export interface MemoryGameResult {
  startedAt: number;
  completedAt: number;
  durationMs: number;
  score: MemoryGameScore;
  correctCount: number;
  totalQuestions: number;
  stageScores: MemoryGameStageScores;
  answers: MemoryGameAnswers;
}

export interface MemoryGameState {
  phase: MemoryGameStageName;
  stageIndex: number;
  totalStages: number;
  answers: MemoryGameAnswers;
  result?: MemoryGameResult;
  startedAt?: number;
}
