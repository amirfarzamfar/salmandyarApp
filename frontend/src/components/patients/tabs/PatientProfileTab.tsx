'use client';

import React from 'react';
import { PatientProfileService, PatientProfileDto } from '@/services/patient-profile.service';
import { Loader2, Activity, AlertCircle, FileText, Upload, Heart, Phone, Edit, User, Stethoscope, BrainCircuit, ShieldAlert } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { resolveApiUrl } from '@/lib/network';
import DateObject from "react-date-object";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import Link from 'next/link';
import { useUser } from '@/components/auth/UserContext';
import { useQuery } from '@tanstack/react-query';

interface Props {
  userId?: string;
  editHref?: string;
}

const maritalStatusLabels: Record<string, string> = {
  Single: 'مجرد',
  Married: 'متاهل',
  Widowed: 'همسر فوت شده',
  Divorced: 'مطلقه',
};

const genderLabels: Record<string, string> = {
  Male: 'مرد',
  Female: 'زن',
  Other: 'سایر',
};

const documentTypeLabels: Record<string, string> = {
  NationalId: 'کارت ملی / شناسنامه',
  Insurance: 'دفترچه بیمه',
  LabTest: 'آزمایش',
  CT_MRI: 'تصویربرداری (CT/MRI)',
  Prescription: 'نسخه پزشک',
};

const relationshipLabels: Record<string, string> = {
  Spouse: 'همسر',
  Child: 'فرزند',
  Sibling: 'خواهر/برادر',
  Parent: 'پدر/مادر',
  Friend: 'دوست',
  Other: 'سایر',
};

const mobilityStatusLabels: Record<string, string> = {
  Independent: 'مستقل',
  NeedsAssistance: 'نیاز به کمک',
  Bedridden: 'بستری (بدون حرکت)',
};

const consciousnessLabels: Record<string, string> = {
  Alert: 'کاملاً هوشیار',
  Lethargic: 'نیمه هوشیار (خواب‌آلوده)',
  Stupor: 'نیمه هوشیار (خواب‌آلوده)',
  Coma: 'کما',
};

const fallRiskLabels: Record<string, string> = {
  Low: 'پایین',
  Medium: 'متوسط',
  High: 'بالا',
};

const swallowingLabels: Record<string, string> = {
  None: 'ندارد',
  Mild: 'خفیف (نیاز به غذای نرم)',
  Severe: 'شدید (NGT/PEG)',
};

const nutritionLabels: Record<string, string> = {
  Good: 'خوب',
  Fair: 'متوسط',
  Poor: 'ضعیف',
};
const homeMedicalEquipmentLabels: Record<string, string> = {
  oxygen_concentrator: 'اکسیژن‌ساز',
  oxygen_cylinder: 'کپسول اکسیژن',
  suction_machine: 'ساکشن',
  nebulizer: 'نبولایزر',
  pulse_oximeter: 'پالس اکسیمتر',
  hospital_bed: 'تخت بیمارستانی',
  anti_bedsore_mattress: 'تشک مواج',
  wheelchair: 'ویلچر',
  walker: 'واکر',
  ventilator: 'ونتیلاتور',
};
const totalProfileSteps = 8;

export default function PatientProfileTab({ userId, editHref }: Props) {
  const { user } = useUser();
  const canEditProfile = ['Admin', 'SuperAdmin', 'Manager', 'Supervisor', 'Nurse'].includes(user?.role || '');
  const isOwnProfile = !!user?.id && userId === user.id;
  const assessmentSectionTitle = user?.role === 'Patient' ? 'بیمار' : 'سالمند';
  const resolvedEditHref = editHref ?? (userId ? `/portal/profile-wizard?userId=${userId}` : null);

  const { data: profile, isLoading: loading, error } = useQuery<PatientProfileDto>({
    queryKey: ['patientProfile', isOwnProfile ? 'me' : userId],
    queryFn: () => {
      if (isOwnProfile) {
        return PatientProfileService.getMyProfile();
      }

      if (!userId) {
        throw new Error('شناسه کاربری یافت نشد.');
      }

      return PatientProfileService.getUserProfile(userId);
    },
    enabled: isOwnProfile || !!userId,
    retry: false,
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-3">
        <AlertCircle className="w-5 h-5" />
        <p>{error instanceof Error ? error.message : 'خطا در بارگذاری پروفایل.'}</p>
      </div>
    );
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      const parsedDate = new Date(dateString);
      if (Number.isNaN(parsedDate.getTime())) {
        return dateString;
      }

      const safeDate = new Date(Date.UTC(
        parsedDate.getUTCFullYear(),
        parsedDate.getUTCMonth(),
        parsedDate.getUTCDate(),
        12
      ));

      return new DateObject(safeDate).convert(persian, persian_fa).format("YYYY/MM/DD");
    } catch {
      return dateString;
    }
  };

  const formatEnumLabel = (value: string | undefined, labels: Record<string, string>) => {
    if (!value) return '-';
    return labels[value] ?? value;
  };
  const renderEquipmentBadges = (items?: string[], tone: 'amber' | 'emerald' = 'emerald') => {
    if (!items || items.length === 0) {
      return <span className="font-medium text-gray-500">-</span>;
    }

    const badgeClassName = tone === 'amber'
      ? 'border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100'
      : 'border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100';

    return (
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <Badge key={`${tone}-${item}`} variant="outline" className={badgeClassName}>
            {homeMedicalEquipmentLabels[item] ?? item}
          </Badge>
        ))}
      </div>
    );
  };
  const displayCurrentStep = Math.min(Math.max(profile.currentStep || 1, 1), totalProfileSteps);

  return (
    <div className="space-y-6">
      {/* Completion Status */}
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-6 items-center justify-between">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <h3 className="text-lg font-bold text-gray-900">وضعیت تکمیل پرونده</h3>
            {canEditProfile && resolvedEditHref && (
              <Link href={resolvedEditHref}>
                <button className="flex items-center gap-1 text-sm bg-teal-50 text-teal-600 px-3 py-1.5 rounded-lg hover:bg-teal-100 transition-colors">
                  <Edit className="w-4 h-4" /> ویرایش
                </button>
              </Link>
            )}
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-500">
              {profile.isCompleted ? 'پرونده کاملاً تکمیل شده است.' : 'پرونده در حال تکمیل است.'}
            </p>
            {profile.lastUpdatedAt && (
              <p className="text-xs text-gray-400">
                آخرین ویرایش: {formatDate(profile.lastUpdatedAt)}
                {profile.lastUpdatedByName && ` توسط ${profile.lastUpdatedByName}`}
              </p>
            )}
          </div>
        </div>
        <div className="flex-1 w-full max-w-md">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium text-teal-600">{profile.completionPercentage}% تکمیل شده</span>
            <span className="text-gray-400">مرحله {displayCurrentStep} از {totalProfileSteps}</span>
          </div>
          <Progress value={profile.completionPercentage} className="h-2" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Info */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h4 className="text-md font-bold text-gray-900 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-teal-500" /> اطلاعات هویتی
          </h4>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between border-b pb-2 border-gray-50">
              <span className="text-gray-500">کد ملی:</span>
              <span className="font-medium">{profile.nationalCode || '-'}</span>
            </div>
            <div className="flex justify-between border-b pb-2 border-gray-50">
              <span className="text-gray-500">جنسیت:</span>
              <span className="font-medium">{formatEnumLabel(profile.gender, genderLabels)}</span>
            </div>
            <div className="flex justify-between border-b pb-2 border-gray-50">
              <span className="text-gray-500">تاریخ تولد:</span>
              <span className="font-medium">{formatDate(profile.dateOfBirth)}</span>
            </div>
            <div className="flex justify-between border-b pb-2 border-gray-50">
              <span className="text-gray-500">نام پدر:</span>
              <span className="font-medium">{profile.fatherName || '-'}</span>
            </div>
            <div className="flex justify-between border-b pb-2 border-gray-50">
              <span className="text-gray-500">وضعیت تأهل:</span>
              <span className="font-medium">{formatEnumLabel(profile.maritalStatus, maritalStatusLabels)}</span>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h4 className="text-md font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Phone className="w-5 h-5 text-teal-500" /> اطلاعات تماس
          </h4>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between border-b pb-2 border-gray-50">
              <span className="text-gray-500">موبایل:</span>
              <span className="font-medium" dir="ltr">{profile.mobileNumber || '-'}</span>
            </div>
            {profile.emergencyContact && (
              <>
                <div className="flex justify-between border-b pb-2 border-gray-50">
                  <span className="text-gray-500">فرد اضطراری:</span>
                  <span className="font-medium">{profile.emergencyContact.name || '-'} ({formatEnumLabel(profile.emergencyContact.relationship, relationshipLabels)})</span>
                </div>
                <div className="flex justify-between border-b pb-2 border-gray-50">
                  <span className="text-gray-500">تماس اضطراری:</span>
                  <span className="font-medium" dir="ltr">{profile.emergencyContact.phoneNumber || '-'}</span>
                </div>
              </>
            )}
            {profile.address && (
              <div className="pt-2">
                <span className="text-gray-500 block mb-1">آدرس کامل:</span>
                <span className="font-medium leading-relaxed">{profile.address.state} - {profile.address.city} - {profile.address.fullAddress}</span>
              </div>
            )}
          </div>
        </div>

        {/* Physical & Mobility */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h4 className="text-md font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-teal-500" /> اطلاعات فیزیکی
          </h4>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between border-b pb-2 border-gray-50">
              <span className="text-gray-500">قد / وزن:</span>
              <span className="font-medium">{profile.height ? `${profile.height} سانتی‌متر` : '-'} / {profile.weight ? `${profile.weight} کیلوگرم` : '-'}</span>
            </div>
            <div className="flex justify-between border-b pb-2 border-gray-50">
              <span className="text-gray-500">گروه خونی:</span>
              <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50">{profile.bloodGroup || '-'}</Badge>
            </div>
            <div className="flex justify-between border-b pb-2 border-gray-50">
              <span className="text-gray-500">وضعیت حرکتی:</span>
              <span className="font-medium">{formatEnumLabel(profile.mobilityStatus, mobilityStatusLabels)}</span>
            </div>
            <div className="flex justify-between border-b pb-2 border-gray-50">
              <span className="text-gray-500">توانایی راه رفتن:</span>
              <span className="font-medium">{profile.walkingAbility || '-'}</span>
            </div>
            <div className="flex gap-2 pt-2">
              {profile.usesWheelchair && <Badge>استفاده از ویلچر</Badge>}
              {profile.usesWalker && <Badge>استفاده از واکر</Badge>}
            </div>
          </div>
        </div>

        {/* Medical History */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h4 className="text-md font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Heart className="w-5 h-5 text-teal-500" /> سوابق پزشکی
          </h4>
          <div className="flex flex-wrap gap-2 mb-4">
            {profile.medicalHistory?.hasDiabetes && <Badge className="bg-red-100 text-red-800 border-red-200 hover:bg-red-200">دیابت</Badge>}
            {profile.medicalHistory?.hasHypertension && <Badge className="bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200">فشار خون</Badge>}
            {profile.medicalHistory?.hasHeartDisease && <Badge className="bg-red-100 text-red-800 border-red-200 hover:bg-red-200">بیماری قلبی</Badge>}
            {profile.medicalHistory?.hasCOPD && <Badge variant="secondary">COPD</Badge>}
            {profile.medicalHistory?.hasAsthma && <Badge variant="secondary">آسم</Badge>}
            {profile.medicalHistory?.hasKidneyFailure && <Badge variant="secondary">نارسایی کلیه</Badge>}
            {profile.medicalHistory?.hasStroke && <Badge className="bg-red-100 text-red-800 border-red-200 hover:bg-red-200">سکته مغزی</Badge>}
            {profile.medicalHistory?.hasAlzheimers && <Badge className="bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200">آلزایمر</Badge>}
            {profile.medicalHistory?.hasParkinsons && <Badge variant="secondary">پارکینسون</Badge>}
            {profile.medicalHistory?.hasCancer && <Badge className="bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200">سرطان</Badge>}
            {profile.medicalHistory?.hasPsychiatricDisorders && <Badge variant="secondary">بیماری‌های روانپزشکی</Badge>}
          </div>
          {profile.medicalHistory?.otherDiseases && (
            <div className="text-sm border-t pt-2 border-gray-50">
              <span className="text-gray-500 block mb-1">سایر بیماری‌ها:</span>
              <span className="font-medium">{profile.medicalHistory.otherDiseases}</span>
            </div>
          )}
        </div>

        {/* Treatment Info */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h4 className="text-md font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-teal-500" /> اطلاعات درمانی و تجهیزات
          </h4>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between border-b pb-2 border-gray-50">
              <span className="text-gray-500">پزشک معالج:</span>
              <span className="font-medium">{profile.attendingPhysician || '-'} {profile.physicianPhone ? `(${profile.physicianPhone})` : ''}</span>
            </div>
            <div className="flex justify-between border-b pb-2 border-gray-50">
              <span className="text-gray-500">بیمارستان قبلی:</span>
              <span className="font-medium">{profile.previousHospital || '-'}</span>
            </div>
            <div className="flex justify-between border-b pb-2 border-gray-50">
              <span className="text-gray-500">سابقه بستری:</span>
              <span className="font-medium">{profile.hospitalizationHistory || '-'}</span>
            </div>
            <div className="flex justify-between border-b pb-2 border-gray-50">
              <span className="text-gray-500">سابقه جراحی:</span>
              <span className="font-medium">{profile.surgeryHistory || '-'}</span>
            </div>

            <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/70 p-4 space-y-4">
              <div>
                <span className="mb-2 block text-gray-500">تجهیزات مورد نیاز:</span>
                {renderEquipmentBadges(profile.neededHomeMedicalEquipment, 'amber')}
              </div>
              <div className="flex justify-between border-b pb-2 border-gray-100">
                <span className="text-gray-500">سایر تجهیزات مورد نیاز:</span>
                <span className="font-medium text-left">{profile.otherNeededHomeMedicalEquipment || '-'}</span>
              </div>
              <div>
                <span className="mb-2 block text-gray-500">تجهیزات موجود در منزل:</span>
                {renderEquipmentBadges(profile.availableHomeMedicalEquipment, 'emerald')}
              </div>
              <div className="flex justify-between border-b pb-2 border-gray-100">
                <span className="text-gray-500">سایر تجهیزات موجود:</span>
                <span className="font-medium text-left">{profile.otherAvailableHomeMedicalEquipment || '-'}</span>
              </div>
            </div>

          </div>
        </div>

        {/* Elderly Assessment */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h4 className="text-md font-bold text-gray-900 mb-4 flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-teal-500" /> {assessmentSectionTitle}
          </h4>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between border-b pb-2 border-gray-50">
              <span className="text-gray-500">سطح هوشیاری:</span>
              <span className="font-medium">{formatEnumLabel(profile.elderlyAssessment?.consciousnessLevel, consciousnessLabels)}</span>
            </div>
            <div className="flex justify-between border-b pb-2 border-gray-50">
              <span className="text-gray-500">خطر سقوط:</span>
              {profile.elderlyAssessment?.fallRisk === 'High' ? (
                <Badge className="bg-red-100 text-red-800 hover:bg-red-200 border-red-200">بالا (هشدار)</Badge>
              ) : (
                <span className="font-medium">{formatEnumLabel(profile.elderlyAssessment?.fallRisk, fallRiskLabels)}</span>
              )}
            </div>
            <div className="flex justify-between border-b pb-2 border-gray-50">
              <span className="text-gray-500">وضعیت بلع:</span>
              <span className="font-medium">{formatEnumLabel(profile.elderlyAssessment?.swallowingDisorder, swallowingLabels)}</span>
            </div>
            <div className="flex justify-between border-b pb-2 border-gray-50">
              <span className="text-gray-500">وضعیت تغذیه:</span>
              <span className="font-medium">{formatEnumLabel(profile.elderlyAssessment?.nutritionStatus, nutritionLabels)}</span>
            </div>
            <div className="flex gap-2 pt-2">
              {profile.elderlyAssessment?.hasUrinaryIncontinence && <Badge variant="outline" className="border-orange-200 text-orange-800 bg-orange-50">بی‌اختیاری ادرار</Badge>}
              {profile.elderlyAssessment?.hasFecalIncontinence && <Badge variant="outline" className="border-orange-200 text-orange-800 bg-orange-50">بی‌اختیاری مدفوع</Badge>}
            </div>
          </div>
        </div>

        {/* Allergies */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm md:col-span-2">
          <h4 className="text-md font-bold text-gray-900 mb-4 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-teal-500" /> حساسیت‌ها (آلرژی)
          </h4>
          {profile.allergies && profile.allergies.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {profile.allergies.map((allergy, idx) => (
                <div key={idx} className="bg-red-50 border border-red-100 rounded-lg p-3 min-w-[200px]">
                  <p className="font-bold text-red-700 text-sm mb-1">{allergy.allergyType}</p>
                  <p className="text-xs text-red-600">{allergy.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">حساسیت ثبت نشده است.</p>
          )}
        </div>
      </div>

      {/* Documents */}
      {profile.documents && profile.documents.length > 0 && (
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h4 className="text-md font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-teal-500" /> مدارک آپلود شده
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {profile.documents.map((doc, idx) => (
              <a 
                key={idx} 
                href={resolveApiUrl(doc.fileUrl)} 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Upload className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-teal-600 truncate">{formatEnumLabel(doc.documentType, documentTypeLabels)}</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
