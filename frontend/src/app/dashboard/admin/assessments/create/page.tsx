'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { assessmentService } from '@/services/assessment.service';
import { CreateAssessmentFormDto } from '@/types/assessment';
import { toast } from 'react-hot-toast';
import AssessmentFormBuilder from '@/components/admin/assessments/AssessmentFormBuilder';
import axios from 'axios';

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
      const message = axios.isAxiosError(error)
        ? error.response?.data?.error || JSON.stringify(error.response?.data?.errors || {}) || error.message
        : 'خطا در ایجاد آزمون';
      toast.error(typeof message === 'string' ? message : 'خطا در ایجاد آزمون');
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
