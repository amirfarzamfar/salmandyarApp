'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, ChevronLeft, ChevronRight, Loader2, MessageCircle, Sparkles, XCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/Button';
import { publicFormsService } from '@/services/public-forms.service';
import { guestRequestsService } from '@/services/guest-requests.service';
import { AssessmentAnswerDto, AssessmentForm, Question, QuestionType } from '@/types/assessment';
import { cn } from '@/lib/utils';

type AnswersMap = Record<number, AssessmentAnswerDto>;

const storageKey = 'salmandyar_guest_request_draft_v1';

type DraftPayload = {
  formId: number;
  answers: AssessmentAnswerDto[];
  history?: string[];
  currentKey?: string | null;
  mode?: 'question' | 'review' | 'success' | 'error';
  trackingCode?: string;
};

export default function GuestRequestWizard({ onCompleted }: { onCompleted?: () => void }) {
  const [form, setForm] = useState<AssessmentForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [answers, setAnswers] = useState<AnswersMap>({});
  const [history, setHistory] = useState<string[]>([]);
  const [currentKey, setCurrentKey] = useState<string | null>(null);
  const [mode, setMode] = useState<'question' | 'review' | 'success' | 'error'>('question');
  const [trackingCode, setTrackingCode] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const autoAdvanceRef = useRef<number | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await publicFormsService.getGuestServiceRequestForm();
        setForm(data);
      } catch (error: any) {
        console.error(error);
        const status = error?.response?.status;
        if (status === 404) {
          setErrorMessage('فرم درخواست هنوز توسط ادمین فعال نشده است. لطفاً از پنل ادمین یک فرم با Workflow «درخواست بدون ثبت‌نام (لندینگ)» ایجاد و فعال کنید.');
        } else {
          setErrorMessage('فرم درخواست در دسترس نیست. لطفاً کمی بعد دوباره تلاش کنید.');
        }
        setMode('error');
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const sortedQuestions = useMemo(() => {
    if (!form?.questions?.length) return [];
    return [...form.questions].sort((a, b) => a.order - b.order);
  }, [form]);

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

    setCurrentKey(sortedQuestions[0]?.questionKey ?? null);
  }, [form, sortedQuestions]);

  useEffect(() => {
    if (!form) return;
    saveDraft({
      formId: form.id,
      answers: Object.values(answers),
      history,
      currentKey,
      mode,
      trackingCode,
    });
  }, [answers, currentKey, form, history, mode, trackingCode]);

  useEffect(() => {
    return () => {
      if (autoAdvanceRef.current) {
        window.clearTimeout(autoAdvanceRef.current);
      }
    };
  }, []);

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

  const answeredCount = useMemo(() => Object.keys(answers).length, [answers]);
  const progressValue = useMemo(() => {
    const denom = Math.max(1, sortedQuestions.length);
    const base = (Math.min(answeredCount, denom) / denom) * 100;
    return Math.max(5, Math.min(95, base));
  }, [answeredCount, sortedQuestions.length]);

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
  };

  const setAnswer = (next: AssessmentAnswerDto) => {
    setAnswers((prev) => ({ ...prev, [next.questionId]: next }));
  };

  const scheduleAutoAdvance = () => {
    if (autoAdvanceRef.current) {
      window.clearTimeout(autoAdvanceRef.current);
    }
    autoAdvanceRef.current = window.setTimeout(() => {
      handleNext();
    }, 350);
  };

  const handleNext = () => {
    if (!form) return;
    if (mode !== 'question') return;
    if (!currentKey || !currentQuestion) return;

    const required = isQuestionRequired(currentQuestion, form.questions, answers);
    const validationError = validateQuestion(currentQuestion, answers[currentQuestion.questionId], required);
    if (validationError) {
      toast.error(validationError);
      return;
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
    if (!form) return;

    setSubmitting(true);
    const traceId = `guest-request-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    try {
      const payload = {
        formId: form.id,
        summaryJson: JSON.stringify({
          answers: Object.values(answers),
          formCode: form.code,
        }),
        answers: Object.values(answers),
      };
      // #region debug-point A:guest-request-submit-start
      fetch("http://127.0.0.1:7777/event",{method:"POST",body:JSON.stringify({sessionId:"guest-request-submit-error",runId:"pre",hypothesisId:"A",location:"GuestRequestWizard.tsx:handleSubmit",msg:"[DEBUG] guest request submit start",data:{traceId,formId:form.id,formCode:form.code,answersCount:Object.values(answers).length,keys:Object.values(answers).slice(0,6).map(a=>({qid:a.questionId,hasText:!!a.textResponse,hasNumber:a.numberResponse!==undefined,hasDate:!!a.dateResponse,hasOption:a.selectedOptionId!==undefined,hasBool:a.booleanResponse!==undefined}))},ts:Date.now()})}).catch(()=>{});
      // #endregion
      const result = await guestRequestsService.submit(payload);
      // #region debug-point B:guest-request-submit-success
      fetch("http://127.0.0.1:7777/event",{method:"POST",body:JSON.stringify({sessionId:"guest-request-submit-error",runId:"pre",hypothesisId:"B",location:"GuestRequestWizard.tsx:handleSubmit",msg:"[DEBUG] guest request submit success",data:{traceId,trackingCode:(result as any)?.trackingCode,receivedKeys:result?Object.keys(result as any):[]},ts:Date.now()})}).catch(()=>{});
      // #endregion
      setTrackingCode(result.trackingCode);
      setMode('success');
      clearDraft();
    } catch (error: any) {
      // #region debug-point C:guest-request-submit-catch
      fetch("http://127.0.0.1:7777/event",{method:"POST",body:JSON.stringify({sessionId:"guest-request-submit-error",runId:"pre",hypothesisId:"C",location:"GuestRequestWizard.tsx:handleSubmit",msg:"[DEBUG] guest request submit failed",data:{traceId,errorName:error?.name,errorMessage:error?.message,status:error?.response?.status,statusText:error?.response?.statusText,url:error?.config?.url,method:error?.config?.method,baseURL:error?.config?.baseURL,responseType:typeof error?.response?.data,resp:error?.response?.data},ts:Date.now()})}).catch(()=>{});
      // #endregion
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
      setErrorMessage(message);
      setMode('error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-teal-600" />
      </div>
    );
  }

  if (!form) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-white/60 bg-white/70 p-4 backdrop-blur">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm font-black text-slate-900">
              <MessageCircle className="h-4 w-4 text-teal-600" />
              {form.introTitle || form.title}
            </div>
            <div className="text-xs leading-6 text-slate-500">
              {form.introDescription || 'فقط چند سؤال ضروری؛ هر مرحله کمتر از ۱۰ ثانیه.'}
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <Sparkles className="h-4 w-4 text-amber-500" />
            {mode === 'review' ? 'مرور نهایی' : 'مرحله‌ای'}
          </div>
        </div>

        {mode === 'question' && (
          <div className="mt-4 space-y-2">
            <Progress value={progressValue} />
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>پیشرفت</span>
              <span>{Math.round(progressValue)}٪</span>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {mode === 'question' && visibleCurrentQuestion && (
          <motion.div
            key={visibleCurrentQuestion.questionId}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="rounded-3xl border border-white/60 bg-white/70 p-4 shadow-sm backdrop-blur sm:p-6"
          >
            <div className="space-y-4">
              <div>
                <div className="text-lg font-black leading-8 text-slate-900">{visibleCurrentQuestion.question}</div>
                {visibleCurrentQuestion.description && (
                  <div className="mt-2 text-sm leading-7 text-slate-500">{visibleCurrentQuestion.description}</div>
                )}
              </div>

              <QuestionRenderer
                question={visibleCurrentQuestion}
                answer={answers[visibleCurrentQuestion.questionId]}
                onChange={setAnswer}
                onQuickAdvance={scheduleAutoAdvance}
              />

              <div className="flex items-center justify-between gap-3 pt-2">
                <Button
                  variant="ghost"
                  size="md"
                  onClick={handleBack}
                  disabled={!canGoBack}
                  className="rounded-2xl px-4 py-3 text-sm font-bold"
                >
                  <ChevronRight className="h-5 w-5" />
                  مرحله قبل
                </Button>

                <Button
                  size="md"
                  onClick={handleNext}
                  disabled={!canContinue}
                  className="rounded-2xl px-5 py-3 text-sm font-black shadow-lg shadow-teal-600/15"
                >
                  ادامه
                  <ChevronLeft className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {mode === 'review' && (
          <motion.div
            key="review"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="rounded-3xl border border-white/60 bg-white/70 p-4 backdrop-blur sm:p-6"
          >
            <div className="space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-lg font-black text-slate-900">خلاصه درخواست</div>
                  <div className="mt-1 text-sm text-slate-500">قبل از ارسال، یک نگاه سریع به انتخاب‌ها بیندازید.</div>
                </div>
                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
              </div>

              <div className="grid gap-3">
                {buildSummary(form, answers).map((item) => (
                  <div
                    key={item.questionId}
                    className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
                  >
                    <div className="text-xs font-bold text-slate-500">{item.question}</div>
                    <div className="mt-2 text-sm font-black text-slate-900">{item.value}</div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between gap-3">
                <Button
                  variant="ghost"
                  size="md"
                  onClick={() => {
                    setMode('question');
                    const last = history[history.length - 1];
                    if (last) {
                      setCurrentKey(last);
                      setHistory((prev) => prev.slice(0, -1));
                    }
                  }}
                  className="rounded-2xl px-4 py-3 text-sm font-bold"
                >
                  <ChevronRight className="h-5 w-5" />
                  ویرایش
                </Button>

                <Button
                  size="md"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="rounded-2xl px-5 py-3 text-sm font-black shadow-lg shadow-teal-600/20"
                >
                  {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'ثبت نهایی درخواست'}
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {mode === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="rounded-3xl border border-emerald-100 bg-emerald-50/70 p-5 backdrop-blur"
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-lg font-black text-slate-900">درخواست شما ثبت شد</div>
                  <div className="mt-1 text-sm text-slate-600">کد پیگیری را نگه دارید. پیامک تایید هم ارسال می‌شود.</div>
                </div>
                <CheckCircle2 className="h-7 w-7 text-emerald-600" />
              </div>

              <div className="rounded-2xl bg-white p-4 text-center shadow-sm">
                <div className="text-xs font-bold text-slate-500">کد پیگیری</div>
                <div className="mt-2 text-xl font-black tracking-wider text-slate-900">{trackingCode}</div>
              </div>

              <Button
                size="md"
                onClick={onCompleted}
                className="w-full rounded-2xl py-3 text-sm font-black shadow-lg shadow-emerald-600/20"
              >
                بستن
              </Button>
            </div>
          </motion.div>
        )}

        {mode === 'error' && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="rounded-3xl border border-rose-100 bg-rose-50/70 p-5 backdrop-blur"
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-lg font-black text-slate-900">مشکل در ثبت درخواست</div>
                  <div className="mt-1 text-sm text-slate-600">{errorMessage}</div>
                </div>
                <XCircle className="h-7 w-7 text-rose-600" />
              </div>

              <div className="flex items-center justify-between gap-3">
                <Button
                  variant="ghost"
                  size="md"
                  onClick={() => {
                    setMode('question');
                    setErrorMessage('');
                  }}
                  className="rounded-2xl px-4 py-3 text-sm font-bold"
                >
                  تلاش دوباره
                </Button>
                <Button
                  size="md"
                  onClick={onCompleted}
                  className="rounded-2xl px-4 py-3 text-sm font-black"
                >
                  بستن
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function QuestionRenderer({
  question,
  answer,
  onChange,
  onQuickAdvance,
}: {
  question: Question;
  answer?: AssessmentAnswerDto;
  onChange: (value: AssessmentAnswerDto) => void;
  onQuickAdvance: () => void;
}) {
  if (Number(question.type) === QuestionType.MultipleChoice) {
    return (
      <div className="grid gap-3">
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
              className={cn(
                'w-full rounded-2xl border-2 px-4 py-4 text-right text-sm font-bold transition-colors',
                selected ? 'border-teal-500 bg-teal-50 text-teal-800' : 'border-white/80 bg-white/80 text-slate-700 hover:border-teal-200'
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="leading-7">{opt.text}</span>
                {selected && <CheckCircle2 className="h-5 w-5 text-emerald-600" />}
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
      <div className="grid grid-cols-2 gap-3">
        <OptionChip selected={value === true} onClick={() => { onChange({ questionId: question.questionId, booleanResponse: true }); onQuickAdvance(); }}>
          بله
        </OptionChip>
        <OptionChip selected={value === false} onClick={() => { onChange({ questionId: question.questionId, booleanResponse: false }); onQuickAdvance(); }}>
          خیر
        </OptionChip>
      </div>
    );
  }

  if (Number(question.type) === QuestionType.ShortAnswer) {
    return (
      <input
        type="text"
        value={answer?.textResponse || ''}
        placeholder={question.placeholder || 'پاسخ کوتاه...'}
        onChange={(event) => onChange({ questionId: question.questionId, textResponse: event.target.value })}
        className="w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-4 text-sm font-bold text-slate-900 outline-none ring-0 transition focus:border-teal-400"
      />
    );
  }

  if (Number(question.type) === QuestionType.LongAnswer) {
    return (
      <textarea
        rows={4}
        value={answer?.textResponse || ''}
        placeholder={question.placeholder || 'توضیح کوتاه...'}
        onChange={(event) => onChange({ questionId: question.questionId, textResponse: event.target.value })}
        className="w-full resize-none rounded-2xl border border-white/70 bg-white/80 px-4 py-4 text-sm font-bold text-slate-900 outline-none ring-0 transition focus:border-teal-400"
      />
    );
  }

  if (Number(question.type) === QuestionType.Number) {
    return (
      <input
        type="number"
        value={answer?.numberResponse ?? ''}
        placeholder={question.placeholder || ''}
        onChange={(event) => onChange({ questionId: question.questionId, numberResponse: event.target.value === '' ? undefined : Number(event.target.value) })}
        className="w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-4 text-sm font-bold text-slate-900 outline-none ring-0 transition focus:border-teal-400"
      />
    );
  }

  if (Number(question.type) === QuestionType.Date) {
    return (
      <input
        type="date"
        value={answer?.dateResponse || ''}
        onChange={(event) => onChange({ questionId: question.questionId, dateResponse: event.target.value })}
        className="w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-4 text-sm font-bold text-slate-900 outline-none ring-0 transition focus:border-teal-400"
      />
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
      این نوع سؤال در این ویزارد پشتیبانی نمی‌شود.
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
        'rounded-2xl border-2 px-4 py-4 text-center text-sm font-black transition',
        selected ? 'border-teal-500 bg-teal-50 text-teal-800' : 'border-white/80 bg-white/80 text-slate-700 hover:border-teal-200'
      )}
    >
      {children}
    </motion.button>
  );
}

function buildSummary(form: AssessmentForm, answers: AnswersMap) {
  const items = form.questions
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((q) => {
      const answer = answers[q.questionId];
      if (!answer) return null;
      const value = renderAnswerValue(q, answer);
      if (!value) return null;
      return { questionId: q.questionId, question: q.question, value };
    })
    .filter(Boolean) as Array<{ questionId: number; question: string; value: string }>;

  return items;
}

function renderAnswerValue(question: Question, answer: AssessmentAnswerDto) {
  if (answer.selectedOptionId !== undefined) {
    const opt = question.options?.find((o) => o.id === answer.selectedOptionId);
    return opt?.text ?? '';
  }
  if (answer.booleanResponse !== undefined) {
    return answer.booleanResponse ? 'بله' : 'خیر';
  }
  if (answer.numberResponse !== undefined) {
    return String(answer.numberResponse);
  }
  if (answer.dateResponse) {
    return answer.dateResponse;
  }
  if (answer.textResponse?.trim()) {
    return answer.textResponse.trim();
  }
  if (answer.jsonResponse?.trim()) {
    return answer.jsonResponse.trim();
  }
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
    if (selectedOpt?.nextQuestionKey) {
      nextKey = selectedOpt.nextQuestionKey;
    }
  }

  if (Number(currentQuestion.type) === QuestionType.TrueFalse && answer?.booleanResponse !== undefined) {
    const expectedValue = answer.booleanResponse ? 1 : 0;
    const selectedOpt = currentQuestion.options?.find((o) => o.value === expectedValue);
    if (selectedOpt?.nextQuestionKey) {
      nextKey = selectedOpt.nextQuestionKey;
    }
  }

  if (nextKey) {
    const next = sorted.find((q) => q.questionKey === nextKey);
    if (next && isQuestionVisible(next, allQuestions, answers)) {
      return next.questionKey ?? null;
    }

    return next?.questionKey ?? null;
  }

  const index = sorted.findIndex((q) => q.questionId === currentQuestion.questionId);
  for (let i = index + 1; i < sorted.length; i += 1) {
    const candidate = sorted[i];
    if (!candidate.questionKey) continue;
    if (isQuestionVisible(candidate, allQuestions, answers)) {
      return candidate.questionKey;
    }
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

function validateQuestion(question: Question, answer: AssessmentAnswerDto | undefined, required: boolean) {
  if (required && !hasAnswerValue(answer)) {
    return 'این سوال الزامی است.';
  }

  if (!question.validationJson || !answer) {
    return null;
  }

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
      if (!regex.test(value)) {
        return rule.message || 'فرمت وارد شده معتبر نیست.';
      }
    }
  } catch {
    return null;
  }

  return null;
}
