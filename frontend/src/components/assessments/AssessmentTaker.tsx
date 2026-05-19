'use client';

import { useState } from 'react';
import { AssessmentForm, AssessmentAnswerDto, QuestionType, SubmitAssessmentDto } from '@/types/assessment';
import { Send, CheckCircle, AlertCircle } from 'lucide-react';

interface AssessmentTakerProps {
  form: AssessmentForm;
  onSubmit: (data: SubmitAssessmentDto) => Promise<void>;
  loading: boolean;
  careRecipientId?: string;
}

export default function AssessmentTaker({ form, onSubmit, loading, careRecipientId }: AssessmentTakerProps) {
  const [answers, setAnswers] = useState<Record<number, AssessmentAnswerDto>>({});
  const [error, setError] = useState<string | null>(null);

  const handleOptionSelect = (questionId: number, optionId: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        questionId,
        selectedOptionId: optionId
      }
    }));
  };

  const handleBooleanSelect = (questionId: number, value: boolean) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        questionId,
        booleanResponse: value
      }
    }));
  };

  const handleTextChange = (questionId: number, text: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        questionId,
        textResponse: text
      }
    }));
  };

  const getVisibleQuestions = () => {
    if (!form.questions || form.questions.length === 0) return [];
    
    const sortedQuestions = [...form.questions].sort((a, b) => a.order - b.order);
    const visible = [];
    const visited = new Set();
    
    let currentQuestion: typeof sortedQuestions[0] | undefined = sortedQuestions[0];
    
    while (currentQuestion && !visited.has(currentQuestion.questionId)) {
      visible.push(currentQuestion);
      visited.add(currentQuestion.questionId);
      
      const answer = answers[currentQuestion.questionId];
      
      let isAnswered = false;
      if (answer) {
         if (Number(currentQuestion.type) === QuestionType.MultipleChoice && answer.selectedOptionId !== undefined) isAnswered = true;
         if (Number(currentQuestion.type) === QuestionType.TrueFalse && answer.booleanResponse !== undefined) isAnswered = true;
         if ((Number(currentQuestion.type) === QuestionType.ShortAnswer || Number(currentQuestion.type) === QuestionType.LongAnswer) && !!answer.textResponse?.trim()) isAnswered = true;
      }

      if (!isAnswered) {
        break; // Stop showing more questions until this one is answered
      }
      
      let nextKey = currentQuestion.nextQuestionKey;
      
      if (Number(currentQuestion.type) === QuestionType.MultipleChoice && answer.selectedOptionId) {
        const selectedOpt = currentQuestion.options?.find(o => o.id === answer.selectedOptionId);
        if (selectedOpt?.nextQuestionKey) {
          nextKey = selectedOpt.nextQuestionKey;
        }
      } else if (Number(currentQuestion.type) === QuestionType.TrueFalse && answer.booleanResponse !== undefined) {
         const expectedScore = answer.booleanResponse ? 1 : 0;
         const selectedOpt = currentQuestion.options?.find(o => o.value === expectedScore || (o as unknown as {scoreValue?: number}).scoreValue === expectedScore);
         if (selectedOpt?.nextQuestionKey) {
            nextKey = selectedOpt.nextQuestionKey;
         }
      }
      
      let nextQ = null;
      if (nextKey) {
         nextQ = sortedQuestions.find(q => q.questionKey === nextKey);
      }
      
      if (nextQ) {
         currentQuestion = nextQ;
      } else {
         const currentIndex = sortedQuestions.findIndex(q => q.questionId === currentQuestion.questionId);
         currentQuestion = sortedQuestions[currentIndex + 1];
      }
    }
    
    return visible;
  };

  const visibleQuestions = getVisibleQuestions();

  const validate = () => {
    for (const q of visibleQuestions) {
      const ans = answers[q.questionId];
      let isAnswered = false;
      if (ans) {
         if (Number(q.type) === QuestionType.MultipleChoice && ans.selectedOptionId !== undefined) isAnswered = true;
         if (Number(q.type) === QuestionType.TrueFalse && ans.booleanResponse !== undefined) isAnswered = true;
         if ((Number(q.type) === QuestionType.ShortAnswer || Number(q.type) === QuestionType.LongAnswer) && !!ans.textResponse?.trim()) isAnswered = true;
      }
      if (!isAnswered) {
        setError(`لطفا به سوال "${q.question}" پاسخ دهید.`);
        return false;
      }
    }
    setError(null);
    return true;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    // Only submit answers for visible questions
    const visibleQuestionIds = new Set(visibleQuestions.map(q => q.questionId));
    const finalAnswers = Object.values(answers).filter(a => visibleQuestionIds.has(a.questionId));

    const submitData: SubmitAssessmentDto = {
      formId: form.id,
      careRecipientId,
      answers: finalAnswers
    };

    onSubmit(submitData);
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto pb-20">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">{form.title}</h1>
        <p className="text-gray-500">{form.description}</p>
      </div>

      <div className="space-y-6">
        {visibleQuestions.map((q, index) => (
          <div key={q.questionId} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
            <div className="flex gap-3 mb-4">
              <span className="flex-shrink-0 w-8 h-8 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center font-bold text-sm">
                {index + 1}
              </span>
              <h3 className="text-lg font-medium text-gray-800 pt-1">{q.question}</h3>
            </div>

            <div className="mr-11 space-y-3">
              {/* Multiple Choice */}
              {Number(q.type) === QuestionType.MultipleChoice && (
                <div className="grid grid-cols-1 gap-3">
                  {q.options.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => handleOptionSelect(q.questionId, opt.id)}
                      className={`text-right w-full p-4 rounded-xl border-2 transition-all ${
                        answers[q.questionId]?.selectedOptionId === opt.id
                          ? 'border-teal-500 bg-teal-50 text-teal-700 font-medium'
                          : 'border-gray-100 hover:border-teal-200 text-gray-600'
                      }`}
                    >
                      {opt.text}
                    </button>
                  ))}
                </div>
              )}

              {/* True/False */}
              {Number(q.type) === QuestionType.TrueFalse && (
                <div className="flex gap-4">
                  <button
                    onClick={() => handleBooleanSelect(q.questionId, true)}
                    className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                      answers[q.questionId]?.booleanResponse === true
                        ? 'border-teal-500 bg-teal-50 text-teal-700 font-medium'
                        : 'border-gray-100 hover:border-teal-200 text-gray-600'
                    }`}
                  >
                    بله
                  </button>
                  <button
                    onClick={() => handleBooleanSelect(q.questionId, false)}
                    className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                      answers[q.questionId]?.booleanResponse === false
                        ? 'border-teal-500 bg-teal-50 text-teal-700 font-medium'
                        : 'border-gray-100 hover:border-teal-200 text-gray-600'
                    }`}
                  >
                    خیر
                  </button>
                </div>
              )}

              {/* Short Answer */}
              {Number(q.type) === QuestionType.ShortAnswer && (
                <input
                  type="text"
                  placeholder="پاسخ خود را بنویسید..."
                  className="w-full p-4 rounded-xl border-2 border-gray-100 focus:border-teal-500 focus:ring-0 outline-none transition-all"
                  onChange={(e) => handleTextChange(q.questionId, e.target.value)}
                  value={answers[q.questionId]?.textResponse || ''}
                />
              )}

              {/* Long Answer */}
              {Number(q.type) === QuestionType.LongAnswer && (
                <textarea
                  rows={4}
                  placeholder="توضیحات خود را بنویسید..."
                  className="w-full p-4 rounded-xl border-2 border-gray-100 focus:border-teal-500 focus:ring-0 outline-none transition-all resize-none"
                  onChange={(e) => handleTextChange(q.questionId, e.target.value)}
                  value={answers[q.questionId]?.textResponse || ''}
                />
              )}
            </div>
          </div>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-2">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-teal-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {loading ? (
          'در حال ارسال...'
        ) : (
          <>
            <Send size={20} />
            ثبت نهایی پاسخ‌ها
          </>
        )}
      </button>
    </div>
  );
}
