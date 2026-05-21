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
  const percentage = Math.round(((currentStep - 1) / totalSteps) * 100);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          مرحله {currentStep} از {totalSteps}
        </span>
        <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
          {percentage}% تکمیل شده
        </span>
      </div>
      
      {/* Progress Bar */}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-8">
        <div 
          className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-out" 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>

      {/* Stepper Dots (Visible on larger screens) */}
      <div className="hidden md:flex justify-between items-center relative">
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-0.5 bg-gray-200 dark:bg-gray-700 -z-10"></div>
        {steps.map((label, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          
          return (
            <div key={index} className="flex flex-col items-center relative z-10">
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
              <span className={`mt-2 text-xs font-medium absolute top-8 w-24 text-center ${
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
