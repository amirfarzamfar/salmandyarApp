'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { assessmentService } from '@/services/assessment.service';
import { CreateAssessmentFormDto, AssessmentType } from '@/types/assessment';
import { toast } from 'react-hot-toast';
import AssessmentFormBuilder from '@/components/admin/assessments/AssessmentFormBuilder';
import { useQuery } from '@tanstack/react-query';

export default function EditUserEvaluationPage({ params }: { params: Promise<{ id: string }> }) {
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
      await assessmentService.updateForm(Number(id), data);
      toast.success('فرم ارزیابی با موفقیت ویرایش شد');
      router.push('/dashboard/admin/user-evaluations');
    } catch (error) {
      console.error('Error updating form:', error);
      toast.error('خطا در ویرایش فرم');
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) return <div className="p-10 text-center text-black">در حال بارگذاری...</div>;
  if (error || !form) return <div className="p-10 text-center text-red-400">خطا در دریافت اطلاعات فرم</div>;
  
  const initialData: CreateAssessmentFormDto = {
      title: form.title,
      description: form.description,
      type: form.type,
      questions: form.questions.map(q => ({
          question: q.question,
          type: Number(q.type),
          weight: q.weight,
          tags: q.tags || [], 
          order: q.order || 0,
          options: (q.options || []).map(o => ({ 
              text: o.text,
              scoreValue: o.value,
              order: o.order || 0
          }))
      }))
  };

  return (
    <AssessmentFormBuilder 
        initialData={initialData}
        onSubmit={onSubmit} 
        loading={saving} 
        title="ویرایش فرم ارزیابی"
        allowedTypes={[AssessmentType.NurseAssessment, AssessmentType.SeniorAssessment, AssessmentType.SpecializedAssessment]}
    />
  );
}
