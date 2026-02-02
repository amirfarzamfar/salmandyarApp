'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { patientService } from '@/services/patient.service';
import { PatientList } from '@/types/patient';
import { Plus, Search, Filter } from 'lucide-react';

export default function PatientsPage() {
  const [patients, setPatients] = useState<PatientList[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const data = await patientService.getAll();
      setPatients(data);
    } catch (error) {
      console.error('Error fetching patients:', error);
      // Mock data for demo if API fails (Optional, but good for preview)
      setPatients([
        { id: 1, firstName: 'احمد', lastName: 'رضایی', age: 75, primaryDiagnosis: 'دیابت نوع ۲', currentStatus: 'Stable', responsibleNurseName: 'سارا محمدی' },
        { id: 2, firstName: 'زهرا', lastName: 'کریمی', age: 82, primaryDiagnosis: 'فشار خون بالا', currentStatus: 'Recovering', responsibleNurseName: 'علی اکبری' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(p => 
    p.firstName.includes(searchTerm) || 
    p.lastName.includes(searchTerm) ||
    p.primaryDiagnosis.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">مدیریت بیماران</h1>
        <button className="flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors">
          <Plus className="ml-2 h-5 w-5" />
          ثبت بیمار جدید
        </button>
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
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">نام و نام خانوادگی</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">سن</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">تشخیص</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">پرستار مسئول</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">وضعیت</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">عملیات</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">در حال بارگذاری...</td>
                </tr>
              ) : filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">بیماری یافت نشد.</td>
                </tr>
              ) : (
                filteredPatients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold">
                          {patient.firstName[0]}
                        </div>
                        <div className="mr-4">
                          <div className="text-sm font-medium text-gray-900">{patient.firstName} {patient.lastName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{patient.age} سال</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{patient.primaryDiagnosis}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{patient.responsibleNurseName || 'تعیین نشده'}</td>
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
                      <Link href={`/dashboard/patients/${patient.id}`} className="text-teal-600 hover:text-teal-900">
                        مشاهده پرونده
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
