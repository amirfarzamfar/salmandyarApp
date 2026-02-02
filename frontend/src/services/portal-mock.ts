export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  nextDose: string; // ISO string
  status: "taken" | "pending" | "missed";
  instructions: string;
  icon?: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  relation: string;
  phone: string;
  isPrimary: boolean;
}

export interface PortalNotification {
  id: string;
  title: string;
  message: string;
  type: "medication" | "appointment" | "info";
  time: string;
  read: boolean;
}

export const mockMedications: Medication[] = [
  {
    id: "1",
    name: "آسپرین (Aspirin)",
    dosage: "80mg",
    frequency: "روزانه - صبح",
    nextDose: new Date(new Date().setHours(9, 0, 0, 0)).toISOString(),
    status: "taken",
    instructions: "بعد از صبحانه مصرف شود",
  },
  {
    id: "2",
    name: "متفورمین (Metformin)",
    dosage: "500mg",
    frequency: "روزانه - ناهار",
    nextDose: new Date(new Date().setHours(14, 0, 0, 0)).toISOString(),
    status: "pending",
    instructions: "همراه با غذا",
  },
  {
    id: "3",
    name: "آتورواستاتین (Atorvastatin)",
    dosage: "20mg",
    frequency: "روزانه - شب",
    nextDose: new Date(new Date().setHours(21, 0, 0, 0)).toISOString(),
    status: "pending",
    instructions: "قبل از خواب",
  },
];

export const mockFamily: FamilyMember[] = [
  {
    id: "1",
    name: "مریم رضایی",
    relation: "دختر",
    phone: "09123456789",
    isPrimary: true,
  },
  {
    id: "2",
    name: "علی رضایی",
    relation: "پسر",
    phone: "09129876543",
    isPrimary: false,
  },
];

export const mockNotifications: PortalNotification[] = [
  {
    id: "1",
    title: "زمان مصرف دارو",
    message: "یادآوری: قرص متفورمین خود را مصرف کنید.",
    type: "medication",
    time: new Date(new Date().setMinutes(new Date().getMinutes() - 15)).toISOString(),
    read: false,
  },
  {
    id: "2",
    title: "ویزیت پزشک",
    message: "دکتر حسینی فردا ساعت ۱۰ صبح ویزیت دارند.",
    type: "appointment",
    time: new Date(new Date().setHours(new Date().getHours() - 2)).toISOString(),
    read: true,
  },
];

export const portalService = {
  getMedications: async () => new Promise<Medication[]>(resolve => setTimeout(() => resolve(mockMedications), 800)),
  getFamilyMembers: async () => new Promise<FamilyMember[]>(resolve => setTimeout(() => resolve(mockFamily), 500)),
  getNotifications: async () => new Promise<PortalNotification[]>(resolve => setTimeout(() => resolve(mockNotifications), 600)),
};
