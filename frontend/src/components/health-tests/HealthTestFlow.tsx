'use client';

import { AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { getHealthTestBySlug } from '@/lib/health-tests/tests';
import { cn } from '@/lib/utils';
import { useHealthTest } from './useHealthTest';
import HealthTestProgressStepper from './HealthTestProgressStepper';
import HealthTestIntroStep from './HealthTestIntroStep';
import HealthTestQuestionStep from './HealthTestQuestionStep';

import HealthTestResultStep from './HealthTestResultStep';

interface HealthTestFlowProps {
  slug: string;
  baseUrl?: string;
  className?: string;
  onViewBackToHub?: () => void;
}

export default function HealthTestFlow({
  slug,
  className,
  onViewBackToHub,
}: HealthTestFlowProps) {
  const test = getHealthTestBySlug(slug);

  if (!test) {
    return (
      <section
        className={cn(
          'rounded-[2rem] bg-rose-50 border border-rose-200 p-8 sm:p-10 text-center',
          className,
        )}
      >
        <div className="w-16 h-16 rounded-2xl bg-rose-100 border border-rose-200 flex items-center justify-center mx-auto mb-5">
          <AlertTriangle size={28} className="text-rose-600" />
        </div>
        <h2 className="text-xl font-black text-rose-900 mb-2">تست مورد نظر یافت نشد</h2>
        <p className="text-rose-800 leading-relaxed">
          متأسفانه تست درخواستی شما در دسترس نیست. لطفاً از طریق صفحه تست‌های سلامت
          تست معتبر را انتخاب کنید.
        </p>
      </section>
    );
  }

  return (
    <HealthTestFlowRunner
      test={test}
      className={className}
      onViewBackToHub={onViewBackToHub}
    />
  );
}

interface HealthTestFlowRunnerProps {
  test: NonNullable<ReturnType<typeof getHealthTestBySlug>>;
  baseUrl?: string;
  className?: string;
  onViewBackToHub?: () => void;
}

function HealthTestFlowRunner({
  test,
  className,
  onViewBackToHub,
}: HealthTestFlowRunnerProps) {
  const api = useHealthTest(test);
  const {
    currentStep,
    totalQuestions,
    answeredCount,
    progressPercentage,
    scorePercentageSoFar,
    currentStageKind,
    stageProgress,
    canGoBack,
    canGoForward,
    state,
    setForSelf,
    startQuestionFlow,
    selectOption,
    goBack,
    goForward,
    resetAndRestart,
  } = api;

  const questionLabel =
    currentStep === 'question'
      ? `سؤال ${state.currentQuestionIndex + 1} از ${totalQuestions}`
      : currentStep === 'result'
        ? 'نتیجه تست'
        : 'آماده‌سازی تست';

  return (
    <div className={cn('w-full', className)}>
      {currentStep !== 'intro' ? (
        <HealthTestProgressStepper
          currentStageKind={currentStageKind}
          stageProgress={stageProgress}
          progressPercentage={progressPercentage}
          questionLabel={questionLabel}
        />
      ) : null}

      <div className="relative">
        <AnimatePresence mode="wait">
          {currentStep === 'intro' ? (
            <HealthTestIntroStep
              key={`intro-${test.id}`}
              test={test}
              forSelf={state.forSelf}
              onSelectForSelf={setForSelf}
              onStart={startQuestionFlow}
              onBack={onViewBackToHub}
              canGoBack={Boolean(onViewBackToHub)}
            />
          ) : currentStep === 'question' ? (
            <HealthTestQuestionStep
              key={`q-${test.id}-${state.currentQuestionIndex}`}
              test={test}
              questionIndex={state.currentQuestionIndex}
              answers={state.answers}
              answeredCount={answeredCount}
              progressPercentage={progressPercentage}
              scorePercentageSoFar={scorePercentageSoFar}
              canGoBack={canGoBack || state.forSelf !== null}
              canGoForward={canGoForward || answeredCount === totalQuestions}
              onSelect={selectOption}
              onBack={goBack}
              onNext={goForward}
            />
          ) : (
            <HealthTestResultStep
              key={`result-${test.id}`}
              test={test}
              api={api}
              onReset={resetAndRestart}
              onBack={goBack}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
