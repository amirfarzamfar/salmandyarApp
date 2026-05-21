import React from 'react';
import { Check } from 'lucide-react';

interface Props {
  currentStep: number;
  totalSteps: number;
}

const steps = [
  'اطلاعات هویتی',
  'اطلاعات تماس',
  'وضعیت فیزیکی',
  'سوابق پزشکی',
  'داروها و آلرژی',
  'اطلاعات درمانی',
  'ارزیابی سالمند',
  'مدارک'
];

export default function ProfileWizardProgress({ currentStep, totalSteps }: Props) {
  const safeCurrentStep = Math.min(Math.max(currentStep, 1), totalSteps);
  const percentage = Math.round(((safeCurrentStep - 1) / totalSteps) * 100);
  const currentLabel = steps[safeCurrentStep - 1];

  return (
    <div className="w-full">
      <div className="mb-4 flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          مرحله {safeCurrentStep} از {totalSteps}
        </span>
        <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-bold text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
          {percentage}% تکمیل شده
        </span>
      </div>

      <div className="mb-5 h-2.5 w-full rounded-full bg-gray-200 dark:bg-gray-700">
        <div
          className="h-2.5 rounded-full bg-blue-600 transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="mb-2 rounded-2xl border border-gray-100 bg-gray-50/80 p-4 dark:border-gray-800 dark:bg-gray-800/70 md:hidden">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">مرحله فعلی</p>
            <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">{currentLabel}</p>
          </div>
          <div className="rounded-2xl bg-white px-3 py-2 text-center shadow-sm dark:bg-gray-900">
            <span className="block text-lg font-bold text-blue-600 dark:text-blue-400">{safeCurrentStep}</span>
            <span className="text-[11px] text-gray-500 dark:text-gray-400">از {totalSteps}</span>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {steps.map((label, index) => {
            const stepNumber = index + 1;
            const isCompleted = stepNumber < safeCurrentStep;
            const isCurrent = stepNumber === safeCurrentStep;

            return (
              <div
                key={label}
                className={`min-w-fit rounded-full border px-3 py-2 text-xs font-medium whitespace-nowrap transition-colors ${
                  isCompleted
                    ? 'border-green-200 bg-green-50 text-green-700 dark:border-green-900/60 dark:bg-green-900/20 dark:text-green-300'
                    : isCurrent
                      ? 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/60 dark:bg-blue-900/20 dark:text-blue-300'
                      : 'border-gray-200 bg-white text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400'
                }`}
              >
                {stepNumber}. {label}
              </div>
            );
          })}
        </div>
      </div>

      <div className="relative hidden grid-cols-8 gap-2 pb-10 md:grid">
        <div className="absolute left-0 top-1/2 -z-10 h-0.5 w-full -translate-y-1/2 bg-gray-200 dark:bg-gray-700"></div>
        {steps.map((label, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < safeCurrentStep;
          const isCurrent = stepNumber === safeCurrentStep;

          return (
            <div key={label} className="relative z-10 flex min-w-0 flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2 transition-colors duration-300 ${
                  isCompleted
                    ? 'bg-green-500 border-green-500 text-white'
                    : isCurrent
                      ? 'bg-blue-600 border-blue-600 text-white ring-4 ring-blue-100 dark:ring-blue-900' 
                      : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400'
                }`}
              >
                {isCompleted ? <Check className="w-4 h-4" /> : stepNumber}
              </div>
              <span className={`absolute top-10 w-full max-w-[92px] text-center text-[11px] leading-4 font-medium whitespace-normal ${
                isCurrent ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'
              }`}>
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
