"use client";

import { useEffect, useMemo, useState } from "react";
import { contractService } from "@/services/contract.service";
import {
  CONTRACT_STATUS_LABELS,
  CONTRACT_STATUS_COLORS,
  ContractStatus,
  type PagedResponse,
  type ContractTemplateDto,
  type ContractAssignmentDto,
  type ContractDocumentDto,
} from "@/types/contract";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/Button";
import toast from "react-hot-toast";
import {
  Plus,
  RefreshCw,
  Eye,
  Edit2,
  Trash2,
  ToggleLeft,
  ToggleRight,
  FileSignature,
  UserCircle2,
  Search,
  HandCoins,
  Layers,
  Loader2,
  CheckCircle2,
  XCircle,
  Calendar,
  FileText,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { userService } from "@/services/user.service";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import FormalContractLetter from "@/components/contracts/FormalContractLetter";

type TabKey = "templates" | "assignments";

const card =
  "rounded-2xl bg-white dark:bg-gray-900 shadow-sm border border-gray-100 dark:border-gray-800";
const inputCls =
  "w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-medical-500";
const labelCls = "block text-sm font-bold text-gray-700 dark:text-gray-200 mb-1.5";

export default function ContractsAdminPageClient() {
  const router = useRouter();
  const [tab, setTab] = useState<TabKey>("templates");

  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [templates, setTemplates] = useState<PagedResponse<ContractTemplateDto> | null>(null);
  const [assignments, setAssignments] = useState<PagedResponse<ContractAssignmentDto> | null>(null);

  const [tplPage, setTplPage] = useState(1);
  const [tplSize] = useState(10);
  const [tplSearch, setTplSearch] = useState("");

  const [assignPage, setAssignPage] = useState(1);
  const [assignSize] = useState(10);
  const [assignSearch, setAssignSearch] = useState("");
  const [assignStatus, setAssignStatus] = useState<ContractStatus | "">("");
  const [assignTplId, setAssignTplId] = useState<number | "">("");

  const [togglingId, setTogglingId] = useState<number | null>(null);

  // Document viewer state
  const [docOpen, setDocOpen] = useState(false);
  const [docLoading, setDocLoading] = useState(false);
  const [docAssignment, setDocAssignment] = useState<ContractAssignmentDto | null>(null);
  const [docDocument, setDocDocument] = useState<ContractDocumentDto | null>(null);

  // Assign dialog state
  const [assignDlgOpen, setAssignDlgOpen] = useState(false);
  const [assignDlgSubmitting, setAssignDlgSubmitting] = useState(false);
  const [assignDlgForm, setAssignDlgForm] = useState({
    userId: "",
    userFullName: "",
    templateId: 0 as number | 0,
    startDate: "",
    endDate: "",
  });
  const [userSearchLoading, setUserSearchLoading] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [userSearchResults, setUserSearchResults] = useState<
    { id: string; firstName?: string; lastName?: string; fullName?: string; nationalCode?: string; phoneNumber?: string }[]
  >([]);

  const fetchTemplates = async (p = tplPage) => {
    setLoadingTemplates(true);
    try {
      const r = await contractService.getTemplates({
        page: p,
        pageSize: tplSize,
        search: tplSearch || undefined,
      });
      setTemplates(r);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "بارگذاری شابلون‌ها ناموفق بود");
    } finally {
      setLoadingTemplates(false);
    }
  };

  const fetchAssignments = async (p = assignPage) => {
    setLoadingAssignments(true);
    try {
      const r = await contractService.getAssignments({
        page: p,
        pageSize: assignSize,
        search: assignSearch || undefined,
        status: assignStatus === "" ? undefined : (assignStatus as number),
        templateId: assignTplId === "" ? undefined : Number(assignTplId),
      });
      setAssignments(r);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "بارگذاری تخصیص‌ها ناموفق بود");
    } finally {
      setLoadingAssignments(false);
    }
  };

  useEffect(() => {
    if (tab === "templates") fetchTemplates(tplPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, tplPage]);

  useEffect(() => {
    if (tab === "assignments") fetchAssignments(assignPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, assignPage, assignStatus, assignTplId]);

  // Assign dialog handlers
  const openAssignDlg = () => {
    setAssignDlgForm({ userId: "", userFullName: "", templateId: 0, startDate: "", endDate: "" });
    setUserSearchTerm("");
    setUserSearchResults([]);
    setAssignDlgOpen(true);
  };

  const runUserSearch = async () => {
    const term = userSearchTerm.trim();
    if (!term) return;
    setUserSearchLoading(true);
    try {
      const r = await userService.getUsers({ searchTerm: term, pageNumber: 1, pageSize: 12, roleId: undefined } as any);
      const list: any[] = (r as any).items || (r as any).data || [];
      setUserSearchResults(
        list.map((u) => ({
          id: u.id,
          firstName: u.firstName,
          lastName: u.lastName,
          fullName: u.fullName || [u.firstName, u.lastName].filter(Boolean).join(" ") || u.userName || u.phoneNumber || u.id,
          nationalCode: u.nationalCode,
          phoneNumber: u.phoneNumber,
        }))
      );
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "جست‌وجوی کاربران انجام نشد");
    } finally {
      setUserSearchLoading(false);
    }
  };

  const pickUser = (u: { id: string; fullName?: string }) => {
    setAssignDlgForm((f) => ({ ...f, userId: u.id, userFullName: u.fullName || u.id }));
    setUserSearchResults([]);
    setUserSearchTerm(u.fullName || u.id);
  };

  const submitAssignDlg = async () => {
    if (!assignDlgForm.userId) {
      toast.error("ابتدا یک کاربر/نیرو را انتخاب کنید");
      return;
    }
    if (!assignDlgForm.templateId) {
      toast.error("شابلون قرارداد را انتخاب کنید");
      return;
    }
    setAssignDlgSubmitting(true);
    try {
      await contractService.assignContract({
        contractTemplateId: Number(assignDlgForm.templateId),
        userId: assignDlgForm.userId,
        startDate: assignDlgForm.startDate || undefined,
        endDate: assignDlgForm.endDate || undefined,
      } as any);
      toast.success("قرارداد با موفقیت تخصیص داده شد");
      setAssignDlgOpen(false);
      fetchAssignments(assignPage);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "تخصیص قرارداد انجام نشد");
    } finally {
      setAssignDlgSubmitting(false);
    }
  };

  const handleToggleTemplate = async (tpl: ContractTemplateDto) => {
    setTogglingId(tpl.id);
    try {
      await contractService.toggleTemplate(tpl.id, { isActive: !tpl.isActive });
      toast.success("وضعیت شابلون تغییر کرد");
      fetchTemplates(tplPage);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "تغییر وضعیت ناموفق بود");
    } finally {
      setTogglingId(null);
    }
  };

  const openDocument = async (assignment: ContractAssignmentDto) => {
    setDocAssignment(assignment);
    setDocOpen(true);
    setDocLoading(true);
    setDocDocument(null);
    try {
      const [fullAssignment, doc] = await Promise.all([
        contractService.getAssignment(assignment.id),
        contractService.getAssignmentDocument(assignment.id),
      ]);
      setDocAssignment(fullAssignment);
      setDocDocument(doc);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "بارگذاری سند قرارداد انجام نشد.");
    } finally {
      setDocLoading(false);
    }
  };

  const handleRefreshDocument = async () => {
    if (!docAssignment) return;
    setDocLoading(true);
    try {
      const [fullAssignment, doc] = await Promise.all([
        contractService.getAssignment(docAssignment.id),
        contractService.getAssignmentDocument(docAssignment.id),
      ]);
      setDocAssignment(fullAssignment);
      setDocDocument(doc);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "بازسازی سند انجام نشد.");
    } finally {
      setDocLoading(false);
    }
  };

  const tplOptions = useMemo(() => templates?.items ?? [], [templates]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className={cn(card, "p-5")}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-medical-500 to-medical-600 text-white flex items-center justify-center shadow-glow-medical shrink-0">
              <HandCoins size={24} strokeWidth={2.2} />
            </div>
            <div>
              <h1 className="text-xl font-black text-gray-900 dark:text-white">
                مدیریت قراردادها
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                شابلون‌های قرارداد، فیلدهای پویا، تخصیص به نیروها و مشاهده سند نهایی امضاشده.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="ghost" onClick={() => tab === "templates" ? fetchTemplates() : fetchAssignments()}>
              <RefreshCw size={16} /> به‌روزرسانی
            </Button>
            <Button
              variant="primary"
              onClick={() => router.push("/dashboard/admin/contracts/templates/create")}
            >
              <Plus size={16} />
              ایجاد شابلون جدید
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
          <StatBadge
            label="کل شابلون‌ها"
            value={String(templates?.totalCount ?? 0)}
            Icon={Layers}
            tone="blue"
          />
          <StatBadge
            label="شابلون‌های فعال"
            value={String(templates?.items.filter((t) => t.isActive).length ?? 0)}
            Icon={CheckCircle2}
            tone="emerald"
          />
          <StatBadge
            label="کل تخصیص‌ها"
            value={String(assignments?.totalCount ?? 0)}
            Icon={UserCircle2}
            tone="indigo"
          />
          <StatBadge
            label="قراردادهای امضاشده"
            value={String(assignments?.items.filter((a) => a.status === ContractStatus.Signed).length ?? 0)}
            Icon={FileSignature}
            tone="emerald"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        <TabButton active={tab === "templates"} onClick={() => setTab("templates")}>
          <Layers size={16} />
          شابلون‌های قرارداد
        </TabButton>
        <TabButton active={tab === "assignments"} onClick={() => setTab("assignments")}>
          <UserCircle2 size={16} />
          تخصیص‌ها به نیروها
        </TabButton>
      </div>

      {tab === "templates" && (
        <section className={cn(card, "overflow-hidden")}>
          <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex flex-wrap gap-2 items-center justify-between">
            <div className="flex items-center gap-2 flex-1 min-w-[220px] max-w-md">
              <div className="relative w-full">
                <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={tplSearch}
                  onChange={(e) => setTplSearch(e.target.value)}
                  placeholder="جست‌وجوی عنوان / کد شابلون..."
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 pr-10 pl-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-medical-500"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setTplPage(1);
                      fetchTemplates(1);
                    }
                  }}
                />
              </div>
              <Button variant="ghost" onClick={() => { setTplPage(1); fetchTemplates(1); }}>
                جست‌وجو
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800/60 text-gray-600 dark:text-gray-300">
                <tr>
                  <th className="text-right px-4 py-3 font-bold">شناسه</th>
                  <th className="text-right px-4 py-3 font-bold">عنوان / کد</th>
                  <th className="text-right px-4 py-3 font-bold">نسخه</th>
                  <th className="text-right px-4 py-3 font-bold">وضعیت</th>
                  <th className="text-right px-4 py-3 font-bold">تخصیص‌ها</th>
                  <th className="text-right px-4 py-3 font-bold">امضا شده</th>
                  <th className="text-right px-4 py-3 font-bold">تاریخ ایجاد</th>
                  <th className="text-right px-4 py-3 font-bold whitespace-nowrap">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {loadingTemplates && (
                  <tr>
                    <td colSpan={8} className="text-center py-12">
                      <Loader2 size={24} className="mx-auto animate-spin text-medical-500" />
                    </td>
                  </tr>
                )}
                {!loadingTemplates && (!templates?.items.length) && (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-gray-500 dark:text-gray-400">
                      شابلونی یافت نشد. برای شروع، شابلون جدید ایجاد کنید.
                    </td>
                  </tr>
                )}
                {!loadingTemplates && templates?.items.map((tpl) => (
                  <tr key={tpl.id} className="hover:bg-gray-50/60 dark:hover:bg-gray-800/40">
                    <td className="px-4 py-3 font-mono text-xs">#{tpl.id}</td>
                    <td className="px-4 py-3">
                      <div className="font-black text-gray-900 dark:text-white">{tpl.title}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        کد: <span className="font-mono">{tpl.code}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="font-bold">
                        نسخه {tpl.version}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Badge className={cn("text-white border-0", tpl.isActive ? "bg-emerald-500" : "bg-slate-400")}>
                          {tpl.isActive ? "فعال" : "غیرفعال"}
                        </Badge>
                        {tpl.isPublished ? (
                          <Badge variant="outline" className="text-emerald-700 border-emerald-300 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800">
                            منتشرشده
                          </Badge>
                        ) : (
                          <Badge variant="secondary">پیش‌نویس</Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">{tpl.assignmentCount}</td>
                    <td className="px-4 py-3">{tpl.signedAssignmentCount}</td>
                    <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">
                      {new Date(tpl.createdAt).toLocaleDateString("fa-IR")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => router.push(`/dashboard/admin/contracts/templates/${tpl.id}/edit`)}
                        >
                          <Edit2 size={14} />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            contractService.previewTemplate({ templateId: tpl.id })
                              .then(({ html }) => {
                                const w = window.open("", "_blank");
                                if (w) {
                                  w.document.write(html);
                                  w.document.close();
                                }
                              })
                              .catch((e) => toast.error("پیش‌نمایش ناموفق بود"));
                          }}
                        >
                          <Eye size={14} />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleToggleTemplate(tpl)}
                          disabled={togglingId === tpl.id}
                          className={cn(tpl.isActive ? "text-emerald-600" : "text-amber-600")}
                        >
                          {togglingId === tpl.id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : tpl.isActive ? (
                            <ToggleRight size={18} />
                          ) : (
                            <ToggleLeft size={18} />
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {templates && templates.totalPages > 1 && (
            <Pagination
              page={tplPage}
              totalPages={templates.totalPages}
              onChange={(p) => {
                setTplPage(p);
                fetchTemplates(p);
              }}
            />
          )}
        </section>
      )}

      {tab === "assignments" && (
        <section className={cn(card, "overflow-hidden")}>
          <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex flex-wrap gap-2 items-center">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={assignSearch}
                onChange={(e) => setAssignSearch(e.target.value)}
                placeholder="جست‌وجوی نام / کد ملی / شماره قرارداد..."
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 pr-10 pl-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-medical-500"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setAssignPage(1);
                    fetchAssignments(1);
                  }
                }}
              />
            </div>
            <select
              value={assignTplId === "" ? "" : String(assignTplId)}
              onChange={(e) => {
                setAssignTplId(e.target.value === "" ? "" : Number(e.target.value));
                setAssignPage(1);
              }}
              className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2.5 text-sm"
            >
              <option value="">همه شابلون‌ها</option>
              {tplOptions.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title} (نسخه {t.version})
                </option>
              ))}
            </select>
            <select
              value={assignStatus === "" ? "" : String(assignStatus)}
              onChange={(e) => {
                setAssignStatus(e.target.value === "" ? "" : (Number(e.target.value) as ContractStatus));
                setAssignPage(1);
              }}
              className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2.5 text-sm"
            >
              <option value="">همه وضعیت‌ها</option>
              {Object.values(CONTRACT_STATUS_LABELS).map((label, idx) => (
                <option key={label} value={idx}>
                  {label}
                </option>
              ))}
            </select>
            <Button variant="ghost" onClick={() => { setAssignPage(1); fetchAssignments(1); }}>
              اعمال فیلتر
            </Button>
            <div className="flex-1" />
            <Button variant="secondary" className="gap-2" onClick={openAssignDlg}>
              <Plus size={16} />
              تخصیص قرارداد جدید
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800/60 text-gray-600 dark:text-gray-300">
                <tr>
                  <th className="text-right px-4 py-3 font-bold">شناسه</th>
                  <th className="text-right px-4 py-3 font-bold">نیرو</th>
                  <th className="text-right px-4 py-3 font-bold">قرارداد</th>
                  <th className="text-right px-4 py-3 font-bold">شماره قرارداد</th>
                  <th className="text-right px-4 py-3 font-bold">وضعیت</th>
                  <th className="text-right px-4 py-3 font-bold">تکمیل</th>
                  <th className="text-right px-4 py-3 font-bold">تاریخ امضا</th>
                  <th className="text-right px-4 py-3 font-bold whitespace-nowrap">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {loadingAssignments && (
                  <tr>
                    <td colSpan={8} className="text-center py-12">
                      <Loader2 size={24} className="mx-auto animate-spin text-medical-500" />
                    </td>
                  </tr>
                )}
                {!loadingAssignments && (!assignments?.items.length) && (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-gray-500 dark:text-gray-400">
                      تخصیصی با فیلترهای انتخاب‌شده یافت نشد.
                    </td>
                  </tr>
                )}
                {!loadingAssignments && assignments?.items.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50/60 dark:hover:bg-gray-800/40">
                    <td className="px-4 py-3 font-mono text-xs">#{a.id}</td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-gray-900 dark:text-white">
                        {a.userFullName ?? a.userId}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {a.userRole ?? "نامشخص"}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-gray-900 dark:text-white">
                        {a.templateTitle}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        نسخه {a.templateVersion} · {a.templateCode}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">
                      {a.contractNumber || `#${a.id}`}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        className={cn("text-white border-0", CONTRACT_STATUS_COLORS[a.status])}
                      >
                        {CONTRACT_STATUS_LABELS[a.status]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-20 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-medical-500"
                            style={{ width: `${a.completionPercentage}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-600 dark:text-gray-300 font-bold">
                          {a.completionPercentage}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">
                      {a.signedAt
                        ? new Date(a.signedAt).toLocaleString("fa-IR")
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            router.push(
                              `/dashboard/admin/users?userId=${a.userId}&tab=contracts`
                            );
                          }}
                          title="رفتن به پروفایل پرسنل"
                        >
                          <UserCircle2 size={14} />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => void openDocument(a)}
                          title="مشاهده سند رسمی قرارداد"
                        >
                          <Eye size={14} />
                        </Button>
                        {a.status === ContractStatus.Signed ? (
                          <Badge className="text-white border-0 bg-emerald-500">
                            <FileSignature size={12} className="ml-1" />
                            قفل
                          </Badge>
                        ) : (
                          <Badge variant="outline">
                            <XCircle size={12} className="ml-1 text-amber-500" />
                            باز
                          </Badge>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {assignments && assignments.totalPages > 1 && (
            <Pagination
              page={assignPage}
              totalPages={assignments.totalPages}
              onChange={(p) => {
                setAssignPage(p);
                fetchAssignments(p);
              }}
            />
          )}
        </section>
      )}

      {/* Assign Contract Dialog */}
      <Dialog open={assignDlgOpen} onOpenChange={setAssignDlgOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus size={18} className="text-medical-500" />
              تخصیص قرارداد همکاری به نیرو
            </DialogTitle>
            <DialogDescription>
              ابتدا کاربر/نیروی موردنظر را جست‌وجو و انتخاب کنید، سپس شابلون قرارداد و تاریخ را مشخص نمایید.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className={labelCls}>انتخاب نیرو (نام، کدملی، موبایل)</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search
                    size={15}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    className={cn(inputCls, "pr-10")}
                    value={userSearchTerm}
                    onChange={(e) => setUserSearchTerm(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        void runUserSearch();
                      }
                    }}
                    placeholder="مثلاً: علی یا ۰۹۱۲ یا ۰۰۱۲۳۴۵۶۷۸"
                  />
                </div>
                <Button variant="outline" onClick={() => void runUserSearch()} disabled={userSearchLoading}>
                  {userSearchLoading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
                  جست‌وجو
                </Button>
              </div>
              {assignDlgForm.userId && (
                <div className="mt-2 text-xs rounded-xl border border-medical-200 bg-medical-50 dark:bg-medical-500/10 dark:border-medical-800 px-3 py-2 text-medical-900 dark:text-medical-100">
                  ✅ کاربر انتخاب‌شده: <span className="font-black">{assignDlgForm.userFullName}</span>
                  <span className="text-gray-500 mr-2 font-mono">(id: {assignDlgForm.userId})</span>
                </div>
              )}
              {userSearchResults.length > 0 && (
                <div className="mt-2 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 max-h-56 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
                  {userSearchResults.map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => pickUser(u)}
                      className="w-full px-4 py-2.5 text-right hover:bg-gray-50 dark:hover:bg-gray-800 text-sm flex items-center justify-between"
                    >
                      <div>
                        <div className="font-semibold text-gray-800 dark:text-gray-100">
                          {u.fullName}
                        </div>
                        <div className="text-xs text-gray-500">
                          {u.phoneNumber || u.nationalCode || u.id}
                        </div>
                      </div>
                      <Badge variant="outline" className="ml-2">انتخاب</Badge>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label className={labelCls}>شابلون قرارداد</label>
              <select
                className={inputCls}
                value={assignDlgForm.templateId ? String(assignDlgForm.templateId) : ""}
                onChange={(e) =>
                  setAssignDlgForm((f) => ({ ...f, templateId: e.target.value ? Number(e.target.value) : 0 }))
                }
              >
                <option value="">انتخاب شابلون...</option>
                {tplOptions.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title} — نسخه {t.version}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>تاریخ شروع (اختیاری)</label>
                <input
                  type="date"
                  className={inputCls}
                  value={assignDlgForm.startDate}
                  onChange={(e) => setAssignDlgForm((f) => ({ ...f, startDate: e.target.value }))}
                />
              </div>
              <div>
                <label className={labelCls}>تاریخ پایان (اختیاری)</label>
                <input
                  type="date"
                  className={inputCls}
                  value={assignDlgForm.endDate}
                  onChange={(e) => setAssignDlgForm((f) => ({ ...f, endDate: e.target.value }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setAssignDlgOpen(false)} disabled={assignDlgSubmitting}>
              انصراف
            </Button>
            <Button variant="primary" disabled={assignDlgSubmitting} onClick={() => void submitAssignDlg()}>
              {assignDlgSubmitting ? <Loader2 size={14} className="animate-spin ml-1" /> : <CheckCircle2 size={14} className="ml-1" />}
              {assignDlgSubmitting ? "در حال تخصیص..." : "تأیید و تخصیص"}
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
                  <UserCircle2 className="h-3.5 w-3.5" /> نیرو:{" "}
                  <span className="font-semibold">{docAssignment.userFullName || docAssignment.userId}</span>
                </span>
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" /> تاریخ امضا:{" "}
                  {docAssignment.signedAt
                    ? new Date(docAssignment.signedAt).toLocaleDateString("fa-IR")
                    : "—"}
                </span>
              </div>
            )}
          </DialogHeader>
          <div className="flex-1 min-h-0 overflow-y-auto pr-1 -mr-2">
            {docLoading || !docAssignment ? (
              <div className="h-full min-h-[60vh] flex items-center justify-center text-gray-500">
                <Loader2 className="h-6 w-6 animate-spin mr-2" /> در حال آماده‌سازی سند رسمی قرارداد...
              </div>
            ) : (
              <FormalContractLetter
                assignment={docAssignment}
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
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-bold transition-all",
        active
          ? "bg-medical-500 text-white shadow-md shadow-medical-500/20"
          : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-800 hover:border-medical-300"
      )}
    >
      {children}
    </button>
  );
}

function StatBadge({
  label,
  value,
  Icon,
  tone,
}: {
  label: string;
  value: string;
  Icon: any;
  tone: "blue" | "emerald" | "indigo" | "amber";
}) {
  const tones = {
    blue: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-300",
    emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-300",
    indigo: "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-300",
    amber: "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-300",
  };
  return (
    <div className="rounded-2xl border border-gray-100 dark:border-gray-800 p-4 bg-white/70 dark:bg-gray-800/40">
      <div className="flex items-center gap-3">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", tones[tone])}>
          <Icon size={20} />
        </div>
        <div>
          <div className="text-xs text-gray-500 dark:text-gray-400">{label}</div>
          <div className="text-xl font-black text-gray-900 dark:text-white leading-tight">
            {value}
          </div>
        </div>
      </div>
    </div>
  );
}

function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (p: number) => void;
}) {
  const pages = Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
    const p = i + 1;
    if (totalPages <= 7) return p;
    if (page <= 4) return i + 1;
    if (page >= totalPages - 3) return totalPages - 6 + i;
    return page - 3 + i;
  });
  return (
    <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-2 flex-wrap">
      <div className="text-xs text-gray-500 dark:text-gray-400">
        صفحه {page} از {totalPages}
      </div>
      <div className="flex items-center gap-1">
        <Button
          size="sm"
          variant="ghost"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
        >
          قبلی
        </Button>
        {pages.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            className={cn(
              "h-9 min-w-9 px-3 rounded-xl text-sm font-bold transition-all",
              p === page
                ? "bg-medical-500 text-white"
                : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-800 hover:border-medical-300"
            )}
          >
            {p}
          </button>
        ))}
        <Button
          size="sm"
          variant="ghost"
          disabled={page >= totalPages}
          onClick={() => onChange(page + 1)}
        >
          بعدی
        </Button>
      </div>
    </div>
  );
}
