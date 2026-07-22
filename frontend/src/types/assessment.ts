export enum QuestionType {
  MultipleChoice = 0,
  TrueFalse = 1,
  ShortAnswer = 2,
  LongAnswer = 3,
  Number = 4,
  MultiSelect = 5,
  Date = 6,
  File = 7,
  Image = 8,
  Slider = 9,
  Switch = 10,
  Rating = 11,
  Time = 12,
}

export enum AssessmentFormWorkflow {
  Assessment = 0,
  UserEvaluation = 1,
  HomeCareRequest = 2,
  Checklist = 3,
  SatisfactionSurvey = 4,
}

export enum AssessmentType {
  // Legacy
  NurseAssessment = 0,
  SeniorAssessment = 1,
  SpecializedAssessment = 2,
  Exam = 3,

  // Roles
  Manager = 10,
  Supervisor = 11,
  Nurse = 12,
  AssistantNurse = 13,
  Physiotherapist = 14,
  ElderlyCareAssistant = 15,
  Elderly = 16,
  Patient = 17,
  PatientFamily = 18
}

export interface AssessmentForm {
  id: number;
  code: string;
  title: string;
  description: string;
  type: AssessmentType;
  targetTypes: AssessmentType[];
  isActive: boolean;
  workflow: AssessmentFormWorkflow;
  version: number;
  isDefault: boolean;
  serviceDefinitionId?: number;
  introTitle?: string;
  introDescription?: string;
  estimatedDurationMinutes: number;
  layoutJson?: string;
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
  questionKey?: string;
  nextQuestionKey?: string;
  pageKey?: string;
  pageTitle?: string;
  groupKey?: string;
  groupTitle?: string;
  isRequired: boolean;
  placeholder?: string;
  description?: string;
  visibilityConditionJson?: string;
  requiredConditionJson?: string;
  validationJson?: string;
  minValue?: number;
  maxValue?: number;
  minFiles?: number;
  maxFiles?: number;
  allowMultipleFiles?: boolean;
}

export interface Option {
  id: number;
  text: string;
  value: number; // ScoreValue
  order: number;
  nextQuestionKey?: string;
}

export interface CreateAssessmentFormDto {
  code?: string;
  title: string;
  description: string;
  type: AssessmentType;
  targetTypes: AssessmentType[];
  workflow?: AssessmentFormWorkflow;
  version?: number;
  isDefault?: boolean;
  serviceDefinitionId?: number;
  introTitle?: string;
  introDescription?: string;
  estimatedDurationMinutes?: number;
  layoutJson?: string;
  questions: CreateQuestionDto[];
}

export interface CreateQuestionDto {
  question: string;
  type: QuestionType;
  weight: number;
  tags: string[];
  options: CreateOptionDto[];
  order: number;
  questionKey?: string;
  nextQuestionKey?: string;
  pageKey?: string;
  pageTitle?: string;
  groupKey?: string;
  groupTitle?: string;
  isRequired?: boolean;
  placeholder?: string;
  description?: string;
  visibilityConditionJson?: string;
  requiredConditionJson?: string;
  validationJson?: string;
  minValue?: number;
  maxValue?: number;
  minFiles?: number;
  maxFiles?: number;
  allowMultipleFiles?: boolean;
}

export interface CreateOptionDto {
  text: string;
  scoreValue: number;
  order: number;
  nextQuestionKey?: string;
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
  submissionId?: number;
  saveAsDraft?: boolean;
  draftKey?: string;
  summaryJson?: string;
  answers: AssessmentAnswerDto[];
}

export interface AssessmentAnswerDto {
  questionId: number;
  selectedOptionId?: number;
  textResponse?: string;
  booleanResponse?: boolean;
  numberResponse?: number;
  dateResponse?: string;
  jsonResponse?: string;
}

export interface UserProfileDto {
    userId: string;
    role: string;
    skills: Record<string, number>;
    needs: Record<string, number>;
    personality: Record<string, number>;
    preferences: Record<string, boolean>;
}
