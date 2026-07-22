'use client';

import { useForm, useFieldArray, SubmitHandler, Control, UseFormRegister, UseFormWatch, UseFormSetValue, UseFormGetValues } from 'react-hook-form';
import { Plus, Trash2, Save, FileText } from 'lucide-react';
import { CreateAssessmentFormDto, QuestionType, AssessmentType, AssessmentFormWorkflow } from '@/types/assessment';
import { useEffect, useMemo, useState } from 'react';
import { roleTranslations } from '@/utils/role-translation';
import { serviceCatalogService } from '@/services/service-catalog.service';
import { ServiceDefinition } from '@/types/service';
import { toast } from 'react-hot-toast';

interface AssessmentFormBuilderProps {
  initialData?: CreateAssessmentFormDto;
  onSubmit: (data: CreateAssessmentFormDto) => Promise<void>;
  loading: boolean;
  title: string;
  allowedTypes?: number[];
}

const roleTypes = [
  AssessmentType.Manager,
  AssessmentType.Supervisor,
  AssessmentType.Nurse,
  AssessmentType.AssistantNurse,
  AssessmentType.Physiotherapist,
  AssessmentType.ElderlyCareAssistant,
  AssessmentType.Elderly,
  AssessmentType.Patient,
  AssessmentType.PatientFamily
];

const workflowLabels: Record<number, string> = {
  [AssessmentFormWorkflow.Assessment]: 'آزمون / ارزیابی',
  [AssessmentFormWorkflow.UserEvaluation]: 'ارزیابی کاربر',
  [AssessmentFormWorkflow.HomeCareRequest]: 'درخواست خدمت در منزل',
  [AssessmentFormWorkflow.Checklist]: 'چک‌لیست',
  [AssessmentFormWorkflow.SatisfactionSurvey]: 'نظرسنجی رضایت',
};

export default function AssessmentFormBuilder({ initialData, onSubmit, loading, title, allowedTypes }: AssessmentFormBuilderProps) {
  const [services, setServices] = useState<ServiceDefinition[]>([]);
  const { register, control, handleSubmit, watch, setValue, reset, getValues, formState: { errors } } = useForm<CreateAssessmentFormDto>({
    defaultValues: initialData ? {
      ...initialData,
      targetTypes: initialData.targetTypes?.length ? initialData.targetTypes : [initialData.type],
    } : {
      title: '',
      description: '',
      type: AssessmentType.Nurse,
      targetTypes: [AssessmentType.Nurse],
      workflow: AssessmentFormWorkflow.Assessment,
      version: 1,
      isDefault: false,
      estimatedDurationMinutes: 10,
      questions: [
        {
          questionKey: `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          question: '',
          type: QuestionType.MultipleChoice,
          weight: 1,
          tags: [],
          order: 0,
          isRequired: true,
          options: [{ text: 'بله', scoreValue: 1, order: 0 }, { text: 'خیر', scoreValue: 0, order: 1 }]
        }
      ]
    }
  });

  // Update form if initialData changes (for edit mode)
  useEffect(() => {
    if (initialData) {
      reset({
        ...initialData,
        targetTypes: initialData.targetTypes?.length ? initialData.targetTypes : [initialData.type],
      });
    }
  }, [initialData, reset]);

  useEffect(() => {
    const loadServices = async () => {
      try {
        const data = await serviceCatalogService.getAll();
        setServices(data);
      } catch (error) {
        console.error(error);
      }
    };

    void loadServices();
  }, []);

  const selectedWorkflow = watch('workflow');
  const selectedTargetTypes = watch('targetTypes') || [];
  const availableRoleTypes = useMemo(
    () => (allowedTypes?.length ? allowedTypes : roleTypes),
    [allowedTypes]
  );
  const isHomeCareWorkflow = Number(selectedWorkflow) === AssessmentFormWorkflow.HomeCareRequest;

  useEffect(() => {
    if (!selectedTargetTypes.length) {
      setValue('targetTypes', [availableRoleTypes[0]]);
      setValue('type', availableRoleTypes[0]);
    } else {
      setValue('type', selectedTargetTypes[0]);
    }
  }, [availableRoleTypes, selectedTargetTypes, setValue]);

  useEffect(() => {
    if (!isHomeCareWorkflow) {
      setValue('serviceDefinitionId', undefined);
    }
  }, [isHomeCareWorkflow, setValue]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "questions"
  });

  const handleFormSubmit: SubmitHandler<CreateAssessmentFormDto> = (data) => {
      if (!data.targetTypes?.length) {
        toast.error('حداقل یک نقش برای نمایش فرم انتخاب کنید.');
        return;
      }

      if (Number(data.workflow) === AssessmentFormWorkflow.HomeCareRequest && !data.serviceDefinitionId) {
        toast.error('برای فرم درخواست خدمت، انتخاب خدمت الزامی است.');
        return;
      }

      // Ensure types are converted if necessary before passing to parent
      const formattedData = {
        ...data,
        type: Number(data.targetTypes[0] ?? data.type),
        targetTypes: data.targetTypes.map((type) => Number(type)),
        workflow: Number(data.workflow),
        serviceDefinitionId:
          Number(data.workflow) === AssessmentFormWorkflow.HomeCareRequest && Number.isFinite(Number(data.serviceDefinitionId))
            ? Number(data.serviceDefinitionId)
            : undefined,
        questions: data.questions.map((q, i) => ({
          ...q,
          order: i,
          type: Number(q.type),
          options: q.options.map((o, j) => ({ ...o, order: j }))
        }))
      };
      onSubmit(formattedData);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <FileText className="text-teal-400" />
          {title}
        </h1>
        <button
          onClick={handleSubmit(handleFormSubmit)}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-colors disabled:opacity-50"
        >
          <Save size={18} />
          {loading ? 'در حال ذخیره...' : 'ذخیره آزمون'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="md:col-span-1 space-y-4">
          <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 space-y-4">
            <h2 className="text-lg font-semibold text-slate-200">اطلاعات کلی</h2>

            <div className="space-y-2">
              <label className="text-sm text-slate-400">کد فرم</label>
              <input
                {...register('code')}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-teal-500 outline-none"
                placeholder="مثال: home-care-icu-v1"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm text-slate-400">عنوان آزمون</label>
              <input
                {...register('title', { required: 'عنوان الزامی است' })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-teal-500 outline-none"
                placeholder="مثال: ارزیابی اولیه پرستار"
              />
              {errors.title && <span className="text-red-400 text-xs">{errors.title.message}</span>}
            </div>

            <div className="space-y-2">
              <label className="text-sm text-slate-400">توضیحات</label>
              <textarea
                {...register('description')}
                rows={3}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-teal-500 outline-none"
                placeholder="توضیحات مختصر..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-slate-400">نقش‌های مجاز برای نمایش فرم</label>
              <div className="grid grid-cols-1 gap-2">
                {availableRoleTypes.map((type) => {
                  const checked = selectedTargetTypes.includes(type);
                  return (
                    <label
                      key={type}
                      className={`flex cursor-pointer items-center justify-between rounded-lg border px-3 py-2 text-sm transition-colors ${checked ? 'border-teal-500 bg-teal-500/10 text-white' : 'border-slate-700 bg-slate-900 text-slate-300'}`}
                    >
                      <span>{roleTranslations[AssessmentType[type]] || AssessmentType[type]}</span>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(event) => {
                          const current = watch('targetTypes') || [];
                          const next = event.target.checked
                            ? Array.from(new Set([...current, type]))
                            : current.filter((item) => item !== type);
                          setValue('targetTypes', next);
                        }}
                        className="h-4 w-4 rounded border-slate-600 bg-slate-900"
                      />
                    </label>
                  );
                })}
              </div>
              <input type="hidden" {...register('type')} />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-slate-400">Workflow فرم</label>
              <select
                {...register('workflow')}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-teal-500 outline-none"
              >
                {Object.entries(workflowLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm text-slate-400">نسخه</label>
                <input
                  type="number"
                  {...register('version', { valueAsNumber: true })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-teal-500 outline-none"
                  min={1}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-slate-400">مدت تقریبی (دقیقه)</label>
                <input
                  type="number"
                  {...register('estimatedDurationMinutes', { valueAsNumber: true })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-teal-500 outline-none"
                  min={1}
                />
              </div>
            </div>

            {isHomeCareWorkflow && (
              <div className="space-y-2">
                <label className="text-sm text-slate-400">خدمت مرتبط با این فرم</label>
                <select
                  {...register('serviceDefinitionId', { valueAsNumber: true })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-teal-500 outline-none"
                >
                  <option value="">انتخاب خدمت</option>
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.title}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-500">
                  فقط خدماتی نمایش داده می‌شوند که در بخش `مدیریت خدمات` ساخته شده‌اند.
                </p>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm text-slate-400">عنوان شروع فرم</label>
              <input
                {...register('introTitle')}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-slate-400">توضیح شروع فرم</label>
              <textarea
                {...register('introDescription')}
                rows={3}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>

            <label className="flex items-center gap-2 text-sm text-slate-300">
              <input type="checkbox" {...register('isDefault')} className="rounded border-slate-600 bg-slate-900" />
              {isHomeCareWorkflow ? 'فرم پیش‌فرض این خدمت باشد' : 'فرم پیش‌فرض این workflow باشد'}
            </label>
          </div>
        </div>

        {/* Questions Builder */}
        <div className="md:col-span-2 space-y-4">
          <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
             <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-slate-200">سوالات آزمون</h2>
                <button
                  type="button"
                  onClick={() => append({ 
                  questionKey: `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                  question: '', 
                  type: QuestionType.MultipleChoice, 
                  weight: 1, 
                  tags: [], 
                  order: fields.length,
                  isRequired: true,
                  options: [] 
                })}
                  className="text-sm flex items-center gap-1 text-teal-400 hover:text-teal-300"
                >
                  <Plus size={16} />
                  افزودن سوال
                </button>
             </div>

             <div className="space-y-4">
                {fields.map((field, index) => (
                   <QuestionItem 
                      key={field.id} 
                      index={index} 
                      control={control} 
                      register={register} 
                      remove={remove} 
                      watch={watch}
                      setValue={setValue}
                      getValues={getValues}
                      allQuestions={watch('questions')}
                   />
                ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Sub-component for individual question editing
function QuestionItem({ 
    index, 
    control, 
    register, 
    remove, 
    watch, 
    setValue,
    getValues,
    allQuestions
}: { 
    index: number, 
    control: Control<CreateAssessmentFormDto>, 
    register: UseFormRegister<CreateAssessmentFormDto>, 
    remove: (index: number) => void,
    watch: UseFormWatch<CreateAssessmentFormDto>,
    setValue: UseFormSetValue<CreateAssessmentFormDto>,
    getValues: UseFormGetValues<CreateAssessmentFormDto>,
    allQuestions: CreateAssessmentFormDto['questions']
}) {
    const type = watch(`questions.${index}.type`);
    const { fields: optionFields, append: appendOption, remove: removeOption, replace: replaceOptions } = useFieldArray({
        control,
        name: `questions.${index}.options`
    });

    // Sync options on mount based on question type
    useEffect(() => {
        const currentType = Number(getValues(`questions.${index}.type`));
        const currentOpts = getValues(`questions.${index}.options`) || [];
        if ((currentType === QuestionType.MultipleChoice || currentType === QuestionType.MultiSelect) && currentOpts.length < 4) {
            const newOptions = [...currentOpts];
            for (let i = currentOpts.length; i < 4; i++) {
                newOptions.push({ text: `گزینه ${i + 1}`, scoreValue: 0, order: i });
            }
            replaceOptions(newOptions);
        } else if (currentType === QuestionType.TrueFalse) {
            replaceOptions([
                { text: 'بله', scoreValue: 1, order: 0 },
                { text: 'خیر', scoreValue: 0, order: 1 }
            ]);
        } else if (
          currentType === QuestionType.ShortAnswer ||
          currentType === QuestionType.LongAnswer ||
          currentType === QuestionType.Number ||
          currentType === QuestionType.Date ||
          currentType === QuestionType.File ||
          currentType === QuestionType.Image ||
          currentType === QuestionType.Slider ||
          currentType === QuestionType.Switch ||
          currentType === QuestionType.Rating ||
          currentType === QuestionType.Time
        ) {
            replaceOptions([]);
        }
    }, []);

    const addTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const val = e.currentTarget.value.trim();
            if (val) {
                const currentTags = watch(`questions.${index}.tags`) || [];
                setValue(`questions.${index}.tags`, [...currentTags, val]);
                e.currentTarget.value = '';
            }
        }
    };

    const removeTag = (tagIndex: number) => {
        const currentTags = watch(`questions.${index}.tags`) || [];
        setValue(`questions.${index}.tags`, currentTags.filter((_: string, i: number) => i !== tagIndex));
    };

    // Handle type change manually to ensure realtime update - Removed old handler
    
    return (
        <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 space-y-3">
            <div className="flex justify-between items-start gap-4">
                <div className="flex-1 space-y-3">
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <input
                                {...register(`questions.${index}.question`, { required: true })}
                                placeholder="متن سوال را وارد کنید..."
                                className="w-full bg-transparent border-b border-slate-700 focus:border-teal-500 text-white px-2 py-1 outline-none"
                            />
                        </div>
                        <div className="w-32">
                            <select
                                {...register(`questions.${index}.type`)}
                                onChange={(e) => {
                                    const newType = Number(e.target.value);
                                    setValue(`questions.${index}.type`, newType);
                                    
                                    // Logic to update options based on newType
                                    if (newType === QuestionType.MultipleChoice || newType === QuestionType.MultiSelect) {
                                        const currentOpts = getValues(`questions.${index}.options`) || [];
                                        if (currentOpts.length < 4) {
                                            const newOptions = [...currentOpts];
                                            for (let i = currentOpts.length; i < 4; i++) {
                                                newOptions.push({ text: `گزینه ${i + 1}`, scoreValue: 0, order: i });
                                            }
                                            replaceOptions(newOptions);
                                        }
                                    }
                                    else if (newType === QuestionType.TrueFalse) {
                                        replaceOptions([
                                            { text: 'بله', scoreValue: 1, order: 0 },
                                            { text: 'خیر', scoreValue: 0, order: 1 }
                                        ]);
                                    }
                                    else if (
                                      newType === QuestionType.ShortAnswer ||
                                      newType === QuestionType.LongAnswer ||
                                      newType === QuestionType.Number ||
                                      newType === QuestionType.Date ||
                                      newType === QuestionType.File ||
                                      newType === QuestionType.Image ||
                                      newType === QuestionType.Slider ||
                                      newType === QuestionType.Switch ||
                                      newType === QuestionType.Rating ||
                                      newType === QuestionType.Time
                                    ) {
                                        replaceOptions([]);
                                    }
                                }}
                                className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                            >
                                <option value={QuestionType.MultipleChoice}>چهار گزینه‌ای</option>
                                <option value={QuestionType.MultiSelect}>چندانتخابی</option>
                                <option value={QuestionType.TrueFalse}>دو گزینه‌ای</option>
                                <option value={QuestionType.ShortAnswer}>پاسخ کوتاه</option>
                                <option value={QuestionType.LongAnswer}>پاسخ بلند</option>
                                <option value={QuestionType.Number}>عددی</option>
                                <option value={QuestionType.Date}>تاریخ</option>
                                <option value={QuestionType.Time}>ساعت</option>
                                <option value={QuestionType.File}>فایل</option>
                                <option value={QuestionType.Image}>تصویر</option>
                                <option value={QuestionType.Slider}>اسلایدر</option>
                                <option value={QuestionType.Switch}>سوئیچ</option>
                                <option value={QuestionType.Rating}>امتیازدهی</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex gap-4 items-center">
                        <div className="flex items-center gap-2">
                            <label className="text-xs text-slate-400">وزن:</label>
                            <input
                                type="number"
                                {...register(`questions.${index}.weight`, { valueAsNumber: true })}
                                className="w-16 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-white text-center"
                                min={1}
                                max={10}
                            />
                        </div>
                        
                        {/* Tags Input */}
                        <div className="flex-1 flex items-center gap-2 bg-slate-800 border border-slate-700 rounded px-2 py-1">
                            <span className="text-xs text-slate-400">تگ‌ها:</span>
                            <div className="flex flex-wrap gap-1">
                                {watch(`questions.${index}.tags`)?.map((tag: string, i: number) => (
                                    <span key={i} className="bg-teal-500/20 text-teal-300 text-[10px] px-1 rounded flex items-center gap-1">
                                        {tag}
                                        <button type="button" onClick={() => removeTag(i)} className="hover:text-white">×</button>
                                    </span>
                                ))}
                                <input
                                    onKeyDown={addTag}
                                    placeholder="تایپ و اینتر..."
                                    className="bg-transparent text-xs text-white outline-none min-w-[60px]"
                                />
                            </div>
                        </div>

                        <label className="flex items-center gap-2 text-xs text-slate-300">
                            <input type="checkbox" {...register(`questions.${index}.isRequired`)} className="rounded border-slate-600 bg-slate-900" />
                            اجباری
                        </label>

                        {/* Question Jump */}
                        <div className="flex items-center gap-2">
                            <label className="text-xs text-slate-400">پرش کل سوال:</label>
                            <select
                                {...register(`questions.${index}.nextQuestionKey`)}
                                className="w-32 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-slate-300 outline-none"
                            >
                                <option value="">سوال بعدی (پیش‌فرض)</option>
                                {allQuestions.map((q, qIndex) => {
                                    if (qIndex === index) return null;
                                    return (
                                        <option key={q.questionKey || qIndex} value={q.questionKey}>
                                            {`پرش به: ${qIndex + 1}. ${q.question ? (q.question.substring(0, 15) + '...') : 'سوال جدید'}`}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            {...register(`questions.${index}.pageTitle`)}
                            placeholder="عنوان مرحله / صفحه"
                            className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-xs text-white"
                        />
                        <input
                            {...register(`questions.${index}.pageKey`)}
                            placeholder="کلید مرحله (مثال: patient-overview)"
                            className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-xs text-white"
                        />
                        <input
                            {...register(`questions.${index}.groupTitle`)}
                            placeholder="عنوان گروه"
                            className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-xs text-white"
                        />
                        <input
                            {...register(`questions.${index}.placeholder`)}
                            placeholder="Placeholder"
                            className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-xs text-white"
                        />
                    </div>

                    <textarea
                        {...register(`questions.${index}.description`)}
                        rows={2}
                        placeholder="توضیح سوال برای کاربر"
                        className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-xs text-white"
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <textarea
                            {...register(`questions.${index}.visibilityConditionJson`)}
                            rows={2}
                            placeholder='قانون نمایش JSON: {"questionKey":"service_type","operator":"equals","value":"icu"}'
                            className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-xs text-white"
                        />
                        <textarea
                            {...register(`questions.${index}.validationJson`)}
                            rows={2}
                            placeholder='اعتبارسنجی JSON: {"minLength":3}'
                            className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-xs text-white"
                        />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <input
                            type="number"
                            step="any"
                            {...register(`questions.${index}.minValue`, { valueAsNumber: true })}
                            placeholder="حداقل مقدار"
                            className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-xs text-white"
                        />
                        <input
                            type="number"
                            step="any"
                            {...register(`questions.${index}.maxValue`, { valueAsNumber: true })}
                            placeholder="حداکثر مقدار"
                            className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-xs text-white"
                        />
                        <input
                            type="number"
                            {...register(`questions.${index}.minFiles`, { valueAsNumber: true })}
                            placeholder="حداقل فایل"
                            className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-xs text-white"
                        />
                        <input
                            type="number"
                            {...register(`questions.${index}.maxFiles`, { valueAsNumber: true })}
                            placeholder="حداکثر فایل"
                            className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-xs text-white"
                        />
                    </div>

                    <label className="flex items-center gap-2 text-xs text-slate-300">
                        <input type="checkbox" {...register(`questions.${index}.allowMultipleFiles`)} className="rounded border-slate-600 bg-slate-900" />
                        امکان چندفایل
                    </label>

                    {/* Options Builder (For MultipleChoice AND TrueFalse) */}
                    {(Number(watch(`questions.${index}.type`)) === QuestionType.MultipleChoice || 
                      Number(watch(`questions.${index}.type`)) === QuestionType.MultiSelect ||
                      Number(watch(`questions.${index}.type`)) === QuestionType.TrueFalse) && (
                        <div className="pl-4 border-r-2 border-slate-700 space-y-2 mt-2">
                            <label className="text-xs text-slate-500 block mb-1">گزینه‌ها:</label>
                            {/* We use fields from useFieldArray but need to sync if options are reset externally */}
                            {(optionFields.length > 0 ? optionFields : watch(`questions.${index}.options`))?.map((opt: any, optIndex: number) => (
                                <div key={opt.id || optIndex} className="flex gap-2 items-center">
                                    <input
                                        {...register(`questions.${index}.options.${optIndex}.text`)}
                                        placeholder={`گزینه ${optIndex + 1}`}
                                        className="flex-1 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                                    />
                                    <input
                                        type="number"
                                        {...register(`questions.${index}.options.${optIndex}.scoreValue`, { valueAsNumber: true })}
                                        placeholder="امتیاز"
                                        className="w-16 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-white text-center"
                                    />
                                    <select
                                        {...register(`questions.${index}.options.${optIndex}.nextQuestionKey`)}
                                        className="w-32 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-slate-300 outline-none"
                                    >
                                        <option value="">سوال بعدی (پیش‌فرض)</option>
                                        {allQuestions.map((q, qIndex) => {
                                            if (qIndex === index) return null; // Don't allow selecting itself
                                            return (
                                                <option key={q.questionKey || qIndex} value={q.questionKey}>
                                                    {`پرش به: ${qIndex + 1}. ${q.question ? (q.question.substring(0, 15) + '...') : 'سوال جدید'}`}
                                                </option>
                                            );
                                        })}
                                    </select>
                                    {(Number(watch(`questions.${index}.type`)) === QuestionType.MultipleChoice || Number(watch(`questions.${index}.type`)) === QuestionType.MultiSelect) && (
                                        <button type="button" onClick={() => removeOption(optIndex)} className="text-red-400 hover:text-red-300">
                                            <Trash2 size={14} />
                                        </button>
                                    )}
                                </div>
                            ))}
                            {(Number(watch(`questions.${index}.type`)) === QuestionType.MultipleChoice || Number(watch(`questions.${index}.type`)) === QuestionType.MultiSelect) && (
                                <button
                                    type="button"
                                    onClick={() => appendOption({ text: '', scoreValue: 0, order: optionFields.length })}
                                    className="text-xs text-teal-400 hover:text-teal-300 flex items-center gap-1 mt-1"
                                >
                                    <Plus size={12} /> افزودن گزینه
                                </button>
                            )}
                        </div>
                    )}

                    {/* True/False Preview - REMOVED since we now allow editing */}
                    {/* ... */}

                    {/* Short Answer Preview */}
                    {Number(watch(`questions.${index}.type`)) === QuestionType.ShortAnswer && (
                        <div className="pl-4 border-r-2 border-slate-700 mt-2">
                            <div className="w-1/2 h-8 bg-slate-800/50 border border-slate-700 border-dashed rounded px-3 flex items-center text-slate-500 text-xs">
                                محل درج پاسخ کوتاه کاربر...
                            </div>
                        </div>
                    )}

                    {/* Long Answer Preview */}
                    {Number(watch(`questions.${index}.type`)) === QuestionType.LongAnswer && (
                        <div className="pl-4 border-r-2 border-slate-700 mt-2">
                            <div className="w-full h-20 bg-slate-800/50 border border-slate-700 border-dashed rounded p-3 text-slate-500 text-xs">
                                محل درج پاسخ تشریحی و طولانی کاربر...
                            </div>
                        </div>
                    )}
                </div>

                <button
                    type="button"
                    onClick={() => remove(index)}
                    className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                >
                    <Trash2 size={18} />
                </button>
            </div>
        </div>
    );
}
