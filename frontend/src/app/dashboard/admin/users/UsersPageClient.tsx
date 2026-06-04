'use client';

import { useState, useEffect } from 'react';
import { userService, UserListDto, UserFilterDto } from '@/services/user.service';
import api from '@/lib/axios';
import { Search, UserCog, Ban, CheckCircle, Shield, Lock, Clock3, ShieldCheck } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Swal from 'sweetalert2';
import { translateRole } from '@/utils/role-translation';
import { PatientSelfServiceAccessModal } from '@/components/admin/users/PatientSelfServiceAccessModal';
import { useSearchParams } from 'next/navigation';

export default function UsersPageClient() {
  const searchParams = useSearchParams();
  const [users, setUsers] = useState<UserListDto[]>([]);
  const [selectedUserForAccess, setSelectedUserForAccess] = useState<UserListDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [filter, setFilter] = useState<UserFilterDto>({
    pageNumber: 1,
    pageSize: 10,
    searchTerm: '',
    role: '',
    isActive: undefined
  });
  const selfServiceMode = searchParams.get('selfService') === '1';

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

  useEffect(() => {
    if (!selfServiceMode) {
      return;
    }

    setFilter((current) => ({
      ...current,
      role: current.role || 'Patient',
      pageNumber: 1
    }));
  }, [selfServiceMode]);

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

  const handleRoleChange = async (user: UserListDto) => {
    const roles = {
      'Admin': 'ادمین',
      'Manager': 'مدیر',
      'Supervisor': 'سوپروایزر',
      'Nurse': 'پرستار',
      'AssistantNurse': 'کمک پرستار',
      'Physiotherapist': 'فیزیوتراپیست',
      'ElderlyCareAssistant': 'مراقب سالمند',
      'Elderly': 'سالمند',
      'Patient': 'بیمار',
      'PatientFamily': 'خانواده بیمار'
    };

    const { value: role } = await Swal.fire({
      title: 'تغییر نقش کاربر',
      input: 'select',
      inputOptions: roles,
      inputValue: user.role,
      showCancelButton: true,
      confirmButtonText: 'ثبت تغییرات',
      cancelButtonText: 'انصراف',
      inputPlaceholder: 'انتخاب نقش جدید...',
    });

    if (role) {
      try {
        await userService.changeRole(user.id, role);
        toast.success('نقش کاربر با موفقیت تغییر یافت');
        fetchUsers();
      } catch (error) {
        toast.error('خطا در تغییر نقش کاربر');
      }
    }
  };

  const handleResetPassword = async (user: UserListDto) => {
    const { value: newPassword } = await Swal.fire({
      title: 'ریست رمز عبور',
      input: 'password',
      inputLabel: 'رمز عبور جدید',
      inputPlaceholder: 'رمز عبور جدید را وارد کنید...',
      showCancelButton: true,
      confirmButtonText: 'تغییر رمز',
      cancelButtonText: 'انصراف',
      inputAttributes: {
        autocapitalize: 'off',
        autocorrect: 'off'
      }
    });

    if (newPassword) {
      if (newPassword.length < 6) {
        toast.error('رمز عبور باید حداقل ۶ کاراکتر باشد');
        return;
      }
      try {
        await userService.resetPassword(user.id, newPassword);
        toast.success('رمز عبور با موفقیت تغییر کرد');
      } catch (error) {
        toast.error('خطا در تغییر رمز عبور');
      }
    }
  };

  const handleForceLogout = async (user: UserListDto) => {
    const result = await Swal.fire({
      title: 'خروج اجباری',
      text: `آیا از خارج کردن اجباری ${user.firstName} ${user.lastName} از سیستم اطمینان دارید؟`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'بله، خارج شود',
      cancelButtonText: 'انصراف'
    });

    if (result.isConfirmed) {
      try {
        await userService.forceLogout(user.id);
        toast.success('کاربر با موفقیت از سیستم خارج شد');
      } catch (error) {
        toast.error('خطا در انجام عملیات خروج اجباری');
      }
    }
  };

  const canManageSelfService = (user: UserListDto) =>
    user.role === 'Patient' || user.role === 'Elderly';

  const eligibleUsers = users.filter(canManageSelfService);

  const renderActionButtons = (user: UserListDto) => (
    <div className="flex flex-wrap items-center gap-2">
      {canManageSelfService(user) && (
        <button
          onClick={() => setSelectedUserForAccess(user)}
          title="دسترسی ثبت اطلاعات"
          className="inline-flex items-center gap-2 rounded-lg bg-teal-50 px-3 py-2 text-sm font-medium text-teal-700 transition-colors hover:bg-teal-100"
        >
          <Clock3 className="h-4 w-4" />
          <span>دسترسی ثبت اطلاعات</span>
        </button>
      )}
      <button
        onClick={() => handleRoleChange(user)}
        title="تغییر نقش"
        className="inline-flex items-center gap-1 rounded-lg px-2.5 py-2 text-sm text-slate-500 transition-colors hover:bg-purple-50 hover:text-purple-600"
      >
        <UserCog className="h-4 w-4" />
        <span className="sm:hidden">نقش</span>
      </button>
      <button
        onClick={() => handleResetPassword(user)}
        title="تغییر رمز"
        className="inline-flex items-center gap-1 rounded-lg px-2.5 py-2 text-sm text-slate-500 transition-colors hover:bg-orange-50 hover:text-orange-600"
      >
        <Lock className="h-4 w-4" />
        <span className="sm:hidden">رمز</span>
      </button>
      <button
        onClick={() => handleForceLogout(user)}
        title="خروج اجباری"
        className="inline-flex items-center gap-1 rounded-lg px-2.5 py-2 text-sm text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600"
      >
        <Shield className="h-4 w-4" />
        <span className="sm:hidden">خروج</span>
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-slate-800">مدیریت کاربران</h1>
        <div className="flex w-full gap-2 sm:w-auto">
            <button 
              onClick={async () => {
                try {
                  const res = await api.get('/admin/users/test');
                  alert('Connection to backend successful: ' + JSON.stringify(res.data));
                } catch (e: any) {
                  alert('Connection failed: ' + e.message + ' - ' + (e.response?.data || 'No response'));
                }
              }}
              className="w-full rounded-lg bg-slate-200 px-4 py-2 text-sm sm:w-auto"
            >
              تست اتصال
            </button>
        </div>
      </div>

      <div className="rounded-2xl border border-teal-200 bg-teal-50/70 p-4 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-teal-700 shadow-sm">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">مدیریت دسترسی ثبت اطلاعات بیمار و سالمند</h2>
              <p className="mt-1 text-sm text-slate-600">
                از همین صفحه می‌توانید برای کاربران بیمار و سالمند، ثبت علائم حیاتی و کاردکس دارویی را فعال یا غیرفعال کنید.
              </p>
              <p className="mt-2 text-xs text-slate-500">
                برای هر ردیف بیمار یا سالمند روی دکمه «دسترسی ثبت اطلاعات» بزنید.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setFilter((current) => ({ ...current, role: 'Patient', pageNumber: 1 }))}
              className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-100"
            >
              فقط بیماران
            </button>
            <button
              type="button"
              onClick={() => setFilter((current) => ({ ...current, role: 'Elderly', pageNumber: 1 }))}
              className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-100"
            >
              فقط سالمندان
            </button>
            <button
              type="button"
              onClick={() => setFilter((current) => ({ ...current, role: '', pageNumber: 1 }))}
              className="rounded-xl border border-white/80 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-white/60"
            >
              همه کاربران
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <span className="rounded-full bg-white px-3 py-1 font-medium text-slate-700">
            کاربران قابل تنظیم در این صفحه: {eligibleUsers.length}
          </span>
          {selfServiceMode && (
            <span className="rounded-full bg-teal-700 px-3 py-1 font-medium text-white">
              حالت مدیریت دسترسی فعال است
            </span>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:grid-cols-[minmax(0,1fr)_12rem_12rem]">
        <div className="min-w-0">
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

        <div>
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

        <div>
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
        <div className="lg:hidden divide-y divide-slate-200">
          {loading ? (
            <div className="py-8 text-center text-slate-500">در حال بارگذاری...</div>
          ) : users.length === 0 ? (
            <div className="py-8 text-center text-slate-500">کاربری یافت نشد</div>
          ) : (
            users.map((user) => (
              <div key={user.id} className="space-y-4 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-100 font-bold text-teal-600">
                      {user.firstName[0]}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate font-medium text-slate-900">{user.firstName} {user.lastName}</div>
                      <div className="truncate text-xs text-slate-500">{user.nationalCode || 'بدون کد ملی'}</div>
                    </div>
                  </div>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    user.role === 'Admin' ? 'bg-purple-100 text-purple-800' :
                    user.role === 'Nurse' ? 'bg-blue-100 text-blue-800' :
                    'bg-slate-100 text-slate-800'
                  }`}>
                    {translateRole(user.role)}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-3 rounded-lg bg-slate-50 p-3 text-sm sm:grid-cols-2">
                  <div>
                    <div className="text-xs text-slate-500">شماره تماس</div>
                    <div className="text-slate-700">{user.phoneNumber}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">ایمیل</div>
                    <div className="truncate text-slate-700">{user.email || '-'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">تاریخ عضویت</div>
                    <div className="text-slate-700">{new Date(user.createdAt).toLocaleDateString('fa-IR')}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">وضعیت</div>
                    <button
                      onClick={() => handleStatusChange(user)}
                      className={`mt-1 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                        user.isActive ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-red-100 text-red-800 hover:bg-red-200'
                      }`}
                    >
                      {user.isActive ? <CheckCircle className="h-3 w-3" /> : <Ban className="h-3 w-3" />}
                      {user.isActive ? 'فعال' : 'مسدود'}
                    </button>
                  </div>
                </div>

                {renderActionButtons(user)}
              </div>
            ))
          )}
        </div>

        <div className="hidden overflow-x-auto lg:block">
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
                      {renderActionButtons(user)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="text-sm text-slate-500">
            نمایش {((filter.pageNumber - 1) * filter.pageSize) + 1} تا {Math.min(filter.pageNumber * filter.pageSize, totalCount)} از {totalCount} کاربر
          </div>
          <div className="flex gap-2 self-end sm:self-auto">
            <button
              onClick={() => setFilter({ ...filter, pageNumber: Math.max(1, filter.pageNumber - 1) })}
              disabled={filter.pageNumber === 1}
              className="rounded border border-slate-300 px-3 py-1 text-sm disabled:opacity-50"
            >
              قبلی
            </button>
            <button
              onClick={() => setFilter({ ...filter, pageNumber: filter.pageNumber + 1 })}
              disabled={filter.pageNumber * filter.pageSize >= totalCount}
              className="rounded border border-slate-300 px-3 py-1 text-sm disabled:opacity-50"
            >
              بعدی
            </button>
          </div>
        </div>
      </div>

      <PatientSelfServiceAccessModal
        user={selectedUserForAccess}
        isOpen={Boolean(selectedUserForAccess)}
        onClose={() => setSelectedUserForAccess(null)}
        onSaved={fetchUsers}
      />
    </div>
  );
}
