'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { assessmentReportService } from '@/services/assessment-report.service';
import { ExamStatisticsDto } from '@/types/assessment-report';
import { Eye, Download } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function AssessmentReportsPage() {
  const [stats, setStats] = useState<ExamStatisticsDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await assessmentReportService.getExamStatistics();
      setStats(data);
    } catch (error) {
      toast.error('خطا در دریافت گزارشات آزمون');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    // Basic CSV export logic
    const headers = ['عنوان آزمون', 'تعداد شرکت کنندگان', 'میانگین نمره', 'کمترین نمره', 'بیشترین نمره', 'آخرین شرکت'];
    const rows = stats.map(s => [
      s.title,
      s.totalAttempts,
      s.averageScore.toFixed(2),
      s.minScore,
      s.maxScore,
      s.lastAttemptDate ? new Date(s.lastAttemptDate).toLocaleDateString('fa-IR') : '-'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'exam_reports.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-white">گزارش آزمون‌ها</h1>
        <button 
          onClick={exportToCSV}
          className="inline-flex w-full items-center justify-center rounded-md bg-teal-600 px-4 py-2 text-sm text-white transition-colors hover:bg-teal-700 disabled:opacity-60 sm:w-auto"
          disabled={loading || stats.length === 0}
        >
          <Download className="w-4 h-4 ml-2" />
          خروجی اکسل
        </button>
      </div>

      <div className="bg-slate-800 rounded-lg shadow border border-slate-700 overflow-hidden">
        <div className="divide-y divide-slate-700 md:hidden">
          {loading ? (
            <div className="px-4 py-6 text-center text-slate-400">در حال بارگذاری...</div>
          ) : stats.length === 0 ? (
            <div className="px-4 py-6 text-center text-slate-400">هیچ آزمونی یافت نشد.</div>
          ) : (
            stats.map((exam) => (
              <div key={exam.examId} className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-medium text-white">{exam.title}</div>
                    <div className="mt-1 text-xs text-slate-400">{exam.isActive ? 'فعال' : 'غیرفعال'}</div>
                  </div>
                  <span className="rounded-md bg-slate-700 px-2 py-1 text-xs text-slate-300">{exam.totalAttempts} شرکت‌کننده</span>
                </div>
                <div className="grid grid-cols-2 gap-3 rounded-lg bg-slate-900/40 p-3 text-sm text-slate-300">
                  <div>
                    <div className="text-xs text-slate-500">میانگین نمره</div>
                    <div className="font-bold text-teal-400">{exam.averageScore.toFixed(1)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">بازه نمره</div>
                    <div>{exam.minScore} - {exam.maxScore}</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-xs text-slate-500">آخرین شرکت</div>
                    <div>{exam.lastAttemptDate ? new Date(exam.lastAttemptDate).toLocaleDateString('fa-IR') : '-'}</div>
                  </div>
                </div>
                <Link
                  href={`/dashboard/admin/assessments/reports/${exam.examId}`}
                  className="inline-flex items-center gap-1 text-sm text-teal-400 hover:text-teal-300"
                  title="مشاهده جزئیات"
                >
                  <Eye className="h-4 w-4" />
                  مشاهده جزئیات
                </Link>
              </div>
            ))
          )}
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table className="min-w-full divide-y divide-slate-700">
            <thead className="bg-slate-900/50">
              <tr>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">عنوان آزمون</th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-slate-400 uppercase tracking-wider">تعداد شرکت‌کنندگان</th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-slate-400 uppercase tracking-wider">میانگین نمره</th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-slate-400 uppercase tracking-wider">بازه نمرات (Min-Max)</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">آخرین شرکت</th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-slate-400 uppercase tracking-wider">عملیات</th>
              </tr>
            </thead>
            <tbody className="bg-slate-800 divide-y divide-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-slate-400">در حال بارگذاری...</td>
                </tr>
              ) : stats.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-slate-400">هیچ آزمونی یافت نشد.</td>
                </tr>
              ) : (
                stats.map((exam) => (
                  <tr key={exam.examId} className="hover:bg-slate-700/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">{exam.title}</div>
                      <div className="text-xs text-slate-400">{exam.isActive ? 'فعال' : 'غیرفعال'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-slate-300">
                      <span className="bg-slate-700 px-2 py-1 rounded-md">{exam.totalAttempts}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-bold text-teal-400">
                      {exam.averageScore.toFixed(1)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-slate-300">
                      {exam.minScore} - {exam.maxScore}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-slate-400">
                      {exam.lastAttemptDate ? new Date(exam.lastAttemptDate).toLocaleDateString('fa-IR') : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <Link 
                        href={`/dashboard/admin/assessments/reports/${exam.examId}`}
                        className="text-teal-400 hover:text-teal-300 inline-flex items-center"
                        title="مشاهده جزئیات"
                      >
                        <Eye className="w-5 h-5 ml-1" />
                        جزئیات
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
