import { z } from 'zod';

export const vitalSignSchema = z.object({
  measuredAt: z.string().refine((val) => !isNaN(Date.parse(val)), 'زمان نامعتبر است'),
  systolicBloodPressure: z.number().min(50, 'حداقل ۵۰').max(250, 'حداکثر ۲۵۰'),
  diastolicBloodPressure: z.number().min(30, 'حداقل ۳۰').max(180, 'حداکثر ۱۸۰'),
  pulseRate: z.number().min(30, 'حداقل ۳۰').max(220, 'حداکثر ۲۲۰'),
  respiratoryRate: z.number().min(8, 'حداقل ۸').max(60, 'حداکثر ۶۰'),
  bodyTemperature: z.number().min(34, 'حداقل ۳۴').max(43, 'حداکثر ۴۳'),
  oxygenSaturation: z.number().min(50, 'حداقل ۵۰').max(100, 'حداکثر ۱۰۰'),
  glasgowComaScale: z.number().min(3, 'حداقل ۳').max(15, 'حداکثر ۱۵').optional(),
  note: z.string().max(200, 'حداکثر ۲۰۰ کاراکتر').optional(),
  delayReason: z.string().optional(),
}).refine((data) => {
  // If entry is late (e.g., > 1 hour gap), delayReason is required
  const measuredTime = new Date(data.measuredAt).getTime();
  const now = Date.now();
  if (now - measuredTime > 60 * 60 * 1000) {
    return !!data.delayReason && data.delayReason.length > 0;
  }
  return true;
}, {
  message: "برای ثبت با تاخیر بیش از ۱ ساعت، ذکر دلیل الزامی است",
  path: ["delayReason"],
});

export type VitalSignFormData = z.infer<typeof vitalSignSchema>;

// Helper for soft validation (Warnings)
export const getVitalWarnings = (data: Partial<VitalSignFormData>) => {
  const warnings: string[] = [];
  if (data.systolicBloodPressure && (data.systolicBloodPressure < 90 || data.systolicBloodPressure > 160)) warnings.push('فشار خون سیستولیک غیرطبیعی است');
  if (data.diastolicBloodPressure && (data.diastolicBloodPressure < 60 || data.diastolicBloodPressure > 100)) warnings.push('فشار خون دیاستولیک غیرطبیعی است');
  if (data.bodyTemperature && (data.bodyTemperature < 36 || data.bodyTemperature > 38)) warnings.push('دمای بدن غیرطبیعی است');
  if (data.oxygenSaturation && data.oxygenSaturation < 93) warnings.push('سطح اکسیژن پایین است');
  return warnings;
};
