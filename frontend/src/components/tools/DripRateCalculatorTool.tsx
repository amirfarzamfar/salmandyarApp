'use client';

import { useState, useMemo } from 'react';
import { Droplets, Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react';

type DropSet = { id: string; name: string; gtt: number; hint: string };

const dropSets: DropSet[] = [
  { id: 'macro', name: 'ست ماکرو (معمولی)', gtt: 20, hint: 'سرم درمانی معمولی - ۲۰ قطره در میلی‌لیتر' },
  { id: 'micro', name: 'ست میکرو (بچه‌گونه)', gtt: 60, hint: 'سرم درمانی کودک و دقیق - ۶۰ قطره در میلی‌لیتر' },
  { id: 'burette', name: 'ست بیورتی (باری)', gtt: 60, hint: 'ست کنترل حجم دقیق - ۶۰ قطره در میلی‌لیتر' },
];

export default function DripRateCalculatorTool() {
  const [volume, setVolume] = useState<number | ''>('');
  const [hours, setHours] = useState<number | ''>('');
  const [minutes, setMinutes] = useState<number | ''>('');
  const [setId, setSetId] = useState<string>('macro');

  const result = useMemo(() => {
    const v = Number(volume);
    const h = Number(hours || 0);
    const m = Number(minutes || 0);
    const totalMinutes = h * 60 + m;
    const ds = dropSets.find(d => d.id === setId);
    if (!v || v <= 0 || totalMinutes <= 0 || !ds) return null;
    const mlPerHour = Math.round((v / (totalMinutes / 60)) * 10) / 10;
    const mlPerMinute = Math.round((v / totalMinutes) * 100) / 100;
    const dropsPerMinute = Math.round(((v * ds.gtt) / totalMinutes) * 10) / 10;
    return { v, totalMinutes, gtt: ds.gtt, setName: ds.name, mlPerHour, mlPerMinute, dropsPerMinute };
  }, [volume, hours, minutes, setId]);

  return (
    <div>
      <div className="flex items-center gap-3 mb-7">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 text-white flex items-center justify-center shadow-lg shadow-sky-500/20">
          <Droplets size={28} />
        </div>
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900">محاسبه سرعت قطره‌چکان سرم</h2>
          <p className="text-sm text-gray-500 mt-1">محاسبه قطره در دقیقه بر اساس حجم سرم، زمان تزریق و نوع ست قطره‌چکان</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 mb-8">
        <div className="md:col-span-4">
          <label className="block text-sm font-bold text-gray-700 mb-2">حجم سرم (میلی‌لیتر)</label>
          <div className="relative">
            <span className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-400 font-bold text-sm">سی‌سی</span>
            <input
              type="number"
              placeholder="مثلاً ۱۰۰۰"
              value={volume}
              onChange={e => setVolume(e.target.value === '' ? '' : Number(e.target.value))}
              min={1}
              className="w-full h-14 pr-20 pl-4 rounded-2xl bg-gray-50 border-2 border-gray-100 focus:border-sky-500 focus:outline-none focus:ring-4 focus:ring-sky-500/10 transition text-lg font-bold"
            />
          </div>
        </div>
        <div className="md:col-span-4 grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">ساعت</label>
            <input
              type="number"
              placeholder="مثلاً ۸"
              value={hours}
              onChange={e => setHours(e.target.value === '' ? '' : Number(e.target.value))}
              min={0}
              className="w-full h-14 px-4 rounded-2xl bg-gray-50 border-2 border-gray-100 focus:border-sky-500 focus:outline-none focus:ring-4 focus:ring-sky-500/10 transition text-lg font-bold text-center"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">دقیقه</label>
            <input
              type="number"
              placeholder="مثلاً ۰"
              value={minutes}
              onChange={e => setMinutes(e.target.value === '' ? '' : Number(e.target.value))}
              min={0}
              max={59}
              className="w-full h-14 px-4 rounded-2xl bg-gray-50 border-2 border-gray-100 focus:border-sky-500 focus:outline-none focus:ring-4 focus:ring-sky-500/10 transition text-lg font-bold text-center"
            />
          </div>
        </div>
        <div className="md:col-span-4">
          <label className="block text-sm font-bold text-gray-700 mb-2">نوع ست قطره‌چکان</label>
          <select
            value={setId}
            onChange={e => setSetId(e.target.value)}
            className="w-full h-14 px-4 rounded-2xl bg-gray-50 border-2 border-gray-100 focus:border-sky-500 focus:outline-none focus:ring-4 focus:ring-sky-500/10 transition text-lg font-bold appearance-none"
          >
            {dropSets.map(ds => (
              <option key={ds.id} value={ds.id}>{ds.name} ({ds.gtt} gtt/mL)</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-7">
        {dropSets.map(ds => (
          <div
            key={ds.id}
            className={`p-4 rounded-2xl border-2 transition ${
              setId === ds.id
                ? 'bg-sky-50 border-sky-400 shadow-sm'
                : 'bg-gray-50 border-gray-100 opacity-70'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-black text-sm text-gray-900">{ds.name}</span>
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-white border font-black text-sm">{ds.gtt}</span>
            </div>
            <p className="text-[11px] text-gray-600 leading-relaxed">{ds.hint}</p>
          </div>
        ))}
      </div>

      {result && (
        <div className="rounded-3xl p-7 sm:p-8 border-2 bg-gradient-to-br from-sky-50 via-white to-blue-50 border-sky-100 relative overflow-hidden">
          <div className="relative mb-7">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white shadow-sm border mb-4">
              <Sparkles size={14} className="text-yellow-500" />
              <span className="text-xs font-black text-sky-700">نتیجه محاسبه قطرهچکان</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-3xl bg-white p-6 border border-sky-100 text-center shadow-sm">
                <div className="text-xs font-bold text-gray-500 mb-2">تعداد قطره در دقیقه</div>
                <div className="text-6xl font-black text-sky-600 mb-1 leading-none">{result.dropsPerMinute}</div>
                <div className="text-sm font-bold text-gray-600">gtt/min</div>
              </div>
              <div className="rounded-3xl bg-white p-6 border border-blue-100 text-center shadow-sm">
                <div className="text-xs font-bold text-gray-500 mb-2">سرعت تزریق در ساعت</div>
                <div className="text-6xl font-black text-blue-600 mb-1 leading-none">{result.mlPerHour}</div>
                <div className="text-sm font-bold text-gray-600">سی‌سی در ساعت</div>
              </div>
              <div className="rounded-3xl bg-white p-6 border border-indigo-100 text-center shadow-sm">
                <div className="text-xs font-bold text-gray-500 mb-2">سرعت تزریق در دقیقه</div>
                <div className="text-6xl font-black text-indigo-600 mb-1 leading-none">{result.mlPerMinute}</div>
                <div className="text-sm font-bold text-gray-600">سی‌سی در دقیقه</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="rounded-2xl bg-white/80 border border-white p-5">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 size={20} className="text-emerald-600" />
                <h4 className="font-black text-lg text-gray-900">فرمول کلیدی</h4>
              </div>
              <div className="font-mono text-sm sm:text-base bg-gray-50 p-4 rounded-2xl border border-gray-100 text-gray-800 mb-2 text-center">
                قطره در دقیقه = ( حجم سی‌سی × ضریب ست ) ÷ زمان کل (دقیقه)
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                = ( {result.v} × {result.gtt} ) ÷ {result.totalMinutes} = <strong className="text-sky-700">{result.dropsPerMinute}</strong> قطره در دقیقه
              </p>
            </div>
            <div className="rounded-2xl bg-amber-50 border border-amber-200 p-5">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={20} className="text-amber-600" />
                <h4 className="font-black text-lg text-gray-900">نکات مهم برای پرستار</h4>
              </div>
              <ul className="space-y-2">
                {[
                  'همیشه قبل از شروع تزریق، سرعت را با شمارش دستی چک کنید.',
                  'برای داروهای قلبی و نئوناتال حتماً از پمپ سرم استفاده کنید.',
                  'هر ۱ ساعت یکبار سرعت و محل را چک نمایید.',
                  'نام دارو، دوز و نام بیمار را کنترل کنید.',
                ].map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-800 leading-relaxed">
                    <span className="w-5 h-5 shrink-0 rounded-full bg-amber-500 text-white flex items-center justify-center font-black text-[10px] mt-0.5">
                      {i + 1}
                    </span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
