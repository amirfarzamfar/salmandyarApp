'use client';

import { Suspense, useEffect, useState } from 'react';
import { useParams, usePathname, useRouter, useSearchParams } from 'next/navigation';
import { assessmentService } from '@/services/assessment.service';
import { userEvaluationService } from '@/services/user-evaluation.service';
import { AssessmentForm, SubmitAssessmentDto } from '@/types/assessment';
import AssessmentTaker from '@/components/assessments/AssessmentTaker';
import Swal from 'sweetalert2';
import { PageHeader } from '@/components/navigation/PageHeader';
import { getPanelNavigation } from '@/components/navigation/panel-navigation';

function NurseAssessmentDetailContent() {
  const { id } = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const nav = getPanelNavigation("nurse", pathname);
  const searchParams = useSearchParams();
  const source = searchParams.get('source');
  const [form, setForm] = useState<AssessmentForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id) loadForm(Number(id));
  }, [id]);

  const loadForm = async (formId: number) => {
    try {
      let data;
      if (source === 'user-eval') {
          data = await userEvaluationService.getFormById(formId);
      } else {
          data = await assessmentService.getFormById(formId);
      }
      setForm(data as unknown as AssessmentForm);
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
      if (source === 'user-eval') {
          await userEvaluationService.submitEvaluation(data);
      } else {
          await assessmentService.submitAssessment(data);
      }
      
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
        <div className="mt-4">
          <PageHeader
            title="آزمون یافت نشد"
            backHref={nav.backHref || "/nurse-portal/assessments"}
            backLabel="بازگشت"
            className="mb-0"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={form.title}
        description="فرم ارزیابی را تکمیل و نتیجه را در همین صفحه ثبت کنید."
        backHref={nav.backHref || "/nurse-portal/assessments"}
        backLabel="بازگشت به لیست ارزیابی‌ها"
        breadcrumbs={nav.breadcrumbs}
      />

      <AssessmentTaker 
        form={form} 
        onSubmit={handleSubmit} 
        loading={submitting} 
      />
    </div>
  );
}

export default function NurseAssessmentDetailPage() {
  return (
    <Suspense fallback={null}>
      <NurseAssessmentDetailContent />
    </Suspense>
  );
}
