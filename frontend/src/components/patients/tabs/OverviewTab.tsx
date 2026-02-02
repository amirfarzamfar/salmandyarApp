import { Patient } from '@/types/patient';

export default function OverviewTab({ patient }: { patient: Patient }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-bold text-gray-900 mb-4">اطلاعات پزشکی</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-500">سوابق پزشکی:</span>
            <span className="font-medium">{patient.medicalHistory}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">نیازهای ویژه:</span>
            <span className="font-medium">{patient.needs}</span>
          </div>
        </div>
      </div>
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-bold text-gray-900 mb-4">اطلاعات تماس</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-500">آدرس:</span>
            <span className="font-medium">{patient.address}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
