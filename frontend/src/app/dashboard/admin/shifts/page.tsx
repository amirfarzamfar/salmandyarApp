"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { assignmentService } from "@/services/assignment.service";
import { CaregiverSchedule } from "@/components/admin/assignments/caregiver-schedule";
import { AssignmentWizard } from "@/components/admin/assignments/assignment-wizard";
import { Button } from "@/components/ui/Button";
import { Plus, Calendar as CalendarIcon, Filter, Clock } from "lucide-react";
import { startOfMonth, endOfMonth } from "date-fns";

import { AssignmentDto } from "@/types/assignment";

export default function ShiftManagementPage() {
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<AssignmentDto | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [filterPatientId, setFilterPatientId] = useState<string>("");
  const [filterCaregiverId, setFilterCaregiverId] = useState<string>("");

  // Need to fetch patients/caregivers for filter dropdowns - ideally from a hook or service
  // For now, using text inputs for simplicity or mock if needed. 
  // Better UX: AsyncSelect. But let's stick to simple inputs or fetch for now.
  
  const { data: assignments, isLoading, refetch } = useQuery({
    queryKey: ['assignments', currentDate, filterPatientId, filterCaregiverId],
    queryFn: () => assignmentService.getCalendar(
      startOfMonth(currentDate).toISOString(),
      endOfMonth(currentDate).toISOString(),
      filterPatientId ? parseInt(filterPatientId) : undefined,
      filterCaregiverId || undefined
    )
  });

  const handleEdit = (assignment: AssignmentDto) => {
    setEditingAssignment(assignment);
    setIsWizardOpen(true);
  };

  const handleCloseWizard = () => {
    setIsWizardOpen(false);
    setEditingAssignment(null);
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50/50 dark:bg-gray-900 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <Clock className="w-6 h-6 text-teal-600" />
            مدیریت شیفت و تخصیص
          </h1>
          <p className="text-sm text-gray-500 mt-1">برنامه‌ریزی و مدیریت زمان‌بندی پرستاران و بیماران</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant={isFilterOpen ? "secondary" : "outline"}
            onClick={() => setIsFilterOpen(!isFilterOpen)} 
            className="gap-2 bg-white dark:bg-gray-800"
          >
            <Filter size={16} />
            فیلترها
          </Button>
          <Button 
            onClick={() => {
              setEditingAssignment(null);
              setIsWizardOpen(true);
            }} 
            className="gap-2 bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-600/20"
          >
            <Plus size={16} />
            تخصیص جدید
          </Button>
        </div>
      </div>

      {isFilterOpen && (
        <div className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 grid grid-cols-1 md:grid-cols-3 gap-4 animate-in slide-in-from-top-2">
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500">کد بیمار</label>
            <input 
              type="number" 
              placeholder="مثلا: 101" 
              className="w-full p-2 border rounded-lg text-sm bg-gray-50 dark:bg-gray-900 dark:border-gray-700"
              value={filterPatientId}
              onChange={(e) => setFilterPatientId(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500">کد پرستار</label>
            <input 
              type="text" 
              placeholder="شناسه پرستار..." 
              className="w-full p-2 border rounded-lg text-sm bg-gray-50 dark:bg-gray-900 dark:border-gray-700"
              value={filterCaregiverId}
              onChange={(e) => setFilterCaregiverId(e.target.value)}
            />
          </div>
          <div className="flex items-end">
             <Button variant="ghost" size="sm" onClick={() => { setFilterPatientId(""); setFilterCaregiverId(""); }} className="text-red-500 hover:text-red-600 hover:bg-red-50">
               پاک کردن فیلترها
             </Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full" />
        </div>
      ) : (
        <CaregiverSchedule 
          assignments={assignments || []} 
          onEdit={handleEdit}
        />
      )}

      <AssignmentWizard 
        isOpen={isWizardOpen} 
        onClose={handleCloseWizard}
        onSuccess={() => refetch()}
        initialData={editingAssignment}
      />
    </div>
  );
}
