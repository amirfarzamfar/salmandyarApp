'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { patientService } from '@/services/patient.service';
import { CareLevel, PatientList } from '@/types/patient';
import { Search, Filter, Pencil } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';

export default function PatientsPage() {
  const [patients, setPatients] = useState<PatientList[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingPatient, setEditingPatient] = useState<PatientList | null>(null);
  const [editPrimaryDiagnosis, setEditPrimaryDiagnosis] = useState('');
  const [editCareLevel, setEditCareLevel] = useState<number>(CareLevel.Level3);
  const [editSpecialNeeds, setEditSpecialNeeds] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const data = await patientService.getAll();
      setPatients(data);
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const openEdit = async (patient: PatientList) => {
    setEditingPatient(patient);
    setEditPrimaryDiagnosis(patient.primaryDiagnosis || '');
    setEditCareLevel(patient.careLevel);
    setEditSpecialNeeds('');

    try {
      const full = await patientService.getById(patient.id);
      setEditSpecialNeeds(full.needs || '');
    } catch (error) {
      console.error('Error fetching patient details for edit:', error);
    }
  };

  const closeEdit = () => {
    setEditingPatient(null);
    setEditPrimaryDiagnosis('');
    setEditCareLevel(CareLevel.Level3);
    setEditSpecialNeeds('');
    setIsSaving(false);
  };

  const careLevelLabel = (value: number) => {
    switch (value) {
      case CareLevel.Level1: return 'سطح ۱ (مراقبت ویژه)';
      case CareLevel.Level2: return 'سطح ۲ (مراقبت گسترده)';
      case CareLevel.Level3: return 'سطح ۳ (مراقبت متوسط)';
      case CareLevel.Level4: return 'سطح ۴ (مراقبت پایه)';
      case CareLevel.Level5: return 'سطح ۵ (مراقبت حداقل)';
      default: return 'نامشخص';
    }
  };

  const handleSaveAdminInfo = async () => {
    if (!editingPatient) return;
    setIsSaving(true);
    try {
      const updated = await patientService.updateAdminInfo(editingPatient.id, {
        primaryDiagnosis: editPrimaryDiagnosis.trim() || 'نامشخص',
        careLevel: editCareLevel,
        specialNeeds: editSpecialNeeds.trim() || null
      });

      setPatients((prev) =>
        prev.map((p) =>
          p.id === updated.id
            ? {
                ...p,
                primaryDiagnosis: updated.primaryDiagnosis,
                careLevel: updated.careLevel,
              }
            : p
        )
      );
      closeEdit();
    } catch (error) {
      console.error('Error updating patient admin info:', error);
      setIsSaving(false);
    }
  };

  const filteredPatients = patients?.filter(p => {
    const term = searchTerm.toLowerCase();
    return (
      (p.firstName || '').toLowerCase().includes(term) || 
      (p.lastName || '').toLowerCase().includes(term) ||
      (p.primaryDiagnosis || '').toLowerCase().includes(term)
    );
  }) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">مدیریت بیماران</h1>
      </div>

      <div className="bg-blue-50 text-blue-800 p-4 rounded-xl shadow-sm text-sm">
        <p>
          <strong>توجه:</strong> لیست بیماران و سالمندان به صورت خودکار از قسمت مدیریت کاربران (کاربرانی که نقش «بیمار» یا «سالمند» دارند) همگام‌سازی می‌شود. 
          برای افزودن بیمار جدید، لطفا از بخش <Link href="/dashboard/admin/users" className="text-blue-600 underline font-medium">مدیریت کاربران</Link> اقدام کنید و نقش کاربر را به «بیمار» یا «سالمند» تغییر دهید.
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-4 bg-white p-4 rounded-xl shadow-sm">
        <div className="flex-1 relative">
          <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="جستجو بر اساس نام، نام خانوادگی یا تشخیص..."
            className="w-full pr-10 pl-4 py-2 border rounded-lg focus:ring-teal-500 focus:border-teal-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="flex items-center px-4 py-2 border rounded-lg hover:bg-gray-50 text-gray-700">
          <Filter className="ml-2 h-5 w-5" />
          فیلتر وضعیت
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">بیمار</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">سن</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">تشخیص اصلی</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">پرستار مسئول</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">وضعیت پروفایل</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">وضعیت فعلی</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">عملیات</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">در حال بارگذاری...</td>
                </tr>
              ) : filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">بیماری یافت نشد.</td>
                </tr>
              ) : (
                filteredPatients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold">
                          {patient.firstName ? patient.firstName[0] : '?'}
                        </div>
                        <div className="mr-4">
                          <div className="text-sm font-medium text-gray-900">{patient.firstName || 'نامشخص'} {patient.lastName || ''}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{patient.age ?? 'نامشخص'} سال</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{patient.primaryDiagnosis || 'نامشخص'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{patient.responsibleNurseName || 'تعیین نشده'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {patient.isProfileCompleted ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          تکمیل شده
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                          ناقص
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        patient.currentStatus === 'Critical' ? 'bg-red-100 text-red-800' :
                        patient.currentStatus === 'Stable' ? 'bg-green-100 text-green-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {patient.currentStatus === 'Critical' ? 'بحرانی' : 
                         patient.currentStatus === 'Stable' ? 'پایدار' : 'در حال بهبود'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-3">
                        <Link href={`/dashboard/patients/${patient.id}`} className="text-teal-600 hover:text-teal-900">
                          مشاهده پرونده
                        </Link>
                        <button
                          type="button"
                          onClick={() => openEdit(patient)}
                          className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                          title="ویرایش تشخیص، سطح مراقبت و نیازهای ویژه"
                        >
                          <Pencil className="h-4 w-4" />
                          ویرایش
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={!!editingPatient} onOpenChange={(open) => { if (!open) closeEdit(); }}>
        <DialogContent className="w-[95vw] max-w-xl rounded-2xl bg-white p-0 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <DialogTitle className="text-lg font-black text-gray-900">تنظیمات ادمین بیمار</DialogTitle>
            <DialogDescription className="mt-1 text-sm text-gray-500">
              تشخیص، سطح مراقبت و نیازهای ویژه را مشخص کنید.
            </DialogDescription>
          </div>

          <div className="p-6 space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700">تشخیص</label>
              <input
                type="text"
                value={editPrimaryDiagnosis}
                onChange={(e) => setEditPrimaryDiagnosis(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="مثلاً: سکته مغزی"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700">سطح مراقبت</label>
              <select
                value={editCareLevel}
                onChange={(e) => setEditCareLevel(Number(e.target.value))}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value={CareLevel.Level1}>{careLevelLabel(CareLevel.Level1)}</option>
                <option value={CareLevel.Level2}>{careLevelLabel(CareLevel.Level2)}</option>
                <option value={CareLevel.Level3}>{careLevelLabel(CareLevel.Level3)}</option>
                <option value={CareLevel.Level4}>{careLevelLabel(CareLevel.Level4)}</option>
                <option value={CareLevel.Level5}>{careLevelLabel(CareLevel.Level5)}</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700">نیازهای ویژه</label>
              <textarea
                value={editSpecialNeeds}
                onChange={(e) => setEditSpecialNeeds(e.target.value)}
                className="w-full min-h-24 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="نکات مهم مراقبتی که توسط ادمین تعیین می‌شود..."
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100">
            <button
              type="button"
              onClick={closeEdit}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50"
              disabled={isSaving}
            >
              انصراف
            </button>
            <button
              type="button"
              onClick={handleSaveAdminInfo}
              className="rounded-xl bg-teal-600 px-4 py-2 text-sm font-bold text-white hover:bg-teal-700 disabled:opacity-60"
              disabled={isSaving}
            >
              {isSaving ? 'در حال ذخیره...' : 'ذخیره'}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
