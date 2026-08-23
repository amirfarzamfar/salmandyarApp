import { AssignmentDto, AssignmentStatus, AssignmentType, ShiftSlot } from '@/types/assignment';

export function getShiftSlotLabelFromSlot(slot?: ShiftSlot): string {
  if (slot === undefined || slot === null) return 'نامشخص';
  switch (slot) {
    case ShiftSlot.Morning: return 'صبح';
    case ShiftSlot.Evening: return 'عصر';
    case ShiftSlot.Night: return 'شب';
    case ShiftSlot.Long: return 'لانگ';
    case ShiftSlot.TwentyFourHour: return '۲۴ ساعته';
    default: return 'نامشخص';
  }
}

export type ComputedAssignmentStatus =
  | 'Upcoming'
  | 'Active'
  | 'ExpiredButNotClosed'
  | 'Completed'
  | 'Cancelled'
  | 'Suspended'
  | 'Unknown';

export interface AssignmentTimings {
  start: Date;
  end: Date | null;
  effectiveEnd: Date;
  source: 'explicit-end-date' | 'shift-slot-default' | 'assignment-type-default' | 'fallback-24h';
}

/**
 * ساعت استاندارد هر شیفت بر اساس惯例 رایج بیمارستانی (بر حسب ساعت)
 * Fallback محاسبه است — اگر کاربر endDate صریح تنظیم کرده باشد، همیشه آن اولویت دارد
 */
export const SHIFT_SLOT_DEFAULT_HOURS: Record<ShiftSlot, number> = {
  [ShiftSlot.None]: 8,
  [ShiftSlot.Morning]: 8,
  [ShiftSlot.Evening]: 8,
  [ShiftSlot.Night]: 8,
  [ShiftSlot.Long]: 16,
  [ShiftSlot.TwentyFourHour]: 24,
};

export const ASSIGNMENT_TYPE_DEFAULT_HOURS: Record<AssignmentType, number> = {
  [AssignmentType.Daily]: 24,
  [AssignmentType.Monthly]: 24 * 30,
  [AssignmentType.ShiftBased]: 8,
  [AssignmentType.TwentyFourHour]: 24,
};

export function getAssignmentTimings(a: Pick<AssignmentDto, 'startDate' | 'endDate' | 'shiftSlot' | 'assignmentType'>): AssignmentTimings {
  const start = new Date(a.startDate);
  if (a.endDate) {
    const end = new Date(a.endDate);
    return {
      start,
      end,
      effectiveEnd: end,
      source: 'explicit-end-date',
    };
  }

  let hours = 0;
  let source: AssignmentTimings['source'] = 'fallback-24h';

  if (a.shiftSlot !== undefined && a.shiftSlot !== null && a.shiftSlot !== ShiftSlot.None) {
    hours = SHIFT_SLOT_DEFAULT_HOURS[a.shiftSlot];
    source = 'shift-slot-default';
  } else if (a.assignmentType !== undefined && a.assignmentType !== null) {
    hours = ASSIGNMENT_TYPE_DEFAULT_HOURS[a.assignmentType];
    source = 'assignment-type-default';
  } else {
    hours = 24;
    source = 'fallback-24h';
  }

  const effectiveEnd = new Date(start.getTime() + hours * 60 * 60 * 1000);
  return { start, end: null, effectiveEnd, source };
}

export function computeAssignmentStatus(
  a: AssignmentDto,
  now: Date = new Date(),
): ComputedAssignmentStatus {
  switch (a.status) {
    case AssignmentStatus.Cancelled:
      return 'Cancelled';
    case AssignmentStatus.Completed:
      return 'Completed';
    case AssignmentStatus.Suspended:
      return 'Suspended';
    case AssignmentStatus.Active: {
      const { start, effectiveEnd } = getAssignmentTimings(a);
      if (now.getTime() < start.getTime()) {
        return 'Upcoming';
      }
      if (now.getTime() > effectiveEnd.getTime()) {
        return 'ExpiredButNotClosed';
      }
      return 'Active';
    }
    default:
      return 'Unknown';
  }
}

export interface AssignmentStatusPresentation {
  label: string;
  shortLabel: string;
  badgeClass: string;
  accentClass: string;
  accentSoftClass: string;
  sortPriority: number;
}

export function getAssignmentStatusPresentation(computed: ComputedAssignmentStatus): AssignmentStatusPresentation {
  switch (computed) {
    case 'Active':
      return {
        label: 'فعال',
        shortLabel: 'فعال',
        badgeClass: 'bg-teal-100 text-teal-800 border-teal-200',
        accentClass: 'text-teal-700',
        accentSoftClass: 'bg-teal-50 text-teal-900 border-teal-100 dark:bg-teal-900/20 dark:text-teal-100 dark:border-teal-800',
        sortPriority: 1,
      };
    case 'ExpiredButNotClosed':
      return {
        label: 'اتمام شیفت (بسته نشده)',
        shortLabel: 'اتمام شیفت',
        badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
        accentClass: 'text-amber-700',
        accentSoftClass: 'bg-amber-50 text-amber-900 border-amber-100 dark:bg-amber-900/20 dark:text-amber-100 dark:border-amber-800',
        sortPriority: 2,
      };
    case 'Upcoming':
      return {
        label: 'در انتظار شروع',
        shortLabel: 'آتی',
        badgeClass: 'bg-sky-100 text-sky-800 border-sky-200',
        accentClass: 'text-sky-700',
        accentSoftClass: 'bg-sky-50 text-sky-900 border-sky-100 dark:bg-sky-900/20 dark:text-sky-100 dark:border-sky-800',
        sortPriority: 0,
      };
    case 'Completed':
      return {
        label: 'پایان‌یافته',
        shortLabel: 'تمام',
        badgeClass: 'bg-gray-100 text-gray-700 border-gray-200',
        accentClass: 'text-gray-700',
        accentSoftClass: 'bg-gray-50 text-gray-800 border-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700',
        sortPriority: 3,
      };
    case 'Cancelled':
      return {
        label: 'لغو شده',
        shortLabel: 'لغو',
        badgeClass: 'bg-red-100 text-red-800 border-red-200',
        accentClass: 'text-red-700',
        accentSoftClass: 'bg-red-50 text-red-900 border-red-100 dark:bg-red-900/20 dark:text-red-100 dark:border-red-800',
        sortPriority: 4,
      };
    case 'Suspended':
      return {
        label: 'معلق',
        shortLabel: 'معلق',
        badgeClass: 'bg-purple-100 text-purple-800 border-purple-200',
        accentClass: 'text-purple-700',
        accentSoftClass: 'bg-purple-50 text-purple-900 border-purple-100 dark:bg-purple-900/20 dark:text-purple-100 dark:border-purple-800',
        sortPriority: 5,
      };
    case 'Unknown':
    default:
      return {
        label: 'نامشخص',
        shortLabel: '—',
        badgeClass: 'bg-gray-100 text-gray-600 border-gray-200',
        accentClass: 'text-gray-600',
        accentSoftClass: 'bg-gray-50 text-gray-700 border-gray-100',
        sortPriority: 99,
      };
  }
}

export function getAssignmentRemainingText(
  a: AssignmentDto,
  now: Date = new Date(),
): string {
  const { start, effectiveEnd } = getAssignmentTimings(a);
  const startMs = start.getTime();
  const endMs = effectiveEnd.getTime();
  const nowMs = now.getTime();

  if (nowMs < startMs) {
    const diffMs = startMs - nowMs;
    const diffMin = Math.round(diffMs / 60000);
    if (diffMin < 60) return `شروع پس از ${diffMin} دقیقه`;
    const diffHour = Math.round(diffMin / 60);
    if (diffHour < 48) return `شروع پس از ${diffHour} ساعت`;
    const diffDay = Math.round(diffHour / 24);
    return `شروع پس از ${diffDay} روز`;
  }

  if (nowMs > endMs) {
    const diffMs = nowMs - endMs;
    const diffMin = Math.round(diffMs / 60000);
    if (diffMin < 60) return `${diffMin} دقیقه پس از زمان پایان`;
    const diffHour = Math.round(diffMin / 60);
    if (diffHour < 48) return `${diffHour} ساعت پس از زمان پایان`;
    const diffDay = Math.round(diffHour / 24);
    return `${diffDay} روز پس از زمان پایان`;
  }

  const diffMs = endMs - nowMs;
  const diffMin = Math.round(diffMs / 60000);
  if (diffMin < 60) return `زمان باقی‌مانده: ${diffMin} دقیقه`;
  const diffHour = Math.round(diffMin / 60);
  if (diffHour < 48) return `زمان باقی‌مانده: ${diffHour} ساعت`;
  const diffDay = Math.round(diffHour / 24);
  return `زمان باقی‌مانده: ${diffDay} روز`;
}
