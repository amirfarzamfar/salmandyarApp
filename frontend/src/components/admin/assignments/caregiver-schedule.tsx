"use client";

import { AssignmentDto, AssignmentStatus } from "@/types/assignment";
import { format, startOfWeek, addDays, isSameDay } from "date-fns";
import { faIR } from "date-fns/locale";
import { User, Stethoscope, Clock } from "lucide-react";

interface CaregiverScheduleProps {
  assignments: AssignmentDto[];
  onEdit?: (assignment: AssignmentDto) => void;
}

export function CaregiverSchedule({ assignments, onEdit }: CaregiverScheduleProps) {
  const startDate = startOfWeek(new Date(), { weekStartsOn: 6 }); // Saturday start
  const days = Array.from({ length: 7 }, (_, i) => addDays(startDate, i));

  const getAssignmentsForDay = (date: Date) => {
    return assignments.filter(a => {
      const start = new Date(a.startDate);
      return isSameDay(date, start); 
    });
  };

  const formatPersianDate = (date: Date) => {
    return new Intl.DateTimeFormat('fa-IR-u-ca-persian', { month: 'long', day: 'numeric' }).format(date);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
      <div className="grid grid-cols-7 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
        {days.map(day => (
          <div key={day.toString()} className="p-4 text-center border-l dark:border-gray-700 last:border-l-0">
            <div className="font-bold text-gray-700 dark:text-gray-200">{format(day, 'EEEE', { locale: faIR })}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{formatPersianDate(day)}</div>
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 min-h-[400px]">
        {days.map(day => {
          const dayAssignments = getAssignmentsForDay(day);
          return (
            <div key={day.toString()} className="border-l dark:border-gray-700 last:border-l-0 p-2 space-y-2 bg-white dark:bg-gray-800">
              {dayAssignments.map(assignment => (
                <div 
                  key={assignment.id} 
                  onClick={() => onEdit?.(assignment)}
                  className={`p-2.5 rounded-xl text-xs font-medium cursor-pointer hover:shadow-md transition-all border ${
                    assignment.status === AssignmentStatus.Active 
                      ? 'bg-teal-50 dark:bg-teal-900/20 text-teal-900 dark:text-teal-100 border-teal-100 dark:border-teal-800' 
                      : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-100 dark:border-gray-700'
                  }`}
                >
                  {/* Caregiver Row */}
                  <div className="flex items-center gap-1.5 mb-1.5 pb-1.5 border-b border-black/5 dark:border-white/10">
                    <Stethoscope size={14} className="text-teal-600 dark:text-teal-400 shrink-0" />
                    <span className="font-bold truncate">{assignment.caregiverName}</span>
                  </div>
                  
                  {/* Patient Row */}
                  <div className="flex items-center gap-1.5 mb-2">
                    <User size={14} className="text-gray-500 dark:text-gray-400 shrink-0" />
                    <span className="truncate opacity-90">{assignment.patientName}</span>
                  </div>

                  {/* Time Row */}
                  <div className="flex items-center gap-1.5 text-[10px] opacity-75 bg-black/5 dark:bg-white/5 rounded px-1.5 py-0.5 w-fit">
                    <Clock size={10} />
                    <span>{format(new Date(assignment.startDate), 'HH:mm')}</span>
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
