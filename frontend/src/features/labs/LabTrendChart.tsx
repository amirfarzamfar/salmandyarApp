'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine, ResponsiveContainer } from 'recharts';
import { FlaskConical, TrendingUp } from 'lucide-react';
import { labApi, labError, LabTrendPoint } from './lab-api';
import { LabDrawer, LabError, LabLoading, LabEmpty } from './LabShared';
import { safeFormatJalali, safeParseDate } from '@/lib/assignment-status';

export function LabTrendChart({ patientId, definitionId, definitionName, onClose }: {
  patientId: number; definitionId: number; definitionName: string; onClose: () => void;
}) {
  const [raw, setRaw] = useState(false);
  const trend = useQuery({
    queryKey: ['labs', 'trend', patientId, definitionId],
    queryFn: () => labApi.trend(patientId, definitionId),
  });
  const points = useMemo(() => (trend.data || []).slice().sort((a, b) => (safeParseDate(a.performedAt)?.getTime() ?? 0) - (safeParseDate(b.performedAt)?.getTime() ?? 0)), [trend.data]);
  const refMin = points.find((p) => p.referenceMin != null)?.referenceMin;
  const refMax = points.find((p) => p.referenceMax != null)?.referenceMax;
  const unit = points.find((p) => p.unit)?.unit || '';
  const chartData = points.map((p) => ({
    ...p,
    label: safeFormatJalali(safeParseDate(p.performedAt), 'yy/MM/dd', '—'),
  }));

  function renderTooltip({ active, payload }: { active?: unknown; payload?: unknown }) {
    if (!active || !Array.isArray(payload) || !payload.length) return null;
    const first = (payload as Array<{ payload: LabTrendPoint & { label: string } }>)[0];
    if (!first) return null;
    const p = first.payload;
    const abnormal = (p.referenceMin != null && p.value < p.referenceMin) || (p.referenceMax != null && p.value > p.referenceMax);
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-3 text-sm shadow-lg">
        <div className="mb-1 font-bold text-slate-800">{p.label}</div>
        <div className={`font-black ${abnormal ? 'text-amber-700' : 'text-teal-700'}`}>
          مقدار: <bdi>{p.value.toLocaleString('fa-IR')}</bdi>{unit ? ` ${unit}` : ''}
        </div>
        {(p.referenceMin != null || p.referenceMax != null) && (
          <div className="mt-1 text-xs text-slate-600">
            مرجع: <bdi>{p.referenceMin ?? '...'} تا {p.referenceMax ?? '...'}</bdi>
          </div>
        )}
        {abnormal && <div className="mt-1 text-xs text-amber-800">خارج از محدوده مرجع</div>}
      </div>
    );
  }

  return (
    <LabDrawer title={`روند «${definitionName}» در زمان`} description="تغییرات مقدار آزمایش در گزارش‌های گذشته را مقایسه کنید." onClose={onClose}>
      <div className="space-y-4">
        <div className={`rounded-2xl border px-3 py-2 text-xs ${raw ? 'bg-slate-100 text-slate-700' : 'bg-white border-slate-200 text-slate-600'}`}>
          {points.length.toLocaleString('fa-IR')} گزارش ثبت‌شده.
          {(refMin != null || refMax != null) && <span className="mr-3"> محدوده مرجع: <bdi>{refMin ?? '...'} تا {refMax ?? '...'}{unit ? ` ${unit}` : ''}</bdi></span>}
          <label className="mr-4 inline-flex items-center gap-2">
            <input type="checkbox" className="accent-teal-600" checked={raw} onChange={(e) => setRaw(e.target.checked)} aria-label="نمایش مقادیر خام" />
            نمایش جدول مقادیر
          </label>
        </div>

        {trend.isPending && <LabLoading />}
        {trend.isError && <LabError message={labError(trend.error)} retry={() => void trend.refetch()} />}

        {!trend.isPending && !trend.isError && points.length < 2 && (
          <LabEmpty text="حداقل ۲ گزارش ثبت‌شده برای رسم نمودار نیاز است. بعد از ثبت گزارش‌های بیشتر اینجا روند را مشاهده می‌کنید." />
        )}

        {!trend.isPending && !trend.isError && points.length >= 2 && !raw && (
            <div className="h-80 w-full min-w-0 overflow-x-auto rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm ring-1 ring-slate-100">
            <ResponsiveContainer width="100%" height="100%" minWidth={Math.max(520, points.length * 70)}>
              <LineChart data={chartData} margin={{ top: 20, right: 24, left: 0, bottom: 24 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="label" stroke="#475569" tick={{ fill: '#334155', fontSize: 12 }} angle={-18} textAnchor="end" height={60} />
                <YAxis stroke="#475569" tick={{ fill: '#334155', fontSize: 12 }} width={60} label={{ value: unit || definitionName, angle: -90, position: 'insideLeft', fill: '#0f766e', style: { fontSize: 12, fontWeight: 700 } }} />
                <Tooltip content={renderTooltip} cursor={{ stroke: '#0f766e', strokeWidth: 1 }} />
                {refMin != null && <ReferenceLine y={refMin} stroke="#f59e0b" strokeDasharray="5 5" label={{ value: `Min مرجع ${refMin}`, fill: '#b45309', position: 'insideTopRight', fontSize: 11 }} />}
                {refMax != null && <ReferenceLine y={refMax} stroke="#f59e0b" strokeDasharray="5 5" label={{ value: `Max مرجع ${refMax}`, fill: '#b45309', position: 'insideBottomRight', fontSize: 11 }} />}
                <Line type="monotone" dataKey="value" stroke="#0f766e" strokeWidth={3} dot={{ r: 5, fill: '#0f766e', strokeWidth: 2, stroke: '#ffffff' }} activeDot={{ r: 8, fill: '#0d9488', stroke: '#ffffff', strokeWidth: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {!trend.isPending && !trend.isError && points.length >= 1 && raw && (
          <div className="overflow-x-auto rounded-[28px] border border-slate-200 bg-white shadow-sm ring-1 ring-slate-100">
            <table className="w-full min-w-[480px] border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-700">
                  <th className="px-4 py-3 text-right font-bold">تاریخ انجام</th>
                  <th className="px-4 py-3 text-right font-bold">مقدار</th>
                  <th className="px-4 py-3 text-right font-bold">واحد</th>
                  <th className="px-4 py-3 text-right font-bold">محدوده مرجع</th>
                  <th className="px-4 py-3 text-right font-bold">وضعیت</th>
                </tr>
              </thead>
              <tbody>
                {chartData.slice().reverse().map((p, idx) => {
                  const abnormal = (p.referenceMin != null && p.value < p.referenceMin) || (p.referenceMax != null && p.value > p.referenceMax);
                  return (
                    <tr key={String(p.reportId) + idx} className="border-t border-slate-100 hover:bg-teal-50/50">
                      <td className="px-4 py-3">{p.label}</td>
                      <td className={`px-4 py-3 font-bold ${abnormal ? 'text-amber-700' : 'text-teal-700'}`}><bdi>{p.value.toLocaleString('fa-IR')}</bdi></td>
                      <td className="px-4 py-3 text-slate-600">{p.unit || '—'}</td>
                      <td className="px-4 py-3 text-slate-600"><bdi>{p.referenceMin ?? '...'} تا {p.referenceMax ?? '...'}</bdi></td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold ${abnormal ? 'bg-amber-100 text-amber-900' : 'bg-teal-100 text-teal-900'}`}>
                          {abnormal ? <TrendingUp className="h-3.5 w-3.5" /> : <FlaskConical className="h-3.5 w-3.5" />}
                          {abnormal ? 'خارج از محدوده' : 'در محدوده'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </LabDrawer>
  );
}
