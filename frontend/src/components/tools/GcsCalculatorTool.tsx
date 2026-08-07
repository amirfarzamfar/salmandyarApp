'use client';

import { useState, useMemo } from 'react';
import { Brain, Sparkles, AlertTriangle, CheckCircle2, ChevronDown } from 'lucide-react';

type Option = { value: number; label: string; desc?: string };

const eyeOptions: Option[] = [
  { value: 4, label: 'خود‌به‌خود باز می‌شود', desc: 'پاسخ به زمان معمولی خواب و بیدار' },
  { value: 3, label: 'با صدای دستور باز می‌شود', desc: 'با صحبت کردن و صدا زدن' },
  { value: 2, label: 'فقط با درد باز می‌شود', desc: 'فشار روی ناخن بستر یا مالش استرنوم' },
  { value: 1, label: 'هیچ واکنشی ندارد', desc: 'حتی با محرک دردناک' },
];

const verbalOptions: Option[] = [
  { value: 5, label: 'جهت‌ گرا و گفتار مناسب', desc: 'دانسته سال، ماه، محل و شخص' },
  { value: 4, label: 'گیج و نامفهوم', desc: 'می‌تواند صحبت کند اما گیج است' },
  { value: 3, label: 'کلمات و عبارات نامفهوم', desc: 'فحاش و فریاد بدون ارتباط' },
  { value: 2, label: 'فقط صدای ناله و غرغر', desc: 'صداهای قابل درک نیست' },
  { value: 1, label: 'هیچ واکنش گفتاری ندارد', desc: 'حتی با درد' },
];

const motorOptions: Option[] = [
  { value: 6, label: 'از دستور پیروی می‌کند', desc: 'به دستوراتی مثل دست بده عمل می‌کند' },
  { value: 5, label: 'هدفمند به سمت درد حرکت می‌کند', desc: 'دست به سمت محرک درد می‌رود' },
  { value: 4, label: 'کنش کششی (Flexion)', desc: 'انعطاف‌پذیری معمولی به سمت درد' },
  { value: 3, label: 'کنش غیرعادی خمیده (Decorticate)', desc: 'بازوها به داخل خم می‌شوند' },
  { value: 2, label: 'کنش غیرعادی باز شده (Decerebrate)', desc: 'بازوها به سمت بیرون و خلف' },
  { value: 1, label: 'هیچ واکنش حرکتی ندارد', desc: 'فلکس در تمام اندام‌ها' },
];

export default function GcsCalculatorTool() {
  const [eye, setEye] = useState<number | ''>('');
  const [verbal, setVerbal] = useState<number | ''>('');
  const [motor, setMotor] = useState<number | ''>('');

  const result = useMemo(() => {
    if (eye === '' || verbal === '' || motor === '') return null;
    const total = Number(eye) + Number(verbal) + Number(motor);
    let severity = '';
    let color = '';
    let bg = '';
    let border = '';
    let desc = '';
    let actions: string[] = [];
    if (total >= 13 && total <= 15) {
      severity = 'آسیب خفیف (GCS خفیف)';
      color = 'text-emerald-700';
      bg = 'bg-emerald-50';
      border = 'border-emerald-200';
      desc = 'بیمار هوشیار یا با اختلال خفیف. اکثر موارد پیش‌آگهی خوبی دارند.';
      actions = ['نگهبانی و مانیتورینگ علائم حیاتی', 'معاینه عصبی منظم', 'CT اسکن مغز در صورت نیاز', 'آموزش علامت‌های هشداردهنده به خانواده'];
    } else if (total >= 9 && total <= 12) {
      severity = 'آسیب متوسط (GCS متوسط)';
      color = 'text-amber-700';
      bg = 'bg-amber-50';
      border = 'border-amber-200';
      desc = 'نیازمند بستری در بخش اورژانس و نگاهی دقیق‌تر. احتمال نیاز به مداخله جراحی وجود دارد.';
      actions = ['انتقال سریع به مرکز درجه یک', 'منی‌تورینگ مداوم', 'کنترل ICP در صورت نیاز', 'مشورت با جراح مغز و اعصاب'];
    } else if (total >= 3 && total <= 8) {
      severity = 'آسیب شدید (GCS شدید) - اورژانس';
      color = 'text-rose-700';
      bg = 'bg-rose-50';
      border = 'border-rose-200';
      desc = 'بیمار در کما قرار دارد. این وضعیت نجات‌بخش است و نیاز به اقدامات فوری دارد.';
      actions = ['ارتقای سریع ABC راه هوایی، تنفس، گردش خون', 'ثبت ستون فقرات گردنی', 'انتقال فوری به ICU', 'تماس با جراح مغز و اعصاب'];
    }
    return { total, severity, color, bg, border, desc, actions };
  }, [eye, verbal, motor]);

  function SelectBox({ value, onChange, options, title, icon }: {
    value: number | ''; onChange: (v: number | '') => void; options: Option[]; title: string; icon: string;
  }) {
    return (
      <div>
        <label className="flex items-center gap-2 text-sm font-black text-gray-800 mb-3">
          <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 text-white flex items-center justify-center text-lg">{icon}</span>
          {title}
        </label>
        <div className="space-y-2">
          {options.map(opt => (
            <label
              key={opt.value}
              className={`flex items-start gap-3 p-3.5 rounded-2xl border-2 transition cursor-pointer ${
                value === opt.value
                  ? 'bg-blue-50 border-blue-500 shadow-sm ring-4 ring-blue-500/10'
                  : 'bg-gray-50 border-gray-100 hover:bg-white hover:border-gray-200'
              }`}
            >
              <input
                type="radio"
                checked={value === opt.value}
                onChange={() => onChange(opt.value)}
                className="mt-1.5 w-4 h-4 text-blue-600"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-white border border-gray-200 font-black text-sm">
                    {opt.value}
                  </span>
                  <span className="font-bold text-gray-900">{opt.label}</span>
                </div>
                {opt.desc && (
                  <p className="mt-1.5 text-xs text-gray-500 leading-relaxed">{opt.desc}</p>
                )}
              </div>
            </label>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-7">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-purple-500/20">
          <Brain size={28} />
        </div>
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900">محاسبه GCS (امتیاز کما گلاسکو)</h2>
          <p className="text-sm text-gray-500 mt-1">ارزیابی سطح هوشیاری بر اساس سه پارامتر چشم، گفتاری و حرکتی</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <SelectBox value={eye} onChange={setEye} options={eyeOptions} title="واکنش باز کردن چشم (E)" icon="E" />
        <SelectBox value={verbal} onChange={setVerbal} options={verbalOptions} title="واکنش گفتاری (V)" icon="V" />
        <SelectBox value={motor} onChange={setMotor} options={motorOptions} title="واکنش حرکتی (M)" icon="M" />
      </div>

      {result && (
        <div className={`rounded-3xl p-7 sm:p-8 border-2 ${result.bg} ${result.border} relative overflow-hidden`}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-center mb-6">
            <div className="lg:col-span-5 text-center lg:text-start">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white shadow-sm border mb-4">
                <Sparkles size={14} className="text-yellow-500" />
                <span className={`text-xs font-black ${result.color}`}>جمع نهایی GCS</span>
              </div>
              <div className={`text-8xl sm:text-9xl font-black ${result.color} leading-none mb-2`}>
                {result.total}
              </div>
              <div className={`text-lg font-black ${result.color} mb-2`}>/ ۱۵ (E:{eye} + V:{verbal} + M:{motor})</div>
              <div className={`text-base sm:text-lg font-bold ${result.color}`}>
                {result.severity}
              </div>
            </div>
            <div className="lg:col-span-7">
              <p className="text-base sm:text-lg leading-loose text-gray-800 font-medium mb-4">
                {result.desc}
              </p>
              <div className="grid grid-cols-4 gap-3">
                {[
                  { n: 3, t: 'کما', c: 'bg-red-500/80' },
                  { n: 8, t: 'شدید', c: 'bg-rose-500' },
                  { n: 12, t: 'متوسط', c: 'bg-amber-500' },
                  { n: 15, t: 'خفیف', c: 'bg-emerald-500' },
                ].map(item => (
                  <div key={item.n} className="rounded-2xl bg-white/60 border border-white p-3 text-center">
                    <div className={`w-full h-2.5 rounded-full mb-2 ${item.c}`} />
                    <div className="text-sm font-black text-gray-900">{item.n}</div>
                    <div className="text-[10px] font-bold text-gray-500">{item.t}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {result.total <= 12 && (
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-50 border-2 border-red-200 mb-5">
              <AlertTriangle size={22} className="text-red-600 shrink-0 mt-0.5 animate-pulse" />
              <div>
                <div className="font-black text-red-800 mb-1">وضعیت اورژانسی - اقدام فوری</div>
                <p className="text-sm text-red-900/90 leading-relaxed">
                  بیمار نیازمند مراقبت‌های فوری اورژانسی است. لطفاً ضمن ثبت ABC، سریعاً با مرکز اورژانس (۱۱۵) تماس بگیرید و بیمار را به بیمارستانی مجهز به جراحی مغز و اعصاب منتقل کنید.
                </p>
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center">
                <CheckCircle2 size={20} className="text-slate-800" />
              </div>
              <h4 className="font-black text-xl text-gray-900">اقدامات پیشنهادی بر اساس امتیاز</h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {result.actions.map((action, i) => (
                <div key={i} className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-white/70 border border-white">
                  <span className="w-6 h-6 shrink-0 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center font-black text-xs mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-sm text-gray-800 leading-relaxed font-medium">{action}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
