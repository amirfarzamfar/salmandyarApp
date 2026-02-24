export enum QuestionType {
  MultipleChoice = 0,
  TrueFalse = 1,
  ShortAnswer = 2,
  LongAnswer = 3,
}

export enum AssessmentType {
  NurseAssessment = 0,
  SeniorAssessment = 1,
  SpecializedAssessment = 2,
  Exam = 3,
}

export interface AssessmentForm {
  id: number;
  title: string;
  description: string;
  type: AssessmentType;
  isActive: boolean;
  questions: Question[];
}

export interface Question {
  questionId: number;
  type: QuestionType; 
  question: string;
  options: Option[];
  weight: number;
  tags: string[];
  order: number;
}

export interface Option {
  id: number;
  text: string;
  value: number; // ScoreValue
  order: number;
}

export interface CreateAssessmentFormDto {
  title: string;
  description: string;
  type: AssessmentType;
  questions: CreateQuestionDto[];
}

export interface CreateQuestionDto {
  question: string;
  type: QuestionType;
  weight: number;
  tags: string[];
  options: CreateOptionDto[];
  order: number;
}

export interface CreateOptionDto {
  text: string;
  scoreValue: number;
  order: number;
}

export interface MatchingResult {
  seniorId: string;
  topMatches: MatchCandidate[];
}

export interface MatchCandidate {
  caregiverId: string;
  caregiverName: string;
  matchingScore: number;
  reason: string;
}

export interface SubmitAssessmentDto {
  formId: number;
  careRecipientId?: string;
  answers: AssessmentAnswerDto[];
}

export interface AssessmentAnswerDto {
  questionId: number;
  selectedOptionId?: number;
  textResponse?: string;
  booleanResponse?: boolean;
}

export interface UserProfileDto {
    userId: string;
    role: string;
    skills: Record<string, number>;
    needs: Record<string, number>;
    personality: Record<string, number>;
    preferences: Record<string, boolean>;
}
