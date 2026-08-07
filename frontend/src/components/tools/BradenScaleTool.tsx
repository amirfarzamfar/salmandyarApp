'use client';

import { useState, useMemo } from 'react';
import { BedDouble, Sparkles, AlertTriangle, CheckCircle2, Shield } from 'lucide-react';

type SubScale = {
  id: string;
  title: string;
  desc: string;
  options: { value: number; label: string }[];
};

const subscales: SubScale[] = [
  {
    id: 'sensory',
    title: 'احساس لمس',
    desc: 'توانایی درک دردهای ناشی از فشار',
    options: [
      { value: 1, label: 'کاملاً مختل شده' },
      { value: 2, label: 'بسیار مختل شده' },
      { value: 3, label: 'اندکی مختل شده' },
      { value: 4, label: 'بدون آسیب' },
    ],
  },
  {
    id: 'moisture',
    title: 'میزان رطوبت پوست',
    desc: 'درجه مواجهه پوست با رطوبت',
    options: [
      { value: 1, label: 'همیشه مرطوب' },
      { value: 2, label: 'بسیار مرطوب' },
      { value: 3, label: 'گاهی مرطوب' },
      { value: 4, label: 'معمولاً خشک' },
    ],
  },
  {
    id: 'activity',
    title: 'سطح فعالیت',
    desc: 'میزان تحرک جسمی',
    options: [
      { value: 1, label: 'کاملاً محدود به تخت' },
      { value: 2, label: 'محدود به صندلی چرخدار' },
      { value: 3, label: 'پیاده‌روی اندک' },
      { value: 4, label: 'پیاده‌روی مکرر' },
    ],
  },
  {
    id: 'mobility',
    title: 'توانایی تغییر وضعیت',
    desc: 'توانایی حرکت و کنترل بدن',
    options: [
      { value: 1, label: 'کاملاً بی‌حرکت' },
      { value: 2, label: 'بسیار محدود' },
      { value: 3, label: 'اندکی محدود' },
      { value: 4, label: 'بدون محدودیت' },
    ],
  },
  {
    id: 'nutrition',
    title: 'وضعیت تغذیه',
    desc: 'کیفیت الگوی غذایی معمول',
    options: [
      { value: 1, label: 'بسیار ضعیف' },
      { value: 2, label: 'احتمالاً ناکافی' },
      { value: 3, label: 'کافی' },
      { value: 4, label: 'عالی' },
    ],
  },
  {
    id: 'friction',
    title: 'اصطکاک و برش‌خوردگی',
    desc: 'خطر آسیب ناشی از سوختن سطحی',
    options: [
      { value: 1, label: 'مشکل‌ساز' },
      { value: 2, label: 'احتمالاً مشکل‌ساز' },
      { value: 3, label: 'بدون مشکل ظاهری' },
    ],
  },
];

export default function BradenScaleTool() {
  const [scores, setScores] = useState<Record<string, number | ''>>({});

  const result = useMemo(() => {
    const values = Object.values(scores).filter(v => v !== '') as number[];
    if (values.length !== subscales.length) return null;
    const total = values.reduce((s, a) => s + a, 0);
    let level = '';
    let color = '';
    let bg = '';
    let border = '';
    let desc = '';
    let plan: string[] = [];
    if (total >= 19) {
      level = 'بدون خطر یا خطر خیلی کم';
      color = 'text-emerald-700';
      bg = 'bg-emerald-50';
      border = 'border-emerald-200';
      desc = 'بیمار در وضعیت امنی قرار دارد. اقدامات استاندارد پیشگیری کافی است.';
      plan = ['نگهداری بهداشت پوست', 'تغذیه کافی و هیدراسیون', 'پیاده‌روی منظم'];
    } else if (total >= 15 && total <= 18) {
      level = 'خطر کم';
      color = 'text-green-700';
      bg = 'bg-green-50';
      border = 'border-green-200';
      desc = 'ریسک بروز زخم بستر وجود دارد. نیاز به اقدامات پیشگیرانه دوره‌ای است.';
      plan = ['تغییر وضعیت هر ۳ تا ۴ ساعت', 'استفاده از تشک مناسب', 'بررسی روزانه پوست'];
    } else if (total >= 13 && total <= 14) {
      level = 'خطر متوسط';
      color = 'text-amber-700';
      bg = 'bg-amber-50';
      border = 'border-amber-200';
      desc = 'بیمار در معرض خطر قابل توجه است. باید برنامه پیشگیری دقیق اجرا شود.';
      plan = [
        'تغییر وضعیت هر ۲ ساعت',
        'استفاده از تشک هوایی ضدزخم',
        'پاسخ سریع به شرایط مرطوب‌کننده',
        'تقویت پروتئین رژیم',
      ];
    } else if (total >= 10 && total <= 12) {
      level = 'خطر بالا';
      color = 'text-orange-700';
      bg = 'bg-orange-50';
      border = 'border-orange-200';
      desc = 'احتمال بالای بروز زخم بستر وجود دارد. باید فوری مداخله کرد.';
      plan = [
        'تغییر وضعیت هر ۱ تا ۲ ساعت',
        'تشک مدرج درمانی (هوایی یا آب)',
        'مشورت با متخصص تغذیه بالینی',
        'پانسمان‌های محافظ در استخوان‌های برجسته',
      ];
    } else {
      level = 'خطر بسیار بالا (اورژانسی)';
      color = 'text-red-700';
      bg = 'bg-red-50';
      border = 'border-red-200';
      desc = 'ریسک بسیار شدید بروز زخم بستر یا وجود زخم مخفی. نیازمند اقدامات فوری و تیم چند رشته‌ای است.';
      plan = [
        'تغییر وضعیت هر ۱ ساعت و روکش‌کاری مداوم',
        'استفاده از تشک درمانی با کیفیت',
        'مشورت فوری با جراح پلاستیک یا متخصص زخم',
        'تقویت تغذیه با مکمل‌های درمانی',
      ];
    }
    return { total, level, color, bg, border, desc, plan };
  }, [scores]);

  return (
    <div>
      <div className="flex items-center gap-3 mb-7">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 text-white flex items-center justify-center shadow-lg shadow-rose-500/20">
          <BedDouble size={28} />
        </div>
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900">ارزیابی ریسک زخم بستر (اسکیل برادن)</h2>
          <p className="text-sm text-gray-500 mt-1">محاسبه ریسک بروز زخم بستر با معتبرترین پرسشنامه بالینی جهان</p>
        </div>
      </div>

      <p className="mb-5 text-sm text-gray-600 bg-gray-50 p-3.5 rounded-2xl border border-gray-100 leading-relaxed">
        از گزینه‌های زیر وضعیت بیمار را انتخاب کنید. امتیاز کل از ۶ تا ۲۳ متغیر است؛ هرچه امتیاز <strong className="text-rose-700">کمتر</strong> باشد، ریسک زخم بستر <strong>بیشتر</strong> است.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
        {subscales.map(sub => (
          <div key={sub.id} className="p-5 rounded-3xl bg-white border-2 border-gray-100 hover:border-gray-200 transition">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <h4 className="font-black text-lg text-gray-900 mb-1">{sub.title}</h4>
                <p className="text-xs text-gray-500">{sub.desc}</p>
              </div>
              <span className="shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 text-white font-black">
                {scores[sub.id] ?? '?'}
              </span>
            </div>
            <div className="space-y-2">
              {sub.options.map(opt => {
                const checked = scores[sub.id] === opt.value;
                return (
                  <label
                    key={opt.value}
                    className={`flex items-center gap-2.5 p-3 rounded-2xl border-2 cursor-pointer transition ${
                      checked
                        ? 'bg-rose-50 border-rose-400 shadow-sm ring-4 ring-rose-500/10'
                        : 'bg-gray-50 border-gray-100 hover:bg-white hover:border-gray-200'
                    }`}
                  >
                    <input
                      type="radio"
                      checked={checked}
                      onChange={() => setScores(prev => ({ ...prev, [sub.id]: opt.value }))}
                      className="w-4 h-4 text-rose-600"
                    />
                    <span className="flex items-center gap-2">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-white border font-black text-xs">
                        {opt.value}
                      </span>
                      <span className="font-bold text-sm text-gray-800">{opt.label}</span>
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {result && (
        <div className={`rounded-3xl p-7 sm:p-8 border-2 ${result.bg} ${result.border} relative overflow-hidden`}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
            <div className="lg:col-span-5 text-center lg:text-start">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white shadow-sm border mb-4">
                <Sparkles size={14} className="text-yellow-500" />
                <span className={`text-xs font-black ${result.color}`}>نتیجه ارزیابی</span>
              </div>
              <div className={`text-8xl sm:text-9xl font-black ${result.color} leading-none mb-2`}>
                {result.total}
              </div>
              <div className={`text-base sm:text-lg font-black ${result.color} mb-2`}>از ۲۳ امتیاز</div>
              <div className={`inline-block px-4 py-2 rounded-2xl bg-white shadow-sm border ${result.border} font-black ${result.color}`}>
                سطح ریسک: {result.level}
              </div>
            </div>
            <div className="lg:col-span-7 space-y-5">
              <p className="text-base sm:text-lg leading-loose text-gray-800 font-medium">{result.desc}</p>
              <div className="h-4 w-full rounded-full bg-gray-200/60 overflow-hidden relative">
                <div className="absolute inset-0 flex">
                  <div className="bg-red-500/80" style={{ width: '35%' }} />
                  <div className="bg-orange-500/80" style={{ width: '13%' }} />
                  <div className="bg-amber-500/80" style={{ width: '9%' }} />
                  <div className="bg-green-500/80" style={{ width: '18%' }} />
                  <div className="bg-emerald-500/80 flex-1" />
                </div>
                <div
                  className="absolute -top-1.5 h-7 w-1.5 bg-slate-900 rounded-full shadow-lg transition-all duration-700"
                  style={{ right: `calc(${100 - ((result.total - 6) / 17) * 100}% - 3px)` }}
                >
                  <div className="absolute -top-7 right-1/2 translate-x-1/2 px-2 py-0.5 rounded bg-slate-900 text-white text-xs font-black whitespace-nowrap">شما</div>
                </div>
              </div>
              <div className="flex justify-between text-[10px] sm:text-xs font-bold text-gray-500 px-1">
                <span className="text-red-700">خیلی بالا (۶)</span>
                <span className="text-orange-700">بالا (۱۰)</span>
                <span className="text-amber-700">متوسط (۱۳)</span>
                <span className="text-green-700">کم (۱۵)</span>
                <span className="text-emerald-700">بی‌خطر (۲۳)</span>
              </div>
              {result.total <= 12 && (
                <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-50 border-2 border-red-200">
                  <AlertTriangle size={22} className="text-red-600 shrink-0 mt-0.5 animate-pulse" />
                  <div>
                    <div className="font-black text-red-800 mb-1">نیاز به اقدام فوری پزشکی</div>
                    <p className="text-sm text-red-900/90 leading-relaxed">
                      ریسک بروز زخم بستر شدید است. لطفاً <u>بدون تأخیر</u> با پرستار یا پزشک معالج مشورت کنید و برنامه پیشگیری دقیق را اجرا نمایید.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-7 pt-6 border-t border-white/70">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 rounded-xl bg-white border flex items-center justify-center">
                <Shield size={20} className="text-slate-800" />
              </div>
              <h4 className="font-black text-xl text-gray-900">برنامه پیشگیری پیشنهادی بر اساس سطح ریسک</h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {result.plan.map((item, i) => (
                <div key={i} className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-white/80 border border-white">
                  <CheckCircle2 size={19} className={`shrink-0 mt-0.5 ${result.color}`} />
                  <p className="text-sm text-gray-800 leading-relaxed font-medium">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
