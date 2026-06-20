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
  frequencyType: z.any(),
  frequencyDetail: z.string().nullable().optional(), // Can be comma separated times or interval number
  startDate: z.string().min(1, 'تاریخ شروع الزامی است'),
  endDate: z.string().nullable().optional(),
  
  // Safety & Alerts
  criticality: z.any(),
  highAlert: z.boolean().optional(),
  isPRN: z.boolean().optional(),
  
  // Notifications
  gracePeriodMinutes: z.coerce.number().min(0).optional(),
  escalationEnabled: z.boolean().optional(),
  notifyPatient: z.boolean().optional(),
  notifyNurse: z.boolean().optional(),
  notifySupervisor: z.boolean().optional(),
  notifyFamily: z.boolean().optional(),
  
  // Stock & Inventory
  totalQuantity: z.coerce.number().min(0).optional(),
  alertLimit: z.coerce.number().min(0).optional(),
  doseQuantity: z.coerce.number().min(1).optional(),
  alertLowStockInAppEnabled: z.boolean().optional(),
  alertLowStockSmsEnabled: z.boolean().optional(),
  alertLowStockEmailEnabled: z.boolean().optional(),
  alertLowStockPatient: z.boolean().optional(),
  alertLowStockNurse: z.boolean().optional(),
  alertLowStockFamily: z.boolean().optional(),
  alertLowStockAdmin: z.boolean().optional(),
  alertLowStockCustomPhone: z.string().nullable().optional(),
  alertLowStockCustomEmail: z.string().nullable().optional(),
  
  // Instructions
  instructions: z.string().nullable().optional(),
});

export type MedicationFormData = z.infer<typeof medicationSchema>;
