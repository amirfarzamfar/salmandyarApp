'use client';

import { useForm, useFieldArray, SubmitHandler, Control, UseFormRegister, UseFormWatch, UseFormSetValue } from 'react-hook-form';
import { Plus, Trash2, Save, FileText } from 'lucide-react';
import { CreateAssessmentFormDto, QuestionType, AssessmentType } from '@/types/assessment';
import { useEffect } from 'react';

interface AssessmentFormBuilderProps {
  initialData?: CreateAssessmentFormDto;
  onSubmit: (data: CreateAssessmentFormDto) => Promise<void>;
  loading: boolean;
  title: string;
}

export default function AssessmentFormBuilder({ initialData, onSubmit, loading, title }: AssessmentFormBuilderProps) {
  const { register, control, handleSubmit, watch, setValue, reset, getValues, formState: { errors } } = useForm<CreateAssessmentFormDto>({
    defaultValues: initialData || {
      title: '',
      description: '',
      type: AssessmentType.NurseAssessment,
      questions: [
        {
          question: '',
          type: QuestionType.MultipleChoice,
          weight: 1,
          tags: [],
          order: 0,
          options: [{ text: 'بله', scoreValue: 1, order: 0 }, { text: 'خیر', scoreValue: 0, order: 1 }]
        }
      ]
    }
  });

  // Update form if initialData changes (for edit mode)
  useEffect(() => {
    if (initialData) {
      reset(initialData);
    }
  }, [initialData, reset]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "questions"
  });

  const handleFormSubmit: SubmitHandler<CreateAssessmentFormDto> = (data) => {
      // Ensure types are converted if necessary before passing to parent
      const formattedData = {
        ...data,
        type: Number(data.type),
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
              <label className="text-sm text-slate-400">نوع آزمون</label>
              <select
                {...register('type')}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-teal-500 outline-none"
              >
                <option value={AssessmentType.NurseAssessment}>ارزیابی پرستار / سالمندیار</option>
                <option value={AssessmentType.SeniorAssessment}>ارزیابی سالمند / بیمار</option>
                <option value={AssessmentType.SpecializedAssessment}>تخصصی</option>
              </select>
            </div>
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
                    question: '', 
                    type: QuestionType.MultipleChoice, 
                    weight: 1, 
                    tags: [], 
                    order: fields.length,
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
    getValues
}: { 
    index: number, 
    control: Control<CreateAssessmentFormDto>, 
    register: UseFormRegister<CreateAssessmentFormDto>, 
    remove: (index: number) => void,
    watch: UseFormWatch<CreateAssessmentFormDto>,
    setValue: UseFormSetValue<CreateAssessmentFormDto>,
    getValues: any // Added getValues
}) {
    const type = watch(`questions.${index}.type`);
    const { fields: optionFields, append: appendOption, remove: removeOption, replace: replaceOptions } = useFieldArray({
        control,
        name: `questions.${index}.options`
    });

    const addTag = (e: any) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const val = e.target.value.trim();
            if (val) {
                const currentTags = watch(`questions.${index}.tags`) || [];
                setValue(`questions.${index}.tags`, [...currentTags, val]);
                e.target.value = '';
            }
        }
    };

    const removeTag = (tagIndex: number) => {
        const currentTags = watch(`questions.${index}.tags`) || [];
        setValue(`questions.${index}.tags`, currentTags.filter((_: any, i: number) => i !== tagIndex));
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
                                    if (newType === QuestionType.MultipleChoice) {
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
                                    else if (newType === QuestionType.ShortAnswer || newType === QuestionType.LongAnswer) {
                                        replaceOptions([]);
                                    }
                                }}
                                className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                            >
                                <option value={QuestionType.MultipleChoice}>چهار گزینه‌ای</option>
                                <option value={QuestionType.TrueFalse}>دو گزینه‌ای</option>
                                <option value={QuestionType.ShortAnswer}>پاسخ کوتاه</option>
                                <option value={QuestionType.LongAnswer}>پاسخ بلند</option>
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
                    </div>

                    {/* Options Builder (For MultipleChoice AND TrueFalse) */}
                    {(Number(watch(`questions.${index}.type`)) === QuestionType.MultipleChoice || 
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
                                    {Number(watch(`questions.${index}.type`)) === QuestionType.MultipleChoice && (
                                        <button type="button" onClick={() => removeOption(optIndex)} className="text-red-400 hover:text-red-300">
                                            <Trash2 size={14} />
                                        </button>
                                    )}
                                </div>
                            ))}
                            {Number(watch(`questions.${index}.type`)) === QuestionType.MultipleChoice && (
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
