'use client';

import React from 'react';
import { PatientProfileService, PatientProfileDto } from '@/services/patient-profile.service';
import { Loader2, Activity, AlertCircle, FileText, Upload, Heart, Phone, Edit, User } from 'lucide-react';
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
}

const maritalStatusLabels: Record<string, string> = {
  Single: 'مجرد',
  Married: 'متاهل',
  Widowed: 'همسر فوت شده',
  Divorced: 'مطلقه',
};

const mobilityStatusLabels: Record<string, string> = {
  Independent: 'مستقل',
  NeedsAssistance: 'نیاز به کمک',
  Bedridden: 'بستری (بدون حرکت)',
};
const totalProfileSteps = 8;

export default function PatientProfileTab({ userId }: Props) {
  const { user } = useUser();
  const isAdminOrNurse = user?.role === 'Admin' || user?.role === 'Nurse';
  const isOwnProfile = !!user?.id && userId === user.id;

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
  const displayCurrentStep = Math.min(Math.max(profile.currentStep || 1, 1), totalProfileSteps);

  return (
    <div className="space-y-6">
      {/* Completion Status */}
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-6 items-center justify-between">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <h3 className="text-lg font-bold text-gray-900">وضعیت تکمیل پرونده</h3>
            {isAdminOrNurse && userId && (
              <Link href={`/portal/profile-wizard?userId=${userId}`}>
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
                آخرین بروزرسانی: {formatDate(profile.lastUpdatedAt)}
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
              <span className="font-medium">{profile.gender || '-'}</span>
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
                  <span className="font-medium">{profile.emergencyContact.name || '-'} ({profile.emergencyContact.relationship})</span>
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
              <span className="font-medium">{profile.height ? `${profile.height} cm` : '-'} / {profile.weight ? `${profile.weight} kg` : '-'}</span>
            </div>
            <div className="flex justify-between border-b pb-2 border-gray-50">
              <span className="text-gray-500">گروه خونی:</span>
              <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50">{profile.bloodGroup || '-'}</Badge>
            </div>
            <div className="flex justify-between border-b pb-2 border-gray-50">
              <span className="text-gray-500">وضعیت حرکتی:</span>
              <span className="font-medium">{formatEnumLabel(profile.mobilityStatus, mobilityStatusLabels)}</span>
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
            {profile.medicalHistory?.hasDiabetes && <Badge variant="secondary">دیابت</Badge>}
            {profile.medicalHistory?.hasHypertension && <Badge variant="secondary">فشار خون</Badge>}
            {profile.medicalHistory?.hasHeartDisease && <Badge variant="secondary">بیماری قلبی</Badge>}
            {profile.medicalHistory?.hasCOPD && <Badge variant="secondary">COPD</Badge>}
            {profile.medicalHistory?.hasAsthma && <Badge variant="secondary">آسم</Badge>}
            {profile.medicalHistory?.hasKidneyFailure && <Badge variant="secondary">نارسایی کلیه</Badge>}
            {profile.medicalHistory?.hasStroke && <Badge variant="secondary">سکته مغزی</Badge>}
            {profile.medicalHistory?.hasAlzheimers && <Badge variant="secondary">آلزایمر</Badge>}
            {profile.medicalHistory?.hasParkinsons && <Badge variant="secondary">پارکینسون</Badge>}
            {profile.medicalHistory?.hasCancer && <Badge variant="secondary">سرطان</Badge>}
          </div>
          {profile.medicalHistory?.otherDiseases && (
            <div className="text-sm">
              <span className="text-gray-500 block mb-1">سایر بیماری‌ها:</span>
              <span className="font-medium">{profile.medicalHistory.otherDiseases}</span>
            </div>
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
                <span className="text-sm font-medium text-teal-600 truncate">{doc.documentType}</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
