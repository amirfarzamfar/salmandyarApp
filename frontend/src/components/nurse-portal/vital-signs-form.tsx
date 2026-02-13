"use client";

import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { vitalSignSchema, VitalSignFormData, getVitalWarnings } from "../patients/VitalSignFormSchema";
import { PortalCard } from "@/components/portal/ui/portal-card";
import { PortalButton } from "@/components/portal/ui/portal-button";
import { Activity, Heart, Thermometer, Droplet, Save, X, Loader2, AlertTriangle, Clock } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { nursePortalService } from "@/services/nurse-portal.service";
import { toast } from "react-hot-toast";
import Swal from 'sweetalert2';
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import TimePicker from "react-multi-date-picker/plugins/time_picker";
import { cn } from "@/lib/utils";

interface Props {
  patientId: number;
  expectedTime?: Date;
  onSuccess: () => void;
  onCancel: () => void;
}

export function NurseVitalSignsForm({ patientId, expectedTime, onSuccess, onCancel }: Props) {
  const [warnings, setWarnings] = useState<string[]>([]);
  const { register, handleSubmit, watch, setValue, control, formState: { errors, isSubmitting } } = useForm<VitalSignFormData>({
    resolver: zodResolver(vitalSignSchema),
    defaultValues: {
      measuredAt: new Date().toISOString(),
      oxygenSaturation: 98,
      bodyTemperature: 37,
      glasgowComaScale: 15,
      respiratoryRate: 16,
      pulseRate: 72,
      systolicBloodPressure: 120,
      diastolicBloodPressure: 80
    }
  });

  const watchedValues = watch();

  useEffect(() => {
    const newWarnings = getVitalWarnings(watchedValues);
    
    // Check schedule deviation
    if (expectedTime && watchedValues.measuredAt) {
        const measured = new Date(watchedValues.measuredAt).getTime();
        const expected = expectedTime.getTime();
        const diffMinutes = (measured - expected) / (1000 * 60);
        
        if (Math.abs(diffMinutes) > 30) {
            const direction = diffMinutes > 0 ? 'تاخیر' : 'زودتر از موعد';
            newWarnings.push(`زمان ثبت با برنامه (${direction} ${Math.abs(Math.round(diffMinutes))} دقیقه) مغایرت دارد.`);
        }
    }

    setWarnings(newWarnings);
  }, [watchedValues, expectedTime]);

  const onSubmit = async (data: VitalSignFormData) => {
    if (warnings.length > 0) {
      const result = await Swal.fire({
        title: 'هشدار بالینی',
        text: 'برخی مقادیر خارج از رنج نرمال هستند. آیا اطمینان دارید؟',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'بله، ثبت کن',
        cancelButtonText: 'بازبینی',
        confirmButtonColor: '#f59e0b',
        customClass: {
          popup: 'rounded-[2rem]',
          confirmButton: 'rounded-xl',
          cancelButton: 'rounded-xl'
        }
      });
      if (!result.isConfirmed) return;
    }

    try {
      await nursePortalService.addVitalSign(patientId, {
        ...data,
        measuredAt: new Date(data.measuredAt).toISOString(),
        careRecipientId: patientId
      });
      
      toast.success("علائم حیاتی با موفقیت ثبت شد");
      onSuccess();
    } catch (error) {
      console.error(error);
      toast.error("خطا در ثبت اطلاعات");
    }
  };

  return (
    <PortalCard className="bg-white dark:bg-gray-800 border-none shadow-soft-xl relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-medical-400 to-medical-600" />
      
      <div className="flex justify-between items-center mb-6 pt-2">
        <div>
          <h3 className="text-lg font-black text-gray-800 dark:text-gray-100">ثبت علائم حیاتی</h3>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">مقادیر دقیق دستگاه را وارد کنید</p>
        </div>
        <button onClick={onCancel} className="w-8 h-8 rounded-full bg-gray-50 dark:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Time Picker */}
        <div className="bg-gray-50 dark:bg-gray-900/30 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
           <label className="flex items-center gap-2 text-xs font-bold text-gray-500 mb-2">
             <Clock size={14} />
             زمان اندازه‌گیری
           </label>
           <Controller
            control={control}
            name="measuredAt"
            render={({ field: { onChange, value } }) => (
              <DatePicker
                value={value ? new Date(value) : new Date()}
                onChange={(date: any) => {
                  if (date && date.isValid) {
                    onChange(date.toDate().toISOString());
                  }
                }}
                calendar={persian}
                locale={persian_fa}
                format="YYYY/MM/DD HH:mm"
                plugins={[
                  <TimePicker key="time-picker" position="bottom" />
                ]}
                calendarPosition="bottom-right"
                inputClass="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-center font-black text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-medical-500 focus:border-transparent transition-all"
                containerStyle={{ width: "100%" }}
              />
            )}
          />
        </div>

        {/* Inputs Grid */}
        <div className="grid grid-cols-2 gap-4">
            <VitalInput
                label="فشار سیستول"
                icon={Activity}
                unit="mmHg"
                color="text-rose-500"
                {...register("systolicBloodPressure", { valueAsNumber: true })}
                error={errors.systolicBloodPressure?.message}
            />
            <VitalInput
                label="فشار دیاستول"
                icon={Activity}
                unit="mmHg"
                color="text-rose-500"
                {...register("diastolicBloodPressure", { valueAsNumber: true })}
                error={errors.diastolicBloodPressure?.message}
            />
            <VitalInput
                label="ضربان قلب"
                icon={Heart}
                unit="BPM"
                color="text-emerald-500"
                {...register("pulseRate", { valueAsNumber: true })}
                error={errors.pulseRate?.message}
            />
            <VitalInput
                label="تعداد تنفس"
                icon={Activity}
                unit="/min"
                color="text-indigo-500"
                {...register("respiratoryRate", { valueAsNumber: true })}
                error={errors.respiratoryRate?.message}
            />
            <VitalInput
                label="دمای بدن"
                icon={Thermometer}
                unit="°C"
                color="text-orange-500"
                {...register("bodyTemperature", { valueAsNumber: true })}
                step="0.1"
                error={errors.bodyTemperature?.message}
            />
            <VitalInput
                label="اکسیژن خون"
                icon={Droplet}
                unit="%"
                color="text-blue-500"
                {...register("oxygenSaturation", { valueAsNumber: true })}
                error={errors.oxygenSaturation?.message}
            />
            <VitalInput
                label="سطح هوشیاری"
                icon={Activity}
                unit="GCS"
                color="text-purple-500"
                {...register("glasgowComaScale", { valueAsNumber: true })}
                error={errors.glasgowComaScale?.message}
            />
        </div>

        {/* Delay Reason */}
        {watchedValues.measuredAt && (Date.now() - new Date(watchedValues.measuredAt).getTime() > 3600000) && (
             <div className="animate-fade-in">
               <label className="block text-xs font-bold text-amber-600 mb-1">دلیل تاخیر (الزامی)</label>
               <input 
                 {...register('delayReason')}
                 className="w-full bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                 placeholder="دلیل تاخیر در ثبت..."
               />
               {errors.delayReason && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.delayReason.message}</p>}
             </div>
        )}

        {/* Warnings */}
        <AnimatePresence>
            {warnings.length > 0 && (
                <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/30 rounded-xl p-4"
                >
                    <div className="flex items-center gap-2 text-amber-600 dark:text-amber-500 font-bold text-sm mb-2">
                        <AlertTriangle size={16} />
                        هشدارهای بالینی
                    </div>
                    <ul className="space-y-1">
                        {warnings.map((w, i) => (
                            <li key={i} className="text-xs text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                                <span className="w-1 h-1 rounded-full bg-amber-500" />
                                {w}
                            </li>
                        ))}
                    </ul>
                </motion.div>
            )}
        </AnimatePresence>

        <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
            <button 
                type="button"
                onClick={onCancel}
                className="flex-1 py-4 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-300 rounded-2xl font-bold text-sm hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
                انصراف
            </button>
            <PortalButton 
                type="submit"
                disabled={isSubmitting}
                className="flex-[2]"
            >
                {isSubmitting ? (
                <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    در حال ثبت...
                </>
                ) : (
                <>
                    <Save className="w-5 h-5" />
                    ثبت نهایی
                </>
                )}
            </PortalButton>
        </div>
      </form>
    </PortalCard>
  );
}

// Reusable Input Component with forwardRef
const VitalInput = React.forwardRef<HTMLInputElement, any>(({ label, icon: Icon, unit, color, error, ...props }, ref) => (
  <div className={cn(
      "bg-neutral-warm-50/50 dark:bg-gray-800 rounded-[1.5rem] p-4 border transition-all group relative",
      error ? "border-rose-200 bg-rose-50/50" : "border-gray-100 dark:border-gray-700 focus-within:ring-2 focus-within:ring-medical-200 focus-within:border-medical-300"
  )}>
    <div className="flex items-center gap-2 mb-2">
      <div className={cn("p-1 rounded-md", color.replace('text-', 'bg-').replace('500', '50'))}>
        <Icon className={cn("w-3 h-3", color)} />
      </div>
      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</span>
    </div>
    <div className="flex items-baseline gap-1">
      <input
        ref={ref}
        type="number"
        className="w-full bg-transparent text-2xl font-black text-gray-800 dark:text-gray-100 placeholder-gray-200 focus:outline-none"
        placeholder="--"
        {...props}
      />
      <span className="text-[10px] text-gray-400 font-bold">{unit}</span>
    </div>
    {error && <div className="absolute -bottom-1 right-2 text-[9px] text-rose-500 font-bold bg-white px-1 rounded-md shadow-sm border border-rose-100">{error}</div>}
  </div>
));
VitalInput.displayName = "VitalInput";
