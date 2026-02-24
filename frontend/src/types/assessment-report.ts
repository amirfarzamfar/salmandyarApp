export interface ExamStatisticsDto {
  examId: number;
  title: string;
  type: number; // AssessmentType enum
  isActive: boolean;
  totalAttempts: number;
  averageScore: number;
  maxScore: number;
  minScore: number;
  lastAttemptDate: string;
}

export interface UserExamResultDto {
  submissionId: number;
  userId: string;
  userFullName: string;
  startDate: string;
  endDate: string;
  totalScore: number;
  isPassed: boolean;
  correctCount: number;
  incorrectCount: number;
  unansweredCount: number;
  totalQuestions: number;
}

export interface ExamAnalyticsDto {
  examId: number;
  title: string;
  questions: QuestionAnalysisDto[];
}

export interface QuestionAnalysisDto {
  questionId: number;
  questionText: string;
  totalAnswers: number;
  correctAnswersCount: number;
  correctPercentage: number;
  options: OptionAnalysisDto[];
}

export interface OptionAnalysisDto {
  optionId: number;
  optionText: string;
  isCorrect: boolean;
  selectionCount: number;
  selectionPercentage: number;
}

export interface UserAttemptDetailDto {
  submissionId: number;
  userId: string;
  userFullName: string;
  examTitle: string;
  submissionDate: string;
  totalScore: number;
  answers: QuestionAnswerDetailDto[];
}

export interface QuestionAnswerDetailDto {
  questionId: number;
  questionText: string;
  weight: number;
  selectedOptionId?: number;
  selectedOptionText?: string;
  textResponse?: string;
  isCorrect: boolean;
  scoreObtained: number;
  options: OptionDetailDto[];
}

export interface OptionDetailDto {
  id: number;
  text: string;
  isCorrect: boolean;
  scoreValue: number;
}

export interface ReportFilterDto {
  examId?: number;
  userId?: string;
  fromDate?: string;
  toDate?: string;
  minScore?: number;
  maxScore?: number;
}
