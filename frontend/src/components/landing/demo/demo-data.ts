export interface DemoVitalSign {
  id: string;
  label: string;
  value: string;
  unit: string;
  icon: 'heart' | 'activity' | 'droplets' | 'thermometer' | 'wind' | 'clock';
  color: 'teal' | 'blue' | 'rose' | 'amber' | 'emerald' | 'violet';
  trend: 'up' | 'down' | 'stable';
  trendValue: string;
  status: 'normal' | 'warning' | 'critical';
  min?: string;
  max?: string;
}

export interface DemoMedication {
  id: string;
  name: string;
  genericName: string;
  dosage: string;
  frequency: string;
  time: string[];
  status: 'taken' | 'pending' | 'missed';
  nextDose: string;
  remaining: number;
  total: number;
  icon: string;
  color: 'teal' | 'blue' | 'amber' | 'rose' | 'violet';
  hasAlert?: boolean;
  alertMessage?: string;
}

export interface DemoCareTask {
  id: string;
  title: string;
  time: string;
  type: 'medication' | 'vitals' | 'care' | 'activity' | 'meal';
  caregiver: string;
  status: 'done' | 'in-progress' | 'pending' | 'overdue';
  note?: string;
}

export interface DemoNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'info' | 'warning' | 'success' | 'alert';
  read: boolean;
}

export interface DemoChartPoint {
  time: string;
  heartRate: number;
  systolic: number;
  diastolic: number;
  spo2: number;
  temperature: number;
}

export interface DemoFeature {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  category: 'monitoring' | 'medication' | 'report' | 'communication' | 'medical' | 'premium';
  unlockMessage?: string;
  progressReward: number;
}

export interface DemoKardexEntry {
  id: string;
  date: string;
  time: string;
  medication: string;
  dosage: string;
  route: string;
  administered: boolean;
  nurse: string;
  note?: string;
  hasAlert?: boolean;
  alertType?: 'allergy' | 'interaction' | 'overdose' | 'missed';
  alertText?: string;
}

export const demoPatientInfo = {
  name: 'علی رضایی',
  age: 72,
  bloodType: 'O+',
  careLevel: 'مراقبت ویژه',
  currentStatus: 'پایدار',
  primaryDiagnosis: 'دیابت نوع ۲ با فشار خون بالا',
  caregiverName: 'پرستار زهرا احمدی',
  lastCheckup: '۲ دقیقه پیش',
  room: 'اتاق ۳۰۴',
  careCompletion: 68,
};

export const demoVitalSigns: DemoVitalSign[] = [
  {
    id: 'hr',
    label: 'ضربان قلب',
    value: '78',
    unit: 'BPM',
    icon: 'heart',
    color: 'rose',
    trend: 'stable',
    trendValue: '±۲',
    status: 'normal',
    min: '60',
    max: '100',
  },
  {
    id: 'bp',
    label: 'فشار خون',
    value: '118/76',
    unit: 'mmHg',
    icon: 'activity',
    color: 'blue',
    trend: 'down',
    trendValue: '۵/۳',
    status: 'normal',
    min: '90/60',
    max: '140/90',
  },
  {
    id: 'spo2',
    label: 'اکسیژن خون',
    value: '97',
    unit: '%',
    icon: 'droplets',
    color: 'teal',
    trend: 'stable',
    trendValue: '±۱',
    status: 'normal',
    min: '95',
    max: '100',
  },
  {
    id: 'temp',
    label: 'دمای بدن',
    value: '36.7',
    unit: '°C',
    icon: 'thermometer',
    color: 'amber',
    trend: 'up',
    trendValue: '۰.۲',
    status: 'normal',
    min: '36',
    max: '37.5',
  },
  {
    id: 'rr',
    label: 'نفس بر دقیقه',
    value: '16',
    unit: 'RR',
    icon: 'wind',
    color: 'emerald',
    trend: 'stable',
    trendValue: '±۱',
    status: 'normal',
    min: '12',
    max: '20',
  },
  {
    id: 'bs',
    label: 'قند خون',
    value: '124',
    unit: 'mg/dL',
    icon: 'clock',
    color: 'violet',
    trend: 'up',
    trendValue: '۸',
    status: 'warning',
    min: '80',
    max: '140',
  },
];

export const demoMedications: DemoMedication[] = [
  {
    id: 'm1',
    name: 'متفورمین',
    genericName: 'Metformin',
    dosage: '۵۰۰ میلی‌گرم',
    frequency: 'روزانه ۲ بار',
    time: ['۰۸:۰۰', '۲۰:۰۰'],
    status: 'taken',
    nextDose: '۲۰:۰۰',
    remaining: 24,
    total: 30,
    icon: '💊',
    color: 'teal',
  },
  {
    id: 'm2',
    name: 'لوزارتان',
    genericName: 'Losartan',
    dosage: '۵۰ میلی‌گرم',
    frequency: 'روزانه ۱ بار',
    time: ['۰۹:۰۰'],
    status: 'taken',
    nextDose: 'فردا ۰۹:۰۰',
    remaining: 15,
    total: 30,
    icon: '💊',
    color: 'blue',
  },
  {
    id: 'm3',
    name: 'آسپیرین',
    genericName: 'Aspirin',
    dosage: '۸۰ میلی‌گرم',
    frequency: 'روزانه ۱ بار',
    time: ['۰۸:۳۰'],
    status: 'pending',
    nextDose: 'الان',
    remaining: 8,
    total: 30,
    icon: '💊',
    color: 'amber',
    hasAlert: true,
    alertMessage: 'موجودی کمتر از ۱۰ عدد است',
  },
  {
    id: 'm4',
    name: 'آتورواستاتین',
    genericName: 'Atorvastatin',
    dosage: '۲۰ میلی‌گرم',
    frequency: 'روزانه ۱ بار',
    time: ['۲۲:۰۰'],
    status: 'pending',
    nextDose: '۲۲:۰۰',
    remaining: 20,
    total: 30,
    icon: '💊',
    color: 'rose',
  },
  {
    id: 'm5',
    name: 'گلایبن‌کلامید',
    genericName: 'Glibenclamide',
    dosage: '۵ میلی‌گرم',
    frequency: 'روزانه ۲ بار',
    time: ['۰۷:۰۰', '۱۹:۰۰'],
    status: 'missed',
    nextDose: '۱۹:۰۰',
    remaining: 12,
    total: 30,
    icon: '⚠️',
    color: 'violet',
    hasAlert: true,
    alertMessage: 'دوز صبح فراموش شد!',
  },
];

export const demoCarePlan: DemoCareTask[] = [
  {
    id: 't1',
    title: 'ثبت علائم حیاتی',
    time: '۰۷:۰۰',
    type: 'vitals',
    caregiver: 'پرستار زهرا احمدی',
    status: 'done',
    note: 'همه علائم در محدوده طبیعی',
  },
  {
    id: 't2',
    title: 'داروهای صبحانه',
    time: '۰۸:۰۰',
    type: 'medication',
    caregiver: 'پرستار زهرا احمدی',
    status: 'done',
  },
  {
    id: 't3',
    title: 'ناهار و تغذیه',
    time: '۱۳:۰۰',
    type: 'meal',
    caregiver: 'کمک پرستار',
    status: 'in-progress',
  },
  {
    id: 't4',
    title: 'پیاده‌روی کوتاه',
    time: '۱۵:۰۰',
    type: 'activity',
    caregiver: 'کمک پرستار',
    status: 'pending',
    note: '۱۰ دقیقه در راهرو',
  },
  {
    id: 't5',
    title: 'کنترل قند خون',
    time: '۱۷:۰۰',
    type: 'vitals',
    caregiver: 'پرستار زهرا احمدی',
    status: 'pending',
  },
  {
    id: 't6',
    title: 'حمام و مراقبت شخصی',
    time: '۱۸:۰۰',
    type: 'care',
    caregiver: 'کمک پرستار',
    status: 'pending',
  },
  {
    id: 't7',
    title: 'داروهای شب',
    time: '۲۰:۰۰',
    type: 'medication',
    caregiver: 'پرستار زهرا احمدی',
    status: 'overdue',
    note: 'تاخیر ۲۰ دقیقه‌ای',
  },
];

export const demoNotifications: DemoNotification[] = [
  {
    id: 'n1',
    title: 'تکمیل ثبت علائم',
    message: 'پرستار زهرا احمدی علائم حیاتی صبح را ثبت کرد',
    time: 'کمی پیش',
    type: 'success',
    read: false,
  },
  {
    id: 'n2',
    title: 'هشدار دارویی',
    message: 'موجودی آسپیرین کمتر از ۱۰ عدد است',
    time: '۱ ساعت پیش',
    type: 'warning',
    read: false,
  },
  {
    id: 'n3',
    title: 'فراموشی دارو',
    message: 'دوز صبح گلایبن‌کلامید مصرف نشد',
    time: '۳ ساعت پیش',
    type: 'alert',
    read: true,
  },
  {
    id: 'n4',
    title: 'گزارش روزانه آماده است',
    message: 'گزارش سلامت امروز می‌تواند مشاهده شود',
    time: '۵ ساعت پیش',
    type: 'info',
    read: true,
  },
];

export const demoChartData: DemoChartPoint[] = [
  { time: '۰۶:۰۰', heartRate: 72, systolic: 115, diastolic: 72, spo2: 96, temperature: 36.5 },
  { time: '۰۸:۰۰', heartRate: 78, systolic: 118, diastolic: 76, spo2: 97, temperature: 36.6 },
  { time: '۱۰:۰۰', heartRate: 82, systolic: 122, diastolic: 78, spo2: 97, temperature: 36.7 },
  { time: '۱۲:۰۰', heartRate: 76, systolic: 116, diastolic: 74, spo2: 98, temperature: 36.8 },
  { time: '۱۴:۰۰', heartRate: 74, systolic: 114, diastolic: 72, spo2: 97, temperature: 36.7 },
  { time: '۱۶:۰۰', heartRate: 80, systolic: 120, diastolic: 76, spo2: 96, temperature: 36.9 },
  { time: '۱۸:۰۰', heartRate: 78, systolic: 118, diastolic: 76, spo2: 97, temperature: 36.7 },
  { time: '۲۰:۰۰', heartRate: 72, systolic: 112, diastolic: 70, spo2: 98, temperature: 36.6 },
];

export const demoFeatures: DemoFeature[] = [
  {
    id: 'f1',
    title: 'پایش علائم حیاتی',
    description: 'ثبت و نمایش لحظه‌ای ضربان قلب، فشار خون، اکسیژن و دما',
    icon: 'activity',
    unlocked: true,
    category: 'monitoring',
    progressReward: 10,
  },
  {
    id: 'f2',
    title: 'برنامه و کاردکس دارویی',
    description: 'مدیریت داروها، هشدارهای تداخل و ثبت مصرف',
    icon: 'pill',
    unlocked: true,
    category: 'medication',
    progressReward: 10,
  },
  {
    id: 'f3',
    title: 'گزارش سلامت',
    description: 'نمودارهای روزانه و وضعیت کلی بیمار',
    icon: 'chart',
    unlocked: true,
    category: 'report',
    progressReward: 10,
  },
  {
    id: 'f4',
    title: 'برنامه مراقبتی',
    description: 'وضعیت کارهای روزانه و مراقبت‌های انجام‌شده',
    icon: 'calendar',
    unlocked: true,
    category: 'monitoring',
    progressReward: 10,
  },
  {
    id: 'f5',
    title: 'ثبت علائم حیاتی',
    description: 'ورود دستی علائم با اعتبارسنجی هوشمند',
    icon: 'plus',
    unlocked: true,
    category: 'monitoring',
    progressReward: 10,
  },
  {
    id: 'f6',
    title: 'ارتباط با پرستار',
    description: 'پیام‌رسانی و تماس مستقیم با تیم مراقبتی',
    icon: 'message',
    unlocked: false,
    category: 'communication',
    unlockMessage: 'برای ارتباط با پرستار باید ثبت‌نام کنید',
    progressReward: 10,
  },
  {
    id: 'f7',
    title: 'پرونده پزشکی',
    description: 'دسترسی به سابقه کامل بیماری‌ها، آزمایش‌ها و سونوگرافی',
    icon: 'folder',
    unlocked: false,
    category: 'medical',
    unlockMessage: 'دسترسی به پرونده کامل نیاز به ثبت‌نام دارد',
    progressReward: 10,
  },
  {
    id: 'f8',
    title: 'گزارش کامل سلامت',
    description: 'گزارش‌های PDF، پرینت و اشتراک‌گذاری با پزشک',
    icon: 'file',
    unlocked: false,
    category: 'premium',
    unlockMessage: 'گزارش کامل برای کاربران ثبت‌نام‌شده فعال است',
    progressReward: 10,
  },
];

export const demoKardexEntries: DemoKardexEntry[] = [
  {
    id: 'k1',
    date: '۱۴۰۵/۰۶/۰۱',
    time: '۰۸:۰۰',
    medication: 'متفورمین ۵۰۰',
    dosage: '۱ عدد',
    route: 'خوراکی',
    administered: true,
    nurse: 'ز. احمدی',
  },
  {
    id: 'k2',
    date: '۱۴۰۵/۰۶/۰۱',
    time: '۰۸:۳۰',
    medication: 'آسپیرین ۸۰',
    dosage: '۱ عدد',
    route: 'خوراکی',
    administered: true,
    nurse: 'ز. احمدی',
  },
  {
    id: 'k3',
    date: '۱۴۰۵/۰۶/۰۱',
    time: '۰۷:۰۰',
    medication: 'گلایبن‌کلامید ۵',
    dosage: '۱ عدد',
    route: 'خوراکی',
    administered: false,
    nurse: '—',
    hasAlert: true,
    alertType: 'missed',
    alertText: 'فراموشی مصرف',
  },
  {
    id: 'k4',
    date: '۱۴۰۵/۰۶/۰۱',
    time: '۰۹:۰۰',
    medication: 'لوزارتان ۵۰',
    dosage: '۱ عدد',
    route: 'خوراکی',
    administered: true,
    nurse: 'ز. احمدی',
    hasAlert: true,
    alertType: 'interaction',
    alertText: 'تداخل احتمالی با آسپیرین',
  },
];

export const gamificationMilestones = [
  { progress: 0, message: 'خوش آمدید! با کلیک روی تب‌ها شروع کنید.', type: 'welcome' },
  { progress: 20, message: 'عالی! شروعی عالی برای آشنایی با پنل.', type: 'encouragement' },
  { progress: 40, message: 'بسیار خوب! بخش‌های اصلی پایش بیمار را دیدید.', type: 'milestone' },
  { progress: 60, message: 'شگفت‌انگیز! حالا چقدر امکانات را کشف کرده‌اید.', type: 'milestone' },
  { progress: 80, message: 'فقط چند قدم تا تجربه کامل باقی مانده است.', type: 'encouragement' },
  { progress: 100, message: 'تبریک! تمام بخش‌های آزمایشی را دیدید. حالا برای ادامه ثبت‌نام کنید.', type: 'final' },
];
