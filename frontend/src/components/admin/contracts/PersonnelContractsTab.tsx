"use client";

import type { AxiosError } from "axios";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import {
  Calendar,
  CheckCircle2,
  FileSignature,
  HandCoins,
  Loader2,
  Plus,
  ShieldCheck,
  Eye,
  Download,
  X,
  Hash,
  UserCheck,
  FileText
} from "lucide-react";
import {
  CONTRACT_STATUS_COLORS,
  CONTRACT_STATUS_LABELS,
  ContractStatus,
  type UserContractAssignmentSummaryDto,
  type ContractAuditLogDto,
  type ContractTemplateDto,
  type ContractAssignmentDto,
  type ContractDocumentDto
} from "@/types/contract";
import { contractService } from "@/services/contract.service";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import FormalContractLetter from "@/components/contracts/FormalContractLetter";

type Props = {
  userId: string;
  fullName: string;
};

const inputClassName =
  "w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm text-gray-900 shadow-sm transition focus:border-medical-500 focus:outline-none focus:ring-4 focus:ring-medical-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-medical-400 dark:focus:ring-medical-900/40";

const labelClassName = "block text-sm font-bold text-gray-700 dark:text-gray-200 mb-1.5";

const getApiErrorMessage = (error: unknown, fallback: string) => {
  const axiosError = error as AxiosError<{ error?: string; message?: string }>;
  return axiosError.response?.data?.error || axiosError.response?.data?.message || fallback;
};

const formatDateTime = (value?: string | null) => {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleString("fa-IR");
  } catch {
    return String(value);
  }
};

export default function PersonnelContractsTab({ userId, fullName }: Props) {
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState<UserContractAssignmentSummaryDto[]>([]);
  const [templates, setTemplates] = useState<ContractTemplateDto[]>([]);

  const [assignOpen, setAssignOpen] = useState(false);
  const [assignSubmitting, setAssignSubmitting] = useState(false);
  const [assignForm, setAssignForm] = useState({
    templateId: 0 as number | 0,
    startDate: "",
    endDate: "",
    cooperationType: "",
    notes: ""
  });

  const [docOpen, setDocOpen] = useState(false);
  const [docLoading, setDocLoading] = useState(false);
  const [docAssignment, setDocAssignment] = useState<UserContractAssignmentSummaryDto | null>(null);
  const [docFullAssignment, setDocFullAssignment] = useState<ContractAssignmentDto | null>(null);
  const [docDocument, setDocDocument] = useState<ContractDocumentDto | null>(null);

  const [auditOpen, setAuditOpen] = useState(false);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditLogs, setAuditLogs] = useState<ContractAuditLogDto[]>([]);
  const [auditAssignment, setAuditAssignment] = useState<UserContractAssignmentSummaryDto | null>(null);

  useEffect(() => {
    void loadAll();
  }, [userId]);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [a, t] = await Promise.all([
        contractService.getUserAssignments(userId),
        contractService.getTemplates({ page: 1, pageSize: 200 })
      ]);
      const assignmentsArray = Array.isArray(a) ? a : (a as any).items || [];
      const normalized: UserContractAssignmentSummaryDto[] = assignmentsArray.map((x: any) => ({
        ...x,
        id: x.id ?? x.assignmentId,
        createdAt: x.createdAt ?? x.assignedAt,
        cooperationType: x.cooperationType,
        completedAt: x.completedAt
      }));
      setAssignments(normalized);
      setTemplates((t.items || []) as ContractTemplateDto[]);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "بارگذاری قراردادها انجام نشد."));
    } finally {
      setLoading(false);
    }
  };

  const activeAssignment = useMemo(
    () =>
      assignments.find(
        (a) => a.status !== ContractStatus.Revoked && a.status !== ContractStatus.Expired
      ) || assignments[0] || null,
    [assignments]
  );

  const assignmentIdOf = (a: UserContractAssignmentSummaryDto) => a.id ?? a.assignmentId;

  const openDocument = async (a: UserContractAssignmentSummaryDto) => {
    setDocAssignment(a);
    setDocOpen(true);
    setDocLoading(true);
    setDocFullAssignment(null);
    setDocDocument(null);
    try {
      const id = assignmentIdOf(a);
      const [fullAssignment, doc] = await Promise.all([
        contractService.getAssignment(id),
        contractService.getAssignmentDocument(id),
      ]);
      setDocFullAssignment(fullAssignment);
      setDocDocument(doc);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "بارگذاری سند قرارداد انجام نشد."));
    } finally {
      setDocLoading(false);
    }
  };

  const handleRefreshDocument = async () => {
    if (!docAssignment) return;
    setDocLoading(true);
    try {
      const id = assignmentIdOf(docAssignment);
      const [fullAssignment, doc] = await Promise.all([
        contractService.getAssignment(id),
        contractService.getAssignmentDocument(id),
      ]);
      setDocFullAssignment(fullAssignment);
      setDocDocument(doc);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "بازسازی سند انجام نشد."));
    } finally {
      setDocLoading(false);
    }
  };

  const openAudit = async (a: UserContractAssignmentSummaryDto) => {
    setAuditAssignment(a);
    setAuditOpen(true);
    setAuditLoading(true);
    setAuditLogs([]);
    try {
      const raw = await contractService.getAssignmentAudit(assignmentIdOf(a));
      const logs: ContractAuditLogDto[] = (raw as any[] || []).map((l: any) => ({
        ...l,
        createdAt: l.createdAt ?? l.actionAt,
        userFullName: l.userFullName ?? l.actorFullName,
        userRole: l.userRole ?? l.actorRole,
        clientIp: l.clientIp ?? l.ipAddress,
        message: l.message ?? l.detailsJson ?? undefined,
        actionType: l.actionType ?? l.action
      }));
      setAuditLogs(logs);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "بارگذاری تاریخچه انجام نشد."));
    } finally {
      setAuditLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!assignForm.templateId) {
      toast.error("لطفاً یک شابلون قرارداد انتخاب کنید.");
      return;
    }
    if (!assignForm.startDate) {
      toast.error("تاریخ شروع الزامی است.");
      return;
    }
    setAssignSubmitting(true);
    try {
      await contractService.assignContract({
        templateId: Number(assignForm.templateId),
        caregiverUserId: userId,
        employerUserId: undefined,
        startDate: assignForm.startDate || undefined,
        endDate: assignForm.endDate || undefined,
        cooperationType: assignForm.cooperationType || undefined,
        notes: assignForm.notes || undefined
      } as any);
      toast.success("قرارداد با موفقیت به پرسنل تخصیص داده شد.");
      setAssignOpen(false);
      setAssignForm({ templateId: 0, startDate: "", endDate: "", cooperationType: "", notes: "" });
      await loadAll();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "تخصیص قرارداد انجام نشد."));
    } finally {
      setAssignSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h3 className="text-lg font-black text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <HandCoins className="h-5 w-5 text-medical-500" />
            قراردادهای همکاری — {fullName}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            مدیریت و مشاهده تخصیص‌های قرارداد همکاری، وضعیت، سند نهایی و تاریخچه امضا.
          </p>
        </div>
        <Button variant="secondary" onClick={() => setAssignOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          تخصیص قرارداد جدید
        </Button>
      </div>

      {activeAssignment && (
        <div className="rounded-3xl bg-white dark:bg-gray-900 shadow-sm border border-gray-100 dark:border-gray-800 p-5 md:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-medical-50 dark:bg-medical-500/10 flex items-center justify-center">
                <HandCoins className="h-7 w-7 text-medical-500" />
              </div>
              <div>
                <div className="text-sm text-gray-500">قرارداد فعال</div>
                <div className="text-xl font-black text-gray-900 dark:text-gray-100">
                  {activeAssignment.templateTitle || "قرارداد همکاری"}
                </div>
                <div className="mt-1 flex flex-wrap gap-2 text-xs text-gray-500">
                  <span className="inline-flex items-center gap-1">
                    <Hash className="h-3 w-3" /> شماره: {activeAssignment.contractNumber || "-"}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <FileText className="h-3 w-3" /> نسخه: {activeAssignment.templateVersion ?? 1}
                  </span>
                </div>
              </div>
            </div>
            <Badge className={`${CONTRACT_STATUS_COLORS[activeAssignment.status]} text-white gap-1.5 px-3 py-1.5 text-xs`}>
              <UserCheck className="h-3.5 w-3.5" />
              {CONTRACT_STATUS_LABELS[activeAssignment.status]}
            </Badge>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 text-sm">
            <InfoCell label="نوع همکاری" value={activeAssignment.cooperationType || "-"} />
            <InfoCell label="تاریخ ایجاد" value={formatDateTime(activeAssignment.createdAt ?? activeAssignment.assignedAt)} />
            <InfoCell label="تاریخ تکمیل" value={formatDateTime(activeAssignment.completedAt)} />
            <InfoCell label="تاریخ امضا" value={formatDateTime(activeAssignment.signedAt)} />
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => void openDocument(activeAssignment)}>
              <Eye className="h-4 w-4" />
              مشاهده سند نهایی
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => void openAudit(activeAssignment)}>
              <ShieldCheck className="h-4 w-4" />
              تاریخچه و Audit
            </Button>
            {activeAssignment.status === ContractStatus.Signed && (
              <Button variant="outline" size="sm" className="gap-1.5" onClick={() => void openDocument(activeAssignment)}>
                <Download className="h-4 w-4" />
                دریافت سند
              </Button>
            )}
          </div>
        </div>
      )}

      <div className="rounded-3xl bg-white dark:bg-gray-900 shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="px-5 py-4 md:px-6 md:py-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <h4 className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <FileSignature className="h-4 w-4 text-gray-500" />
            تاریخچه تخصیص‌های قرارداد
          </h4>
          <div className="text-xs text-gray-500">{assignments.length} مورد</div>
        </div>
        {loading ? (
          <div className="p-8 flex items-center justify-center text-gray-500">
            <Loader2 className="h-5 w-5 animate-spin mr-2" /> در حال بارگذاری...
          </div>
        ) : assignments.length === 0 ? (
          <div className="p-10 text-center">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
              <HandCoins className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-600 dark:text-gray-300 font-medium">تاکنون هیچ قراردادی به این پرسنل تخصیص داده نشده است.</p>
            <p className="mt-1 text-sm text-gray-500">برای شروع، دکمه «تخصیص قرارداد جدید» را در بالا کلیک کنید.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800/50 text-xs text-gray-600 dark:text-gray-300">
                <tr>
                  <th className="px-5 py-3">شناسه</th>
                  <th className="px-5 py-3">عنوان قرارداد</th>
                  <th className="px-5 py-3">نسخه</th>
                  <th className="px-5 py-3">شماره قرارداد</th>
                  <th className="px-5 py-3">نوع همکاری</th>
                  <th className="px-5 py-3">وضعیت</th>
                  <th className="px-5 py-3">تاریخ امضا</th>
                  <th className="px-5 py-3 text-left">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {assignments.map((a) => (
                  <tr key={assignmentIdOf(a)} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                    <td className="px-5 py-4 text-gray-500 font-mono text-xs">#{assignmentIdOf(a)}</td>
                    <td className="px-5 py-4 font-semibold text-gray-800 dark:text-gray-100">
                      {a.templateTitle || "قرارداد همکاری"}
                    </td>
                    <td className="px-5 py-4 text-gray-500">{a.templateVersion ?? 1}</td>
                    <td className="px-5 py-4 text-gray-500">{a.contractNumber || "-"}</td>
                    <td className="px-5 py-4 text-gray-600">{a.cooperationType || "-"}</td>
                    <td className="px-5 py-4">
                      <Badge className={`${CONTRACT_STATUS_COLORS[a.status]} text-white text-xs`}>
                        {CONTRACT_STATUS_LABELS[a.status]}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-gray-500">{formatDateTime(a.signedAt)}</td>
                    <td className="px-5 py-4 text-left">
                      <div className="flex justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => void openDocument(a)}
                          className="inline-flex items-center gap-1 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-2.5 py-1.5 text-xs text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                          title="مشاهده سند"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          سند
                        </button>
                        <button
                          type="button"
                          onClick={() => void openAudit(a)}
                          className="inline-flex items-center gap-1 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-2.5 py-1.5 text-xs text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                          title="تاریخچه"
                        >
                          <ShieldCheck className="h-3.5 w-3.5" />
                          تاریخچه
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Assign Dialog */}
      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-medical-500" />
              تخصیص قرارداد جدید به {fullName}
            </DialogTitle>
            <DialogDescription>
              شابلون قرارداد فعال و تاریخ شروع/پایان و نوع همکاری را مشخص کنید.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className={labelClassName}>شابلون قرارداد *</label>
              <select
                value={assignForm.templateId ? String(assignForm.templateId) : ""}
                onChange={(e) => setAssignForm((f) => ({ ...f, templateId: Number(e.target.value) }))}
                className={inputClassName}
              >
                <option value="">انتخاب شابلون...</option>
                {templates.length === 0 && (
                  <option value="_none" disabled>
                    شابلونی تعریف نشده است.
                  </option>
                )}
                {templates.map((t) => (
                  <option key={t.id} value={String(t.id)}>
                    {t.title} — نسخه {t.version} {t.code ? `(${t.code})` : ""}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={labelClassName}>تاریخ شروع</label>
                <input
                  type="date"
                  className={inputClassName}
                  value={assignForm.startDate}
                  onChange={(e) => setAssignForm((f) => ({ ...f, startDate: e.target.value }))}
                />
              </div>
              <div>
                <label className={labelClassName}>تاریخ پایان (اختیاری)</label>
                <input
                  type="date"
                  className={inputClassName}
                  value={assignForm.endDate}
                  onChange={(e) => setAssignForm((f) => ({ ...f, endDate: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <label className={labelClassName}>نوع همکاری (اختیاری)</label>
              <select
                value={assignForm.cooperationType || ""}
                onChange={(e) => setAssignForm((f) => ({ ...f, cooperationType: e.target.value }))}
                className={inputClassName}
              >
                <option value="">نامشخص — از شابلون استفاده کن</option>
                <option value="تمام‌وقت">تمام‌وقت</option>
                <option value="نیمه‌وقت">نیمه‌وقت</option>
                <option value="ساعتی">ساعتی / پروژه‌ای</option>
                <option value="غیردائم">غیردائم / قراردادی</option>
                <option value="شیفتی">شیفتی (روزانه/شبانه)</option>
              </select>
            </div>
            <div>
              <label className={labelClassName}>یادداشت مدیریتی (اختیاری)</label>
              <input
                className={inputClassName}
                placeholder="مثلاً: قرارداد آزمایشی سه ماهه..."
                value={assignForm.notes}
                onChange={(e) => setAssignForm((f) => ({ ...f, notes: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setAssignOpen(false)} disabled={assignSubmitting}>
              انصراف
            </Button>
            <Button variant="primary" disabled={assignSubmitting} onClick={() => void handleAssign()}>
              {assignSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              ) : (
                <CheckCircle2 className="h-4 w-4 mr-1" />
              )}
              {assignSubmitting ? "در حال ثبت..." : "تخصیص قرارداد"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Document Viewer */}
      <Dialog open={docOpen} onOpenChange={setDocOpen}>
        <DialogContent className="max-w-6xl h-[92vh] flex flex-col p-4 gap-0">
          <DialogHeader className="px-1 pb-3 mb-2 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between gap-2">
              <DialogTitle className="flex items-center gap-2 text-base">
                <FileText className="h-5 w-5 text-medical-500" />
                سند رسمی قرارداد همکاری — {docAssignment?.contractNumber || docAssignment?.templateTitle || "سند"}
              </DialogTitle>
              <button
                type="button"
                onClick={() => setDocOpen(false)}
                className="rounded-xl p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {docAssignment && (
              <div className="mt-2 flex flex-wrap gap-4 text-xs text-gray-500">
                <span>
                  وضعیت:{" "}
                  <Badge className={`${CONTRACT_STATUS_COLORS[docAssignment.status]} text-white`}>
                    {CONTRACT_STATUS_LABELS[docAssignment.status]}
                  </Badge>
                </span>
                <span className="inline-flex items-center gap-1">
                  <UserCheck className="h-3.5 w-3.5" /> نسخه {docAssignment.templateVersion ?? 1}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" /> تاریخ امضا:{" "}
                  {formatDateTime(docAssignment.signedAt) || "—"}
                </span>
              </div>
            )}
          </DialogHeader>
          <div className="flex-1 min-h-0 overflow-y-auto pr-1 -mr-2">
            {docLoading || !docFullAssignment ? (
              <div className="h-full min-h-[60vh] flex items-center justify-center text-gray-500">
                <Loader2 className="h-6 w-6 animate-spin mr-2" /> در حال آماده‌سازی سند رسمی قرارداد...
              </div>
            ) : (
              <FormalContractLetter
              assignment={docFullAssignment}
              document={docDocument}
              renderedHtml={docDocument?.renderedHtml}
              showToolbar={true}
              loading={docLoading}
              onClose={() => setDocOpen(false)}
              onRefresh={handleRefreshDocument}
            />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Audit Log Dialog */}
      <Dialog open={auditOpen} onOpenChange={setAuditOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-medical-500" />
              تاریخچه تغییرات قرارداد —{" "}
              {auditAssignment?.contractNumber || `#${assignmentIdOf(auditAssignment ?? ({} as any)) || ""}`}
            </DialogTitle>
            <DialogDescription>
              تمامی عملیات انجام‌شده روی این تخصیص قرارداد به صورت غیرقابل انکار (Insert-only) ثبت می‌شوند.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto space-y-3">
            {auditLoading ? (
              <div className="p-6 flex items-center justify-center text-gray-500">
                <Loader2 className="h-5 w-5 animate-spin mr-2" /> در حال بارگذاری...
              </div>
            ) : auditLogs.length === 0 ? (
              <div className="p-6 text-center text-gray-500">هنوز رکوردی در تاریخچه ثبت نشده است.</div>
            ) : (
              auditLogs.map((log) => {
                const userName = log.userFullName ?? log.actorFullName;
                const userRole = log.userRole ?? log.actorRole;
                const created = log.createdAt ?? log.actionAt;
                const clientIp = log.clientIp ?? log.ipAddress;
                const message =
                  log.message ??
                  (log.detailsJson ? (() => { try { return JSON.stringify(JSON.parse(log.detailsJson), null, 2).slice(0, 300); } catch { return log.detailsJson; } })() : undefined);
                return (
                  <div
                    key={log.id}
                    className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{log.actionLabel || `#${log.actionType ?? log.action}`}</Badge>
                        <span className="text-xs text-gray-500 font-mono">#{log.id}</span>
                      </div>
                      <div className="text-xs text-gray-500">{formatDateTime(created)}</div>
                    </div>
                    {userName && (
                      <div className="text-xs text-gray-600 mb-1.5">
                        توسط: <span className="font-semibold">{userName}</span>
                        {userRole && ` (${userRole})`}
                      </div>
                    )}
                    {message && (
                      <div className="text-sm text-gray-700 dark:text-gray-200 leading-6 whitespace-pre-wrap">
                        {message}
                      </div>
                    )}
                    {(clientIp || log.userAgent || log.transactionId) && (
                      <div className="mt-2 pt-2 border-t border-dashed border-gray-200 dark:border-gray-800 text-[11px] text-gray-500 space-y-0.5">
                        {log.transactionId && (
                          <div>
                            شناسه تراکنش: <span className="font-mono">{log.transactionId}</span>
                          </div>
                        )}
                        {clientIp && (
                          <div>
                            آی‌پی کلاینت: <span className="font-mono">{clientIp}</span>
                          </div>
                        )}
                        {log.userAgent && <div className="break-all">User-Agent: {log.userAgent}</div>}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setAuditOpen(false)}>بستن</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function InfoCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/40 px-4 py-3">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="mt-1 font-semibold text-gray-800 dark:text-gray-100">{value}</div>
    </div>
  );
}
