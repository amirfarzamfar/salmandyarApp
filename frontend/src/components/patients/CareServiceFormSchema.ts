import { z } from 'zod';

export const careServiceFormSchema = z.object({
  serviceDefinitionId: z.number({ required_error: 'انتخاب خدمت الزامی است' }),
  performedAt: z.string().min(1, 'تاریخ انجام الزامی است'),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  description: z.string().optional(),
  notes: z.string().optional(),
}).refine((data) => {
    if (data.startTime && data.endTime) {
        return new Date(data.endTime) > new Date(data.startTime);
    }
    return true;
}, {
    message: "زمان پایان باید بعد از زمان شروع باشد",
    path: ["endTime"],
});

export type CareServiceFormValues = z.infer<typeof careServiceFormSchema>;
