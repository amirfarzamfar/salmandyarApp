'use client';

import { useState, useEffect } from 'react';
import { userService, UserListDto, UserFilterDto } from '@/services/user.service';
import api from '@/lib/axios';
import { Search, UserCog, Ban, CheckCircle, Shield, History, MoreVertical, Eye, Lock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Swal from 'sweetalert2';
import { translateRole } from '@/utils/role-translation';

export default function UsersPage() {
  const [users, setUsers] = useState<UserListDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [filter, setFilter] = useState<UserFilterDto>({
    pageNumber: 1,
    pageSize: 10,
    searchTerm: '',
    role: '',
    isActive: undefined
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const result = await userService.getUsers(filter);
      setUsers(result.items);
      setTotalCount(result.totalCount);
    } catch (error) {
      toast.error('خطا در دریافت لیست کاربران');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Immediate fetch on mount or when filter changes (except search term)
    if (!filter.searchTerm) {
        fetchUsers();
    } else {
        // Debounce only for search term
        const debounce = setTimeout(() => {
            fetchUsers();
        }, 500);
        return () => clearTimeout(debounce);
    }
  }, [filter]);

  const handleStatusChange = async (user: UserListDto) => {
    const isActivating = !user.isActive;
    
    if (!isActivating) {
      const { value: reason } = await Swal.fire({
        title: 'مسدودسازی کاربر',
        input: 'text',
        inputLabel: 'دلیل مسدودسازی',
        inputPlaceholder: 'دلیل را وارد کنید...',
        showCancelButton: true,
        confirmButtonText: 'مسدود کردن',
        cancelButtonText: 'انصراف',
        confirmButtonColor: '#ef4444',
      });

      if (reason) {
        try {
          await userService.changeStatus(user.id, false, reason);
          toast.success('کاربر با موفقیت مسدود شد');
          fetchUsers();
        } catch (error) {
          toast.error('خطا در تغییر وضعیت');
        }
      }
    } else {
      try {
        await userService.changeStatus(user.id, true);
        toast.success('کاربر فعال شد');
        fetchUsers();
      } catch (error) {
        toast.error('خطا در تغییر وضعیت');
      }
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">مدیریت کاربران</h1>
        <div className="flex gap-2">
            <button 
              onClick={async () => {
                try {
                  const res = await api.get('/admin/users/test');
                  alert('Connection to backend successful: ' + JSON.stringify(res.data));
                } catch (e: any) {
                  alert('Connection failed: ' + e.message + ' - ' + (e.response?.data || 'No response'));
                }
              }}
              className="px-4 py-2 bg-slate-200 rounded-lg text-sm"
            >
              تست اتصال
            </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-slate-700 mb-1">جستجو</label>
          <div className="relative">
            <Search className="absolute right-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="نام، ایمیل، موبایل، کد ملی..."
              className="w-full pr-10 pl-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              value={filter.searchTerm}
              onChange={(e) => setFilter({ ...filter, searchTerm: e.target.value, pageNumber: 1 })}
            />
          </div>
        </div>

        <div className="w-48">
          <label className="block text-sm font-medium text-slate-700 mb-1">نقش</label>
          <select
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500"
            value={filter.role}
            onChange={(e) => setFilter({ ...filter, role: e.target.value, pageNumber: 1 })}
          >
            <option value="">همه نقش‌ها</option>
            <option value="Admin">ادمین</option>
            <option value="Nurse">پرستار</option>
            <option value="Patient">بیمار</option>
            <option value="Family">خانواده</option>
          </select>
        </div>

        <div className="w-48">
          <label className="block text-sm font-medium text-slate-700 mb-1">وضعیت</label>
          <select
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500"
            value={filter.isActive === undefined ? '' : filter.isActive.toString()}
            onChange={(e) => {
                const val = e.target.value;
                setFilter({ 
                    ...filter, 
                    isActive: val === '' ? undefined : val === 'true', 
                    pageNumber: 1 
                });
            }}
          >
            <option value="">همه</option>
            <option value="true">فعال</option>
            <option value="false">مسدود</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">کاربر</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">نقش</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">تماس</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">وضعیت</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">تاریخ عضویت</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-500">در حال بارگذاری...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-500">کاربری یافت نشد</td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 font-bold">
                          {user.firstName[0]}
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">{user.firstName} {user.lastName}</div>
                          <div className="text-xs text-slate-500">{user.nationalCode || 'بدون کد ملی'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${user.role === 'Admin' ? 'bg-purple-100 text-purple-800' : 
                          user.role === 'Nurse' ? 'bg-blue-100 text-blue-800' : 
                          'bg-slate-100 text-slate-800'}`}>
                        {translateRole(user.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-600">{user.phoneNumber}</div>
                      <div className="text-xs text-slate-400">{user.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => handleStatusChange(user)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors
                        ${user.isActive ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-red-100 text-red-800 hover:bg-red-200'}`}
                      >
                        {user.isActive ? <CheckCircle className="w-3 h-3" /> : <Ban className="w-3 h-3" />}
                        {user.isActive ? 'فعال' : 'مسدود'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {new Date(user.createdAt).toLocaleDateString('fa-IR')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                         <button title="مشاهده جزئیات" className="p-1 text-slate-400 hover:text-teal-600 transition-colors">
                            <Eye className="w-5 h-5" />
                         </button>
                         <button title="تغییر رمز" className="p-1 text-slate-400 hover:text-orange-600 transition-colors">
                            <Lock className="w-5 h-5" />
                         </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <div className="text-sm text-slate-500">
            نمایش {((filter.pageNumber - 1) * filter.pageSize) + 1} تا {Math.min(filter.pageNumber * filter.pageSize, totalCount)} از {totalCount} کاربر
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter({ ...filter, pageNumber: Math.max(1, filter.pageNumber - 1) })}
              disabled={filter.pageNumber === 1}
              className="px-3 py-1 border border-slate-300 rounded text-sm disabled:opacity-50"
            >
              قبلی
            </button>
            <button
              onClick={() => setFilter({ ...filter, pageNumber: filter.pageNumber + 1 })}
              disabled={filter.pageNumber * filter.pageSize >= totalCount}
              className="px-3 py-1 border border-slate-300 rounded text-sm disabled:opacity-50"
            >
              بعدی
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
