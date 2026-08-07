'use client';

import { useState, useMemo } from 'react';
import { Scale, Sparkles, AlertTriangle, CheckCircle2, TrendingUp, Heart, Activity, Shield, Info } from 'lucide-react';

export default function BmiCalculatorTool() {
  const [height, setHeight] = useState<number | ''>('');
  const [weight, setWeight] = useState<number | ''>('');
  const [age, setAge] = useState<number | ''>('');
  const [gender, setGender] = useState<'male' | 'female' | 'elderly'>('elderly');

  const result = useMemo(() => {
    const h = Number(height);
    const w = Number(weight);
    if (!h || !w || h < 50 || h > 250 || w < 10 || w > 400) return null;
    const bmi = w / Math.pow(h / 100, 2);
    let category = '';
    let color = '';
    let bg = '';
    let border = '';
    let description = '';
    let recommendations: string[] = [];
    let risks: string[] = [];
    const isElderly = gender === 'elderly' || (Number(age) >= 60 && Number(age) !== 0);

    if (bmi < 18.5) {
      category = isElderly ? 'کمبود وزن (نیاز به مراقبت ویژه)' : 'کمبود وزن';
      color = 'text-amber-700';
      bg = 'bg-amber-50';
      border = 'border-amber-200';
      description = isElderly
        ? 'در سالمندان، BMI پایین‌تر از ۲۲ نشانه‌ای از سوءتغذیه، کاهش توده عضلانی یا بیماری زمینه‌ای است و نیازمند بررسی فوری است.'
        : 'وزن شما کمتر از محدوده نرمال است. این وضعیت می‌تواند منجر به ضعف سیستم ایمنی شود.';
      recommendations = [
        'افزایش مصرف پروتئین (مرغ، ماهی، تخم‌مرغ، حبوبات و شیر)',
        'مصرف وعده‌های کوچک اما مکرر در طول روز',
        'استفاده از نوشیدنی‌های پرکالری و پرپروتئین بین وعده‌ها',
        'مشورت با پزشک برای بررسی علت کاهش وزن',
      ];
      risks = ['ضعف سیستم ایمنی', 'پوکی استخوان و شکستگی', 'کاهش توده عضلانی', 'بهبود دیرتر زخم‌ها'];
    } else if (bmi < (isElderly ? 22 : 25)) {
      category = isElderly ? 'وزن مطلوب و ایده‌آل (۲۲ تا ۲۷ برای سالمندان)' : 'وزن نرمال و ایده‌آل';
      color = 'text-emerald-700';
      bg = 'bg-emerald-50';
      border = 'border-emerald-200';
      description = isElderly
        ? 'تبریک! وزن شما در محدوده مطلوب برای سالمندی قرار دارد. ادامه همین سبک زندگی را حفظ کنید.'
        : 'تبریک! وزن شما در محدوده نرمال و سالمی قرار دارد.';
      recommendations = [
        'حفظ رژیم غذایی متعادل و سالم',
        'ادامه ورزش منظم (پیاده‌روی روزانه حداقل ۳۰ دقیقه)',
        'بررسی دوره‌ای شاخص‌های خون (قند، چربی، فشار خون)',
      ];
      risks = ['ریسک پایین بیماری‌های مزمن', 'کیفیت زندگی بالاتر', 'طول عمر بیشتر'];
    } else if (bmi < 30) {
      category = isElderly ? 'اضافه وزن خفیف (قابل قبول در سالمندی با پایش)' : 'اضافه وزن';
      color = 'text-orange-700';
      bg = 'bg-orange-50';
      border = 'border-orange-200';
      description = isElderly
        ? 'در سالمندان، اندکی اضافه وزن (BMI تا ۲۷) می‌تواند محافظ باشد؛ اما با پزشک برای کنترل فشار خون و قند مشورت کنید.'
        : 'وزن شما کمی بالاتر از محدوده نرمال است. با تغییرات ساده در سبک زندگی می‌توانید به ایده‌آل برسید.';
      recommendations = [
        'کاهش تدریجی مصرف کربوهیدرات‌های تصفیه شده (نان سفید، شکر، پاستا)',
        'افزایش سبزیجات و پروتئین در وعده‌های غذایی',
        'پیاده‌روی روزانه حداقل ۴۵ دقیقه',
        'اندازه‌گیری منظم قند خون ناشتا و کلسترول',
      ];
      risks = ['افزایش ریسک دیابت نوع ۲', 'فشار خون بالا', 'مشکلات مفصلی'];
    } else if (bmi < 35) {
      category = 'چاقی درجه ۱';
      color = 'text-rose-700';
      bg = 'bg-rose-50';
      border = 'border-rose-200';
      description = 'شما در محدوده چاقی درجه ۱ قرار دارید. این وضعیت می‌تواند ریسک بیماری‌های قلبی و دیابت را افزایش دهد.';
      recommendations = [
        'مشورت با پزشک و یا متخصص تغذیه',
        'برنامه کاهش وزن تدریجی و اصولی (۰.۵ تا ۱ کیلوگرم در هفته)',
        'ورزش منظم هوازی و مقاومتی',
        'کنترل منظم فشار خون و قند خون',
      ];
      risks = ['دیابت نوع ۲', 'بیماری‌های قلبی و عروقی', 'آپنه خواب', 'مشکلات کبدی'];
    } else if (bmi < 40) {
      category = 'چاقی درجه ۲';
      color = 'text-red-700';
      bg = 'bg-red-50';
      border = 'border-red-200';
      description = 'شما در محدوده چاقی درجه ۲ قرار دارید. جدی‌گیری این موضوع برای پیشگیری از عوارض حیاتی است.';
      recommendations = [
        'مراجعه فوری به پزشک متخصص داخلی یا تغذیه',
        'برنامه کاهش وزن تحت نظر متخصص',
        'بررسی قلبی و آزمایشات کامل خون',
      ];
      risks = ['حمله قلبی', 'سکته مغزی', 'دیابت پیشرفته', 'سرطان‌های مرتبط با چاقی'];
    } else {
      category = 'چاقی درجه ۳ (چاقی مفرط)';
      color = 'text-red-800';
      bg = 'bg-red-100';
      border = 'border-red-300';
      description = 'شما در محدوده چاقی مفرط قرار دارید. این وضعیت پزشکی یک اورژانس سلامت محسوب می‌شود.';
      recommendations = [
        'مراجعه فوری به پزشک و شروع درمان حرفه‌ای',
        'معاینات کامل قلبی، عروقی و متابولیک',
        'در نظر گرفتن جراحی کاهش وزن در صورت تأیید پزشک',
      ];
      risks = ['مرگ و میر زودرس', 'نارسایی قلبی', 'نارسایی کلیه', 'سکته مغزی'];
    }

    return {
      bmi: Math.round(bmi * 10) / 10,
      positionPct: Math.min(100, Math.max(0, (bmi / 45) * 100)),
      category,
      color,
      bg,
      border,
      description,
      recommendations,
      risks,
      idealMin: isElderly ? 22 : 18.5,
      idealMax: isElderly ? 27 : 24.9,
    };
  }, [height, weight, age, gender]);

  return (
    <div>
      <div className="flex items-center gap-3 mb-7">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <Scale size={28} />
        </div>
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900">محاسبه شاخص توده بدنی (BMI)</h2>
          <p className="text-sm text-gray-500 mt-1">محاسبه BMI مخصوص سالمندان با تفسیر اختصاصی</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 mb-8">
        <div className="md:col-span-4">
          <label className="block text-sm font-bold text-gray-700 mb-2">قد شما (سانتی‌متر)</label>
          <div className="relative">
            <span className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-400 font-bold text-sm">سانتی‌متر</span>
            <input
              type="number"
              placeholder="مثلاً ۱۶۵"
              value={height}
              onChange={e => setHeight(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full h-14 pr-24 pl-4 rounded-2xl bg-gray-50 border-2 border-gray-100 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition text-lg font-bold"
              min={50}
              max={250}
            />
          </div>
        </div>
        <div className="md:col-span-4">
          <label className="block text-sm font-bold text-gray-700 mb-2">وزن شما (کیلوگرم)</label>
          <div className="relative">
            <span className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-400 font-bold text-sm">کیلوگرم</span>
            <input
              type="number"
              placeholder="مثلاً ۷۰"
              value={weight}
              onChange={e => setWeight(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full h-14 pr-24 pl-4 rounded-2xl bg-gray-50 border-2 border-gray-100 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition text-lg font-bold"
              min={10}
              max={400}
            />
          </div>
        </div>
        <div className="md:col-span-4">
          <label className="block text-sm font-bold text-gray-700 mb-2">سن و جمعیت</label>
          <select
            value={gender}
            onChange={e => setGender(e.target.value as 'male' | 'female' | 'elderly')}
            className="w-full h-14 px-4 rounded-2xl bg-gray-50 border-2 border-gray-100 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition text-lg font-bold appearance-none"
          >
            <option value="elderly">سالمند (بالای ۶۰ سال) - توصیه شده</option>
            <option value="female">زن بزرگسال (زیر ۶۰)</option>
            <option value="male">مرد بزرگسال (زیر ۶۰)</option>
          </select>
        </div>
      </div>

      {!result && (
        <div className="rounded-3xl bg-gradient-to-br from-blue-50 via-white to-emerald-50 p-6 sm:p-8 border border-blue-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <Info size={22} />
            </div>
            <h4 className="font-black text-xl text-gray-900">نحوه تفسیر BMI برای سالمندی متفاوت است</h4>
          </div>
          <p className="text-gray-700 leading-loose">
            بر اساس مطالعات علمی، <strong className="text-emerald-700">محدوده ایده‌آل BMI برای افراد بالای ۶۰ سال، ۲۲ تا ۲۷</strong> است؛ نه ۱۸.۵ تا ۲۵. دلیل این امر آن است که اندکی ذخیره چربی در سالمندی می‌تواند در برابر بیماری حاد و از دست دادن سریع وزن محافظ ایجاد کند.
          </p>
        </div>
      )}

      {result && (
        <>
          <div className={`rounded-3xl p-7 sm:p-8 border-2 ${result.bg} ${result.border} mb-6 relative overflow-hidden`}>
            <div className="absolute -top-16 -left-16 w-52 h-52 bg-white/50 rounded-full blur-3xl" />
            <div className="absolute -bottom-16 -right-16 w-52 h-52 bg-white/40 rounded-full blur-3xl" />
            <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-7 items-center">
              <div className="lg:col-span-5 text-center lg:text-start">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white shadow-sm border mb-4">
                  <Sparkles size={14} className="text-yellow-500" />
                  <span className={`text-xs font-black ${result.color}`}>نتیجه محاسبه</span>
                </div>
                <div className={`text-8xl sm:text-9xl font-black ${result.color} leading-none mb-2 tracking-tight`}>
                  {result.bmi}
                </div>
                <div className={`inline-block text-lg font-black ${result.color} mb-2`}>
                  {result.category}
                </div>
                <div className="text-sm text-gray-600 font-bold">
                  محدوده ایده‌آل شما: <span className="text-emerald-700">{result.idealMin}</span> تا <span className="text-emerald-700">{result.idealMax}</span>
                </div>
              </div>
              <div className="lg:col-span-7 space-y-4">
                <p className={`text-base sm:text-lg leading-loose ${result.color} font-medium`}>
                  {result.description}
                </p>
                <div className="h-4 w-full rounded-full bg-gray-200/60 overflow-hidden relative">
                  <div className="absolute inset-0 flex">
                    <div className="bg-amber-300/70" style={{ width: `${(18.5 / 45) * 100}%` }} />
                    <div className="bg-emerald-400/70" style={{ width: `${((25 - 18.5) / 45) * 100}%` }} />
                    <div className="bg-orange-400/70" style={{ width: `${((30 - 25) / 45) * 100}%` }} />
                    <div className="bg-rose-500/70" style={{ width: `${((35 - 30) / 45) * 100}%` }} />
                    <div className="bg-red-600/70 flex-1" />
                  </div>
                  <div
                    className="absolute -top-1.5 h-7 w-1.5 bg-slate-900 rounded-full shadow-lg transition-all duration-700"
                    style={{ right: `calc(${result.positionPct}% - 3px)` }}
                  >
                    <div className="absolute -top-7 right-1/2 translate-x-1/2 px-2 py-0.5 rounded bg-slate-900 text-white text-xs font-black whitespace-nowrap">
                      شما
                    </div>
                  </div>
                </div>
                <div className="flex justify-between text-[10px] sm:text-xs font-bold text-gray-500 px-1">
                  <span>۱۵</span>
                  <span className="text-amber-700">کمبود</span>
                  <span className="text-emerald-700">نرمال</span>
                  <span className="text-orange-700">اضافه</span>
                  <span className="text-rose-700">چاق ۱</span>
                  <span className="text-red-700">چاق ۲</span>
                  <span>۴۵+</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="rounded-3xl bg-white border border-gray-100 p-6 sm:p-7 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <CheckCircle2 size={22} />
                </div>
                <h4 className="font-black text-xl text-gray-900">توصیه‌های عملی</h4>
              </div>
              <ul className="space-y-2.5">
                {result.recommendations.map((r, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700 leading-relaxed p-3 rounded-2xl bg-emerald-50/40 border border-emerald-100/60">
                    <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center font-black text-[11px] shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl bg-white border border-gray-100 p-6 sm:p-7 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center">
                  <AlertTriangle size={22} />
                </div>
                <h4 className="font-black text-xl text-gray-900">ریسک‌های مرتبط</h4>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {result.risks.map((r, i) => (
                  <div key={i} className="flex items-center gap-2.5 p-3 rounded-2xl bg-rose-50/50 border border-rose-100/70 text-sm text-gray-800 font-medium">
                    {i % 3 === 0 && <Heart size={16} className="text-rose-500 shrink-0" />}
                    {i % 3 === 1 && <Activity size={16} className="text-rose-500 shrink-0" />}
                    {i % 3 === 2 && <Shield size={16} className="text-rose-500 shrink-0" />}
                    <span className="truncate">{r}</span>
                  </div>
                ))}
              </div>
              {(result.bmi >= 30 || result.bmi < 20) && (
                <div className="mt-4 flex items-start gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-200">
                  <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-900 leading-relaxed font-medium">
                    <strong>توصیه مهم:</strong> با توجه به نتیجه محاسبه، <u>توصیه می‌کنیم سریعاً به پزشک متخصص داخلی یا تغذیه مراجعه کنید</u> و به هیچ وجه از رژیم‌های ناشناخته و خودسرانه پرهیز نمایید.
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
