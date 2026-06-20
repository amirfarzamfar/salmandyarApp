import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { medicationSchema, MedicationFormData } from '../../types';
import { Step1_DrugInfo } from './Step1_DrugInfo';
import { Step2_Scheduling } from './Step2_Scheduling';
import { Step3_Safety } from './Step3_Safety';
import { Step4_Notifications } from './Step4_Notifications';
import { Check, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';

interface MedicationWizardProps {
  patientId: number;
  initialData?: Partial<MedicationFormData>;
  onSuccess: () => void;
  onCancel: () => void;
  onSubmit: (data: MedicationFormData) => Promise<void>;
}

const STEPS = [
  { id: 1, title: 'مشخصات دارو', component: Step1_DrugInfo },
  { id: 2, title: 'زمان‌بندی', component: Step2_Scheduling },
  { id: 3, title: 'ایمنی و هشدار', component: Step3_Safety },
  { id: 4, title: 'تنظیمات نهایی', component: Step4_Notifications },
];

export const MedicationWizard = ({ patientId, initialData, onSuccess, onCancel, onSubmit }: MedicationWizardProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = !!initialData;

  const methods = useForm<MedicationFormData>({
    resolver: zodResolver(medicationSchema) as any,
    defaultValues: {
      careRecipientId: patientId,
      frequencyType: 0, // Daily
      criticality: 0, // Routine
      highAlert: false,
      isPRN: false,
      gracePeriodMinutes: 30,
      escalationEnabled: false,
      notifyPatient: false,
      notifyNurse: false,
      notifySupervisor: false,
      notifyFamily: false,
      totalQuantity: 0,
      alertLimit: 0,
      doseQuantity: 1,
      alertLowStockInAppEnabled: true,
      alertLowStockSmsEnabled: false,
      alertLowStockEmailEnabled: false,
      alertLowStockPatient: false,
      alertLowStockNurse: false,
      alertLowStockFamily: false,
      alertLowStockAdmin: false,
      alertLowStockCustomPhone: '',
      alertLowStockCustomEmail: '',
      ...initialData // Override defaults with initialData if present
    },
    mode: 'onChange' // Validate on change for better UX
  });

  const handleNext = async () => {
    const fieldsToValidate = getFieldsForStep(currentStep);
    const isValid = await methods.trigger(fieldsToValidate as any);

    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const onFormSubmit = async (data: MedicationFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
      toast.success(isEditMode ? 'دارو با موفقیت ویرایش شد' : 'دارو با موفقیت ثبت شد');
      onSuccess();
    } catch (error) {
      const serverMsg =
        (error as any)?.response?.data?.error ||
        (error as any)?.response?.data?.message ||
        (error as any)?.message;
      toast.error(serverMsg || (isEditMode ? 'خطا در ویرایش دارو' : 'خطا در ثبت دارو'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFieldsForStep = (step: number): (keyof MedicationFormData)[] => {
    switch (step) {
      case 1: return ['name', 'form', 'dosage', 'route'];
      case 2: return ['frequencyType', 'startDate', 'endDate', 'frequencyDetail'];
      case 3: return ['criticality', 'highAlert', 'isPRN'];
      case 4: return ['gracePeriodMinutes', 'escalationEnabled', 'totalQuantity', 'alertLimit'];
      default: return [];
    }
  };

  const CurrentComponent = STEPS[currentStep - 1].component;
  const isLastStep = currentStep === STEPS.length;

  return (
    <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
      {/* Header */}
      <div className="bg-gradient-to-l from-teal-600 to-teal-700 p-6 text-white flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">{isEditMode ? 'ویرایش دارو' : 'افزودن داروی جدید'}</h2>
          <p className="text-teal-100 text-sm mt-1">
            گام {currentStep} از {STEPS.length}: {STEPS[currentStep - 1].title}
          </p>
        </div>
        <button onClick={onCancel} className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="h-1 bg-gray-100 w-full">
        <div 
          className="h-full bg-teal-500 transition-all duration-500 ease-out"
          style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
        />
      </div>

      {/* Body */}
      <div className="min-h-0 flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
        <FormProvider {...methods}>
          {/* Prevent default form submission on enter key, except on last step if needed */}
          <form 
            id="medication-wizard-form"
            onSubmit={(e) => {
              e.preventDefault();
              if (isLastStep) {
                methods.handleSubmit(onFormSubmit)(e);
              } else {
                handleNext();
              }
            }}
          >
            <CurrentComponent />
          </form>
        </FormProvider>
      </div>

      {/* Footer */}
      <div className="flex flex-col-reverse gap-3 border-t bg-gray-50 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <button
          type="button"
          onClick={handleBack}
          disabled={currentStep === 1}
          className="flex w-full items-center justify-center gap-2 rounded-xl px-6 py-2.5 font-medium text-gray-600 transition-all hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          <ChevronRight className="w-5 h-5" /> {/* RTL: Right is Back */}
          بازگشت
        </button>

        {isLastStep ? (
          <button
            type="button"
            onClick={methods.handleSubmit(onFormSubmit)}
            disabled={isSubmitting || !methods.formState.isValid}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 px-8 py-2.5 font-bold text-white shadow-lg shadow-teal-200 transition-all hover:-translate-y-0.5 hover:bg-teal-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                در حال ثبت...
              </span>
            ) : (
              <>
                <Check className="w-5 h-5" />
                {isEditMode ? 'ویرایش نهایی' : 'ثبت نهایی'}
              </>
            )}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleNext}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 px-8 py-2.5 font-bold text-white shadow-lg shadow-teal-200 transition-all hover:-translate-y-0.5 hover:bg-teal-700 hover:shadow-xl sm:w-auto"
          >
            مرحله بعد
            <ChevronLeft className="w-5 h-5" /> {/* RTL: Left is Next */}
          </button>
        )}
      </div>
    </div>
  );
};
