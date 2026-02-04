'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { assessmentService } from '@/services/assessment.service';
import { CreateAssessmentFormDto } from '@/types/assessment';
import { toast } from 'react-hot-toast';
import AssessmentFormBuilder from '@/components/admin/assessments/AssessmentFormBuilder';

export default function CreateAssessmentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: CreateAssessmentFormDto) => {
    try {
      setLoading(true);
      await assessmentService.createForm(data);
      toast.success('آزمون با موفقیت ایجاد شد');
      router.push('/dashboard/admin/assessments');
    } catch (error) {
      console.error(error);
      toast.error('خطا در ایجاد آزمون');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AssessmentFormBuilder 
        onSubmit={onSubmit} 
        loading={loading} 
        title="ایجاد آزمون جدید"
    />
  );
}
