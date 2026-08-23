'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Heart, Activity, Droplets, Thermometer, Wind, Clock, Plus, Check, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const vitalsSchema = z.object({
  heartRate: z.coerce.number().min(40, 'حداقل ۴۰').max(220, 'حداکثر ۲۲۰'),
  systolic: z.coerce.number().min(70, 'حداقل ۷۰').max(250, 'حداکثر ۲۵۰'),
  diastolic: z.coerce.number().min(40, 'حداقل ۴۰').max(150, 'حداکثر ۱۵۰'),
  spo2: z.coerce.number().min(50, 'حداقل ۵۰').max(100, 'حداکثر ۱۰۰'),
  temperature: z.coerce.number().min(34, 'حداقل ۳۴').max(42, 'حداکثر ۴۲'),
  respiratoryRate: z.coerce.number().min(6, 'حداقل ۶').max(60, 'حداکثر ۶۰'),
  bloodSugar: z.coerce.number().min(30, 'حداقل ۳۰').max(800, 'حداکثر ۸۰۰').optional(),
  note: z.string().max(140, 'حداکثر ۱۴۰ کاراکتر').optional(),
});

type VitalsForm = z.infer<typeof vitalsSchema>;

export function DemoVitalsForm({ onSubmitted }: { onSubmitted?: () => void }) {
  const [submitted, setSubmitted] = useState(false);
  const [lastValues, setLastValues] = useState<VitalsForm | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<VitalsForm>({
    resolver: zodResolver(vitalsSchema) as any,
    defaultValues: {
      heartRate: 78, systolic: 118, diastolic: 76, spo2: 97, temperature: 36.7, respiratoryRate: 16, bloodSugar: 124,
    },
  });

  const onSubmit = async (data: VitalsForm) => {
    await new Promise(r => setTimeout(r, 600));
    setLastValues(data);
    setSubmitted(true);
    onSubmitted?.();
    setTimeout(() => {
      setSubmitted(false);
      reset();
    }, 3500);
  };

  const Field = ({
    label, unit, icon: Icon, field, type, min, max, normalMin, normalMax, colorClass,
  }: {
    label: string; unit: string; icon: any; field: keyof VitalsForm; type?: string; min?: number; max?: number;
    normalMin?: number; normalMax?: number; colorClass: string;
  }) => {
    const val = register(field);
    const err = (errors as any)[field];
    return (
      <div className="space-y-1.5">
        <label className="flex items-center justify-between px-0.5">
          <span className="flex items-center gap-1.5 text-[11px] font-black text-slate-600 dark:text-slate-300">
            <Icon className={cn('w-3.5 h-3.5', colorClass)} />
            {label}
          </span>
          {normalMin !== undefined && normalMax !== undefined && (
            <span className="text-[9px] font-bold text-slate-400">محدوده طبیعی: {normalMin}-{normalMax} {unit}</span>
          )}
        </label>
        <div className="relative">
          <input
            type={type || 'number'}
            step={type === 'number' ? 0.1 : undefined}
            min={min} max={max}
            {...val}
            className="w-full text-left pl-14 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm font-black text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 outline-none transition-all"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400">{unit}</span>
        </div>
        {err && <p className="text-[10px] font-bold text-rose-500 px-0.5">{err.message}</p>}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/20 dark:to-slate-800 border border-blue-100 dark:border-blue-800">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
          <div className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
            در این بخش می‌توانید فرم ثبت علائم حیاتی را تجربه کنید. داده‌های شما فقط برای نمایش فرآیند در حالت آزمایشی است و ذخیره نمی‌شود.
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!submitted ? (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <Field label="ضربان قلب" unit="BPM" icon={Heart} field="heartRate" min={40} max={220} normalMin={60} normalMax={100} colorClass="text-rose-500" />
              <Field label="فشار سیستولیک" unit="mmHg" icon={Activity} field="systolic" min={70} max={250} normalMin={90} normalMax={140} colorClass="text-blue-500" />
              <Field label="فشار دیاستولیک" unit="mmHg" icon={Activity} field="diastolic" min={40} max={150} normalMin={60} normalMax={90} colorClass="text-blue-500" />
              <Field label="اکسیژن خون" unit="%" icon={Droplets} field="spo2" min={50} max={100} normalMin={95} normalMax={100} colorClass="text-teal-500" />
              <Field label="دمای بدن" unit="°C" icon={Thermometer} field="temperature" type="number" min={34} max={42} normalMin={36} normalMax={37.5} colorClass="text-amber-500" />
              <Field label="نفس بر دقیقه" unit="RR" icon={Wind} field="respiratoryRate" min={6} max={60} normalMin={12} normalMax={20} colorClass="text-emerald-500" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="قند خون (اختیاری)" unit="mg/dL" icon={Clock} field="bloodSugar" min={30} max={800} normalMin={80} normalMax={140} colorClass="text-violet-500" />
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 px-0.5 text-[11px] font-black text-slate-600 dark:text-slate-300">
                  یادداشت پرستار (اختیاری)
                </label>
                <input
                  type="text"
                  maxLength={140}
                  placeholder="مثال: بیمار پس از صبحانه کمی راحت‌تر است..."
                  {...register('note')}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm font-medium text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 outline-none transition-all"
                />
              </div>
            </div>

            <Button
              size="lg"
              type="submit"
              disabled={isSubmitting}
              className="w-full justify-center gap-2 rounded-2xl py-3 text-sm font-black shadow-lg shadow-teal-600/20"
            >
              {isSubmitting ? (
                <div className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  ثبت علائم حیاتی در پرونده آزمایشی
                </>
              )}
            </Button>
          </motion.form>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="rounded-3xl border-2 border-emerald-200 dark:border-emerald-700 bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-emerald-900/30 dark:via-slate-800 dark:to-teal-900/20 p-6 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 220, delay: 0.1 }}
              className="w-14 h-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30 mb-3"
            >
              <Check className="w-7 h-7" />
            </motion.div>
            <h4 className="text-lg font-black text-slate-800 dark:text-slate-100 mb-1">ثبت شد!</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              علائم حیاتی در پرونده آزمایشی ثبت گردید.
            </p>
            {lastValues && (
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-[10px] font-black text-slate-600 dark:text-slate-300">
                {[
                  ['HR', `${lastValues.heartRate}`, 'text-rose-500'],
                  ['BP', `${lastValues.systolic}/${lastValues.diastolic}`, 'text-blue-500'],
                  ['SpO₂', `${lastValues.spo2}%`, 'text-teal-500'],
                  ['Temp', `${lastValues.temperature}°C`, 'text-amber-500'],
                  ['RR', `${lastValues.respiratoryRate}`, 'text-emerald-500'],
                  ['BS', lastValues.bloodSugar ? `${lastValues.bloodSugar}` : '—', 'text-violet-500'],
                ].map(([k, v, c]) => (
                  <div key={k} className="bg-white dark:bg-slate-800/70 rounded-xl p-2 border border-white dark:border-slate-700">
                    <div className="text-[9px] text-slate-400 mb-0.5">{k}</div>
                    <div className={cn(c)}>{v}</div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface AlertCheckProps {
  onSubmitted?: () => void;
}

export function DemoMedicationAlertCheck({ onSubmitted }: AlertCheckProps) {
  const [med, setMed] = useState('آسپیرین ۸۰');
  const [dose, setDose] = useState('۱ عدد');
  const [allergy, setAllergy] = useState(false);
  const [warfarin, setWarfarin] = useState(true);
  const [nsaids, setNsaids] = useState(false);
  const [checked, setChecked] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const handleCheck = async () => {
    setIsChecking(true);
    await new Promise(r => setTimeout(r, 900));
    setIsChecking(false);
    setChecked(true);
    onSubmitted?.();
  };

  const alertsCount = (warfarin ? 1 : 0) + (allergy ? 1 : 0) + (nsaids ? 1 : 0);

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-white dark:from-amber-900/20 dark:to-slate-800 border border-amber-100 dark:border-amber-800">
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
          <div className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
            سیستم هشدار دارویی سالمندیار قبل از ثبت هر دارو، تداخل‌ها، حساسیت‌ها و موارد منع مصرف را به‌صورت هوشمند بررسی می‌کند.
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-[11px] font-black text-slate-600 dark:text-slate-300 px-0.5">نام دارو</label>
          <input
            type="text"
            value={med}
            onChange={e => setMed(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm font-black text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 outline-none"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[11px] font-black text-slate-600 dark:text-slate-300 px-0.5">مقدار</label>
          <input
            type="text"
            value={dose}
            onChange={e => setDose(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm font-black text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 outline-none"
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-[11px] font-black text-slate-600 dark:text-slate-300 px-0.5">تاریخچه بیمار (برای شبیه‌سازی)</div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {[
            { key: 'allergy', label: 'حساسیت به NSAIDs', state: allergy, setter: setAllergy, cls: 'rose' },
            { key: 'warfarin', label: 'استفاده از وارفارین', state: warfarin, setter: setWarfarin, cls: 'amber' },
            { key: 'nsaids', label: 'زخم معده فعال', state: nsaids, setter: setNsaids, cls: 'violet' },
          ].map(item => (
            <button
              key={item.key}
              type="button"
              onClick={() => item.setter(!item.state)}
              className={cn(
                'text-[11px] font-bold px-3 py-2 rounded-xl border-2 transition-all text-right',
                item.state
                  ? item.cls === 'rose' ? 'bg-rose-50 dark:bg-rose-900/20 border-rose-400 dark:border-rose-700 text-rose-700 dark:text-rose-300'
                    : item.cls === 'amber' ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-400 dark:border-amber-700 text-amber-700 dark:text-amber-300'
                    : 'bg-violet-50 dark:bg-violet-900/20 border-violet-400 dark:border-violet-700 text-violet-700 dark:text-violet-300'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300'
              )}
            >
              {item.state ? '✓ ' : ''}{item.label}
            </button>
          ))}
        </div>
      </div>

      <Button
        size="lg"
        onClick={handleCheck}
        disabled={isChecking}
        variant={checked ? 'outline' : 'primary'}
        className="w-full justify-center gap-2 rounded-2xl py-3 text-sm font-black shadow-lg"
      >
        {isChecking ? (
          <div className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
        ) : (
          <>
            <AlertTriangle className="w-5 h-5" />
            {checked ? 'بررسی مجدد هشدارها' : 'بررسی تداخل و هشدارها'}
          </>
        )}
      </Button>

      <AnimatePresence>
        {checked && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -8 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2 overflow-hidden"
          >
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2 text-xs font-black text-slate-700 dark:text-slate-200">
                <Badge variant="default" className="text-[10px]">{alertsCount} هشدار</Badge>
                نتیجه بررسی برای <span className="text-teal-600">{med}</span> {dose}
              </div>
              <Badge variant={alertsCount === 0 ? 'default' : 'secondary'} className={cn(
                alertsCount === 0 ? 'bg-emerald-500' : 'bg-amber-500',
                'text-[10px] text-white'
              )}>
                {alertsCount === 0 ? 'امن ✅' : alertsCount === 1 ? 'احتیاط ⚠️' : 'خطر ⛔'}
              </Badge>
            </div>

            {warfarin && (
              <div className="flex items-start gap-2 p-3 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-black text-amber-800 dark:text-amber-300 mb-1 flex items-center gap-1">
                    تداخل دارویی جدی — وارفارین + آسپیرین
                  </div>
                  <p className="text-[11px] text-amber-700 dark:text-amber-400 leading-relaxed">
                    مصرف همزمان این دو دارو خطر خونریزی را به‌طور چشمگیری افزایش می‌دهد. هم‌تجویز فقط با نظر پزشک معالج و کنترل INR توصیه می‌شود.
                  </p>
                </div>
              </div>
            )}
            {allergy && (
              <div className="flex items-start gap-2 p-3 rounded-2xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800">
                <AlertTriangle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-black text-rose-800 dark:text-rose-300 mb-1">حساسیت شناسایی‌شده به NSAIDs</div>
                  <p className="text-[11px] text-rose-700 dark:text-rose-400 leading-relaxed">
                    در تاریخچه بیمار حساسیت به داروهای ضدالتهابی غیراستروئیدی ثبت شده است. آسپیرین در این گروه قرار دارد.
                  </p>
                </div>
              </div>
            )}
            {nsaids && (
              <div className="flex items-start gap-2 p-3 rounded-2xl bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800">
                <AlertTriangle className="w-4 h-4 text-violet-600 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-black text-violet-800 dark:text-violet-300 mb-1">مورد منع مصرف نسبی</div>
                  <p className="text-[11px] text-violet-700 dark:text-violet-400 leading-relaxed">
                    وجود زخم معده فعال، استفاده از آسپیرین را با خطر بالاتری همراه می‌کند. توصیه می‌شود پروتکتور معده تجویز شود.
                  </p>
                </div>
              </div>
            )}
            {alertsCount === 0 && (
              <div className="flex items-center gap-2 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                <Check className="w-4 h-4" />
                تداخل یا هشداری شناسایی نشد. دارو را می‌توان ثبت کرد.
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
