"use client";

import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Swal from 'sweetalert2';
import { toast } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import { PatientProfileDto, PatientProfileService } from '@/services/patient-profile.service';
import ProfileWizardSteps from '@/components/profile-wizard/ProfileWizardSteps';
import ProfileWizardProgress from '@/components/profile-wizard/ProfileWizardProgress';
import { PageHeader } from '@/components/navigation/PageHeader';
import type { BreadcrumbItem } from '@/components/navigation/panel-navigation';

// #region debug-point A:wizard-state
const reportProfileWizardDebug = (hypothesisId: string, msg: string, data?: unknown) =>
  fetch('http://127.0.0.1:7778/event', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId: 'profile-edit-403',
      runId: 'pre-fix',
      hypothesisId,
      location: 'ProfileWizardPageContent.tsx',
      msg: `[DEBUG] ${msg}`,
      data,
      ts: Date.now(),
    }),
  }).catch(() => {});
// #endregion

type ProfileWizardPageContentProps = {
  adminBackHref?: string;
  adminBackLabel?: string;
  adminBreadcrumbs?: BreadcrumbItem[];
  adminCompleteRedirectHref?: string;
  adminCompleteConfirmButtonText?: string;
  portalBackHref?: string;
  portalBackLabel?: string;
  portalBreadcrumbs?: BreadcrumbItem[];
};

function ProfileWizardPageInner({
  adminBackHref = '/dashboard/admin/users',
  adminBackLabel = 'بازگشت به مدیریت کاربران',
  adminBreadcrumbs = [],
  adminCompleteRedirectHref,
  adminCompleteConfirmButtonText = 'بازگشت به پنل',
  portalBackHref = '/portal/profile',
  portalBackLabel = 'بازگشت به پروفایل',
  portalBreadcrumbs = [],
}: ProfileWizardPageContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const adminUserId = searchParams.get('userId');
  const isAdminEdit = Boolean(adminUserId);
  const autoSaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastAutoSavedSnapshotRef = useRef<string | null>(null);

  const [draftCurrentStep, setDraftCurrentStep] = useState<number | null>(null);
  const [draftFormData, setDraftFormData] = useState<Partial<PatientProfileDto> | null>(null);
  const totalSteps = 8;

  const clampStep = (step?: number) => {
    if (!step || step < 1) return 1;
    return Math.min(step, totalSteps);
  };

  const backHref = isAdminEdit ? adminBackHref : portalBackHref;
  const backLabel = isAdminEdit ? adminBackLabel : portalBackLabel;
  const breadcrumbs = isAdminEdit ? adminBreadcrumbs : portalBreadcrumbs;
  const completeRedirectHref = isAdminEdit
    ? (adminCompleteRedirectHref ?? adminBackHref)
    : portalBackHref;
  const completeConfirmButtonText = isAdminEdit
    ? adminCompleteConfirmButtonText
    : 'ورود به پورتال';

  const { data: profileStatus, isLoading: statusLoading } = useQuery({
    queryKey: ['profileStatus', adminUserId],
    queryFn: () =>
      adminUserId
        ? PatientProfileService.getUserProfile(adminUserId)
            .then((p) => ({
              hasProfile: !!p,
              isCompleted: p?.isCompleted ?? false,
              completionPercentage: p?.completionPercentage ?? 0,
              currentStep: p?.currentStep ?? 0,
            }))
            .catch(() => ({
              hasProfile: false,
              isCompleted: false,
              completionPercentage: 0,
              currentStep: 0,
            }))
        : PatientProfileService.getMyProfileStatus(),
  });

  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ['myProfile', adminUserId],
    queryFn: () =>
      adminUserId
        ? PatientProfileService.getUserProfile(adminUserId)
        : PatientProfileService.getMyProfile(),
    enabled: !!profileStatus?.hasProfile,
  });

  const currentStep = useMemo(() => (
    draftCurrentStep ?? (
      profileData?.currentStep && profileData.currentStep > 0 && !profileData.isCompleted
        ? clampStep(profileData.currentStep)
        : 1
    )
  ), [draftCurrentStep, profileData]);

  const formData = useMemo(
    () => draftFormData ?? profileData ?? {},
    [draftFormData, profileData]
  );

  useEffect(() => {
    if (!profileData) return;

    void reportProfileWizardDebug('A', 'profile data loaded into wizard', {
      adminUserId,
      profileUserId: profileData.userId ?? null,
      currentStep: profileData.currentStep ?? null,
      isCompleted: profileData.isCompleted ?? null,
    });
  }, [adminUserId, profileData]);

  const updateMutation = useMutation({
    mutationFn: (data: Partial<PatientProfileDto>) =>
      adminUserId
        ? PatientProfileService.updateUserProfile(adminUserId, data)
        : PatientProfileService.updateMyProfile(data),
    onSuccess: async () => {
      void reportProfileWizardDebug('C', 'explicit profile update succeeded', {
        adminUserId,
        currentStep,
      });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['myProfile', adminUserId] }),
        queryClient.invalidateQueries({ queryKey: ['profileStatus', adminUserId] }),
        queryClient.invalidateQueries({ queryKey: ['patientProfile', adminUserId ?? 'me'] }),
      ]);
      toast.success('اطلاعات با موفقیت ذخیره شد');
    },
    onError: (error) => {
      void reportProfileWizardDebug('C', 'explicit profile update failed', {
        adminUserId,
        currentStep,
        error: error instanceof Error ? error.message : String(error),
      });
      toast.error('خطا در ذخیره اطلاعات');
    }
  });

  const completeMutation = useMutation({
    mutationFn: () =>
      adminUserId
        ? PatientProfileService.updateUserProfile(adminUserId, { ...formData, isCompleted: true, completionPercentage: 100 })
        : PatientProfileService.completeMyProfile(),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['myProfile', adminUserId] }),
        queryClient.invalidateQueries({ queryKey: ['profileStatus', adminUserId] }),
        queryClient.invalidateQueries({ queryKey: ['patientProfile', adminUserId ?? 'me'] }),
      ]);
      Swal.fire({
        title: 'تبریک!',
        text: 'پروفایل با موفقیت تکمیل شد.',
        icon: 'success',
        confirmButtonText: completeConfirmButtonText,
        confirmButtonColor: '#3b82f6',
      }).then(() => {
        router.push(completeRedirectHref);
      });
    }
  });

  const draftMutation = useMutation({
    mutationFn: (data: Partial<PatientProfileDto>) =>
      adminUserId
        ? PatientProfileService.updateUserProfile(adminUserId, data)
        : PatientProfileService.updateMyProfile(data),
  });

  useEffect(() => {
    void reportProfileWizardDebug('A', 'wizard render state snapshot', {
      adminUserId,
      currentStep,
      formUserId: formData.userId ?? null,
      hasDateOfBirth: Boolean(formData.dateOfBirth),
    });
  }, [adminUserId, currentStep, formData.userId, formData.dateOfBirth]);

  useEffect(() => {
    if (currentStep !== 6) {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
        autoSaveTimeoutRef.current = null;
      }
      lastAutoSavedSnapshotRef.current = null;
      return;
    }

    const snapshot = JSON.stringify({
      needed: formData.neededHomeMedicalEquipment ?? [],
      available: formData.availableHomeMedicalEquipment ?? [],
      otherNeeded: formData.otherNeededHomeMedicalEquipment ?? '',
      otherAvailable: formData.otherAvailableHomeMedicalEquipment ?? '',
    });

    if (lastAutoSavedSnapshotRef.current === null) {
      lastAutoSavedSnapshotRef.current = snapshot;
      return;
    }

    if (snapshot === lastAutoSavedSnapshotRef.current) return;
    if (draftMutation.isPending || updateMutation.isPending || completeMutation.isPending) return;

    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    autoSaveTimeoutRef.current = setTimeout(async () => {
      try {
        await draftMutation.mutateAsync({ ...formData, currentStep });
        lastAutoSavedSnapshotRef.current = snapshot;
      } catch {
        // Silent auto-save failure (explicit saves still show toast via updateMutation)
      }
    }, 800);

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
        autoSaveTimeoutRef.current = null;
      }
    };
  }, [
    currentStep,
    formData,
    formData.neededHomeMedicalEquipment,
    formData.availableHomeMedicalEquipment,
    formData.otherNeededHomeMedicalEquipment,
    formData.otherAvailableHomeMedicalEquipment,
    draftMutation,
    draftMutation.isPending,
    updateMutation.isPending,
    completeMutation.isPending,
  ]);

  const handleNext = async (stepData: Partial<PatientProfileDto>) => {
    const nextStep = clampStep(currentStep + 1);
    const newData = { ...formData, ...stepData, currentStep: nextStep };
    setDraftFormData(newData);

    const savedProfile = await updateMutation.mutateAsync(newData);
    setDraftFormData(savedProfile);

    if (currentStep < totalSteps) {
      setDraftCurrentStep(nextStep);
    } else {
      await completeMutation.mutateAsync();
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setDraftCurrentStep(currentStep - 1);
    }
  };

  if (statusLoading || (profileStatus?.hasProfile && profileLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 px-3 py-4 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 sm:px-6 sm:py-6 lg:px-8 lg:py-8" dir="rtl">
      <div className="mx-auto max-w-4xl">
        <div className="mb-4 rounded-3xl border border-blue-100 bg-white/90 p-4 text-center shadow-sm backdrop-blur dark:border-gray-800 dark:bg-gray-900/80 sm:mb-6 sm:p-6">
          <PageHeader
            title={isAdminEdit ? 'ویرایش پروفایل درمانی' : 'تکمیل پروفایل درمانی'}
            description="برای دریافت خدمات بهتر، لطفاً اطلاعات زیر را با دقت تکمیل کنید."
            backHref={backHref}
            backLabel={backLabel}
            breadcrumbs={breadcrumbs}
            className="mb-0"
          />
        </div>

        <div className="mb-4 rounded-3xl border border-gray-100 bg-white/90 p-4 shadow-sm backdrop-blur dark:border-gray-800 dark:bg-gray-900/80 sm:mb-6 sm:p-5">
          <ProfileWizardProgress currentStep={currentStep} totalSteps={totalSteps} />
        </div>

        <div className="overflow-hidden rounded-[28px] border border-gray-100 bg-white shadow-xl shadow-slate-200/50 dark:border-gray-800 dark:bg-gray-800 dark:shadow-none">
          <div className="p-4 sm:p-6 md:p-8">
            <ProfileWizardSteps
              currentStep={currentStep}
              formData={formData}
              onNext={handleNext}
              onPrev={handlePrev}
              isSaving={updateMutation.isPending || completeMutation.isPending}
              adminUserId={adminUserId}
              onDraftChange={(draft) => {
                void reportProfileWizardDebug('A', 'onDraftChange invoked from ProfileWizardSteps', {
                  adminUserId,
                  currentStep,
                  draftUserId: draft.userId ?? null,
                  hasDateOfBirth: Boolean(draft.dateOfBirth),
                });
                setDraftFormData(draft);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProfileWizardPageContent(props: ProfileWizardPageContentProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      }
    >
      <ProfileWizardPageInner {...props} />
    </Suspense>
  );
}
