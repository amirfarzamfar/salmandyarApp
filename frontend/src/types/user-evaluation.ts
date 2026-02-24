export enum UserEvaluationStatus {
    Pending = 0,
    InProgress = 1,
    Completed = 2,
    Expired = 3,
    Cancelled = 4
}

export enum AssessmentType {
    NurseAssessment = 0,
    SeniorAssessment = 1,
    SpecializedAssessment = 2,
    Exam = 3,
}

export interface UserEvaluation {
    id: number;
    userId: string;
    userFullName: string;
    formId: number;
    formTitle: string;
    formType: AssessmentType;
    assignedDate: string;
    deadline?: string;
    isMandatory: boolean;
    status: UserEvaluationStatus;
    submissionId?: number;
    score?: number;
    completedDate?: string;
    submissionDetails?: SubmissionDetail;
}

export interface SubmissionDetail {
    id: number;
    totalScore: number;
    submittedAt: string;
    answers: QuestionAnswerDetail[];
}

export interface QuestionAnswerDetail {
    questionId: number;
    questionText: string;
    weight: number;
    tags: string[];
    selectedOptionText?: string;
    selectedOptionScore?: number;
    textResponse?: string;
    booleanResponse?: boolean;
}

export interface CreateUserEvaluation {
    userId: string;
    formId: number;
    deadline?: string;
    startDate?: string;
    isMandatory: boolean;
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
