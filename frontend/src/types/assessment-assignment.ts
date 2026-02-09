export enum AssessmentAssignmentStatus {
    Pending = 0,
    InProgress = 1,
    Completed = 2,
    Expired = 3,
    Cancelled = 4
}

export interface AssessmentAssignment {
    id: number;
    userId: string;
    userFullName: string;
    formId: number;
    formTitle: string;
    assignedDate: string;
    deadline?: string;
    isMandatory: boolean;
    status: AssessmentAssignmentStatus;
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

export interface CreateAssessmentAssignment {
    userId: string;
    formId: number;
    deadline?: string;
    startDate?: string;
    isMandatory: boolean;
}

export interface UserAssessmentSummary {
    userId: string;
    fullName: string;
    role: string;
    isActive: boolean;
    totalAssigned: number;
    completed: number;
    pending: number;
    overdue: number;
}
