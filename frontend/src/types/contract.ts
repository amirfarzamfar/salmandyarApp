export enum ContractStatus {
  PendingCompletion = 0,
  Completed = 1,
  PendingReview = 2,
  Signed = 3,
  Expired = 4,
  Revoked = 5,
}

export enum ContractFieldType {
  ShortText = 0,
  LongText = 1,
  Date = 2,
  Number = 3,
  Decimal = 4,
  Phone = 5,
  NationalCode = 6,
  Iban = 7,
  Dropdown = 8,
  Checkbox = 9,
}

export enum ContractAuditActionType {
  Created = 0,
  Updated = 1,
  Assigned = 2,
  CaregiverSavedFields = 3,
  CaregiverSigned = 4,
  EmployerSigned = 5,
  WitnessSigned = 6,
  Finalized = 7,
  Expired = 8,
  Revoked = 9,
  VersionBumped = 10,
  ViewedByAdmin = 11,
  Downloaded = 12,
}

export const CONTRACT_STATUS_LABELS: Record<ContractStatus, string> = {
  [ContractStatus.PendingCompletion]: "در انتظار تکمیل",
  [ContractStatus.Completed]: "تکمیل شده",
  [ContractStatus.PendingReview]: "در انتظار تأیید",
  [ContractStatus.Signed]: "امضا شده",
  [ContractStatus.Expired]: "منقضی شده",
  [ContractStatus.Revoked]: "ابطال شده",
};

export const CONTRACT_STATUS_COLORS: Record<ContractStatus, string> = {
  [ContractStatus.PendingCompletion]: "bg-amber-500",
  [ContractStatus.Completed]: "bg-sky-500",
  [ContractStatus.PendingReview]: "bg-violet-500",
  [ContractStatus.Signed]: "bg-emerald-500",
  [ContractStatus.Expired]: "bg-slate-500",
  [ContractStatus.Revoked]: "bg-rose-500",
};

export const CONTRACT_FIELD_TYPE_LABELS: Record<ContractFieldType, string> = {
  [ContractFieldType.ShortText]: "متن کوتاه",
  [ContractFieldType.LongText]: "متن بلند",
  [ContractFieldType.Date]: "تاریخ",
  [ContractFieldType.Number]: "عدد صحیح",
  [ContractFieldType.Decimal]: "عدد اعشاری",
  [ContractFieldType.Phone]: "شماره تماس",
  [ContractFieldType.NationalCode]: "کد ملی",
  [ContractFieldType.Iban]: "شماره شبا (IBAN)",
  [ContractFieldType.Dropdown]: "انتخاب از لیست",
  [ContractFieldType.Checkbox]: "چک‌باکس / تأیید",
};

export const PROFILE_PATH_OPTIONS: { label: string; value: string }[] = [
  { label: "نام کامل (User.FirstName + LastName)", value: "User.FirstName+LastName" },
  { label: "شماره تماس (User.PhoneNumber)", value: "User.PhoneNumber" },
  { label: "ایمیل (User.Email)", value: "User.Email" },
  { label: "کد ملی (CaregiverProfile.NationalCode)", value: "CaregiverProfile.NationalCode" },
  { label: "آدرس کامل (CaregiverProfile.FullAddress)", value: "CaregiverProfile.FullAddress" },
  { label: "شماره شبا (CaregiverProfile.Iban)", value: "CaregiverProfile.Iban" },
  { label: "نوع همکاری (CaregiverProfile.CooperationType)", value: "CaregiverProfile.CooperationType" },
  { label: "تاریخ شروع همکاری (CreatedAt)", value: "CaregiverProfile.EmploymentStartDate" },
  { label: "شماره تماس اضطراری (EmergencyContactMobile)", value: "CaregiverProfile.EmergencyContactMobile" },
  { label: "شماره موبایل پرستار", value: "CaregiverProfile.MobileNumber" },
  { label: "استان", value: "CaregiverProfile.Province" },
  { label: "شهر", value: "CaregiverProfile.City" },
];

const DEFAULT_CONTRACT_TEXT_15 = `{{employerHeader}}

# قرارداد الکترونیکی ارائه خدمات مراقبت از سالمند

این قرارداد با رعایت بند «تفکیک سه‌مرحله‌ای: احراز هویت هویتی → احراز صلاحیت حرفه‌ای → انعقاد قرارداد همکاری» و ماده ۱۰ قانون مدنی، صبح روز {{startDateJalali}} با شماره قرارداد **{{contractNumber}}** بین دو طرف ذیل منعقد گردیده است:

## طرفین قرارداد

### الف) کارفرما (خدمت‌گیرنده / مرکز سالمندیار)
نام و مشخصات:
- نام مرکز: **{{employerFullName}}**
- کد اقتصادی / شناسه ملی: {{employerNationalId}}
- آدرس دفتر مرکزی: {{employerAddress}}
- شماره تماس: {{employerPhone}}
- نام نماینده قانونی: {{employerRepresentativeFullName}}

### ب) ارائه‌دهنده خدمات (مراقب / پرستار / نیروی خدمت)
تأیید هویتی و صلاحیت حرفه‌ای در مراحل قبل انجام شده و اسناد آن در سامانه سالمندیار مسترد می‌باشد:
- **نام و نام خانوادگی**: {{fullName}}
- **کد ملی**: {{nationalCode}}
- **شماره تماس**: {{mobileNumber}}
- **شماره حساب / شبا (IBAN)**: {{iban}}
- **آدرس محل سکونت**: {{address}}
- **نوع همکاری**: {{cooperationType}}
- **تاریخ شروع همکاری**: {{startDateJalali}}
- **شماره نظام‌پزشکی / پرستاری**: {{nursingCouncilNumber}}
- **سنوات تجربه**: {{experienceYears}} سال
- **استان / شهر خدمت**: {{province}} - {{city}}
- **شخص تماس اضطراری**: {{emergencyContactFullName}} ({{emergencyContactRelationship}})
- **شماره تماس اضطراری**: {{emergencyContact}}

---

## ماده ۱ - موضوع قرارداد
موضوع قرارداد ارائه خدمات مراقبت و نگهداری و نگهبانی از سالمند(های) ذیل با رعایت استانداردهای وزارت بهداشت، درمان و آموزش پزشکی و دستورالعمل‌های داخلی سامانه سالمندیار می‌باشد:

- نام و شناسه سالمند: {{elderlyFullName}} (کد ملی: {{elderlyNationalCode}})
- سن: {{elderlyAge}} - جنسیت: {{elderlyGender}}
- بیماری‌های زمینه‌ای اصلی: {{elderlyPrimaryConditions}}
- سطح وابستگی: {{elderlyDependencyLevel}}
- سطح Risk طبق ارزیابی تخصصی: {{elderlyRiskLevel}}
- داروهای ثابت روزانه: {{elderlyMedicationsList}}

## ماده ۲ - محل و محیط ارائه خدمات
خدمات در محل زیر ارائه خواهد شد:
- آدرس کامل محل خدمت: {{serviceAddress}}
- امکانات اقامت: {{serviceAccommodations}}
- تجهیزات پزشکی موجود در محل: {{serviceExistingEquipment}}
- مسافت از مرکز پشتیبانی: {{serviceDistanceKm}} کیلومتر

## ماده ۳ - مدت قرارداد و ساعات کاری
- **مدت اولیه قرارداد**: {{contractDurationDays}} روز (از {{startDateJalali}} الی {{endDateJalali}})
- **برنامه هفتگی**: {{workScheduleSummary}}
- **شیفت کاری و ساعت حضور**: {{shiftDetails}}
- **حقوق روزانه/ساعتی توافق‌شده**: {{dailyWageRate}} ریال
- **حقوق قراردادی ماهانه (تخمینی)**: {{monthlyWageEstimate}} ریال
- **حق اضافه‌کاری**: {{overtimeRate}} درصدی حقوق پایه
- **مزایا و تسهیلات**: {{benefitsSummary}}

## ماده ۴ - شیوه پرداخت و مالی
1. مقرر می‌گردد مبلغ توافق‌شده بصورت **{{paymentMethod}}** در سررسید **{{paymentSchedule}}** واریز گردد.
2. شماره شبا واریزی به نام ارائه‌دهنده خدمات: **{{iban}}**
3. شماره تماس واحد مالی و امور استخدامی مرکز: {{financePhone}}
4. کلیه کسورات قانونی (بیمه، مالیات و ...) مطابق قوانین مصوب انجام خواهد شد.
5. در صورت تأخیر بیش از ۷ روز کاری در واریز حقوق پس از سررسید، کارفرما متعهد به پرداخت تأخیر مستمر ۱ درصدی روزانه می‌باشد.

## ماده ۵ - وظایف و تعهدات ارائه‌دهنده خدمات (مراقب)
ارائه‌دهنده خدمات متعهد است:
الف) کلیه وظایف مصوب و توصیه‌های تیم درمان سالمند را با رعایت اخلاق حرفه‌ای و دقیق انجام دهد.
ب) علائم حیاتی (فشار، نبض، دما، میزان اشباع اکسیژن، قند خون) را حداقل **{{vitalsFrequency}}** در روز ثبت کند.
ج) داروهای تجویزشده را دقیقاً طبق دستور پزشک در زمان مقرر به سالمند مصرف دهد و هرگونه عوارض جانبی را بلافاصله به پزشک معالج و خانواده اطلاع دهد.
د) از عدم واگذاری خدمات به شخص ثالث (غیر از موارد اضطراری و با تأیید مدیریت) خودداری نماید؛ در غیر این صورت قرارداد فوراً فسخ خواهد شد.
ه) حریم خصوصی سالمند و خانواده را رعایت نماید (تعهد محرمانگی).
و) حضور به‌موقع در شیفت کاری را رعایت نماید. در صورت ضرورت غیبت، حداقل ۴۸ ساعت قبل به مدیریت اطلاع دهد.
ز) در شرایط اضطراری پزشکی (آسیب، سکته، ایست قریبی و غیره) بلافاصله با شماره‌های اضطراری زیر تماس بگیرد:
   - اورژانس ۱۱۵، پاسخگویی ۲۴ ساعته مرکز: {{emergencyCenterPhone}}
   - پزشک معالج سالمند: {{attendingDoctorPhone}}
   - سرپرست پرستاری: {{nurseSupervisorPhone}}
   - اولین مسئول خانواده: {{firstFamilyContactPhone}}

## ماده ۶ - وظایف و تعهدات کارفرما و خانواده
کارفرما / خانواده متعهد است:
الف) محیط امن، بهداشتی و مناسب کار (تجهیزات حفاظت فردی، وسایل پاکیزگی، غذا و اسکان طبق توافق) را فراهم کند.
ب) اسرار و اطلاعات مراقب را محرمانه نگه دارد.
ج) دستورالعمل‌های تیم درمان را پشتیبانی کند و از خواسته‌های خلاف استاندارد از ارائه‌دهنده خدمات خودداری نماید.
د) در صورت مشاهده کاستی، آن را از طریق کانال‌های رسمی سامانه سالمندیار پیگیری نماید.

## ماده ۷ - تعهد محرمانگی (Non-Disclosure)
طرفین متعهدند کلیه اطلاعات شخصی، پزشکی، مالی و عملیاتی که در قبال یکدیگر و سالمند به دست می‌آورند را حتی پس از فسخ یا اتمام قرارداد محفوظ نگه دارند. هرگونه نقض این ماده پیگرد قانونی خواهد داشت.

## ماده ۸ - مرخصی و تعطیلات
- مرخصی استحقاقی سالانه: {{annualLeaveDays}} روز
- نحوه درخواست: حداقل ۲ هفته قبل از تاریخ مورد نظر با تأیید مدیریت
- در روزهای تعطیل رسمی و جشن‌های ملی، طبق توافق قبلی و با رعایت تعویض شیفت مناسب سازماندهی می‌شود.

## ماده ۹ - مسئولیت و بیمه تخصصی
الف) کارفرما متعهد است ارائه‌دهنده خدمات را تحت پوشش بیمه تخصصی مسئولیت و حوادث ناشی از کار قرار دهد.
ب) ارائه‌دهنده خدمات در صورت بروز خسارت مستقیم ناشی از تخلف عمدی یا ناشی از نقض پروتکل‌های بهداشتی/درمانی، مسئول خسارت مستقیم می‌باشد.
ج) صدمات ناشی از تأخیر در گزارش‌دهی شرایط اضطراری یا عدم اجرای دستورات ثابت پزشکی، بر عهده ارائه‌دهنده خدمات خواهد بود.

## ماده ۱۰ - حل اختلاف
هرگونه اختلاف ناشی از این قرارداد ابتدا از طریق مذاکره محترمانه طرفین با مدیریت سامانه سالمندیار حل خواهد شد. در صورت عدم توافق، صالحیت رسیدگی به دادگاه‌های صلاحیت‌دار محول می‌گردد. طرفین صراحتاً صلاحیت دیوان داوری را نیز برای موارد مبلغی به ۵۰۰ میلیون ریال می‌پذیرند.

## ماده ۱۱ - فسخ قرارداد
۱. طرفین می‌توانند با مهلت ۳۰ روزه کتبی قرارداد را فسخ کنند.
۲. موارد فسخ فوری (بدون مهلت) عبارتند از:
   الف) نقض مفاد ماده ۵، ۷ و ۹ توسط مراقب
   ب) عدم واریز حقوق بیش از ۱۵ روز پس از سررسید با تذکر کتبی
   ج) عدم فراهم شدن محیط کار امن توسط کارفرما پس از تذکر
   د) جرم‌وثبت‌شده یا اعتیاد ثابت‌شده در یکی از طرفین
   ه) عدم رعایت الزام «عدم واگذاری خدمات» (ماده ۵-د)

## ماده ۱۲ - ضمائم قرارداد
ضمائم زیر جزء لاینفک این قرارداد می‌باشند:
۱. کپی مصداق و مدارک ارائه‌دهنده خدمات (شناسنامه، کد ملی، گواهی‌نامه رشته، مدرک تحصیلی، مدارک مرتبط)
۲. پروفایل استخدامی و احراز صلاحیت حرفه‌ای سالمندیار
۳. برنامه مراقبت درمانی شخصی‌سازی‌شده (Care Plan) سالمند
۴. لیست داروها و رژیم غذایی مصوب
۵. پروتکل‌های اضطراری مرکز سالمندیار

## ماده ۱۳ - امضا و اعتبار
این قرارداد به صورت الکترونیکی، مطابق با «قوانین تجارت الکترونیکی ایران» و طبق الگوی ثبت امضای قابل استناد (غیرقابل انکار / Non-Repudiation) شامل تراکنش زیر تنظیم شده است:
- **شناسه تراکنش**: {{transactionId}}
- **تاریخ و ساعت زمان‌بندی امضا (UTC)**: {{signingTimestampUtc}}
- **Hash مطالب قرارداد (SHA-256 با Salt جامد)**: {{contentHash}}
- **IP دستگاه امضاکننده**: {{signerIpAddress}}
- **User-Agent دستگاه**: {{signerUserAgent}}
- **روش احراز هویت هنگام امضا**: {{signerAuthMethod}}

پس از تأیید و امضای الکترونیکی طرفین (مراقب + کارفرما + شاهد در صورت نیاز)، متن نهایی قرارداد به عنوان مدرک قانونی در سامانه سالمندیار مسترد شده و کپی رسمی آن از بخش «مشاهده قرارداد» در پنل پرستار و پروفایل پرسنل در پنل مدیریت قابل مشاهده و بارگذاری می‌باشد.

## ماده ۱۴ - شرایط اضطراری و تداوم خدمات
در شرایط بحرانی (آسایش، حوادث طبیعی، محدودیت حرکتی، بیماری همه‌گیر و غیره) اولویت با تداوم امنیت و سلامت سالمند است و مراقب متعهد است رعایت استانداردهای امنیتی و دستورالعمل‌های بحرانی را تا آخرین فرصت ممکن رعایت نماید. مدیریت مرکز نیز متعهد است پشتیبانی لجستیک و امنیتی لازم را فراهم کند.

## ماده ۱۵ - بند پایانی
طرفین بر تأیید کامل صحت مفاد فوق اعلام می‌دارند و کلیه بندها را مطالعه کرده و به صحت و صحت آن پیوسته اقرار و قبول دارند. در صورتی که هر یک از مواد این قرارداد با احکام قانونی تعارض پیدا کند، بقیه مواد اعتبار خویش را حفظ خواهند نمود.

---

{{signaturesBlock}}
`;

export const DEFAULT_CONTRACT_TEMPLATE_15: {
  title: string;
  code: string;
  contractType: string;
  description: string;
  contractText: string;
} = {
  title: "قرارداد الکترونیکی ارائه خدمات مراقبت از سالمند",
  code: "CARE-COOPERATION-V1",
  contractType: "همکاری با نیروی پرستاری / مراقب سالمند",
  description:
    "شابلون پیش‌فرض ۱۵ ماده‌ای قرارداد همکاری با تفکیک ۳ مرحله‌ای احراز هویت، احراز صلاحیت و انعقاد قرارداد و Notary Log امضا.",
  contractText: DEFAULT_CONTRACT_TEXT_15,
};

export const DEFAULT_FIELDS_14: UpsertContractFieldDto[] = [
  {
    key: "fullName",
    label: "نام و نام خانوادگی",
    fieldType: ContractFieldType.ShortText,
    order: 1,
    isRequired: true,
    placeholder: "مثال: امیر رضایی",
    defaultValueFromProfilePath: "User.FirstName+LastName",
    isFromProfile: true,
  },
  {
    key: "nationalCode",
    label: "کد ملی",
    fieldType: ContractFieldType.NationalCode,
    order: 2,
    isRequired: true,
    placeholder: "۱۰ رقم",
    defaultValueFromProfilePath: "CaregiverProfile.NationalCode",
    isFromProfile: true,
    validationRegex: "^\\d{10}$",
  },
  {
    key: "mobileNumber",
    label: "شماره تماس اصلی",
    fieldType: ContractFieldType.Phone,
    order: 3,
    isRequired: true,
    placeholder: "مثلاً ۰۹۱۲xxxxxxx",
    defaultValueFromProfilePath: "CaregiverProfile.MobileNumber",
    isFromProfile: true,
  },
  {
    key: "address",
    label: "آدرس محل سکونت",
    fieldType: ContractFieldType.LongText,
    order: 4,
    isRequired: true,
    placeholder: "استان، شهر، محله، پلاک، واحد...",
    defaultValueFromProfilePath: "CaregiverProfile.FullAddress",
    isFromProfile: true,
  },
  {
    key: "province",
    label: "استان محل خدمت",
    fieldType: ContractFieldType.ShortText,
    order: 5,
    isRequired: true,
    defaultValueFromProfilePath: "CaregiverProfile.Province",
    isFromProfile: true,
  },
  {
    key: "city",
    label: "شهر محل خدمت",
    fieldType: ContractFieldType.ShortText,
    order: 6,
    isRequired: true,
    defaultValueFromProfilePath: "CaregiverProfile.City",
    isFromProfile: true,
  },
  {
    key: "iban",
    label: "شماره شبا (IBAN)",
    fieldType: ContractFieldType.Iban,
    order: 7,
    isRequired: true,
    placeholder: "IR000000000000000000000000",
    defaultValueFromProfilePath: "CaregiverProfile.Iban",
    isFromProfile: true,
  },
  {
    key: "cooperationType",
    label: "نوع همکاری",
    fieldType: ContractFieldType.Dropdown,
    order: 8,
    isRequired: true,
    options: ["تمام‌وقت", "پاره‌وقت", "کاربرگ (کلی)", "قرارداد پروژه‌ای", "حضور در منزل بیمار"],
    defaultValueFromProfilePath: "CaregiverProfile.CooperationType",
    isFromProfile: true,
  },
  {
    key: "startDateJalali",
    label: "تاریخ شروع همکاری (شمسی)",
    fieldType: ContractFieldType.ShortText,
    order: 9,
    isRequired: true,
    placeholder: "۱۴۰۴/۰۷/۰۱",
    description: "اگر خالی باشد به‌صورت خودکار از تاریخ استخدام پرش می‌شود.",
    defaultValueFromProfilePath: "CaregiverProfile.EmploymentStartDate",
    isFromProfile: true,
  },
  {
    key: "nursingCouncilNumber",
    label: "شماره نظام پزشکی / پرستاری",
    fieldType: ContractFieldType.ShortText,
    order: 10,
    isRequired: false,
  },
  {
    key: "experienceYears",
    label: "سنوات تجربه (سال)",
    fieldType: ContractFieldType.Number,
    order: 11,
    isRequired: true,
  },
  {
    key: "emergencyContact",
    label: "شماره تماس اضطراری",
    fieldType: ContractFieldType.Phone,
    order: 12,
    isRequired: true,
    defaultValueFromProfilePath: "CaregiverProfile.EmergencyContactMobile",
    isFromProfile: true,
  },
  {
    key: "emergencyContactFullName",
    label: "نام کامل تماس اضطراری",
    fieldType: ContractFieldType.ShortText,
    order: 13,
    isRequired: true,
  },
  {
    key: "emergencyContactRelationship",
    label: "نسبت با تماس اضطراری",
    fieldType: ContractFieldType.Dropdown,
    order: 14,
    isRequired: true,
    options: ["والدین", "فرزند", "همسر", "خواهر / برادر", "سایر خویشاوندان", "دوست نزدیک"],
  },
];

export interface ContractFieldDto {
  id: number;
  contractTemplateId: number;
  key: string;
  label: string;
  fieldType: ContractFieldType;
  order: number;
  isRequired: boolean;
  placeholder?: string;
  description?: string;
  options?: string[];
  defaultValueFromProfilePath?: string;
  defaultValue?: string;
  validationRegex?: string;
  isFromProfile?: boolean;
}

export interface ContractFieldValueDto {
  fieldId: number;
  key: string;
  stringValue?: string;
  numberValue?: number;
  decimalValue?: number;
  dateValue?: string;
  boolValue?: boolean;
}

export interface ContractTemplateDto {
  id: number;
  code: string;
  title: string;
  version: number;
  contractType?: string;
  contractText: string;
  description?: string;
  isActive: boolean;
  isPublished: boolean;
  effectiveFrom?: string;
  effectiveTo?: string;
  defaultCooperationType?: string;
  defaultDurationDays?: number;
  fields: ContractFieldDto[];
  assignmentCount: number;
  signedAssignmentCount: number;
  createdAt: string;
  updatedAt?: string;
}

export interface ContractAssignmentDto {
  id: number;
  contractTemplateId: number;
  templateTitle: string;
  templateVersion: number;
  templateCode: string;
  contractType?: string;
  userId: string;
  userFullName?: string;
  userRole?: string;
  assignedAt: string;
  contractNumber?: string;
  transactionId?: string;
  status: ContractStatus;
  statusLabel: string;
  employerUserId?: string;
  employerFullName?: string;
  assignedByUserId?: string;
  assignedByFullName?: string;
  caregiverSubmittedAt?: string;
  employerSignedAt?: string;
  witnessSignedAt?: string;
  signedAt?: string;
  effectiveAt?: string;
  startDate?: string;
  endDate?: string;
  cooperationType?: string;
  notes?: string;
  signedSnapshotContractText?: string;
  signedSnapshotContentHash?: string;
  isLocked: boolean;
  fieldValues: ContractFieldValueDto[];
  fieldCount: number;
  completedFieldCount: number;
  completionPercentage: number;
  createdAt: string;
  updatedAt?: string;
}

export interface UserContractAssignmentSummaryDto {
  id?: number;
  assignmentId: number;
  contractTemplateId: number;
  templateTitle: string;
  templateVersion: number;
  contractNumber?: string;
  status: ContractStatus;
  statusLabel: string;
  assignedAt: string;
  createdAt?: string;
  completedAt?: string;
  reviewedAt?: string;
  signedAt?: string;
  employerSignedAt?: string;
  witnessSignedAt?: string;
  startDate?: string;
  endDate?: string;
  cooperationType?: string;
  notes?: string;
  caregiverUserId?: string;
  employerUserId?: string;
  caregiverFullName?: string;
  employerFullName?: string;
  isLocked?: boolean;
  signedSnapshotContentHash?: string;
}

export interface ContractDocumentDto {
  assignmentId: number;
  contractTemplateId: number;
  templateTitle: string;
  templateVersion: number;
  templateCode: string;
  contractNumber?: string;
  status: ContractStatus;
  statusLabel: string;
  renderedHtml: string;
  signedSnapshotContractText?: string;
  signedSnapshotContentHash?: string;
  isFinalVersion: boolean;
  generatedAt: string;
  fieldValues: ContractFieldValueDto[];
}

export interface ContractAuditLogDto {
  id: number;
  contractAssignmentId: number;
  action: ContractAuditActionType;
  actionType?: ContractAuditActionType;
  actionLabel: string;
  actorUserId?: string;
  actorFullName?: string;
  actorRole?: string;
  userFullName?: string;
  userRole?: string;
  actionAt: string;
  createdAt?: string;
  ipAddress?: string;
  clientIp?: string;
  userAgent?: string;
  authMethod?: string;
  contentHash?: string;
  transactionId?: string;
  detailsJson?: string;
  message?: string;
  isCaregiverSignature?: boolean;
  isEmployerSignature?: boolean;
  isWitnessSignature?: boolean;
}

export interface UpsertContractFieldDto {
  id?: number;
  key: string;
  label: string;
  fieldType: ContractFieldType;
  order: number;
  isRequired: boolean;
  placeholder?: string;
  description?: string;
  options?: string[];
  defaultValueFromProfilePath?: string;
  defaultValue?: string;
  validationRegex?: string;
  isFromProfile?: boolean;
}

export interface CreateContractTemplateDto {
  code: string;
  title: string;
  contractType?: string;
  contractText: string;
  description?: string;
  isActive: boolean;
  isPublished: boolean;
  effectiveFrom?: string;
  effectiveTo?: string;
  defaultCooperationType?: string;
  defaultDurationDays?: number;
  fields: UpsertContractFieldDto[];
}

export interface UpdateContractTemplateDto {
  title: string;
  contractType?: string;
  contractText: string;
  description?: string;
  isActive: boolean;
  isPublished: boolean;
  effectiveFrom?: string;
  effectiveTo?: string;
  defaultCooperationType?: string;
  defaultDurationDays?: number;
  fields: UpsertContractFieldDto[];
}

export interface AssignContractDto {
  contractTemplateId: number;
  userId: string;
  startDate?: string;
  endDate?: string;
  cooperationType?: string;
  notes?: string;
}

export interface ContractFieldValueInputDto {
  fieldId: number;
  key: string;
  value: string;
}

export interface SaveContractFieldValuesDto {
  assignmentId: number;
  fieldValues: ContractFieldValueInputDto[];
  markAsCompleted: boolean;
}

export interface SignContractDto {
  assignmentId: number;
  acceptTerms: boolean;
  declarationText?: string;
}

export interface MyContractStatusDto {
  hasActiveContract: boolean;
  assignment?: ContractAssignmentDto;
  templateFields: ContractFieldDto[];
  document?: ContractDocumentDto;
  identityVerified: boolean;
  professionalEligibilityVerified: boolean;
  contractSigned: boolean;
}

export interface ToggleContractTemplateDto {
  isActive: boolean;
}

export interface PagedResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}
