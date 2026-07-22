'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { assessmentService } from '@/services/assessment.service';
import { CreateAssessmentFormDto, QuestionType } from '@/types/assessment';
import { toast } from 'react-hot-toast';
import AssessmentFormBuilder from '@/components/admin/assessments/AssessmentFormBuilder';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export default function EditAssessmentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  // Fetch existing data
  const { data: form, isLoading, error } = useQuery({
    queryKey: ['assessment', id],
    queryFn: () => assessmentService.getFormById(Number(id)),
  });

  const onSubmit = async (data: CreateAssessmentFormDto) => {
    try {
      setSaving(true);
      console.log('Submitting data:', data); // Log the data being sent
      await assessmentService.updateForm(Number(id), data);
      toast.success('آزمون با موفقیت ویرایش شد');
      router.push('/dashboard/admin/assessments');
    } catch (error) {
      console.error('Error updating form:', error);
      const message = axios.isAxiosError(error)
        ? error.response?.data?.error || JSON.stringify(error.response?.data?.errors || {}) || error.message
        : 'خطا در ویرایش آزمون';
      toast.error(typeof message === 'string' ? message : 'خطا در ویرایش آزمون');
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) return <div className="p-10 text-center text-black">در حال بارگذاری...</div>;
  if (error || !form) return <div className="p-10 text-center text-red-400">خطا در دریافت اطلاعات آزمون</div>;

  // Transform backend DTO to Form DTO if needed (e.g. enum conversions)
  // Backend returns structure similar to CreateAssessmentFormDto but with Ids.
  // AssessmentFormBuilder accepts CreateAssessmentFormDto which is compatible.
  // Ensure options is always an array, even if empty.
  
  const initialData: CreateAssessmentFormDto = {
      code: form.code,
      title: form.title,
      description: form.description,
      type: form.type,
      targetTypes: form.targetTypes?.length ? form.targetTypes : [form.type],
      workflow: form.workflow,
      version: form.version,
      isDefault: form.isDefault,
      serviceDefinitionId: form.serviceDefinitionId,
      introTitle: form.introTitle,
      introDescription: form.introDescription,
      estimatedDurationMinutes: form.estimatedDurationMinutes,
      layoutJson: form.layoutJson,
      questions: form.questions.map(q => ({
          question: q.question,
          type: Number(q.type),
          weight: q.weight,
          tags: q.tags || [], // Ensure tags is an array
          order: q.order || 0,
          questionKey: q.questionKey,
          nextQuestionKey: q.nextQuestionKey,
          pageKey: q.pageKey,
          pageTitle: q.pageTitle,
          groupKey: q.groupKey,
          groupTitle: q.groupTitle,
          isRequired: q.isRequired,
          placeholder: q.placeholder,
          description: q.description,
          visibilityConditionJson: q.visibilityConditionJson,
          validationJson: q.validationJson,
          minValue: q.minValue,
          maxValue: q.maxValue,
          minFiles: q.minFiles,
          maxFiles: q.maxFiles,
          allowMultipleFiles: q.allowMultipleFiles,
          options: (q.options || []).map(o => ({ // Ensure options is an array
              text: o.text,
              scoreValue: o.value,
              order: o.order || 0,
              nextQuestionKey: o.nextQuestionKey
          }))
      }))
  };

  return (
    <AssessmentFormBuilder 
        initialData={initialData}
        onSubmit={onSubmit} 
        loading={saving} 
        title="ویرایش آزمون"
    />
  );
}
