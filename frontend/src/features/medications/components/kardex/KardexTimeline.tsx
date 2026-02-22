import { useState } from 'react';
import { useKardex, useLogDose } from '../../hooks/useKardex';
import { AdministrationModal } from './AdministrationModal';
import { DoseStatus } from '@/types/medication';
import { format, parseISO } from 'date-fns';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import DatePicker from 'react-multi-date-picker';
import persian from 'react-date-object/calendars/persian';
import persian_fa from 'react-date-object/locales/persian_fa';

interface KardexTimelineProps {
  patientId: number;
}

export const KardexTimeline = ({ patientId }: KardexTimelineProps) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const dateString = format(selectedDate, 'yyyy-MM-dd');
  
  const { data: doses, isLoading } = useKardex(patientId, dateString);
  const { mutate: logDose } = useLogDose();
  
  const [selectedDose, setSelectedDose] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Group doses by medication
  const groupedDoses = doses?.reduce((acc: any, dose: any) => {
    const medId = dose.medicationId;
    if (!acc[medId]) {
      acc[medId] = {
        id: medId,
        name: dose.medicationName,
        dosage: dose.dosage,
        route: dose.route,
        doses: []
      };
    }
    acc[medId].doses.push(dose);
    return acc;
  }, {}) || {};

  const medications = Object.values(groupedDoses);
  const hours = Array.from({ length: 24 }, (_, i) => i); // 0 to 23

  const handleDoseClick = (dose: any) => {
    setSelectedDose(dose);
    setIsModalOpen(true);
  };

  const handleAdminister = (note?: string) => {
    if (selectedDose) {
      logDose({
        doseId: selectedDose.id,
        status: DoseStatus.Taken,
        note,
        takenAt: new Date().toISOString()
      });
    }
  };

  const handleSkip = (reason: string) => {
    if (selectedDose) {
      logDose({
        doseId: selectedDose.id,
        status: DoseStatus.Refused,
        note: reason,
        takenAt: new Date().toISOString()
      });
    }
  };

  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b flex justify-between items-center bg-gray-50/50">
        <div className="flex items-center gap-4">
          <h2 className="font-bold text-gray-800 text-lg">کاردکس دارویی</h2>
          <div className="flex items-center gap-2 bg-white rounded-lg border px-2 py-1 shadow-sm">
            <button onClick={() => changeDate(-1)} className="p-1 hover:bg-gray-100 rounded-md">
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
            <div className="flex items-center gap-2 text-sm font-medium px-2">
              <CalendarIcon className="w-4 h-4 text-teal-600" />
              <DatePicker
                value={selectedDate}
                onChange={(date: any) => setSelectedDate(date ? date.toDate() : new Date())}
                calendar={persian}
                locale={persian_fa}
                format="dddd DD MMMM YYYY"
                inputClass="outline-none bg-transparent text-center w-40 cursor-pointer font-bold text-gray-700"
              />
            </div>
            <button onClick={() => changeDate(1)} className="p-1 hover:bg-gray-100 rounded-md">
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
        
        {/* Legend */}
        <div className="hidden md:flex gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-100 border border-blue-300"></span> برنامه‌ریزی شده</div>
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-green-100 border border-green-300"></span> مصرف شده</div>
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-100 border border-red-300"></span> فراموش/رد شده</div>
        </div>
      </div>

      {/* Timeline Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[1200px]">
          {/* Time Header */}
          <div className="flex border-b bg-gray-50 sticky top-0 z-30 shadow-sm">
            <div className="w-48 p-3 font-medium text-sm text-gray-500 shrink-0 border-l bg-gray-50 sticky right-0 z-40">دارو / دوز</div>
            <div className="flex-1 flex divide-x divide-x-reverse">
              {hours.map(h => (
                <div key={h} className="flex-1 text-center py-2 text-xs text-gray-400 font-mono border-gray-200">
                  {h}:00
                </div>
              ))}
            </div>
          </div>

          {/* Medication Rows */}
          {isLoading ? (
            <div className="p-12 flex justify-center text-teal-600">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : medications.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              هیچ دارویی برای این تاریخ ثبت نشده است.
            </div>
          ) : (
            <div className="divide-y">
               {medications.map((med: any) => (
                  <div key={med.id} className="flex border-b border-gray-100 hover:bg-gray-50 transition-colors min-h-[4rem]">
                     <div className="w-48 p-3 shrink-0 border-l bg-white flex flex-col justify-center sticky right-0 z-20 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.1)]">
                        <span className="font-bold text-gray-800 text-sm truncate" title={med.name}>{med.name}</span>
                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                          <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">{med.route}</span>
                          <span>{med.dosage}</span>
                        </div>
                     </div>
                     <div className="flex-1 flex relative">
                        {hours.map(h => {
                            const hourDoses = med.doses.filter((d: any) => {
                                const dt = parseISO(d.scheduledTime);
                                return dt.getHours() === h;
                            });
                            
                            return (
                                <div key={h} className="flex-1 border-r border-gray-100 relative flex items-center justify-center z-10 group/cell">
                                    {hourDoses.map((dose: any) => {
                                        let statusClass = "bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100";
                                        if (dose.status === DoseStatus.Taken) statusClass = "bg-green-50 border-green-200 text-green-600 hover:bg-green-100";
                                        else if (dose.status === DoseStatus.Missed) statusClass = "bg-red-50 border-red-200 text-red-600 hover:bg-red-100";
                                        else if (dose.status === DoseStatus.Refused) statusClass = "bg-orange-50 border-orange-200 text-orange-600 hover:bg-orange-100";
                                        
                                        return (
                                            <button
                                                key={dose.id}
                                                onClick={() => handleDoseClick(dose)}
                                                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-transform hover:scale-110 shadow-sm ${statusClass}`}
                                                title={`${format(parseISO(dose.scheduledTime), 'HH:mm')} - ${dose.status}`}
                                            >
                                                {format(parseISO(dose.scheduledTime), 'mm') === '00' ? '' : format(parseISO(dose.scheduledTime), 'mm')}
                                                {/* Indicator dot */}
                                                {dose.status === DoseStatus.Taken && <span className="absolute -top-1 -right-1 block w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            );
                        })}
                     </div>
                  </div>
               ))}
            </div>
          )}
        </div>
      </div>

      <AdministrationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        dose={selectedDose}
        onAdminister={handleAdminister}
        onSkip={handleSkip}
      />
    </div>
  );
};
