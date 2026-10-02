"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Plus,
  Save,
  Trash2,
  ArrowRight,
  Eye,
  GripVertical,
  RefreshCw,
  Loader2,
  ArrowLeft,
  HandCoins,
  Copy,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  ContractFieldType,
  type CreateContractTemplateDto,
  type UpdateContractTemplateDto,
  type UpsertContractFieldDto,
  CONTRACT_FIELD_TYPE_LABELS,
  DEFAULT_CONTRACT_TEMPLATE_15,
  DEFAULT_FIELDS_14,
  PROFILE_PATH_OPTIONS,
} from "@/types/contract";
import { contractService } from "@/services/contract.service";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const sectionTitle =
  "text-base md:text-lg font-black text-gray-900 dark:text-white mb-3";
const card =
  "rounded-2xl bg-white dark:bg-gray-900 shadow-sm border border-gray-100 dark:border-gray-800 p-5";
const inputClassName =
  "w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm transition focus:border-medical-500 focus:outline-none focus:ring-4 focus:ring-medical-100 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-medical-400 dark:focus:ring-medical-900/40";

function nowDateForInput() {
  const d = new Date();
  const m = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${m(d.getMonth() + 1)}-${m(d.getDate())}`;
}

function addMonths(dateStr: string, months: number) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  d.setMonth(d.getMonth() + months);
  const m = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${m(d.getMonth() + 1)}-${m(d.getDate())}`;
}

export default function ContractTemplateFormPage() {
  const router = useRouter();
  const params = useParams();
  const isEdit = !!params?.id && params.id !== "create";
  const templateId = isEdit ? Number(params.id) : null;

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [previewHtml, setPreviewHtml] = useState<string>("");
  const [previewLoading, setPreviewLoading] = useState(false);

  const [title, setTitle] = useState<string>(
    DEFAULT_CONTRACT_TEMPLATE_15.title
  );
  const [code, setCode] = useState<string>(
    DEFAULT_CONTRACT_TEMPLATE_15.code + "-" + Date.now().toString().slice(-4)
  );
  const [contractType, setContractType] = useState<string>(
    DEFAULT_CONTRACT_TEMPLATE_15.contractType ?? ""
  );
  const [description, setDescription] = useState<string>(
    DEFAULT_CONTRACT_TEMPLATE_15.description ?? ""
  );
  const [contractText, setContractText] = useState<string>(
    DEFAULT_CONTRACT_TEMPLATE_15.contractText
  );
  const [isActive, setIsActive] = useState<boolean>(false);
  const [isPublished, setIsPublished] = useState<boolean>(false);
  const [effectiveFrom, setEffectiveFrom] = useState<string>(nowDateForInput());
  const [effectiveTo, setEffectiveTo] = useState<string>(
    addMonths(nowDateForInput(), 24)
  );
  const [defaultCooperationType, setDefaultCooperationType] = useState<
    string
  >("");
  const [defaultDurationDays, setDefaultDurationDays] = useState<number>(365);
  const [fields, setFields] = useState<UpsertContractFieldDto[]>(
    DEFAULT_FIELDS_14.map((f, idx) => ({ ...f, order: idx }))
  );
  const [hasExistingSignedAssignments, setHasExistingSignedAssignments] =
    useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (!isEdit || !templateId) return;
    (async () => {
      try {
        const tpl = await contractService.getTemplate(templateId);
        setTitle(tpl.title);
        setCode(tpl.code);
        setContractType(tpl.contractType ?? "");
        setDescription(tpl.description ?? "");
        setContractText(tpl.contractText);
        setIsActive(tpl.isActive);
        setIsPublished(tpl.isPublished);
        setEffectiveFrom(
          tpl.effectiveFrom
            ? new Date(tpl.effectiveFrom).toISOString().slice(0, 10)
            : ""
        );
        setEffectiveTo(
          tpl.effectiveTo
            ? new Date(tpl.effectiveTo).toISOString().slice(0, 10)
            : ""
        );
        setDefaultCooperationType(tpl.defaultCooperationType ?? "");
        setDefaultDurationDays(tpl.defaultDurationDays ?? 365);
        setFields(
          [...(tpl.fields ?? [])]
            .sort((a, b) => a.order - b.order)
            .map((f, idx) => ({
              id: f.id,
              key: f.key ?? "",
              label: f.label ?? "",
              fieldType: (f.fieldType as ContractFieldType) ?? ContractFieldType.ShortText,
              order: f.order ?? idx,
              isRequired: !!f.isRequired,
              placeholder: f.placeholder ?? "",
              description: f.description ?? "",
              options: Array.isArray(f.options) ? f.options.filter(Boolean) : undefined,
              defaultValueFromProfilePath: f.defaultValueFromProfilePath ?? undefined,
              defaultValue: f.defaultValue ?? "",
              validationRegex: f.validationRegex ?? "",
              isFromProfile: !!f.isFromProfile,
            }))
        );
        setHasExistingSignedAssignments((tpl.signedAssignmentCount ?? 0) > 0);
      } catch (err: any) {
        toast.error(err?.response?.data?.message || "بارگذاری شابلون ناموفق بود");
      } finally {
        setLoading(false);
      }
    })();
  }, [isEdit, templateId]);

  const buildCreateDto = (): CreateContractTemplateDto => ({
    code,
    title,
    contractType: contractType || undefined,
    contractText,
    description: description || undefined,
    isActive,
    isPublished,
    effectiveFrom: effectiveFrom || undefined,
    effectiveTo: effectiveTo || undefined,
    defaultCooperationType: defaultCooperationType || undefined,
    defaultDurationDays,
    fields,
  });

  const buildUpdateDto = (): UpdateContractTemplateDto => ({
    title,
    contractType: contractType || undefined,
    contractText,
    description: description || undefined,
    isActive,
    isPublished,
    effectiveFrom: effectiveFrom || undefined,
    effectiveTo: effectiveTo || undefined,
    defaultCooperationType: defaultCooperationType || undefined,
    defaultDurationDays,
    fields,
  });

  const validate = (): boolean => {
    if (!title.trim()) {
      toast.error("عنوان قرارداد را وارد کنید");
      return false;
    }
    if (!code.trim()) {
      toast.error("کد یکتای قرارداد را وارد کنید");
      return false;
    }
    if (!contractText.trim()) {
      toast.error("متن قرارداد خالی است");
      return false;
    }
    const keys = new Set<string>();
    for (const f of fields) {
      if (!f.key.trim() || !f.label.trim()) {
        toast.error("برای همه فیلدها کلید و عنوان (Key و Label) را وارد کنید");
        return false;
      }
      if (keys.has(f.key)) {
        toast.error(`کلید فیلد تکراری است: ${f.key}`);
        return false;
      }
      keys.add(f.key);
      if (
        (f.fieldType === ContractFieldType.Dropdown) &&
        (!Array.isArray(f.options) || f.options.length === 0)
      ) {
        toast.error(
          `فیلد ${f.label} از نوع Dropdown است و گزینه‌ای ندارد`
        );
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      if (isEdit && templateId) {
        await contractService.updateTemplate(templateId, buildUpdateDto());
        toast.success(
          hasExistingSignedAssignments
            ? "به‌دلیل امضاشدن تخصیص‌های قبلی، نسخه جدیدی از شابلون ایجاد شد."
            : "شابلون با موفقیت ویرایش شد"
        );
      } else {
        const r = await contractService.createTemplate(buildCreateDto());
        toast.success("شابلون جدید ایجاد شد");
        router.push(`/dashboard/admin/contracts/templates/${r.id}/edit`);
        return;
      }
      router.push("/dashboard/admin/contracts");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "ذخیره شابلون ناموفق بود");
    } finally {
      setSaving(false);
    }
  };

  const runPreview = async () => {
    if (!validate()) return;
    if (isEdit && templateId) {
      setPreviewLoading(true);
      try {
        const dto = buildUpdateDto();
        // Apply preview by saving a draft? Use Preview endpoint with existing template id.
        const r = await contractService.previewTemplate({
          templateId,
        });
        setPreviewHtml(r.html);
        setShowPreview(true);
      } catch (e: any) {
        toast.error("پیش‌نمایش ناموفق بود");
      } finally {
        setPreviewLoading(false);
      }
    } else {
      // Create a temporary template via normal create then preview — too risky. Instead, show a notice.
      toast(
        "برای پیش‌نمایش، ابتدا شابلون را ذخیره کنید (امکان پیش‌نمایش قبل از ذخیره در نسخه فعلی پس از ایجاد وجود دارد).",
        { icon: "💡", duration: 6000 }
      );
    }
  };

  const addField = () => {
    setFields((prev) => [
      ...prev,
      {
        key: `field_${Date.now()}`,
        label: "فیلد جدید",
        fieldType: ContractFieldType.ShortText,
        order: prev.length,
        isRequired: true,
        placeholder: "",
        options: undefined,
        defaultValueFromProfilePath: undefined,
        defaultValue: "",
        description: "",
        validationRegex: "",
        isFromProfile: false,
      },
    ]);
  };

  const removeField = (idx: number) => {
    setFields((prev) => prev.filter((_, i) => i !== idx));
  };

  const moveField = (idx: number, delta: number) => {
    setFields((prev) => {
      const next = [...prev];
      const target = idx + delta;
      if (target < 0 || target >= next.length) return prev;
      [next[idx], next[target]] = [next[target], next[idx]];
      return next.map((f, i) => ({ ...f, order: i }));
    });
  };

  const updateField = (
    idx: number,
    patch: Partial<UpsertContractFieldDto>
  ) => {
    setFields((prev) => prev.map((f, i) => (i === idx ? { ...f, ...patch } : f)));
  };

  if (loading) {
    return (
      <div className="space-y-5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-48 rounded-2xl bg-white/70 dark:bg-gray-900/70 animate-pulse border border-gray-100 dark:border-gray-800"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-8">
      {/* Header */}
      <div className={card}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-medical-500 to-medical-600 text-white flex items-center justify-center shadow-glow-medical shrink-0">
              <HandCoins size={24} strokeWidth={2.2} />
            </div>
            <div>
              <h1 className="text-xl font-black text-gray-900 dark:text-white">
                {isEdit ? "ویرایش شابلون قرارداد" : "ایجاد شابلون قرارداد جدید"}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                متن قرارداد، Placeholderها و فیلدهای قابل‌تکمیل پرستار را در
                این صفحه مدیریت کنید.
              </p>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant="ghost"
              onClick={() => router.push("/dashboard/admin/contracts")}
            >
              <ArrowRight size={16} />
              بازگشت به لیست
            </Button>
            <Button variant="secondary" onClick={runPreview} disabled={previewLoading}>
              {previewLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Eye size={16} />
              )}
              پیش‌نمایش
            </Button>
            <Button variant="primary" onClick={handleSubmit} disabled={saving}>
              {saving ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              ذخیره شابلون
            </Button>
          </div>
        </div>

        {hasExistingSignedAssignments && (
          <div className="mt-5 rounded-2xl border-2 border-amber-300 bg-amber-50 dark:bg-amber-900/10 dark:border-amber-800 p-4 flex gap-3 items-start">
            <div className="w-9 h-9 shrink-0 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Copy size={18} />
            </div>
            <div className="text-sm text-amber-900 dark:text-amber-200 leading-7">
              <p className="font-black mb-1">
                این شابلون دارای تخصیص‌های امضاشده است
              </p>
              <p>
                پس از ذخیره تغییرات، به‌جای ویرایش نسخه فعلی، یک نسخه جدید
                (version جدید) با همین کد و نسخه افزایش‌یافته ایجاد می‌شود.
                تخصیص‌های قبلی پرستاران با همان متن قدیمی باقی می‌مانند و
                تغییری نمی‌کنند.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Main form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Column 1-2: Basic info + Text */}
        <div className="lg:col-span-2 space-y-5">
          <section className={card}>
            <h2 className={sectionTitle}>اطلاعات پایه شابلون</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-1.5">
                  عنوان قرارداد
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={inputClassName}
                  placeholder="مثلاً: قرارداد همکاری ارائه خدمات مراقبت از سالمند"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-1.5">
                  کد یکتا (Code)
                </label>
                <input
                  type="text"
                  value={code}
                  disabled={isEdit}
                  onChange={(e) => setCode(e.target.value)}
                  className={inputClassName}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-1.5">
                  نوع قرارداد
                </label>
                <input
                  type="text"
                  value={contractType}
                  onChange={(e) => setContractType(e.target.value)}
                  placeholder="مثلاً: همکاری تمام‌وقت / پاره‌وقت / پروژه‌ای"
                  className={inputClassName}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-1.5">
                  تاریخ اجرا (Effective From)
                </label>
                <input
                  type="date"
                  value={effectiveFrom}
                  onChange={(e) => setEffectiveFrom(e.target.value)}
                  className={inputClassName}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-1.5">
                  تاریخ انقضا (Effective To)
                </label>
                <input
                  type="date"
                  value={effectiveTo}
                  onChange={(e) => setEffectiveTo(e.target.value)}
                  className={inputClassName}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-1.5">
                  نوع همکاری پیش‌فرض
                </label>
                <select
                  value={defaultCooperationType}
                  onChange={(e) => setDefaultCooperationType(e.target.value)}
                  className={inputClassName}
                >
                  <option value="">انتخاب نشده</option>
                  <option value="تمام‌وقت">تمام‌وقت</option>
                  <option value="پاره‌وقت">پاره‌وقت</option>
                  <option value="کاربرگ (کلی)">کاربرگ (کلی)</option>
                  <option value="قرارداد پروژه‌ای">قرارداد پروژه‌ای</option>
                  <option value="حضور در منزل بیمار">حضور در منزل بیمار</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-1.5">
                  مدت پیش‌فرض قرارداد (روز)
                </label>
                <input
                  type="number"
                  min={1}
                  value={defaultDurationDays}
                  onChange={(e) =>
                    setDefaultDurationDays(Number(e.target.value) || 365)
                  }
                  className={inputClassName}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-1.5">
                  توضیحات (اختیاری)
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={inputClassName}
                  placeholder="توضیحات داخلی برای این شابلون..."
                />
              </div>
              <div className="md:col-span-2 flex flex-wrap gap-6 mt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="h-5 w-5 rounded accent-medical-500"
                  />
                  <span className="text-sm font-bold text-gray-700 dark:text-gray-200">
                    شابلون فعال است
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                    className="h-5 w-5 rounded accent-medical-500"
                  />
                  <span className="text-sm font-bold text-gray-700 dark:text-gray-200">
                    منتشر شده (قابل تخصیص)
                  </span>
                </label>
              </div>
            </div>
          </section>

          <section className={card}>
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <h2 className={sectionTitle + " !mb-0"}>متن قرارداد</h2>
              <div className="flex gap-2">
                <Badge variant="outline">RTL</Badge>
                <Badge variant="secondary">
                  پشتیبانی Placeholder: <code className="mx-1 font-mono text-xs">{'{{key}}'}</code>
                </Badge>
              </div>
            </div>
            <textarea
              dir="rtl"
              rows={24}
              value={contractText}
              onChange={(e) => setContractText(e.target.value)}
              className={cn(
                inputClassName,
                "font-sans leading-8 text-[15px]"
              )}
            />
          </section>
        </div>

        {/* Column 3: Fields Builder */}
        <div className="space-y-5">
          <section className={card}>
            <div className="flex items-center justify-between mb-3">
              <h2 className={sectionTitle + " !mb-0"}>
                فیلدهای قابل‌تکمیل ({fields.length})
              </h2>
              <Button size="sm" variant="secondary" onClick={addField}>
                <Plus size={14} /> افزودن
              </Button>
            </div>
            <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
              {fields.map((f, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-gray-200 dark:border-gray-800 p-3 bg-gray-50/60 dark:bg-gray-800/40"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-400">
                      <GripVertical size={15} />
                    </div>
                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                      #{idx + 1}
                    </span>
                    <select
                      value={f.fieldType}
                      onChange={(e) =>
                        updateField(idx, {
                          fieldType: Number(e.target.value) as ContractFieldType,
                        })
                      }
                      className={cn(
                        inputClassName,
                        "!py-1.5 !text-xs flex-1 !px-2"
                      )}
                    >
                      {(Object.keys(CONTRACT_FIELD_TYPE_LABELS) as unknown as (keyof typeof CONTRACT_FIELD_TYPE_LABELS)[]).map(
                        (k) => (
                          <option key={k} value={Number(k)}>
                            {
                              CONTRACT_FIELD_TYPE_LABELS[
                                Number(k) as ContractFieldType
                              ]
                            }
                          </option>
                        )
                      )}
                    </select>
                    <div className="flex gap-0.5 mr-auto">
                      <button
                        type="button"
                        onClick={() => moveField(idx, -1)}
                        className="h-7 w-7 rounded-lg hover:bg-white dark:hover:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-500"
                        title="انتقال به بالا"
                      >
                        <ArrowRight size={14} className="mx-auto" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveField(idx, 1)}
                        className="h-7 w-7 rounded-lg hover:bg-white dark:hover:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-500"
                        title="انتقال به پایین"
                      >
                        <ArrowLeft size={14} className="mx-auto" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeField(idx)}
                        className="h-7 w-7 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20 border border-rose-200 dark:border-rose-800 text-rose-500"
                        title="حذف فیلد"
                      >
                        <Trash2 size={14} className="mx-auto" />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={f.key}
                      onChange={(e) => updateField(idx, { key: e.target.value })}
                      placeholder="Key (مثلاً fullName)"
                      className={cn(inputClassName, "!py-1.5 !text-xs !px-2")}
                      dir="ltr"
                    />
                    <input
                      type="text"
                      value={f.label}
                      onChange={(e) =>
                        updateField(idx, { label: e.target.value })
                      }
                      placeholder="عنوان نمایشی"
                      className={cn(inputClassName, "!py-1.5 !text-xs !px-2")}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <input
                      type="text"
                      value={f.placeholder ?? ""}
                      onChange={(e) =>
                        updateField(idx, { placeholder: e.target.value })
                      }
                      placeholder="Placeholder"
                      className={cn(inputClassName, "!py-1.5 !text-xs !px-2")}
                    />
                    <select
                      value={f.defaultValueFromProfilePath ?? ""}
                      onChange={(e) =>
                        updateField(idx, {
                          defaultValueFromProfilePath:
                            e.target.value || undefined,
                          isFromProfile: !!e.target.value,
                        })
                      }
                      className={cn(inputClassName, "!py-1.5 !text-xs !px-2")}
                    >
                      <option value="">بدون پیش‌پر از پروفایل</option>
                      {PROFILE_PATH_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  {f.fieldType === ContractFieldType.Dropdown && (
                    <input
                      type="text"
                      value={(f.options ?? []).join(", ")}
                      onChange={(e) =>
                        updateField(idx, {
                          options: e.target.value
                            .split(",")
                            .map((s) => s.trim())
                            .filter(Boolean),
                        })
                      }
                      placeholder="گزینه‌ها را با کاما جدا کنید..."
                      className={cn(
                        inputClassName,
                        "!py-1.5 !text-xs !px-2 mt-2"
                      )}
                    />
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <label className="flex items-center gap-2 text-xs font-bold text-gray-600 dark:text-gray-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={f.isRequired}
                        onChange={(e) =>
                          updateField(idx, { isRequired: e.target.checked })
                        }
                        className="h-4 w-4 rounded accent-medical-500"
                      />
                      الزامی
                    </label>
                    {f.isFromProfile && (
                      <Badge variant="secondary" className="text-[10px]">
                        از پروفایل پرسش می‌شود
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* Preview */}
      {showPreview && previewHtml && (
        <section className={card}>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h2 className={sectionTitle + " !mb-0"}>پیش‌نمایش سند</h2>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={runPreview} disabled={previewLoading}>
                {previewLoading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <RefreshCw size={16} />
                )}
                بروزرسانی
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  const w = window.open("", "_blank");
                  if (w) {
                    w.document.write(previewHtml);
                    w.document.close();
                  }
                }}
              >
                باز کردن در تب جدید
              </Button>
              <Button variant="ghost" onClick={() => setShowPreview(false)}>
                بستن
              </Button>
            </div>
          </div>
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <iframe
              title="template-preview"
              srcDoc={previewHtml}
              className="w-full h-[75vh] bg-white"
            />
          </div>
        </section>
      )}
    </div>
  );
}
