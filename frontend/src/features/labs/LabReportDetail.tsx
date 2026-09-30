'use client';

import { Suspense, lazy, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  Download, Trash2, Edit3, FlaskConical, AlertTriangle, ExternalLink, FileImage, FileText,
  TrendingUp, ShieldCheck, Loader2, AlertCircle
} from 'lucide-react';
import axios from 'axios';
import { labApi, labError, LabReport } from './lab-api';
import { LabDrawer, LabError, LabLoading, LabStatus, labDate, labRange } from './LabShared';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { PortalButton } from '@/components/portal/ui/portal-button';

const LabTrendChart = lazy(() =>
  import('./LabTrendChart').then((m) => ({ default: m.LabTrendChart }))
);

export function LabReportDetail({ patientId, reportId, canEdit, onClose, onEdited, onEditRequested }: {
  patientId: number; reportId: string; canEdit: boolean; onClose: () => void; onEdited?: () => void; onEditRequested?: (r: LabReport) => void;
}) {
  const queryClient = useQueryClient();
  const report = useQuery({
    queryKey: ['labs', 'report', patientId, reportId],
    queryFn: () => labApi.report(patientId, reportId),
  });
  const [trend, setTrend] = useState<{ id: number; name: string } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmDeleteFile, setConfirmDeleteFile] = useState(false);
  const [busy, setBusy] = useState<'' | 'delete' | 'removeFile' | 'download'>('');

  const deleteMutation = useMutation({
    mutationFn: (r: LabReport) => labApi.deleteReport(r),
    onSuccess: () => {
      toast.success('گزارش آزمایش با موفقیت حذف شد.');
      void queryClient.invalidateQueries({ queryKey: ['labs', 'reports', patientId] });
      void queryClient.invalidateQueries({ queryKey: ['labs', 'report', patientId] });
      onEdited?.();
      onClose();
    },
    onError: (err) => toast.error(labError(err)),
    onSettled: () => setBusy(''),
  });
  const removeFileMutation = useMutation({
    mutationFn: (r: LabReport) => labApi.removeFile(r),
    onSuccess: () => {
      toast.success('فایل پیوست حذف شد.');
      void queryClient.invalidateQueries({ queryKey: ['labs', 'report', patientId] });
      onEdited?.();
    },
    onError: (err) => toast.error(labError(err)),
    onSettled: () => setBusy(''),
  });

  async function onDownload(r: LabReport) {
    if (!r.fileUrl) return;
    try {
      setBusy('download');
      const { data, headers } = await axios.get(r.fileUrl, { responseType: 'blob', withCredentials: true });
      const disposition = typeof headers === 'object' && headers != null ? (headers as Record<string, unknown>)['content-disposition'] : undefined;
      let name = `lab-report-${r.id}.bin`;
      if (typeof disposition === 'string') {
        const m = /filename[^;\n]*=(UTF-8['"]*)?("?)([^"]+)\2/i.exec(disposition);
        if (m?.[3]) name = decodeURIComponent(m[3]).replace(/^"|"$/g, '');
      }
      const url = URL.createObjectURL(data as Blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    } catch (e) {
      toast.error(labError(e));
    } finally {
      setBusy('');
    }
  }

  function onPreviewNewTab(r: LabReport) {
    if (!r.fileUrl) return;
    window.open((axios.defaults.baseURL || '/api') + r.fileUrl, '_blank', 'noopener,noreferrer');
  }

  return (
    <>
      <LabDrawer
        title={report.data ? `جزئیات گزارش «${report.data.reportTitle}»` : 'جزئیات گزارش آزمایش'}
        description={report.data ? `${report.data.categoryName} · آزمایشگاه ${report.data.laboratoryName || 'ثبت نشده'}` : 'در حال دریافت اطلاعات گزارش...'}
        onClose={onClose}
        busy={busy !== ''}
      >
        <div className="space-y-5">
          {report.isPending && <LabLoading />}
          {report.isError && <LabError message={labError(report.error)} retry={() => void report.refetch()} />}

          {report.data && (
            <>
              <section className="rounded-[32px] border border-slate-200 bg-white p-5 text-slate-900 shadow-sm ring-1 ring-slate-100 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-black leading-6">{report.data.reportTitle}</h2>
                      <span className="rounded-xl bg-teal-50 px-2.5 py-1 text-xs font-bold text-teal-700 ring-1 ring-teal-200">{report.data.categoryName}</span>
                      {report.data.canEdit ? (
                        <span className="inline-flex items-center gap-1 rounded-xl bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200">
                          <ShieldCheck className="h-3.5 w-3.5" /> قابل ویرایش
                        </span>
                      ) : null}
                    </div>
                    <dl className="grid grid-cols-1 gap-3 text-sm text-slate-600 sm:grid-cols-2">
                      <div className="flex gap-2">
                        <dt className="min-w-[7rem] font-bold text-slate-700">آزمایشگاه:</dt>
                        <dd className="min-w-0 break-all">{report.data.laboratoryName || 'ثبت نشده'}</dd>
                      </div>
                      <div className="flex gap-2">
                        <dt className="min-w-[7rem] font-bold text-slate-700">تاریخ انجام:</dt>
                        <dd>{labDate(report.data.performedAt)}</dd>
                      </div>
                      <div className="flex gap-2 sm:col-span-2">
                        <dt className="min-w-[7rem] shrink-0 font-bold text-slate-700">توضیحات:</dt>
                        <dd className="min-w-0 whitespace-pre-wrap break-words leading-7 text-slate-700">{report.data.notes || 'توضیحی ثبت نشده است.'}</dd>
                      </div>
                    </dl>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    {canEdit && report.data.canEdit && onEditRequested && (
                      <PortalButton variant="outline" onClick={() => onEditRequested(report.data!)} aria-label="ویرایش گزارش">
                        <Edit3 className="h-4 w-4" /> ویرایش
                      </PortalButton>
                    )}
                    {canEdit && report.data.canEdit && (
                      <PortalButton variant="danger" disabled={busy === 'delete'} isLoading={busy === 'delete'} onClick={() => setConfirmDelete(true)} aria-label="حذف گزارش">
                        <Trash2 className="h-4 w-4" /> حذف
                      </PortalButton>
                    )}
                  </div>
                </div>
              </section>

              <section className={`rounded-[32px] border p-5 shadow-sm ring-1 sm:p-6 ${report.data.fileUrl ? 'border-teal-200 bg-teal-50/40 ring-teal-100' : 'border-dashed border-slate-300 bg-slate-50 ring-slate-100'}`}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${report.data.fileUrl ? 'bg-teal-600 text-white shadow-lg shadow-teal-500/20' : 'bg-white text-slate-400 ring-1 ring-slate-200'}`}>
                      {report.data.fileUrl
                        ? ((report.data.fileType || '').startsWith('image/') ? <FileImage className="h-6 w-6" /> : <FileText className="h-6 w-6" />)
                        : <FlaskConical className="h-6 w-6" />}
                    </div>
                    <div className="min-w-0">
                      <div className="font-black text-slate-800">{report.data.fileUrl ? 'فایل اصلی گزارش آزمایش' : 'فایل پیوست ثبت نشده'}</div>
                      <div className="mt-1 text-xs text-slate-600">
                        {report.data.fileUrl
                          ? `نوع: ${report.data.fileType || 'فایل'}`
                          : 'می‌توانید هنگام ثبت یا ویرایش گزارش، اسکن یا فایل PDF آزمایش را پیوست کنید.'}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {report.data.fileUrl && (
                      <>
                        <PortalButton variant="outline" onClick={() => onPreviewNewTab(report.data!)} aria-label="پیش‌نمایش فایل در تب جدید">
                          <ExternalLink className="h-4 w-4" /> پیش‌نمایش
                        </PortalButton>
                        <PortalButton disabled={busy === 'download'} isLoading={busy === 'download'} onClick={() => void onDownload(report.data!)} aria-label="دانلود فایل آزمایش">
                          <Download className="h-4 w-4" /> دانلود فایل
                        </PortalButton>
                      </>
                    )}
                    {canEdit && report.data.canEdit && report.data.fileUrl && (
                      <PortalButton variant="danger" disabled={busy === 'removeFile'} isLoading={busy === 'removeFile'} onClick={() => setConfirmDeleteFile(true)} aria-label="حذف فایل پیوست">
                        <Trash2 className="h-4 w-4" /> حذف فایل
                      </PortalButton>
                    )}
                  </div>
                </div>
              </section>

              <section className="rounded-[32px] border border-slate-200 bg-white p-5 shadow-sm ring-1 ring-slate-100 sm:p-6">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <h3 className="flex items-center gap-2 text-base font-black text-slate-800">
                    <FlaskConical className="h-5 w-5 text-teal-600" /> نتایج آزمایش
                    <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600">{report.data.results.length.toLocaleString('fa-IR')} مورد</span>
                  </h3>
                  {report.data.results.some((r) => r.isAbnormal) && (
                    <span className="inline-flex items-center gap-1 rounded-xl bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800 ring-1 ring-amber-200">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      {report.data.results.filter((r) => r.isAbnormal).length.toLocaleString('fa-IR')} مورد خارج از محدوده مرجع
                    </span>
                  )}
                </div>

                {report.data.results.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
                    <FlaskConical className="mx-auto mb-2 h-8 w-8 text-slate-400" />
                    برای این گزارش نتیجه ساختاریافته ثبت نشده است؛ فقط فایل اصلی گزارش موجود است.
                  </div>
                ) : (
                  <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {report.data.results.map((r) => {
                      const isNumeric = r.dataType === 'Number';
                      return (
                        <li key={r.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm ring-1 ring-slate-100">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <div className="font-bold text-slate-800">{r.name}</div>
                                {r.dataType !== 'Number' && (
                                  <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">{r.dataType}</span>
                                )}
                                {isNumeric && <LabStatus abnormal={r.isAbnormal} hasRange={r.referenceMin != null || r.referenceMax != null} />}
                              </div>
                              <div className="mt-2 flex flex-wrap items-baseline gap-3 text-sm text-slate-700">
                                {isNumeric ? (
                                  <span className={`text-lg font-black ${r.isAbnormal ? 'text-amber-700' : 'text-teal-700'}`}>
                                    <bdi>{r.numericValue?.toLocaleString('fa-IR') ?? '—'}</bdi>
                                    {r.unit ? <span className="ml-1 text-sm font-medium text-slate-500">{r.unit}</span> : null}
                                  </span>
                                ) : r.dataType === 'Boolean' ? (
                                  <span className={`font-bold ${r.booleanValue ? 'text-emerald-700' : 'text-slate-700'}`}>
                                    {r.booleanValue ? 'مثبت / بله' : 'منفی / خیر'}
                                  </span>
                                ) : (
                                  <span className="whitespace-pre-wrap break-words font-medium leading-7 text-slate-800">{r.textValue || '—'}</span>
                                )}
                                {isNumeric && (r.referenceMin != null || r.referenceMax != null) && (
                                  <span className="text-xs text-slate-500">
                                    مرجع: <bdi>{labRange(r.referenceMin, r.referenceMax)}</bdi>{r.unit ? ` ${r.unit}` : ''}
                                  </span>
                                )}
                              </div>
                              {r.notes && <div className="mt-2 rounded-xl bg-slate-50 p-2.5 text-xs text-slate-600 ring-1 ring-slate-100">{r.notes}</div>}
                            </div>
                            {isNumeric && (
                              <button
                                type="button"
                                onClick={() => setTrend({ id: r.labTestDefinitionId, name: r.name })}
                                className="inline-flex shrink-0 items-center gap-1 rounded-xl bg-slate-50 px-2.5 py-1.5 text-xs font-bold text-teal-700 transition hover:bg-teal-50 focus:outline-none focus:ring-2 focus:ring-teal-400 ring-1 ring-slate-200"
                                aria-label={`نمایش روند ${r.name}`}
                              >
                                <TrendingUp className="h-3.5 w-3.5" /> روند
                              </button>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>

              <footer className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs leading-6 text-slate-600 ring-1 ring-slate-100">
                <p className="flex items-start gap-2">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                  نتایج نمایش‌داده‌شده فقط برای اطلاع‌رسانی هستند و جایگزین تفسیر یا تشخیص پزشک نمی‌شوند. در صورت مشاهده نتیجه ناهنجار با پزشک معالج یا پرستار مسئول مشورت کنید.
                </p>
                <p className="mt-2 text-slate-500">
                  آخرین بروزرسانی گزارش در <bdi>{labDate(report.data.performedAt)}</bdi>؛ برای ویرایش هم‌زمان از «نسخه» جلوگیری می‌شود (Conflict 409).
                </p>
              </footer>
            </>
          )}
        </div>
      </LabDrawer>

      {trend && (
        <Suspense fallback={<div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-50/60"><Loader2 className="h-7 w-7 animate-spin text-teal-700" /></div>}>
          <LabTrendChart patientId={patientId} definitionId={trend.id} definitionName={trend.name} onClose={() => setTrend(null)} />
        </Suspense>
      )}

      <Dialog open={confirmDelete} onOpenChange={(open) => { if (busy === 'delete') return; setConfirmDelete(open); }}>
        <DialogContent dir="rtl" className="w-[92vw] max-w-lg rounded-[28px] bg-white p-6 text-right ring-1 ring-slate-200">
          <DialogTitle className="text-right text-lg font-black text-slate-900">حذف گزارش آزمایش</DialogTitle>
          <DialogDescription className="text-right text-sm leading-7 text-slate-600">
            با حذف این گزارش، همه نتایج ثبت‌شده و در صورت وجود فایل اصلی آزمایش نیز حذف می‌گردند. این عملیات قابل بازگشت نیست.
          </DialogDescription>
          <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <PortalButton variant="outline" disabled={busy === 'delete'} onClick={() => setConfirmDelete(false)}>انصراف</PortalButton>
            <PortalButton variant="danger" isLoading={busy === 'delete'} onClick={() => { if (!report.data) return; setBusy('delete'); void deleteMutation.mutateAsync(report.data); }}>
              {busy === 'delete' ? (<><Loader2 className="h-4 w-4 animate-spin" /> در حال حذف...</>) : (<><Trash2 className="h-4 w-4" /> بله، حذف شود</>)}
            </PortalButton>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmDeleteFile} onOpenChange={(open) => { if (busy === 'removeFile') return; setConfirmDeleteFile(open); }}>
        <DialogContent dir="rtl" className="w-[92vw] max-w-lg rounded-[28px] bg-white p-6 text-right ring-1 ring-slate-200">
          <DialogTitle className="text-right text-lg font-black text-slate-900">حذف فایل پیوست</DialogTitle>
          <DialogDescription className="text-right text-sm leading-7 text-slate-600">
            فقط فایل اصلی آزمایش حذف می‌شود؛ نتایج ساختاریافته گزارش حفظ می‌گردند. بعداً می‌توانید از طریق ویرایش گزارش دوباره فایل آپلود کنید.
          </DialogDescription>
          <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <PortalButton variant="outline" disabled={busy === 'removeFile'} onClick={() => setConfirmDeleteFile(false)}>انصراف</PortalButton>
            <PortalButton variant="danger" isLoading={busy === 'removeFile'} onClick={() => { if (!report.data) return; setBusy('removeFile'); void removeFileMutation.mutateAsync(report.data); }}>
              {busy === 'removeFile' ? (<><Loader2 className="h-4 w-4 animate-spin" /> در حال حذف...</>) : (<><Trash2 className="h-4 w-4" /> حذف فایل</>)}
            </PortalButton>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
