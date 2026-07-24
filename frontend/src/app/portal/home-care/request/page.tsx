'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import DatePicker from 'react-multi-date-picker';
import DateObject from 'react-date-object';
import persian from 'react-date-object/calendars/persian';
import persian_fa from 'react-date-object/locales/persian_fa';
import { assessmentService } from '@/services/assessment.service';
import { homeCareService } from '@/services/home-care.service';
import { serviceCatalogService } from '@/services/service-catalog.service';
import { AssessmentAnswerDto, AssessmentForm, Question, QuestionType } from '@/types/assessment';
import { HomeCareContactMethod, SaveHomeCareDraftDto } from '@/types/home-care';
import { ServiceCategory, ServiceDefinition } from '@/types/service';
import { ArrowLeft, ArrowRight, FileUp, Loader2, Save, Sparkles } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { PageHeader } from '@/components/navigation/PageHeader';

type FileAnswerState = Record<number, File[]>;

interface QuestionPage {
  key: string;
  title: string;
  description?: string;
  questions: Question[];
}

const serviceCategoryLabels: Record<ServiceCategory, string> = {
  [ServiceCategory.Nursing]: 'پرستاری',
  [ServiceCategory.Medical]: 'پزشکی',
  [ServiceCategory.Rehabilitation]: 'توانبخشی',
  [ServiceCategory.PersonalCare]: 'مراقبت شخصی',
  [ServiceCategory.Emergency]: 'اورژانس',
  [ServiceCategory.Other]: 'سایر',
};

const CONTACT_METHOD_VALUES: Record<string, HomeCareContactMethod> = {
  تماس: HomeCareContactMethod.PhoneCall,
  phone: HomeCareContactMethod.PhoneCall,
  whatsapp: HomeCareContactMethod.WhatsApp,
  واتساپ: HomeCareContactMethod.WhatsApp,
  sms: HomeCareContactMethod.Sms,
  پیامک: HomeCareContactMethod.Sms,
  chat: HomeCareContactMethod.InAppChat,
  'چت داخل برنامه': HomeCareContactMethod.InAppChat,
};

const getDraftStorageKey = (serviceId: number) => `home-care-request-draft-${serviceId}`;

export default function HomeCareRequestWizardPage() {
  const router = useRouter();
  const [services, setServices] = useState<ServiceDefinition[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [selectedService, setSelectedService] = useState<ServiceDefinition | null>(null);
  const [form, setForm] = useState<AssessmentForm | null>(null);
  const [loadingForm, setLoadingForm] = useState(false);
  const [answers, setAnswers] = useState<Record<number, AssessmentAnswerDto>>({});
  const [fileAnswers, setFileAnswers] = useState<FileAnswerState>({});
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [draftMeta, setDraftMeta] = useState<{ submissionId?: number; draftKey?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadServices = async () => {
      try {
        const data = await serviceCatalogService.getAll();
        setServices(data.filter((service) => service.isActive && !!service.defaultFormId));
      } catch (error) {
        console.error(error);
        toast.error('دریافت لیست خدمات با مشکل مواجه شد');
      } finally {
        setLoadingServices(false);
      }
    };

    void loadServices();
  }, []);

  const pages = useMemo<QuestionPage[]>(() => {
    if (!form) {
      return [];
    }

    const map = new Map<string, QuestionPage>();
    const orderedQuestions = [...form.questions].sort((a, b) => a.order - b.order);

    orderedQuestions.forEach((question, index) => {
      const pageKey = question.pageKey || `page-${Math.floor(index / 4) + 1}`;
      const pageTitle = question.pageTitle || `مرحله ${Math.floor(index / 4) + 1}`;
      if (!map.has(pageKey)) {
        map.set(pageKey, {
          key: pageKey,
          title: pageTitle,
          description: question.groupTitle || question.description,
          questions: [],
        });
      }
      map.get(pageKey)!.questions.push(question);
    });

    return Array.from(map.values());
  }, [form]);

  const visiblePages = useMemo(() => {
    return pages
      .map((page) => ({
        ...page,
        questions: page.questions.filter((question) => isQuestionVisible(question, form?.questions ?? [], answers)),
      }))
      .filter((page) => page.questions.length > 0);
  }, [pages, form?.questions, answers]);

  const currentPage = visiblePages[currentPageIndex];
  const groupedServices = useMemo(() => {
    const groups = new Map<ServiceCategory, ServiceDefinition[]>();
    services.forEach((service) => {
      const current = groups.get(service.category) ?? [];
      current.push(service);
      groups.set(service.category, current);
    });
    return Array.from(groups.entries());
  }, [services]);

  const loadForm = async (service: ServiceDefinition) => {
    if (!service.defaultFormId) {
      setSelectedService(service);
      setForm(null);
      return;
    }

    try {
      setSelectedService(service);
      setLoadingForm(true);
      const data = await assessmentService.getFormById(service.defaultFormId);
      setForm(data);
      setCurrentPageIndex(0);
      const draft = loadDraftFromStorage(service.id);
      if (draft) {
        setAnswers(Object.fromEntries(draft.answers.map((answer) => [answer.questionId, answer])));
        setDraftMeta({ submissionId: draft.submissionId, draftKey: draft.draftKey });
      } else {
        setAnswers({});
        setDraftMeta({});
      }
      setFileAnswers({});
    } catch (error) {
      console.error(error);
      const message = axios.isAxiosError(error)
        ? error.response?.status === 403
          ? 'شما به این فرم دسترسی ندارید یا فرم برای نقش فعلی فعال نیست.'
          : error.response?.data?.error || error.message
        : 'دریافت فرم سرویس با مشکل مواجه شد';
      toast.error(message);
      setForm(null);
    } finally {
      setLoadingForm(false);
    }
  };

  const setAnswer = (questionId: number, value: AssessmentAnswerDto) => {
    setAnswers((current) => ({
      ...current,
      [questionId]: {
        ...current[questionId],
        ...value,
      },
    }));
  };

  const renderQuestion = (question: Question) => {
    const answer = answers[question.questionId];

    switch (Number(question.type)) {
      case QuestionType.MultipleChoice:
        return (
          <div className="grid gap-3">
            {question.options.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setAnswer(question.questionId, { questionId: question.questionId, selectedOptionId: option.id })}
                className={`rounded-2xl border px-4 py-3 text-right transition ${
                  answer?.selectedOptionId === option.id
                    ? 'border-teal-500 bg-teal-50 text-teal-800'
                    : 'border-gray-200 bg-white hover:border-teal-200'
                }`}
              >
                {option.text}
              </button>
            ))}
          </div>
        );
      case QuestionType.MultiSelect: {
        const selectedValues = parseJsonArray(answer?.jsonResponse);
        return (
          <div className="grid gap-3">
            {question.options.map((option) => {
              const checked = selectedValues.includes(option.id);
              return (
                <label key={option.id} className="flex items-center justify-between rounded-2xl border border-gray-200 px-4 py-3">
                  <span className="text-sm font-medium text-gray-700">{option.text}</span>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(event) => {
                      const next = event.target.checked
                        ? [...selectedValues, option.id]
                        : selectedValues.filter((value) => value !== option.id);
                      setAnswer(question.questionId, { questionId: question.questionId, jsonResponse: JSON.stringify(next) });
                    }}
                    className="h-4 w-4 rounded border-gray-300 text-teal-600"
                  />
                </label>
              );
            })}
          </div>
        );
      }
      case QuestionType.TrueFalse:
      case QuestionType.Switch:
        return (
          <div className="flex gap-3">
            {[true, false].map((value) => (
              <button
                key={String(value)}
                type="button"
                onClick={() => setAnswer(question.questionId, { questionId: question.questionId, booleanResponse: value })}
                className={`flex-1 rounded-2xl border px-4 py-3 transition ${
                  answer?.booleanResponse === value
                    ? 'border-teal-500 bg-teal-50 text-teal-800'
                    : 'border-gray-200 bg-white'
                }`}
              >
                {value ? 'بله' : 'خیر'}
              </button>
            ))}
          </div>
        );
      case QuestionType.ShortAnswer:
      case QuestionType.Time:
        return (
          <input
            type={Number(question.type) === QuestionType.Time ? 'time' : 'text'}
            value={answer?.textResponse ?? ''}
            onChange={(event) => setAnswer(question.questionId, { questionId: question.questionId, textResponse: event.target.value })}
            placeholder={question.placeholder || 'پاسخ خود را وارد کنید'}
            className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none transition focus:border-teal-500"
          />
        );
      case QuestionType.LongAnswer:
        return (
          <textarea
            rows={4}
            value={answer?.textResponse ?? ''}
            onChange={(event) => setAnswer(question.questionId, { questionId: question.questionId, textResponse: event.target.value })}
            placeholder={question.placeholder || 'توضیحات خود را وارد کنید'}
            className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none transition focus:border-teal-500"
          />
        );
      case QuestionType.Number:
      case QuestionType.Slider:
      case QuestionType.Rating:
        return Number(question.type) === QuestionType.Slider ? (
          <div className="space-y-3">
            <input
              type="range"
              min={question.minValue ?? 0}
              max={question.maxValue ?? 10}
              value={answer?.numberResponse ?? question.minValue ?? 0}
              onChange={(event) => setAnswer(question.questionId, { questionId: question.questionId, numberResponse: Number(event.target.value) })}
              className="w-full accent-teal-600"
            />
            <div className="text-sm text-gray-500">مقدار انتخاب‌شده: {answer?.numberResponse ?? question.minValue ?? 0}</div>
          </div>
        ) : Number(question.type) === QuestionType.Rating ? (
          <div className="flex items-center gap-2">
            {Array.from({ length: 5 }).map((_, index) => {
              const value = index + 1;
              const selected = (answer?.numberResponse ?? 0) >= value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setAnswer(question.questionId, { questionId: question.questionId, numberResponse: value })}
                  className={`h-11 w-11 rounded-2xl border text-sm font-bold transition ${selected ? 'border-amber-400 bg-amber-100 text-amber-700' : 'border-gray-200 bg-white text-gray-500'}`}
                >
                  {value}
                </button>
              );
            })}
          </div>
        ) : (
          <input
            type="number"
            min={question.minValue}
            max={question.maxValue}
            value={answer?.numberResponse ?? ''}
            onChange={(event) => setAnswer(question.questionId, { questionId: question.questionId, numberResponse: Number(event.target.value) })}
            placeholder={question.placeholder || 'عدد را وارد کنید'}
            className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none transition focus:border-teal-500"
          />
        );
      case QuestionType.Date:
        return (
          <DatePicker
            value={answer?.dateResponse ? new DateObject({ date: answer.dateResponse }) : ''}
            onChange={(date) => {
              const isoValue = date instanceof DateObject ? new Date(date.valueOf()).toISOString() : undefined;
              setAnswer(question.questionId, { questionId: question.questionId, dateResponse: isoValue });
            }}
            calendar={persian}
            locale={persian_fa}
            format="YYYY/MM/DD"
            calendarPosition="bottom-right"
            inputClass="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none transition focus:border-teal-500"
            containerClassName="w-full"
          />
        );
      case QuestionType.File:
      case QuestionType.Image:
        return (
          <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-gray-300 bg-gray-50 px-6 py-8 text-center">
            <FileUp className="h-7 w-7 text-teal-600" />
            <span className="font-bold text-gray-700">برای انتخاب فایل کلیک کنید</span>
            <span className="text-xs text-gray-500">
              {question.allowMultipleFiles ? 'امکان انتخاب چند فایل وجود دارد' : 'فقط یک فایل انتخاب شود'}
            </span>
            <input
              type="file"
              multiple={question.allowMultipleFiles}
              accept={Number(question.type) === QuestionType.Image ? 'image/*' : undefined}
              className="hidden"
              onChange={(event) => {
                const nextFiles = Array.from(event.target.files ?? []);
                setFileAnswers((current) => ({ ...current, [question.questionId]: nextFiles }));
                setAnswer(question.questionId, {
                  questionId: question.questionId,
                  jsonResponse: JSON.stringify(nextFiles.map((file) => ({ name: file.name, size: file.size }))),
                });
              }}
            />
            {(fileAnswers[question.questionId] ?? []).length > 0 && (
              <div className="w-full space-y-2 rounded-2xl bg-white p-3 text-right">
                {(fileAnswers[question.questionId] ?? []).map((file) => (
                  <div key={`${file.name}-${file.size}`} className="truncate text-sm text-gray-600">
                    {file.name}
                  </div>
                ))}
              </div>
            )}
          </label>
        );
      default:
        return null;
    }
  };

  const handleSaveDraft = async () => {
    if (!selectedService || !form) {
      return;
    }

    try {
      const payload = buildDraftPayload(selectedService, form, answers, draftMeta);
      const savedDraft = await homeCareService.saveDraft(payload);
      setDraftMeta({ submissionId: savedDraft.submissionId, draftKey: savedDraft.draftKey });
      localStorage.setItem(getDraftStorageKey(selectedService.id), JSON.stringify(savedDraft));
      toast.success('پیش‌نویس با موفقیت ذخیره شد');
    } catch (error) {
      console.error(error);
      toast.error('ذخیره پیش‌نویس انجام نشد');
    }
  };

  const handleSubmit = async () => {
    if (!selectedService || !form) {
      return;
    }

    const validationError = validateCurrentForm(form, answers, visiblePages);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    try {
      setSubmitting(true);
      const payload = buildDraftPayload(selectedService, form, answers, draftMeta);
      const request = await homeCareService.submitRequest({
        ...payload,
        answers: Object.values(answers),
      });

      const attachmentFiles = Object.values(fileAnswers).flat();
      if (attachmentFiles.length > 0) {
        await homeCareService.uploadAttachments(request.id, 'medical-documents', attachmentFiles);
      }

      localStorage.removeItem(getDraftStorageKey(selectedService.id));
      toast.success('درخواست شما با موفقیت ثبت شد');
      router.push(`/portal/home-care/requests/${request.id}`);
    } catch (error) {
      console.error(error);
      toast.error('ثبت درخواست با مشکل مواجه شد');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-24">
      <PageHeader
        title="ثبت هوشمند درخواست خدمت در منزل"
        description="سرویس را انتخاب کنید، فرم داینامیک همان سرویس را مرحله‌به‌مرحله تکمیل کنید و پیش از ثبت نهایی خلاصه نیازهای بیمار را بررسی کنید."
        backHref="/portal/home-care"
        backLabel="بازگشت به خدمات منزل"
        badge={<p className="text-sm font-bold text-teal-600">Smart Wizard</p>}
      />

      {!selectedService && (
        <section className="space-y-6">
          {loadingServices ? (
            <div className="py-16 text-center text-gray-500">در حال بارگذاری خدمات...</div>
          ) : services.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-amber-200 bg-amber-50 px-6 py-12 text-center text-amber-800">
              هنوز خدمت فعالی که فرم پیش‌فرض Home Care داشته باشد تعریف نشده است.
            </div>
          ) : (
            groupedServices.map(([category, categoryServices]) => (
              <div key={category} className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                    {serviceCategoryLabels[category]}
                  </span>
                  <span className="text-sm text-gray-500">{categoryServices.length} خدمت فعال با فرم آماده</span>
                </div>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {categoryServices.map((service) => (
                    <button
                      key={service.id}
                      type="button"
                      onClick={() => void loadForm(service)}
                      className="rounded-3xl border border-gray-100 bg-white p-6 text-right shadow-sm transition hover:-translate-y-1 hover:border-teal-200 hover:shadow-md"
                    >
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <div className="inline-flex rounded-2xl bg-teal-50 p-3 text-teal-700">
                          <Sparkles className="h-5 w-5" />
                        </div>
                        <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-700">
                          {serviceCategoryLabels[service.category]}
                        </span>
                      </div>
                      <h2 className="text-lg font-black text-gray-900">{service.title}</h2>
                      <p className="mt-2 line-clamp-3 text-sm leading-7 text-gray-500">{service.description || 'توضیحی برای این سرویس ثبت نشده است.'}</p>
                      <div className="mt-5 text-xs font-bold text-teal-700">فرم هوشمند این خدمت آماده ثبت درخواست است</div>
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </section>
      )}

      {selectedService && (
        <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm text-gray-500">سرویس انتخاب‌شده</p>
              <h2 className="text-xl font-black text-gray-900">{selectedService.title}</h2>
              <div className="mt-2 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                {serviceCategoryLabels[selectedService.category]}
              </div>
              <p className="mt-1 text-sm text-gray-500">{selectedService.description}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setSelectedService(null);
                setForm(null);
              }}
              className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 px-4 py-2 text-sm font-bold text-gray-700"
            >
              <ArrowRight className="h-4 w-4" />
              انتخاب سرویس دیگر
            </button>
          </div>

          {loadingForm ? (
            <div className="py-16 text-center text-gray-500">در حال بارگذاری فرم...</div>
          ) : !selectedService.defaultFormId || !form ? (
            <div className="rounded-3xl border border-dashed border-amber-200 bg-amber-50 px-6 py-10 text-center text-amber-800">
              برای این سرویس هنوز فرم پیش‌فرض تعریف نشده است. از پنل مدیریت، فرم مربوطه را به این سرویس متصل کنید.
            </div>
          ) : (
            <div className="space-y-6">
              <div className="rounded-3xl bg-gradient-to-r from-slate-900 to-slate-800 p-5 text-white">
                <p className="text-sm text-white/70">{form.introTitle || 'فرم هوشمند درخواست خدمت'}</p>
                <h3 className="mt-1 text-xl font-black">{form.title}</h3>
                <p className="mt-2 text-sm leading-7 text-white/75">{form.introDescription || form.description}</p>
              </div>

              <div className="grid gap-3 md:grid-cols-4">
                {visiblePages.map((page, index) => (
                  <button
                    key={page.key}
                    type="button"
                    onClick={() => setCurrentPageIndex(index)}
                    className={`rounded-2xl border px-4 py-3 text-right transition ${
                      index === currentPageIndex ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-gray-200 text-gray-500'
                    }`}
                  >
                    <div className="text-xs font-bold">مرحله {index + 1}</div>
                    <div className="mt-1 text-sm font-black">{page.title}</div>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setCurrentPageIndex(visiblePages.length)}
                  className={`rounded-2xl border px-4 py-3 text-right transition ${
                    currentPageIndex === visiblePages.length ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-gray-200 text-gray-500'
                  }`}
                >
                  <div className="text-xs font-bold">مرحله نهایی</div>
                  <div className="mt-1 text-sm font-black">خلاصه و ثبت</div>
                </button>
              </div>

              {currentPageIndex < visiblePages.length && currentPage && (
                <div className="space-y-5">
                  <div>
                    <h4 className="text-xl font-black text-gray-900">{currentPage.title}</h4>
                    {currentPage.description && <p className="mt-1 text-sm text-gray-500">{currentPage.description}</p>}
                  </div>

                  {currentPage.questions.map((question) => (
                    <div key={question.questionId} className="rounded-3xl border border-gray-100 bg-gray-50/70 p-5">
                      <div className="mb-3">
                        <h5 className="text-base font-black text-gray-900">
                          {question.question}
                          {question.isRequired && <span className="mr-1 text-rose-500">*</span>}
                        </h5>
                        {question.description && <p className="mt-1 text-sm text-gray-500">{question.description}</p>}
                      </div>
                      {renderQuestion(question)}
                    </div>
                  ))}
                </div>
              )}

              {currentPageIndex === visiblePages.length && (
                <div className="space-y-4">
                  <h4 className="text-xl font-black text-gray-900">خلاصه پاسخ‌ها پیش از ثبت</h4>
                  <div className="grid gap-4 md:grid-cols-2">
                    {form.questions
                      .filter((question) => isQuestionVisible(question, form.questions, answers))
                      .map((question) => (
                        <div key={question.questionId} className="rounded-3xl border border-gray-100 bg-gray-50 p-4">
                          <div className="text-xs font-bold text-gray-500">{question.question}</div>
                          <div className="mt-2 text-sm font-medium text-gray-900">{formatAnswer(question, answers[question.questionId], fileAnswers[question.questionId])}</div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentPageIndex((current) => Math.max(current - 1, 0))}
                  disabled={currentPageIndex === 0}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 px-4 py-3 text-sm font-bold text-gray-700 disabled:opacity-40"
                >
                  <ArrowRight className="h-4 w-4" />
                  مرحله قبل
                </button>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => void handleSaveDraft()}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-bold text-teal-700"
                  >
                    <Save className="h-4 w-4" />
                    ذخیره موقت
                  </button>

                  {currentPageIndex < visiblePages.length ? (
                    <button
                      type="button"
                      onClick={() => setCurrentPageIndex((current) => Math.min(current + 1, visiblePages.length))}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-teal-600 px-5 py-3 text-sm font-bold text-white"
                    >
                      مرحله بعد
                      <ArrowLeft className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => void handleSubmit()}
                      disabled={submitting}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-teal-600 px-5 py-3 text-sm font-bold text-white disabled:opacity-60"
                    >
                      {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                      ثبت نهایی درخواست
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

function buildDraftPayload(
  service: ServiceDefinition,
  form: AssessmentForm,
  answersMap: Record<number, AssessmentAnswerDto>,
  draftMeta: { submissionId?: number; draftKey?: string }
): SaveHomeCareDraftDto {
  const answers = Object.values(answersMap);
  const questionMap = new Map(form.questions.map((question) => [question.questionKey ?? String(question.questionId), question]));

  const contactFirstName = readAnswerValue(questionMap, answersMap, ['contact_first_name', 'contactName']) || 'ثبت نشده';
  const contactLastName = readAnswerValue(questionMap, answersMap, ['contact_last_name']) || '-';
  const contactMobile = readAnswerValue(questionMap, answersMap, ['contact_mobile', 'mobile']) || '-';
  const patientRelationship = readAnswerValue(questionMap, answersMap, ['patient_relationship', 'relationship']) || 'ثبت نشده';
  const contactTimePreference = readAnswerValue(questionMap, answersMap, ['contact_time_preference', 'best_call_time']);
  const city = readAnswerValue(questionMap, answersMap, ['city']);
  const address = readAnswerValue(questionMap, answersMap, ['address']);
  const floor = readAnswerValue(questionMap, answersMap, ['floor']);
  const homeConditionNotes = readAnswerValue(questionMap, answersMap, ['home_conditions', 'home_condition_notes']);
  const notes = readAnswerValue(questionMap, answersMap, ['request_notes', 'notes']);
  const preferredStartAt = readDateAnswer(questionMap, answersMap, ['start_date']);
  const hasElevator = readBooleanAnswer(questionMap, answersMap, ['has_elevator', 'elevator']) ?? false;
  const preferredContactMethod = mapContactMethod(readAnswerValue(questionMap, answersMap, ['preferred_contact_method', 'contact_method']));

  return {
    submissionId: draftMeta.submissionId,
    draftKey: draftMeta.draftKey,
    serviceDefinitionId: service.id,
    formId: form.id,
    patientRelationship,
    contactFirstName,
    contactLastName,
    contactMobile,
    preferredContactMethod,
    contactTimePreference: contactTimePreference || undefined,
    preferredStartAt: preferredStartAt || undefined,
    city: city || undefined,
    address: address || undefined,
    floor: floor || undefined,
    hasElevator,
    homeConditionNotes: homeConditionNotes || undefined,
    notes: notes || undefined,
    summaryJson: JSON.stringify({ answers }),
    answers,
  };
}

function loadDraftFromStorage(serviceId: number) {
  if (typeof window === 'undefined') {
    return null;
  }

  const rawDraft = localStorage.getItem(getDraftStorageKey(serviceId));
  if (!rawDraft) {
    return null;
  }

  try {
    return JSON.parse(rawDraft) as { submissionId: number; draftKey: string; answers: AssessmentAnswerDto[] };
  } catch {
    return null;
  }
}

function validateCurrentForm(form: AssessmentForm, answersMap: Record<number, AssessmentAnswerDto>, pages: QuestionPage[]) {
  const visibleQuestions = form.questions.filter((question) => isQuestionVisible(question, form.questions, answersMap));
  for (const question of visibleQuestions) {
    if (!question.isRequired) {
      continue;
    }
    const answer = answersMap[question.questionId];
    const hasValue =
      answer?.selectedOptionId !== undefined ||
      answer?.booleanResponse !== undefined ||
      Boolean(answer?.textResponse?.trim()) ||
      answer?.numberResponse !== undefined ||
      Boolean(answer?.dateResponse) ||
      Boolean(answer?.jsonResponse);
    if (!hasValue) {
      const pageIndex = pages.findIndex((page) => page.questions.some((item) => item.questionId === question.questionId));
      if (pageIndex >= 0) {
        toast.error(`ابتدا سوال «${question.question}» را تکمیل کنید.`);
      }
      return `سوال «${question.question}» الزامی است`;
    }
  }

  return null;
}

function isQuestionVisible(question: Question, allQuestions: Question[], answersMap: Record<number, AssessmentAnswerDto>) {
  if (!question.visibilityConditionJson) {
    return true;
  }

  try {
    const condition = JSON.parse(question.visibilityConditionJson) as { questionKey?: string; operator?: string; value?: unknown };
    const targetQuestion = allQuestions.find((item) => item.questionKey === condition.questionKey);
    if (!targetQuestion) {
      return true;
    }

    const answer = answersMap[targetQuestion.questionId];
    const comparableValue = getComparableAnswerValue(answer);
    switch (condition.operator) {
      case 'notEquals':
        return comparableValue !== condition.value;
      case 'includes':
        return Array.isArray(comparableValue) && comparableValue.includes(condition.value);
      default:
        return comparableValue === condition.value;
    }
  } catch {
    return true;
  }
}

function getComparableAnswerValue(answer?: AssessmentAnswerDto) {
  if (!answer) {
    return undefined;
  }
  if (answer.selectedOptionId !== undefined) {
    return answer.selectedOptionId;
  }
  if (answer.booleanResponse !== undefined) {
    return answer.booleanResponse;
  }
  if (answer.numberResponse !== undefined) {
    return answer.numberResponse;
  }
  if (answer.textResponse) {
    return answer.textResponse;
  }
  if (answer.dateResponse) {
    return answer.dateResponse;
  }
  if (answer.jsonResponse) {
    try {
      return JSON.parse(answer.jsonResponse);
    } catch {
      return answer.jsonResponse;
    }
  }
  return undefined;
}

function parseJsonArray(value?: string) {
  if (!value) {
    return [] as number[];
  }
  try {
    return JSON.parse(value) as number[];
  } catch {
    return [] as number[];
  }
}

function readAnswerValue(
  questionMap: Map<string, Question>,
  answersMap: Record<number, AssessmentAnswerDto>,
  keys: string[]
) {
  for (const key of keys) {
    const question = questionMap.get(key);
    if (!question) {
      continue;
    }

    const answer = answersMap[question.questionId];
    if (!answer) {
      continue;
    }

    if (answer.textResponse) {
      return answer.textResponse;
    }
    if (answer.selectedOptionId !== undefined) {
      return question.options.find((option) => option.id === answer.selectedOptionId)?.text;
    }
    if (answer.booleanResponse !== undefined) {
      return answer.booleanResponse ? 'بله' : 'خیر';
    }
    if (answer.numberResponse !== undefined) {
      return String(answer.numberResponse);
    }
  }

  return undefined;
}

function readDateAnswer(
  questionMap: Map<string, Question>,
  answersMap: Record<number, AssessmentAnswerDto>,
  keys: string[]
) {
  for (const key of keys) {
    const question = questionMap.get(key);
    if (!question) {
      continue;
    }

    const answer = answersMap[question.questionId];
    if (answer?.dateResponse) {
      return answer.dateResponse;
    }
  }

  return undefined;
}

function readBooleanAnswer(
  questionMap: Map<string, Question>,
  answersMap: Record<number, AssessmentAnswerDto>,
  keys: string[]
) {
  for (const key of keys) {
    const question = questionMap.get(key);
    if (!question) {
      continue;
    }

    const answer = answersMap[question.questionId];
    if (answer?.booleanResponse !== undefined) {
      return answer.booleanResponse;
    }
  }

  return undefined;
}

function mapContactMethod(value?: string) {
  if (!value) {
    return HomeCareContactMethod.PhoneCall;
  }

  const normalized = value.trim().toLowerCase();
  return CONTACT_METHOD_VALUES[normalized] ?? HomeCareContactMethod.PhoneCall;
}

function formatAnswer(question: Question, answer?: AssessmentAnswerDto, files?: File[]) {
  if (!answer) {
    return 'بدون پاسخ';
  }

  if (files && files.length > 0) {
    return files.map((file) => file.name).join('، ');
  }

  if (answer.selectedOptionId !== undefined) {
    return question.options.find((option) => option.id === answer.selectedOptionId)?.text ?? 'انتخاب شده';
  }
  if (answer.booleanResponse !== undefined) {
    return answer.booleanResponse ? 'بله' : 'خیر';
  }
  if (answer.numberResponse !== undefined) {
    return String(answer.numberResponse);
  }
  if (answer.textResponse) {
    return answer.textResponse;
  }
  if (answer.dateResponse) {
    return new Intl.DateTimeFormat('fa-IR-u-ca-persian', { dateStyle: 'medium' }).format(new Date(answer.dateResponse));
  }
  if (answer.jsonResponse) {
    try {
      const value = JSON.parse(answer.jsonResponse);
      return Array.isArray(value) ? value.join('، ') : JSON.stringify(value);
    } catch {
      return answer.jsonResponse;
    }
  }

  return 'بدون پاسخ';
}
