import api from '@/lib/axios';
import { isAxiosError } from 'axios';

export type LabDataType = 'Number' | 'Text' | 'Boolean';
export interface LabCategory {
  id: number; name: string; description?: string; isActive: boolean; sortOrder: number; definitionCount: number;
}
export type LabCategoryInput = Omit<LabCategory, 'id' | 'definitionCount'>;
export interface LabDefinition extends Omit<LabCategory, 'definitionCount'> {
  categoryId: number; englishName?: string; code: string; unit?: string; dataType: LabDataType;
  referenceMin?: number | null; referenceMax?: number | null; criticalMin?: number | null; criticalMax?: number | null;
}
export type LabDefinitionInput = Omit<LabDefinition, 'id'>;
export interface LabResult {
  id: string; labTestDefinitionId: number; name: string; dataType: LabDataType;
  numericValue?: number | null; textValue?: string | null; booleanValue?: boolean | null; unit?: string;
  referenceMin?: number | null; referenceMax?: number | null; isAbnormal: boolean; notes?: string;
}
export interface LabReport {
  id: string; patientId: number; categoryId: number; categoryName: string; performedAt: string;
  reportTitle: string; laboratoryName: string; notes?: string; fileUrl?: string; fileType?: string;
  version: string; canEdit: boolean; results: LabResult[];
}
export interface LabReportInput {
  categoryId: number; performedAt: string; reportTitle: string; laboratoryName: string; notes?: string;
  version?: string; results: Pick<LabResult, 'labTestDefinitionId' | 'numericValue' | 'textValue' | 'booleanValue' | 'notes'>[];
}
export interface LabReportSaveResult {
  report: LabReport;
  created: boolean;
}
export interface LabTrendPoint {
  reportId: string; performedAt: string; value: number; unit?: string; referenceMin?: number; referenceMax?: number;
}
export interface LabPage {
  items: LabReport[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
}
const patientPath = (id: number) => `/labs/patients/${id}`;
const reportPath = (patientId: number, id?: string) => `${patientPath(patientId)}/reports${id ? `/${id}` : ''}`;
export const labApi = {
  me: async () => (await api.get<{ patientId: number }>('/labs/me')).data,
  categories: async (params: { all?: boolean } = {}) =>
    (await api.get<LabCategory[]>('/labs/categories', { params })).data,
  definitions: async (params: { all?: boolean; categoryId?: number; search?: string; isActive?: boolean; active?: boolean } = {}) => {
    const p = { ...params };
    if (typeof p.isActive === 'boolean' && typeof p.active !== 'boolean') p.active = p.isActive;
    return (await api.get<LabDefinition[]>('/labs/definitions', { params: p })).data;
  },
  createCategory: async (input: LabCategoryInput) => (await api.post<LabCategory>('/labs/categories', input)).data,
  updateCategory: async (id: number, input: LabCategoryInput) => (await api.put<LabCategory>(`/labs/categories/${id}`, input)).data,
  deleteCategory: async (id: number) => (await api.delete<void>(`/labs/categories/${id}`)).data,
  createDefinition: async (input: LabDefinitionInput) => (await api.post<LabDefinition>('/labs/definitions', input)).data,
  updateDefinition: async (id: number, input: LabDefinitionInput) => (await api.put<LabDefinition>(`/labs/definitions/${id}`, input)).data,
  deleteDefinition: async (id: number) => (await api.delete<void>(`/labs/definitions/${id}`)).data,
  saveCategory: (input: LabCategoryInput, id?: number) =>
    id ? api.put(`/labs/categories/${id}`, input) : api.post('/labs/categories', input),
  saveDefinition: (input: LabDefinitionInput, id?: number) =>
    id ? api.put(`/labs/definitions/${id}`, input) : api.post('/labs/definitions', input),
  deleteCatalog: (kind: 'categories' | 'definitions', id: number) => api.delete(`/labs/${kind}/${id}`),
  reports: async (patientId: number, params: { categoryId?: number; from?: string; to?: string; page?: number; pageSize?: number }) => {
    const r = await api.get<LabPage>(reportPath(patientId), {
      params: { page: params.page ?? 1, pageSize: params.pageSize ?? 10, categoryId: params.categoryId, from: params.from, to: params.to },
    });
    const data: LabPage = {
      ...r.data,
      totalPages: r.data.totalPages ?? Math.max(1, Math.ceil((r.data.totalItems ?? r.data.total ?? 0) / (r.data.pageSize ?? params.pageSize ?? 10))),
      totalItems: r.data.totalItems ?? r.data.total ?? 0,
    };
    return data;
  },
  report: async (patientId: number, id: string) => (await api.get<LabReport>(reportPath(patientId, id))).data,
  saveReport: async (patientId: number, input: LabReportInput, id?: string): Promise<LabReportSaveResult> => {
    const res = id
      ? await api.put<LabReport>(reportPath(patientId, id), input)
      : await api.post<LabReport>(reportPath(patientId), input);
    return { report: res.data, created: !id };
  },
  deleteReport: (report: LabReport) => api.delete(reportPath(report.patientId, report.id), { params: { version: report.version } }),
  trend: async (patientId: number, definitionId: number) => {
    const resp = await api.get<Array<Record<string, unknown>>>(`${patientPath(patientId)}/trend/${definitionId}`);
    return (Array.isArray(resp.data) ? resp.data : []).map((row) => {
      const getAny = <T,>(keys: string[]): T | undefined => {
        for (const k of keys) if (k in row && (row[k] != null)) return row[k] as T;
        return undefined;
      };
      const numericValue = getAny<number>(['value', 'Value', 'numericValue', 'NumericValue']);
      const performedAtRaw = getAny<string | Date>(['performedAt', 'PerformedAt', 'date', 'Date']);
      const reportIdRaw = getAny<string | number>(['reportId', 'ReportId', 'patientLabReportId']);
      return {
        reportId: typeof reportIdRaw === 'number' ? String(reportIdRaw) : typeof reportIdRaw === 'string' ? reportIdRaw : '',
        performedAt: typeof performedAtRaw === 'string' ? performedAtRaw : performedAtRaw instanceof Date ? performedAtRaw.toISOString() : '',
        value: typeof numericValue === 'number' ? numericValue : Number(numericValue) || 0,
        unit: getAny<string>(['unit', 'Unit']),
        referenceMin: (() => { const v = getAny<number | string>(['referenceMin', 'ReferenceMin', 'RefMin']); return typeof v === 'number' ? v : typeof v === 'string' ? Number(v) : undefined; })(),
        referenceMax: (() => { const v = getAny<number | string>(['referenceMax', 'ReferenceMax', 'RefMax']); return typeof v === 'number' ? v : typeof v === 'string' ? Number(v) : undefined; })(),
      } satisfies LabTrendPoint;
    });
  },
  upload: async (report: LabReport, file: File, progress: (value: number) => void) => {
    const form = new FormData();
    form.append('file', file); form.append('version', report.version);
    return (await api.post<LabReport>(`${reportPath(report.patientId, report.id)}/file`, form, {
      headers: { 'Content-Type': 'multipart/form-data' }, timeout: 120000,
      onUploadProgress: (event) => progress(Math.min(99, Math.round(100 * event.loaded / (event.total || file.size)))),
    })).data;
  },
  removeFile: async (report: LabReport) => (await api.delete<LabReport>(
    `${reportPath(report.patientId, report.id)}/file`, { params: { version: report.version } })).data,
  file: async (report: LabReport) => (await api.get<Blob>(
    `${reportPath(report.patientId, report.id)}/file`, { responseType: 'blob', timeout: 60000 })).data,
};
export function labError(error: unknown) {
  if (isAxiosError(error)) {
    const status = error.response?.status;
    const body = error.response?.data;
    const message = typeof body === 'object' && body != null && 'error' in body ? String((body as Record<string, unknown>).error ?? '') : undefined;
    const fallback = status === 409 ? 'اطلاعات از زمان دریافت شما تغییر کرده؛ صفحه را دوباره بارگذاری کنید.' : status === 403 ? 'شما دسترسی لازم برای انجام این عملیات را ندارید.' : status === 404 ? 'اطلاعات مورد نظر یافت نشد.' : status === 401 ? 'لطفاً دوباره وارد سیستم شوید.' : 'ارتباط برقرار نشد. دوباره تلاش کنید.';
    return message || fallback;
  }
  return error instanceof Error ? error.message : 'عملیات انجام نشد.';
}
export function labErrorAxios(error: unknown) {
  if (!isAxiosError(error)) return { status: 0, body: null as unknown };
  return { status: error.response?.status ?? 0, body: error.response?.data ?? null };
}
