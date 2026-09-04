'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type {
  HealthTest,
  HealthTestAnswerState,
  HealthTestRuntimeState,
  HealthTestStep,
} from '@/lib/health-tests/types';
import {
  clearState,
  computeResult,
  createInitialState,
  isTestComplete,
  loadState,
  saveState,
  calculateScores,
} from '@/lib/health-tests/test-engine';

export interface UseHealthTestApi {
  test: HealthTest;
  state: HealthTestRuntimeState;
  currentStep: HealthTestStep;
  totalQuestions: number;
  answeredCount: number;
  progressPercentage: number;
  scorePercentageSoFar: number;
  currentStageKind: 'start' | 'awareness' | 'evaluation' | 'result';
  stageProgress: number;
  stageMeta: { label: string; fromStep: number; toStep: number } | null;
  canGoBack: boolean;
  canGoForward: boolean;
  setForSelf: (value: boolean) => void;
  startQuestionFlow: () => void;
  selectOption: (questionId: string, optionId: string) => void;
  goBack: () => void;
  goForward: () => void;
  resetAndRestart: () => void;
  goToStep: (step: HealthTestStep) => void;
}

export function useHealthTest(test: HealthTest): UseHealthTestApi {
  const [state, setState] = useState<HealthTestRuntimeState>(() => {
    const hydrated = loadState(test.id);
    if (hydrated && hydrated.testId === test.id) {
      return hydrated;
    }
    return createInitialState(test.id);
  });

  const prevJsonRef = useRef<string>('');

  useEffect(() => {
    const json = JSON.stringify(state);
    if (prevJsonRef.current === json) return;
    prevJsonRef.current = json;
    saveState(state);
  }, [state]);

  const totalQuestions = test.questions.length;

  const answeredCount = useMemo(
    () => Object.values(state.answers).filter(Boolean).length,
    [state.answers],
  );

  const progressPercentage =
    totalQuestions === 0 ? 0 : Math.round((answeredCount / totalQuestions) * 100);

  const scorePercentageSoFar = useMemo(() => {
    if (answeredCount === 0) return 0;
    const { percentage } = calculateScores(test, state.answers);
    return percentage;
  }, [test, state.answers, answeredCount]);

  const stages = useMemo(() => test.stages || [
    { kind: 'start' as const, title: 'شروع', startQuestionIndex: 0, endQuestionIndexExclusive: Math.max(1, Math.floor(totalQuestions / 4)) },
    { kind: 'awareness' as const, title: 'شناخت', startQuestionIndex: Math.floor(totalQuestions / 4), endQuestionIndexExclusive: Math.max(2, Math.floor((totalQuestions * 2) / 4)) },
    { kind: 'evaluation' as const, title: 'بررسی', startQuestionIndex: Math.floor((totalQuestions * 2) / 4), endQuestionIndexExclusive: totalQuestions },
    { kind: 'result' as const, title: 'نتیجه', startQuestionIndex: totalQuestions, endQuestionIndexExclusive: totalQuestions },
  ], [test.stages, totalQuestions]);

  const stageMeta = useMemo(() => {
    const s = stages.find(
      st =>
        state.currentQuestionIndex >= st.startQuestionIndex &&
        state.currentQuestionIndex < st.endQuestionIndexExclusive,
    );
    if (state.currentStep === 'result') {
      const last = stages[stages.length - 1];
      return last
        ? { label: last.title, fromStep: last.startQuestionIndex, toStep: totalQuestions }
        : null;
    }
    if (!s) return null;
    return { label: s.title, fromStep: s.startQuestionIndex, toStep: s.endQuestionIndexExclusive };
  }, [stages, state.currentStep, state.currentQuestionIndex, totalQuestions]);

  const currentStageKind = useMemo<
    'start' | 'awareness' | 'evaluation' | 'result'
  >(() => {
    if (state.currentStep === 'result') return 'result';
    if (!stageMeta) return 'start';
    const matched = stages.find(s => s.title === stageMeta.label);
    return matched ? matched.kind : 'start';
  }, [state.currentStep, stageMeta, stages]);

  const stageProgress = useMemo(() => {
    if (!stageMeta) return 0;
    const { fromStep, toStep } = stageMeta;
    if (toStep <= fromStep) return 100;
    const qIndex = state.currentStep === 'result' ? totalQuestions : state.currentQuestionIndex;
    const clamped = Math.min(Math.max(qIndex, fromStep), toStep);
    return Math.round(((clamped - fromStep) / (toStep - fromStep)) * 100);
  }, [stageMeta, state.currentQuestionIndex, state.currentStep, totalQuestions]);

  const canGoBack =
    state.currentStep === 'question' && state.currentQuestionIndex > 0;

  const canGoForward =
    state.currentStep === 'question' &&
    Boolean(state.answers[test.questions[state.currentQuestionIndex]?.id] || '') &&
    state.currentQuestionIndex < totalQuestions - 1;

  const setForSelf = useCallback((value: boolean) => {
    setState(prev => ({ ...prev, forSelf: value }));
  }, []);

  const startQuestionFlow = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentStep: 'question',
      currentQuestionIndex: 0,
    }));
  }, []);

  const selectOption = useCallback(
    (questionId: string, optionId: string) => {
      setState(prev => {
        const nextAnswers: HealthTestAnswerState = {
          ...prev.answers,
          [questionId]: optionId,
        };
        const wasUnanswered = !prev.answers[questionId];
        const questionIdx = test.questions.findIndex(q => q.id === questionId);
        const nextLastAnswered = Math.max(
          questionIdx,
          prev.lastAnsweredQuestionIndex ?? -1,
        );

        const allAnswered = isTestComplete(test, nextAnswers);

        if (allAnswered) {
          return {
            ...prev,
            answers: nextAnswers,
            currentStep: 'result',
            lastAnsweredQuestionIndex: nextLastAnswered,
          };
        }

        const autoNext =
          wasUnanswered &&
          prev.currentStep === 'question' &&
          questionIdx === prev.currentQuestionIndex &&
          prev.currentQuestionIndex < totalQuestions - 1;

        return {
          ...prev,
          answers: nextAnswers,
          currentQuestionIndex: autoNext
            ? Math.min(prev.currentQuestionIndex + 1, totalQuestions - 1)
            : prev.currentQuestionIndex,
          lastAnsweredQuestionIndex: nextLastAnswered,
        };
      });
    },
    [test, totalQuestions],
  );

  const goBack = useCallback(() => {
    setState(prev => {
      if (prev.currentStep === 'result') {
        return { ...prev, currentStep: 'question', currentQuestionIndex: totalQuestions - 1 };
      }
      if (prev.currentQuestionIndex > 0) {
        return {
          ...prev,
          currentStep: 'question',
          currentQuestionIndex: prev.currentQuestionIndex - 1,
        };
      }
      return { ...prev, currentStep: 'intro' };
    });
  }, [totalQuestions]);

  const goForward = useCallback(() => {
    setState(prev => {
      if (prev.currentStep !== 'question') return prev;
      if (prev.currentQuestionIndex < totalQuestions - 1) {
        return {
          ...prev,
          currentQuestionIndex: prev.currentQuestionIndex + 1,
        };
      }
      const allAnswered = isTestComplete(test, prev.answers);
      if (allAnswered) {
        return { ...prev, currentStep: 'result' };
      }
      return prev;
    });
  }, [test, totalQuestions]);

  const resetAndRestart = useCallback(() => {
    clearState(test.id);
    setState(createInitialState(test.id));
  }, [test.id]);

  const goToStep = useCallback((step: HealthTestStep) => {
    setState(prev => ({ ...prev, currentStep: step }));
  }, []);

  return {
    test,
    state,
    currentStep: state.currentStep,
    totalQuestions,
    answeredCount,
    progressPercentage,
    scorePercentageSoFar,
    currentStageKind,
    stageProgress,
    stageMeta,
    canGoBack,
    canGoForward,
    setForSelf,
    startQuestionFlow,
    selectOption,
    goBack,
    goForward,
    resetAndRestart,
    goToStep,
  };
}

export function useHealthTestResult(test: HealthTest, answers: HealthTestAnswerState) {
  return useMemo(() => {
    if (!isTestComplete(test, answers)) return null;
    return computeResult(test, answers);
  }, [test, answers]);
}
