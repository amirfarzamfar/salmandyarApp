'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Loader2,
  Lock,
  PartyPopper,
  PhoneCall,
  ShieldCheck,
  Sparkles,
  XCircle,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/Button';
import { publicFormsService } from '@/services/public-forms.service';
import { guestRequestsService } from '@/services/guest-requests.service';
import { AssessmentAnswerDto, AssessmentForm, Question, QuestionType } from '@/types/assessment';
import { cn } from '@/lib/utils';
import { track } from '@/lib/analytics';

type AnswersMap = Record<number, AssessmentAnswerDto>;
type FieldErrors = Record<number, string | null>;

const storageKey = 'salmandyar_guest_request_draft_v1';

type DraftPayload = {
  formId: number;
  answers: AssessmentAnswerDto[];
  history?: string[];
  currentKey?: string | null;
  mode?: 'question' | 'review' | 'success' | 'error';
  trackingCode?: string;
};

export type GuestRequestAttributionSource =
  | 'organic'
  | 'direct'
  | 'referral'
  | 'landing_form'
  | 'google_ads'
  | 'social';

export interface GuestRequestWizardProps {
  onCompleted?: () => void;
  serviceDefinitionId?: number;
  source?: GuestRequestAttributionSource;
  landingPage?: string;
  serviceSlug?: string;
  preselectedServiceOptionId?: number;
}

const mapSourceToOverride = (source?: GuestRequestAttributionSource): number | undefined => {
  switch (source) {
    case 'organic':
      return 5;
    case 'google_ads':
      return 6;
    case 'social':
      return 7;
    case 'referral':
      return 8;
    case 'direct':
      return 9;
    case 'landing_form':
    default:
      return undefined;
  }
};

const SUMMARY_SECTIONS: Array<{ key: string; title: string; icon: string; keys: string[] }> = [
  { key: 'service', title: 'نوع خدمت', icon: '🏥', keys: ['service_type', 'urgency', 'duration'] },
  { key: 'recipient', title: 'اطلاعات گیرنده خدمت', icon: '👤', keys: ['recipient_relationship', 'recipient_status'] },
  { key: 'location', title: 'مکان و جزئیات', icon: '📍', keys: ['city', 'short_description'] },
  { key: 'contact', title: 'اطلاعات تماس', icon: '📞', keys: ['contact_first_name', 'contact_last_name', 'contact_mobile', 'contact_phone'] },
];

export default function GuestRequestWizard({
  onCompleted,
  serviceDefinitionId,
  source,
  landingPage,
  serviceSlug,
  preselectedServiceOptionId,
}: GuestRequestWizardProps) {
  const [form, setForm] = useState<AssessmentForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [answers, setAnswers] = useState<AnswersMap>({});
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [history, setHistory] = useState<string[]>([]);
  const [currentKey, setCurrentKey] = useState<string | null>(null);
  const [mode, setMode] = useState<'question' | 'review' | 'success' | 'error'>('question');
  const [trackingCode, setTrackingCode] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const autoAdvanceRef = useRef<number | null>(null);
  const formFiredOpenRef = useRef(false);
  const actionBarRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await publicFormsService.getGuestServiceRequestForm({ serviceDefinitionId });
        setForm(data);
      } catch (error: any) {
        console.error(error);
        const status = error?.response?.status;
        setErrorMessage(
          status === 404
            ? 'فرم درخواست فعلاً از سمت ادمین فعال نشده است، اما نسخه پیش‌فرض آماده ثبت درخواست است.'
            : 'ارتباط با سرور دچار مشکل شد، فرم با نسخه پیش‌فرض آماده ثبت است.',
        );
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [serviceDefinitionId]);

  const sortedQuestions = useMemo(() => {
    if (!form?.questions?.length) return [];
    return [...form.questions].sort((a, b) => a.order - b.order);
  }, [form]);

  const visibleQuestionKeys = useMemo(() => {
    const keys: string[] = [];
    sortedQuestions.forEach((q) => {
      if (q.questionKey && isQuestionVisible(q, form?.questions ?? [], answers)) {
        keys.push(q.questionKey);
      }
    });
    return keys;
  }, [answers, form, sortedQuestions]);

  const totalSteps = visibleQuestionKeys.length;
  const currentStepIndex = Math.max(0, visibleQuestionKeys.indexOf(currentKey ?? ''));

  const questionByKey = useMemo(() => {
    const map = new Map<string, Question>();
    sortedQuestions.forEach((q) => {
      if (q.questionKey) map.set(q.questionKey, q);
    });
    return map;
  }, [sortedQuestions]);

  useEffect(() => {
    if (!form || !sortedQuestions.length) return;
    const saved = loadDraft();
    if (saved?.formId === form.id) {
      const restoredAnswers: AnswersMap = {};
      saved.answers.forEach((item: AssessmentAnswerDto) => {
        restoredAnswers[item.questionId] = item;
      });
      setAnswers(restoredAnswers);
      setHistory(saved.history ?? []);
      setCurrentKey(saved.currentKey ?? sortedQuestions[0]?.questionKey ?? null);
      setMode(saved.mode ?? 'question');
      setTrackingCode(saved.trackingCode ?? '');
      return;
    }

    const initialAnswers: AnswersMap = { ...answers };
    if (preselectedServiceOptionId) {
      const firstQuestion = sortedQuestions[0];
      if (firstQuestion && Number(firstQuestion.type) === QuestionType.MultipleChoice) {
        const match = firstQuestion.options?.find((o) => o.id === preselectedServiceOptionId);
        if (match) {
          initialAnswers[firstQuestion.questionId] = { questionId: firstQuestion.questionId, selectedOptionId: match.id };
          setAnswers(initialAnswers);
        }
      }
    }

    setCurrentKey(sortedQuestions[0]?.questionKey ?? null);
  }, [form, sortedQuestions, preselectedServiceOptionId]);

  useEffect(() => {
    if (!form || !sortedQuestions.length) return;
    saveDraft({
      formId: form.id,
      answers: Object.values(answers),
      history,
      currentKey,
      mode,
      trackingCode,
    });
  }, [answers, currentKey, form, history, mode, trackingCode, sortedQuestions.length]);

  useEffect(() => {
    return () => {
      if (autoAdvanceRef.current) window.clearTimeout(autoAdvanceRef.current);
    };
  }, []);

  useEffect(() => {
    if (!form || formFiredOpenRef.current) return;
    formFiredOpenRef.current = true;
    try {
      track('request_form_open', { serviceSlug, formId: form.id });
    } catch {
      /* noop */
    }
  }, [form, serviceSlug]);

  const currentQuestion = useMemo(() => {
    if (!currentKey) return null;
    return questionByKey.get(currentKey) ?? null;
  }, [currentKey, questionByKey]);

  const visibleCurrentQuestion = useMemo(() => {
    if (!currentQuestion || !form) return null;
    return isQuestionVisible(currentQuestion, form.questions, answers) ? currentQuestion : null;
  }, [answers, currentQuestion, form]);

  useEffect(() => {
    if (!form || !currentKey || !currentQuestion) return;
    if (visibleCurrentQuestion) return;
    const nextKey = resolveNextQuestionKey(currentQuestion, form.questions, answers);
    if (!nextKey) {
      setMode('review');
      return;
    }
    setHistory((prev) => [...prev, currentKey]);
    setCurrentKey(nextKey);
  }, [answers, currentKey, currentQuestion, form, visibleCurrentQuestion]);

  const answeredCount = useMemo(() => visibleQuestionKeys.filter((k) => hasAnswerValue(answers[questionByKey.get(k)?.questionId ?? -1])).length, [answers, questionByKey, visibleQuestionKeys]);
  const progressValue = useMemo(() => {
    const denom = Math.max(1, totalSteps);
    const base = (Math.min(answeredCount, denom) / denom) * 100;
    return Math.max(5, Math.min(99, base));
  }, [answeredCount, totalSteps]);

  const canGoBack = history.length > 0 && mode === 'question';

  const canContinue = useMemo(() => {
    if (!visibleCurrentQuestion) return false;
    const required = isQuestionRequired(visibleCurrentQuestion, form?.questions ?? [], answers);
    if (!required) return true;
    return hasAnswerValue(answers[visibleCurrentQuestion.questionId]);
  }, [answers, form?.questions, visibleCurrentQuestion]);

  const handleBack = () => {
    if (!canGoBack) return;
    const last = history[history.length - 1];
    setHistory((prev) => prev.slice(0, -1));
    setCurrentKey(last);
    setFieldErrors({});
  };

  const setAnswer = (next: AssessmentAnswerDto) => {
    setAnswers((prev) => ({ ...prev, [next.questionId]: next }));
    setFieldErrors((prev) => ({ ...prev, [next.questionId]: null }));
  };

  const scheduleAutoAdvance = () => {
    if (autoAdvanceRef.current) window.clearTimeout(autoAdvanceRef.current);
    autoAdvanceRef.current = window.setTimeout(() => {
      handleNext(true);
    }, 320);
  };

  const handleNext = (silent = false) => {
    if (!form || mode !== 'question' || !currentKey || !currentQuestion) return;
    const required = isQuestionRequired(currentQuestion, form.questions, answers);
    const validationError = validateQuestion(currentQuestion, answers[currentQuestion.questionId], required);
    if (validationError) {
      setFieldErrors({ [currentQuestion.questionId]: validationError });
      if (!silent) toast.error(validationError);
      return;
    }
    setFieldErrors({});

    try {
      track('request_form_step_completed', {
        formId: form.id,
        totalSteps,
        step: currentStepIndex + 1,
        questionKey: visibleCurrentQuestion?.questionKey,
        serviceSlug,
        landingPage,
        answersCount: Object.keys(answers).length,
      });
    } catch {
      /* noop */
    }

    const nextKey = resolveNextQuestionKey(currentQuestion, form.questions, answers);
    if (!nextKey) {
      setMode('review');
      return;
    }
    setHistory((prev) => [...prev, currentKey]);
    setCurrentKey(nextKey);
  };

  const handleSubmit = async () => {
    if (!form || submitting) return;
    setSubmitting(true);
    setFieldErrors({});

    try {
      const answersValues = Object.values(answers);
      const traceId = (crypto?.randomUUID as () => string)?.() ?? `local_${Date.now()}`;

      const sourceMetadata = {
        submittedAt: new Date().toISOString(),
        referrer: typeof document !== 'undefined' ? document.referrer : '',
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
        viewportWidth: typeof window !== 'undefined' ? window.innerWidth : undefined,
        viewportHeight: typeof window !== 'undefined' ? window.innerHeight : undefined,
        timezone: typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : undefined,
      };
      const sourceMetadataJson = JSON.stringify(sourceMetadata);

      const payload = {
        formId: form.id,
        serviceDefinitionId,
        sourceOverride: mapSourceToOverride(source),
        landingPage,
        sourceMetadataJson,
        summaryJson: JSON.stringify({
          answers: answersValues,
          formCode: form.code,
          serviceDefinitionId,
          landingPage,
          attributionSource: source,
          serviceSlug,
        }),
        answers: answersValues,
      };

      const result = await guestRequestsService.submit(payload);

      try {
        track('request_submitted', {
          formId: form.id,
          trackingCode: result.trackingCode,
          landingPage,
          serviceDefinitionId,
          source,
        });
      } catch {
        /* noop */
      }

      setTrackingCode(result.trackingCode);
      setMode('success');
      clearDraft();
    } catch (error: any) {
      console.error(error);
      const serverData = error?.response?.data;
      const message =
        typeof serverData === 'string'
          ? serverData
          : typeof serverData?.error === 'string'
            ? serverData.error
            : typeof serverData?.message === 'string'
              ? serverData.message
              : 'ثبت درخواست انجام نشد. لطفاً دوباره تلاش کنید.';
      try {
        track('request_failed', {
          formId: form.id,
          errorMessage: message,
          landingPage,
          statusCode: error?.response?.status,
          serviceDefinitionId,
        });
      } catch {
        /* noop */
      }
      setErrorMessage(message);
      setMode('error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 rounded-3xl bg-white border border-slate-100">
        <Loader2 className="h-7 w-7 animate-spin text-teal-600" />
        <span className="mr-3 text-sm font-bold text-slate-600">در حال بارگذاری فرم درخواست...</span>
      </div>
    );
  }

  if (!form) return null;

  return (
    <div className="relative w-full min-w-0 max-w-3xl mx-auto overflow-visible" dir="rtl">
      <motion.article
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className={cn(
          'relative overflow-hidden w-full min-w-0 max-w-full rounded-[26px] sm:rounded-[30px] border border-slate-200/70 bg-white',
          'shadow-[0_20px_60px_-15px_rgba(15,118,110,0.18)]',
          'ring-1 ring-black/[0.02]',
        )}
      >
        {/* Wizard Hero Header — vertically compact */}
        <div className="relative border-b border-slate-100 bg-gradient-to-br from-teal-600 via-teal-500 to-emerald-500 text-white overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-10 w-56 h-56 rounded-full bg-emerald-300/20 blur-3xl pointer-events-none" />
          <div className="relative px-3.5 sm:px-8 py-3.5 sm:py-5">
            <div className="flex items-start justify-between gap-3 sm:gap-4">
              <div className="space-y-1.5 sm:space-y-2 min-w-0">
                <div className="hidden sm:flex flex-wrap items-center gap-1.5 min-w-0">
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/15 border border-white/25 px-2 py-0.5 text-[10.5px] font-black backdrop-blur">
                    <Sparkles className="h-3 w-3 text-amber-200" />
                    فوری بدون ثبت‌نام
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/15 border border-white/25 px-2 py-0.5 text-[10.5px] font-black backdrop-blur">
                    <Clock3 className="h-3 w-3" />
                    کمتر از ۲ دقیقه
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/15 border border-white/25 px-2 py-0.5 text-[10.5px] font-black backdrop-blur">
                    <ShieldCheck className="h-3 w-3" />
                    امن
                  </span>
                </div>
                <h3 className="text-[19px] sm:text-2xl font-black leading-tight tracking-tight">
                  {form.introTitle || form.title}
                </h3>
                <p className="text-[12px] sm:text-sm leading-6 sm:leading-7 text-white/90 max-w-xl line-clamp-3">
                  {form.introDescription || 'فقط چند سؤال ضروری را پاسخ دهید؛ کارشناسان ما در کوتاه‌ترین زمان با شما تماس می‌گیرند.'}
                </p>
              </div>
              <div className="hidden sm:flex h-14 w-14 flex-shrink-0 rounded-2xl bg-white/15 border border-white/25 items-center justify-center text-2xl backdrop-blur">
                🏥
              </div>
            </div>

            {/* Stepper — compact */}
            <div className="mt-3.5 sm:mt-5">
              <div className="flex items-center justify-between mb-1.5 text-[10.5px] sm:text-xs font-bold">
                <span className="text-white/90 truncate">
                  {mode === 'question' ? `مرحله ${currentStepIndex + 1} از ${Math.max(1, totalSteps)}` : mode === 'review' ? 'مرور نهایی' : 'ثبت موفق'}
                </span>
                <span className="text-white/90 tabular-nums flex-shrink-0">{Math.round(progressValue)}٪</span>
              </div>
              <div className="h-1.5 sm:h-2 w-full rounded-full bg-white/15 overflow-hidden backdrop-blur">
                <motion.div
                  initial={{ width: '0%' }}
                  animate={{ width: `${progressValue}%` }}
                  transition={{ duration: 0.45, ease: 'easeOut' }}
                  className="h-full rounded-full bg-gradient-to-l from-white via-amber-200 to-white shadow-[0_0_12px_rgba(255,255,255,0.45)]"
                />
              </div>
              {/* Numbered Stepper — only lg+ */}
              <div className="mt-3 hidden lg:flex items-center gap-1.5 flex-wrap">
                {visibleQuestionKeys.map((k, i) => {
                  const q = questionByKey.get(k);
                  const step = i + 1;
                  const isDone = i < currentStepIndex || mode !== 'question';
                  const isActive = i === currentStepIndex && mode === 'question';
                  return (
                    <div
                      key={k}
                      className={cn(
                        'flex items-center justify-center h-7 min-w-[28px] px-2 rounded-full border text-[11px] font-black transition-all',
                        isDone && !isActive
                          ? 'bg-white/25 border-white/30 text-white'
                          : isActive
                            ? 'bg-white text-teal-700 border-white scale-110 shadow-lg shadow-black/10'
                            : 'bg-transparent border-white/20 text-white/60',
                      )}
                      title={q?.question}
                    >
                      {isDone && !isActive ? <CheckCircle2 className="h-3.5 w-3.5" /> : step}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Body — vertically compact */}
        <div className="px-3.5 sm:px-8 py-3.5 sm:py-5 pb-24 sm:pb-6 min-w-0 w-full max-w-full overflow-hidden">
          <AnimatePresence mode="wait">
            {mode === 'question' && visibleCurrentQuestion && (
              <motion.div
                key={visibleCurrentQuestion.questionId}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="space-y-3.5 sm:space-y-5"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="inline-flex items-center gap-1 rounded-xl bg-teal-50 border border-teal-100 px-2 py-0.5 text-[10.5px] font-black text-teal-700">
                      <Clock3 className="h-3 w-3" />
                      {visibleCurrentQuestion.pageTitle || 'سؤال'}
                    </span>
                    {visibleCurrentQuestion.isRequired && (
                      <span className="text-[10.5px] font-black text-rose-500"> * الزامی</span>
                    )}
                  </div>
                  <h4 className="text-base sm:text-xl font-black leading-8 sm:leading-9 text-slate-900">
                    {visibleCurrentQuestion.question}
                  </h4>
                  {visibleCurrentQuestion.description && (
                    <p className="mt-1.5 text-[13px] sm:text-sm leading-6 sm:leading-7 text-slate-500">{visibleCurrentQuestion.description}</p>
                  )}
                </div>

                <div className={cn(fieldErrors[visibleCurrentQuestion.questionId] && 'pb-0.5')}>
                  <QuestionRenderer
                    question={visibleCurrentQuestion}
                    answer={answers[visibleCurrentQuestion.questionId]}
                    onChange={setAnswer}
                    onQuickAdvance={scheduleAutoAdvance}
                    fieldError={fieldErrors[visibleCurrentQuestion.questionId] || null}
                  />
                </div>
                {fieldErrors[visibleCurrentQuestion.questionId] && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-2 rounded-2xl bg-rose-50 border border-rose-100 px-3 py-2 text-[12px] font-bold text-rose-700"
                  >
                    <XCircle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                    <span className="leading-6">{fieldErrors[visibleCurrentQuestion.questionId]}</span>
                  </motion.div>
                )}
              </motion.div>
            )}

            {mode === 'review' && (
              <motion.div
                key="review"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="space-y-3.5 sm:space-y-5"
              >
                <div className="flex items-start justify-between gap-3 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 p-3.5 sm:p-4">
                  <div className="min-w-0">
                    <div className="text-sm sm:text-lg font-black text-slate-900 flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                      خلاصه درخواست شما
                    </div>
                    <div className="mt-1 text-[12px] sm:text-sm text-slate-600 leading-6 sm:leading-7">
                      قبل از ارسال نهایی، یک نگاه سریع به اطلاعات زیر بیندازید.
                    </div>
                  </div>
                </div>

                {buildGroupedSummary(form, answers).map((group) => (
                  <div key={group.key} className="rounded-2xl border border-slate-100 overflow-hidden">
                    <div className="flex items-center gap-2 px-3.5 sm:px-5 py-2.5 border-b border-slate-100 bg-slate-50/70">
                      <span className="text-base sm:text-xl">{group.icon}</span>
                      <h5 className="font-black text-[13px] sm:text-sm text-slate-800">{group.title}</h5>
                    </div>
                    <div className="divide-y divide-slate-50">
                      {group.items.map((it) => (
                        <div key={it.questionId} className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] gap-y-0.5 gap-x-4 px-3.5 sm:px-5 py-2.5 sm:py-3">
                          <div className="text-[10.5px] sm:text-xs font-bold text-slate-500 leading-6 pt-0.5">{it.question}</div>
                          <div className="text-[14px] sm:text-[15px] font-black text-slate-900 leading-7 sm:leading-8 break-words min-w-0 text-right sm:text-right">{it.value}</div>
                        </div>
                      ))}
                      {group.items.length === 0 && (
                        <div className="px-3.5 sm:px-5 py-2.5 text-[11px] text-slate-400 font-bold">— ثبت نشده</div>
                      )}
                    </div>
                  </div>
                ))}

                <div className="flex flex-wrap items-center gap-2 pt-0.5 text-[10.5px] text-slate-500">
                  <Lock className="h-3 w-3 flex-shrink-0" />
                  اطلاعات شما به صورت رمزنگاری شده ذخیره می‌شود.
                </div>
              </motion.div>
            )}

            {mode === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 14, scale: 0.985 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="text-center space-y-4 sm:space-y-6"
              >
                <motion.div
                  initial={{ scale: 0.7, rotate: -8 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.12, type: 'spring', stiffness: 180, damping: 14 }}
                  className="mx-auto flex h-16 w-16 sm:h-24 sm:w-24 items-center justify-center rounded-[22px] sm:rounded-[28px] bg-gradient-to-br from-emerald-500 via-emerald-500 to-teal-500 text-white shadow-[0_15px_45px_-10px_rgba(16,185,129,0.55)]"
                >
                  <PartyPopper className="h-8 w-8 sm:h-12 sm:w-12" />
                </motion.div>
                <div className="space-y-1.5 sm:space-y-2">
                  <div className="text-xl sm:text-[26px] font-black text-slate-900">درخواست شما با موفقیت ثبت شد</div>
                  <p className="text-[13px] sm:text-[15px] text-slate-600 leading-6 sm:leading-8 max-w-lg mx-auto">
                    کارشناسان سالمندیار (معمولاً ظرف ۳۰ دقیقه) با شما تماس می‌گیرند.
                  </p>
                </div>
                <div className="relative mx-auto max-w-sm rounded-[20px] sm:rounded-[24px] border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-teal-50 px-4 sm:px-5 py-4 sm:py-5 shadow-[0_12px_30px_-10px_rgba(16,185,129,0.25)]">
                  <div className="text-[10px] sm:text-[11px] font-black text-emerald-700 tracking-wider uppercase">Tracking Code</div>
                  <div className="mt-1.5 sm:mt-2 text-2xl sm:text-4xl font-black tracking-[0.2em] sm:tracking-[0.3em] tabular-nums text-slate-900 select-all break-all min-w-0 w-full">
                    {trackingCode}
                  </div>
                  <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-emerald-100/80 flex items-center justify-center gap-1.5 text-[10.5px] sm:text-[11px] font-bold text-emerald-700">
                    <PhoneCall className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    همین شماره را ذخیره کنید
                  </div>
                </div>
                <div className="rounded-2xl bg-teal-50 border border-teal-100 px-3.5 sm:px-4 py-2.5 sm:py-3.5 text-[11.5px] sm:text-xs text-teal-800 leading-6 sm:leading-7 max-w-lg mx-auto">
                  💡 <b>نکته:</b> اگر تا تماس ما سوالی دارید، همین کد پیگیری را آماده داشته باشید.
                </div>
                <Button
                  onClick={() => onCompleted?.()}
                  size="lg"
                  className="w-full sm:w-auto sm:px-10 rounded-2xl py-3.5 sm:py-4 text-sm sm:text-base font-black shadow-xl shadow-teal-600/20 bg-gradient-to-br from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 min-h-[52px]"
                >
                  فهمیدم، خارج می‌شوم
                  <ChevronLeft className="h-5 w-5" />
                </Button>
              </motion.div>
            )}

            {mode === 'error' && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-5"
              >
                <div className="rounded-2xl border border-rose-100 bg-rose-50/70 p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-lg font-black text-slate-900 flex items-center gap-2">
                        <XCircle className="h-5 w-5 text-rose-600" />
                        مشکل در ثبت درخواست
                      </div>
                      <div className="mt-2 text-sm leading-7 text-slate-700">{errorMessage}</div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => {
                      setMode('question');
                      setErrorMessage('');
                    }}
                    className="rounded-2xl px-5 py-4 text-sm font-black"
                  >
                    بازگشت و ویرایش اطلاعات
                  </Button>
                  <Button
                    size="lg"
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="rounded-2xl px-5 py-4 text-sm font-black shadow-lg shadow-teal-600/20"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        در حال تلاش مجدد...
                      </>
                    ) : (
                      <>
                        تلاش مجدد برای ثبت
                        <ChevronLeft className="h-5 w-5" />
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sticky Action Bar (mobile) — compact */}
        {mode === 'question' && (
          <div
            ref={actionBarRef}
            className={cn(
              'absolute left-0 right-0 bottom-0 sm:static',
              'sticky bottom-0 z-20 sm:hidden',
              'px-3 py-2.5 pb-[calc(env(safe-area-inset-bottom)+10px)]',
              'border-t border-slate-100 bg-white/95 backdrop-blur-md shadow-[0_-6px_24px_-8px_rgba(15,23,42,0.08)]',
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={!canGoBack}
                className="flex-1 rounded-xl px-3 py-3 text-sm font-black min-h-[46px]"
              >
                <ChevronRight className="h-5 w-5" />
                قبل
              </Button>
              <Button
                onClick={() => handleNext(false)}
                disabled={!canContinue}
                className="flex-[1.3] rounded-xl px-4 py-3 text-sm font-black min-h-[46px] shadow-lg shadow-teal-600/25 bg-gradient-to-br from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600"
              >
                ادامه
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </div>
          </div>
        )}

        {/* Desktop Action Bar — compact */}
        {mode === 'question' && (
          <div className="hidden sm:flex items-center justify-between gap-3 px-8 py-3 border-t border-slate-100 bg-slate-50/60">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={!canGoBack}
              className="rounded-2xl px-5 py-3 text-sm font-bold"
            >
              <ChevronRight className="h-5 w-5" />
              مرحله قبل
            </Button>
            <Button
              onClick={() => handleNext(false)}
              disabled={!canContinue}
              size="lg"
              className="rounded-2xl px-8 py-3 text-sm font-black shadow-lg shadow-teal-600/20 bg-gradient-to-br from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 min-h-[48px]"
            >
              ادامه
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </div>
        )}

        {mode === 'review' && (
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5 px-3.5 sm:px-8 py-3 sm:py-4 border-t border-slate-100 bg-slate-50/70">
            <Button
              variant="ghost"
              size="lg"
              onClick={() => {
                setMode('question');
                const last = history[history.length - 1];
                if (last) {
                  setCurrentKey(last);
                  setHistory((prev) => prev.slice(0, -1));
                }
              }}
              className="rounded-2xl px-5 py-3.5 text-sm font-black min-h-[48px]"
            >
              <ChevronRight className="h-5 w-5" />
              ویرایش اطلاعات
            </Button>
            <Button
              size="lg"
              onClick={handleSubmit}
              disabled={submitting}
              className="rounded-2xl px-8 py-3.5 text-sm sm:text-base font-black shadow-xl shadow-teal-600/25 bg-gradient-to-br from-teal-600 via-teal-500 to-emerald-500 hover:from-teal-700 hover:to-teal-600 min-h-[50px]"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  در حال ثبت...
                </>
              ) : (
                <>
                  ثبت نهایی درخواست
                  <ShieldCheck className="h-5 w-5" />
                </>
              )}
            </Button>
          </div>
        )}
      </motion.article>

      {/* Trust Strip Under Wizard — compact, shown only sm+ to avoid vertical bloat on mobile */}
      {(mode === 'question' || mode === 'review') && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.35 }}
          className="mt-4 sm:mt-5 hidden sm:grid grid-cols-3 gap-2 sm:gap-3 px-1"
        >
          {[
            { i: ShieldCheck, t: 'رایگان', s: 'ثبت درخواست' },
            { i: Lock, t: 'امن', s: 'حریم خصوصی' },
            { i: Clock3, t: 'فوری', s: 'پاسخ ۳۰ دقیقه‌ای' },
          ].map((b, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center justify-center rounded-2xl border border-slate-100 bg-white py-2.5 sm:py-3 px-2 text-center shadow-sm"
            >
              <b.i className="h-5 w-5 text-teal-600 mb-1" />
              <div className="text-[12px] sm:text-[13px] font-black text-slate-900">{b.t}</div>
              <div className="text-[10px] sm:text-[10.5px] font-bold text-slate-500 mt-0.5">{b.s}</div>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

function QuestionRenderer({
  question,
  answer,
  onChange,
  onQuickAdvance,
  fieldError,
}: {
  question: Question;
  answer?: AssessmentAnswerDto;
  onChange: (value: AssessmentAnswerDto) => void;
  onQuickAdvance: () => void;
  fieldError?: string | null;
}) {
  const baseMCQClass = cn(
    'group w-full relative overflow-hidden rounded-xl sm:rounded-2xl border px-3.5 sm:px-5 py-3 sm:py-[17px] text-right text-[14px] sm:text-[15px] font-black transition-all duration-200 min-h-[50px] sm:min-h-[52px]',
    'outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-white focus:ring-teal-400',
    fieldError
      ? 'border-rose-300 bg-rose-50/50 text-rose-800'
      : 'border-slate-200 bg-white hover:border-teal-300 hover:bg-teal-50/40 text-slate-800 active:scale-[0.995]',
  );
  const selectedMCQClass =
    '!border-teal-500 !bg-gradient-to-br !from-teal-50 !to-emerald-50 !text-teal-800 shadow-[0_8px_25px_-12px_rgba(13,148,136,0.45)] ring-2 ring-teal-500/20';

  if (Number(question.type) === QuestionType.MultipleChoice) {
    return (
      <div className="grid gap-2 sm:gap-2.5">
        {question.options.map((opt) => {
          const selected = answer?.selectedOptionId === opt.id;
          return (
            <motion.button
              key={opt.id}
              type="button"
              whileTap={{ scale: 0.985 }}
              onClick={() => {
                onChange({ questionId: question.questionId, selectedOptionId: opt.id });
                onQuickAdvance();
              }}
              className={cn(baseMCQClass, selected && selectedMCQClass)}
            >
              <div className="flex items-center justify-between gap-3 sm:gap-4">
                <span className="leading-7 sm:leading-8 break-words min-w-0">{opt.text}</span>
                <div
                  className={cn(
                    'flex-shrink-0 h-5 w-5 sm:h-6 sm:w-6 rounded-full border-2 flex items-center justify-center transition',
                    selected ? 'border-teal-500 bg-teal-500' : 'border-slate-300 group-hover:border-teal-400',
                  )}
                >
                  {selected && <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" strokeWidth={3.2} />}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    );
  }

  if (Number(question.type) === QuestionType.TrueFalse) {
    const value = answer?.booleanResponse;
    return (
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        <OptionChip
          selected={value === true}
          onClick={() => {
            onChange({ questionId: question.questionId, booleanResponse: true });
            onQuickAdvance();
          }}
        >
          بله
        </OptionChip>
        <OptionChip
          selected={value === false}
          onClick={() => {
            onChange({ questionId: question.questionId, booleanResponse: false });
            onQuickAdvance();
          }}
        >
          خیر
        </OptionChip>
      </div>
    );
  }

  const inputBase = cn(
    'w-full rounded-xl sm:rounded-2xl border px-3.5 sm:px-5 py-3.5 sm:py-4 text-[14px] sm:text-[15px] font-black text-slate-900 leading-7 sm:leading-8 outline-none transition-all min-h-[50px] sm:min-h-[52px] tabular-nums',
    'focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 focus:bg-teal-50/30',
    fieldError
      ? 'border-rose-400 bg-rose-50/40 focus:ring-rose-400/30 focus:border-rose-500'
      : 'border-slate-200 bg-white hover:border-slate-300',
  );

  if (Number(question.type) === QuestionType.ShortAnswer) {
    const isMobile = question.questionKey === 'contact_mobile' || question.questionKey === 'contact_phone';
    return (
      <input
        type={isMobile ? 'tel' : 'text'}
        value={answer?.textResponse || ''}
        placeholder={question.placeholder || 'پاسخ کوتاه...'}
        dir={isMobile ? 'ltr' : 'rtl'}
        inputMode={isMobile ? 'tel' : 'text'}
        onChange={(event) => {
          const v = event.target.value;
          onChange({ questionId: question.questionId, textResponse: v });
        }}
        className={cn(inputBase, isMobile && 'text-left font-mono tracking-wide sm:tracking-wider')}
      />
    );
  }

  if (Number(question.type) === QuestionType.LongAnswer) {
    return (
      <textarea
        rows={3}
        value={answer?.textResponse || ''}
        placeholder={question.placeholder || 'توضیح کوتاه (اختیاری)'}
        onChange={(event) => onChange({ questionId: question.questionId, textResponse: event.target.value })}
        className={cn(
          'w-full resize-none rounded-xl sm:rounded-2xl border px-3.5 sm:px-5 py-3 sm:py-4 text-[14px] sm:text-[15px] font-bold text-slate-900 leading-7 sm:leading-8 outline-none transition min-h-[100px] sm:min-h-[120px]',
          'focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 focus:bg-teal-50/30',
          fieldError
            ? 'border-rose-400 bg-rose-50/40'
            : 'border-slate-200 bg-white hover:border-slate-300',
        )}
      />
    );
  }

  if (Number(question.type) === QuestionType.Number) {
    return (
      <input
        type="number"
        value={answer?.numberResponse ?? ''}
        placeholder={question.placeholder || ''}
        onChange={(event) =>
          onChange({ questionId: question.questionId, numberResponse: event.target.value === '' ? undefined : Number(event.target.value) })
        }
        className={inputBase}
        inputMode="numeric"
      />
    );
  }

  if (Number(question.type) === QuestionType.Date) {
    return (
      <input
        type="date"
        value={answer?.dateResponse || ''}
        onChange={(event) => onChange({ questionId: question.questionId, dateResponse: event.target.value })}
        className={inputBase}
      />
    );
  }

  return (
    <div className="rounded-xl sm:rounded-2xl border border-slate-200 bg-slate-50 px-3.5 sm:px-4 py-3 sm:py-3.5 text-[14px] sm:text-sm font-bold text-slate-600">
      این نوع سؤال در این فرم پشتیبانی نمی‌شود.
    </div>
  );
}

function OptionChip({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: string }) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.985 }}
      onClick={onClick}
      className={cn(
        'rounded-xl sm:rounded-2xl border-2 px-4 py-3.5 sm:py-5 text-center text-[15px] sm:text-base font-black transition-all min-h-[52px] sm:min-h-[56px]',
        selected
          ? 'border-teal-500 bg-gradient-to-br from-teal-50 to-emerald-50 text-teal-800 shadow-[0_10px_25px_-12px_rgba(13,148,136,0.45)] ring-2 ring-teal-500/20'
          : 'border-slate-200 bg-white text-slate-700 hover:border-teal-300 hover:bg-teal-50/40',
      )}
    >
      {children}
    </motion.button>
  );
}

function buildGroupedSummary(form: AssessmentForm, answers: AnswersMap) {
  const flat = form.questions
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((q) => {
      const answer = answers[q.questionId];
      if (!answer) return null;
      const value = renderAnswerValue(q, answer);
      if (!value) return null;
      return { questionId: q.questionId, questionKey: q.questionKey, question: q.question, value };
    })
    .filter(Boolean) as Array<{ questionId: number; questionKey?: string; question: string; value: string }>;

  return SUMMARY_SECTIONS.map((section) => {
    const items = flat.filter((i) => i.questionKey && section.keys.includes(i.questionKey));
    return { key: section.key, title: section.title, icon: section.icon, items };
  });
}

function renderAnswerValue(question: Question, answer: AssessmentAnswerDto) {
  if (answer.selectedOptionId !== undefined) {
    const opt = question.options?.find((o) => o.id === answer.selectedOptionId);
    return opt?.text ?? '';
  }
  if (answer.booleanResponse !== undefined) return answer.booleanResponse ? 'بله' : 'خیر';
  if (answer.numberResponse !== undefined) return String(answer.numberResponse);
  if (answer.dateResponse) return answer.dateResponse;
  if (answer.textResponse?.trim()) return answer.textResponse.trim();
  if (answer.jsonResponse?.trim()) return answer.jsonResponse.trim();
  return '';
}

function saveDraft(value: DraftPayload) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(storageKey, JSON.stringify(value));
  } catch {
    return;
  }
}

function loadDraft(): DraftPayload | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(storageKey);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as DraftPayload;
  } catch {
    return null;
  }
}

function clearDraft() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(storageKey);
}

function resolveNextQuestionKey(currentQuestion: Question, allQuestions: Question[], answers: AnswersMap) {
  const answer = answers[currentQuestion.questionId];
  const sorted = [...allQuestions].sort((a, b) => a.order - b.order);

  let nextKey = currentQuestion.nextQuestionKey;

  if (Number(currentQuestion.type) === QuestionType.MultipleChoice && answer?.selectedOptionId) {
    const selectedOpt = currentQuestion.options?.find((o) => o.id === answer.selectedOptionId);
    if (selectedOpt?.nextQuestionKey) nextKey = selectedOpt.nextQuestionKey;
  }

  if (Number(currentQuestion.type) === QuestionType.TrueFalse && answer?.booleanResponse !== undefined) {
    const expectedValue = answer.booleanResponse ? 1 : 0;
    const selectedOpt = currentQuestion.options?.find((o) => o.value === expectedValue);
    if (selectedOpt?.nextQuestionKey) nextKey = selectedOpt.nextQuestionKey;
  }

  if (nextKey) {
    const next = sorted.find((q) => q.questionKey === nextKey);
    if (next && isQuestionVisible(next, allQuestions, answers)) return next.questionKey ?? null;
    return next?.questionKey ?? null;
  }

  const index = sorted.findIndex((q) => q.questionId === currentQuestion.questionId);
  for (let i = index + 1; i < sorted.length; i += 1) {
    const candidate = sorted[i];
    if (!candidate.questionKey) continue;
    if (isQuestionVisible(candidate, allQuestions, answers)) return candidate.questionKey;
  }
  return null;
}

function getComparableAnswerValue(answer?: AssessmentAnswerDto) {
  if (!answer) return undefined;
  if (answer.selectedOptionId !== undefined) return answer.selectedOptionId;
  if (answer.booleanResponse !== undefined) return answer.booleanResponse;
  if (answer.numberResponse !== undefined) return answer.numberResponse;
  if (answer.dateResponse) return answer.dateResponse;
  if (answer.textResponse) return answer.textResponse;
  if (answer.jsonResponse) {
    try {
      return JSON.parse(answer.jsonResponse);
    } catch {
      return answer.jsonResponse;
    }
  }
  return undefined;
}

function isQuestionVisible(question: Question, allQuestions: Question[], answers: AnswersMap) {
  if (!question.visibilityConditionJson) return true;
  try {
    const condition = JSON.parse(question.visibilityConditionJson) as { questionKey?: string; operator?: string; value?: unknown };
    const target = allQuestions.find((q) => q.questionKey === condition.questionKey);
    if (!target) return true;
    const answer = answers[target.questionId];
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

function isQuestionRequired(question: Question, allQuestions: Question[], answers: AnswersMap) {
  if (!question.requiredConditionJson) return question.isRequired;
  try {
    const condition = JSON.parse(question.requiredConditionJson) as { questionKey?: string; operator?: string; value?: unknown };
    const target = allQuestions.find((q) => q.questionKey === condition.questionKey);
    if (!target) return question.isRequired;
    const answer = answers[target.questionId];
    const comparableValue = getComparableAnswerValue(answer);
    let conditionMet = false;
    switch (condition.operator) {
      case 'notEquals':
        conditionMet = comparableValue !== condition.value;
        break;
      case 'includes':
        conditionMet = Array.isArray(comparableValue) && comparableValue.includes(condition.value);
        break;
      default:
        conditionMet = comparableValue === condition.value;
        break;
    }
    return conditionMet;
  } catch {
    return question.isRequired;
  }
}

function hasAnswerValue(answer?: AssessmentAnswerDto) {
  if (!answer) return false;
  if (answer.selectedOptionId !== undefined) return true;
  if (answer.booleanResponse !== undefined) return true;
  if (answer.numberResponse !== undefined) return true;
  if (answer.dateResponse) return true;
  if (answer.textResponse?.trim()) return true;
  if (answer.jsonResponse?.trim()) return true;
  return false;
}

function validateQuestion(question: Question, answer: AssessmentAnswerDto | undefined, required: boolean): string | null {
  if (required && !hasAnswerValue(answer)) {
    const qk = question.questionKey;
    if (qk === 'contact_mobile') return 'لطفاً شماره موبایل خود را به‌صورت کامل وارد کنید (مثلاً 0912...).';
    if (qk === 'city') return 'لطفاً شهر یا محل ارائه خدمت را وارد کنید.';
    if (qk === 'service_type') return 'لطفاً یک گزینه برای نوع خدمت انتخاب کنید.';
    if (qk === 'urgency') return 'لطفاً میزان فوریت خدمت را انتخاب کنید.';
    return 'این سوال الزامی است؛ لطفاً پاسخ مناسب را وارد یا انتخاب کنید.';
  }

  if (!question.validationJson || !answer) return null;

  try {
    const rule = JSON.parse(question.validationJson) as { minLength?: number; maxLength?: number; pattern?: string; message?: string };
    const value = answer.textResponse ?? '';
    if (typeof rule.minLength === 'number' && value.length < rule.minLength) {
      return rule.message || `حداقل ${rule.minLength} کاراکتر لازم است.`;
    }
    if (typeof rule.maxLength === 'number' && value.length > rule.maxLength) {
      return rule.message || `حداکثر ${rule.maxLength} کاراکتر مجاز است.`;
    }
    if (rule.pattern) {
      const regex = new RegExp(rule.pattern);
      if (!regex.test(value)) return rule.message || 'فرمت وارد شده معتبر نیست.';
    }
  } catch {
    return null;
  }
  return null;
}
