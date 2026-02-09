'use client';

import { useEffect, useState } from 'react';
import { assessmentService } from '@/services/assessment.service';
import { AssessmentForm, AssessmentType } from '@/types/assessment';
import { ClipboardCheck, ArrowLeft, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function PatientAssessmentsPage() {
  const router = useRouter();
  const [forms, setForms] = useState<AssessmentForm[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadForms();
  }, []);

  const loadForms = async () => {
    try {
      // Fetch assessments specifically for Seniors/Patients
      const data = await assessmentService.getFormsByType(AssessmentType.SeniorAssessment);
      setForms(data);
    } catch (error) {
      console.error('Failed to load assessments:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-24">
      <header className="flex items-center gap-4">
        <button 
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-500 hover:text-teal-600 transition-colors"
        >
          <ArrowRight size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">ارزیابی‌های سلامت</h1>
          <p className="text-gray-500 text-sm mt-1">لیست پرسشنامه‌های فعال برای شما</p>
        </div>
      </header>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
        </div>
      ) : forms.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-gray-300">
          <p className="text-gray-500">در حال حاضر آزمونی برای شما تعریف نشده است.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {forms.map((form) => (
            <Link 
              key={form.id} 
              href={`/portal/assessments/${form.id}`}
              className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                   <ClipboardCheck size={24} />
                </div>
                <div>
                    <h3 className="font-bold text-gray-800 text-lg group-hover:text-indigo-600 transition-colors">
                    {form.title}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-1 max-w-[200px] md:max-w-none">
                    {form.description || 'بدون توضیحات'}
                    </p>
                </div>
              </div>
              <ArrowLeft size={20} className="text-gray-400 group-hover:text-indigo-600 group-hover:-translate-x-1 transition-all" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
