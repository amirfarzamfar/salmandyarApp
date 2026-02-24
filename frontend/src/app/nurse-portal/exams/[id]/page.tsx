"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { assessmentService } from "@/services/assessment.service";
import { AssessmentForm, SubmitAssessmentDto } from "@/types/assessment";
import AssessmentTaker from "@/components/assessments/AssessmentTaker";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { toast } from "react-hot-toast";

export default function TakeExamPage() {
  const params = useParams();
  const router = useRouter();
  const [form, setForm] = useState<AssessmentForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (params.id) {
      loadForm(Number(params.id));
    }
  }, [params.id]);

  const loadForm = async (id: number) => {
    try {
      const data = await assessmentService.getFormById(id);
      setForm(data);
    } catch (error) {
      console.error("Failed to load exam", error);
      toast.error("خطا در بارگذاری آزمون");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (dto: SubmitAssessmentDto) => {
    setSubmitting(true);
    try {
      await assessmentService.submitAssessment(dto);
      toast.success("آزمون با موفقیت ثبت شد");
      router.push("/nurse-portal/exams");
    } catch (error) {
      console.error("Failed to submit exam", error);
      toast.error("خطا در ثبت آزمون");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
      </div>
    );
  }

  if (!form) {
    return (
      <div className="container mx-auto p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">آزمون یافت نشد</h1>
        <Link href="/nurse-portal/exams">
          <Button>بازگشت به لیست</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-4xl space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/nurse-portal/exams">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowRight className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{form.title}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">لطفاً به تمام سوالات با دقت پاسخ دهید</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-6 md:p-8 shadow-xl shadow-blue-500/5">
        <AssessmentTaker 
          form={form} 
          onSubmit={handleSubmit} 
          loading={submitting} 
        />
      </div>
    </div>
  );
}
