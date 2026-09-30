'use client';
/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { FileUp, Trash2 } from 'lucide-react';
import { PortalButton } from '@/components/portal/ui/portal-button';
import LabDatePicker from './LabDatePicker';
import { safeParseDate } from '@/lib/assignment-status';
import {
  labApi, labError, LabCategory, LabDataType, LabDefinition, LabReport, LabReportInput, LabReportSaveResult,
} from './lab-api';
import { LabDrawer, LabError, LabField, LabLoading, LabStatus, labInput, labIsValidPerformedDate, labRange } from './LabShared';

export function LabReportWizard({ patientId, open, initialReport, onClose, onSaved }: {
  patientId: number;
  open: boolean;
  initialReport: LabReport | null;
  onClose: () => void;
  onSaved: (result: LabReportSaveResult) => void;
}) {
  const categories = useQuery({
    queryKey: ['labs', 'categories', 'wizard'],
    queryFn: () => labApi.categories(),
    enabled: open,
  });

  const [step, setStep] = useState(1);
  const [categoryId, setCategoryId] = useState<number>(initialReport?.categoryId ?? 0);
  const [title, setTitle] = useState<string>(initialReport?.reportTitle ?? '');
  const [performedAt, setPerformedAt] = useState<string | null>(initialReport?.performedAt ?? null);
  const [laboratory, setLaboratory] = useState<string>(initialReport?.laboratoryName ?? '');
  const [notes, setNotes] = useState<string>(initialReport?.notes ?? '');
  const [version, setVersion] = useState<string>(initialReport?.version ?? '');
  const [reportId, setReportId] = useState<string | null>(initialReport?.id ?? null);

  const [values, setValues] = useState<Record<number, string>>(() => Object.fromEntries(
    (initialReport?.results || []).map((r) => [r.labTestDefinitionId, String(r.numericValue ?? r.textValue ?? r.booleanValue ?? '')]),
  ));
  const [resultNotes, setResultNotes] = useState<Record<number, string>>(() => Object.fromEntries(
    (initialReport?.results || []).filter((r) => r.notes).map((r) => [r.labTestDefinitionId, r.notes ?? '']),
  ));
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [savedReport, setSavedReport] = useState<LabReport | null>(initialReport ?? null);
  const [removeExisting, setRemoveExisting] = useState(false);

  const maxDateTodayIso = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }, []);

  useEffect(() => {
    if (!open) return;
    setStep(1);
    setCategoryId(initialReport?.categoryId ?? 0);
    setTitle(initialReport?.reportTitle ?? '');
    setPerformedAt(initialReport?.performedAt ?? null);
    setLaboratory(initialReport?.laboratoryName ?? '');
    setNotes(initialReport?.notes ?? '');
    setVersion(initialReport?.version ?? '');
    setReportId(initialReport?.id ?? null);
    setValues(Object.fromEntries(
      (initialReport?.results || []).map((r) => [r.labTestDefinitionId, String(r.numericValue ?? r.textValue ?? r.booleanValue ?? '')]),
    ));
    setResultNotes(Object.fromEntries(
      (initialReport?.results || []).filter((r) => r.notes).map((r) => [r.labTestDefinitionId, r.notes ?? '']),
    ));
    setFile(null); setPreview(null); setErrors({}); setProgress(0); setSavedReport(initialReport ?? null); setRemoveExisting(false);
  }, [open, initialReport]);

  const definitions = useQuery({
    queryKey: ['labs', 'definitions', categoryId, 'wizard'],
    queryFn: () => labApi.definitions({ categoryId: categoryId || undefined }),
    enabled: open && categoryId > 0,
  });
  const historical = useMemo(() => (initialReport?.results || []).map((r) => ({
    id: r.labTestDefinitionId, categoryId: initialReport?.categoryId ?? 0, name: r.name, code: '__hist__', englishName: r.name,
    dataType: r.dataType as LabDataType, unit: r.unit, referenceMin: r.referenceMin ?? null, referenceMax: r.referenceMax ?? null,
    criticalMin: null, criticalMax: null, description: '', sortOrder: 0, isActive: true,
  } satisfies LabDefinition)), [initialReport]);
  const items: LabDefinition[] = useMemo(() => {
    const seen = new Set<number>();
    const merged: LabDefinition[] = [];
    historical.forEach((h) => { merged.push(h); seen.add(h.id); });
    (definitions.data || []).forEach((d) => { if (!seen.has(d.id)) merged.push(d); });
    return merged;
  }, [historical, definitions.data]);

  useEffect(() => {
    if (!file || !file.type.startsWith('image/')) { setPreview(null); return; }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => { URL.revokeObjectURL(url); setPreview(null); };
  }, [file]);

  function chooseFile(candidate?: File) {
    if (!candidate) return;
    const types: Record<string, string[]> = {
      'image/jpeg': ['jpg', 'jpeg'], 'image/png': ['png'], 'image/webp': ['webp'], 'application/pdf': ['pdf'],
    };
    const ext = candidate.name.split('.').pop()?.toLowerCase() || '';
    const acceptedType = !!types[candidate.type]?.includes(ext);
    const sizeOk = candidate.size > 0 && candidate.size <= 10 * 1024 * 1024;
    if (!acceptedType || !sizeOk) {
      setErrors((old) => ({ ...old, file: 'فایل باید تصویر (JPG/PNG/WEBP) یا PDF با حداکثر حجم ۱۰ مگابایت باشد.' }));
      return;
    }
    setErrors((old) => ({ ...old, file: '' }));
    setFile(candidate);
  }

  function validateInfo() {
    const next: Record<string, string> = {};
    // eslint-disable-next-line no-console
    console.debug('[LAB-WIZARD] validateInfo performedAt =', JSON.stringify(performedAt), {
      dateCheck: labIsValidPerformedDate(performedAt ?? null),
    });
    if (!categoryId) next.category = 'دسته آزمایش را انتخاب کنید.';
    if (!title.trim()) next.title = 'عنوان گزارش الزامی است.';
    if (title.length > 200) next.title = 'عنوان گزارش حداکثر ۲۰۰ کاراکتر است.';
    const dateCheck = labIsValidPerformedDate(performedAt ?? null);
    if (!dateCheck.ok) {
      next.date = dateCheck.reason ?? 'تاریخ انجام معتبر را وارد کنید.';
    }
    if (laboratory.length > 200) next.laboratory = 'نام آزمایشگاه حداکثر ۲۰۰ کاراکتر است.';
    if (notes.length > 4000) next.notes = 'توضیحات حداکثر ۴۰۰۰ کاراکتر است.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function buildResults(): LabReportInput['results'] {
    const results: LabReportInput['results'] = [];
    items.forEach((item) => {
      const v = values[item.id];
      const n = (resultNotes[item.id] ?? '').trim() || undefined;
      if (v === '' || v == null) {
        if (n) results.push({ labTestDefinitionId: item.id, numericValue: null, textValue: null, booleanValue: null, notes: n });
        return;
      }
      if (item.dataType === 'Number') {
        const num = Number(v);
        if (!Number.isFinite(num)) return;
        results.push({ labTestDefinitionId: item.id, numericValue: num, textValue: null, booleanValue: null, notes: n });
      } else if (item.dataType === 'Boolean') {
        const b = String(v).toLowerCase() === 'true' ? true : String(v).toLowerCase() === 'false' ? false : null;
        if (b == null) return;
        results.push({ labTestDefinitionId: item.id, numericValue: null, textValue: null, booleanValue: b, notes: n });
      } else {
        results.push({ labTestDefinitionId: item.id, numericValue: null, textValue: String(v), booleanValue: null, notes: n });
      }
    });
    return results;
  }

  async function save() {
    if (busy) return;
    const results = buildResults();
    const hasValues = results.length > 0;
    const hasFileAction = !!file || (savedReport && savedReport.fileUrl && removeExisting);
    if (!savedReport && !hasValues && !file) {
      setErrors({ file: 'حداقل نتیجه‌ای ثبت کنید یا فایل اصلی گزارش را پیوست کنید.' });
      return;
    }
    if (!savedReport && !hasValues && !hasFileAction && file) {
      // ok
    }
    if (savedReport && !reportId) {
      // impossible - fallback
    }
    const infoOk = validateInfo();
    if (!infoOk) return;
    setBusy(true); setErrors({}); setProgress(0);
    try {
      let current: LabReport = savedReport!;
      let created = false;
      if (!current) {
        const performedDate = safeParseDate(performedAt);
        if (!performedDate) {
          setErrors({ submit: 'تاریخ انجام آزمایش نامعتبر است.' });
          setBusy(false);
          return;
        }
        const res: LabReportSaveResult = await labApi.saveReport(patientId, {
          categoryId,
          reportTitle: title.trim(),
          performedAt: performedDate.toISOString(),
          laboratoryName: laboratory.trim(),
          notes,
          version: version || undefined,
          results,
        });
        current = res.report;
        created = res.created;
        setSavedReport(current);
        setReportId(current.id);
        setVersion(current.version);
      } else {
        const performedDate = safeParseDate(performedAt);
        if (!performedDate) {
          setErrors({ submit: 'تاریخ انجام آزمایش نامعتبر است.' });
          setBusy(false);
          return;
        }
        const res = await labApi.saveReport(patientId, {
          categoryId,
          reportTitle: title.trim(),
          performedAt: performedDate.toISOString(),
          laboratoryName: laboratory.trim(),
          notes,
          version: version || undefined,
          results,
        }, reportId ?? undefined);
        current = res.report;
        setSavedReport(current);
        setVersion(current.version);
      }
      if (file) {
        current = await labApi.upload(current, file, setProgress);
        setSavedReport(current);
        setVersion(current.version);
        setProgress(100);
      } else if (removeExisting && current.fileUrl) {
        current = await labApi.removeFile(current);
        setSavedReport(current);
        setVersion(current.version);
      }
      toast.success(created ? 'گزارش آزمایش با موفقیت ثبت شد.' : 'گزارش آزمایش با موفقیت ویرایش شد.');
      onSaved({ report: current, created: !!created });
    } catch (error) {
      setErrors({ submit: labError(error) });
    } finally {
      setBusy(false);
    }
  }

  return (
    <LabDrawer
      title={initialReport ? 'ویرایش گزارش آزمایش' : 'ثبت آزمایش جدید'}
      description="فایل اصلی و نتایج ساختاریافته قابل جستجو را در یک گزارش یکپارچه نگه دارید."
      busy={busy}
      onClose={onClose}
    >
      <div className="flex min-h-[60vh] flex-col gap-5">
        <ol className="grid grid-cols-3 gap-2" aria-label="مراحل ثبت آزمایش">
          {['اطلاعات', 'نتایج', 'فایل و ثبت'].map((label, index) => (
            <li
              key={label}
              aria-current={step === index + 1 ? 'step' : undefined}
              className={`rounded-2xl p-3 text-center text-sm font-black transition ${
                step === index + 1 ? 'bg-teal-700 text-white shadow-lg shadow-teal-500/20' : 'bg-slate-100 text-slate-700 ring-1 ring-slate-200'
              }`}
            >
              {(index + 1).toLocaleString('fa-IR')} · {label}
            </li>
          ))}
        </ol>

        <form
          className="flex flex-1 flex-col gap-5"
          onSubmit={(event) => {
            event.preventDefault();
            if (step === 1 && validateInfo()) setStep(2);
            else if (step === 2) setStep(3);
            else if (step === 3) void save();
          }}
        >
          <fieldset disabled={busy || !!savedReport} className="min-w-0 space-y-5">
            {step === 1 && categories.isError && (
              <LabError message={labError(categories.error)} retry={() => void categories.refetch()} />
            )}
            {step === 1 && (
              <>
                <LabField label="نوع آزمایش" htmlFor="lab-category" error={errors.category}>
                  <select
                    id="lab-category"
                    className={labInput}
                    value={categoryId}
                    disabled={!!initialReport?.id && !!initialReport?.results.length}
                    onChange={(e) => {
                      const id = Number(e.target.value) || 0;
                      setCategoryId(id);
                      setValues({});
                      setResultNotes({});
                      if (!title || (categories.data || []).some((c) => c.name === title)) {
                        setTitle((categories.data || []).find((c) => c.id === id)?.name ?? '');
                      }
                    }}
                  >
                    <option value={0}>انتخاب دسته آزمایش...</option>
                    {(categories.data || []).map((c: LabCategory) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </LabField>
                <LabField label="عنوان گزارش" htmlFor="lab-title" error={errors.title}>
                  <input id="lab-title" required maxLength={200} className={labInput} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="مثال: آزمایش هماتولوژی مهر ۱۴۰۳" />
                </LabField>
                <LabField label="تاریخ انجام آزمایش" htmlFor="lab-date" error={errors.date}>
                  <LabDatePicker
                    id="lab-date"
                    className="w-full"
                    value={performedAt ?? ''}
                    onChange={(v) => setPerformedAt(v ?? null)}
                    placeholder="انتخاب تاریخ انجام..."
                    includeTime={false}
                    maxTodayLocal
                  />
                </LabField>
                <LabField label="نام آزمایشگاه" htmlFor="lab-laboratory" error={errors.laboratory}>
                  <input id="lab-laboratory" maxLength={200} className={labInput} value={laboratory} onChange={(e) => setLaboratory(e.target.value)} placeholder="مثال: آزمایشگاه سپهر یا خانه سلامت" />
                </LabField>
                <LabField label="توضیحات گزارش" htmlFor="lab-notes" error={errors.notes}>
                  <textarea id="lab-notes" maxLength={4000} className={labInput + ' min-h-[96px] resize-none'} rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="شرایط نمونه‌گیری، داروهای مصرفی، توضیحات بیمار یا پزشک معالج..." />
                </LabField>
              </>
            )}

            {step === 2 && (
              definitions.isPending ? <LabLoading /> :
              definitions.isError ? <LabError message={labError(definitions.error)} retry={() => void definitions.refetch()} /> :
              !items.length ? (
                <p className="rounded-2xl bg-white p-4 ring-1 ring-slate-200 text-sm text-slate-700">
                  هنوز فرمولی برای این دسته آزمایش تعریف نشده است. می‌توانید در مرحله بعد فقط فایل اصلی گزارش را پیوست کنید یا از صفحه «مدیریت آزمایش‌ها» فرمول‌های جدید بسازید.
                </p>
              ) : (
                <ul className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                  {items.map((item) => {
                    const value = values[item.id] ?? '';
                    const n = resultNotes[item.id] ?? '';
                    const abnormal = item.dataType === 'Number' && value !== '' && Number.isFinite(Number(value)) &&
                      ((item.referenceMin != null && Number(value) < item.referenceMin) || (item.referenceMax != null && Number(value) > item.referenceMax));
                    return (
                      <li key={item.id} className="space-y-2 rounded-[24px] border border-slate-200 bg-white p-4 ring-1 ring-slate-100">
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <div>
                            <div className="font-black text-slate-900">{item.name}</div>
                            {item.englishName && item.englishName !== item.name && <div className="text-xs text-slate-500" dir="ltr">{item.englishName} · Code: {item.code}</div>}
                          </div>
                          <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                            item.dataType === 'Number' ? 'bg-teal-50 text-teal-700' : item.dataType === 'Boolean' ? 'bg-amber-50 text-amber-700' : 'bg-sky-50 text-sky-700'
                          }`}>{item.dataType}</span>
                        </div>
                        <LabField label={`مقدار نتیجه${item.unit ? ` (${item.unit})` : ''}`} htmlFor={`lab-result-${item.id}`} error={errors[`value-${item.id}`]}>
                          {item.dataType === 'Boolean' ? (
                            <select
                              id={`lab-result-${item.id}`}
                              className={labInput}
                              value={value}
                              onChange={(e) => setValues({ ...values, [item.id]: e.target.value })}
                            >
                              <option value="">ثبت نشده</option>
                              <option value="true">مثبت / بله</option>
                              <option value="false">منفی / خیر</option>
                            </select>
                          ) : (
                            <input
                              id={`lab-result-${item.id}`}
                              dir={item.dataType === 'Number' ? 'ltr' : 'auto'}
                              type={item.dataType === 'Number' ? 'number' : 'text'}
                              step="any"
                              maxLength={2000}
                              className={labInput}
                              value={value}
                              onChange={(e) => setValues({ ...values, [item.id]: e.target.value })}
                            />
                          )}
                        </LabField>
                        {item.dataType === 'Number' && (item.referenceMin != null || item.referenceMax != null) && (
                          <p className="text-xs text-slate-600">
                            محدوده مرجع: <bdi>{labRange(item.referenceMin, item.referenceMax)}</bdi>{item.unit ? ` ${item.unit}` : ''}
                          </p>
                        )}
                        <div className="flex flex-wrap items-center gap-3">
                          {abnormal && <LabStatus abnormal hasRange />}
                          <LabField label="یادداشت برای این نتیجه" htmlFor={`lab-note-${item.id}`}>
                            <input
                              id={`lab-note-${item.id}`}
                              className={labInput}
                              maxLength={500}
                              value={n}
                              onChange={(e) => setResultNotes({ ...resultNotes, [item.id]: e.target.value })}
                              placeholder="یادداشت اختصاری (روش، دمای نمونه، شرایط و..."
                            />
                          </LabField>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )
            )}
          </fieldset>

          {step === 3 && (
            <div className="space-y-4">
              <div
                className="rounded-[28px] border-2 border-dashed border-teal-300 bg-teal-50/60 p-6 text-center ring-1 ring-teal-100"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); if (!busy) chooseFile(e.dataTransfer.files?.[0]); }}
              >
                <FileUp className="mx-auto mb-3 h-8 w-8 text-teal-700" />
                <label htmlFor="lab-file" className="block font-black text-teal-900">انتخاب تصویر یا PDF گزارش آزمایش</label>
                <p className="my-2 text-sm text-slate-600">
                  فایل را اینجا رها کنید یا از دستگاه انتخاب کنید. فرمت‌های مجاز: JPG · PNG · WEBP · PDF · حداکثر ۱۰ مگابایت.
                </p>
                <input
                  id="lab-file"
                  type="file"
                  disabled={busy}
                  className="mx-auto mt-2 block w-full max-w-xs min-w-0 text-sm"
                  accept=".jpg,.jpeg,.png,.webp,.pdf"
                  onChange={(e) => { chooseFile(e.target.files?.[0]); e.target.value = ''; }}
                />
              </div>
              {errors.file && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700 ring-1 ring-rose-200">{errors.file}</p>}
              {file && (
                <div className="space-y-3 rounded-[24px] bg-white p-4 ring-1 ring-slate-200">
                  <p className="break-all text-sm text-slate-800"><FileUp className="mr-1 inline h-4 w-4 text-slate-500" />{file.name}</p>
                  {preview && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={preview} alt="پیش‌نمایش برگه آزمایش انتخاب‌شده" className="max-h-72 w-full rounded-xl object-contain ring-1 ring-slate-200" />
                  )}
                  <PortalButton type="button" variant="danger" disabled={busy} onClick={() => setFile(null)}>
                    <Trash2 className="h-4 w-4" /> حذف فایل انتخاب‌شده
                  </PortalButton>
                </div>
              )}
              {savedReport?.fileUrl && !file && (
                <label className="flex min-h-12 cursor-pointer items-center gap-3 rounded-[20px] bg-white p-4 text-sm ring-1 ring-slate-200">
                  <input
                    type="checkbox"
                    className="accent-rose-600 h-4 w-4"
                    checked={removeExisting}
                    disabled={busy}
                    onChange={(e) => setRemoveExisting(e.target.checked)}
                  />
                  حذف پیوست قبلی هنگام ذخیره (در صورت تمایل به جایگزینی یا حذف کامل فایل)
                </label>
              )}
              {busy && (
                <div role="status" className="space-y-2 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                  <p className="text-sm text-slate-700">{file ? `ارسال فایل: ${progress.toLocaleString('fa-IR')}٪` : 'در حال ذخیره گزارش...'}</p>
                  <progress max={100} value={progress} className="h-3 w-full accent-teal-600" />
                </div>
              )}
              {savedReport && errors.submit && (
                <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900 ring-1 ring-amber-200">
                  اطلاعات گزارش ذخیره شد، اما عملیات فایل کامل نشد. برای ادامه، دوباره «ذخیره آزمایش» را بزنید.
                </p>
              )}
              {errors.submit && !savedReport && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700 ring-1 ring-rose-200">{errors.submit}</p>}
            </div>
          )}

          <div className="sticky bottom-0 z-10 -mx-4 -mb-4 mt-auto flex gap-3 border-t border-slate-100 bg-white/85 px-4 py-4 backdrop-blur sm:-mx-6 sm:-mb-6 sm:px-6 sm:py-5">
            {step > 1 && (
              <PortalButton
                type="button"
                variant="outline"
                disabled={busy || !!savedReport}
                onClick={() => setStep(step - 1)}
              >
                مرحله قبل
              </PortalButton>
            )}
            <PortalButton
              type="submit"
              className="flex-1"
              isLoading={busy}
              disabled={step === 2 && (definitions.isPending || definitions.isError)}
            >
              {busy ? 'در حال ذخیره...' : step === 3 ? 'ذخیره آزمایش' : 'ادامه به مرحله بعد'}
            </PortalButton>
          </div>
        </form>
      </div>
    </LabDrawer>
  );
}
