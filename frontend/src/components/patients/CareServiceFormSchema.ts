import { z } from 'zod';

export const careServiceFormSchema = z.object({
  careRecipientId: z.number().optional(), // Added for global mode
  serviceDefinitionId: z.number().min(1, 'انتخاب خدمت الزامی است'),
  performerId: z.string().optional(), // Added for Admin/Nurse to specify performer
  performedAt: z.string().min(1, 'تاریخ انجام الزامی است'),
  time: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  description: z.string().optional(),
  notes: z.string().optional(),
  reminderEnabled: z.boolean().optional(),
  reminderDayBefore: z.boolean().optional(),
  reminderHoursBefore: z.number().int().min(0).max(168).optional(),
  reminderNote: z.string().optional(),

  smsToPatient: z.boolean().optional(),
  smsToSupervisor: z.boolean().optional(),
  smsToAdmin: z.boolean().optional(),
  smsToPerformer: z.boolean().optional(),

  inAppToPatient: z.boolean().optional(),
  inAppToSupervisor: z.boolean().optional(),
  inAppToAdmin: z.boolean().optional(),
  inAppToPerformer: z.boolean().optional(),
}).superRefine((data, ctx) => {
  if (!data.time && !data.startTime) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'ساعت انجام الزامی است', path: ['time'] });
  }

  if (data.reminderEnabled) {
    const hours = data.reminderHoursBefore ?? 0;
    const hasAny = Boolean(data.reminderDayBefore) || hours > 0;
    if (!hasAny) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'حداقل یک زمان یادآوری انتخاب کنید', path: ['reminderHoursBefore'] });
    }

    const smsAny = Boolean(data.smsToPatient || data.smsToSupervisor || data.smsToAdmin || data.smsToPerformer);
    const inAppAny = Boolean(data.inAppToPatient || data.inAppToSupervisor || data.inAppToAdmin || data.inAppToPerformer);
    if (!smsAny && !inAppAny) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'حداقل یک گیرنده برای پیامک یا نوتیف انتخاب کنید', path: ['reminderEnabled'] });
    }
  }
});

export type CareServiceFormValues = z.infer<typeof careServiceFormSchema>;
