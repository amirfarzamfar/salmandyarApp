import React, { useEffect, useMemo, useState } from 'react';
import DatePicker from 'react-multi-date-picker';
import DateObject from 'react-date-object';
import persian from 'react-date-object/calendars/persian';
import persian_fa from 'react-date-object/locales/persian_fa';
import toast from 'react-hot-toast';
import { AllergyDto, PatientProfileDto, PatientProfileService, UploadedDocumentDto } from '@/services/patient-profile.service';
import { useUser } from '@/components/auth/UserContext';
import { Button } from '@/components/ui/Button';
import { resolveApiUrl } from '@/lib/network';
import { ChevronLeft, ChevronRight, Loader2, Save, Upload, X } from 'lucide-react';

interface Props {
  currentStep: number;
  formData: Partial<PatientProfileDto>;
  onNext: (data: Partial<PatientProfileDto>) => void;
  onPrev: () => void;
  isSaving: boolean;
  adminUserId?: string | null;
  onDraftChange?: (data: Partial<PatientProfileDto>) => void;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024;
const ALLOWED_FILE_TYPES = [
  '.pdf',
  '.jpg',
  '.jpeg',
  '.png',
  '.bmp',
  '.gif',
  '.webp',
  '.tif',
  '.tiff',
  '.doc',
  '.docx',
  '.xls',
  '.xlsx',
  '.csv',
  '.txt',
  '.rtf',
  '.zip',
  '.rar',
  '.7z',
];
const ACCEPTED_FILE_TYPES = ALLOWED_FILE_TYPES.join(',');
const DOCUMENT_TYPES = [
  { id: 'NationalId', label: 'تصویر کارت ملی' },
  { id: 'Insurance', label: 'دفترچه بیمه' },
  { id: 'LabTest', label: 'آخرین آزمایشات' },
  { id: 'CT_MRI', label: 'گزارش CT Scan / MRI' },
  { id: 'Prescription', label: 'نسخه پزشک' },
] as const;
const HOME_MEDICAL_EQUIPMENT_OPTIONS = [
  { id: 'oxygen_concentrator', label: 'اکسیژن‌ساز' },
  { id: 'oxygen_cylinder', label: 'کپسول اکسیژن' },
  { id: 'suction_machine', label: 'ساکشن' },
  { id: 'nebulizer', label: 'نبولایزر' },
  { id: 'pulse_oximeter', label: 'پالس اکسیمتر' },
  { id: 'hospital_bed', label: 'تخت بیمارستانی' },
  { id: 'anti_bedsore_mattress', label: 'تشک مواج' },
  { id: 'wheelchair', label: 'ویلچر' },
  { id: 'walker', label: 'واکر' },
  { id: 'ventilator', label: 'ونتیلاتور' },
] as const;

type EquipmentFieldName = 'neededHomeMedicalEquipment' | 'availableHomeMedicalEquipment';

const createEmptyAllergy = (): AllergyDto => ({
  allergyType: '',
  description: '',
});

const inputClassName =
  'w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm text-gray-900 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-900/40';
const checkboxCardClassName =
  'flex cursor-pointer items-start gap-3 rounded-xl border border-gray-200 p-3 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800';
const sectionTitleClassName =
  'border-b border-gray-100 pb-2 text-lg font-semibold text-gray-900 dark:border-gray-700 dark:text-white sm:text-xl';
const normalizeDateForPicker = (value?: string) => {
  if (!value) return undefined;

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) return undefined;

  return new Date(Date.UTC(
    parsedDate.getUTCFullYear(),
    parsedDate.getUTCMonth(),
    parsedDate.getUTCDate(),
    12
  ));
};

export default function ProfileWizardSteps({ currentStep, formData, onNext, onPrev, isSaving, adminUserId, onDraftChange }: Props) {
  const { user } = useUser();
  const [localData, setLocalData] = useState<Partial<PatientProfileDto>>(formData);
  const [hasNoAllergies, setHasNoAllergies] = useState(false);
  const [uploadingDocumentType, setUploadingDocumentType] = useState<string | null>(null);
  const assessmentSectionTitle = user?.role === 'Patient' ? 'بیمار' : 'سالمند';

  useEffect(() => {
    setLocalData(formData);
    setHasNoAllergies(Array.isArray(formData.allergies) && formData.allergies.length === 0);
  }, [formData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    // Handle nested objects based on name dot notation
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setLocalData(prev => {
        const prevRecord = prev as Record<string, unknown>;
        const parentValue = prevRecord[parent];
        const parentObject =
          typeof parentValue === 'object' && parentValue !== null
            ? (parentValue as Record<string, unknown>)
            : {};
        const next = {
          ...prev,
          [parent]: {
            ...parentObject,
            [child]: type === 'checkbox' ? checked : value,
          },
        };
        onDraftChange?.(next);
        return next;
      });
    } else {
      setLocalData(prev => {
        const next = {
          ...prev,
          [name]: type === 'checkbox' ? checked : value,
        };
        onDraftChange?.(next);
        return next;
      });
    }
  };

  const handleDateOfBirthChange = (value: DateObject | DateObject[] | null) => {
    const selectedDate = Array.isArray(value) ? value[0] : value;

    setLocalData(prev => ({
      ...prev,
      dateOfBirth:
        selectedDate && selectedDate.isValid
          ? new Date(selectedDate.valueOf()).toISOString()
          : undefined,
    }));
  };

  const toggleEquipmentSelection = (fieldName: EquipmentFieldName, itemId: string, checked: boolean) => {
    setLocalData(prev => {
      const existingItems = prev[fieldName] ?? [];
      const nextItems = checked
        ? Array.from(new Set([...existingItems, itemId]))
        : existingItems.filter(item => item !== itemId);

      const next = {
        ...prev,
        [fieldName]: nextItems,
      };
      onDraftChange?.(next);
      return next;
    });
  };

  const visibleAllergies = useMemo(() => {
    if (hasNoAllergies) return [];
    return localData.allergies && localData.allergies.length > 0
      ? localData.allergies
      : [createEmptyAllergy()];
  }, [hasNoAllergies, localData.allergies]);

  const handleAllergyChange = (index: number, field: keyof AllergyDto, value: string) => {
    setHasNoAllergies(false);
    setLocalData(prev => {
      const nextAllergies = [...(prev.allergies ?? [])];
      if (!nextAllergies[index]) {
        nextAllergies[index] = createEmptyAllergy();
      }

      nextAllergies[index] = {
        ...nextAllergies[index],
        [field]: value,
      };

      return {
        ...prev,
        allergies: nextAllergies,
      };
    });
  };

  const addAllergy = () => {
    setHasNoAllergies(false);
    setLocalData(prev => ({
      ...prev,
      allergies: [...(prev.allergies ?? []), createEmptyAllergy()],
    }));
  };

  const removeAllergy = (index: number) => {
    setLocalData(prev => ({
      ...prev,
      allergies: (prev.allergies ?? []).filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const handleNoAllergiesChange = (checked: boolean) => {
    setHasNoAllergies(checked);
    setLocalData(prev => ({
      ...prev,
      allergies: checked ? [] : prev.allergies && prev.allergies.length > 0 ? prev.allergies : [createEmptyAllergy()],
    }));
  };

  const getUploadedDocument = (documentType: string) =>
    (localData.documents ?? []).find(doc => doc.documentType === documentType);

  const handleDocumentSelect = async (documentType: string, files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;

    const fileExtension = `.${file.name.split('.').pop()?.toLowerCase() ?? ''}`;
    if (!ALLOWED_FILE_TYPES.includes(fileExtension)) {
      toast.error('این فرمت پشتیبانی نمی‌شود. از فایل‌های رایج تصویری، PDF، آفیس یا آرشیو استفاده کنید.');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error('حجم فایل نباید بیشتر از ۵۰ مگابایت باشد.');
      return;
    }

    try {
      setUploadingDocumentType(documentType);

      const uploadedDocument = adminUserId
        ? await PatientProfileService.uploadUserDocument(adminUserId, documentType, file)
        : await PatientProfileService.uploadMyDocument(documentType, file);

      setLocalData(prev => ({
        ...prev,
        documents: [
          ...(prev.documents ?? []).filter(doc => doc.documentType !== documentType),
          uploadedDocument,
        ],
      }));

      toast.success('فایل با موفقیت بارگذاری و جایگزین مدرک قبلی شد.');
    } catch {
      toast.error('بارگذاری فایل انجام نشد.');
    } finally {
      setUploadingDocumentType(null);
    }
  };

  const handleNextClick = () => {
    const sanitizedAllergies = hasNoAllergies
      ? []
      : (localData.allergies ?? []).filter(
          allergy => allergy.allergyType?.trim() || allergy.description?.trim()
        );

    const sanitizedDocuments = Object.values(
      (localData.documents ?? []).reduce<Record<string, UploadedDocumentDto>>((acc, document) => {
        if (document.documentType && document.fileUrl) {
          acc[document.documentType] = document;
        }
        return acc;
      }, {})
    );

    onNext({
      ...localData,
      allergies: sanitizedAllergies,
      documents: sanitizedDocuments,
    });
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="animate-in space-y-5 fade-in slide-in-from-right-4 duration-500 sm:space-y-6">
            <h2 className={sectionTitleClassName}>اطلاعات هویتی</h2>
            <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 md:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">کد ملی</label>
                <input type="text" name="nationalCode" value={localData.nationalCode || ''} onChange={handleChange} className={inputClassName} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">جنسیت</label>
                <select name="gender" value={localData.gender || ''} onChange={handleChange} className={inputClassName}>
                  <option value="">انتخاب کنید</option>
                  <option value="Male">مرد</option>
                  <option value="Female">زن</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">تاریخ تولد</label>
                <DatePicker
                  value={normalizeDateForPicker(localData.dateOfBirth)}
                  onChange={handleDateOfBirthChange}
                  calendar={persian}
                  locale={persian_fa}
                  format="YYYY/MM/DD"
                  calendarPosition="bottom-right"
                  inputClass={inputClassName}
                  containerClassName="w-full"
                  placeholder="انتخاب تاریخ تولد"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">نام پدر</label>
                <input type="text" name="fatherName" value={localData.fatherName || ''} onChange={handleChange} className={inputClassName} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">وضعیت تأهل</label>
                <select name="maritalStatus" value={localData.maritalStatus || ''} onChange={handleChange} className={inputClassName}>
                  <option value="">انتخاب کنید</option>
                  <option value="Single">مجرد</option>
                  <option value="Married">متاهل</option>
                  <option value="Widowed">همسر فوت شده</option>
                  <option value="Divorced">مطلقه</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ملیت</label>
                <input type="text" name="nationality" value={localData.nationality || 'ایرانی'} onChange={handleChange} className={inputClassName} />
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="animate-in space-y-5 fade-in slide-in-from-right-4 duration-500 sm:space-y-6">
            <h2 className={sectionTitleClassName}>اطلاعات تماس</h2>
            <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 md:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">شماره موبایل</label>
                <input 
                  type="tel" 
                  name="mobileNumber" 
                  value={localData.mobileNumber || ''} 
                  onChange={handleChange} 
                  className={`${inputClassName} bg-gray-50 dark:bg-gray-800/50 cursor-not-allowed opacity-80`} 
                  dir="ltr" 
                  readOnly 
                />
                <p className="mt-1 text-[10px] text-gray-400">شماره موبایل ثبت‌نامی (غیرقابل تغییر)</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">استان</label>
                <input type="text" name="address.state" value={localData.address?.state || ''} onChange={handleChange} className={inputClassName} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">شهر</label>
                <input type="text" name="address.city" value={localData.address?.city || ''} onChange={handleChange} className={inputClassName} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">کد پستی</label>
                <input type="text" name="address.postalCode" value={localData.address?.postalCode || ''} onChange={handleChange} className={inputClassName} dir="ltr" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">آدرس دقیق</label>
                <textarea name="address.fullAddress" value={localData.address?.fullAddress || ''} onChange={handleChange} rows={3} className={inputClassName} />
              </div>
            </div>
            <h3 className="mt-6 border-b border-gray-100 pb-2 text-lg font-semibold text-gray-900 dark:border-gray-700 dark:text-white">تماس اضطراری</h3>
            <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-3 md:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">نام فرد اضطراری</label>
                <input type="text" name="emergencyContact.name" value={localData.emergencyContact?.name || ''} onChange={handleChange} className={inputClassName} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">شماره تماس اضطراری</label>
                <input type="tel" name="emergencyContact.phoneNumber" value={localData.emergencyContact?.phoneNumber || ''} onChange={handleChange} className={inputClassName} dir="ltr" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">نسبت</label>
                <input type="text" name="emergencyContact.relationship" value={localData.emergencyContact?.relationship || ''} onChange={handleChange} className={inputClassName} />
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="animate-in space-y-5 fade-in slide-in-from-right-4 duration-500 sm:space-y-6">
            <h2 className={sectionTitleClassName}>اطلاعات فیزیکی و پایه</h2>
            <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-3 md:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">قد (سانتی‌متر)</label>
                <input type="number" name="height" value={localData.height || ''} onChange={handleChange} className={inputClassName} dir="ltr" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">وزن (کیلوگرم)</label>
                <input type="number" name="weight" value={localData.weight || ''} onChange={handleChange} className={inputClassName} dir="ltr" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">گروه خونی</label>
                <select name="bloodGroup" value={localData.bloodGroup || ''} onChange={handleChange} className={inputClassName} dir="ltr">
                  <option value="">انتخاب کنید</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
            </div>
            
            {localData.height && localData.weight && (
              <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/30">
                <span className="text-blue-800 dark:text-blue-300 font-medium">BMI محاسبه شده: </span>
                <span className="font-bold text-lg text-blue-900 dark:text-blue-200" dir="ltr">
                  {(localData.weight / Math.pow(localData.height / 100, 2)).toFixed(1)}
                </span>
              </div>
            )}

            <div className="mt-6 grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 md:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">وضعیت حرکتی</label>
                <select name="mobilityStatus" value={localData.mobilityStatus || ''} onChange={handleChange} className={inputClassName}>
                  <option value="">انتخاب کنید</option>
                  <option value="Independent">مستقل</option>
                  <option value="NeedsAssistance">نیاز به کمک</option>
                  <option value="Bedridden">بستری (بدون حرکت)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">توانایی راه رفتن</label>
                <input type="text" name="walkingAbility" value={localData.walkingAbility || ''} onChange={handleChange} className={inputClassName} placeholder="مثال: فقط با کمک راه میرود" />
              </div>
              <div>
                <label className={checkboxCardClassName}>
                  <input type="checkbox" name="usesWheelchair" checked={localData.usesWheelchair || false} onChange={handleChange} className="w-5 h-5 text-blue-600 rounded" />
                  <span className="text-gray-700 dark:text-gray-300">استفاده از ویلچر</span>
                </label>
              </div>
              <div>
                <label className={checkboxCardClassName}>
                  <input type="checkbox" name="usesWalker" checked={localData.usesWalker || false} onChange={handleChange} className="w-5 h-5 text-blue-600 rounded" />
                  <span className="text-gray-700 dark:text-gray-300">استفاده از واکر</span>
                </label>
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="animate-in space-y-5 fade-in slide-in-from-right-4 duration-500 sm:space-y-6">
            <h2 className={sectionTitleClassName}>سوابق پزشکی و بیماری‌های زمینه‌ای</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-3">
              {[
                { name: 'medicalHistory.hasDiabetes', label: 'دیابت' },
                { name: 'medicalHistory.hasHypertension', label: 'فشار خون' },
                { name: 'medicalHistory.hasHeartDisease', label: 'بیماری قلبی' },
                { name: 'medicalHistory.hasCOPD', label: 'COPD' },
                { name: 'medicalHistory.hasAsthma', label: 'آسم' },
                { name: 'medicalHistory.hasKidneyFailure', label: 'نارسایی کلیه' },
                { name: 'medicalHistory.hasStroke', label: 'سکته مغزی' },
                { name: 'medicalHistory.hasAlzheimers', label: 'آلزایمر' },
                { name: 'medicalHistory.hasParkinsons', label: 'پارکینسون' },
                { name: 'medicalHistory.hasCancer', label: 'سرطان' },
                { name: 'medicalHistory.hasPsychiatricDisorders', label: 'بیماری‌های روانپزشکی' },
              ].map((item) => (
                <label key={item.name} className={checkboxCardClassName}>
                  <input 
                    type="checkbox" 
                    name={item.name} 
                    checked={(localData.medicalHistory as any)?.[item.name.split('.')[1]] || false} 
                    onChange={handleChange} 
                    className="w-5 h-5 text-blue-600 rounded border-gray-300" 
                  />
                  <span className="mr-3 text-gray-700 dark:text-gray-300 font-medium">{item.label}</span>
                </label>
              ))}
            </div>
            
            {/* Conditional Branching Example */}
            {localData.medicalHistory?.hasDiabetes && (
              <div className="mt-4 animate-in rounded-2xl border border-orange-200 bg-orange-50 p-4 fade-in slide-in-from-top-2 dark:border-orange-800 dark:bg-orange-900/20">
                <h4 className="text-orange-800 dark:text-orange-300 font-semibold mb-2">سوالات تکمیلی دیابت</h4>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">نوع دیابت</label>
                    <select className={`${inputClassName} border-orange-200`}>
                      <option>نوع 1</option>
                      <option>نوع 2</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">میانگین قند خون ناشتا</label>
                    <input type="number" className={`${inputClassName} border-orange-200`} dir="ltr" />
                  </div>
                </div>
              </div>
            )}

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">سایر بیماری‌ها</label>
              <textarea name="medicalHistory.otherDiseases" value={localData.medicalHistory?.otherDiseases || ''} onChange={handleChange} rows={3} className={inputClassName} placeholder="لطفاً در صورت وجود سایر بیماری‌ها اینجا ذکر کنید..." />
            </div>
          </div>
        );
      case 5:
        return (
          <div className="animate-in space-y-5 fade-in slide-in-from-right-4 duration-500 sm:space-y-6">
            <h2 className={sectionTitleClassName}>داروها و آلرژی</h2>
            <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
              <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                نکته: لیست دقیق داروها را می‌توانید بعد از تکمیل پروفایل در بخش «مدیریت داروها» ثبت کنید.
              </p>
            </div>
            
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">آلرژی و حساسیت‌ها</h3>
              <div className="mb-4 rounded-2xl border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={hasNoAllergies}
                    onChange={(e) => handleNoAllergiesChange(e.target.checked)}
                    className="h-5 w-5 rounded text-blue-600"
                  />
                  <span className="font-medium text-gray-700 dark:text-gray-300">هیچ آلرژی ندارم</span>
                </label>
              </div>

              {!hasNoAllergies && (
                <>
                  <div className="space-y-4">
                    {visibleAllergies.map((allergy, index) => (
                      <div key={index} className="grid grid-cols-1 gap-4 rounded-2xl border border-gray-200 p-4 md:grid-cols-3 dark:border-gray-700">
                        <div>
                          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">نوع حساسیت</label>
                          <select
                            value={allergy.allergyType || ''}
                            onChange={(e) => handleAllergyChange(index, 'allergyType', e.target.value)}
                            className={inputClassName}
                          >
                            <option value="">انتخاب کنید</option>
                            <option value="Drug">دارویی</option>
                            <option value="Food">غذایی</option>
                            <option value="Respiratory">تنفسی</option>
                          </select>
                        </div>
                        <div className="md:col-span-2">
                          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">توضیحات</label>
                          <div className="flex flex-col gap-2 sm:flex-row">
                            <input
                              type="text"
                              value={allergy.description || ''}
                              onChange={(e) => handleAllergyChange(index, 'description', e.target.value)}
                              className={inputClassName}
                              placeholder="نام دارو یا ماده حساسیت‌زا"
                            />
                            {visibleAllergies.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                onClick={() => removeAllergy(index)}
                                className="h-12 rounded-xl px-3 text-red-600 hover:bg-red-50 hover:text-red-700 sm:h-auto"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button type="button" variant="outline" className="mt-3 h-11 rounded-xl px-4" onClick={addAllergy}>
                    + افزودن آلرژی دیگر
                  </Button>
                </>
              )}
            </div>
          </div>
        );
      case 6:
        return (
          <div className="animate-in space-y-5 fade-in slide-in-from-right-4 duration-500 sm:space-y-6">
            <h2 className={sectionTitleClassName}>اطلاعات درمانی و تجهیزات</h2>
            <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 md:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">پزشک معالج</label>
                <input type="text" name="attendingPhysician" value={localData.attendingPhysician || ''} onChange={handleChange} className={inputClassName} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">شماره تماس پزشک</label>
                <input type="tel" name="physicianPhone" value={localData.physicianPhone || ''} onChange={handleChange} className={inputClassName} dir="ltr" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">سابقه بستری (بیمارستان‌های قبلی)</label>
                <textarea name="hospitalizationHistory" value={localData.hospitalizationHistory || ''} onChange={handleChange} rows={2} className={inputClassName} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">سابقه جراحی</label>
                <textarea name="surgeryHistory" value={localData.surgeryHistory || ''} onChange={handleChange} rows={2} className={inputClassName} />
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50/60 p-4 dark:border-blue-900/50 dark:bg-blue-950/20">
              <div className="mb-4">
                <h3 className="border-b border-blue-100 pb-2 text-lg font-semibold text-gray-900 dark:border-blue-900/50 dark:text-white">تجهیزات پزشکی در منزل</h3>
                <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">
                  مشخص کنید چه تجهیزاتی در منزل موجود است و چه تجهیزاتی برای ارائه خدمت نیاز دارید.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                <div className="space-y-4 rounded-2xl border border-amber-200 bg-white p-4 shadow-sm dark:border-amber-900/60 dark:bg-gray-900/70">
                  <div>
                    <h4 className="text-base font-semibold text-amber-700 dark:text-amber-300">تجهیزاتی که لازم دارم</h4>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">موارد مورد نیاز برای خرید، اجاره یا تامین خدمت را انتخاب کنید.</p>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {HOME_MEDICAL_EQUIPMENT_OPTIONS.map((item) => (
                      <label key={`needed-${item.id}`} className={checkboxCardClassName}>
                        <input
                          type="checkbox"
                          checked={(localData.neededHomeMedicalEquipment ?? []).includes(item.id)}
                          onChange={(event) => toggleEquipmentSelection('neededHomeMedicalEquipment', item.id, event.target.checked)}
                          className="w-5 h-5 text-amber-600 rounded border-gray-300"
                        />
                        <span className="mr-3 text-gray-700 dark:text-gray-300 font-medium">{item.label}</span>
                      </label>
                    ))}
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">سایر تجهیزات مورد نیاز</label>
                    <textarea
                      name="otherNeededHomeMedicalEquipment"
                      value={localData.otherNeededHomeMedicalEquipment || ''}
                      onChange={handleChange}
                      rows={3}
                      className={inputClassName}
                      placeholder="مثلاً دستگاه بای‌پپ، بالابر بیمار، مانیتورینگ خانگی و ..."
                    />
                  </div>
                </div>

                <div className="space-y-4 rounded-2xl border border-emerald-200 bg-white p-4 shadow-sm dark:border-emerald-900/60 dark:bg-gray-900/70">
                  <div>
                    <h4 className="text-base font-semibold text-emerald-700 dark:text-emerald-300">تجهیزاتی که دارم</h4>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">مواردی را انتخاب کنید که اکنون در منزل بیمار موجود است.</p>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {HOME_MEDICAL_EQUIPMENT_OPTIONS.map((item) => (
                      <label key={`available-${item.id}`} className={checkboxCardClassName}>
                        <input
                          type="checkbox"
                          checked={(localData.availableHomeMedicalEquipment ?? []).includes(item.id)}
                          onChange={(event) => toggleEquipmentSelection('availableHomeMedicalEquipment', item.id, event.target.checked)}
                          className="w-5 h-5 text-emerald-600 rounded border-gray-300"
                        />
                        <span className="mr-3 text-gray-700 dark:text-gray-300 font-medium">{item.label}</span>
                      </label>
                    ))}
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">سایر تجهیزاتی که در منزل موجود است</label>
                    <textarea
                      name="otherAvailableHomeMedicalEquipment"
                      value={localData.otherAvailableHomeMedicalEquipment || ''}
                      onChange={handleChange}
                      rows={3}
                      className={inputClassName}
                      placeholder="مثلاً تخت برقی، دستگاه فشارسنج، ساکشن پرتابل و ..."
                    />
                  </div>
                </div>
              </div>
            </div>

          </div>
        );
      case 7:
        return (
          <div className="animate-in space-y-5 fade-in slide-in-from-right-4 duration-500 sm:space-y-6">
            <h2 className={sectionTitleClassName}>{assessmentSectionTitle}</h2>
            <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 md:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">سطح هوشیاری</label>
                <select name="elderlyAssessment.consciousnessLevel" value={localData.elderlyAssessment?.consciousnessLevel || ''} onChange={handleChange} className={inputClassName}>
                  <option value="">انتخاب کنید</option>
                  <option value="Alert">کاملاً هوشیار</option>
                  <option value="Lethargic">نیمه هوشیار (خواب‌آلوده)</option>
                  <option value="Coma">کما</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">خطر سقوط (Fall Risk)</label>
                <select name="elderlyAssessment.fallRisk" value={localData.elderlyAssessment?.fallRisk || ''} onChange={handleChange} className={inputClassName}>
                  <option value="">انتخاب کنید</option>
                  <option value="Low">کم</option>
                  <option value="Medium">متوسط</option>
                  <option value="High">زیاد</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">اختلال بلع</label>
                <select name="elderlyAssessment.swallowingDisorder" value={localData.elderlyAssessment?.swallowingDisorder || ''} onChange={handleChange} className={inputClassName}>
                  <option value="">انتخاب کنید</option>
                  <option value="None">ندارد</option>
                  <option value="Mild">خفیف (نیاز به غذای نرم)</option>
                  <option value="Severe">شدید (NGT/PEG)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">وضعیت تغذیه</label>
                <select name="elderlyAssessment.nutritionStatus" value={localData.elderlyAssessment?.nutritionStatus || ''} onChange={handleChange} className={inputClassName}>
                  <option value="">انتخاب کنید</option>
                  <option value="Good">خوب</option>
                  <option value="Fair">متوسط</option>
                  <option value="Poor">ضعیف</option>
                </select>
              </div>
              
              <div>
                <label className={checkboxCardClassName}>
                  <input type="checkbox" name="elderlyAssessment.hasUrinaryIncontinence" checked={localData.elderlyAssessment?.hasUrinaryIncontinence || false} onChange={handleChange} className="w-5 h-5 text-blue-600 rounded" />
                  <span className="text-gray-700 dark:text-gray-300">بی‌اختیاری ادرار</span>
                </label>
              </div>
              <div>
                <label className={checkboxCardClassName}>
                  <input type="checkbox" name="elderlyAssessment.hasFecalIncontinence" checked={localData.elderlyAssessment?.hasFecalIncontinence || false} onChange={handleChange} className="w-5 h-5 text-blue-600 rounded" />
                  <span className="text-gray-700 dark:text-gray-300">بی‌اختیاری مدفوع</span>
                </label>
              </div>
            </div>
          </div>
        );
      case 8:
        return (
          <div className="animate-in space-y-5 fade-in slide-in-from-right-4 duration-500 sm:space-y-6">
            <h2 className={sectionTitleClassName}>مدارک و فایل‌ها</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">لطفاً مدارک پزشکی و هویتی خود را جهت بررسی بهتر بارگذاری کنید. تصاویر به‌صورت هوشمند فشرده می‌شوند و برای هر نوع مدرک فقط یک فایل نگه داشته می‌شود.</p>
            
            <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 md:gap-6">
              {DOCUMENT_TYPES.map(doc => {
                const uploadedDocument = getUploadedDocument(doc.id);
                const isUploading = uploadingDocumentType === doc.id;

                return (
                <div key={doc.id} className="rounded-2xl border-2 border-dashed border-gray-300 p-5 text-center transition-colors hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800 sm:p-6">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                    <Upload className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">{doc.label}</h4>
                  <p className="text-xs text-gray-500 mb-3">هر مدرک فقط یک فایل. تصاویر با حفظ خوانایی به حدود ۲۰۰KB تا ۱MB و در صورت نیاز تا ۱.۵MB بهینه می‌شوند.</p>
                  <input
                    id={`document-upload-${doc.id}`}
                    type="file"
                    accept={ACCEPTED_FILE_TYPES}
                    className="hidden"
                    onChange={(e) => {
                      void handleDocumentSelect(doc.id, e.target.files);
                      e.currentTarget.value = '';
                    }}
                  />
                  <label
                    htmlFor={`document-upload-${doc.id}`}
                    className="inline-flex min-h-11 w-full cursor-pointer items-center justify-center rounded-xl border-2 border-teal-600 px-3 py-2 text-sm font-medium text-teal-600 transition-colors hover:bg-teal-50 sm:min-h-0 sm:w-auto sm:rounded-full sm:py-1.5"
                  >
                    {isUploading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        در حال بارگذاری...
                      </span>
                    ) : uploadedDocument ? (
                      'تعویض فایل'
                    ) : (
                      'انتخاب فایل'
                    )}
                  </label>
                  {uploadedDocument?.fileUrl && (
                    <div className="mt-3 space-y-2 text-xs">
                      <p className="text-green-600 dark:text-green-400">فایل با موفقیت بارگذاری شده است.</p>
                      <a
                        href={resolveApiUrl(uploadedDocument.fileUrl)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 font-medium text-blue-600 hover:underline"
                      >
                        <Save className="h-4 w-4" />
                        مشاهده فایل
                      </a>
                    </div>
                  )}
                </div>
              )})}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1">
        {renderStepContent()}
      </div>

      <div className="sticky bottom-0 mt-8 -mx-4 border-t border-gray-100 bg-white/95 px-4 pb-4 pt-4 backdrop-blur dark:border-gray-700 dark:bg-gray-800/95 sm:static sm:mx-0 sm:mt-10 sm:bg-transparent sm:px-0 sm:pb-0 sm:pt-6 sm:backdrop-blur-0 sm:dark:bg-transparent md:-mx-8 md:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button
            variant="outline"
            onClick={onPrev}
          disabled={currentStep === 1 || isSaving}
          className="flex h-11 w-full items-center justify-center rounded-xl sm:w-auto"
        >
          <ChevronRight className="w-4 h-4 ml-2" />
          مرحله قبل
        </Button>

        <div className="flex min-h-6 items-center justify-center text-center text-sm text-gray-500 sm:flex-1">
          {isSaving && (
            <span className="flex items-center">
              <Loader2 className="w-4 h-4 mr-2 animate-spin text-blue-600" />
              در حال ذخیره...
            </span>
          )}
        </div>

        <Button
          onClick={handleNextClick}
          disabled={isSaving}
          className="flex h-12 w-full items-center justify-center rounded-xl bg-blue-600 text-white hover:bg-blue-700 sm:h-11 sm:w-auto"
        >
          {currentStep === 8 ? 'تکمیل نهایی' : 'مرحله بعد'}
          {currentStep !== 8 && <ChevronLeft className="w-4 h-4 mr-2" />}
        </Button>
        </div>
      </div>
    </div>
  );
}
