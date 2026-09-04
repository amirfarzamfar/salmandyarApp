'use client';

import React, { useMemo, useRef, useState, useEffect } from 'react';
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

function sdp_gregorianIsoToJalaliDisplay(isoOrDate: string, includeTimePart = false): string {
  try {
    if (!isoOrDate) return '';
    const trimmed = isoOrDate.trim();
    if (!trimmed) return '';
    let gDate: Date;
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      const [y, m, d] = trimmed.split('-').map(n => parseInt(n, 10));
      gDate = new Date(Date.UTC(y, m - 1, d, 0, 0, 0));
    } else {
      gDate = new Date(trimmed);
      if (isNaN(gDate.getTime())) return '';
    }
    const gregorianDObj = new DateObject({
      calendar: gregorianCalendar, locale: gregorianEnLocale,
      year: gDate.getUTCFullYear(), month: gDate.getUTCMonth() + 1, day: gDate.getUTCDate(),
      hour: gDate.getUTCHours(), minute: gDate.getUTCMinutes(), second: gDate.getUTCSeconds(),
    });
    const persianDObj = gregorianDObj.convert(persianCalendar, persianFaLocale);
    const jy = persianDObj.year; const jm = persianDObj.month.number; const jd = persianDObj.day;
    const hh = persianDObj.hour; const mm = persianDObj.minute;
    if (!jy || !jm || !jd) return '';
    const jmStr = String(jm).padStart(2, '0'); const jdStr = String(jd).padStart(2, '0');
    const base = `${jy}/${jmStr}/${jdStr}`;
    if (!includeTimePart) return base;
    const hhStr = String(hh).padStart(2, '0'); const mmStr = String(mm).padStart(2, '0');
    return `${base} ${hhStr}:${mmStr}`;
  } catch { return ''; }
}
function sdp_jalaliDisplayToGregorianIsoUtc(jalaliDisplay: string, includeTimePart = false): string | null {
  try {
    const clean = jalaliDisplay.trim(); if (!clean) return null;
    const dateTimeParts = clean.split(/\s+/);
    const datePart = dateTimeParts[0] || '';
    const timePart = includeTimePart ? (dateTimeParts[1] || '00:00') : '00:00';
    const sep = datePart.includes('-') ? '-' : '/';
    const [jyStr, jmStr, jdStr] = datePart.split(sep);
    if (!jyStr || !jmStr || !jdStr) return null;
    const jy = parseInt(jyStr, 10); const jm = parseInt(jmStr, 10); const jd = parseInt(jdStr, 10);
    if (!jy || !jm || !jd) return null;
    const [hhStr, mmStr] = (timePart || '00:00').split(':');
    const hh = parseInt(hhStr || '0', 10) || 0; const mm = parseInt(mmStr || '0', 10) || 0;
    const persianDObj = new DateObject({
      calendar: persianCalendar, locale: persianFaLocale,
      year: jy, month: jm, day: jd, hour: hh, minute: mm, second: 0,
    });
    const gregorianDObj = persianDObj.convert(gregorianCalendar, gregorianEnLocale);
    const gy = gregorianDObj.year; const gm = gregorianDObj.month.number; const gd = gregorianDObj.day;
    const gh = gregorianDObj.hour; const gmin = gregorianDObj.minute;
    if (!gy || !gm || !gd) return null;
    const result = new Date(Date.UTC(gy, gm - 1, gd, gh, gmin, 0));
    if (isNaN(result.getTime())) return null;
    return result.toISOString();
  } catch { return null; }
}
function sdp_gregorianIsoToJalaliDateObject(isoOrDate: string): any | null {
  try {
    if (!isoOrDate) return null; const trimmed = isoOrDate.trim(); if (!trimmed) return null;
    let gDate: Date;
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      const [y, m, d] = trimmed.split('-').map(n => parseInt(n, 10));
      gDate = new Date(Date.UTC(y, m - 1, d, 0, 0, 0));
    } else {
      gDate = new Date(trimmed); if (isNaN(gDate.getTime())) return null;
    }
    const gregorianDObj = new DateObject({
      calendar: gregorianCalendar, locale: gregorianEnLocale,
      year: gDate.getUTCFullYear(), month: gDate.getUTCMonth() + 1, day: gDate.getUTCDate(),
      hour: gDate.getUTCHours(), minute: gDate.getUTCMinutes(), second: gDate.getUTCSeconds(),
    });
    const persianDObj = gregorianDObj.convert(persianCalendar, persianFaLocale);
    const jy = persianDObj.year; const jm = persianDObj.month.number; const jd = persianDObj.day;
    if (!jy || !jm || !jd) return null;
    return new DateObject({ calendar: persianCalendar, locale: persianFaLocale, year: jy, month: jm, day: jd });
  } catch { return null; }
}

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
  value, onChange, placeholder = 'انتخاب تاریخ...',
  includeTime = false, disabled = false, className, id,
}: ServiceDatePickerProps) {
  const datePickerRef = useRef<any>(null);

  const pickerValue = useMemo(
    () => sdp_gregorianIsoToJalaliDateObject(value ?? ''),
    [value]
  );

  const handlePickerChange = (dateObjArray: any) => {
    const dateObj = Array.isArray(dateObjArray) ? dateObjArray[0] : dateObjArray;
    if (!dateObj) { onChange(null); return; }
    try {
      let year: number, month: number, day: number;
      const formatted = typeof dateObj.format === 'function' ? dateObj.format('YYYY/MM/DD') : '';
      const parts = formatted.split('/');
      if (parts.length === 3) {
        year = parseInt(parts[0], 10); month = parseInt(parts[1], 10); day = parseInt(parts[2], 10);
      } else {
        year = dateObj.year; month = dateObj.month?.number || dateObj.month; day = dateObj.day;
      }
      if (!year || !month || !day) { onChange(null); return; }
      const jmStr = String(month).padStart(2, '0'); const jdStr = String(day).padStart(2, '0');
      const displayDate = `${year}/${jmStr}/${jdStr}`;
      const iso = sdp_jalaliDisplayToGregorianIsoUtc(displayDate, includeTime);
      onChange(iso);
    } catch (e) {
      console.error('[ServiceDatePicker] handlePickerChange error:', e);
      onChange(null);
    }
  };

  return (
    <div className={cn('space-y-2 w-full', className)}>
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
        containerStyle={{ width: '100%', display: 'block' }}
        placeholder={placeholder}
      />
    </div>
  );
}

interface CreateServiceDrawerProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
  editingServiceId?: number | null;
  initialData?: Partial<FormData> | null;
}

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

const priorityOptions = [
  { value: ServicePriority.Normal, label: 'عادی' },
  { value: ServicePriority.Important, label: 'مهم' },
  { value: ServicePriority.Urgent, label: 'فوری' },
];

const locationOptions = [
  { value: ServiceLocationType.PatientHome, label: 'منزل بیمار' },
  { value: ServiceLocationType.MedicalCenter, label: 'مرکز درمانی' },
  { value: ServiceLocationType.Other, label: 'سایر' },
];

const durationOptions = [30, 60, 90, 120];

const recurrenceOptions = [
  { value: ServiceRecurrenceType.None, label: 'بدون تکرار' },
  { value: ServiceRecurrenceType.Daily, label: 'روزانه' },
  { value: ServiceRecurrenceType.Weekly, label: 'هفتگی' },
  { value: ServiceRecurrenceType.Monthly, label: 'ماهانه' },
];

const recipientOptions = [
  { value: ServiceNotificationRecipientType.Patient, label: 'بیمار' },
  { value: ServiceNotificationRecipientType.PatientFamily, label: 'خانواده بیمار' },
  { value: ServiceNotificationRecipientType.Nurse, label: 'پرستار' },
  { value: ServiceNotificationRecipientType.Caregiver, label: 'مراقب' },
  { value: ServiceNotificationRecipientType.Supervisor, label: 'سرپرست' },
  { value: ServiceNotificationRecipientType.All, label: 'همه' },
];

interface FieldProps {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  className?: string;
}

function Field({ label, icon: Icon, required, error, children, className }: FieldProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <label className="text-xs font-bold text-slate-600 flex items-center gap-1">
        {Icon && <Icon className="h-3.5 w-3.5 text-teal-500" />}
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

function SelectField<T extends string | number>({
  value,
  onChange,
  options,
  placeholder,
  searchable = false,
  disabled = false,
}: {
  value: T | null;
  onChange: (v: T | null) => void;
  options: { value: T; label: string; subtext?: string }[];
  placeholder: string;
  searchable?: boolean;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = searchable
    ? options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()) || (o.subtext || '').toLowerCase().includes(search.toLowerCase()))
    : options;

  const selected = options.find((o) => o.value === value);

  return (
    <div className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen(!open)}
        className={cn(
          'w-full flex items-center justify-between px-4 py-2.5 rounded-2xl border border-gray-200 bg-white focus:ring-4 focus:ring-teal-500/10 transition-all text-sm text-right',
          !disabled && 'hover:border-teal-400 focus:border-teal-500',
          disabled && 'opacity-60 cursor-not-allowed bg-gray-50',
        )}
      >
        <span className={selected ? 'text-gray-800 font-medium' : 'text-gray-400'}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown className={cn('w-4 h-4 text-gray-400 transition-transform', open && 'rotate-180')} />
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
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="جستجو..."
                  className="w-full pr-9 pl-3 py-2 rounded-xl bg-gray-50 border border-gray-100 text-sm focus:outline-none focus:border-teal-400"
                />
              </div>
            </div>
          )}
          <div className="overflow-y-auto max-h-48">
            {filtered.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-400">یافت نشد</div>
            ) : (
              filtered.map((o) => (
                <button
                  key={String(o.value)}
                  type="button"
                  onClick={() => {
                    onChange(o.value);
                    setOpen(false);
                    setSearch('');
                  }}
                  className={cn(
                    'w-full px-4 py-2.5 text-right text-sm hover:bg-teal-50 border-b border-gray-50 last:border-0 transition-colors',
                    selected?.value === o.value && 'bg-teal-50 text-teal-700 font-semibold'
                  )}
                >
                  <div>{o.label}</div>
                  {o.subtext && <div className="text-xs text-gray-400 mt-0.5">{o.subtext}</div>}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function CreateServiceDrawer({ open, onClose, onCreated, editingServiceId, initialData }: CreateServiceDrawerProps) {
  const queryClient = useQueryClient();
  const [scheduleOpen, setScheduleOpen] = useState(false);

  const isEditMode = Boolean(editingServiceId);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    trigger,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      careRecipientId: null,
      serviceDefinitionId: null,
      customServiceName: '',
      performerId: null,
      scheduledDate: null,
      scheduledStartTime: '09:00',
      durationMinutes: 60,
      priority: ServicePriority.Normal,
      locationType: ServiceLocationType.PatientHome,
      description: '',
      locationAddress: '',
      createNotification: false,
      notificationTitle: '',
      notificationMessage: '',
      notificationRecipientType: ServiceNotificationRecipientType.Patient,
      scheduleEnabled: false,
      scheduleStartDate: null,
      scheduleStartTime: '09:00',
      scheduleDurationMinutes: 60,
      scheduleRecurrenceType: ServiceRecurrenceType.None,
      scheduleOccurrencesCount: null,
      scheduleEndDate: null,
      ...(initialData ?? {}),
    },
  });

  React.useEffect(() => {
    if (!open) return;
    if (initialData) {
      reset({
        careRecipientId: null,
        serviceDefinitionId: null,
        customServiceName: '',
        performerId: null,
        scheduledDate: null,
        scheduledStartTime: '09:00',
        durationMinutes: 60,
        priority: ServicePriority.Normal,
        locationType: ServiceLocationType.PatientHome,
        description: '',
        locationAddress: '',
        createNotification: false,
        notificationTitle: '',
        notificationMessage: '',
        notificationRecipientType: ServiceNotificationRecipientType.Patient,
        scheduleEnabled: false,
        scheduleStartDate: null,
        scheduleStartTime: '09:00',
        scheduleDurationMinutes: 60,
        scheduleRecurrenceType: ServiceRecurrenceType.None,
        scheduleOccurrencesCount: null,
        scheduleEndDate: null,
        ...(initialData ?? {}),
      } as FormData);
    } else {
      reset({
        careRecipientId: null,
        serviceDefinitionId: null,
        customServiceName: '',
        performerId: null,
        scheduledDate: null,
        scheduledStartTime: '09:00',
        durationMinutes: 60,
        priority: ServicePriority.Normal,
        locationType: ServiceLocationType.PatientHome,
        description: '',
        locationAddress: '',
        createNotification: false,
        notificationTitle: '',
        notificationMessage: '',
        notificationRecipientType: ServiceNotificationRecipientType.Patient,
        scheduleEnabled: false,
        scheduleStartDate: null,
        scheduleStartTime: '09:00',
        scheduleDurationMinutes: 60,
        scheduleRecurrenceType: ServiceRecurrenceType.None,
        scheduleOccurrencesCount: null,
        scheduleEndDate: null,
      });
    }
  }, [open, initialData, reset]);

  const watchCreateNotification = watch('createNotification');
  const watchScheduleRecurrence = watch('scheduleRecurrenceType');

  const { data: patients = [] } = useQuery({
    queryKey: ['patients-all'],
    queryFn: () => patientService.getAll(),
    enabled: open,
  });

  const { data: serviceDefs = [] } = useQuery({
    queryKey: ['service-definitions-all'],
    queryFn: () => serviceCatalogService.getAll(),
    enabled: open,
  });

  const patientOptions = patients.map((p) => ({
    value: p.id,
    label: `${p.firstName} ${p.lastName}`,
    subtext: `کد: ${p.id} | سن: ${p.age}`,
  }));

  const serviceOptions = serviceDefs.map((s: any) => ({
    value: s.id,
    label: s.title || s.name,
    subtext: s.code ? `کد: ${s.code}` : undefined,
  }));

  const createMutation = useMutation({
    mutationFn: (dto: CreatePatientServiceDto) => patientServicesService.create(dto),
    onSuccess: () => {
      toast.success('خدمت با موفقیت ایجاد شد');
      queryClient.invalidateQueries({ queryKey: ['patient-services-paged'] });
      queryClient.invalidateQueries({ queryKey: ['patient-services-statistics'] });
      queryClient.invalidateQueries({ queryKey: ['patient-services-calendar'] });
      queryClient.invalidateQueries({ queryKey: ['patientService'] });
      onCreated();
      handleClose();
    },
    onError: (err: any) => {
      toast.error(extractApiError(err));
    },
  });

  const updateMutation = useMutation({
    mutationFn: (payload: { id: number; dto: any }) => patientServicesService.update(payload.id, payload.dto),
    onSuccess: () => {
      toast.success('خدمت با موفقیت ویرایش شد');
      queryClient.invalidateQueries({ queryKey: ['patient-services-paged'] });
      queryClient.invalidateQueries({ queryKey: ['patient-services-statistics'] });
      queryClient.invalidateQueries({ queryKey: ['patient-services-calendar'] });
      queryClient.invalidateQueries({ queryKey: ['patientService'] });
      onCreated();
      handleClose();
    },
    onError: (err: any) => {
      toast.error(extractApiError(err));
    },
  });

  const scheduleMutation = useMutation({
    mutationFn: (dto: any) => patientServicesService.createSchedule(dto),
    onSuccess: () => {
      toast.success('برنامه‌ریزی خدمت با موفقیت ایجاد شد');
      queryClient.invalidateQueries({ queryKey: ['patient-services-paged'] });
      queryClient.invalidateQueries({ queryKey: ['patient-services-statistics'] });
      queryClient.invalidateQueries({ queryKey: ['patient-services-calendar'] });
      queryClient.invalidateQueries({ queryKey: ['patientService'] });
      onCreated();
      handleClose();
    },
    onError: (err: any) => {
      toast.error(extractApiError(err));
    },
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  const toTimeSpanFormat = (t: string | null | undefined): string | null | undefined => {
    if (t == null) return t;
    const clean = String(t).trim();
    if (!clean) return t;
    const parts = clean.split(':');
    if (parts.length === 2) return `${clean}:00`;
    return clean;
  };

  const extractApiError = (err: any): string => {
    if (!err) return 'خطای نامشخص در سرور';
    const respData = err?.response?.data;
    if (typeof respData === 'string') return respData;
    if (respData) {
      if (typeof respData.error === 'string') return respData.error;
      if (typeof respData.message === 'string') return respData.message;
      if (Array.isArray(respData.errors)) {
        const first = Object.values(respData.errors)[0] as any;
        if (Array.isArray(first) && first.length) return first[0];
        if (typeof first === 'string') return first;
      }
      if (typeof respData === 'object') {
        for (const val of Object.values(respData)) {
          if (Array.isArray(val) && typeof val[0] === 'string') return val[0];
          if (typeof val === 'string') return val;
        }
      }
    }
    if (typeof err?.message === 'string') return err.message;
    return 'خطا در ثبت خدمت';
  };

  const isLoading = createMutation.isPending || scheduleMutation.isPending || updateMutation.isPending;

  const runManualValidation = (data: FormData): boolean => {
    let ok = true;

    if (!isEditMode && (!data.careRecipientId || data.careRecipientId <= 0)) {
      setError('careRecipientId', { type: 'required', message: 'انتخاب بیمار الزامی است' });
      ok = false;
    } else {
      clearErrors('careRecipientId');
    }

    if (!data.serviceDefinitionId || data.serviceDefinitionId <= 0) {
      setError('serviceDefinitionId', { type: 'required', message: 'انتخاب نوع خدمت الزامی است' });
      ok = false;
    } else {
      clearErrors('serviceDefinitionId');
    }

    if (!data.scheduledDate) {
      setError('scheduledDate', { type: 'required', message: 'تاریخ خدمت الزامی است' });
      ok = false;
    } else {
      try {
        const d = new Date(data.scheduledDate);
        if (isNaN(d.getTime())) {
          setError('scheduledDate', { type: 'invalid', message: 'تاریخ خدمت معتبر نیست' });
          ok = false;
        } else {
          clearErrors('scheduledDate');
        }
      } catch {
        setError('scheduledDate', { type: 'invalid', message: 'تاریخ خدمت معتبر نیست' });
        ok = false;
      }
    }

    if (!data.scheduledStartTime || data.scheduledStartTime.trim() === '') {
      setError('scheduledStartTime', { type: 'required', message: 'ساعت شروع خدمت الزامی است' });
      ok = false;
    } else {
      clearErrors('scheduledStartTime');
    }

    if (!data.durationMinutes || data.durationMinutes <= 0) {
      setError('durationMinutes', { type: 'required', message: 'مدت زمان خدمت الزامی است' });
      ok = false;
    } else {
      clearErrors('durationMinutes');
    }

    if (!data.description || data.description.trim() === '') {
      setError('description', { type: 'required', message: 'توضیحات خدمت الزامی است' });
      ok = false;
    } else {
      clearErrors('description');
    }

    return ok;
  };

  const onSubmit = async (data: FormData) => {
    const requiredFields =
      isEditMode
        ? ['serviceDefinitionId', 'scheduledDate', 'scheduledStartTime', 'durationMinutes', 'description']
        : ['careRecipientId', 'serviceDefinitionId', 'scheduledDate', 'scheduledStartTime', 'durationMinutes', 'description'];

    const triggerValid = await trigger(requiredFields as any);
    const manualValid = runManualValidation(data);

    if (!triggerValid || !manualValid) {
      toast.error('لطفاً فیلدهای قرمزرنگ را بررسی و تکمیل کنید.');
      return;
    }

    if (isEditMode && editingServiceId) {
      const dto = {
        id: editingServiceId,
        dto: {
          serviceDefinitionId: data.serviceDefinitionId!,
          customServiceName: data.customServiceName || null,
          scheduledDate: data.scheduledDate!,
          scheduledStartTime: toTimeSpanFormat(data.scheduledStartTime),
          scheduledEndTime: null,
          durationMinutes: data.durationMinutes,
          priority: data.priority,
          locationType: data.locationType,
          description: data.description,
          notes: '',
          locationAddress: data.locationAddress || null,
        },
      };
      updateMutation.mutate(dto);
    } else if (data.scheduleEnabled) {
      const dto: any = {
        careRecipientId: data.careRecipientId!,
        serviceDefinitionId: data.serviceDefinitionId!,
        customServiceName: data.customServiceName || null,
        startDate: (data.scheduleStartDate || data.scheduledDate)!,
        startTime: toTimeSpanFormat(data.scheduleStartTime) ?? '09:00:00',
        durationMinutes: data.scheduleDurationMinutes ?? 60,
        recurrenceType: data.scheduleRecurrenceType,
        occurrencesCount: data.scheduleOccurrencesCount,
        endDate: data.scheduleEndDate,
        priority: data.priority,
        locationType: data.locationType,
        locationAddress: data.locationAddress || null,
        description: data.description,
        createNotifications: data.createNotification,
      };
      scheduleMutation.mutate(dto);
    } else {
      const dto: CreatePatientServiceDto = {
        careRecipientId: data.careRecipientId!,
        serviceDefinitionId: data.serviceDefinitionId!,
        customServiceName: data.customServiceName || null,
        performerId: data.performerId,
        scheduledDate: data.scheduledDate!,
        scheduledStartTime: toTimeSpanFormat(data.scheduledStartTime),
        scheduledEndTime: null,
        durationMinutes: data.durationMinutes,
        priority: data.priority,
        locationType: data.locationType,
        description: data.description,
        notes: '',
        locationAddress: data.locationAddress || null,
        createNotification: data.createNotification,
        notificationTitle: data.createNotification ? data.notificationTitle : undefined,
        notificationMessage: data.createNotification ? data.notificationMessage : undefined,
        notificationRecipientType: data.createNotification ? data.notificationRecipientType : undefined,
      };
      createMutation.mutate(dto);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex flex-col md:flex-row md:items-center md:justify-center p-0 md:p-4 overflow-hidden">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative z-10 w-full max-w-5xl md:max-h-[92vh] h-full md:h-auto md:rounded-2xl md:border md:border-slate-200 bg-white shadow-2xl md:mx-auto flex flex-col md:animate-in md:fade-in md:zoom-in-95 md:duration-200 animate-in slide-in-from-right md:slide-in-from-right-0 duration-300" dir="rtl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-l from-teal-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center">
              {isEditMode ? <RefreshCw className="w-5 h-5" /> : <PlusCircle className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {isEditMode ? 'ویرایش خدمت' : 'ایجاد خدمت جدید'}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {isEditMode ? 'اطلاعات خدمت را ویرایش کنید' : 'اطلاعات خدمت را تکمیل کنید'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="بیمار" icon={User} required={!isEditMode} className="md:col-span-2" error={errors.careRecipientId?.message}>
              <SelectField
                value={watch('careRecipientId')}
                onChange={(v) => {
                  setValue('careRecipientId', v as any, { shouldValidate: true });
                  if (v) clearErrors('careRecipientId');
                }}
                options={patientOptions as any}
                placeholder={isEditMode ? 'غیرقابل ویرایش — بیمار ثابت است' : 'جستجو و انتخاب بیمار...'}
                searchable
                disabled={isEditMode}
              />
            </Field>

            <Field label="نوع خدمت" icon={Calendar} required className="md:col-span-2" error={errors.serviceDefinitionId?.message}>
              <SelectField
                value={watch('serviceDefinitionId')}
                onChange={(v) => {
                  setValue('serviceDefinitionId', v as any, { shouldValidate: true });
                  if (v) clearErrors('serviceDefinitionId');
                }}
                options={serviceOptions as any}
                placeholder="انتخاب نوع خدمت..."
                searchable
              />
            </Field>

            <Field label="نام سفارشی خدمت" icon={StickyNote} className="md:col-span-2">
              <input
                type="text"
                {...register('customServiceName')}
                placeholder="اختیاری - نام دلخواه برای خدمت"
                className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all text-sm outline-none"
              />
            </Field>

            <Field label="تاریخ خدمت" icon={Calendar} required error={errors.scheduledDate?.message}>
              <ServiceDatePicker
                value={watch('scheduledDate')}
                onChange={(v) => {
                  setValue('scheduledDate', v, { shouldValidate: true });
                  if (v) clearErrors('scheduledDate');
                }}
                placeholder="۱۴۰۳/۰۱/۰۱"
                includeTime={false}
              />
            </Field>

            <Field label="ساعت شروع" icon={Clock} required error={errors.scheduledStartTime?.message}>
              <input
                type="time"
                {...register('scheduledStartTime')}
                className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all text-sm outline-none"
              />
            </Field>

            <Field label="مدت زمان (دقیقه)" icon={Clock} required error={errors.durationMinutes?.message}>
              <div className="grid grid-cols-4 gap-2">
                {durationOptions.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => {
                      setValue('durationMinutes', d, { shouldValidate: true });
                      clearErrors('durationMinutes');
                    }}
                    className={cn(
                      'py-2 rounded-xl border text-sm font-medium transition-all',
                      watch('durationMinutes') === d
                        ? 'border-teal-500 bg-teal-50 text-teal-700'
                        : 'border-gray-200 hover:border-teal-300 text-gray-600'
                    )}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="اولویت" required>
              <div className="grid grid-cols-3 gap-2">
                {priorityOptions.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setValue('priority', p.value)}
                    className={cn(
                      'py-2 rounded-xl border text-sm font-medium transition-all',
                      watch('priority') === p.value
                        ? p.value === ServicePriority.Urgent
                          ? 'border-red-500 bg-red-50 text-red-700'
                          : p.value === ServicePriority.Important
                          ? 'border-orange-500 bg-orange-50 text-orange-700'
                          : 'border-teal-500 bg-teal-50 text-teal-700'
                        : 'border-gray-200 hover:border-teal-300 text-gray-600'
                    )}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="خدمت‌دهنده" icon={UserCheck}>
              <SelectField
                value={watch('performerId')}
                onChange={(v) => setValue('performerId', v as any)}
                options={[]}
                placeholder="انتخاب خدمت‌دهنده (اختیاری)"
              />
            </Field>

            <Field label="محل انجام" icon={MapPin} required>
              <div className="grid grid-cols-3 gap-2">
                {locationOptions.map((l) => (
                  <button
                    key={l.value}
                    type="button"
                    onClick={() => setValue('locationType', l.value)}
                    className={cn(
                      'py-2 rounded-xl border text-sm font-medium transition-all',
                      watch('locationType') === l.value
                        ? 'border-teal-500 bg-teal-50 text-teal-700'
                        : 'border-gray-200 hover:border-teal-300 text-gray-600'
                    )}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="آدرس محل" icon={MapPin} className="md:col-span-2">
              <input
                type="text"
                {...register('locationAddress')}
                placeholder="آدرس دقیق انجام خدمت"
                className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all text-sm outline-none"
              />
            </Field>

            <Field label="توضیحات" required className="md:col-span-2" error={errors.description?.message}>
              <textarea
                {...register('description', {
                  onChange: (e) => {
                    if (e.target.value && e.target.value.trim()) clearErrors('description');
                  }
                })}
                rows={3}
                placeholder="توضیحات مربوط به خدمت..."
                className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all text-sm outline-none resize-none"
              />
            </Field>
          </div>

          <div className="p-4 rounded-2xl border border-teal-100 bg-teal-50/50 space-y-3">
            <label className="flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-teal-600" />
                <span className="text-sm font-semibold text-gray-800">ایجاد اعلان برای خدمت</span>
              </div>
              <button
                type="button"
                onClick={() => setValue('createNotification', !watchCreateNotification)}
                className={cn(
                  'relative w-12 h-6 rounded-full transition-colors',
                  watchCreateNotification ? 'bg-teal-500' : 'bg-gray-300'
                )}
              >
                <span
                  className={cn(
                    'absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all',
                    watchCreateNotification ? 'right-0.5' : 'right-6'
                  )}
                />
              </button>
            </label>

            {watchCreateNotification && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-teal-100">
                <Field label="عنوان اعلان" required className="md:col-span-2">
                  <input
                    type="text"
                    {...register('notificationTitle')}
                    placeholder="مثلاً: یادآوری انجام خدمت"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 transition-all text-sm outline-none"
                  />
                </Field>
                <Field label="متن اعلان" required className="md:col-span-2">
                  <textarea
                    {...register('notificationMessage')}
                    rows={2}
                    placeholder="متن کامل اعلان..."
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 transition-all text-sm outline-none resize-none"
                  />
                </Field>
                <Field label="گیرنده" required className="md:col-span-2">
                  <SelectField
                    value={watch('notificationRecipientType')}
                    onChange={(v) => setValue('notificationRecipientType', v as any)}
                    options={recipientOptions as any}
                    placeholder="انتخاب گیرنده اعلان..."
                  />
                </Field>
              </div>
            )}
          </div>

          <div className="border border-gray-200 rounded-2xl overflow-hidden">
            <button
              type="button"
              onClick={() => setScheduleOpen(!scheduleOpen)}
              className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Repeat className="w-4 h-4 text-teal-600" />
                <span className="font-semibold text-sm text-gray-800">برنامه‌ریزی تکرارشونده</span>
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
                  <span className="text-sm text-gray-700">فعال کردن برنامه‌ریزی تکرارشونده</span>
                  <button
                    type="button"
                    onClick={() => setValue('scheduleEnabled', !watch('scheduleEnabled'))}
                    className={cn(
                      'relative w-12 h-6 rounded-full transition-colors',
                      watch('scheduleEnabled') ? 'bg-teal-500' : 'bg-gray-300'
                    )}
                  >
                    <span
                      className={cn(
                        'absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all',
                        watch('scheduleEnabled') ? 'right-0.5' : 'right-6'
                      )}
                    />
                  </button>
                </label>

                {watch('scheduleEnabled') && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <Field label="تاریخ شروع" icon={Calendar} required>
                      <ServiceDatePicker
                        value={watch('scheduleStartDate')}
                        onChange={(v) => setValue('scheduleStartDate', v)}
                        placeholder="انتخاب تاریخ شروع..."
                        includeTime={false}
                      />
                    </Field>

                    <Field label="ساعت شروع" icon={Clock} required>
                      <input
                        type="time"
                        {...register('scheduleStartTime')}
                        className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all text-sm outline-none"
                      />
                    </Field>

                    <Field label="مدت (دقیقه)" icon={Clock} required>
                      <div className="grid grid-cols-4 gap-2">
                        {durationOptions.map((d) => (
                          <button
                            key={d}
                            type="button"
                            onClick={() => setValue('scheduleDurationMinutes', d)}
                            className={cn(
                              'py-2 rounded-xl border text-sm font-medium transition-all',
                              watch('scheduleDurationMinutes') === d
                                ? 'border-teal-500 bg-teal-50 text-teal-700'
                                : 'border-gray-200 hover:border-teal-300 text-gray-600'
                            )}
                          >
                            {d}
                          </button>
                        ))}
                      </div>
                    </Field>

                    <Field label="الگوی تکرار" required>
                      <SelectField
                        value={watch('scheduleRecurrenceType')}
                        onChange={(v) => setValue('scheduleRecurrenceType', v as any)}
                        options={recurrenceOptions as any}
                        placeholder="انتخاب تکرار..."
                      />
                    </Field>

                    {watchScheduleRecurrence !== ServiceRecurrenceType.None && (
                      <>
                        <Field label="تعداد دفعات">
                          <input
                            type="number"
                            min={1}
                            {...register('scheduleOccurrencesCount', { valueAsNumber: true })}
                            placeholder="اختیاری"
                            className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all text-sm outline-none"
                          />
                        </Field>
                        <Field label="تا تاریخ">
                          <ServiceDatePicker
                            value={watch('scheduleEndDate')}
                            onChange={(v) => setValue('scheduleEndDate', v)}
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
              onClick={(e) => {
                e.preventDefault();
                void handleSubmit(onSubmit)(e);
              }}
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="w-4 h-4 ml-1.5 animate-spin" />}
              {isEditMode ? <RefreshCw className="w-4 h-4 ml-1.5" /> : <PlusCircle className="w-4 h-4 ml-1.5" />}
              {isEditMode ? 'ذخیره تغییرات' : 'ایجاد خدمت'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
