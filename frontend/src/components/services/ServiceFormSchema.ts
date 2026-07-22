import { z } from 'zod';
import { ServiceCategory } from '@/types/service';

export const serviceFormSchema = z.object({
  code: z.string().min(2, 'کد خدمت الزامی است'),
  title: z.string().min(2, 'نام خدمت باید حداقل ۲ کاراکتر باشد'),
  category: z.nativeEnum(ServiceCategory),
  description: z.string().optional().or(z.literal('')),
  isActive: z.boolean(),
  defaultFormId: z.number().optional().nullable(),
});

export type ServiceFormValues = z.infer<typeof serviceFormSchema>;
