'use client';

import { useState, useMemo } from 'react';
import { ListChecks, CheckCircle2, Circle, Sparkles, Printer, RotateCcw, Clock } from 'lucide-react';

type Item = { id: string; group: string; text: string };

const checklistItems: Item[] = [
  { id: '1', group: 'ویژگی‌های اولیه (صبح)', text: 'بررسی کلی وضعیت بیمار (روحیه، هوشیاری، رنگ پوست)' },
  { id: '2', group: 'ویژگی‌های اولیه (صبح)', text: 'اندازه‌گیری و ثبت علائم حیاتی: فشار خون، نبض، دما، تنفس، اشباع اکسیژن' },
  { id: '3', group: 'ویژگی‌های اولیه (صبح)', text: 'بررسی وزن روزانه (در صورت نیاز پزشک)' },
  { id: '4', group: 'ویژگی‌های اولیه (صبح)', text: 'پرسش از درد، ارزیابی سرعت، محل و شدت درد' },

  { id: '5', group: 'تغذیه و هیدراسیون', text: 'تدارک صبحانه مناسب با رژیم درمانی بیمار' },
  { id: '6', group: 'تغذیه و هیدراسیون', text: 'تشوییع به نوشتن آب مایعات کافی (حداقل ۶ تا ۸ لیوان یا طبق دستور)' },
  { id: '7', group: 'تغذیه و هیدراسیون', text: 'ثبت دقیق مقدار خوراک و نوشیدنی در صورت نیاز' },
  { id: '8', group: 'تغذیه و هیدراسیون', text: 'بررسی تحمل گوارشی و گزارش تهوع، استفراغ یا اسهال' },

  { id: '9', group: 'بهداشت فردی و رفع نیازهای فیزیولوژیک', text: 'دستشویی، دهان‌داری و اصلاح صورت بیمار' },
  { id: '10', group: 'بهداشت فردی و رفع نیازهای فیزیولوژیک', text: 'حمام کامل یا دستشویی با توجه به توانایی بیمار' },
  { id: '11', group: 'بهداشت فردی و رفع نیازهای فیزیولوژیک', text: 'مراقبت از ناخن دست و پا و پیراهن رختکن تمیز' },
  { id: '12', group: 'بهداشت فردی و رفع نیازهای فیزیولوژیک', text: 'کنترل و کمک به دفع ادرار و مدفوع، تمیز کردن ناحیه تناسلی' },

  { id: '13', group: 'داروها', text: 'تجویز دقیق تمام داروهای صبح، ظهر، شب طبق فهرست و زمان مقرر' },
  { id: '14', group: 'داروها', text: 'بررسی دوز، نام دارو و راه تجویز قبل از دادن هر دارو (قاعده ۵ درست)' },
  { id: '15', group: 'داروها', text: 'ثبت عوارض دارویی احتمالی (بثورات، خارش، تهوع)' },
  { id: '16', group: 'داروها', text: 'بررسی موجودی داروها و درخواست داروهای کم‌بوده زودهنگام' },

  { id: '17', group: 'مراقبت از پوست و زخم', text: 'تغییر وضعیت بدن هر ۲ ساعت (برای بیماران تخت بخواب)' },
  { id: '18', group: 'مراقبت از پوست و زخم', text: 'بررسی کامل پوست به‌ویژه نواحی استخوانی برجسته' },
  { id: '19', group: 'مراقبت از پوست و زخم', text: 'تعویض پانسمان طبق برنامه و ثبت وضعیت زخم (اندازه، ترشح، بوی بد)' },
  { id: '20', group: 'مراقبت از پوست و زخم', text: 'بررسی علائم عفونت زخم (قرمزی، گرما، چرک، تب)' },

  { id: '21', group: 'حرکت و فیزیوتراپی', text: 'انجام تمرینات حرکتی فعال یا غیرفعال طبق برنامه پزشک' },
  { id: '22', group: 'حرکت و فیزیوتراپی', text: 'پیاده‌روی با توجه به تحمل بیمار و همراهی ایمن' },
  { id: '23', group: 'حرکت و فیزیوتراپی', text: 'تصحیح حالت قرارگیری بدن در تخت یا صندلی' },
  { id: '24', group: 'حرکت و فیزیوتراپی', text: 'مصرف تجهیزات کمکی (عصا، واکر، ویلچر) ایمن' },

  { id: '25', group: 'مراقبت روانی و اجتماعی', text: 'ارتباط کلامی و غیردارویی گرم با بیمار' },
  { id: '26', group: 'مراقبت روانی و اجتماعی', text: 'آماده‌سازی فعالیت‌های سرگرمی (تلویزیون، کتاب، موسیقی)' },
  { id: '27', group: 'مراقبت روانی و اجتماعی', text: 'تشویق به تماس تلفنی یا آنلاین با خانواده و دوستان' },
  { id: '28', group: 'مراقبت روانی و اجتماعی', text: 'گزارش اضطراب، افسردگی یا تغییر خلقی شدید به پزشک' },

  { id: '29', group: 'ویژگی‌های پایانی شب', text: 'اندازه‌گیری دوباره علائم حیاتی شب در صورت نیاز' },
  { id: '30', group: 'ویژگی‌های پایانی شب', text: 'آماده‌سازی محیط تختخواب آرام و امن' },
  { id: '31', group: 'ویژگی‌های پایانی شب', text: 'ثبت گزارش روزانه پرستاری: علائم، داروها، تغذیه و وضعیت عمومی' },
  { id: '32', group: 'ویژگی‌های پایانی شب', text: 'بررسی نهایی ایمنی محیط و تجهیزات اضطراری (زرنگ، زنگ بیدار، دستگیره حمام)' },
];

export default function DailyCareChecklistTool() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [note, setNote] = useState<string>('');

  const groups = useMemo(() => {
    const groupMap = new Map<string, Item[]>();
    checklistItems.forEach(item => {
      const list = groupMap.get(item.group) || [];
      list.push(item);
      groupMap.set(item.group, list);
    });
    return Array.from(groupMap.entries());
  }, []);

  const total = checklistItems.length;
  const doneCount = Object.values(checked).filter(Boolean).length;
  const progress = total ? Math.round((doneCount / total) * 100) : 0;

  const toggle = (id: string) => setChecked(prev => ({ ...prev, [id]: !prev[id] }));
  const reset = () => { if (confirm('آیا می‌خواهید همه آیتم‌ها را ریست کنید؟')) setChecked({}) };

  return (
    <div>
      <div className="flex items-center gap-3 mb-7">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <ListChecks size={28} />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900">چک لیست مراقبت روزانه از بیمار در منزل</h2>
          <p className="text-sm text-gray-500 mt-1">
            ۳۲ مورد ضروری که پرستار یا خانواده باید هر روز در مورد بیمار چک کند
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-7">
        <div className="md:col-span-5 p-5 rounded-3xl bg-gradient-to-br from-emerald-50 via-white to-teal-50 border-2 border-emerald-100">
          <div className="flex items-end justify-between gap-4 mb-3">
            <div>
              <div className="text-xs font-bold text-gray-500 mb-1">پیشرفت چک لیست امروز</div>
              <div className="flex items-baseline gap-2">
                <div className="text-6xl font-black text-emerald-700 leading-none">{progress}</div>
                <div className="text-2xl font-black text-gray-400">%</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-gray-800">{doneCount} از {total}</div>
              <div className="text-xs text-gray-500">موارد تکمیل شده</div>
            </div>
          </div>
          <div className="h-4 w-full rounded-full bg-white/70 overflow-hidden border border-emerald-100">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 transition-all duration-700 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        <div className="md:col-span-7 grid grid-cols-2 gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 h-14 rounded-2xl bg-white border-2 border-gray-100 text-gray-800 font-bold hover:bg-gray-50 hover:border-gray-200 transition"
          >
            <RotateCcw size={18} /> ریست چک لیست
          </button>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center justify-center gap-2 h-14 rounded-2xl bg-white border-2 border-gray-100 text-gray-800 font-bold hover:bg-gray-50 hover:border-gray-200 transition"
          >
            <Printer size={18} /> پرینت یا ذخیره PDF
          </button>
          <div className="col-span-2 p-4 rounded-2xl bg-gray-50 border border-gray-100">
            <label className="block text-xs font-bold text-gray-600 mb-1.5">یادداشت‌های امروز:</label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="هر مورد خاص یا غیرمعمول را اینجا بنویسید..."
              className="w-full h-20 resize-none rounded-xl bg-white border border-gray-200 p-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition"
            />
          </div>
        </div>
      </div>

      {progress === 100 && (
        <div className="mb-7 p-5 rounded-3xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white shadow-lg shadow-emerald-500/20 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
              <CheckCircle2 size={28} />
            </div>
            <div>
              <div className="font-black text-xl mb-0.5">تبریک! چک لیست مراقبت امروز تکمیل شد</div>
              <div className="text-sm opacity-90">
                <Clock size={14} className="inline align-middle mr-1" />
                {new Intl.DateTimeFormat('fa-IR', { dateStyle: 'full', timeStyle: 'short' }).format(new Date())}
              </div>
            </div>
          </div>
          <Sparkles size={32} className="opacity-90" />
        </div>
      )}

      <div className="space-y-5">
        {groups.map(([groupName, items]) => {
          const groupDone = items.filter(i => checked[i.id]).length;
          const groupProgress = Math.round((groupDone / items.length) * 100);
          return (
            <div
              key={groupName}
              className={`rounded-3xl border-2 transition ${
                groupProgress === 100
                  ? 'bg-gradient-to-br from-emerald-50 via-white to-teal-50 border-emerald-200 shadow-sm'
                  : 'bg-white border-gray-100'
              }`}
            >
              <div className="flex items-center justify-between gap-3 p-5 sm:p-6 border-b border-gray-100">
                <div>
                  <h3 className="font-black text-xl text-gray-900 mb-1">{groupName}</h3>
                  <p className="text-xs text-gray-500">
                    {groupDone} از {items.length} مورد بررسی
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="hidden sm:block w-40 h-2.5 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-700 rounded-full ${
                        groupProgress === 100 ? 'bg-emerald-500' : 'bg-teal-500'
                      }`}
                      style={{ width: `${groupProgress}%` }}
                    />
                  </div>
                  <span
                    className={`inline-flex items-center justify-center w-11 h-11 rounded-2xl font-black ${
                      groupProgress === 100
                        ? 'bg-emerald-500 text-white'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {groupProgress}
                  </span>
                </div>
              </div>
              <ul className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {items.map(item => {
                  const isCheck = !!checked[item.id];
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => toggle(item.id)}
                        className={`w-full text-right flex items-start gap-3 p-3.5 rounded-2xl transition group ${
                          isCheck
                            ? 'bg-emerald-50 border-2 border-emerald-200 hover:bg-emerald-100/60'
                            : 'bg-gray-50 border-2 border-transparent hover:bg-white hover:border-gray-200'
                        }`}
                      >
                        {isCheck ? (
                          <CheckCircle2 size={22} className="text-emerald-600 mt-0.5 shrink-0" />
                        ) : (
                          <Circle size={22} className="text-gray-400 mt-0.5 shrink-0 group-hover:text-teal-500 transition" />
                        )}
                        <span
                          className={`text-sm leading-relaxed text-left flex-1 ${
                            isCheck ? 'line-through text-gray-500 font-medium' : 'text-gray-800 font-medium'
                          }`}
                        >
                          {item.text}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>

      {progress >= 50 && (
        <div className="mt-7 p-5 rounded-3xl bg-teal-50 border-2 border-teal-200 flex flex-wrap items-center gap-4 justify-between">
          <div className="flex items-start gap-3">
            <CheckCircle2 size={24} className="text-teal-600 mt-0.5 shrink-0" />
            <div>
              <div className="font-black text-lg text-teal-900 mb-1">
                آیا گزارش پرستاری امروز را ثبت کرده‌اید؟
              </div>
              <p className="text-sm text-teal-800 leading-relaxed">
                در صورت مشاهده هرگونه تغییر غیرمعمول در علائم حیاتی، رفتار یا وضعیت پوست بیمار،
                فوراً پزشک معالج یا تیم پرستاری سالمندیار را مطلع کنید.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
