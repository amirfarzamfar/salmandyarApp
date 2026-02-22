import { useMedications } from '../../hooks/useMedications';
import { MedicationCard } from './MedicationCard';
import { Loader2 } from 'lucide-react';

interface PatientMedicationListProps {
  patientId: number;
}

export const PatientMedicationList = ({ patientId }: PatientMedicationListProps) => {
  const { data: medications, isLoading } = useMedications(patientId);

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
      </div>
    );
  }

  if (!medications?.length) {
    return (
      <div className="text-center p-8 text-gray-500">
        هیچ دارویی برای شما ثبت نشده است.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-800 mb-6">لیست داروهای من</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {medications.map((med: any) => (
          <MedicationCard key={med.id} medication={med} />
        ))}
      </div>
    </div>
  );
};
