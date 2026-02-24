export enum UserEvaluationStatus {
    Pending = 0,
    InProgress = 1,
    Completed = 2,
    Expired = 3,
    Cancelled = 4
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

export enum QuestionType {
  MultipleChoice = 0,
  TrueFalse = 1,
  ShortAnswer = 2,
  LongAnswer = 3,
}

export interface UserEvaluationForm {
  id: number;
  title: string;
  description: string;
  type: AssessmentType;
  isActive: boolean;
  questions: UserEvaluationQuestion[];
}

export interface UserEvaluationQuestion {
  questionId: number;
  type: QuestionType; 
  question: string;
  options: UserEvaluationOption[];
  weight: number;
  tags: string[];
  order: number;
}

export interface UserEvaluationOption {
  id: number;
  text: string;
  value: number; // ScoreValue
  order: number;
}

export interface CreateUserEvaluationFormDto {
  title: string;
  description: string;
  type: AssessmentType;
  questions: CreateUserEvaluationQuestionDto[];
}

export interface CreateUserEvaluationQuestionDto {
  question: string;
  type: QuestionType;
  weight: number;
  tags: string[];
  options: CreateUserEvaluationOptionDto[];
  order: number;
}

export interface CreateUserEvaluationOptionDto {
  text: string;
  scoreValue: number;
  order: number;
}

export interface UserEvaluation {
    id: number;
    userId: string;
    userFullName: string;
    formId: number;
    formTitle: string;
    formType: AssessmentType;
    status: UserEvaluationStatus;
    assignedDate: string;
    completedDate?: string;
    score?: number;
}

export interface CreateUserEvaluation {
    userId: string;
    formId: number;
    dueDate?: string;
}

export interface UserEvaluationSummary {
    userId: string;
    fullName: string;
    role: string;
    isActive: boolean;
    totalEvaluations: number;
    completed: number;
    pending: number;
    overdue: number;
}
