export interface ReportCategory {
    id: number;
    title: string;
    order: number;
    isActive: boolean;
    items: ReportItem[];
}

export interface ReportItem {
    id: number;
    categoryId: number;
    title: string;
    defaultValue: string;
    parentId: number | null;
    order: number;
    isActive: boolean;
    subItems: ReportItem[];
}

export interface CreateReportCategoryDto {
    title: string;
    order: number;
    isActive?: boolean;
}

export interface UpdateReportCategoryDto {
    title: string;
    order: number;
    isActive: boolean;
}

export interface CreateReportItemDto {
    categoryId: number;
    title: string;
    defaultValue: string;
    parentId?: number;
    order: number;
}

export interface UpdateReportItemDto {
    title: string;
    defaultValue: string;
    order: number;
    isActive: boolean;
}

export interface SubmitNursingReportDto {
    careRecipientId: number;
    shift: string;
    content: string;
    items: SubmitReportItemDto[];
}

export interface SubmitReportItemDto {
    itemId: number;
    isChecked: boolean;
    value: string;
}
