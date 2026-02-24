'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { assessmentReportService } from '@/services/assessment-report.service';
import { UserAttemptDetailDto } from '@/types/assessment-report';
import { ArrowLeft, CheckCircle, XCircle, AlertCircle, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function UserAttemptDetailPage() {
  const params = useParams();
  const router = useRouter();
  const submissionId = Number(params.submissionId);

  const [detail, setDetail] = useState<UserAttemptDetailDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (submissionId) {
      fetchDetail();
    }
  }, [submissionId]);

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const data = await assessmentReportService.getUserAttemptDetail(submissionId);
      setDetail(data);
    } catch (error) {
      toast.error('خطا در دریافت جزئیات پاسخ‌نامه');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64 text-slate-400">در حال بارگذاری...</div>;
  }

  if (!detail) {
    return <div className="text-center py-10 text-slate-400">اطلاعات یافت نشد.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => router.back()} 
          className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-300" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">جزئیات پاسخ‌نامه کاربر</h1>
          <div className="text-sm text-slate-400 mt-1">
            {detail.userFullName} - {detail.examTitle}
          </div>
        </div>
      </div>

      {/* Summary Card */}
      <div className="bg-slate-800 rounded-lg shadow border border-slate-700 p-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="flex flex-col items-center justify-center p-4 bg-slate-700/30 rounded-lg">
          <span className="text-slate-400 text-sm mb-1">نمره کل</span>
          <span className="text-2xl font-bold text-teal-400">{detail.totalScore}</span>
        </div>
        <div className="flex flex-col items-center justify-center p-4 bg-slate-700/30 rounded-lg">
          <span className="text-slate-400 text-sm mb-1">تاریخ ثبت</span>
          <span className="text-lg font-medium text-white flex items-center">
            <Clock className="w-4 h-4 ml-2 text-slate-400" />
            {new Date(detail.submissionDate).toLocaleDateString('fa-IR')}
          </span>
        </div>
        <div className="flex flex-col items-center justify-center p-4 bg-slate-700/30 rounded-lg">
          <span className="text-slate-400 text-sm mb-1">کاربر</span>
          <span className="text-lg font-medium text-white">{detail.userFullName}</span>
        </div>
        <div className="flex flex-col items-center justify-center p-4 bg-slate-700/30 rounded-lg">
          <span className="text-slate-400 text-sm mb-1">نتیجه</span>
          <span className={`text-lg font-bold ${detail.totalScore >= 50 ? 'text-green-400' : 'text-red-400'}`}>
            {detail.totalScore >= 50 ? 'قبول' : 'رد'}
          </span>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {detail.answers.map((answer, index) => (
          <div key={answer.questionId} className={`bg-slate-800 rounded-lg border overflow-hidden ${answer.isCorrect ? 'border-green-500/30' : 'border-red-500/30'}`}>
            <div className="p-4 bg-slate-900/50 flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-slate-700 text-slate-300 text-xs px-2 py-0.5 rounded">سؤال {index + 1}</span>
                  <span className="bg-slate-700 text-slate-300 text-xs px-2 py-0.5 rounded">بارم: {answer.weight}</span>
                  {answer.isCorrect ? (
                    <span className="bg-green-900/50 text-green-400 text-xs px-2 py-0.5 rounded flex items-center">
                      <CheckCircle className="w-3 h-3 ml-1" /> صحیح
                    </span>
                  ) : (
                    <span className="bg-red-900/50 text-red-400 text-xs px-2 py-0.5 rounded flex items-center">
                      <XCircle className="w-3 h-3 ml-1" /> غلط
                    </span>
                  )}
                </div>
                <h3 className="text-white font-medium text-lg">{answer.questionText}</h3>
              </div>
              <div className="text-slate-400 text-sm">
                نمره کسب شده: <span className={answer.scoreObtained > 0 ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>{answer.scoreObtained}</span>
              </div>
            </div>
            
            <div className="p-4 space-y-3">
              {answer.options.length > 0 ? (
                // Multiple Choice
                <div className="space-y-2">
                  {answer.options.map((opt) => {
                    const isSelected = answer.selectedOptionId === opt.id;
                    const isCorrect = opt.isCorrect;
                    
                    let bgClass = "bg-slate-700/30 border-transparent";
                    let icon = null;

                    if (isSelected && isCorrect) {
                      bgClass = "bg-green-900/20 border-green-500/50";
                      icon = <CheckCircle className="w-4 h-4 text-green-400 ml-2" />;
                    } else if (isSelected && !isCorrect) {
                      bgClass = "bg-red-900/20 border-red-500/50";
                      icon = <XCircle className="w-4 h-4 text-red-400 ml-2" />;
                    } else if (!isSelected && isCorrect) {
                      bgClass = "bg-green-900/10 border-green-500/30 border-dashed"; // Show correct answer if missed
                      icon = <CheckCircle className="w-4 h-4 text-green-400/70 ml-2" />;
                    }

                    return (
                      <div key={opt.id} className={`p-3 rounded-md border flex items-center ${bgClass}`}>
                        {icon}
                        <span className={`text-sm ${isSelected ? 'font-medium text-white' : 'text-slate-300'}`}>
                          {opt.text}
                        </span>
                        {isSelected && <span className="mr-auto text-xs text-slate-400">(پاسخ کاربر)</span>}
                        {!isSelected && isCorrect && <span className="mr-auto text-xs text-green-400/70">(پاسخ صحیح)</span>}
                      </div>
                    );
                  })}
                </div>
              ) : (
                // Text Response
                <div className="bg-slate-700/30 p-3 rounded-md border border-slate-600">
                  <div className="text-xs text-slate-400 mb-1">پاسخ تشریحی کاربر:</div>
                  <p className="text-white text-sm">{answer.textResponse || '(بدون پاسخ)'}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
