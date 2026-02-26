'use client';

import { useEffect, useState } from 'react';
import { userEvaluationService } from '@/services/user-evaluation.service';
import { AssessmentForm, AssessmentType } from '@/types/assessment';
import { ClipboardCheck, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NurseAssessmentsPage() {
  const [forms, setForms] = useState<AssessmentForm[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadForms();
  }, []);

  const loadForms = async () => {
    try {
      // Fetch assessments specifically for Nurses (User Evaluations)
      // Using AssessmentType.Nurse (12) instead of legacy NurseAssessment (0)
      const data = await userEvaluationService.getAvailableEvaluations(AssessmentType.Nurse);
      setForms(data as unknown as AssessmentForm[]);
    } catch (error) {
      console.error('Failed to load assessments:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-24">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">ارزیابی‌های پرستاری</h1>
          <p className="text-gray-500 text-sm mt-1">آزمون‌های مهارت‌سنجی و ارزیابی عملکرد</p>
        </div>
        <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center text-teal-600">
          <ClipboardCheck size={20} />
        </div>
      </header>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
        </div>
      ) : forms.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
          <p className="text-gray-500">در حال حاضر آزمونی برای شما تعریف نشده است.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {forms.map((form) => (
            <Link 
              key={form.id} 
              href={`/nurse-portal/assessments/${form.id}?source=user-eval`}
              className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all flex items-center justify-between group"
            >
              <div>
                <h3 className="font-bold text-gray-800 mb-1 group-hover:text-teal-600 transition-colors">
                  {form.title}
                </h3>
                <p className="text-xs text-gray-500 line-clamp-2 max-w-[250px]">
                  {form.description || 'بدون توضیحات'}
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <span className="text-[10px] bg-teal-50 text-teal-600 px-2 py-0.5 rounded-full">
                    {form.questions?.length || 0} سوال
                  </span>
                </div>
              </div>
              <ArrowLeft size={18} className="text-gray-400 group-hover:text-teal-500 group-hover:-translate-x-1 transition-all" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
