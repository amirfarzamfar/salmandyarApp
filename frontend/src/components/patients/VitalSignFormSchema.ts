import { z } from 'zod';

const numberFromForm = <TSchema extends z.ZodTypeAny>(schema: TSchema) =>
  z.preprocess((value) => {
    if (value === '' || value === null || value === undefined) return undefined;
    if (typeof value === 'number' && Number.isNaN(value)) return undefined;
    return value;
  }, schema) as unknown as TSchema;

const requiredNumber = (requiredMessage: string, min: number, minMessage: string, max: number, maxMessage: string) =>
  numberFromForm(
    z
      .number({
        error: (issue) => {
          if (issue.code !== 'invalid_type') return undefined;
          if (issue.input === undefined) return requiredMessage;
          return 'مقدار واردشده باید عدد باشد';
        },
      })
      .min(min, minMessage)
      .max(max, maxMessage),
  );

const optionalNumber = (min: number, minMessage: string, max: number, maxMessage: string) =>
  numberFromForm(
    z
      .number({
        error: (issue) => {
          if (issue.code !== 'invalid_type') return undefined;
          return 'مقدار واردشده باید عدد باشد';
        },
      })
      .min(min, minMessage)
      .max(max, maxMessage),
  ).optional();

export const vitalSignSchema = z.object({
  measuredAt: z.string().refine((val) => !isNaN(Date.parse(val)), 'زمان نامعتبر است'),
  systolicBloodPressure: requiredNumber('فشار سیستولیک الزامی است', 50, 'حداقل ۵۰', 250, 'حداکثر ۲۵۰'),
  diastolicBloodPressure: requiredNumber('فشار دیاستولیک الزامی است', 30, 'حداقل ۳۰', 180, 'حداکثر ۱۸۰'),
  pulseRate: requiredNumber('ضربان قلب الزامی است', 30, 'حداقل ۳۰', 220, 'حداکثر ۲۲۰'),
  respiratoryRate: requiredNumber('تعداد تنفس الزامی است', 8, 'حداقل ۸', 60, 'حداکثر ۶۰'),
  bodyTemperature: requiredNumber('دمای بدن الزامی است', 34, 'حداقل ۳۴', 43, 'حداکثر ۴۳'),
  oxygenSaturation: requiredNumber('اشباع اکسیژن الزامی است', 50, 'حداقل ۵۰', 100, 'حداکثر ۱۰۰'),
  bloodSugar: optionalNumber(0, 'حداقل ۰', 1000, 'حداکثر ۱۰۰۰'),
  glasgowComaScale: optionalNumber(3, 'حداقل ۳', 15, 'حداکثر ۱۵'),
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
