'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { assessmentReportService } from '@/services/assessment-report.service';
import { UserExamResultDto, ExamAnalyticsDto, QuestionAnalysisDto } from '@/types/assessment-report';
import { ArrowLeft, User, BarChart2, CheckCircle, XCircle, HelpCircle, Download, ChevronDown, ChevronUp, Search, Eye } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function ExamReportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const examId = Number(params.examId);

  const [activeTab, setActiveTab] = useState<'users' | 'analytics'>('users');
  const [userResults, setUserResults] = useState<UserExamResultDto[]>([]);
  const [analytics, setAnalytics] = useState<ExamAnalyticsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedQuestionId, setExpandedQuestionId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (examId) {
      fetchData();
    }
  }, [examId, activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'users') {
        const data = await assessmentReportService.getExamUserReports(examId);
        setUserResults(data);
      } else {
        if (!analytics) {
          const data = await assessmentReportService.getExamAnalytics(examId);
          setAnalytics(data);
        }
      }
    } catch (error) {
      toast.error('خطا در دریافت اطلاعات');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = userResults.filter(u => 
    u.userFullName.includes(searchTerm) || 
    u.userId.includes(searchTerm)
  );

  const exportUsersToCSV = () => {
    if (filteredUsers.length === 0) return;
    
    const headers = ['نام کاربر', 'تاریخ شرکت', 'نمره', 'نتیجه', 'صحیح', 'غلط', 'بدون پاسخ'];
    const rows = filteredUsers.map(u => [
      u.userFullName,
      new Date(u.startDate).toLocaleDateString('fa-IR'),
      u.totalScore,
      u.isPassed ? 'قبول' : 'رد',
      u.correctCount,
      u.incorrectCount,
      u.unansweredCount
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `exam_${examId}_users.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleQuestionExpand = (qId: number) => {
    if (expandedQuestionId === qId) setExpandedQuestionId(null);
    else setExpandedQuestionId(qId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()} 
            className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-300" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">
              {analytics ? analytics.title : 'گزارش جزئیات آزمون'}
            </h1>
            <div className="text-sm text-slate-400 mt-1">شناسه آزمون: {examId}</div>
          </div>
        </div>
        
        {activeTab === 'users' && (
          <button 
            onClick={exportUsersToCSV}
            className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-md flex items-center text-sm transition-colors"
            disabled={loading || filteredUsers.length === 0}
          >
            <Download className="w-4 h-4 ml-2" />
            خروجی لیست کاربران
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-700">
        <button
          className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${
            activeTab === 'users' 
              ? 'border-teal-500 text-teal-400' 
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
          onClick={() => setActiveTab('users')}
        >
          <div className="flex items-center">
            <User className="w-4 h-4 ml-2" />
            شرکت‌کنندگان
          </div>
        </button>
        <button
          className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${
            activeTab === 'analytics' 
              ? 'border-teal-500 text-teal-400' 
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
          onClick={() => setActiveTab('analytics')}
        >
          <div className="flex items-center">
            <BarChart2 className="w-4 h-4 ml-2" />
            تحلیل سؤالات
          </div>
        </button>
      </div>

      {/* Search Input (Only for Users tab) */}
      {activeTab === 'users' && (
        <div className="relative max-w-md">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="جستجو بر اساس نام یا شناسه کاربر..."
            className="w-full bg-slate-800 border-slate-700 text-white text-sm rounded-md pr-10 pl-3 py-2 focus:ring-teal-500 focus:border-teal-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      )}

      {/* Content */}
      <div className="min-h-[400px]">
        {loading ? (
          <div className="flex justify-center items-center h-64 text-slate-400">در حال بارگذاری...</div>
        ) : activeTab === 'users' ? (
          <UsersListTable users={filteredUsers} />
        ) : (
          analytics && <AnalyticsView analytics={analytics} expandedQuestionId={expandedQuestionId} toggleQuestionExpand={toggleQuestionExpand} />
        )}
      </div>
    </div>
  );
}

function UsersListTable({ users }: { users: UserExamResultDto[] }) {
  if (users.length === 0) {
    return (
      <div className="text-center py-10 bg-slate-800 rounded-lg border border-slate-700 text-slate-400">
        هیچ شرکت‌کننده‌ای یافت نشد.
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-lg shadow border border-slate-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-700">
          <thead className="bg-slate-900/50">
            <tr>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">نام کاربر</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">تاریخ</th>
              <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-slate-400 uppercase tracking-wider">نمره</th>
              <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-slate-400 uppercase tracking-wider">وضعیت</th>
              <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-slate-400 uppercase tracking-wider">جزئیات پاسخ</th>
              <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-slate-400 uppercase tracking-wider">عملیات</th>
            </tr>
          </thead>
          <tbody className="bg-slate-800 divide-y divide-slate-700">
            {users.map((user) => (
              <tr key={user.submissionId} className="hover:bg-slate-700/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-white">{user.userFullName}</div>
                  <div className="text-xs text-slate-400">{user.userId}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                  {new Date(user.startDate).toLocaleDateString('fa-IR')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-bold text-white">
                  {user.totalScore}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${user.isPassed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {user.isPassed ? 'قبول' : 'رد'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-slate-300">
                  <div className="flex justify-center gap-2">
                    <span className="flex items-center text-green-400" title="پاسخ صحیح">
                      <CheckCircle className="w-4 h-4 ml-1" /> {user.correctCount}
                    </span>
                    <span className="flex items-center text-red-400" title="پاسخ غلط">
                      <XCircle className="w-4 h-4 ml-1" /> {user.incorrectCount}
                    </span>
                    <span className="flex items-center text-gray-400" title="بدون پاسخ">
                      <HelpCircle className="w-4 h-4 ml-1" /> {user.unansweredCount}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                  <Link 
                    href={`/dashboard/admin/assessments/reports/attempt/${user.submissionId}`}
                    className="text-teal-400 hover:text-teal-300 inline-flex items-center"
                  >
                    <Eye className="w-4 h-4 ml-1" />
                    مشاهده پاسخ‌نامه
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AnalyticsView({ 
  analytics, 
  expandedQuestionId, 
  toggleQuestionExpand 
}: { 
  analytics: ExamAnalyticsDto, 
  expandedQuestionId: number | null, 
  toggleQuestionExpand: (id: number) => void 
}) {
  return (
    <div className="space-y-4">
      {analytics.questions.map((q, index) => (
        <div key={q.questionId} className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
          <div 
            className="p-4 flex justify-between items-center cursor-pointer hover:bg-slate-750 transition-colors"
            onClick={() => toggleQuestionExpand(q.questionId)}
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-slate-700 text-slate-300 text-xs px-2 py-0.5 rounded">سؤال {index + 1}</span>
                <span className={`text-xs px-2 py-0.5 rounded ${q.correctPercentage > 70 ? 'bg-green-900 text-green-300' : q.correctPercentage < 30 ? 'bg-red-900 text-red-300' : 'bg-yellow-900 text-yellow-300'}`}>
                  {q.correctPercentage.toFixed(0)}% پاسخ صحیح
                </span>
              </div>
              <h3 className="text-white font-medium">{q.questionText}</h3>
            </div>
            <div className="text-slate-400">
              {expandedQuestionId === q.questionId ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>
          </div>
          
          {expandedQuestionId === q.questionId && (
            <div className="p-4 bg-slate-900/30 border-t border-slate-700">
              <div className="space-y-3">
                <div className="text-sm text-slate-400 mb-2">توزیع پاسخ‌ها (کل پاسخ‌ها: {q.totalAnswers})</div>
                {q.options.map((opt) => (
                  <div key={opt.optionId} className="relative">
                    <div className="flex justify-between text-sm mb-1">
                      <span className={`flex items-center ${opt.isCorrect ? 'text-green-400 font-bold' : 'text-slate-300'}`}>
                        {opt.isCorrect && <CheckCircle className="w-3 h-3 ml-1" />}
                        {opt.optionText}
                      </span>
                      <span className="text-slate-400">
                        {opt.selectionCount} ({opt.selectionPercentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2.5">
                      <div 
                        className={`h-2.5 rounded-full ${opt.isCorrect ? 'bg-green-500' : 'bg-blue-500'}`} 
                        style={{ width: `${opt.selectionPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
