'use client';

import React, { useMemo, useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import {
  X,
  PlusCircle,
  User,
  Calendar,
  Clock,
  MapPin,
  UserCheck,
  Bell,
  ChevronDown,
  ChevronUp,
  Loader2,
  Repeat,
  Search,
  StickyNote,
  RefreshCw,
} from 'lucide-react';

import DatePicker from 'react-multi-date-picker';
import DateObjectImport from 'react-date-object';

import persianCalendar from 'react-date-object/calendars/persian';
import persianFaLocale from 'react-date-object/locales/persian_fa';

import gregorianCalendar from 'react-date-object/calendars/gregorian';
import gregorianEnLocale from 'react-date-object/locales/gregorian_en';

import { patientServicesService } from '@/services/patient-services.service';
import { patientService } from '@/services/patient.service';
import { serviceCatalogService } from '@/services/service-catalog.service';

import {
  ServicePriority,
  ServiceLocationType,
  ServiceRecurrenceType,
  ServiceNotificationRecipientType,
  type CreatePatientServiceDto,
} from '@/types/patient-service';

import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

const DateObject = ((DateObjectImport as any)?.default ?? DateObjectImport) as any;

/* =========================================================
   Date helpers
========================================================= */

function normalizeDigits(value: unknown): string {
  return String(value ?? '')
    .replace(/[۰-۹]/g, (digit) =>
      String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit))
    )
    .replace(/[٠-٩]/g, (digit) =>
      String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit))
    );
}

/**
 * Convert Gregorian ISO/date -> Jalali display string.
 *
 * IMPORTANT:
 * We use UTC components intentionally because the backend/API
 * stores service dates as ISO UTC values.
 */
function sdp_gregorianIsoToJalaliDisplay(
  isoOrDate: string,
  includeTimePart = false
): string {
  try {
    if (!isoOrDate) {
      return '';
    }

    const trimmed = String(isoOrDate).trim();

    if (!trimmed) {
      return '';
    }

    let gDate: Date;

    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      const [y, m, d] = trimmed
        .split('-')
        .map((n) => Number(n));

      gDate = new Date(
        Date.UTC(y, m - 1, d, 0, 0, 0)
      );
    } else {
      gDate = new Date(trimmed);

      if (Number.isNaN(gDate.getTime())) {
        return '';
      }
    }

    const gregorianDateObject = new DateObject({
      calendar: gregorianCalendar,
      locale: gregorianEnLocale,

      year: gDate.getUTCFullYear(),
      month: gDate.getUTCMonth() + 1,
      day: gDate.getUTCDate(),

      hour: includeTimePart
        ? gDate.getUTCHours()
        : 0,

      minute: includeTimePart
        ? gDate.getUTCMinutes()
        : 0,

      second: includeTimePart
        ? gDate.getUTCSeconds()
        : 0,
    });

    const persianDateObject =
      gregorianDateObject.convert(
        persianCalendar,
        persianFaLocale
      );

    const jy = Number(
      normalizeDigits(persianDateObject.year)
    );

    const jm = Number(
      normalizeDigits(
        persianDateObject.month?.number ??
          persianDateObject.month
      )
    );

    const jd = Number(
      normalizeDigits(persianDateObject.day)
    );

    if (
      !Number.isInteger(jy) ||
      !Number.isInteger(jm) ||
      !Number.isInteger(jd)
    ) {
      return '';
    }

    const dateString =
      `${jy}/${String(jm).padStart(2, '0')}/${String(jd).padStart(2, '0')}`;

    if (!includeTimePart) {
      return dateString;
    }

    const hh = Number(
      normalizeDigits(persianDateObject.hour)
    );

    const mm = Number(
      normalizeDigits(persianDateObject.minute)
    );

    return `${dateString} ${String(
      Number.isFinite(hh) ? hh : 0
    ).padStart(2, '0')}:${String(
      Number.isFinite(mm) ? mm : 0
    ).padStart(2, '0')}`;
  } catch (error) {
    console.error(
      '[ServiceDatePicker] sdp_gregorianIsoToJalaliDisplay error:',
      error
    );

    return '';
  }
}

/**
 * Convert Jalali display -> Gregorian ISO UTC.
 *
 * This helper is kept for compatibility / other usages,
 * but ServiceDatePicker no longer depends on it for picker changes.
 */
function sdp_jalaliDisplayToGregorianIsoUtc(
  jalaliDisplay: string,
  includeTimePart = false
): string | null {
  try {
    if (!jalaliDisplay) {
      return null;
    }

    const clean = String(jalaliDisplay).trim();

    if (!clean) {
      return null;
    }

    const dateTimeParts = clean.split(/\s+/);

    const datePart = dateTimeParts[0] || '';

    const timePart = includeTimePart
      ? dateTimeParts[1] || '00:00'
      : '00:00';

    const separator = datePart.includes('-')
      ? '-'
      : '/';

    const dateParts = datePart.split(separator);

    if (dateParts.length !== 3) {
      return null;
    }

    const jy = Number(
      normalizeDigits(dateParts[0])
    );

    const jm = Number(
      normalizeDigits(dateParts[1])
    );

    const jd = Number(
      normalizeDigits(dateParts[2])
    );

    if (
      !Number.isInteger(jy) ||
      !Number.isInteger(jm) ||
      !Number.isInteger(jd) ||
      jy < 1300 ||
      jm < 1 ||
      jm > 12 ||
      jd < 1 ||
      jd > 31
    ) {
      console.error(
        '[ServiceDatePicker] Invalid Jalali date:',
        {
          jalaliDisplay,
          jy,
          jm,
          jd,
        }
      );

      return null;
    }

    const [hhRaw, mmRaw] =
      timePart.split(':');

    const hh = Number(
      normalizeDigits(hhRaw || '0')
    );

    const mm = Number(
      normalizeDigits(mmRaw || '0')
    );

    const safeHour =
      Number.isInteger(hh) &&
      hh >= 0 &&
      hh <= 23
        ? hh
        : 0;

    const safeMinute =
      Number.isInteger(mm) &&
      mm >= 0 &&
      mm <= 59
        ? mm
        : 0;

    const persianDateObject =
      new DateObject({
        calendar: persianCalendar,
        locale: persianFaLocale,

        year: jy,
        month: jm,
        day: jd,

        hour: safeHour,
        minute: safeMinute,
        second: 0,
      });

    const gregorianDateObject =
      persianDateObject.convert(
        gregorianCalendar,
        gregorianEnLocale
      );

    const gy = Number(
      normalizeDigits(gregorianDateObject.year)
    );

    const gm = Number(
      normalizeDigits(
        gregorianDateObject.month?.number ??
          gregorianDateObject.month
      )
    );

    const gd = Number(
      normalizeDigits(gregorianDateObject.day)
    );

    const gh = includeTimePart
      ? Number(
          normalizeDigits(
            gregorianDateObject.hour
          )
        )
      : 0;

    const gmin = includeTimePart
      ? Number(
          normalizeDigits(
            gregorianDateObject.minute
          )
        )
      : 0;

    if (
      !Number.isInteger(gy) ||
      !Number.isInteger(gm) ||
      !Number.isInteger(gd)
    ) {
      return null;
    }

    const result = new Date(
      Date.UTC(
        gy,
        gm - 1,
        gd,
        Number.isFinite(gh) ? gh : 0,
        Number.isFinite(gmin) ? gmin : 0,
        0
      )
    );

    if (Number.isNaN(result.getTime())) {
      return null;
    }

    return result.toISOString();
  } catch (error) {
    console.error(
      '[ServiceDatePicker] sdp_jalaliDisplayToGregorianIsoUtc error:',
      error
    );

    return null;
  }
}

/**
 * Convert Gregorian ISO -> Persian DateObject for DatePicker.
 *
 * IMPORTANT:
 * We return the converted DateObject itself.
 *
 * We DO NOT create another Persian DateObject from
 * year/month/day because that was one of the possible
 * sources of the 1449/02/19 issue.
 */
function sdp_gregorianIsoToJalaliDateObject(
  isoOrDate: string
): any | null {
  try {
    if (!isoOrDate) {
      return null;
    }

    const trimmed = String(isoOrDate).trim();

    if (!trimmed) {
      return null;
    }

    let gDate: Date;

    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      const [y, m, d] = trimmed
        .split('-')
        .map((n) => Number(n));

      gDate = new Date(
        Date.UTC(y, m - 1, d, 0, 0, 0)
      );
    } else {
      gDate = new Date(trimmed);

      if (Number.isNaN(gDate.getTime())) {
        return null;
      }
    }

    const gregorianDateObject =
      new DateObject({
        calendar: gregorianCalendar,
        locale: gregorianEnLocale,

        year: gDate.getUTCFullYear(),
        month: gDate.getUTCMonth() + 1,
        day: gDate.getUTCDate(),

        hour: gDate.getUTCHours(),
        minute: gDate.getUTCMinutes(),
        second: gDate.getUTCSeconds(),
      });

    return gregorianDateObject.convert(
      persianCalendar,
      persianFaLocale
    );
  } catch (error) {
    console.error(
      '[ServiceDatePicker] sdp_gregorianIsoToJalaliDateObject error:',
      error
    );

    return null;
  }
}

/* =========================================================
   Service Date Picker
========================================================= */

type ServiceDatePickerProps = {
  value: string | null;
  onChange: (isoUtcDate: string | null) => void;
  placeholder?: string;
  label?: string;
  includeTime?: boolean;
  disabled?: boolean;
  className?: string;
  id?: string;
};

function ServiceDatePicker({
  value,
  onChange,
  placeholder = 'انتخاب تاریخ...',
  includeTime = false,
  disabled = false,
  className,
  id,
}: ServiceDatePickerProps) {
  const datePickerRef = useRef<any>(null);

  const pickerValue = useMemo(
    () =>
      sdp_gregorianIsoToJalaliDateObject(
        value ?? ''
      ),
    [value]
  );

  const handlePickerChange = (
    dateObjOrArray: any
  ) => {
    const dateObj = Array.isArray(
      dateObjOrArray
    )
      ? dateObjOrArray[0]
      : dateObjOrArray;

    if (!dateObj) {
      console.log(
        '[ServiceDatePicker] Date cleared'
      );

      onChange(null);
      return;
    }

    try {
      /*
       * =====================================================
       * IMPORTANT
       * =====================================================
       *
       * Do NOT use:
       *
       * dateObj.format('YYYY/MM/DD')
       *
       * Do NOT do:
       *
       * Persian DateObject
       * -> Persian String
       * -> new Persian DateObject
       * -> Gregorian
       *
       * We convert the ORIGINAL DateObject directly.
       */

      const persianYear = Number(
        normalizeDigits(dateObj.year)
      );

      const persianMonth = Number(
        normalizeDigits(
          dateObj.month?.number ??
            dateObj.month
        )
      );

      const persianDay = Number(
        normalizeDigits(dateObj.day)
      );

      console.log(
        '[ServiceDatePicker] ORIGINAL PICKER OBJECT:',
        dateObj
      );

      console.log(
        '[ServiceDatePicker] SELECTED PERSIAN:',
        {
          year: persianYear,
          month: persianMonth,
          day: persianDay,
        }
      );

      if (
        !Number.isInteger(persianYear) ||
        !Number.isInteger(persianMonth) ||
        !Number.isInteger(persianDay) ||
        persianYear < 1300 ||
        persianMonth < 1 ||
        persianMonth > 12 ||
        persianDay < 1 ||
        persianDay > 31
      ) {
        console.error(
          '[ServiceDatePicker] Invalid Persian picker date:',
          {
            dateObj,
            persianYear,
            persianMonth,
            persianDay,
          }
        );

        onChange(null);
        return;
      }

      /*
       * =====================================================
       * DIRECT PERSIAN -> GREGORIAN CONVERSION
       * =====================================================
       */

      const gregorianDateObject =
        dateObj.convert(
          gregorianCalendar,
          gregorianEnLocale
        );

      console.log(
        '[ServiceDatePicker] CONVERTED GREGORIAN OBJECT:',
        gregorianDateObject
      );

      const gregorianYear = Number(
        normalizeDigits(
          gregorianDateObject.year
        )
      );

      const gregorianMonth = Number(
        normalizeDigits(
          gregorianDateObject.month
            ?.number ??
            gregorianDateObject.month
        )
      );

      const gregorianDay = Number(
        normalizeDigits(
          gregorianDateObject.day
        )
      );

      /*
       * Date-only field must ALWAYS be midnight.
       *
       * We do not trust any hidden/current hour that
       * may exist inside the DatePicker DateObject.
       */

      const gregorianHour = includeTime
        ? Number(
            normalizeDigits(
              gregorianDateObject.hour
            )
          )
        : 0;

      const gregorianMinute = includeTime
        ? Number(
            normalizeDigits(
              gregorianDateObject.minute
            )
          )
        : 0;

      const gregorianSecond = includeTime
        ? Number(
            normalizeDigits(
              gregorianDateObject.second
            )
          )
        : 0;

      console.log(
        '[ServiceDatePicker] GREGORIAN COMPONENTS:',
        {
          year: gregorianYear,
          month: gregorianMonth,
          day: gregorianDay,
          hour: gregorianHour,
          minute: gregorianMinute,
          second: gregorianSecond,
        }
      );

      if (
        !Number.isInteger(
          gregorianYear
        ) ||
        !Number.isInteger(
          gregorianMonth
        ) ||
        !Number.isInteger(
          gregorianDay
        ) ||
        gregorianMonth < 1 ||
        gregorianMonth > 12 ||
        gregorianDay < 1 ||
        gregorianDay > 31
      ) {
        console.error(
          '[ServiceDatePicker] Invalid Gregorian conversion:',
          {
            gregorianDateObject,
            gregorianYear,
            gregorianMonth,
            gregorianDay,
          }
        );

        onChange(null);
        return;
      }

      const isoDate = new Date(
        Date.UTC(
          gregorianYear,
          gregorianMonth - 1,
          gregorianDay,
          Number.isFinite(
            gregorianHour
          )
            ? gregorianHour
            : 0,
          Number.isFinite(
            gregorianMinute
          )
            ? gregorianMinute
            : 0,
          Number.isFinite(
            gregorianSecond
          )
            ? gregorianSecond
            : 0,
          0
        )
      );

      if (
        Number.isNaN(
          isoDate.getTime()
        )
      ) {
        console.error(
          '[ServiceDatePicker] Failed to create ISO Date:',
          {
            gregorianYear,
            gregorianMonth,
            gregorianDay,
          }
        );

        onChange(null);
        return;
      }

      const iso = isoDate.toISOString();

      console.log(
        '[ServiceDatePicker] FINAL ISO VALUE:',
        iso
      );

      /*
       * FINAL VALUE SENT TO RHF
       */
      onChange(iso);
    } catch (error) {
      console.error(
        '[ServiceDatePicker] handlePickerChange error:',
        error
      );

      onChange(null);
    }
  };

  return (
    <div
      className={cn(
        'space-y-2 w-full',
        className
      )}
    >
      <DatePicker
        ref={datePickerRef}
        id={id}
        value={pickerValue}
        onChange={handlePickerChange}
        calendar={persianCalendar}
        locale={persianFaLocale}
        format="YYYY/MM/DD"
        portal
        disabled={disabled}
        inputClass="w-full !px-4 !py-2.5 !rounded-2xl !border !border-gray-200 !bg-white !text-sm !font-mono !text-slate-700 !tracking-wide !outline-none !transition-all focus:!border-teal-500 focus:!ring-4 focus:!ring-teal-500/10 hover:!border-teal-300 disabled:!opacity-60 disabled:!cursor-not-allowed disabled:!bg-gray-50"
        containerStyle={{
          width: '100%',
          display: 'block',
        }}
        placeholder={placeholder}
      />
    </div>
  );
}

/* =========================================================
   Types
========================================================= */

type FormData = {
  careRecipientId: number | null;
  serviceDefinitionId: number | null;
  customServiceName: string;
  performerId: string | null;

  scheduledDate: string | null;
  scheduledStartTime: string;

  durationMinutes: number;

  priority: ServicePriority;
  locationType: ServiceLocationType;

  description: string;
  locationAddress: string;

  createNotification: boolean;
  notificationTitle: string;
  notificationMessage: string;
  notificationRecipientType: ServiceNotificationRecipientType;

  scheduleEnabled: boolean;
  scheduleStartDate: string | null;
  scheduleStartTime: string;
  scheduleDurationMinutes: number;
  scheduleRecurrenceType: ServiceRecurrenceType;
  scheduleOccurrencesCount: number | null;
  scheduleEndDate: string | null;
};

interface CreateServiceDrawerProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
  editingServiceId?: number | null;
  initialData?: Partial<FormData> | null;
}

/* =========================================================
   Options
========================================================= */

const priorityOptions = [
  {
    value: ServicePriority.Normal,
    label: 'عادی',
  },
  {
    value: ServicePriority.Important,
    label: 'مهم',
  },
  {
    value: ServicePriority.Urgent,
    label: 'فوری',
  },
];

const locationOptions = [
  {
    value: ServiceLocationType.PatientHome,
    label: 'منزل بیمار',
  },
  {
    value: ServiceLocationType.MedicalCenter,
    label: 'مرکز درمانی',
  },
  {
    value: ServiceLocationType.Other,
    label: 'سایر',
  },
];

const durationOptions = [
  30,
  60,
  90,
  120,
];

const recurrenceOptions = [
  {
    value: ServiceRecurrenceType.None,
    label: 'بدون تکرار',
  },
  {
    value: ServiceRecurrenceType.Daily,
    label: 'روزانه',
  },
  {
    value: ServiceRecurrenceType.Weekly,
    label: 'هفتگی',
  },
  {
    value: ServiceRecurrenceType.Monthly,
    label: 'ماهانه',
  },
];

const recipientOptions = [
  {
    value:
      ServiceNotificationRecipientType.Patient,
    label: 'بیمار',
  },
  {
    value:
      ServiceNotificationRecipientType.PatientFamily,
    label: 'خانواده بیمار',
  },
  {
    value:
      ServiceNotificationRecipientType.Nurse,
    label: 'پرستار',
  },
  {
    value:
      ServiceNotificationRecipientType.Caregiver,
    label: 'مراقب',
  },
  {
    value:
      ServiceNotificationRecipientType.Supervisor,
    label: 'سرپرست',
  },
  {
    value:
      ServiceNotificationRecipientType.All,
    label: 'همه',
  },
];

/* =========================================================
   Field
========================================================= */

interface FieldProps {
  label: string;
  icon?: React.ComponentType<{
    className?: string;
  }>;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  className?: string;
}

function Field({
  label,
  icon: Icon,
  required,
  error,
  children,
  className,
}: FieldProps) {
  return (
    <div
      className={cn(
        'space-y-1.5',
        className
      )}
    >
      <label className="text-xs font-bold text-slate-600 flex items-center gap-1">
        {Icon && (
          <Icon className="h-3.5 w-3.5 text-teal-500" />
        )}

        {label}

        {required && (
          <span className="text-red-500">
            *
          </span>
        )}
      </label>

      {children}

      {error && (
        <p className="text-xs text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}

/* =========================================================
   Select Field
========================================================= */

function SelectField<
  T extends string | number
>({
  value,
  onChange,
  options,
  placeholder,
  searchable = false,
  disabled = false,
}: {
  value: T | null;
  onChange: (v: T | null) => void;
  options: {
    value: T;
    label: string;
    subtext?: string;
  }[];
  placeholder: string;
  searchable?: boolean;
  disabled?: boolean;
}) {
  const [open, setOpen] =
    useState(false);

  const [search, setSearch] =
    useState('');

  const filtered = searchable
    ? options.filter(
        (o) =>
          o.label
            .toLowerCase()
            .includes(
              search.toLowerCase()
            ) ||
          (o.subtext || '')
            .toLowerCase()
            .includes(
              search.toLowerCase()
            )
      )
    : options;

  const selected = options.find(
    (o) => o.value === value
  );

  return (
    <div className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() =>
          !disabled &&
          setOpen(!open)
        }
        className={cn(
          'w-full flex items-center justify-between px-4 py-2.5 rounded-2xl border border-gray-200 bg-white focus:ring-4 focus:ring-teal-500/10 transition-all text-sm text-right',
          !disabled &&
            'hover:border-teal-400 focus:border-teal-500',
          disabled &&
            'opacity-60 cursor-not-allowed bg-gray-50'
        )}
      >
        <span
          className={
            selected
              ? 'text-gray-800 font-medium'
              : 'text-gray-400'
          }
        >
          {selected
            ? selected.label
            : placeholder}
        </span>

        <ChevronDown
          className={cn(
            'w-4 h-4 text-gray-400 transition-transform',
            open && 'rotate-180'
          )}
        />
      </button>

      {open && !disabled && (
        <div className="absolute z-30 mt-2 w-full rounded-2xl border border-gray-200 bg-white shadow-lg max-h-64 overflow-hidden">
          {searchable && (
            <div className="p-2 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

                <input
                  type="text"
                  value={search}
                  onChange={(e) =>
                    setSearch(
                      e.target.value
                    )
                  }
                  placeholder="جستجو..."
                  className="w-full pr-9 pl-3 py-2 rounded-xl bg-gray-50 border border-gray-100 text-sm focus:outline-none focus:border-teal-400"
                />
              </div>
            </div>
          )}

          <div className="overflow-y-auto max-h-48">
            {filtered.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-400">
                یافت نشد
              </div>
            ) : (
              filtered.map((o) => (
                <button
                  key={String(o.value)}
                  type="button"
                  onClick={() => {
                    onChange(
                      o.value
                    );

                    setOpen(false);
                    setSearch('');
                  }}
                  className={cn(
                    'w-full px-4 py-2.5 text-right text-sm hover:bg-teal-50 border-b border-gray-50 last:border-0 transition-colors',
                    selected?.value ===
                      o.value &&
                      'bg-teal-50 text-teal-700 font-semibold'
                  )}
                >
                  <div>
                    {o.label}
                  </div>

                  {o.subtext && (
                    <div className="text-xs text-gray-400 mt-0.5">
                      {o.subtext}
                    </div>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   Main Component
========================================================= */

export default function CreateServiceDrawer({
  open,
  onClose,
  onCreated,
  editingServiceId,
  initialData,
}: CreateServiceDrawerProps) {
  const queryClient =
    useQueryClient();

  const [scheduleOpen, setScheduleOpen] =
    useState(false);

  const isEditMode =
    Boolean(editingServiceId);

  const defaultFormValues: FormData = {
    careRecipientId: null,
    serviceDefinitionId: null,

    customServiceName: '',

    performerId: null,

    scheduledDate: null,
    scheduledStartTime: '09:00',

    durationMinutes: 60,

    priority:
      ServicePriority.Normal,

    locationType:
      ServiceLocationType.PatientHome,

    description: '',
    locationAddress: '',

    createNotification: false,

    notificationTitle: '',
    notificationMessage: '',

    notificationRecipientType:
      ServiceNotificationRecipientType.Patient,

    scheduleEnabled: false,

    scheduleStartDate: null,
    scheduleStartTime: '09:00',

    scheduleDurationMinutes: 60,

    scheduleRecurrenceType:
      ServiceRecurrenceType.None,

    scheduleOccurrencesCount: null,

    scheduleEndDate: null,
  };

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      ...defaultFormValues,
      ...(initialData ?? {}),
    },
  });

  React.useEffect(() => {
    if (!open) {
      return;
    }

    reset({
      ...defaultFormValues,
      ...(initialData ?? {}),
    } as FormData);
  }, [
    open,
    initialData,
    reset,
  ]);

  const watchCreateNotification =
    watch(
      'createNotification'
    );

  const watchScheduleRecurrence =
    watch(
      'scheduleRecurrenceType'
    );

  const watchScheduleEnabled =
    watch('scheduleEnabled');

  const watchedScheduledDate =
    watch('scheduledDate');

  const watchedScheduleStartDate =
    watch('scheduleStartDate');

  const { data: patients = [] } =
    useQuery({
      queryKey: ['patients-all'],

      queryFn: () =>
        patientService.getAll(),

      enabled: open,
    });

  const { data: serviceDefs = [] } =
    useQuery({
      queryKey: [
        'service-definitions-all',
      ],

      queryFn: () =>
        serviceCatalogService.getAll(),

      enabled: open,
    });

  const patientOptions =
    patients.map((p) => ({
      value: p.id,

      label: `${p.firstName} ${p.lastName}`,

      subtext: `کد: ${p.id} | سن: ${p.age}`,
    }));

  const serviceOptions =
    serviceDefs.map((s: any) => ({
      value: s.id,

      label:
        s.title || s.name,

      subtext: s.code
        ? `کد: ${s.code}`
        : undefined,
    }));

  /* =========================================================
     Helpers
  ========================================================= */

  const handleClose = () => {
    reset(defaultFormValues);

    setScheduleOpen(false);

    onClose();
  };

  const toTimeSpanFormat = (
    t:
      | string
      | null
      | undefined
  ): string | null | undefined => {
    if (t == null) {
      return t;
    }

    const clean =
      String(t).trim();

    if (!clean) {
      return t;
    }

    const parts =
      clean.split(':');

    if (parts.length === 2) {
      return `${clean}:00`;
    }

    return clean;
  };

  const extractApiError = (
    err: any
  ): string => {
    if (!err) {
      return 'خطای نامشخص در سرور';
    }

    const respData =
      err?.response?.data;

    if (typeof respData === 'string') {
      return respData;
    }

    if (respData) {
      if (
        typeof respData.error ===
        'string'
      ) {
        return respData.error;
      }

      if (
        typeof respData.message ===
        'string'
      ) {
        return respData.message;
      }

      if (
        Array.isArray(
          respData.errors
        )
      ) {
        const first =
          Object.values(
            respData.errors
          )[0] as any;

        if (
          Array.isArray(first) &&
          first.length
        ) {
          return first[0];
        }

        if (
          typeof first === 'string'
        ) {
          return first;
        }
      }

      if (
        typeof respData ===
        'object'
      ) {
        for (const val of Object.values(
          respData
        )) {
          if (
            Array.isArray(val) &&
            typeof val[0] ===
              'string'
          ) {
            return val[0];
          }

          if (
            typeof val === 'string'
          ) {
            return val;
          }
        }
      }
    }

    if (
      typeof err?.message ===
      'string'
    ) {
      return err.message;
    }

    return 'خطا در ثبت خدمت';
  };

  /* =========================================================
     Mutations
  ========================================================= */

  const invalidateServiceQueries =
    async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: [
            'patient-services-paged',
          ],
        }),

        queryClient.invalidateQueries({
          queryKey: [
            'patient-services-statistics',
          ],
        }),

        queryClient.invalidateQueries({
          queryKey: [
            'patient-services-calendar',
          ],
        }),

        queryClient.invalidateQueries({
          queryKey: [
            'patientService',
          ],
        }),
      ]);
    };

  const createMutation =
    useMutation({
      mutationFn: (
        dto: CreatePatientServiceDto
      ) =>
        patientServicesService.create(
          dto
        ),

      onSuccess: async () => {
        toast.success(
          'خدمت با موفقیت ایجاد شد'
        );

        await invalidateServiceQueries();

        onCreated();

        handleClose();
      },

      onError: (err: any) => {
        toast.error(
          extractApiError(err)
        );
      },
    });

  const updateMutation =
    useMutation({
      mutationFn: (payload: {
        id: number;
        dto: any;
      }) =>
        patientServicesService.update(
          payload.id,
          payload.dto
        ),

      onSuccess: async () => {
        toast.success(
          'خدمت با موفقیت ویرایش شد'
        );

        await invalidateServiceQueries();

        onCreated();

        handleClose();
      },

      onError: (err: any) => {
        toast.error(
          extractApiError(err)
        );
      },
    });

  const scheduleMutation =
    useMutation({
      mutationFn: (dto: any) =>
        patientServicesService.createSchedule(
          dto
        ),

      onSuccess: async () => {
        toast.success(
          'برنامه‌ریزی خدمت با موفقیت ایجاد شد'
        );

        await invalidateServiceQueries();

        onCreated();

        handleClose();
      },

      onError: (err: any) => {
        toast.error(
          extractApiError(err)
        );
      },
    });

  const isLoading =
    createMutation.isPending ||
    scheduleMutation.isPending ||
    updateMutation.isPending;

  /* =========================================================
     Manual Validation
  ========================================================= */

  const runManualValidation = (
    data: FormData
  ): boolean => {
    let ok = true;

    /*
     * =====================================================
     * Patient
     * =====================================================
     */

    if (
      !isEditMode &&
      (!data.careRecipientId ||
        data.careRecipientId <= 0)
    ) {
      setError(
        'careRecipientId',
        {
          type: 'required',
          message:
            'انتخاب بیمار الزامی است',
        }
      );

      ok = false;
    } else {
      clearErrors(
        'careRecipientId'
      );
    }

    /*
     * =====================================================
     * Service Definition
     * =====================================================
     */

    if (
      !data.serviceDefinitionId ||
      data.serviceDefinitionId <= 0
    ) {
      setError(
        'serviceDefinitionId',
        {
          type: 'required',
          message:
            'انتخاب نوع خدمت الزامی است',
        }
      );

      ok = false;
    } else {
      clearErrors(
        'serviceDefinitionId'
      );
    }

    /*
     * =====================================================
     * DATE VALIDATION
     *
     * Normal service:
     *     scheduledDate required
     *
     * Recurring schedule:
     *     scheduleStartDate required
     *
     * This fixes the previous bug where scheduledDate
     * was ALWAYS required even in schedule mode.
     * =====================================================
     */

    if (data.scheduleEnabled) {
      clearErrors('scheduledDate');

      if (
        !data.scheduleStartDate ||
        typeof data.scheduleStartDate !==
          'string' ||
        !data.scheduleStartDate.trim()
      ) {
        setError(
          'scheduleStartDate',
          {
            type: 'required',
            message:
              'تاریخ شروع برنامه‌ریزی الزامی است',
          }
        );

        ok = false;
      } else {
        const parsedScheduleDate =
          new Date(
            data.scheduleStartDate
          );

        if (
          Number.isNaN(
            parsedScheduleDate.getTime()
          )
        ) {
          setError(
            'scheduleStartDate',
            {
              type: 'invalid',
              message:
                'تاریخ شروع برنامه‌ریزی معتبر نیست',
            }
          );

          ok = false;
        } else {
          clearErrors(
            'scheduleStartDate'
          );
        }
      }
    } else {
      clearErrors(
        'scheduleStartDate'
      );

      if (
        !data.scheduledDate ||
        typeof data.scheduledDate !==
          'string' ||
        !data.scheduledDate.trim()
      ) {
        console.error(
          '[CreateServiceDrawer] scheduledDate is EMPTY:',
          data.scheduledDate
        );

        setError(
          'scheduledDate',
          {
            type: 'required',
            message:
              'تاریخ خدمت الزامی است',
          }
        );

        ok = false;
      } else {
        const parsedDate =
          new Date(
            data.scheduledDate
          );

        if (
          Number.isNaN(
            parsedDate.getTime()
          )
        ) {
          console.error(
            '[CreateServiceDrawer] Invalid scheduledDate:',
            data.scheduledDate
          );

          setError(
            'scheduledDate',
            {
              type: 'invalid',
              message:
                'تاریخ خدمت معتبر نیست',
            }
          );

          ok = false;
        } else {
          clearErrors(
            'scheduledDate'
          );
        }
      }
    }

    /*
     * =====================================================
     * NORMAL SERVICE START TIME
     * =====================================================
     *
     * Not required for recurring schedule because
     * scheduleStartTime is used there.
     */

    if (!data.scheduleEnabled) {
      if (
        !data.scheduledStartTime ||
        data.scheduledStartTime.trim() ===
          ''
      ) {
        setError(
          'scheduledStartTime',
          {
            type: 'required',
            message:
              'ساعت شروع خدمت الزامی است',
          }
        );

        ok = false;
      } else {
        clearErrors(
          'scheduledStartTime'
        );
      }
    } else {
      clearErrors(
        'scheduledStartTime'
      );
    }

    /*
     * =====================================================
     * NORMAL SERVICE DURATION
     * =====================================================
     */

    if (!data.scheduleEnabled) {
      if (
        !data.durationMinutes ||
        data.durationMinutes <= 0
      ) {
        setError(
          'durationMinutes',
          {
            type: 'required',
            message:
              'مدت زمان خدمت الزامی است',
          }
        );

        ok = false;
      } else {
        clearErrors(
          'durationMinutes'
        );
      }
    } else {
      clearErrors(
        'durationMinutes'
      );
    }

    /*
     * =====================================================
     * SCHEDULE TIME / DURATION
     * =====================================================
     */

    if (data.scheduleEnabled) {
      if (
        !data.scheduleStartTime ||
        data.scheduleStartTime.trim() ===
          ''
      ) {
        setError(
          'scheduleStartTime',
          {
            type: 'required',
            message:
              'ساعت شروع برنامه‌ریزی الزامی است',
          }
        );

        ok = false;
      } else {
        clearErrors(
          'scheduleStartTime'
        );
      }

      if (
        !data.scheduleDurationMinutes ||
        data.scheduleDurationMinutes <= 0
      ) {
        setError(
          'scheduleDurationMinutes',
          {
            type: 'required',
            message:
              'مدت زمان برنامه‌ریزی الزامی است',
          }
        );

        ok = false;
      } else {
        clearErrors(
          'scheduleDurationMinutes'
        );
      }

      if (
        data.scheduleRecurrenceType ===
        ServiceRecurrenceType.None
      ) {
        setError(
          'scheduleRecurrenceType',
          {
            type: 'required',
            message:
              'الگوی تکرار را انتخاب کنید',
          }
        );

        ok = false;
      } else {
        clearErrors(
          'scheduleRecurrenceType'
        );
      }
    } else {
      clearErrors(
        'scheduleStartTime'
      );

      clearErrors(
        'scheduleDurationMinutes'
      );

      clearErrors(
        'scheduleRecurrenceType'
      );
    }

    /*
     * =====================================================
     * DESCRIPTION
     * =====================================================
     */

    if (
      !data.description ||
      data.description.trim() === ''
    ) {
      setError(
        'description',
        {
          type: 'required',
          message:
            'توضیحات خدمت الزامی است',
        }
      );

      ok = false;
    } else {
      clearErrors(
        'description'
      );
    }

    /*
     * =====================================================
     * NOTIFICATION
     * =====================================================
     */

    if (data.createNotification) {
      if (
        !data.notificationTitle ||
        !data.notificationTitle.trim()
      ) {
        setError(
          'notificationTitle',
          {
            type: 'required',
            message:
              'عنوان اعلان الزامی است',
          }
        );

        ok = false;
      } else {
        clearErrors(
          'notificationTitle'
        );
      }

      if (
        !data.notificationMessage ||
        !data.notificationMessage.trim()
      ) {
        setError(
          'notificationMessage',
          {
            type: 'required',
            message:
              'متن اعلان الزامی است',
          }
        );

        ok = false;
      } else {
        clearErrors(
          'notificationMessage'
        );
      }

      if (
        data.notificationRecipientType ==
        null
      ) {
        setError(
          'notificationRecipientType',
          {
            type: 'required',
            message:
              'گیرنده اعلان را انتخاب کنید',
          }
        );

        ok = false;
      } else {
        clearErrors(
          'notificationRecipientType'
        );
      }
    } else {
      clearErrors(
        'notificationTitle'
      );

      clearErrors(
        'notificationMessage'
      );

      clearErrors(
        'notificationRecipientType'
      );
    }

    return ok;
  };

  /* =========================================================
     Submit
  ========================================================= */

  const onSubmit = async (
    data: FormData
  ) => {
    console.group(
      '[CreateServiceDrawer] SUBMIT'
    );

    console.log(
      'FORM DATA:',
      data
    );

    console.log(
      'scheduledDate:',
      data.scheduledDate
    );

    console.log(
      'scheduleEnabled:',
      data.scheduleEnabled
    );

    console.log(
      'scheduleStartDate:',
      data.scheduleStartDate
    );

    console.groupEnd();

    const manualValid =
      runManualValidation(data);

    if (!manualValid) {
      /*
       * IMPORTANT:
       *
       * Previously this was:
       *
       * console.error(
       *   'Validation failed:',
       *   data
       * )
       *
       * which produced {} in some situations
       * and did NOT show the actual RHF errors.
       */

      console.error(
        '[CreateServiceDrawer] VALIDATION FAILED',
        {
          formData: data,
          errors: {
            careRecipientId:
              errors.careRecipientId
                ?.message,

            serviceDefinitionId:
              errors
                .serviceDefinitionId
                ?.message,

            scheduledDate:
              errors.scheduledDate
                ?.message,

            scheduledStartDate:
              errors
                .scheduleStartDate
                ?.message,

            scheduledStartTime:
              errors
                .scheduledStartTime
                ?.message,

            scheduleStartTime:
              errors
                .scheduleStartTime
                ?.message,

            durationMinutes:
              errors
                .durationMinutes
                ?.message,

            scheduleDurationMinutes:
              errors
                .scheduleDurationMinutes
                ?.message,

            scheduleRecurrenceType:
              errors
                .scheduleRecurrenceType
                ?.message,

            description:
              errors.description
                ?.message,

            notificationTitle:
              errors
                .notificationTitle
                ?.message,

            notificationMessage:
              errors
                .notificationMessage
                ?.message,

            notificationRecipientType:
              errors
                .notificationRecipientType
                ?.message,
          },
        }
      );

      toast.error(
        'لطفاً فیلدهای قرمزرنگ را بررسی و تکمیل کنید.'
      );

      return;
    }

    /* =====================================================
       EDIT
    ===================================================== */

    if (
      isEditMode &&
      editingServiceId
    ) {
      const dto = {
        id: editingServiceId,

        dto: {
          serviceDefinitionId:
            data.serviceDefinitionId!,

          customServiceName:
            data.customServiceName ||
            null,

          scheduledDate:
            data.scheduledDate!,

          scheduledStartTime:
            toTimeSpanFormat(
              data.scheduledStartTime
            ),

          scheduledEndTime: null,

          durationMinutes:
            data.durationMinutes,

          priority:
            data.priority,

          locationType:
            data.locationType,

          description:
            data.description,

          notes: '',

          locationAddress:
            data.locationAddress ||
            null,
        },
      };

      console.log(
        '[CreateServiceDrawer] UPDATE DTO:',
        dto
      );

      updateMutation.mutate(dto);

      return;
    }

    /* =====================================================
       RECURRING SCHEDULE
    ===================================================== */

    if (data.scheduleEnabled) {
      const scheduleStartDate =
        data.scheduleStartDate;

      /*
       * Validation already guarantees this,
       * but keep a defensive guard.
       */

      if (!scheduleStartDate) {
        setError(
          'scheduleStartDate',
          {
            type: 'required',
            message:
              'تاریخ شروع برنامه‌ریزی الزامی است',
          }
        );

        toast.error(
          'تاریخ شروع برنامه‌ریزی را انتخاب کنید.'
        );

        return;
      }

      const dto: any = {
        careRecipientId:
          data.careRecipientId!,

        serviceDefinitionId:
          data.serviceDefinitionId!,

        customServiceName:
          data.customServiceName ||
          null,

        startDate:
          scheduleStartDate,

        startTime:
          toTimeSpanFormat(
            data.scheduleStartTime
          ) ?? '09:00:00',

        durationMinutes:
          data.scheduleDurationMinutes ??
          60,

        recurrenceType:
          data.scheduleRecurrenceType,

        occurrencesCount:
          data.scheduleOccurrencesCount,

        endDate:
          data.scheduleEndDate,

        priority:
          data.priority,

        locationType:
          data.locationType,

        locationAddress:
          data.locationAddress ||
          null,

        description:
          data.description,

        createNotifications:
          data.createNotification,
      };

      console.log(
        '[CreateServiceDrawer] SCHEDULE DTO:',
        dto
      );

      scheduleMutation.mutate(dto);

      return;
    }

    /* =====================================================
       NORMAL SERVICE
    ===================================================== */

    const dto: CreatePatientServiceDto = {
      careRecipientId:
        data.careRecipientId!,

      serviceDefinitionId:
        data.serviceDefinitionId!,

      customServiceName:
        data.customServiceName ||
        null,

      performerId:
        data.performerId,

      scheduledDate:
        data.scheduledDate!,

      scheduledStartTime:
        toTimeSpanFormat(
          data.scheduledStartTime
        ),

      scheduledEndTime: null,

      durationMinutes:
        data.durationMinutes,

      priority:
        data.priority,

      locationType:
        data.locationType,

      description:
        data.description,

      notes: '',

      locationAddress:
        data.locationAddress ||
        null,

      createNotification:
        data.createNotification,

      notificationTitle:
        data.createNotification
          ? data.notificationTitle
          : undefined,

      notificationMessage:
        data.createNotification
          ? data.notificationMessage
          : undefined,

      notificationRecipientType:
        data.createNotification
          ? data.notificationRecipientType
          : undefined,
    };

    console.log(
      '[CreateServiceDrawer] CREATE DTO:',
      dto
    );

    createMutation.mutate(dto);
  };

  /* =========================================================
     Render
  ========================================================= */

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[80] flex flex-col md:flex-row md:items-center md:justify-center p-0 md:p-4 overflow-hidden">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      <div
        className="relative z-10 w-full max-w-5xl md:max-h-[92vh] h-full md:h-auto md:rounded-2xl md:border md:border-slate-200 bg-white shadow-2xl md:mx-auto flex flex-col md:animate-in md:fade-in md:zoom-in-95 md:duration-200 animate-in slide-in-from-right md:slide-in-from-right-0 duration-300"
        dir="rtl"
      >
        {/* =================================================
            Header
        ================================================= */}

        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-l from-teal-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center">
              {isEditMode ? (
                <RefreshCw className="w-5 h-5" />
              ) : (
                <PlusCircle className="w-5 h-5" />
              )}
            </div>

            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {isEditMode
                  ? 'ویرایش خدمت'
                  : 'ایجاد خدمت جدید'}
              </h2>

              <p className="text-xs text-gray-500 mt-0.5">
                {isEditMode
                  ? 'اطلاعات خدمت را ویرایش کنید'
                  : 'اطلاعات خدمت را تکمیل کنید'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* =================================================
            FORM
        ================================================= */}

        <form
          id="create-service-form"
          onSubmit={handleSubmit(
            onSubmit
          )}
          className="flex-1 overflow-y-auto p-5 space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Patient */}

            <Field
              label="بیمار"
              icon={User}
              required={!isEditMode}
              className="md:col-span-2"
              error={
                errors
                  .careRecipientId
                  ?.message
              }
            >
              <SelectField
                value={watch(
                  'careRecipientId'
                )}
                onChange={(v) => {
                  setValue(
                    'careRecipientId',
                    v as any,
                    {
                      shouldValidate: true,
                      shouldDirty: true,
                      shouldTouch: true,
                    }
                  );

                  if (v) {
                    clearErrors(
                      'careRecipientId'
                    );
                  }
                }}
                options={
                  patientOptions as any
                }
                placeholder={
                  isEditMode
                    ? 'غیرقابل ویرایش — بیمار ثابت است'
                    : 'جستجو و انتخاب بیمار...'
                }
                searchable
                disabled={isEditMode}
              />
            </Field>

            {/* Service Definition */}

            <Field
              label="نوع خدمت"
              icon={Calendar}
              required
              className="md:col-span-2"
              error={
                errors
                  .serviceDefinitionId
                  ?.message
              }
            >
              <SelectField
                value={watch(
                  'serviceDefinitionId'
                )}
                onChange={(v) => {
                  setValue(
                    'serviceDefinitionId',
                    v as any,
                    {
                      shouldValidate: true,
                      shouldDirty: true,
                      shouldTouch: true,
                    }
                  );

                  if (v) {
                    clearErrors(
                      'serviceDefinitionId'
                    );
                  }
                }}
                options={
                  serviceOptions as any
                }
                placeholder="انتخاب نوع خدمت..."
                searchable
              />
            </Field>

            {/* Custom Service Name */}

            <Field
              label="نام سفارشی خدمت"
              icon={StickyNote}
              className="md:col-span-2"
            >
              <input
                type="text"
                {...register(
                  'customServiceName'
                )}
                placeholder="اختیاری - نام دلخواه برای خدمت"
                className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all text-sm outline-none"
              />
            </Field>

            {/* Service Date */}

            <Field
              label="تاریخ خدمت"
              icon={Calendar}
              required={!watchScheduleEnabled}
              error={
                errors.scheduledDate
                  ?.message
              }
            >
              <ServiceDatePicker
                value={
                  watchedScheduledDate
                }
                onChange={(v) => {
                  console.log(
                    '[CreateServiceDrawer] scheduledDate changed:',
                    v
                  );

                  setValue(
                    'scheduledDate',
                    v,
                    {
                      shouldValidate: true,
                      shouldDirty: true,
                      shouldTouch: true,
                    }
                  );

                  if (v) {
                    clearErrors(
                      'scheduledDate'
                    );
                  }
                }}
                placeholder="۱۴۰۳/۰۱/۰۱"
                includeTime={false}
              />
            </Field>

            {/* Start Time */}

            <Field
              label="ساعت شروع"
              icon={Clock}
              required={!watchScheduleEnabled}
              error={
                errors
                  .scheduledStartTime
                  ?.message
              }
            >
              <input
                type="time"
                {...register(
                  'scheduledStartTime'
                )}
                className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all text-sm outline-none"
              />
            </Field>

            {/* Duration */}

            <Field
              label="مدت زمان (دقیقه)"
              icon={Clock}
              required={!watchScheduleEnabled}
              error={
                errors
                  .durationMinutes
                  ?.message
              }
            >
              <div className="grid grid-cols-4 gap-2">
                {durationOptions.map(
                  (d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => {
                        setValue(
                          'durationMinutes',
                          d,
                          {
                            shouldValidate: true,
                            shouldDirty: true,
                            shouldTouch: true,
                          }
                        );

                        clearErrors(
                          'durationMinutes'
                        );
                      }}
                      className={cn(
                        'py-2 rounded-xl border text-sm font-medium transition-all',
                        watch(
                          'durationMinutes'
                        ) === d
                          ? 'border-teal-500 bg-teal-50 text-teal-700'
                          : 'border-gray-200 hover:border-teal-300 text-gray-600'
                      )}
                    >
                      {d}
                    </button>
                  )
                )}
              </div>
            </Field>

            {/* Priority */}

            <Field
              label="اولویت"
              required
            >
              <div className="grid grid-cols-3 gap-2">
                {priorityOptions.map(
                  (p) => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() =>
                        setValue(
                          'priority',
                          p.value,
                          {
                            shouldDirty: true,
                            shouldTouch: true,
                          }
                        )
                      }
                      className={cn(
                        'py-2 rounded-xl border text-sm font-medium transition-all',
                        watch(
                          'priority'
                        ) === p.value
                          ? p.value ===
                            ServicePriority.Urgent
                            ? 'border-red-500 bg-red-50 text-red-700'
                            : p.value ===
                              ServicePriority.Important
                            ? 'border-orange-500 bg-orange-50 text-orange-700'
                            : 'border-teal-500 bg-teal-50 text-teal-700'
                          : 'border-gray-200 hover:border-teal-300 text-gray-600'
                      )}
                    >
                      {p.label}
                    </button>
                  )
                )}
              </div>
            </Field>

            {/* Performer */}

            <Field
              label="خدمت‌دهنده"
              icon={UserCheck}
            >
              <SelectField
                value={watch(
                  'performerId'
                )}
                onChange={(v) =>
                  setValue(
                    'performerId',
                    v as any,
                    {
                      shouldDirty: true,
                      shouldTouch: true,
                    }
                  )
                }
                options={[]}
                placeholder="انتخاب خدمت‌دهنده (اختیاری)"
              />
            </Field>

            {/* Location */}

            <Field
              label="محل انجام"
              icon={MapPin}
              required
            >
              <div className="grid grid-cols-3 gap-2">
                {locationOptions.map(
                  (l) => (
                    <button
                      key={l.value}
                      type="button"
                      onClick={() =>
                        setValue(
                          'locationType',
                          l.value,
                          {
                            shouldDirty: true,
                            shouldTouch: true,
                          }
                        )
                      }
                      className={cn(
                        'py-2 rounded-xl border text-sm font-medium transition-all',
                        watch(
                          'locationType'
                        ) === l.value
                          ? 'border-teal-500 bg-teal-50 text-teal-700'
                          : 'border-gray-200 hover:border-teal-300 text-gray-600'
                      )}
                    >
                      {l.label}
                    </button>
                  )
                )}
              </div>
            </Field>

            {/* Address */}

            <Field
              label="آدرس محل"
              icon={MapPin}
              className="md:col-span-2"
            >
              <input
                type="text"
                {...register(
                  'locationAddress'
                )}
                placeholder="آدرس دقیق انجام خدمت"
                className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all text-sm outline-none"
              />
            </Field>

            {/* Description */}

            <Field
              label="توضیحات"
              required
              className="md:col-span-2"
              error={
                errors.description
                  ?.message
              }
            >
              <textarea
                {...register(
                  'description',
                  {
                    onChange: (e) => {
                      if (
                        e.target.value &&
                        e.target.value.trim()
                      ) {
                        clearErrors(
                          'description'
                        );
                      }
                    },
                  }
                )}
                rows={3}
                placeholder="توضیحات مربوط به خدمت..."
                className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all text-sm outline-none resize-none"
              />
            </Field>
          </div>

          {/* =================================================
              Notification
          ================================================= */}

          <div className="p-4 rounded-2xl border border-teal-100 bg-teal-50/50 space-y-3">
            <label className="flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-teal-600" />

                <span className="text-sm font-semibold text-gray-800">
                  ایجاد اعلان برای خدمت
                </span>
              </div>

              <button
                type="button"
                onClick={() =>
                  setValue(
                    'createNotification',
                    !watchCreateNotification,
                    {
                      shouldDirty: true,
                      shouldTouch: true,
                    }
                  )
                }
                className={cn(
                  'relative w-12 h-6 rounded-full transition-colors',
                  watchCreateNotification
                    ? 'bg-teal-500'
                    : 'bg-gray-300'
                )}
              >
                <span
                  className={cn(
                    'absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all',
                    watchCreateNotification
                      ? 'right-0.5'
                      : 'right-6'
                  )}
                />
              </button>
            </label>

            {watchCreateNotification && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-teal-100">

                <Field
                  label="عنوان اعلان"
                  required
                  error={
                    errors
                      .notificationTitle
                      ?.message
                  }
                  className="md:col-span-2"
                >
                  <input
                    type="text"
                    {...register(
                      'notificationTitle',
                      {
                        onChange: (e) => {
                          if (
                            e.target.value.trim()
                          ) {
                            clearErrors(
                              'notificationTitle'
                            );
                          }
                        },
                      }
                    )}
                    placeholder="مثلاً: یادآوری انجام خدمت"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 transition-all text-sm outline-none"
                  />
                </Field>

                <Field
                  label="متن اعلان"
                  required
                  error={
                    errors
                      .notificationMessage
                      ?.message
                  }
                  className="md:col-span-2"
                >
                  <textarea
                    {...register(
                      'notificationMessage',
                      {
                        onChange: (e) => {
                          if (
                            e.target.value.trim()
                          ) {
                            clearErrors(
                              'notificationMessage'
                            );
                          }
                        },
                      }
                    )}
                    rows={2}
                    placeholder="متن کامل اعلان..."
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 transition-all text-sm outline-none resize-none"
                  />
                </Field>

                <Field
                  label="گیرنده"
                  required
                  error={
                    errors
                      .notificationRecipientType
                      ?.message
                  }
                  className="md:col-span-2"
                >
                  <SelectField
                    value={watch(
                      'notificationRecipientType'
                    )}
                    onChange={(v) =>
                      setValue(
                        'notificationRecipientType',
                        v as any,
                        {
                          shouldValidate: true,
                          shouldDirty: true,
                          shouldTouch: true,
                        }
                      )
                    }
                    options={
                      recipientOptions as any
                    }
                    placeholder="انتخاب گیرنده اعلان..."
                  />
                </Field>
              </div>
            )}
          </div>

          {/* =================================================
              Recurring Schedule
          ================================================= */}

          <div className="border border-gray-200 rounded-2xl overflow-hidden">
            <button
              type="button"
              onClick={() =>
                setScheduleOpen(
                  !scheduleOpen
                )
              }
              className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Repeat className="w-4 h-4 text-teal-600" />

                <span className="font-semibold text-sm text-gray-800">
                  برنامه‌ریزی تکرارشونده
                </span>
              </div>

              {scheduleOpen ? (
                <ChevronUp className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              )}
            </button>

            {scheduleOpen && (
              <div className="p-4 space-y-4">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm text-gray-700">
                    فعال کردن برنامه‌ریزی تکرارشونده
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      setValue(
                        'scheduleEnabled',
                        !watchScheduleEnabled,
                        {
                          shouldDirty: true,
                          shouldTouch: true,
                        }
                      )
                    }
                    className={cn(
                      'relative w-12 h-6 rounded-full transition-colors',
                      watchScheduleEnabled
                        ? 'bg-teal-500'
                        : 'bg-gray-300'
                    )}
                  >
                    <span
                      className={cn(
                        'absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all',
                        watchScheduleEnabled
                          ? 'right-0.5'
                          : 'right-6'
                      )}
                    />
                  </button>
                </label>

                {watchScheduleEnabled && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">

                    {/* Schedule Start Date */}

                    <Field
                      label="تاریخ شروع"
                      icon={Calendar}
                      required
                      error={
                        errors
                          .scheduleStartDate
                          ?.message
                      }
                    >
                      <ServiceDatePicker
                        value={
                          watchedScheduleStartDate
                        }
                        onChange={(v) => {
                          console.log(
                            '[CreateServiceDrawer] scheduleStartDate changed:',
                            v
                          );

                          setValue(
                            'scheduleStartDate',
                            v,
                            {
                              shouldValidate: true,
                              shouldDirty: true,
                              shouldTouch: true,
                            }
                          );

                          if (v) {
                            clearErrors(
                              'scheduleStartDate'
                            );
                          }
                        }}
                        placeholder="انتخاب تاریخ شروع..."
                        includeTime={false}
                      />
                    </Field>

                    {/* Schedule Start Time */}

                    <Field
                      label="ساعت شروع"
                      icon={Clock}
                      required
                      error={
                        errors
                          .scheduleStartTime
                          ?.message
                      }
                    >
                      <input
                        type="time"
                        {...register(
                          'scheduleStartTime'
                        )}
                        className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all text-sm outline-none"
                      />
                    </Field>

                    {/* Schedule Duration */}

                    <Field
                      label="مدت (دقیقه)"
                      icon={Clock}
                      required
                      error={
                        errors
                          .scheduleDurationMinutes
                          ?.message
                      }
                    >
                      <div className="grid grid-cols-4 gap-2">
                        {durationOptions.map(
                          (d) => (
                            <button
                              key={d}
                              type="button"
                              onClick={() => {
                                setValue(
                                  'scheduleDurationMinutes',
                                  d,
                                  {
                                    shouldValidate: true,
                                    shouldDirty: true,
                                    shouldTouch: true,
                                  }
                                );

                                clearErrors(
                                  'scheduleDurationMinutes'
                                );
                              }}
                              className={cn(
                                'py-2 rounded-xl border text-sm font-medium transition-all',
                                watch(
                                  'scheduleDurationMinutes'
                                ) === d
                                  ? 'border-teal-500 bg-teal-50 text-teal-700'
                                  : 'border-gray-200 hover:border-teal-300 text-gray-600'
                              )}
                            >
                              {d}
                            </button>
                          )
                        )}
                      </div>
                    </Field>

                    {/* Recurrence */}

                    <Field
                      label="الگوی تکرار"
                      required
                      error={
                        errors
                          .scheduleRecurrenceType
                          ?.message
                      }
                    >
                      <SelectField
                        value={watch(
                          'scheduleRecurrenceType'
                        )}
                        onChange={(v) =>
                          setValue(
                            'scheduleRecurrenceType',
                            v as any,
                            {
                              shouldValidate: true,
                              shouldDirty: true,
                              shouldTouch: true,
                            }
                          )
                        }
                        options={
                          recurrenceOptions as any
                        }
                        placeholder="انتخاب تکرار..."
                      />
                    </Field>

                    {watchScheduleRecurrence !==
                      ServiceRecurrenceType.None && (
                      <>
                        {/* Occurrences */}

                        <Field label="تعداد دفعات">
                          <input
                            type="number"
                            min={1}
                            {...register(
                              'scheduleOccurrencesCount',
                              {
                                valueAsNumber:
                                  true,
                              }
                            )}
                            placeholder="اختیاری"
                            className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all text-sm outline-none"
                          />
                        </Field>

                        {/* End Date */}

                        <Field label="تا تاریخ">
                          <ServiceDatePicker
                            value={watch(
                              'scheduleEndDate'
                            )}
                            onChange={(v) =>
                              setValue(
                                'scheduleEndDate',
                                v,
                                {
                                  shouldDirty: true,
                                  shouldTouch: true,
                                }
                              )
                            }
                            placeholder="اختیاری"
                            includeTime={false}
                          />
                        </Field>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </form>

        {/* =================================================
            Footer
        ================================================= */}

        <div className="border-t border-gray-200 bg-gray-50 px-5 py-4">
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              type="button"
              onClick={handleClose}
              disabled={isLoading}
            >
              انصراف
            </Button>

            <Button
              variant="primary"
              type="submit"
              form="create-service-form"
              disabled={isLoading}
            >
              {isLoading && (
                <Loader2 className="w-4 h-4 ml-1.5 animate-spin" />
              )}

              {isEditMode ? (
                <RefreshCw className="w-4 h-4 ml-1.5" />
              ) : (
                <PlusCircle className="w-4 h-4 ml-1.5" />
              )}

              {isEditMode
                ? 'ذخیره تغییرات'
                : 'ایجاد خدمت'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}