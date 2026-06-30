import { useEffect, useState } from 'react';
import { useCorrectDose, useKardex, useRecordDoseByNurse, useResetDoseLog, useReviewDose } from '../../hooks/useKardex';
import { AdministrationModal } from './AdministrationModal';
import { DoseStatus, MedicationAdministrationOutcome, MedicationDose } from '@/types/medication';
import { format, parseISO } from 'date-fns';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import DatePicker from 'react-multi-date-picker';
import persian from 'react-date-object/calendars/persian';
import persian_fa from 'react-date-object/locales/persian_fa';
import { StockStatusBadge } from '../shared/StockStatusBadge';
import { getMedicationDoseStatusPresentation } from '../../lib/administration-ui';
import { toast } from 'react-hot-toast';

interface KardexTimelineProps {
  patientId: number;
  highlightedDoseId?: number | null;
  mode?: 'staff' | 'admin';
}

export const KardexTimeline = ({ patientId, highlightedDoseId, mode = 'admin' }: KardexTimelineProps) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const dateString = format(selectedDate, 'yyyy-MM-dd');
  
  const { data: doses, isLoading } = useKardex(patientId, dateString);
  const { mutateAsync: recordDose } = useRecordDoseByNurse();
  const { mutateAsync: reviewDose } = useReviewDose();
  const { mutateAsync: correctDose } = useCorrectDose();
  const { mutateAsync: resetDoseLog } = useResetDoseLog();
  
  const [selectedDose, setSelectedDose] = useState<MedicationDose | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [highlightHandled, setHighlightHandled] = useState(false);

  useEffect(() => {
    if (!highlightedDoseId || highlightHandled) return;
    const target = doses?.find((d: any) => d.id === highlightedDoseId);
    if (!target) return;
    setSelectedDose(target);
    setIsModalOpen(true);
    setHighlightHandled(true);
  }, [doses, highlightHandled, highlightedDoseId]);

  // Group doses by medication
  const groupedDoses = doses?.reduce((acc: any, dose: any) => {
    const medId = dose.medicationId;
    if (!acc[medId]) {
      acc[medId] = {
        id: medId,
        name: dose.medicationName,
        dosage: dose.dosage,
        route: dose.route,
        totalQuantity: dose.currentQuantity,
        alertLimit: dose.alertLimit,
        stockStatus: dose.stockStatus,
        stockStatusLabel: dose.stockStatusLabel,
        doseQuantity: dose.doseQuantity,
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

  const handleRecord = async (payload: {
    outcome: MedicationAdministrationOutcome;
    actualAdministrationAt?: string;
    notes?: string;
    clinicalNotes?: string;
    missedReason?: string;
  }) => {
    if (!selectedDose) return;

    try {
      await recordDose({
        doseId: selectedDose.id,
        ...payload,
      });
      toast.success('وضعیت نوبت دارو ثبت شد');
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'ثبت وضعیت دارو انجام نشد.');
    }
  };

  const handleReview = async (approve: boolean, reason?: string, clinicalNotes?: string) => {
    if (!selectedDose) return;

    try {
      await reviewDose({
        doseId: selectedDose.id,
        approve,
        reason,
        clinicalNotes,
      });
      toast.success(approve ? 'ثبت بیمار تأیید شد' : 'ثبت بیمار رد شد');
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'بازبینی نوبت دارو انجام نشد.');
    }
  };

  const handleCorrect = async (payload: {
    outcome: MedicationAdministrationOutcome;
    actualAdministrationAt?: string;
    correctionReason: string;
    notes?: string;
    clinicalNotes?: string;
    missedReason?: string;
  }) => {
    if (!selectedDose) return;

    try {
      await correctDose({
        doseId: selectedDose.id,
        ...payload,
      });
      toast.success('وضعیت نوبت دارو اصلاح شد');
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'اصلاح وضعیت انجام نشد.');
    }
  };

  const handleReset = async () => {
    if (!selectedDose) return;
    try {
      await resetDoseLog(selectedDose.id);
      toast.success('ثبت نوبت بازگردانی شد');
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'بازگردانی ثبت انجام نشد.');
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
                        <div className="mt-2">
                          <StockStatusBadge medication={med} compact />
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
                                        const presentation = getMedicationDoseStatusPresentation(dose);
                                        let statusClass = "bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100";
                                        if (presentation.className.includes('emerald') || presentation.className.includes('teal')) statusClass = "bg-green-50 border-green-200 text-green-600 hover:bg-green-100";
                                        else if (presentation.className.includes('rose')) statusClass = "bg-red-50 border-red-200 text-red-600 hover:bg-red-100";
                                        else if (presentation.className.includes('orange')) statusClass = "bg-orange-50 border-orange-200 text-orange-600 hover:bg-orange-100";
                                        else if (presentation.className.includes('violet')) statusClass = "bg-violet-50 border-violet-200 text-violet-600 hover:bg-violet-100";
                                        
                                        return (
                                            <button
                                                key={dose.id}
                                                onClick={() => handleDoseClick(dose)}
                                                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-transform hover:scale-110 shadow-sm ${statusClass}`}
                                                title={`${format(parseISO(dose.scheduledTime), 'HH:mm')} - ${presentation.label}${dose.missedReason ? ` - ${dose.missedReason}` : ''}`}
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
        mode={mode}
        onRecord={handleRecord}
        onReview={handleReview}
        onCorrect={mode === 'admin' ? handleCorrect : undefined}
        onReset={handleReset}
      />
    </div>
  );
};
