'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { assessmentService } from '@/services/assessment.service';
import { AssessmentForm, SubmitAssessmentDto } from '@/types/assessment';
import AssessmentTaker from '@/components/assessments/AssessmentTaker';
import { ArrowRight } from 'lucide-react';
import Swal from 'sweetalert2';

export default function NurseAssessmentDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [form, setForm] = useState<AssessmentForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id) loadForm(Number(id));
  }, [id]);

  const loadForm = async (formId: number) => {
    try {
      const data = await assessmentService.getFormById(formId);
      setForm(data);
    } catch (error) {
      console.error('Failed to load form:', error);
      Swal.fire('خطا', 'دریافت اطلاعات آزمون با مشکل مواجه شد', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: SubmitAssessmentDto) => {
    setSubmitting(true);
    try {
      await assessmentService.submitAssessment(data);
      
      await Swal.fire({
        icon: 'success',
        title: 'ثبت موفق',
        text: 'پاسخ‌های شما با موفقیت ثبت شد.',
        confirmButtonText: 'بازگشت به لیست',
        confirmButtonColor: '#0d9488'
      });
      
      router.push('/nurse-portal/assessments');
    } catch (error) {
      console.error('Submission failed:', error);
      Swal.fire('خطا', 'ثبت پاسخ‌ها با مشکل مواجه شد', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">آزمون مورد نظر یافت نشد.</p>
        <button 
          onClick={() => router.back()}
          className="mt-4 text-teal-600 font-medium"
        >
          بازگشت
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button 
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-500 hover:text-teal-600 transition-colors mb-4"
      >
        <ArrowRight size={18} />
        <span>بازگشت به لیست آزمون‌ها</span>
      </button>

      <AssessmentTaker 
        form={form} 
        onSubmit={handleSubmit} 
        loading={submitting} 
      />
    </div>
  );
}
