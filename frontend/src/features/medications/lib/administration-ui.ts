import {
  DoseStatus,
  MedicationAdministrationOutcome,
  MedicationDose,
  MedicationTimingStatus,
  MedicationVerificationStatus,
  ShiftSlot,
} from '@/types/medication';

export function getMedicationDoseStatusPresentation(dose: MedicationDose) {
  if (dose.administrationOutcome === MedicationAdministrationOutcome.Missed) {
    return { label: 'مصرف‌نشده', className: 'bg-rose-100 text-rose-700' };
  }

  if (dose.administrationOutcome === MedicationAdministrationOutcome.SkippedByPatient) {
    return { label: 'عدم مصرف توسط بیمار', className: 'bg-orange-100 text-orange-700' };
  }

  if (dose.administrationOutcome === MedicationAdministrationOutcome.Taken) {
    if (dose.verificationStatus === MedicationVerificationStatus.CorrectedByAdmin) {
      return { label: 'اصلاح‌شده توسط ادمین', className: 'bg-violet-100 text-violet-700' };
    }

    if (dose.verificationStatus === MedicationVerificationStatus.ConfirmedByNurse) {
      return { label: 'تأییدشده توسط پرستار', className: 'bg-emerald-100 text-emerald-700' };
    }

    if (dose.timingStatus === MedicationTimingStatus.Late || dose.status === DoseStatus.Late) {
      return { label: 'مصرف با تأخیر', className: 'bg-amber-100 text-amber-800' };
    }

    return { label: 'مصرف شده', className: 'bg-teal-100 text-teal-700' };
  }

  if (dose.verificationStatus === MedicationVerificationStatus.RejectedByNurse) {
    return { label: 'رد شده و منتظر ثبت مجدد', className: 'bg-rose-100 text-rose-700' };
  }

  if (dose.status === DoseStatus.Due) {
    return { label: 'موعد رسیده', className: 'bg-amber-100 text-amber-700' };
  }

  return { label: 'در انتظار ثبت', className: 'bg-sky-100 text-sky-700' };
}

export function getShiftSlotLabel(shiftSlot: ShiftSlot) {
  switch (shiftSlot) {
    case ShiftSlot.Morning:
      return 'صبح';
    case ShiftSlot.Evening:
      return 'عصر';
    case ShiftSlot.Night:
      return 'شب';
    case ShiftSlot.Long:
      return 'لانگ';
    case ShiftSlot.TwentyFourHour:
      return '۲۴ ساعته';
    default:
      return 'نامشخص';
  }
}

export function isDoseCompleted(dose: MedicationDose) {
  return (
    dose.administrationOutcome === MedicationAdministrationOutcome.Taken ||
    dose.administrationOutcome === MedicationAdministrationOutcome.Missed ||
    dose.administrationOutcome === MedicationAdministrationOutcome.SkippedByPatient
  );
}

export function isDosePendingReview(dose: MedicationDose) {
  return (
    dose.verificationStatus === MedicationVerificationStatus.Pending &&
    (dose.administrationOutcome === MedicationAdministrationOutcome.Taken ||
      dose.administrationOutcome === MedicationAdministrationOutcome.SkippedByPatient ||
      dose.administrationOutcome === MedicationAdministrationOutcome.Missed)
  );
}
