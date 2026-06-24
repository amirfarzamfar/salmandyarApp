import { useState } from 'react';
import { useMedications, useDeleteMedication, useUpdateMedication } from '../../hooks/useMedications';
import { MedicationCard } from './MedicationCard';
import { Loader2 } from 'lucide-react';
import { MedicationWizard } from '../wizard/MedicationWizard';
import Swal from 'sweetalert2';
import { MedicationFormData } from '../../types';
import { InventoryManagementModal } from './InventoryManagementModal';

interface PatientMedicationListProps {
  patientId: number;
  readOnly?: boolean;
  allowEdit?: boolean;
  allowDelete?: boolean;
  allowInventoryManagement?: boolean;
}

export const PatientMedicationList = ({
  patientId,
  readOnly,
  allowEdit,
  allowDelete,
  allowInventoryManagement
}: PatientMedicationListProps) => {
  const { data: medications, isLoading } = useMedications(patientId);
  const { mutateAsync: deleteMedication } = useDeleteMedication();
  const { mutateAsync: updateMedication } = useUpdateMedication();
  
  const [editingMedication, setEditingMedication] = useState<any>(null);
  const [inventoryMedication, setInventoryMedication] = useState<any>(null);
  const canEdit = readOnly ? false : (allowEdit ?? true);
  const canDelete = readOnly ? false : (allowDelete ?? true);
  const canManageInventory = readOnly ? false : (allowInventoryManagement ?? true);

  const handleDelete = (id: number) => {
    Swal.fire({
      title: 'آیا اطمینان دارید؟',
      text: "این عملیات قابل بازگشت نیست و سوابق دارویی حذف خواهد شد.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'بله، حذف شود',
      cancelButtonText: 'انصراف'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
            await deleteMedication({ id, patientId });
            Swal.fire('حذف شد!', 'داروی مورد نظر با موفقیت حذف شد.', 'success');
        } catch (e: any) {
            Swal.fire('خطا', e.response?.data?.message || e.response?.data?.error || 'خطا در حذف دارو', 'error');
        }
      }
    })
  };

  const handleUpdate = async (data: MedicationFormData) => {
    if (!editingMedication) return;
    await updateMedication({ id: editingMedication.id, data });
    setEditingMedication(null);
  };

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
      <h2 className="text-xl font-bold text-gray-800 mb-6">لیست داروها</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {medications.map((med: any) => (
          <MedicationCard 
            key={med.id} 
            medication={med} 
            onEdit={canEdit ? setEditingMedication : undefined}
            onDelete={canDelete ? handleDelete : undefined}
            onManageInventory={canManageInventory ? setInventoryMedication : undefined}
          />
        ))}
      </div>

      {/* Edit Modal */}
      {canEdit && editingMedication && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 py-6 backdrop-blur-sm animate-in fade-in duration-200">
           <MedicationWizard 
             patientId={patientId}
             initialData={editingMedication}
             onSuccess={() => setEditingMedication(null)}
             onCancel={() => setEditingMedication(null)}
             onSubmit={handleUpdate}
           />
        </div>
      )}

      {canManageInventory && inventoryMedication && (
        <InventoryManagementModal
          medication={inventoryMedication}
          isOpen={Boolean(inventoryMedication)}
          onClose={() => setInventoryMedication(null)}
        />
      )}
    </div>
  );
};
