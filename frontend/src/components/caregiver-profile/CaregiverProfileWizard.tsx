'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import DateObject from 'react-date-object';
import DatePicker from 'react-multi-date-picker';
import persian from 'react-date-object/calendars/persian';
import persian_fa from 'react-date-object/locales/persian_fa';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock3,
  FileCheck2,
  Loader2,
  MapPin,
  Save,
  ShieldCheck,
  Sparkles,
  Upload,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { resolveApiUrl } from '@/lib/network';
import { getCitiesByProvince, iranProvinces } from '@/data/iran-locations';
import {
  CAREGIVER_DOCUMENT_ACCEPT,
  CAREGIVER_DOCUMENT_TYPES,
  CaregiverEmploymentApprovalStatus,
  CaregiverProfileDocumentDto,
  CaregiverProfileDocumentStatus,
  CaregiverProfileDto,
  CourseCertificateDto,
  CoverageAreaDto,
  UpdateCaregiverDocumentStatusDto,
  UpdateCaregiverProfileDto,
  caregiverProfileService,
} from '@/services/caregiver-profile.service';

const stepTitles = [
  'اطلاعات هویتی',
  'اطلاعات تماس',
  'اطلاعات شغلی',
  'مهارت‌ها',
  'تحصیلات',
  'دوره‌ها و گواهینامه‌ها',
  'مدارک استخدامی',
  'اطلاعات بانکی',
  'فرد نزدیک',
  'قوانین',
] as const;

const genderOptions = ['مرد', 'زن', 'سایر'];
const maritalOptions = ['مجرد', 'متاهل'];
const shiftOptions = ['روز', 'شب', '24 ساعته'];
const employmentOptions = ['شاغل', 'آماده همکاری', 'پاره‌وقت', 'تمام‌وقت', 'پروژه‌ای'];
const degreeOptions = ['دیپلم', 'کاردانی', 'کارشناسی', 'کارشناسی ارشد', 'دکتری'];
const relationshipOptions = ['همسر', 'پدر', 'مادر', 'برادر', 'خواهر', 'فرزند', 'سایر'];
const vehicleOptions = ['بدون وسیله', 'موتور', 'خودرو', 'سایر'];
const skillOptions = [
  'تزریقات',
  'پانسمان',
  'ICU / CCU / NICU / PICU',
  'سونداژ',
  'NGT',
  'تراکئوستومی',
  'ساکشن',
  'دیالیز',
  'مراقبت سالمند',
  'مراقبت کودک',
  'مراقبت نوزاد',
  'زخم بستر',
  'اکسیژن‌تراپی',
  'ونتیلاتور',
  'CPR',
  'فیزیوتراپی',
  'گفتاردرمانی',
  'کاردرمانی',
];

const defaultProfile = (): CaregiverProfileDto => ({
  userId: '',
  shiftPreferences: [],
  serviceAreas: [],
  skills: [],
  customSkills: [],
  certificates: [],
  acceptCollaborationTerms: false,
  acceptPatientConfidentiality: false,
  acceptProfessionalEthics: false,
  acceptDocumentReviewConsent: false,
  completionPercentage: 0,
  currentStep: 1,
  isCompleted: false,
  employmentStatus: CaregiverEmploymentApprovalStatus.Draft,
  employmentStatusLabel: 'پیش‌نویس',
  forceCompletedByAdmin: false,
  documents: [],
  auditLogs: [],
  canStayAtPatientHome: false,
  hasDrivingLicense: false,
  createdAt: new Date().toISOString(),
});

type Props = {
  adminUserId?: string;
};

type StepErrors = Record<string, string>;

const getDocumentStatusTone = (status?: CaregiverProfileDocumentStatus) => {
  switch (status) {
    case CaregiverProfileDocumentStatus.Approved:
      return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-900';
    case CaregiverProfileDocumentStatus.NeedsCorrection:
      return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-900';
    case CaregiverProfileDocumentStatus.Rejected:
      return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-300 dark:border-rose-900';
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-700';
  }
};

const parseDateForPicker = (value?: string) => {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return new Date(date);
};

const toIsoDate = (value: DateObject | DateObject[] | null) => {
  const target = Array.isArray(value) ? value[0] : value;
  if (!target || !target.isValid) return undefined;
  return new Date(target.valueOf()).toISOString();
};

const onlyDigits = (value?: string) => (value ?? '').replace(/\D/g, '');

const validateStep = (step: number, profile: CaregiverProfileDto): StepErrors => {
  const errors: StepErrors = {};

  if (step === 1) {
    if (!profile.firstName?.trim()) errors.firstName = 'نام الزامی است.';
    if (!profile.lastName?.trim()) errors.lastName = 'نام خانوادگی الزامی است.';
    if (!profile.fatherName?.trim()) errors.fatherName = 'نام پدر الزامی است.';
    if (onlyDigits(profile.nationalCode).length !== 10) errors.nationalCode = 'کد ملی باید ۱۰ رقم باشد.';
    if (!profile.birthCertificateNumber?.trim()) errors.birthCertificateNumber = 'شماره شناسنامه الزامی است.';
    if (!profile.dateOfBirth) errors.dateOfBirth = 'تاریخ تولد الزامی است.';
    if (!profile.birthPlace?.trim()) errors.birthPlace = 'محل تولد الزامی است.';
    if (!profile.gender) errors.gender = 'جنسیت را انتخاب کنید.';
    if (!profile.maritalStatus) errors.maritalStatus = 'وضعیت تاهل را انتخاب کنید.';
    if (!profile.nationality?.trim()) errors.nationality = 'تابعیت الزامی است.';
  }

  if (step === 2) {
    if (!profile.fullAddress?.trim()) errors.fullAddress = 'آدرس کامل الزامی است.';
    if (!profile.province) errors.province = 'استان را انتخاب کنید.';
    if (!profile.city) errors.city = 'شهر را انتخاب کنید.';
    if (onlyDigits(profile.postalCode).length !== 10) errors.postalCode = 'کدپستی باید ۱۰ رقم باشد.';
  }

  if (step === 3) {
    if (!profile.cooperationType) errors.cooperationType = 'نوع همکاری الزامی است.';
    if ((profile.registeredRole === 'Nurse' || profile.registeredRole === 'AssistantNurse') && !profile.nursingSystemNumber?.trim()) {
      errors.nursingSystemNumber = 'برای این نقش، شماره نظام پرستاری الزامی است.';
    }
    if (profile.experienceYears === undefined || profile.experienceYears < 0) errors.experienceYears = 'سابقه کار معتبر وارد کنید.';
    if (!profile.currentEmploymentStatus) errors.currentEmploymentStatus = 'وضعیت اشتغال را انتخاب کنید.';
    if (profile.shiftPreferences.length === 0) errors.shiftPreferences = 'حداقل یک نوع شیفت را انتخاب کنید.';
    if (!profile.serviceRadiusKm || profile.serviceRadiusKm < 1) errors.serviceRadiusKm = 'شعاع خدمت معتبر وارد کنید.';
    if (profile.serviceAreas.length === 0) errors.serviceAreas = 'حداقل یک شهر قابل پوشش ثبت کنید.';
  }

  if (step === 4) {
    if (profile.skills.length + profile.customSkills.length === 0) errors.skills = 'حداقل یک مهارت ثبت کنید.';
  }

  if (step === 5) {
    if (!profile.latestDegree) errors.latestDegree = 'مدرک تحصیلی الزامی است.';
    if (!profile.major?.trim()) errors.major = 'رشته الزامی است.';
    if (!profile.university?.trim()) errors.university = 'دانشگاه الزامی است.';
    if (!profile.graduationYear) errors.graduationYear = 'سال فارغ‌التحصیلی الزامی است.';
  }

  if (step === 6) {
    if (profile.certificates.length === 0) errors.certificates = 'حداقل یک دوره یا گواهینامه ثبت کنید.';
  }

  if (step === 7) {
    const requiredUploaded = CAREGIVER_DOCUMENT_TYPES.filter((item) => item.required).every((item) =>
      profile.documents.some((doc) => doc.documentType === item.id),
    );
    if (!requiredUploaded) errors.documents = 'همه مدارک الزامی را بارگذاری کنید.';
  }

  if (step === 9) {
    if (!profile.emergencyContactName?.trim()) errors.emergencyContactName = 'نام فرد نزدیک الزامی است.';
    if (!profile.emergencyContactRelationship?.trim()) errors.emergencyContactRelationship = 'نسبت را مشخص کنید.';
    if (onlyDigits(profile.emergencyContactMobile).length !== 11) errors.emergencyContactMobile = 'موبایل فرد نزدیک باید ۱۱ رقم باشد.';
    if (!profile.emergencyContactAddress?.trim()) errors.emergencyContactAddress = 'آدرس فرد نزدیک الزامی است.';
  }

  if (step === 10) {
    if (!profile.acceptCollaborationTerms) errors.acceptCollaborationTerms = 'تایید قوانین همکاری الزامی است.';
    if (!profile.acceptPatientConfidentiality) errors.acceptPatientConfidentiality = 'پذیرش محرمانگی اطلاعات بیماران الزامی است.';
    if (!profile.acceptProfessionalEthics) errors.acceptProfessionalEthics = 'پذیرش اخلاق حرفه‌ای الزامی است.';
    if (!profile.acceptDocumentReviewConsent) errors.acceptDocumentReviewConsent = 'رضایت بررسی مدارک الزامی است.';
  }

  return errors;
};

export default function CaregiverProfileWizard({ adminUserId }: Props) {
  const isAdminMode = Boolean(adminUserId);
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState<CaregiverProfileDto>(defaultProfile());
  const [errors, setErrors] = useState<StepErrors>({});
  const [customSkillInput, setCustomSkillInput] = useState('');
  const [coverageDraft, setCoverageDraft] = useState<CoverageAreaDto>({ province: '', city: '' });
  const [showSuccess, setShowSuccess] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [uploadingDocumentId, setUploadingDocumentId] = useState<string | null>(null);
  const autoSaveRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const profileQuery = useQuery({
    queryKey: ['caregiver-profile', adminUserId ?? 'me'],
    queryFn: () => (adminUserId ? caregiverProfileService.getUserProfile(adminUserId) : caregiverProfileService.getMyProfile()),
  });

  useEffect(() => {
    if (!profileQuery.data) return;

    const shouldSyncStepFromServer = !isInitialized;
    setForm({
      ...defaultProfile(),
      ...profileQuery.data,
      shiftPreferences: profileQuery.data.shiftPreferences ?? [],
      serviceAreas: profileQuery.data.serviceAreas ?? [],
      skills: profileQuery.data.skills ?? [],
      customSkills: profileQuery.data.customSkills ?? [],
      certificates: profileQuery.data.certificates ?? [],
      documents: profileQuery.data.documents ?? [],
      auditLogs: profileQuery.data.auditLogs ?? [],
    });
    if (shouldSyncStepFromServer) {
      setCurrentStep(Math.max(1, profileQuery.data.currentStep || 1));
    }
    setShowSuccess(profileQuery.data.isCompleted && profileQuery.data.currentStep >= 10);
    setIsDirty(false);
    setIsInitialized(true);
  }, [isInitialized, profileQuery.data]);

  const updateMutation = useMutation({
    mutationFn: (payload: UpdateCaregiverProfileDto) =>
      adminUserId ? caregiverProfileService.updateUserProfile(adminUserId, payload) : caregiverProfileService.updateMyProfile(payload),
    onSuccess: (response) => {
      queryClient.setQueryData(['caregiver-profile', adminUserId ?? 'me'], response);
      setForm((prev) => ({ ...prev, ...response }));
      setIsDirty(false);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.error ?? 'ذخیره تغییرات انجام نشد.');
    },
  });

  const completeMutation = useMutation({
    mutationFn: () =>
      adminUserId ? caregiverProfileService.forceCompleteUserProfile(adminUserId) : caregiverProfileService.completeMyProfile(),
    onSuccess: (response) => {
      queryClient.setQueryData(['caregiver-profile', adminUserId ?? 'me'], response);
      setForm((prev) => ({ ...prev, ...response }));
      setShowSuccess(true);
      setIsDirty(false);
      toast.success(adminUserId ? 'پروفایل توسط مدیریت نهایی شد.' : 'پروفایل شما با موفقیت ثبت شد.');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.error ?? 'ثبت نهایی انجام نشد.');
    },
  });

  useEffect(() => {
    if (!isInitialized || !isDirty) return;
    if (autoSaveRef.current) clearTimeout(autoSaveRef.current);

    autoSaveRef.current = setTimeout(() => {
      const payload: UpdateCaregiverProfileDto = {
        ...form,
        currentStep,
      };
      updateMutation.mutate(payload);
    }, 1200);

    return () => {
      if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    };
  }, [form, currentStep, isDirty, isInitialized]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isDirty) return;
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const completionBadgeTone = useMemo(() => {
    switch (form.employmentStatus) {
      case CaregiverEmploymentApprovalStatus.Approved:
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-900';
      case CaregiverEmploymentApprovalStatus.NeedsCorrection:
        return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-900';
      case CaregiverEmploymentApprovalStatus.Rejected:
        return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-300 dark:border-rose-900';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-700';
    }
  }, [form.employmentStatus]);

  const setField = <K extends keyof CaregiverProfileDto>(key: K, value: CaregiverProfileDto[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setIsDirty(true);
  };

  const handleSaveDraft = () => {
    updateMutation.mutate({ ...form, currentStep });
  };

  const handleNext = () => {
    const nextErrors = validateStep(currentStep, form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      toast.error('لطفاً خطاهای این مرحله را برطرف کنید.');
      return;
    }

    if (currentStep < 10) {
      setCurrentStep((prev) => prev + 1);
      updateMutation.mutate({ ...form, currentStep: currentStep + 1 });
    } else {
      completeMutation.mutate();
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const addCoverageArea = () => {
    if (!coverageDraft.province || !coverageDraft.city) {
      toast.error('استان و شهر قابل پوشش را انتخاب کنید.');
      return;
    }

    const exists = form.serviceAreas.some(
      (item) => item.province === coverageDraft.province && item.city === coverageDraft.city,
    );
    if (exists) return;

    setField('serviceAreas', [...form.serviceAreas, coverageDraft]);
    setCoverageDraft({ province: '', city: '' });
  };

  const addCustomSkill = () => {
    if (!customSkillInput.trim()) return;
    if (form.customSkills.includes(customSkillInput.trim())) return;
    setField('customSkills', [...form.customSkills, customSkillInput.trim()]);
    setCustomSkillInput('');
  };

  const updateCertificate = (index: number, patch: Partial<CourseCertificateDto>) => {
    const next = [...form.certificates];
    next[index] = { ...next[index], ...patch };
    setField('certificates', next);
  };

  const uploadDocument = async (documentType: string, file: File) => {
    try {
      setUploadingDocumentId(documentType);
      const document = adminUserId
        ? await caregiverProfileService.uploadUserDocument(adminUserId, documentType, file)
        : await caregiverProfileService.uploadMyDocument(documentType, file);

      const nextDocuments = [
        ...form.documents.filter((item) => item.documentType !== documentType),
        document,
      ].sort((a, b) => a.documentType.localeCompare(b.documentType, 'fa'));

      setField('documents', nextDocuments);
      toast.success('مدرک با موفقیت بارگذاری شد.');
    } catch (error: any) {
      toast.error(error?.response?.data?.error ?? 'بارگذاری فایل انجام نشد.');
    } finally {
      setUploadingDocumentId(null);
    }
  };

  const updateDocumentStatus = async (documentId: number, payload: UpdateCaregiverDocumentStatusDto) => {
    if (!adminUserId) return;
    try {
      const updatedDocument = await caregiverProfileService.updateDocumentStatus(adminUserId, documentId, payload);
      const nextDocuments = form.documents.map((item) => (item.id === documentId ? updatedDocument : item));
      setForm((prev) => ({ ...prev, documents: nextDocuments }));
      toast.success('وضعیت مدرک به‌روزرسانی شد.');
    } catch (error: any) {
      toast.error(error?.response?.data?.error ?? 'به‌روزرسانی وضعیت مدرک انجام نشد.');
    }
  };

  if (profileQuery.isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    );
  }

  if (showSuccess) {
    return (
      <div className="mx-auto max-w-3xl">
        <div className="rounded-[32px] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-8 text-center shadow-sm dark:border-emerald-900 dark:from-emerald-950/30 dark:to-gray-900">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
            <Sparkles className="h-8 w-8" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white">پروفایل شما ثبت شد</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
            اطلاعات استخدامی شما با موفقیت ثبت شد و اکنون در انتظار تایید مدیریت است.
          </p>
          <div className="mx-auto mt-6 max-w-md rounded-2xl border border-slate-200 bg-white/80 p-4 text-right dark:border-slate-800 dark:bg-slate-950/50">
            <InfoRow label="درصد تکمیل" value={`${form.completionPercentage}%`} />
            <InfoRow label="وضعیت استخدام" value={form.employmentStatusLabel} />
            <InfoRow label="آخرین به‌روزرسانی" value={form.lastUpdatedAt ? new Date(form.lastUpdatedAt).toLocaleString('fa-IR') : '-'} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl">
      <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="rounded-[28px] border border-slate-200 bg-white/90 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-teal-600 dark:text-teal-400">HR Onboarding</div>
              <h1 className="mt-1 text-xl font-black text-slate-900 dark:text-white">تکمیل پروفایل استخدامی</h1>
            </div>
            <Badge className={cn('border', completionBadgeTone)}>{form.employmentStatusLabel}</Badge>
          </div>
          <Progress value={form.completionPercentage} className="h-2.5 bg-slate-100 dark:bg-slate-800" />
          <div className="mt-2 text-xs font-bold text-slate-500 dark:text-slate-400">
            {form.completionPercentage}% تکمیل شده
          </div>
          <div className="mt-6 space-y-2">
            {stepTitles.map((step, index) => {
              const stepNumber = index + 1;
              const isActive = stepNumber === currentStep;
              const isDone = stepNumber < currentStep || (stepNumber === 10 && form.isCompleted);
              return (
                <button
                  key={step}
                  type="button"
                  onClick={() => setCurrentStep(stepNumber)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-right transition-all',
                    isActive
                      ? 'border-teal-200 bg-teal-50 text-teal-800 dark:border-teal-900 dark:bg-teal-950/30 dark:text-teal-200'
                      : 'border-transparent bg-slate-50 text-slate-600 hover:bg-slate-100 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:bg-slate-800',
                  )}
                >
                  <div
                    className={cn(
                      'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-black',
                      isDone
                        ? 'bg-emerald-600 text-white'
                        : isActive
                          ? 'bg-teal-600 text-white'
                          : 'bg-white text-slate-500 dark:bg-slate-900 dark:text-slate-300',
                    )}
                  >
                    {isDone ? <CheckCircle2 className="h-4 w-4" /> : stepNumber}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-bold">{step}</div>
                    <div className="text-[11px] text-slate-400 dark:text-slate-500">مرحله {stepNumber}</div>
                  </div>
                </button>
              );
            })}
          </div>
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs leading-6 text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
            برای فعال شدن حساب کاربری و شروع همکاری، لطفاً اطلاعات استخدامی خود را تکمیل کنید.
            تا زمان تکمیل اطلاعات و تایید مدارک توسط مدیریت، برخی امکانات پنل محدود خواهد بود.
          </div>
        </aside>

        <section className="rounded-[30px] border border-slate-200 bg-white/95 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/95 sm:p-6 lg:p-8">
          <div className="mb-6 flex flex-col gap-4 border-b border-slate-200 pb-5 dark:border-slate-800 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="text-xs font-bold text-slate-500 dark:text-slate-400">مرحله {currentStep} از 10</div>
              <h2 className="mt-1 text-2xl font-black text-slate-900 dark:text-white">{stepTitles[currentStep - 1]}</h2>
              <p className="mt-2 text-sm leading-7 text-slate-500 dark:text-slate-400">
                اطلاعات این مرحله به‌صورت خودکار ذخیره می‌شود و در ورود بعدی از همین مرحله ادامه پیدا می‌کند.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" onClick={handleSaveDraft} disabled={updateMutation.isPending || completeMutation.isPending}>
                {updateMutation.isPending ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Save className="ml-2 h-4 w-4" />}
                ذخیره 
              </Button>
              {isAdminMode && (
                <Button variant="secondary" onClick={() => completeMutation.mutate()} disabled={completeMutation.isPending}>
                  <ShieldCheck className="ml-2 h-4 w-4" />
                  Force Complete
                </Button>
              )}
            </div>
          </div>

          {currentStep === 1 && (
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="نام" error={errors.firstName}><Input value={form.firstName ?? ''} onChange={(value) => setField('firstName', value)} /></Field>
              <Field label="نام خانوادگی" error={errors.lastName}><Input value={form.lastName ?? ''} onChange={(value) => setField('lastName', value)} /></Field>
              <Field label="نام پدر" error={errors.fatherName}><Input value={form.fatherName ?? ''} onChange={(value) => setField('fatherName', value)} /></Field>
              <Field label="کد ملی" error={errors.nationalCode}><Input value={form.nationalCode ?? ''} onChange={(value) => setField('nationalCode', onlyDigits(value))} maxLength={10} /></Field>
              <Field label="شماره شناسنامه" error={errors.birthCertificateNumber}><Input value={form.birthCertificateNumber ?? ''} onChange={(value) => setField('birthCertificateNumber', value)} /></Field>
              <Field label="تاریخ تولد" error={errors.dateOfBirth}>
                <DatePicker
                  value={parseDateForPicker(form.dateOfBirth)}
                  onChange={(value) => setField('dateOfBirth', toIsoDate(value))}
                  calendar={persian}
                  locale={persian_fa}
                  calendarPosition="bottom-right"
                  inputClass="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-950"
                />
              </Field>
              <Field label="محل تولد" error={errors.birthPlace}><Input value={form.birthPlace ?? ''} onChange={(value) => setField('birthPlace', value)} /></Field>
              <Field label="جنسیت" error={errors.gender}><Select value={form.gender ?? ''} options={genderOptions} onChange={(value) => setField('gender', value)} /></Field>
              <Field label="وضعیت تاهل" error={errors.maritalStatus}><Select value={form.maritalStatus ?? ''} options={maritalOptions} onChange={(value) => setField('maritalStatus', value)} /></Field>
              <Field label="تعداد فرزند"><Input type="number" value={String(form.childrenCount ?? '')} onChange={(value) => setField('childrenCount', value ? Number(value) : undefined)} /></Field>
              <Field label="تابعیت" error={errors.nationality}><Input value={form.nationality ?? ''} onChange={(value) => setField('nationality', value)} /></Field>
            </div>
          )}

          {currentStep === 2 && (
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="موبایل ثبت‌نامی">
                <Input value={form.mobileNumber ?? ''} onChange={() => undefined} disabled />
              </Field>
              <Field label="تلفن ثابت"><Input value={form.landlinePhone ?? ''} onChange={(value) => setField('landlinePhone', value)} /></Field>
              <Field label="ایمیل"><Input value={form.email ?? ''} onChange={(value) => setField('email', value)} /></Field>
              <Field label="کدپستی" error={errors.postalCode}><Input value={form.postalCode ?? ''} onChange={(value) => setField('postalCode', onlyDigits(value))} maxLength={10} /></Field>
              <Field label="استان" error={errors.province}>
                <Select value={form.province ?? ''} options={iranProvinces.map((item) => item.name)} onChange={(value) => { setField('province', value); setField('city', ''); }} />
              </Field>
              <Field label="شهر" error={errors.city}>
                <Select value={form.city ?? ''} options={getCitiesByProvince(form.province)} onChange={(value) => setField('city', value)} />
              </Field>
              <Field className="md:col-span-2" label="آدرس کامل" error={errors.fullAddress}>
                <TextArea value={form.fullAddress ?? ''} onChange={(value) => setField('fullAddress', value)} rows={4} />
              </Field>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="نوع همکاری" error={errors.cooperationType}>
                  <Input value={form.cooperationType ?? form.registeredRole ?? ''} onChange={() => undefined} disabled />
                </Field>
                <Field label="شماره نظام پرستاری" error={errors.nursingSystemNumber}>
                  <Input value={form.nursingSystemNumber ?? ''} onChange={(value) => setField('nursingSystemNumber', value)} />
                </Field>
                <Field label="سابقه کار (سال)" error={errors.experienceYears}>
                  <Input type="number" value={String(form.experienceYears ?? '')} onChange={(value) => setField('experienceYears', value ? Number(value) : undefined)} />
                </Field>
                <Field label="آخرین محل کار"><Input value={form.lastWorkplace ?? ''} onChange={(value) => setField('lastWorkplace', value)} /></Field>
                <Field label="وضعیت اشتغال فعلی" error={errors.currentEmploymentStatus}>
                  <Select value={form.currentEmploymentStatus ?? ''} options={employmentOptions} onChange={(value) => setField('currentEmploymentStatus', value)} />
                </Field>
                <Field label="وسیله نقلیه">
                  <Select value={form.vehicleType ?? ''} options={vehicleOptions} onChange={(value) => setField('vehicleType', value)} />
                </Field>
                <Field label="شعاع خدمت (کیلومتر)" error={errors.serviceRadiusKm}>
                  <Input type="number" value={String(form.serviceRadiusKm ?? '')} onChange={(value) => setField('serviceRadiusKm', value ? Number(value) : undefined)} />
                </Field>
              </div>
              <ToggleGroup
                label="امکان شیفت"
                error={errors.shiftPreferences}
                options={shiftOptions}
                values={form.shiftPreferences}
                onToggle={(value) =>
                  setField(
                    'shiftPreferences',
                    form.shiftPreferences.includes(value)
                      ? form.shiftPreferences.filter((item) => item !== value)
                      : [...form.shiftPreferences, value],
                  )
                }
              />
              <div className="grid gap-4 md:grid-cols-2">
                <CheckRow label="امکان اقامت در منزل بیمار" checked={form.canStayAtPatientHome} onChange={(value) => setField('canStayAtPatientHome', value)} />
                {/* <CheckRow label="دارای گواهینامه" checked={form.hasDrivingLicense} onChange={(value) => setField('hasDrivingLicense', value)} /> */}
              </div>
              <div className="rounded-3xl border border-slate-200 p-4 dark:border-slate-800">
                <div className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-200">
                  <MapPin className="h-4 w-4" />
                  مناطق قابل پوشش
                </div>
                <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
                  <Select value={coverageDraft.province} options={iranProvinces.map((item) => item.name)} onChange={(value) => setCoverageDraft({ province: value, city: '' })} />
                  <Select value={coverageDraft.city} options={getCitiesByProvince(coverageDraft.province)} onChange={(value) => setCoverageDraft((prev) => ({ ...prev, city: value }))} />
                  <Button onClick={addCoverageArea}>افزودن</Button>
                </div>
                {errors.serviceAreas && <ErrorText>{errors.serviceAreas}</ErrorText>}
                <div className="mt-3 flex flex-wrap gap-2">
                  {form.serviceAreas.map((item) => (
                    <Badge key={`${item.province}-${item.city}`} variant="outline" className="cursor-pointer" onClick={() => setField('serviceAreas', form.serviceAreas.filter((area) => !(area.province === item.province && area.city === item.city)))}>
                      {item.province} - {item.city}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-5">
              <ToggleGroup
                label="مهارت‌های تخصصی"
                error={errors.skills}
                options={skillOptions}
                values={form.skills}
                onToggle={(value) =>
                  setField(
                    'skills',
                    form.skills.includes(value) ? form.skills.filter((item) => item !== value) : [...form.skills, value],
                  )
                }
              />
              <div className="rounded-3xl border border-slate-200 p-4 dark:border-slate-800">
                <div className="mb-3 text-sm font-bold text-slate-800 dark:text-slate-200">سایر مهارت‌ها</div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Input value={customSkillInput} onChange={setCustomSkillInput} placeholder="مثلاً تزریقات کودکان" />
                  <Button onClick={addCustomSkill}>افزودن</Button>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {form.customSkills.map((skill) => (
                    <Badge key={skill} variant="outline" className="cursor-pointer" onClick={() => setField('customSkills', form.customSkills.filter((item) => item !== skill))}>
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="آخرین مدرک" error={errors.latestDegree}><Select value={form.latestDegree ?? ''} options={degreeOptions} onChange={(value) => setField('latestDegree', value)} /></Field>
              <Field label="رشته" error={errors.major}><Input value={form.major ?? ''} onChange={(value) => setField('major', value)} /></Field>
              <Field label="دانشگاه" error={errors.university}><Input value={form.university ?? ''} onChange={(value) => setField('university', value)} /></Field>
              <Field label="سال فارغ‌التحصیلی" error={errors.graduationYear}><Input type="number" value={String(form.graduationYear ?? '')} onChange={(value) => setField('graduationYear', value ? Number(value) : undefined)} /></Field>
              <Field label="معدل"><Input type="number" value={String(form.gpa ?? '')} onChange={(value) => setField('gpa', value ? Number(value) : undefined)} /></Field>
            </div>
          )}

          {currentStep === 6 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-bold text-slate-700 dark:text-slate-200">لیست دوره‌ها و گواهینامه‌ها</div>
                <Button onClick={() => setField('certificates', [...form.certificates, { title: '', organizer: '' }])}>افزودن دوره</Button>
              </div>
              {errors.certificates && <ErrorText>{errors.certificates}</ErrorText>}
              {form.certificates.map((certificate, index) => (
                <div key={`certificate-${index}`} className="grid gap-4 rounded-3xl border border-slate-200 p-4 dark:border-slate-800 md:grid-cols-2">
                  <Field label="عنوان دوره">
                    <Input value={certificate.title} onChange={(value) => updateCertificate(index, { title: value })} />
                  </Field>
                  <Field label="برگزارکننده">
                    <Input value={certificate.organizer} onChange={(value) => updateCertificate(index, { organizer: value })} />
                  </Field>
                  <Field label="تاریخ">
                    <DatePicker
                      value={parseDateForPicker(certificate.date)}
                      onChange={(value) => updateCertificate(index, { date: toIsoDate(value) })}
                      calendar={persian}
                      locale={persian_fa}
                      inputClass="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-950"
                    />
                  </Field>
                  <div className="md:col-span-2">
                    <button className="text-sm font-bold text-rose-600" onClick={() => setField('certificates', form.certificates.filter((_, itemIndex) => itemIndex !== index))}>
                      حذف این مورد
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {currentStep === 7 && (
            <div className="space-y-4">
              {errors.documents && <ErrorText>{errors.documents}</ErrorText>}
              <div className="grid gap-4 lg:grid-cols-2">
                {CAREGIVER_DOCUMENT_TYPES.map((documentType) => {
                  const uploaded = form.documents.find((item) => item.documentType === documentType.id);
                  return (
                    <DocumentCard
                      key={documentType.id}
                      documentType={documentType.label}
                      document={uploaded}
                      required={documentType.required}
                      uploading={uploadingDocumentId === documentType.id}
                      onUpload={(file) => uploadDocument(documentType.id, file)}
                      onReview={updateDocumentStatus}
                      isAdmin={isAdminMode}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {currentStep === 8 && (
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="بانک"><Input value={form.bankName ?? ''} onChange={(value) => setField('bankName', value)} /></Field>
              <Field label="شماره حساب"><Input value={form.accountNumber ?? ''} onChange={(value) => setField('accountNumber', onlyDigits(value))} /></Field>
              <Field label="شماره کارت"><Input value={form.cardNumber ?? ''} onChange={(value) => setField('cardNumber', onlyDigits(value))} /></Field>
              <Field label="شبا"><Input value={form.iban ?? ''} onChange={(value) => setField('iban', value)} /></Field>
            </div>
          )}

          {currentStep === 9 && (
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="نام" error={errors.emergencyContactName}><Input value={form.emergencyContactName ?? ''} onChange={(value) => setField('emergencyContactName', value)} /></Field>
              <Field label="نسبت" error={errors.emergencyContactRelationship}><Select value={form.emergencyContactRelationship ?? ''} options={relationshipOptions} onChange={(value) => setField('emergencyContactRelationship', value)} /></Field>
              <Field label="موبایل" error={errors.emergencyContactMobile}><Input value={form.emergencyContactMobile ?? ''} onChange={(value) => setField('emergencyContactMobile', onlyDigits(value))} /></Field>
              <Field label="تلفن"><Input value={form.emergencyContactPhone ?? ''} onChange={(value) => setField('emergencyContactPhone', onlyDigits(value))} /></Field>
              <Field className="md:col-span-2" label="آدرس" error={errors.emergencyContactAddress}><TextArea value={form.emergencyContactAddress ?? ''} onChange={(value) => setField('emergencyContactAddress', value)} rows={4} /></Field>
            </div>
          )}

          {currentStep === 10 && (
            <div className="space-y-4">
              <CheckRow label="قوانین همکاری را مطالعه و تایید می‌کنم." checked={form.acceptCollaborationTerms} onChange={(value) => setField('acceptCollaborationTerms', value)} error={errors.acceptCollaborationTerms} />
              <CheckRow label="محرمانگی اطلاعات بیماران را رعایت می‌کنم." checked={form.acceptPatientConfidentiality} onChange={(value) => setField('acceptPatientConfidentiality', value)} error={errors.acceptPatientConfidentiality} />
              <CheckRow label="به اصول اخلاق حرفه‌ای پایبند هستم." checked={form.acceptProfessionalEthics} onChange={(value) => setField('acceptProfessionalEthics', value)} error={errors.acceptProfessionalEthics} />
              <CheckRow label="با بررسی و راستی‌آزمایی مدارک توسط مدیریت موافقم." checked={form.acceptDocumentReviewConsent} onChange={(value) => setField('acceptDocumentReviewConsent', value)} error={errors.acceptDocumentReviewConsent} />
            </div>
          )}

          <div className="mt-8 flex flex-col gap-3 border-t border-slate-200 pt-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <Clock3 className="h-4 w-4" />
              ذخیره خودکار فعال است
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 1}>
                <ArrowRight className="ml-2 h-4 w-4" />
                مرحله قبل
              </Button>
              <Button onClick={handleNext} disabled={updateMutation.isPending || completeMutation.isPending}>
                {currentStep === 10 ? 'ثبت نهایی' : 'مرحله بعد'}
                <ArrowLeft className="mr-2 h-4 w-4" />
              </Button>
            </div>
          </div>

          {isAdminMode && form.auditLogs.length > 0 && (
            <div className="mt-8 rounded-[28px] border border-slate-200 bg-slate-50/70 p-5 dark:border-slate-800 dark:bg-slate-950/40">
              <div className="mb-4 text-sm font-black text-slate-800 dark:text-slate-100">
                Audit Log
              </div>
              <div className="space-y-3">
                {form.auditLogs.slice(0, 6).map((log) => (
                  <div key={log.id} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="font-bold text-slate-800 dark:text-slate-100">{log.action}</div>
                      <div className="text-xs text-slate-400">{new Date(log.createdAt).toLocaleString('fa-IR')}</div>
                    </div>
                    <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{log.performedBy}</div>
                    {log.details && <div className="mt-2 text-xs leading-6 text-slate-600 dark:text-slate-300">{log.details}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function Field({
  label,
  error,
  children,
  className,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200">{label}</label>
      {children}
      {error && <ErrorText>{error}</ErrorText>}
    </div>
  );
}

function Input({
  value,
  onChange,
  className,
  ...props
}: Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> & { value: string; onChange: (value: string) => void }) {
  return (
    <input
      {...props}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className={cn('w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-teal-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white', className)}
    />
  );
}

function TextArea({
  value,
  onChange,
  className,
  ...props
}: Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'value' | 'onChange'> & { value: string; onChange: (value: string) => void }) {
  return (
    <textarea
      {...props}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className={cn('w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-teal-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white', className)}
    />
  );
}

function Select({
  value,
  options,
  onChange,
}: {
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-teal-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
    >
      <option value="">انتخاب کنید</option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}

function ToggleGroup({
  label,
  options,
  values,
  onToggle,
  error,
}: {
  label: string;
  options: string[];
  values: string[];
  onToggle: (value: string) => void;
  error?: string;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 p-4 dark:border-slate-800">
      <div className="mb-3 text-sm font-bold text-slate-800 dark:text-slate-100">{label}</div>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onToggle(option)}
            className={cn(
              'rounded-full border px-4 py-2 text-sm transition',
              values.includes(option)
                ? 'border-teal-600 bg-teal-600 text-white'
                : 'border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300',
            )}
          >
            {option}
          </button>
        ))}
      </div>
      {error && <ErrorText>{error}</ErrorText>}
    </div>
  );
}

function CheckRow({
  label,
  checked,
  onChange,
  error,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  error?: string;
}) {
  return (
    <label className="block rounded-3xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
      <div className="flex items-center gap-3">
        <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="h-5 w-5 rounded border-slate-300 text-teal-600 focus:ring-teal-500" />
        <span className="text-sm font-medium text-slate-800 dark:text-slate-100">{label}</span>
      </div>
      {error && <ErrorText>{error}</ErrorText>}
    </label>
  );
}

function ErrorText({ children }: { children: React.ReactNode }) {
  return <div className="mt-2 text-xs font-bold text-rose-600 dark:text-rose-400">{children}</div>;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2 text-sm">
      <span className="text-slate-500 dark:text-slate-400">{label}</span>
      <span className="font-bold text-slate-900 dark:text-slate-100">{value}</span>
    </div>
  );
}

function DocumentCard({
  documentType,
  document,
  required,
  uploading,
  onUpload,
  onReview,
  isAdmin,
}: {
  documentType: string;
  document?: CaregiverProfileDocumentDto;
  required: boolean;
  uploading: boolean;
  onUpload: (file: File) => void;
  onReview: (documentId: number, payload: UpdateCaregiverDocumentStatusDto) => Promise<void>;
  isAdmin: boolean;
}) {
  const [reviewNote, setReviewNote] = useState(document?.reviewNote ?? '');
  const [expireAt, setExpireAt] = useState(document?.expireAt ?? '');

  useEffect(() => {
    setReviewNote(document?.reviewNote ?? '');
    setExpireAt(document?.expireAt ?? '');
  }, [document?.reviewNote, document?.expireAt]);

  return (
    <div className="rounded-[28px] border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-950/40">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-black text-slate-900 dark:text-white">{documentType}</div>
          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{required ? 'الزامی' : 'اختیاری'}</div>
        </div>
        <Badge className={cn('border', getDocumentStatusTone(document?.status))}>
          {document?.statusLabel ?? 'آپلود نشده'}
        </Badge>
      </div>

      {document ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-3 text-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-200">
            <FileCheck2 className="h-4 w-4" />
            {document.fileName}
          </div>
          <div className="mt-2 text-slate-500 dark:text-slate-400">{new Date(document.uploadedAt).toLocaleString('fa-IR')}</div>
          {document.reviewNote && (
            <div className="mt-3 rounded-2xl bg-amber-50 px-3 py-2 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300">
              {document.reviewNote}
            </div>
          )}
          <a href={resolveApiUrl(document.fileUrl)} target="_blank" rel="noreferrer" className="mt-3 inline-flex text-teal-700 dark:text-teal-300">
            مشاهده فایل
          </a>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-4 text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-400">
          هنوز فایلی بارگذاری نشده است.
        </div>
      )}

      <label className="mt-4 flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-bold text-teal-700 transition hover:bg-teal-100 dark:border-teal-900 dark:bg-teal-950/30 dark:text-teal-300">
        {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
        {document ? 'آپلود مجدد' : 'آپلود فایل'}
        <input
          type="file"
          accept={CAREGIVER_DOCUMENT_ACCEPT}
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            onUpload(file);
            event.target.value = '';
          }}
        />
      </label>

      {isAdmin && document && (
        <div className="mt-4 space-y-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400">مدیریت بررسی مدرک</div>
          <div className="grid gap-3">
            <select
              defaultValue={String(document.status)}
              onChange={(event) => {
                void onReview(document.id, {
                  status: Number(event.target.value) as CaregiverProfileDocumentStatus,
                  reviewNote,
                  expireAt: expireAt || undefined,
                });
              }}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-950"
            >
              <option value={CaregiverProfileDocumentStatus.PendingReview}>در انتظار بررسی</option>
              <option value={CaregiverProfileDocumentStatus.Approved}>تایید شد</option>
              <option value={CaregiverProfileDocumentStatus.NeedsCorrection}>نیاز به اصلاح</option>
              <option value={CaregiverProfileDocumentStatus.Rejected}>رد شد</option>
            </select>
            <TextArea value={reviewNote} onChange={setReviewNote} rows={3} placeholder="دلیل رد یا توضیح اصلاح..." />
            <Input type="datetime-local" value={expireAt ? expireAt.slice(0, 16) : ''} onChange={(value) => setExpireAt(value)} />
            <Button onClick={() => void onReview(document.id, { status: document.status, reviewNote, expireAt: expireAt || undefined })}>
              ثبت توضیحات
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
