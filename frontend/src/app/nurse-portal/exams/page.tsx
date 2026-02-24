"use client";

import { useEffect, useState } from "react";
import { assessmentService } from "@/services/assessment.service";
import { AssessmentForm, AssessmentType } from "@/types/assessment";
import { GraduationCap, Clock, CheckCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { useUser } from "@/components/auth/UserContext";

export default function ExamsPage() {
  const { user } = useUser();
  const [exams, setExams] = useState<AssessmentForm[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadExams = async () => {
      try {
        // Fetch exams specifically
        const type = AssessmentType.Exam;
        
        // Fetch exams (general + assigned)
        const data = await assessmentService.getAvailableExams(type);
        setExams(data);
      } catch (error) {
        console.error("Failed to load exams", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadExams();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
          <div className="h-4 w-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-br from-white to-blue-50 dark:from-gray-900 dark:to-gray-800 p-6 rounded-3xl border border-blue-100 dark:border-gray-700 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-blue-500/10 rounded-2xl text-blue-600 dark:text-blue-400">
            <GraduationCap size={32} strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight">آزمون‌ها</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium">لیست آزمون‌های فعال و اختصاصی شما</p>
          </div>
        </div>
        
        <div className="hidden md:flex items-center gap-2 text-sm font-medium text-gray-500 bg-white/50 dark:bg-gray-800/50 px-4 py-2 rounded-xl border border-gray-100 dark:border-gray-700">
          <CheckCircle className="w-4 h-4 text-green-500" />
          <span>{exams.length} آزمون فعال</span>
        </div>
      </div>

      {/* Grid */}
      {exams.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 bg-white dark:bg-gray-900 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-800">
          <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
            <GraduationCap className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">هیچ آزمونی یافت نشد</h3>
          <p className="text-gray-500 text-center max-w-md">
            در حال حاضر هیچ آزمونی برای شما فعال نیست. لطفاً بعداً دوباره بررسی کنید یا با مدیر سیستم تماس بگیرید.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.map((exam) => (
            <div 
              key={exam.id} 
              className="group relative bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-6 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 flex flex-col h-full"
            >
              {/* Type Badge */}
              <div className="absolute top-6 left-6">
                <span className={cn(
                  "px-3 py-1 rounded-full text-xs font-bold",
                  exam.type === AssessmentType.NurseAssessment 
                    ? "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-300"
                    : "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-300"
                )}>
                  {exam.type === AssessmentType.NurseAssessment ? "عمومی" : "آزمون"}
                </span>
              </div>

              <div className="mb-4 mt-8">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {exam.title}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2 leading-relaxed h-10">
                  {exam.description || "بدون توضیحات"}
                </p>
              </div>

              <div className="mt-auto pt-6 border-t border-gray-50 dark:border-gray-800 flex items-center justify-between gap-4">
                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400">
                  <Clock size={14} />
                  <span>{exam.questions.length} سوال</span>
                </div>
                
                <Link href={`/nurse-portal/exams/${exam.id}`} className="flex-1 max-w-[140px]">
                  <Button className="w-full bg-gray-900 hover:bg-blue-600 dark:bg-white dark:text-gray-900 dark:hover:bg-blue-400 dark:hover:text-white transition-all rounded-xl h-10 text-xs font-bold shadow-none hover:shadow-lg hover:shadow-blue-500/20">
                    <span>شروع آزمون</span>
                    <ArrowLeft className="mr-2 w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
