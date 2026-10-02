"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { contractService } from "@/services/contract.service";
import {
  CONTRACT_STATUS_LABELS,
  CONTRACT_STATUS_COLORS,
  ContractStatus,
  ContractFieldType,
  type MyContractStatusDto,
  type ContractFieldValueInputDto,
  type ContractFieldDto,
  type ContractDocumentDto,
} from "@/types/contract";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/Button";
import toast from "react-hot-toast";
import FormalContractLetter from "@/components/contracts/FormalContractLetter";
import {
  CheckCircle2,
  ShieldCheck,
  FileSignature,
  Loader2,
  HandCoins,
  Eye,
  Save,
  AlertTriangle,
  RefreshCw,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

const inputClassName =
  "w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm text-gray-900 shadow-sm transition focus:border-medical-500 focus:outline-none focus:ring-4 focus:ring-medical-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-medical-400 dark:focus:ring-medical-900/40";

const cardClassName =
  "rounded-3xl bg-white dark:bg-gray-900 shadow-sm border border-gray-100 dark:border-gray-800 p-5 md:p-6";

const sectionTitle = "text-base md:text-lg font-black text-gray-900 dark:text-white mb-4";

function formatJalaliDate(iso?: string) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, "0");
    const persian = new Intl.DateTimeFormat("fa-IR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(d);
    const time = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
    return `${persian} - ${time}`;
  } catch {
    return iso;
  }
}

type FieldMap = Record<number, string>;

function buildInitialValues(
  fields: ContractFieldDto[],
  existingValues: Record<string, string | undefined>
): FieldMap {
  const result: FieldMap = {};
  for (const f of fields) {
    const fromValues = existingValues[f.key];
    if (fromValues !== undefined && fromValues !== null) {
      result[f.id] = fromValues;
    } else if (f.defaultValue !== undefined && f.defaultValue !== null) {
      result[f.id] = f.defaultValue;
    } else {
      result[f.id] = "";
    }
  }
  return result;
}

export default function NurseContractPageClient() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [status, setStatus] = useState<MyContractStatusDto | null>(null);
  const [activeTab, setActiveTab] = useState<
    "status" | "form" | "preview" | "signed"
  >("status");
  const [values, setValues] = useState<FieldMap>({});
  const [saving, setSaving] = useState(false);
  const [signing, setSigning] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [previewHtml, setPreviewHtml] = useState<string>("");
  const [previewDoc, setPreviewDoc] = useState<ContractDocumentDto | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [errors, setErrors] = useState<Record<number, string>>({});

  const fetchStatus = useCallback(async (showToast = false) => {
    try {
      if (showToast) setRefreshing(true);
      else setLoading(true);
      const s = await contractService.getMyStatus(true);
      setStatus(s);
      if (s.assignment && s.hasActiveContract) {
        const tFields = (s.templateFields || []).slice().sort((a, b) => a.order - b.order);
        const existing: Record<string, string> = {};
        for (const v of s.assignment.fieldValues || []) {
          if (v.stringValue !== undefined && v.stringValue !== null)
            existing[v.key] = v.stringValue;
          else if (v.numberValue !== undefined)
            existing[v.key] = String(v.numberValue);
          else if (v.decimalValue !== undefined)
            existing[v.key] = String(v.decimalValue);
          else if (v.dateValue !== undefined) existing[v.key] = v.dateValue;
          else if (v.boolValue !== undefined)
            existing[v.key] = v.boolValue ? "true" : "false";
        }
        setValues(
          buildInitialValues(tFields, existing)
        );
        setFields(tFields);
        if (s.assignment.status === ContractStatus.Signed) {
          setActiveTab("signed");
        } else if (s.assignment.status === ContractStatus.PendingCompletion) {
          setActiveTab("form");
        } else {
          setActiveTab("preview");
        }
      }
      if (showToast) toast.success("وضعیت قرارداد به‌روز شد");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || "بارگذاری وضعیت قرارداد ناموفق بود");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const assignment = status?.assignment;
  const templateFields = useMemo<ContractFieldDto[]>(() => {
    return (status?.templateFields || []).slice().sort((a, b) => a.order - b.order);
  }, [status?.templateFields]);

  // Pre-fill any empty field values from defaultValue of template
  useEffect(() => {
    if (!assignment) return;
    (templateFields || []).forEach((f) => {
      setValues((prev) => {
        if (prev[f.id] !== undefined && String(prev[f.id]).trim() !== "") return prev;
        const fallback = f.defaultValue ?? "";
        return { ...prev, [f.id]: fallback };
      });
    });
  }, [assignment?.contractTemplateId, templateFields]);

  const [fields, setFields] = useState<ContractFieldDto[]>([]);
  useEffect(() => {
    if (!assignment) return;
    setFields(templateFields);
  }, [assignment?.contractTemplateId, templateFields]);

  const isLocked = !!assignment?.isLocked;

  const validate = useCallback(() => {
    const e: Record<number, string> = {};
    for (const f of fields) {
      if (f.isRequired && !String(values[f.id] ?? "").trim()) {
        e[f.id] = "پر کردن این فیلد الزامی است";
      }
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }, [fields, values]);

  const handleSave = async (markAsCompleted: boolean) => {
    if (!assignment) return;
    if (markAsCompleted && !validate()) {
      toast.error("لطفاً فیلدهای الزامی را تکمیل کنید");
      return;
    }
    setSaving(true);
    try {
      const payload: ContractFieldValueInputDto[] = fields
        .filter((f) => values[f.id] !== undefined)
        .map((f) => ({
          fieldId: f.id,
          key: f.key,
          value: String(values[f.id] ?? ""),
        }));
      await contractService.saveMyFieldValues({
        assignmentId: assignment.id,
        fieldValues: payload,
        markAsCompleted,
      });
      toast.success(
        markAsCompleted
          ? "قرارداد به‌عنوان تکمیل‌شده ثبت شد. اکنون می‌توانید امضا کنید."
          : "ذخیره انجام شد"
      );
      await fetchStatus();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "ذخیره اطلاعات قرارداد ناموفق بود"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleSign = async () => {
    if (!assignment) return;
    if (!acceptTerms) {
      toast.error("ابتدا تأیید مطالعه قرارداد را بزنید");
      return;
    }
    setSigning(true);
    try {
      await contractService.signMyContract({
        assignmentId: assignment.id,
        acceptTerms: true,
        declarationText:
          "متن قرارداد را کامل مطالعه کرده‌ام و مفاد آن را تأیید می‌کنم.",
      });
      toast.success("قرارداد با موفقیت امضا و قفل شد.");
      await fetchStatus();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "امضای قرارداد ناموفق بود"
      );
    } finally {
      setSigning(false);
    }
  };

  const loadPreview = async () => {
    if (!assignment) return;
    setPreviewLoading(true);
    setPreviewHtml("");
    setPreviewDoc(null);
    try {
      const doc = await contractService.getMyDocument(assignment.id);
      setPreviewDoc(doc);
      setPreviewHtml(doc.renderedHtml);
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "بارگذاری پیش‌نمایش ناموفق بود"
      );
    } finally {
      setPreviewLoading(false);
    }
  };

  useEffect(() => {
    if (
      assignment &&
      (activeTab === "preview" || activeTab === "signed") &&
      !previewHtml
    ) {
      loadPreview();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, assignment?.id]);

  if (loading) {
    return (
      <div className="space-y-5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-32 rounded-3xl bg-white/70 dark:bg-gray-900/70 animate-pulse border border-gray-100 dark:border-gray-800"
          />
        ))}
      </div>
    );
  }

  if (!status?.hasActiveContract || !assignment) {
    return (
      <div className={cardClassName}>
        <div className="flex flex-col items-center gap-4 text-center py-10">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <AlertTriangle size={32} />
          </div>
          <h2 className="text-xl font-black text-gray-900 dark:text-white">
            هنوز قرارداد فعالی برای شما ثبت نشده است
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">
            در صورت نیاز با مدیریت تماس بگیرید یا پس از تخصیص قرارداد، این صفحه
            را دوباره باز کنید.
          </p>
          <Button
            variant="primary"
            onClick={() => fetchStatus(true)}
            disabled={refreshing}
          >
            {refreshing ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <RefreshCw size={18} />
            )}
            بروزرسانی وضعیت
          </Button>
        </div>
      </div>
    );
  }

  const progressText = `${assignment.completedFieldCount}/${assignment.fieldCount} فیلد تکمیل شده`;

  return (
    <div className="space-y-6 pb-24 md:pb-8">
      {/* Status Card */}
      <section className={cardClassName}>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-medical-500 to-medical-600 text-white flex items-center justify-center shadow-glow-medical shrink-0">
              <HandCoins size={26} strokeWidth={2.2} />
            </div>
            <div className="space-y-2 min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg md:text-xl font-black text-gray-900 dark:text-white truncate">
                  قرارداد همکاری شما
                </h1>
                <Badge
                  className={cn(
                    "text-white border-0",
                    CONTRACT_STATUS_COLORS[assignment.status]
                  )}
                >
                  {CONTRACT_STATUS_LABELS[assignment.status]}
                </Badge>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-sm text-gray-600 dark:text-gray-300">
                <div className="truncate">
                  <span className="font-bold text-gray-700 dark:text-gray-200">
                    عنوان:{" "}
                  </span>
                  {assignment.templateTitle} - نسخه{" "}
                  {assignment.templateVersion}
                </div>
                <div className="truncate">
                  <span className="font-bold text-gray-700 dark:text-gray-200">
                    شناسه قرارداد:{" "}
                  </span>
                  {assignment.contractNumber || `#${assignment.id}`}
                </div>
                <div>
                  <span className="font-bold text-gray-700 dark:text-gray-200">
                    تاریخ شروع:{" "}
                  </span>
                  {formatJalaliDate(assignment.startDate)}
                </div>
                <div>
                  <span className="font-bold text-gray-700 dark:text-gray-200">
                    تاریخ پایان:{" "}
                  </span>
                  {formatJalaliDate(assignment.endDate)}
                </div>
                <div className="sm:col-span-2">
                  <span className="font-bold text-gray-700 dark:text-gray-200">
                    نوع همکاری:{" "}
                  </span>
                  {assignment.cooperationType || "تعیین نشده"}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs pt-1">
                <Badge variant="outline">
                  پیشرفت: {assignment.completionPercentage}% ({progressText})
                </Badge>
                {!!assignment.signedAt && (
                  <Badge variant="secondary">
                    امضا: {formatJalaliDate(assignment.signedAt)}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2 shrink-0 sm:justify-end">
            {assignment.status !== ContractStatus.Signed && (
              <Button
                variant="secondary"
                onClick={() => setActiveTab("form")}
                size="md"
              >
                <Save size={18} />
                تکمیل قرارداد
              </Button>
            )}
            {assignment.status === ContractStatus.Signed ? (
              <Button
                variant="primary"
                onClick={() => {
                  setActiveTab("signed");
                  if (!previewHtml) loadPreview();
                }}
                size="md"
              >
                <Eye size={18} />
                مشاهده قرارداد
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={() => {
                  setActiveTab("preview");
                  if (!previewHtml) loadPreview();
                }}
                size="md"
              >
                <Eye size={18} />
                پیش‌نمایش قرارداد
              </Button>
            )}
            <Button
              variant="ghost"
              onClick={() => fetchStatus(true)}
              disabled={refreshing}
              size="md"
            >
              {refreshing ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <RefreshCw size={18} />
              )}
            </Button>
          </div>
        </div>

        {/* Three-phase badges: Identity, Eligibility, Contract */}
        <div className="mt-6 grid grid-cols-3 gap-3">
          <TripBadge
            title="احراز هویت هویتی"
            done={status.identityVerified}
            Icon={ShieldCheck}
            active={activeTab === "form" || activeTab === "preview"}
          />
          <TripBadge
            title="احراز صلاحیت حرفه‌ای"
            done={status.professionalEligibilityVerified}
            Icon={CheckCircle2}
            active={activeTab === "form" || activeTab === "preview"}
          />
          <TripBadge
            title="انعقاد قرارداد همکاری"
            done={status.contractSigned}
            Icon={FileSignature}
            active={
              activeTab === "preview" ||
              activeTab === "signed" ||
              assignment.status === ContractStatus.Signed
            }
          />
        </div>
      </section>

      {/* Tabs */}
      {assignment.status !== ContractStatus.Signed && (
        <div className="flex gap-2 overflow-x-auto px-1 pb-1 scrollbar-hide">
          <TabButton
            active={activeTab === "status"}
            onClick={() => setActiveTab("status")}
          >
            خلاصه وضعیت
          </TabButton>
          <TabButton
            active={activeTab === "form"}
            onClick={() => setActiveTab("form")}
          >
            تکمیل اطلاعات
          </TabButton>
          <TabButton
            active={activeTab === "preview"}
            onClick={() => {
              setActiveTab("preview");
              if (!previewHtml) loadPreview();
            }}
          >
            پیش‌نمایش قرارداد
          </TabButton>
        </div>
      )}

      {activeTab === "status" && (
        <section className={cardClassName}>
          <h2 className={sectionTitle}>خلاصه وضعیت قرارداد</h2>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 text-sm">
            <InfoRow label="وضعیت قرارداد">
              <Badge
                className={cn(
                  "text-white border-0",
                  CONTRACT_STATUS_COLORS[assignment.status]
                )}
              >
                {CONTRACT_STATUS_LABELS[assignment.status]}
              </Badge>
            </InfoRow>
            <InfoRow label="قفل شده؟">
              {assignment.isLocked ? (
                <Badge className="text-white border-0 bg-emerald-500">بله</Badge>
              ) : (
                <Badge variant="secondary">خیر - قابل ویرایش</Badge>
              )}
            </InfoRow>
            <InfoRow label="تاریخ تخصیص">
              {formatJalaliDate(assignment.assignedAt)}
            </InfoRow>
            <InfoRow label="تاریخ امضا">
              {formatJalaliDate(assignment.signedAt)}
            </InfoRow>
            <InfoRow label="تاریخ تأیید کارفرما (آینده)">
              {formatJalaliDate(assignment.employerSignedAt)}
            </InfoRow>
            <InfoRow label="شناسه تراکنش">
              <span className="font-mono text-xs bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded-lg">
                {assignment.transactionId || "-"}
              </span>
            </InfoRow>
          </dl>
        </section>
      )}

      {activeTab === "form" && (
        <section className={cardClassName}>
          <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
            <div>
              <h2 className={sectionTitle + " !mb-1"}>تکمیل اطلاعات قرارداد</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                اطلاعاتی که از پروفایل شما وارد شده‌اند قابل اعتماد هستند؛
                در صورت نیاز ویرایش کنید.
              </p>
            </div>
            {isLocked && (
              <Badge className="text-white border-0 bg-emerald-500">
                قرارداد قفل شده است
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fields.map((f) => (
              <div key={f.id} className={cn(f.fieldType === ContractFieldType.LongText && "md:col-span-2")}>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-1.5">
                  {f.label}
                  {f.isRequired && (
                    <span className="text-rose-500 mr-1">*</span>
                  )}
                  {!!f.isFromProfile && (
                    <Badge variant="secondary" className="mr-2 scale-90">
                      پیش‌پر از پروفایل
                    </Badge>
                  )}
                </label>
                {f.description && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5">
                    {f.description}
                  </p>
                )}
                {renderFieldInput(f, values[f.id] ?? "", (v) =>
                  setValues((prev) => ({ ...prev, [f.id]: v }))
                )}
                {errors[f.id] && (
                  <p className="mt-1 text-xs text-rose-500">{errors[f.id]}</p>
                )}
              </div>
            ))}
          </div>

          {/* Sticky action bar for mobile */}
          <div className="fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] md:static md:mt-6 z-40 bg-white/90 dark:bg-gray-950/90 backdrop-blur md:bg-transparent md:backdrop-blur-0 border-t md:border-0 border-gray-100 dark:border-gray-800 px-4 md:px-0 py-3 md:py-0">
            <div className="max-w-md md:max-w-none mx-auto flex md:justify-end gap-2">
              <Button
                variant="ghost"
                onClick={() => handleSave(false)}
                disabled={isLocked || saving}
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                ذخیره موقت
              </Button>
              <Button
                variant="secondary"
                onClick={() => handleSave(true)}
                disabled={isLocked || saving}
              >
                <Check size={16} />
                ثبت به‌عنوان تکمیل‌شده
              </Button>
              {assignment.status !== ContractStatus.PendingCompletion && (
                <Button
                  variant="primary"
                  onClick={() => {
                    setActiveTab("preview");
                    if (!previewHtml) loadPreview();
                  }}
                >
                  <Eye size={16} />
                  مرحله بعد: پیش‌نمایش و امضا
                </Button>
              )}
            </div>
          </div>
        </section>
      )}

      {(activeTab === "preview" || activeTab === "signed") && (
        <section className={cardClassName}>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h2 className={sectionTitle + " !mb-0"}>
              {activeTab === "signed" ? "سند نهایی امضاشده" : "پیش‌نمایش قرارداد"}
            </h2>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                onClick={loadPreview}
                disabled={previewLoading || refreshing}
              >
                <RefreshCw size={16} className={cn(previewLoading && "animate-spin")} />
                به‌روزرسانی نمایش
              </Button>
            </div>
          </div>

          {previewLoading && (
            <div className="h-[60vh] rounded-2xl bg-gray-50 dark:bg-gray-800/50 animate-pulse flex items-center justify-center">
              <Loader2 size={32} className="animate-spin text-medical-500" />
            </div>
          )}

          {!previewLoading && (previewHtml || previewDoc) && (
            <FormalContractLetter
              assignment={assignment}
              document={previewDoc}
              renderedHtml={previewHtml}
              title={
                activeTab === "signed"
                  ? "سند نهایی امضاشده قرارداد همکاری"
                  : "پیش‌نمایش قرارداد قبل از امضا"
              }
              showToolbar
              onRefresh={loadPreview}
              loading={previewLoading}
            />
          )}

          {activeTab === "preview" &&
            !isLocked &&
            assignment.status !== ContractStatus.PendingCompletion && (
              <div className="mt-6 space-y-4">
                <label className="flex items-start gap-3 cursor-pointer select-none rounded-2xl border-2 border-amber-200 dark:border-amber-800 bg-amber-50/60 dark:bg-amber-900/10 p-4">
                  <input
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    className="mt-0.5 h-5 w-5 rounded accent-medical-500"
                  />
                  <div className="text-sm leading-7">
                    <p className="font-black text-gray-900 dark:text-white">
                      متن قرارداد را کامل مطالعه کرده‌ام و مفاد آن را تأیید می‌کنم.
                    </p>
                    <p className="text-gray-600 dark:text-gray-300">
                      با تأیید این گزینه و فشردن دکمه زیر، قرارداد به‌صورت
                      الکترونیکی امضا و برای همیشه قفل می‌شود. امکان ویرایش
                      اطلاعات پس از امضا وجود ندارد.
                    </p>
                  </div>
                </label>

                <div className="flex justify-end gap-2">
                  <Button variant="ghost" onClick={() => setActiveTab("form")}>
                    بازگشت به ویرایش
                  </Button>
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleSign}
                    disabled={signing || !acceptTerms}
                  >
                    {signing ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <FileSignature size={18} />
                    )}
                    تأیید و امضای قرارداد
                  </Button>
                </div>
              </div>
            )}
        </section>
      )}
    </div>
  );
}

function TripBadge({
  title,
  done,
  active,
  Icon,
}: {
  title: string;
  done: boolean;
  active?: boolean;
  Icon: any;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-3 md:p-4 flex flex-col items-center gap-2 text-center transition-all",
        done
          ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300"
          : active
          ? "bg-medical-50 dark:bg-medical-900/20 border-medical-200 dark:border-medical-800 text-medical-700 dark:text-medical-300"
          : "bg-gray-50 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400"
      )}
    >
      <div
        className={cn(
          "w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center",
          done
            ? "bg-emerald-500 text-white"
            : active
            ? "bg-medical-500 text-white"
            : "bg-gray-200 dark:bg-gray-700"
        )}
      >
        <Icon size={18} strokeWidth={2.4} />
      </div>
      <div className="text-xs md:text-sm font-bold leading-tight">{title}</div>
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
        "shrink-0 px-4 py-2 rounded-2xl text-sm font-bold transition-all",
        active
          ? "bg-medical-500 text-white shadow-md shadow-medical-500/20"
          : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-800 hover:border-medical-300"
      )}
    >
      {children}
    </button>
  );
}

function InfoRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <dt className="text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</dt>
      <dd className="font-bold text-gray-900 dark:text-white flex flex-wrap gap-2 items-center">
        {children}
      </dd>
    </div>
  );
}

function renderFieldInput(
  f: ContractFieldDto,
  value: string,
  onChange: (v: string) => void
) {
  if (f.fieldType === ContractFieldType.LongText) {
    return (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={f.placeholder}
        rows={4}
        className={cn(inputClassName, "resize-y")}
      />
    );
  }
  if (
    f.fieldType === ContractFieldType.Dropdown &&
    Array.isArray(f.options) &&
    f.options.length > 0
  ) {
    return (
      <select value={value} onChange={(e) => onChange(e.target.value)} className={inputClassName}>
        <option value="">انتخاب کنید...</option>
        {f.options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    );
  }
  if (f.fieldType === ContractFieldType.Checkbox) {
    return (
      <label className="flex items-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 p-3 bg-gray-50/50 dark:bg-gray-800/40">
        <input
          type="checkbox"
          checked={value === "true"}
          onChange={(e) => onChange(e.target.checked ? "true" : "false")}
          className="h-5 w-5 rounded accent-medical-500"
        />
        <span className="text-sm text-gray-700 dark:text-gray-200">
          {f.placeholder || "تأیید می‌کنم"}
        </span>
      </label>
    );
  }
  const type =
    f.fieldType === ContractFieldType.Date
      ? "date"
      : f.fieldType === ContractFieldType.Number ||
        f.fieldType === ContractFieldType.Decimal
      ? "number"
      : f.fieldType === ContractFieldType.Phone
      ? "tel"
      : "text";
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={f.placeholder}
      className={inputClassName}
    />
  );
}
