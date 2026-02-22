import { z } from 'zod';
import { MedicationCriticality, MedicationFrequencyType } from '@/types/medication';

export const medicationSchema = z.object({
  careRecipientId: z.number(),
  
  // Clinical Info
  name: z.string().min(1, 'نام دارو الزامی است'),
  form: z.string().min(1, 'شکل دارویی الزامی است'),
  dosage: z.string().min(1, 'دوز دارو الزامی است'),
  route: z.string().min(1, 'روش مصرف الزامی است'),
  
  // Scheduling
  frequencyType: z.nativeEnum(MedicationFrequencyType),
  frequencyDetail: z.string().optional(), // Can be comma separated times or interval number
  startDate: z.string().min(1, 'تاریخ شروع الزامی است'),
  endDate: z.string().optional(),
  
  // Safety & Alerts
  criticality: z.nativeEnum(MedicationCriticality),
  highAlert: z.boolean().default(false),
  isPRN: z.boolean().default(false),
  
  // Notifications
  gracePeriodMinutes: z.number().min(0).default(30),
  escalationEnabled: z.boolean().default(false),
  notifyPatient: z.boolean().default(false),
  notifyNurse: z.boolean().default(false),
  notifySupervisor: z.boolean().default(false),
  notifyFamily: z.boolean().default(false),
  
  // Instructions
  instructions: z.string().optional(),
});

export type MedicationFormData = z.infer<typeof medicationSchema>;
