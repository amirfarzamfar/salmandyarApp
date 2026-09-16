import api from '@/lib/axios';
import { AssessmentForm, AssessmentFormWorkflow, AssessmentType, Question, QuestionType } from '@/types/assessment';

const buildMcqOptions = (items: string[]): Question['options'] =>
  items.map((text, idx) => ({ id: idx + 1, text, value: idx + 1, order: idx }));

const GUEST_SERVICE_REQUEST_FALLBACK: AssessmentForm = {
  id: -1,
  code: 'guest-service-request-v1',
  title: 'ویزارد ثبت درخواست بدون ثبت‌نام',
  description: 'ثبت سریع درخواست خدمت بدون نیاز به ساخت حساب کاربری',
  type: AssessmentType.PatientFamily,
  targetTypes: [AssessmentType.PatientFamily],
  isActive: true,
  workflow: AssessmentFormWorkflow.GuestServiceRequest,
  version: 1,
  isDefault: true,
  serviceDefinitionId: undefined,
  introTitle: 'ثبت درخواست بدون ثبت‌نام',
  introDescription: 'چند سؤال کوتاه و ضروری؛ در کمتر از یک دقیقه.',
  estimatedDurationMinutes: 1,
  questions: [
    {
      questionId: 1,
      type: QuestionType.MultipleChoice,
      question: 'نوع خدمت موردنظر چیست؟',
      options: buildMcqOptions([
        'پرستار',
        'مراقب سالمند',
        'مراقب کودک',
        'تزریقات',
        'پانسمان',
        'سرم',
        'مراقبت بعد از جراحی',
        'ویزیت',
        'سایر',
      ]),
      weight: 1,
      tags: ['service_type'],
      order: 0,
      questionKey: 'service_type',
      pageKey: 'service',
      pageTitle: 'نوع خدمت',
      isRequired: true,
    },
    {
      questionId: 2,
      type: QuestionType.MultipleChoice,
      question: 'خدمت برای چه کسی است؟',
      options: buildMcqOptions(['خودم', 'پدر', 'مادر', 'همسر', 'فرزند', 'سایر']),
      weight: 1,
      tags: [],
      order: 1,
      questionKey: 'recipient_relationship',
      pageKey: 'recipient',
      pageTitle: 'برای چه کسی',
      isRequired: true,
    },
    {
      questionId: 3,
      type: QuestionType.MultipleChoice,
      question: 'وضعیت کلی فرد چگونه است؟',
      options: buildMcqOptions(['خوب', 'نیاز به کمک در راه رفتن', 'بستری در منزل', 'مراقبت ویژه']),
      weight: 1,
      tags: [],
      order: 2,
      questionKey: 'recipient_status',
      pageKey: 'recipient',
      pageTitle: 'وضعیت کلی',
      isRequired: true,
    },
    {
      questionId: 4,
      type: QuestionType.MultipleChoice,
      question: 'میزان فوریت چقدر است؟',
      options: buildMcqOptions(['همین امروز', 'تا فردا', 'این هفته', 'زمان دلخواه']),
      weight: 1,
      tags: ['urgency'],
      order: 3,
      questionKey: 'urgency',
      pageKey: 'priority',
      pageTitle: 'فوریت',
      isRequired: true,
    },
    {
      questionId: 5,
      type: QuestionType.MultipleChoice,
      question: 'مدت تقریبی خدمت چقدر است؟',
      options: buildMcqOptions(['یک بار', 'چند روز', 'یک هفته', 'بلندمدت']),
      weight: 1,
      tags: [],
      order: 4,
      questionKey: 'duration',
      pageKey: 'priority',
      pageTitle: 'مدت خدمت',
      isRequired: true,
    },
    {
      questionId: 6,
      type: QuestionType.ShortAnswer,
      question: 'شهر یا محل ارائه خدمت را وارد کنید',
      options: [],
      weight: 1,
      tags: ['city'],
      order: 5,
      questionKey: 'city',
      pageKey: 'location',
      pageTitle: 'شهر',
      isRequired: true,
      placeholder: 'مثال: تهران، کرج...',
    },
    {
      questionId: 7,
      type: QuestionType.LongAnswer,
      question: 'توضیح کوتاه (اختیاری)',
      options: [],
      weight: 1,
      tags: [],
      order: 6,
      questionKey: 'short_description',
      pageKey: 'details',
      pageTitle: 'توضیحات',
      isRequired: false,
      placeholder: 'اگر نکته‌ای هست، کوتاه بنویسید...',
    },
    {
      questionId: 8,
      type: QuestionType.ShortAnswer,
      question: 'نام',
      options: [],
      weight: 1,
      tags: ['contact_first_name'],
      order: 7,
      questionKey: 'contact_first_name',
      pageKey: 'contact',
      pageTitle: 'اطلاعات تماس',
      isRequired: true,
      placeholder: 'نام',
    },
    {
      questionId: 9,
      type: QuestionType.ShortAnswer,
      question: 'نام خانوادگی',
      options: [],
      weight: 1,
      tags: ['contact_last_name'],
      order: 8,
      questionKey: 'contact_last_name',
      pageKey: 'contact',
      pageTitle: 'اطلاعات تماس',
      isRequired: true,
      placeholder: 'نام خانوادگی',
    },
    {
      questionId: 10,
      type: QuestionType.ShortAnswer,
      question: 'شماره موبایل',
      options: [],
      weight: 1,
      tags: ['contact_mobile'],
      order: 9,
      questionKey: 'contact_mobile',
      pageKey: 'contact',
      pageTitle: 'اطلاعات تماس',
      isRequired: true,
      placeholder: 'مثال: 09120000000',
    },
    {
      questionId: 11,
      type: QuestionType.ShortAnswer,
      question: 'تلفن ثابت (اختیاری)',
      options: [],
      weight: 1,
      tags: [],
      order: 10,
      questionKey: 'contact_phone',
      pageKey: 'contact',
      pageTitle: 'اطلاعات تماس',
      isRequired: false,
      placeholder: 'مثال: 02100000000',
    },
  ],
};

export const publicFormsService = {
  getGuestServiceRequestForm: async (params?: { serviceDefinitionId?: number; code?: string }): Promise<AssessmentForm> => {
    try {
      const response = await api.get<AssessmentForm>('/public/forms/guest-service-request', { params });
      if (response?.data) return response.data;
    } catch (err: any) {
      const status = err?.response?.status;
      if (typeof window !== 'undefined') {
        console.warn(
          `[publicFormsService] Fallback به فرم پیش‌فرض در حال استفاده است (API Status: ${status ?? 'NetworkError'}).`,
        );
      }
    }
    const fallbackServiceDefinitionId = params?.serviceDefinitionId;
    return {
      ...GUEST_SERVICE_REQUEST_FALLBACK,
      serviceDefinitionId: fallbackServiceDefinitionId,
    };
  },

  listPublicHealthTests: async (): Promise<AssessmentForm[]> => {
    try {
      const response = await api.get<AssessmentForm[]>('/public/forms/health-tests');
      return Array.isArray(response.data) ? response.data : [];
    } catch {
      return [];
    }
  },

  getPublicHealthTestByCode: async (code: string): Promise<AssessmentForm | undefined> => {
    try {
      const response = await api.get<AssessmentForm>(`/public/forms/health-tests/${encodeURIComponent(code)}`);
      return response.data || undefined;
    } catch {
      return undefined;
    }
  },
};
