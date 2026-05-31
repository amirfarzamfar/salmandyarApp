'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PatientProfileService, PatientProfileDto } from '@/services/patient-profile.service';
import ProfileWizardSteps from '@/components/profile-wizard/ProfileWizardSteps';
import ProfileWizardProgress from '@/components/profile-wizard/ProfileWizardProgress';
import { Loader2 } from 'lucide-react';
import Swal from 'sweetalert2';
import { toast } from 'react-hot-toast';

function WizardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const adminUserId = searchParams.get('userId');
  const autoSaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastAutoSavedSnapshotRef = useRef<string | null>(null);
  
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<PatientProfileDto>>({});
  const totalSteps = 8;
  const clampStep = (step?: number) => {
    if (!step || step < 1) return 1;
    return Math.min(step, totalSteps);
  };

  const { data: profileStatus, isLoading: statusLoading } = useQuery({
    queryKey: ['profileStatus', adminUserId],
    queryFn: () => adminUserId ? PatientProfileService.getUserProfile(adminUserId).then(p => ({
      hasProfile: !!p,
      isCompleted: p?.isCompleted ?? false,
      completionPercentage: p?.completionPercentage ?? 0,
      currentStep: p?.currentStep ?? 0
    })).catch(() => ({ hasProfile: false, isCompleted: false, completionPercentage: 0, currentStep: 0 })) 
    : PatientProfileService.getMyProfileStatus(),
  });

  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ['myProfile', adminUserId],
    queryFn: () => adminUserId ? PatientProfileService.getUserProfile(adminUserId) : PatientProfileService.getMyProfile(),
    enabled: !!profileStatus?.hasProfile,
  });

  useEffect(() => {
    if (profileData) {
      setFormData(profileData);
      if (profileData.currentStep && profileData.currentStep > 0 && !profileData.isCompleted) {
        setCurrentStep(clampStep(profileData.currentStep));
      }
    }
  }, [profileData]);

  const updateMutation = useMutation({
    mutationFn: (data: Partial<PatientProfileDto>) => adminUserId ? PatientProfileService.updateUserProfile(adminUserId, data) : PatientProfileService.updateMyProfile(data),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['myProfile', adminUserId] }),
        queryClient.invalidateQueries({ queryKey: ['profileStatus', adminUserId] }),
        queryClient.invalidateQueries({ queryKey: ['patientProfile', adminUserId ?? 'me'] }),
      ]);
      toast.success('اطلاعات با موفقیت ذخیره شد');
    },
    onError: () => {
      toast.error('خطا در ذخیره اطلاعات');
    }
  });

  const completeMutation = useMutation({
    mutationFn: () => adminUserId ? PatientProfileService.updateUserProfile(adminUserId, { ...formData, isCompleted: true, completionPercentage: 100 }) : PatientProfileService.completeMyProfile(),
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
        confirmButtonText: adminUserId ? 'بازگشت به پنل' : 'ورود به پورتال',
        confirmButtonColor: '#3b82f6',
      }).then(() => {
        if (adminUserId) {
          router.back();
        } else {
          router.push('/portal');
        }
      });
    }
  });

  const draftMutation = useMutation({
    mutationFn: (data: Partial<PatientProfileDto>) => adminUserId
      ? PatientProfileService.updateUserProfile(adminUserId, data)
      : PatientProfileService.updateMyProfile(data),
  });

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
    formData.neededHomeMedicalEquipment,
    formData.availableHomeMedicalEquipment,
    formData.otherNeededHomeMedicalEquipment,
    formData.otherAvailableHomeMedicalEquipment,
    draftMutation.isPending,
    updateMutation.isPending,
    completeMutation.isPending,
  ]);

  const handleNext = async (stepData: Partial<PatientProfileDto>) => {
    const nextStep = clampStep(currentStep + 1);
    const newData = { ...formData, ...stepData, currentStep: nextStep };
    setFormData(newData);
    
    // Auto-save
    const savedProfile = await updateMutation.mutateAsync(newData);
    setFormData(savedProfile);
    
    if (currentStep < totalSteps) {
      setCurrentStep(nextStep);
    } else {
      await completeMutation.mutateAsync();
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
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
          <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
            {adminUserId ? 'ویرایش پروفایل درمانی' : 'تکمیل پروفایل درمانی'}
          </h1>
          <p className="mx-auto max-w-2xl text-sm leading-7 text-gray-600 dark:text-gray-400 sm:text-base">
            برای دریافت خدمات بهتر، لطفاً اطلاعات زیر را با دقت تکمیل کنید.
          </p>
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
              onDraftChange={setFormData}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProfileWizardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    }>
      <WizardContent />
    </Suspense>
  );
}
