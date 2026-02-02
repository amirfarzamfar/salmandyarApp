'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { patientService } from '@/services/patient.service';
import { Patient, CareLevel } from '@/types/patient';
import OverviewTab from '@/components/patients/tabs/OverviewTab';
import VitalSignsTab from '@/components/patients/tabs/VitalSignsTab';
import CareServicesTab from '@/components/patients/tabs/CareServicesTab';
import NursingReportsTab from '@/components/patients/tabs/NursingReportsTab';
import TimelineTab from '@/components/patients/tabs/TimelineTab';
import { Activity, ClipboardList, Clock, FileText, User } from 'lucide-react';

const tabs = [
  { id: 'overview', label: 'نمای کلی', icon: User },
  { id: 'vitals', label: 'علائم حیاتی', icon: Activity },
  { id: 'services', label: 'خدمات', icon: ClipboardList },
  { id: 'reports', label: 'گزارش‌های پرستاری', icon: FileText },
  { id: 'timeline', label: 'تایم‌لاین', icon: Clock },
];

export default function PatientProfilePage() {
  const params = useParams();
  const id = Number(params.id);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchPatient();
  }, [id]);

  const fetchPatient = async () => {
    try {
      const data = await patientService.getById(id);
      setPatient(data);
    } catch (error) {
      console.error('Error fetching patient:', error);
      // Mock data
      setPatient({
        id: id,
        firstName: 'احمد',
        lastName: 'رضایی',
        age: 75,
        primaryDiagnosis: 'دیابت نوع ۲',
        currentStatus: 'Stable',
        responsibleNurseName: 'سارا محمدی',
        dateOfBirth: '1330/01/01',
        medicalHistory: 'سابقه فشار خون بالا',
        needs: 'نیاز به کمک در راه رفتن',
        address: 'تهران، خیابان ولیعصر',
        careLevel: CareLevel.Level2,
        // Additional properties required by Patient interface
        responsibleNurseId: '1'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>در حال بارگذاری...</div>;
  if (!patient) return <div>بیمار یافت نشد.</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl shadow-sm flex items-center justify-between">
        <div className="flex items-center">
          <div className="h-16 w-16 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 text-2xl font-bold ml-4">
            {patient.firstName[0]}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{patient.firstName} {patient.lastName}</h1>
            <div className="flex items-center text-gray-500 mt-1">
              <span className="ml-4">سن: {patient.age} سال</span>
              <span className="ml-4">تشخیص: {patient.primaryDiagnosis}</span>
              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                patient.currentStatus === 'Critical' ? 'bg-red-100 text-red-800' :
                patient.currentStatus === 'Stable' ? 'bg-green-100 text-green-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {patient.currentStatus === 'Critical' ? 'بحرانی' : 
                 patient.currentStatus === 'Stable' ? 'پایدار' : 'در حال بهبود'}
              </span>
            </div>
          </div>
        </div>
        <div className="text-left">
          <p className="text-sm text-gray-500">پرستار مسئول</p>
          <p className="font-medium text-gray-900">{patient.responsibleNurseName || 'تعیین نشده'}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-1/5 py-4 px-1 text-center border-b-2 font-medium text-sm flex items-center justify-center transition-colors ${
                  activeTab === tab.id
                    ? 'border-teal-500 text-teal-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className={`ml-2 h-5 w-5 ${activeTab === tab.id ? 'text-teal-500' : 'text-gray-400'}`} />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && <OverviewTab patient={patient} />}
          {activeTab === 'vitals' && <VitalSignsTab patientId={patient.id} careLevel={patient.careLevel} />}
          {activeTab === 'services' && <CareServicesTab patientId={patient.id} />}
          {activeTab === 'reports' && <NursingReportsTab patientId={patient.id} />}
          {activeTab === 'timeline' && <TimelineTab patientId={patient.id} />}
        </div>
      </div>
    </div>
  );
}
