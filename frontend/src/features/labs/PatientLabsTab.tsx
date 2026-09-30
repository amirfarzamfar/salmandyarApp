'use client';

import dynamic from 'next/dynamic';
import { Suspense, useMemo, useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { FlaskConical, PlusCircle, FileSearch, FileImage, FileText, Edit3, Trash2, AlertTriangle, Calendar, Filter, SearchX, Loader2, X as XIcon, SlidersHorizontal } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { PortalButton } from '@/components/portal/ui/portal-button';
import LabDatePicker from './LabDatePicker';
import { labApi, labError, LabCategory, LabPage, LabReport, LabReportSaveResult } from './lab-api';
import { LabError, LabField, LabLoading, LabStatus, labDate, labFormatFilterDate, labInput, labStartOfDay, labEndOfDay } from './LabShared';

const LabReportWizard = dynamic(
  () => import('./LabReportWizard').then((m) => m.LabReportWizard),
  { ssr: false },
);
const LabReportDetail = dynamic(
  () => import('./LabReportDetail').then((m) => m.LabReportDetail),
  { ssr: false },
);

const PAGE_SIZE = 10;

export function PatientLabsTab({ patientId, canManage }: { patientId: number; canManage: boolean }) {
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [from, setFrom] = useState<string>('');
  const [to, setTo] = useState<string>('');

  const [wizard, setWizard] = useState<{ open: boolean; editReport?: LabReport | null }>({ open: false, editReport: null });
  const [detailId, setDetailId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<LabReport | null>(null);

  const categories = useQuery({
    queryKey: ['labs', 'categories', patientId],
    queryFn: () => labApi.categories(),
  });

  const reports = useQuery({
    queryKey: ['labs', 'reports', patientId, page, categoryId, from, to],
    queryFn: () => {
      const fromStart = from ? labStartOfDay(from)?.toISOString() : undefined;
      const toEnd = to ? labEndOfDay(to)?.toISOString() : undefined;
      return labApi.reports(patientId, { page, pageSize: PAGE_SIZE, categoryId: categoryId || undefined, from: fromStart, to: toEnd });
    },
  });

  const activeFilters = useMemo(() => {
    const arr: { key: string; label: string; value: string; onRemove: () => void }[] = [];
    if (categoryId && (categories.data || []).find((c) => c.id === Number(categoryId))) {
      const c = (categories.data || []).find((x) => x.id === Number(categoryId))!;
      arr.push({ key: 'cat', label: 'دسته', value: c.name, onRemove: () => { setCategoryId(''); setPage(1); } });
    }
    if (from) {
      const v = labFormatFilterDate(from);
      if (v) arr.push({ key: 'from', label: 'از تاریخ', value: v, onRemove: () => { setFrom(''); setPage(1); } });
    }
    if (to) {
      const v = labFormatFilterDate(to);
      if (v) arr.push({ key: 'to', label: 'تا تاریخ', value: v, onRemove: () => { setTo(''); setPage(1); } });
    }
    return arr;
  }, [categoryId, from, to, categories.data]);

  const deleteMutation = useMutation({
    mutationFn: (r: LabReport) => labApi.deleteReport(r),
    onSuccess: () => {
      toast.success('گزارش آزمایش با موفقیت حذف شد.');
      setDeleteTarget(null);
      void queryClient.invalidateQueries({ queryKey: ['labs', 'reports', patientId] });
      void queryClient.invalidateQueries({ queryKey: ['labs', 'report', patientId] });
    },
    onError: (err) => toast.error(labError(err)),
  });

  function onReportSaved(saved: LabReportSaveResult) {
    toast.success(saved.created ? 'گزارش آزمایش با موفقیت ثبت شد.' : 'گزارش آزمایش با موفقیت ویرایش شد.');
    setWizard({ open: false, editReport: null });
    setDetailId(saved.report.id);
    void queryClient.invalidateQueries({ queryKey: ['labs', 'reports', patientId] });
    void queryClient.invalidateQueries({ queryKey: ['labs', 'report', patientId] });
    void queryClient.invalidateQueries({ queryKey: ['labs', 'trend', patientId] });
  }

  const pageData: LabPage | null = reports.data ?? null;
  const totalPages = Math.max(1, pageData?.totalPages ?? 1);
  const totalItems = pageData?.totalItems ?? 0;

  const categoryMap = useMemo(() => {
    const m = new Map<number, LabCategory>();
    (categories.data || []).forEach((c) => m.set(c.id, c));
    return m;
  }, [categories.data]);

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-slate-200 bg-white p-5 shadow-sm ring-1 ring-slate-100 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-600 text-white shadow-lg shadow-teal-500/20">
                <FlaskConical className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900">آزمایش‌ها</h2>
                <p className="text-sm text-slate-600">ثبت و پیگیری نتایج آزمایش‌های آزمایشگاهی این بیمار</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
              <span className="inline-flex items-center gap-1 rounded-xl bg-slate-50 px-2.5 py-1 ring-1 ring-slate-200">
                <FileSearch className="h-3.5 w-3.5" />
                مجموع {totalItems.toLocaleString('fa-IR')} گزارش ثبت‌شده
              </span>
              {!canManage && (
                <span className="inline-flex items-center gap-1 rounded-xl bg-sky-50 px-2.5 py-1 text-sky-700 ring-1 ring-sky-200">
                  شما فقط مشاهده‌کننده هستید. برای ثبت آزمایش با پرستار یا مدیر تماس بگیرید.
                </span>
              )}
            </div>
          </div>
          {canManage && (
            <PortalButton onClick={() => setWizard({ open: true, editReport: null })} aria-label="ثبت آزمایش جدید">
              <PlusCircle className="h-4 w-4" /> ثبت آزمایش جدید
            </PortalButton>
          )}
        </div>

        <div className="mt-5 space-y-4">
          <div className="rounded-[24px] border border-slate-200 bg-gradient-to-br from-slate-50/70 to-white p-4 ring-1 ring-slate-100 sm:p-5">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600 text-white shadow-md shadow-teal-500/20">
                <SlidersHorizontal className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900">فیلتر گزارش‌ها</h3>
                <p className="text-[11px] text-slate-500">گزارش‌ها را بر اساس دسته و بازه تاریخی محدود کنید</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
              <div className="sm:col-span-1 lg:col-span-1">
                <LabField label="دسته آزمایش">
                  <select
                    className={labInput}
                    value={categoryId}
                    onChange={(e) => { setCategoryId(e.target.value === '' ? '' : Number(e.target.value)); setPage(1); }}
                    aria-label="فیلتر دسته آزمایش"
                  >
                    <option value="">همه دسته‌ها</option>
                    {(categories.data || []).map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </LabField>
              </div>

              <div className="sm:col-span-1 lg:col-span-1">
                <LabField label="از تاریخ">
                  <LabDatePicker
                    className="w-full"
                    value={from}
                    onChange={(v) => {
                      const nv = v ?? '';
                      if (nv && to) {
                        const s = labStartOfDay(nv)?.getTime() ?? 0;
                        const e = labEndOfDay(to)?.getTime() ?? 0;
                        if (s > e) {
                          toast.error('تاریخ شروع نباید پس از تاریخ پایان باشد.');
                          return;
                        }
                      }
                      setFrom(nv);
                      setPage(1);
                    }}
                    placeholder="انتخاب تاریخ شروع..."
                  />
                </LabField>
              </div>

              <div className="sm:col-span-1 lg:col-span-1">
                <LabField label="تا تاریخ">
                  <LabDatePicker
                    className="w-full"
                    value={to}
                    onChange={(v) => {
                      const nv = v ?? '';
                      if (nv && from) {
                        const s = labStartOfDay(from)?.getTime() ?? 0;
                        const e = labEndOfDay(nv)?.getTime() ?? 0;
                        if (e < s) {
                          toast.error('تاریخ پایان نباید قبل از تاریخ شروع باشد.');
                          return;
                        }
                      }
                      setTo(nv);
                      setPage(1);
                    }}
                    placeholder="انتخاب تاریخ پایان..."
                  />
                </LabField>
              </div>

              <div className="sm:col-span-2 lg:col-span-1 flex flex-col sm:flex-row sm:items-end justify-start gap-2 sm:gap-3 pt-1">
                <PortalButton
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto"
                  onClick={() => { setCategoryId(''); setFrom(''); setTo(''); setPage(1); }}
                >
                  <SearchX className="h-4 w-4" /> پاکسازی
                </PortalButton>
                <Link href="/dashboard/admin/lab-catalog" className="hidden sm:inline-flex sm:flex-1">
                  <PortalButton variant="ghost" size="sm" aria-label="مدیریت کاتالوگ آزمایش‌ها" className="w-full">
                    <Filter className="h-4 w-4" /> مدیریت کاتالوگ
                  </PortalButton>
                </Link>
              </div>
            </div>
          </div>

          {activeFilters.length > 0 && (
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1 rounded-xl bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-600 ring-1 ring-slate-200">
                <Filter className="h-3.5 w-3.5" /> فیلترهای فعال:
              </div>
              <div className="-mx-2 overflow-x-auto px-2">
                <div className="flex min-w-min flex-nowrap items-center gap-2 pb-1">
                  {activeFilters.map((f) => (
                    <span
                      key={f.key}
                      className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-teal-50 px-3 py-1.5 text-xs font-black text-teal-800 ring-1 ring-teal-200"
                    >
                      {f.label}: <bdi>{f.value}</bdi>
                      <button
                        type="button"
                        onClick={f.onRemove}
                        className="rounded-lg p-0.5 text-teal-600 hover:bg-teal-100 transition-colors"
                        aria-label={`حذف فیلتر ${f.label}`}
                      >
                        <XIcon className="h-3.5 w-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="space-y-4">
        {reports.isPending && <LabLoading />}
        {reports.isError && <LabError message={labError(reports.error)} retry={() => void reports.refetch()} />}

        {!reports.isPending && !reports.isError && (pageData?.items ?? []).length === 0 && (
          <div className="rounded-[32px] border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-400 ring-1 ring-slate-200">
              <SearchX className="h-6 w-6" />
            </div>
            <h3 className="text-base font-black text-slate-800">گزارشی یافت نشد</h3>
            <p className="mx-auto mt-1 max-w-md text-sm text-slate-600">
              {categoryId || from || to
                ? 'برای ترکیب فیلترهای انتخاب‌شده گزارشی ثبت نشده است. فیلترها را تغییر دهید یا بعداً بررسی کنید.'
                : canManage
                  ? 'هنوز گزارشی برای این بیمار ثبت نشده است. از دکمه «ثبت آزمایش جدید» برای افزودن اولین گزارش استفاده کنید.'
                  : 'هنوز گزارشی برای شما ثبت نشده است. برای ثبت آزمایش با پرستار یا مسئول درمان تماس بگیرید.'}
            </p>
          </div>
        )}

        {!reports.isPending && !reports.isError && (pageData?.items ?? []).length > 0 && (
          <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {(pageData!.items).map((r) => {
              const abnormal = r.results.filter((x) => x.isAbnormal).length;
              const hasFile = !!r.fileUrl;
              const canEdit = canManage && r.canEdit;
              const cat = r.categoryId ? categoryMap.get(r.categoryId) : undefined;
              return (
                <li key={r.id} className="group relative rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-0.5 hover:shadow-lg">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center rounded-xl bg-teal-50 px-2 py-0.5 text-[11px] font-bold text-teal-700 ring-1 ring-teal-200">
                          {cat?.name || r.categoryName || 'آزمایش'}
                        </span>
                        {abnormal > 0 && (
                          <span className="inline-flex items-center gap-1 rounded-xl bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-800 ring-1 ring-amber-200">
                            <AlertTriangle className="h-3 w-3" /> {abnormal.toLocaleString('fa-IR')} مورد غیرطبیعی
                          </span>
                        )}
                        {hasFile && (
                          <span className="inline-flex items-center gap-1 rounded-xl bg-sky-50 px-2 py-0.5 text-[11px] font-bold text-sky-700 ring-1 ring-sky-200">
                            {((r.fileType || '').startsWith('image/') ? <FileImage className="h-3 w-3" /> : <FileText className="h-3 w-3" />)}
                            فایل پیوست دارد
                          </span>
                        )}
                      </div>
                      <h3 className="mt-2 line-clamp-1 min-h-[1.5rem] text-base font-black text-slate-900">{r.reportTitle}</h3>
                      <dl className="mt-3 space-y-1.5 text-xs text-slate-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          <dt className="font-bold text-slate-700">تاریخ انجام:</dt>
                          <dd>{labDate(r.performedAt)}</dd>
                        </div>
                        <div>
                          <dt className="font-bold text-slate-700">آزمایشگاه:</dt>
                          <dd className="mt-0.5 break-all">{r.laboratoryName || 'ثبت نشده'}</dd>
                        </div>
                        <div>
                          <dt className="font-bold text-slate-700">نتایج:</dt>
                          <dd className="mt-0.5 flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-700">
                              {r.results.length.toLocaleString('fa-IR')} مورد ثبت‌شده
                            </span>
                            {r.results.some((x) => x.isAbnormal) ? (
                              <LabStatus abnormal hasRange />
                            ) : r.results.length > 0 ? (
                              <LabStatus abnormal={false} hasRange />
                            ) : null}
                          </dd>
                        </div>
                      </dl>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                    <PortalButton variant="outline" size="sm" onClick={() => setDetailId(r.id)}>
                      <FileSearch className="h-4 w-4" /> مشاهده
                    </PortalButton>
                    {canEdit && (
                      <PortalButton variant="outline" size="sm" onClick={() => setWizard({ open: true, editReport: r })} aria-label="ویرایش گزارش">
                        <Edit3 className="h-4 w-4" /> ویرایش
                      </PortalButton>
                    )}
                    {canEdit && (
                      <PortalButton variant="danger" size="sm" onClick={() => setDeleteTarget(r)} aria-label="حذف گزارش">
                        <Trash2 className="h-4 w-4" /> حذف
                      </PortalButton>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {!reports.isPending && !reports.isError && totalPages > 1 && (
          <nav className="flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-slate-200 bg-white px-4 py-3 shadow-sm ring-1 ring-slate-100" aria-label="صفحه‌بندی گزارش‌ها">
            <div className="text-xs font-bold text-slate-600">
              صفحه {page.toLocaleString('fa-IR')} از {totalPages.toLocaleString('fa-IR')}
              <span className="mr-2 text-slate-500">· مجموع {totalItems.toLocaleString('fa-IR')} مورد</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <PortalButton variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                صفحه قبل
              </PortalButton>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const base = Math.max(1, Math.min(totalPages - 4, page - 2));
                const pageNumber = base + i;
                if (pageNumber > totalPages) return null;
                return (
                  <button
                    key={pageNumber}
                    type="button"
                    onClick={() => setPage(pageNumber)}
                    className={`h-9 min-w-[2.25rem] rounded-xl px-3 text-xs font-black transition focus:outline-none focus:ring-2 focus:ring-teal-400 ${
                      pageNumber === page
                        ? 'bg-teal-600 text-white shadow-md shadow-teal-500/20'
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100 ring-1 ring-slate-200'
                    }`}
                    aria-label={`رفتن به صفحه ${pageNumber}`}
                  >
                    {pageNumber.toLocaleString('fa-IR')}
                  </button>
                );
              })}
              <PortalButton variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
                صفحه بعد
              </PortalButton>
            </div>
          </nav>
        )}
      </section>

      {wizard.open && (
        <Suspense fallback={<div className="fixed inset-0 z-[65] flex items-center justify-center bg-slate-50/70 backdrop-blur-sm"><Loader2 className="h-8 w-8 animate-spin text-teal-700" /><span className="mr-3 text-sm font-bold text-slate-700">در حال آماده‌سازی فرم...</span></div>}>
          <LabReportWizard
            patientId={patientId}
            open
            initialReport={wizard.editReport || null}
            onClose={() => setWizard({ open: false, editReport: null })}
            onSaved={onReportSaved}
          />
        </Suspense>
      )}

      {detailId && (
        <Suspense fallback={<div className="fixed inset-0 z-[65] flex items-center justify-center bg-slate-50/70 backdrop-blur-sm"><Loader2 className="h-8 w-8 animate-spin text-teal-700" /><span className="mr-3 text-sm font-bold text-slate-700">در حال آماده‌سازی جزئیات...</span></div>}>
          <LabReportDetail
            patientId={patientId}
            reportId={detailId}
            canEdit={canManage}
            onClose={() => setDetailId(null)}
            onEdited={() => void queryClient.invalidateQueries({ queryKey: ['labs', 'reports', patientId] })}
            onEditRequested={(r) => { setDetailId(null); setWizard({ open: true, editReport: r }); }}
          />
        </Suspense>
      )}

      <Dialog open={!!deleteTarget} onOpenChange={(o) => { if (!o && !deleteMutation.isPending) setDeleteTarget(null); }}>
        <DialogContent dir="rtl" className="w-[92vw] max-w-lg rounded-[28px] bg-white p-6 text-right ring-1 ring-slate-200">
          <DialogTitle className="text-right text-lg font-black text-slate-900">حذف گزارش آزمایش</DialogTitle>
          <DialogDescription className="text-right text-sm leading-7 text-slate-600">
            گزارش <span className="font-black text-slate-900">«{deleteTarget?.reportTitle}»</span> از تاریخ <bdi className="font-black">{deleteTarget ? labDate(deleteTarget.performedAt) : ''}</bdi> همراه با همه نتایج و فایل پیوست آن حذف خواهد شد. این عملیات قابل بازگشت نیست.
          </DialogDescription>
          <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <PortalButton variant="outline" disabled={deleteMutation.isPending} onClick={() => setDeleteTarget(null)}>انصراف</PortalButton>
            <PortalButton
              variant="danger"
              isLoading={deleteMutation.isPending}
              onClick={() => {
                if (deleteTarget) void deleteMutation.mutateAsync(deleteTarget);
              }}
            >
              <Trash2 className="h-4 w-4" /> بله، حذف شود
            </PortalButton>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
