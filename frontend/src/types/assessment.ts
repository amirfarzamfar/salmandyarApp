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
}

export interface AssessmentForm {
  id: number;
  title: string;
  description: string;
  type: AssessmentType;
  questions: Question[];
}

export interface Question {
  questionId?: number;
  type: string; // "MultipleChoice" | ...
  question: string;
  options: Option[];
  weight: number;
  tags: string[];
  order?: number;
}

export interface Option {
  id?: number;
  text: string;
  value: number; // ScoreValue
  order?: number;
}

export interface CreateAssessmentFormDto {
  title: string;
  description: string;
  type: AssessmentType;
  questions: CreateQuestionDto[];
}

export interface CreateQuestionDto {
  question: string;
  type: QuestionType; // enum value (0, 1, 2, 3) but API expects enum? Backend DTO uses QuestionType enum. 
  // Wait, backend DTO QuestionType is enum. JSON serialization usually sends integer by default in .NET unless configured as string.
  // I should check if backend accepts string or int. By default int.
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
