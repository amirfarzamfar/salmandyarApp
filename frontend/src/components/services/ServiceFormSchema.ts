import { z } from 'zod';
import { ServiceCategory } from '@/types/service';

export const serviceFormSchema = z.object({
  title: z.string().min(2, 'نام خدمت باید حداقل ۲ کاراکتر باشد'),
  category: z.nativeEnum(ServiceCategory, {
    errorMap: () => ({ message: 'دسته‌بندی نامعتبر است' }),
  }),
  description: z.string().optional().or(z.literal('')),
  isActive: z.boolean().default(true),
});

export type ServiceFormValues = z.infer<typeof serviceFormSchema>;
