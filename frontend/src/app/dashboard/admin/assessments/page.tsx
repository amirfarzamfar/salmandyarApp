'use client';

import Link from 'next/link';
import { Plus, ClipboardList, Activity, Trash2, Edit, Power } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { assessmentService } from '@/services/assessment.service';
import { toast } from 'react-hot-toast';
import Swal from 'sweetalert2';

export default function AssessmentsListPage() {
  const queryClient = useQueryClient();

  const { data: forms, isLoading } = useQuery({
    queryKey: ['assessments'],
    queryFn: assessmentService.getAllForms,
  });

  const deleteMutation = useMutation({
    mutationFn: assessmentService.deleteForm,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assessments'] });
      toast.success('آزمون حذف شد');
    },
    onError: () => toast.error('خطا در حذف آزمون')
  });

  const toggleMutation = useMutation({
    mutationFn: assessmentService.toggleForm,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assessments'] });
      toast.success('وضعیت تغییر کرد');
    },
    onError: () => toast.error('خطا در تغییر وضعیت')
  });

  const handleDelete = (id: number) => {
    Swal.fire({
      title: 'آیا مطمئن هستید؟',
      text: "این عملیات قابل بازگشت نیست!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'بله، حذف کن',
      cancelButtonText: 'انصراف',
      background: '#1e293b',
      color: '#fff'
    }).then((result) => {
      if (result.isConfirmed) {
        deleteMutation.mutate(id);
      }
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <ClipboardList className="text-teal-400" />
          مدیریت آزمون‌ها
        </h1>
        <Link
          href="/dashboard/admin/assessments/create"
          className="flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-colors"
        >
          <Plus size={18} />
          آزمون جدید
        </Link>
      </div>

      {isLoading ? (
          <div className="text-center text-slate-400 mt-10">در حال بارگذاری...</div>
      ) : forms && forms.length === 0 ? (
          <div className="text-center text-slate-500 mt-10 bg-slate-800 p-10 rounded-xl border border-slate-700">
              هیچ آزمونی یافت نشد. اولین آزمون را ایجاد کنید!
          </div>
      ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {forms?.map((form: any) => (
                <div key={form.id} className="bg-slate-800 p-6 rounded-xl border border-slate-700 hover:border-teal-500/50 transition-all group relative">
                    <div className="flex justify-between items-start mb-4">
                        <div className={`p-3 rounded-lg transition-colors ${
                            form.type === 0 ? 'bg-blue-500/10 text-blue-400' : 'bg-purple-500/10 text-purple-400'
                        }`}>
                            {form.type === 0 ? <Activity size={24} /> : <ClipboardList size={24} />}
                        </div>
                        <button 
                            onClick={() => toggleMutation.mutate(form.id)}
                            className={`text-xs font-medium px-2 py-1 rounded-full border transition-colors ${
                                form.isActive 
                                ? 'bg-green-500/10 text-green-400 border-green-500/20 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20' 
                                : 'bg-slate-700 text-slate-400 border-slate-600 hover:bg-green-500/10 hover:text-green-400'
                            }`}
                        >
                            {form.isActive ? 'فعال' : 'غیرفعال'}
                        </button>
                    </div>
                    
                    <h3 className="text-lg font-bold text-white mb-2">{form.title}</h3>
                    <p className="text-sm text-slate-400 mb-4 line-clamp-2 min-h-[40px]">
                        {form.description || 'بدون توضیحات'}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-700 pt-4 mb-4">
                        <span>{form.questions?.length || 0} سوال</span>
                        <span>{form.type === 0 ? 'ارزیابی پرستار' : 'ارزیابی سالمند'}</span>
                    </div>

                    <div className="flex gap-2">
                        <Link 
                            href={`/dashboard/admin/assessments/${form.id}/edit`}
                            className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm text-center transition-colors flex items-center justify-center gap-2"
                        >
                            <Edit size={16} /> ویرایش
                        </Link>
                        <button 
                            onClick={() => handleDelete(form.id)}
                            className="px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                </div>
            ))}
          </div>
      )}
    </div>
  );
}
