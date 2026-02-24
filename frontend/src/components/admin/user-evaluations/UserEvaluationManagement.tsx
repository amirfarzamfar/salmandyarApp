'use client';

import { useState, useEffect, Fragment } from 'react';
import { userEvaluationService } from '@/services/user-evaluation.service';
import { UserEvaluationSummary, UserEvaluation, UserEvaluationStatus } from '@/types/user-evaluation';
import { Search, Filter, ChevronDown, ChevronUp, Plus, Eye, CheckCircle, Clock, AlertCircle, XCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { AssignEvaluationModal } from './AssignEvaluationModal';
import { EvaluationResultView } from './EvaluationResultView';

export default function UserEvaluationManagement() {
  const [summaries, setSummaries] = useState<UserEvaluationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState<string>('');
  const [filterActive, setFilterActive] = useState<string>(''); // 'true', 'false', ''
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [userEvaluations, setUserEvaluations] = useState<Record<string, UserEvaluation[]>>({});
  const [loadingEvaluations, setLoadingEvaluations] = useState<string | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedUserForAssign, setSelectedUserForAssign] = useState<string | null>(null);
  const [viewResultEvaluation, setViewResultEvaluation] = useState<UserEvaluation | null>(null);

  useEffect(() => {
    fetchSummaries();
  }, [filterRole, filterActive]);

  const fetchSummaries = async () => {
    setLoading(true);
    try {
      const isActive = filterActive === 'true' ? true : filterActive === 'false' ? false : undefined;
      const data = await userEvaluationService.getUserSummaries(filterRole || undefined, isActive);
      setSummaries(data);
    } catch (error) {
      toast.error('خطا در دریافت لیست کاربران');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = async (userId: string) => {
    if (expandedUserId === userId) {
      setExpandedUserId(null);
      return;
    }

    setExpandedUserId(userId);
    if (!userEvaluations[userId]) {
      setLoadingEvaluations(userId);
      try {
        const evaluations = await userEvaluationService.getUserEvaluations(userId);
        setUserEvaluations(prev => ({ ...prev, [userId]: evaluations }));
      } catch (error) {
        toast.error('خطا در دریافت ارزیابی‌های کاربر');
      } finally {
        setLoadingEvaluations(null);
      }
    }
  };

  const handleAssignClick = (userId: string) => {
    setSelectedUserForAssign(userId);
    setIsAssignModalOpen(true);
  };

  const handleAssignmentCreated = () => {
    setIsAssignModalOpen(false);
    setSelectedUserForAssign(null);
    fetchSummaries();
    if (expandedUserId) {
        // Refresh expanded user assignments
        setLoadingEvaluations(expandedUserId);
        userEvaluationService.getUserEvaluations(expandedUserId).then(evaluations => {
            setUserEvaluations(prev => ({ ...prev, [expandedUserId]: evaluations }));
            setLoadingEvaluations(null);
        });
    }
    toast.success('ارزیابی با موفقیت تخصیص داده شد');
  };

  const getStatusBadge = (status: UserEvaluationStatus) => {
    switch (status) {
      case UserEvaluationStatus.Pending:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 ml-1" /> انجام نشده</span>;
      case UserEvaluationStatus.InProgress:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"><Clock className="w-3 h-3 ml-1" /> در حال انجام</span>;
      case UserEvaluationStatus.Completed:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 ml-1" /> تکمیل شده</span>;
      case UserEvaluationStatus.Expired:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"><AlertCircle className="w-3 h-3 ml-1" /> منقضی شده</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">نامشخص</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-slate-800 p-4 rounded-lg shadow border border-slate-700 flex flex-wrap gap-4 items-center">
        <div className="relative">
          <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <select
            className="w-48 bg-slate-700 border-slate-600 text-white text-sm rounded-md pr-10 pl-3 py-2 focus:ring-teal-500 focus:border-teal-500"
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
          >
            <option value="">همه نقش‌ها</option>
            <option value="Nurse">پرستار</option>
            <option value="Senior">سالمندیار</option>
            <option value="Patient">بیمار</option>
            <option value="Family">خانواده</option>
          </select>
        </div>
        
        <div className="relative">
          <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <select
            className="w-48 bg-slate-700 border-slate-600 text-white text-sm rounded-md pr-10 pl-3 py-2 focus:ring-teal-500 focus:border-teal-500"
            value={filterActive}
            onChange={(e) => setFilterActive(e.target.value)}
          >
            <option value="">همه وضعیت‌ها</option>
            <option value="true">فعال</option>
            <option value="false">غیرفعال</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-slate-800 rounded-lg shadow border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-700">
            <thead className="bg-slate-900/50">
              <tr>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">کاربر</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">نقش</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">وضعیت کاربر</th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-slate-400 uppercase tracking-wider">تعداد ارزیابی</th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-slate-400 uppercase tracking-wider">تکمیل شده</th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-slate-400 uppercase tracking-wider">عملیات</th>
              </tr>
            </thead>
            <tbody className="bg-slate-800 divide-y divide-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-slate-400">در حال بارگذاری...</td>
                </tr>
              ) : summaries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-slate-400">کاربری یافت نشد.</td>
                </tr>
              ) : (
                summaries.map((summary) => (
                  <Fragment key={summary.userId}>
                    <tr className={`hover:bg-slate-700/50 transition-colors ${expandedUserId === summary.userId ? 'bg-slate-700/30' : ''}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-teal-500/10 flex items-center justify-center text-teal-500 font-bold ml-3">
                            {summary.fullName.charAt(0)}
                          </div>
                          <div className="text-sm font-medium text-white">{summary.fullName}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{summary.role}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${summary.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {summary.isActive ? 'فعال' : 'غیرفعال'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-slate-300">
                        <span className="bg-slate-700 px-2 py-1 rounded-md">{summary.totalEvaluations}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-green-400 font-medium">
                        {summary.completed}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium">
                        <button
                          onClick={() => handleAssignClick(summary.userId)}
                          className="text-teal-400 hover:text-teal-300 ml-4"
                          title="تخصیص ارزیابی"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => toggleExpand(summary.userId)}
                          className="text-slate-400 hover:text-white"
                          title="مشاهده جزئیات"
                        >
                          {expandedUserId === summary.userId ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </button>
                      </td>
                    </tr>
                    
                    {/* Expanded Row: Evaluations List */}
                    {expandedUserId === summary.userId && (
                      <tr>
                        <td colSpan={6} className="px-0 py-0 bg-slate-900/30 border-b border-slate-700">
                          <div className="p-4 pr-14">
                            <h4 className="text-sm font-bold text-slate-300 mb-3 flex items-center">
                              <Clock className="w-4 h-4 ml-2 text-teal-400" />
                              تاریخچه ارزیابی‌های {summary.fullName}
                            </h4>
                            
                            {loadingEvaluations === summary.userId ? (
                              <div className="text-center py-4 text-slate-400 text-sm">در حال دریافت اطلاعات...</div>
                            ) : !userEvaluations[summary.userId] || userEvaluations[summary.userId].length === 0 ? (
                              <div className="text-center py-4 text-slate-500 text-sm border border-dashed border-slate-700 rounded-md">
                                هیچ ارزیابی برای این کاربر یافت نشد.
                              </div>
                            ) : (
                              <div className="overflow-hidden rounded-md border border-slate-700">
                                <table className="min-w-full divide-y divide-slate-700 bg-slate-800">
                                  <thead className="bg-slate-900">
                                    <tr>
                                      <th className="px-4 py-2 text-right text-xs text-slate-400">نام ارزیابی</th>
                                      <th className="px-4 py-2 text-right text-xs text-slate-400">تاریخ تخصیص</th>
                                      <th className="px-4 py-2 text-right text-xs text-slate-400">مهلت</th>
                                      <th className="px-4 py-2 text-center text-xs text-slate-400">اجباری</th>
                                      <th className="px-4 py-2 text-center text-xs text-slate-400">وضعیت</th>
                                      <th className="px-4 py-2 text-center text-xs text-slate-400">نمره</th>
                                      <th className="px-4 py-2 text-center text-xs text-slate-400">عملیات</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-700">
                                    {userEvaluations[summary.userId].map((evaluation) => (
                                      <tr key={evaluation.id} className="hover:bg-slate-700/50">
                                        <td className="px-4 py-2 text-sm text-white">{evaluation.formTitle}</td>
                                        <td className="px-4 py-2 text-sm text-slate-400">{new Date(evaluation.assignedDate).toLocaleDateString('fa-IR')}</td>
                                        <td className="px-4 py-2 text-sm text-slate-400">
                                          {evaluation.deadline ? new Date(evaluation.deadline).toLocaleDateString('fa-IR') : '-'}
                                        </td>
                                        <td className="px-4 py-2 text-center">
                                            {evaluation.isMandatory ? (
                                                <span className="text-red-400 text-xs bg-red-400/10 px-2 py-0.5 rounded">اجباری</span>
                                            ) : (
                                                <span className="text-slate-400 text-xs">اختیاری</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-2 text-center">
                                            {getStatusBadge(evaluation.status)}
                                        </td>
                                        <td className="px-4 py-2 text-center text-sm font-bold text-white">
                                          {evaluation.score !== undefined ? evaluation.score : '-'}
                                        </td>
                                        <td className="px-4 py-2 text-center">
                                            {evaluation.status === UserEvaluationStatus.Completed && (
                                                <button 
                                                    onClick={() => setViewResultEvaluation(evaluation)}
                                                    className="text-teal-400 hover:text-teal-300 text-xs flex items-center justify-center mx-auto"
                                                >
                                                    <Eye className="w-4 h-4 ml-1" />
                                                    مشاهده پاسخ‌ها
                                                </button>
                                            )}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isAssignModalOpen && selectedUserForAssign && (
        <AssignEvaluationModal 
            userId={selectedUserForAssign} 
            isOpen={isAssignModalOpen} 
            onClose={() => setIsAssignModalOpen(false)}
            onSuccess={handleAssignmentCreated}
        />
      )}

      {viewResultEvaluation && (
        <EvaluationResultView
            assignment={viewResultEvaluation}
            onClose={() => setViewResultEvaluation(null)}
        />
      )}
    </div>
  );
}
