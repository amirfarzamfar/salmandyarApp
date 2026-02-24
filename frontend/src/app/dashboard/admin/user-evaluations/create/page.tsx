'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { userEvaluationService } from '@/services/user-evaluation.service';
import { CreateUserEvaluationFormDto } from '@/types/user-evaluation';
import { toast } from 'react-hot-toast';
import AssessmentFormBuilder from '@/components/admin/assessments/AssessmentFormBuilder';

export default function CreateUserEvaluationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: any) => { // Use any or CreateUserEvaluationFormDto if compatible
    try {
      setLoading(true);
      await userEvaluationService.createForm(data as CreateUserEvaluationFormDto);
      toast.success('فرم ارزیابی با موفقیت ایجاد شد');
      router.push('/dashboard/admin/user-evaluations');
    } catch (error) {
      console.error(error);
      toast.error('خطا در ایجاد فرم ارزیابی');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AssessmentFormBuilder 
        onSubmit={onSubmit} 
        loading={loading} 
        title="ایجاد فرم ارزیابی"
    />
  );
}
