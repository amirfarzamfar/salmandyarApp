import api from "@/lib/axios";
import type {
  PagedResponse,
  ContractTemplateDto,
  ContractAssignmentDto,
  UserContractAssignmentSummaryDto,
  ContractDocumentDto,
  ContractAuditLogDto,
  MyContractStatusDto,
  CreateContractTemplateDto,
  UpdateContractTemplateDto,
  AssignContractDto,
  SaveContractFieldValuesDto,
  SignContractDto,
  ToggleContractTemplateDto,
  ContractFieldDto,
  ContractFieldValueDto,
} from "@/types/contract";

/* =========================================================================
   BIDIRECTIONAL FIELD NAME MAPPING (back-end DTO names  <->  front-end names)
   Back-end uses its Entity-level property names; front-end uses conventions
   from initial design. We keep components stable and adapt everything HERE.
   ========================================================================= */

/* ---------- Front-end field DTO shape -> Back-end field body ---------- */

type UpsertField_Front = {
  id?: number;
  key: string;
  label: string;
  fieldType: number;
  order: number;
  isRequired: boolean;
  placeholder?: string;
  description?: string;
  options?: string[];
  defaultValueFromProfilePath?: string;
  defaultValue?: string;
  validationRegex?: string;
  isFromProfile?: boolean;
};

type UpsertField_Back = {
  id?: number;
  fieldKey: string;
  label: string;
  fieldType: number;
  order: number;
  isRequired: boolean;
  placeholder?: string;
  defaultValueFromProfile?: string;
  options?: string[];
};

function mapFieldRequest(f: UpsertField_Front): UpsertField_Back {
  return {
    id: f.id,
    fieldKey: f.key,
    label: f.label,
    fieldType: f.fieldType,
    order: f.order,
    isRequired: f.isRequired,
    placeholder: f.placeholder,
    defaultValueFromProfile: f.defaultValueFromProfilePath,
    options: f.options,
  };
}

/* ---------- Back-end field DTO -> Front-end ContractFieldDto ---------- */

type BackField = {
  id: number;
  contractTemplateId: number;
  fieldKey: string;
  label: string;
  fieldType: number;
  order: number;
  isRequired: boolean;
  placeholder?: string | null;
  defaultValueFromProfile?: string | null;
  options?: string[] | null;
};

function mapFieldResponse(f: BackField): ContractFieldDto {
  return {
    id: f.id,
    contractTemplateId: f.contractTemplateId,
    key: f.fieldKey,
    label: f.label,
    fieldType: f.fieldType as ContractFieldDto["fieldType"],
    order: f.order,
    isRequired: f.isRequired,
    placeholder: f.placeholder ?? undefined,
    description: undefined,
    options: f.options ?? undefined,
    defaultValueFromProfilePath: f.defaultValueFromProfile ?? undefined,
    defaultValue: undefined,
    validationRegex: undefined,
    isFromProfile: undefined,
  };
}

/* ---------- Back-end field value DTO -> Front-end ContractFieldValueDto ---------- */

type BackFieldValue = {
  id?: number;
  assignmentId: number;
  contractFieldId?: number | null;
  fieldKey: string;
  stringValue?: string | null;
  numberValue?: number | null;
  dateValue?: string | null;
};

function mapFieldValueResponse(v: BackFieldValue): ContractFieldValueDto {
  return {
    fieldId: v.contractFieldId ?? 0,
    key: v.fieldKey,
    stringValue: v.stringValue ?? undefined,
    numberValue: v.numberValue ?? undefined,
    decimalValue: v.numberValue ?? undefined,
    dateValue: typeof v.dateValue === "string" ? v.dateValue : undefined,
    boolValue: undefined,
  };
}

/* ---------- Back-end Template Summary (inside Assignment) ---------- */

type BackTplSummary = {
  id: number;
  title: string;
  code: string;
  version: number;
  cooperationType: string;
};

/* ---------- Back-end Template Full -> Front ContractTemplateDto ---------- */

type BackTplFull = {
  id: number;
  title: string;
  code: string;
  cooperationType: string;
  contractText: string;
  version: number;
  isActive: boolean;
  effectiveStartDate?: string | null;
  effectiveEndDate?: string | null;
  publishedAt?: string | null;
  fields?: BackField[] | null;
  assignmentCount: number;
  signedAssignmentCount: number;
  createdAt?: string | null;
  updatedAt?: string | null;
};

function mapTemplateResponse(t: BackTplFull): ContractTemplateDto {
  return {
    id: t.id,
    code: t.code,
    title: t.title,
    version: t.version,
    contractType: t.cooperationType || undefined,
    contractText: t.contractText,
    description: undefined,
    isActive: !!t.isActive,
    isPublished: !!t.publishedAt,
    effectiveFrom: t.effectiveStartDate
      ? new Date(t.effectiveStartDate).toISOString().slice(0, 10)
      : undefined,
    effectiveTo: t.effectiveEndDate
      ? new Date(t.effectiveEndDate).toISOString().slice(0, 10)
      : undefined,
    defaultCooperationType: undefined,
    defaultDurationDays: undefined,
    fields: (t.fields || []).map(mapFieldResponse),
    assignmentCount: t.assignmentCount || 0,
    signedAssignmentCount: t.signedAssignmentCount || 0,
    createdAt: t.createdAt || new Date(0).toISOString(),
    updatedAt: t.updatedAt ?? undefined,
  };
}

/* ---------- Back-end Assignment -> Front ContractAssignmentDto ---------- */

type BackAssignment = {
  id: number;
  contractTemplateId: number;
  userId: string;
  contractNumber?: string | null;
  status: number;
  statusLabel?: string;
  assignedAt: string;
  submittedAt?: string | null;
  signedAt?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  userFullName?: string | null;
  userNationalCode?: string | null;
  userPhoneNumber?: string | null;
  template?: BackTplSummary | null;
  fieldValues?: BackFieldValue[] | null;
  isLocked?: boolean;
};

function mapAssignmentResponse(a: BackAssignment): ContractAssignmentDto {
  const fvs = (a.fieldValues || []).map(mapFieldValueResponse);
  const totalFields = fvs.length;
  const completed = fvs.filter((f) => {
    const v = f.stringValue ?? (f.numberValue != null ? String(f.numberValue) : null) ?? f.dateValue ?? null;
    return v !== null && v !== undefined && v !== "";
  }).length;
  const percent = totalFields === 0 ? 0 : Math.round((100 * completed) / totalFields);
  return {
    id: a.id,
    contractTemplateId: a.contractTemplateId,
    templateTitle: a.template?.title || "",
    templateVersion: a.template?.version ?? 0,
    templateCode: a.template?.code || "",
    contractType: a.template?.cooperationType || undefined,
    userId: a.userId,
    userFullName: a.userFullName ?? undefined,
    contractNumber: a.contractNumber ?? undefined,
    status: a.status as ContractAssignmentDto["status"],
    statusLabel: a.statusLabel || "",
    assignedAt: a.assignedAt,
    caregiverSubmittedAt: a.submittedAt ?? undefined,
    signedAt: a.signedAt ?? undefined,
    startDate: a.startDate ?? undefined,
    endDate: a.endDate ?? undefined,
    cooperationType: a.template?.cooperationType || undefined,
    isLocked: !!a.isLocked,
    fieldValues: fvs,
    fieldCount: totalFields,
    completedFieldCount: completed,
    completionPercentage: percent,
    createdAt: a.assignedAt,
    updatedAt: a.submittedAt ?? a.signedAt ?? undefined,
    signedSnapshotContractText: undefined,
    signedSnapshotContentHash: undefined,
  };
}

/* ---------- Back-end Document -> Front ---------- */

type BackDocument = {
  assignmentId: number;
  contractNumber: string;
  renderedHtml: string;
  status: number;
  signedAt?: string | null;
  contentHash?: string | null;
  transactionId?: string | null;
  isSnapshot: boolean;
};

function mapDocumentResponse(d: BackDocument): ContractDocumentDto {
  return {
    assignmentId: d.assignmentId,
    contractTemplateId: 0,
    templateTitle: "",
    templateVersion: 0,
    templateCode: "",
    contractNumber: d.contractNumber,
    status: d.status as ContractDocumentDto["status"],
    statusLabel: "",
    renderedHtml: d.renderedHtml,
    signedSnapshotContentHash: d.contentHash ?? undefined,
    isFinalVersion: !!d.isSnapshot,
    generatedAt: new Date().toISOString(),
    fieldValues: [],
  };
}

/* ---------- Back-end MyStatus -> Front ---------- */

type BackMyStatus = {
  hasActiveAssignment: boolean;
  assignment: BackAssignment | null;
  activeTemplateVersion: number;
  activeTemplateTitle?: string | null;
  identityVerified: boolean;
  professionalEligibilityVerified: boolean;
  contractSigned: boolean;
};

function mapMyStatusResponse(s: BackMyStatus & {
  templateFields?: BackField[] | null;
}): MyContractStatusDto {
  return {
    hasActiveContract: s.hasActiveAssignment,
    assignment: s.assignment ? mapAssignmentResponse(s.assignment) : undefined,
    templateFields: (s.templateFields || []).map(mapFieldResponse),
    identityVerified: !!s.identityVerified,
    professionalEligibilityVerified: !!s.professionalEligibilityVerified,
    contractSigned: !!s.contractSigned,
  };
}

/* ---------- Back-end UserSummaryAssignment -> Front ---------- */

type BackUserAssignmentSummary = {
  assignmentId: number;
  contractTemplateId: number;
  templateTitle: string;
  templateVersion: number;
  contractNumber?: string | null;
  status: number;
  statusLabel: string;
  assignedAt: string;
  signedAt?: string | null;
  startDate?: string | null;
  endDate?: string | null;
};

function mapUserAssignmentsSummaryResponse(
  s: BackUserAssignmentSummary
): UserContractAssignmentSummaryDto {
  return {
    id: s.assignmentId,
    assignmentId: s.assignmentId,
    contractTemplateId: s.contractTemplateId,
    templateTitle: s.templateTitle,
    templateVersion: s.templateVersion,
    contractNumber: s.contractNumber ?? undefined,
    status: s.status as UserContractAssignmentSummaryDto["status"],
    statusLabel: s.statusLabel || "",
    assignedAt: s.assignedAt,
    signedAt: s.signedAt ?? undefined,
    startDate: s.startDate ?? undefined,
    endDate: s.endDate ?? undefined,
  };
}

/* ---------- Paged helper ---------- */

type AnyPaged<T> = {
  items?: T[] | null;
  data?: T[] | null;
  totalCount?: number;
  pageNumber?: number;
  pageSize?: number;
};

function mapPaged<TIn, TOut>(
  raw: AnyPaged<TIn> | null | undefined,
  mapItem: (x: TIn) => TOut
): PagedResponse<TOut> {
  const arr =
    (raw as any)?.items ??
    (raw as any)?.data ??
    (Array.isArray(raw) ? raw : []) ??
    [];
  const totalCount = (raw as any)?.totalCount ?? (arr || []).length;
  const pageNumber = (raw as any)?.pageNumber ?? 1;
  const pageSize = Math.max(1, (raw as any)?.pageSize ?? (arr || []).length);
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  return {
    items: (arr || []).map((x: TIn) => mapItem(x)),
    totalCount,
    pageNumber,
    pageSize,
    totalPages,
    hasPreviousPage: pageNumber > 1,
    hasNextPage: pageNumber < totalPages,
  };
}

/* ============================= PUBLIC API ============================= */

export const contractService = {
  // ========================================================================
  // Templates (Admin)
  // ========================================================================
  async getTemplates(params: {
    page?: number;
    pageSize?: number;
    search?: string;
  } = {}): Promise<PagedResponse<ContractTemplateDto>> {
    const qs = new URLSearchParams();
    if (params.page) qs.append("page", params.page.toString());
    if (params.pageSize) qs.append("pageSize", params.pageSize.toString());
    if (params.search) qs.append("search", params.search);
    const res = await api.get<AnyPaged<BackTplFull>>(
      `/contracts/templates?${qs.toString()}`
    );
    return mapPaged(res.data, mapTemplateResponse);
  },

  async getTemplate(id: number): Promise<ContractTemplateDto> {
    const res = await api.get<BackTplFull>(`/contracts/templates/${id}`, {
      params: { includeFields: true },
    });
    return mapTemplateResponse(res.data);
  },

  async createTemplate(dto: CreateContractTemplateDto): Promise<ContractTemplateDto> {
    const body = {
      title: dto.title,
      code: dto.code,
      cooperationType: dto.contractType || dto.defaultCooperationType || undefined,
      contractText: dto.contractText,
      isActive: dto.isActive,
      effectiveStartDate: dto.effectiveFrom || undefined,
      effectiveEndDate: dto.effectiveTo || undefined,
      publish: !!dto.isPublished,
      fields: (dto.fields || []).map((f) =>
        mapFieldRequest(f as unknown as UpsertField_Front)
      ),
    };
    const res = await api.post<BackTplFull>(`/contracts/templates`, body);
    return mapTemplateResponse(res.data);
  },

  async updateTemplate(
    id: number,
    dto: UpdateContractTemplateDto
  ): Promise<ContractTemplateDto> {
    const body = {
      title: dto.title,
      cooperationType: dto.contractType || dto.defaultCooperationType || undefined,
      contractText: dto.contractText,
      isActive: dto.isActive,
      effectiveStartDate: dto.effectiveFrom || undefined,
      effectiveEndDate: dto.effectiveTo || undefined,
      publish: !!dto.isPublished,
      fields: (dto.fields || []).map((f) =>
        mapFieldRequest(f as unknown as UpsertField_Front)
      ),
    };
    const res = await api.put<BackTplFull>(`/contracts/templates/${id}`, body);
    return mapTemplateResponse(res.data);
  },

  async toggleTemplate(id: number, dto: ToggleContractTemplateDto): Promise<void> {
    await api.patch(`/contracts/templates/${id}/toggle`, dto);
  },

  async previewTemplate(params: {
    templateId: number;
    assignmentId?: number;
    userId?: string;
  }): Promise<{ html: string }> {
    const qs = new URLSearchParams();
    if (params.assignmentId) qs.append("assignmentId", params.assignmentId.toString());
    if (params.userId) qs.append("userId", params.userId);
    const res = await api.get<{ html?: string; renderedHtml?: string }>(
      `/contracts/templates/${params.templateId}/preview?${qs.toString()}`
    );
    return { html: res.data?.renderedHtml || res.data?.html || "" };
  },

  // ========================================================================
  // Assignments (Admin)
  // ========================================================================
  async getAssignments(params: {
    page?: number;
    pageSize?: number;
    search?: string;
    templateId?: number;
    userId?: string;
    status?: number;
  } = {}): Promise<PagedResponse<ContractAssignmentDto>> {
    const qs = new URLSearchParams();
    if (params.page) qs.append("page", params.page.toString());
    if (params.pageSize) qs.append("pageSize", params.pageSize.toString());
    if (params.search) qs.append("search", params.search);
    if (params.templateId) qs.append("templateId", params.templateId.toString());
    if (params.userId) qs.append("userId", params.userId);
    if (params.status !== undefined) qs.append("status", params.status.toString());
    const res = await api.get<AnyPaged<BackAssignment>>(
      `/contracts/assignments?${qs.toString()}`
    );
    return mapPaged(res.data, mapAssignmentResponse);
  },

  async getAssignment(id: number): Promise<ContractAssignmentDto> {
    const res = await api.get<BackAssignment>(`/contracts/assignments/${id}`);
    return mapAssignmentResponse(res.data);
  },

  async getUserAssignments(userId: string): Promise<UserContractAssignmentSummaryDto[]> {
    const res = await api.get<BackUserAssignmentSummary[] | AnyPaged<BackUserAssignmentSummary>>(
      `/contracts/assignments/user/${userId}`
    );
    const data = Array.isArray(res.data)
      ? res.data
      : ((res.data as any)?.items ?? (res.data as any)?.data ?? []);
    return (data || []).map(mapUserAssignmentsSummaryResponse);
  },

  async assignContract(dto: AssignContractDto & {
    templateId?: number;
    caregiverUserId?: string;
  }): Promise<ContractAssignmentDto> {
    const contractTemplateId =
      Number(dto.contractTemplateId || (dto as any).templateId || 0) || undefined;
    const userId = (dto.userId || (dto as any).caregiverUserId || "").toString();
    const body = {
      contractTemplateId,
      userId,
      startDate: dto.startDate || undefined,
      endDate: dto.endDate || undefined,
    };
    const res = await api.post<BackAssignment>(`/contracts/assignments`, body);
    return mapAssignmentResponse(res.data);
  },

  async getAssignmentDocument(id: number): Promise<ContractDocumentDto> {
    const res = await api.get<BackDocument>(
      `/contracts/assignments/${id}/document`
    );
    return mapDocumentResponse(res.data);
  },

  async getAssignmentAudit(id: number): Promise<ContractAuditLogDto[]> {
    const res = await api.get<ContractAuditLogDto[] | AnyPaged<ContractAuditLogDto>>(
      `/contracts/assignments/${id}/audit`
    );
    return Array.isArray(res.data)
      ? res.data
      : ((res.data as any)?.items ?? (res.data as any)?.data ?? []);
  },

  // ========================================================================
  // My Contract (Nurse / Caregiver)
  // ========================================================================
  async getMyStatus(autoAssign = true): Promise<MyContractStatusDto> {
    const res = await api.get<BackMyStatus>(`/contracts/my/status`, {
      params: { autoAssign },
    });
    return mapMyStatusResponse(res.data);
  },

  async saveMyFieldValues(dto: SaveContractFieldValuesDto & { markAsCompleted?: boolean }): Promise<ContractAssignmentDto> {
    const fieldValues = (dto.fieldValues || []).map((fv: any) => {
      const rawVal: unknown = fv.value ?? fv.stringValue ?? fv.dateValue ?? fv.numberValue;
      return {
        fieldKey: fv.fieldKey || fv.key,
        stringValue:
          rawVal === null || rawVal === undefined || rawVal === ""
            ? undefined
            : String(rawVal),
      };
    });
    const body = { assignmentId: dto.assignmentId, fieldValues };
    const res = await api.post<BackAssignment>(`/contracts/my/fields`, body);
    const out = mapAssignmentResponse(res.data);

    // Non-blocking optional status bump endpoint to Completed if asked
    if ((dto as any).markAsCompleted) {
      try {
        await api.post(`/contracts/my/${dto.assignmentId}/complete`, {});
      } catch {
        // If endpoint not yet exposed, ignore.
      }
    }
    return out;
  },

  async signMyContract(dto: SignContractDto): Promise<ContractAssignmentDto> {
    const body = {
      assignmentId: dto.assignmentId,
      acceptTerms: dto.acceptTerms,
      declarationText: dto.declarationText,
    };
    const res = await api.post<BackAssignment>(`/contracts/my/sign`, body);
    return mapAssignmentResponse(res.data);
  },

  async getMyDocument(assignmentId?: number): Promise<ContractDocumentDto> {
    const qs = new URLSearchParams();
    if (assignmentId) qs.append("assignmentId", assignmentId.toString());
    const res = await api.get<BackDocument>(
      `/contracts/my/document?${qs.toString()}`
    );
    return mapDocumentResponse(res.data);
  },
};
