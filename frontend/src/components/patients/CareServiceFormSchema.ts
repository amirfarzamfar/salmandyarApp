import { z } from 'zod';

export const careServiceFormSchema = z.object({
  careRecipientId: z.number().optional(), // Added for global mode
  serviceDefinitionId: z.number({ required_error: 'انتخاب خدمت الزامی است' }),
  performerId: z.string().optional(), // Added for Admin/Nurse to specify performer
  performedAt: z.string().min(1, 'تاریخ انجام الزامی است'),
  time: z.string().min(1, 'ساعت انجام الزامی است'),
  description: z.string().optional(),
  notes: z.string().optional(),
});

export type CareServiceFormValues = z.infer<typeof careServiceFormSchema>;
