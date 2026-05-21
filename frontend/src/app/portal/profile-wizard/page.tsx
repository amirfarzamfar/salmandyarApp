'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { PatientProfileService, PatientProfileDto } from '@/services/patient-profile.service';
import ProfileWizardSteps from '@/components/profile-wizard/ProfileWizardSteps';
import ProfileWizardProgress from '@/components/profile-wizard/ProfileWizardProgress';
import { Loader2 } from 'lucide-react';
import Swal from 'sweetalert2';
import { toast } from 'react-hot-toast';

function WizardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const adminUserId = searchParams.get('userId');
  
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<PatientProfileDto>>({});
  const totalSteps = 8;

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
        setCurrentStep(profileData.currentStep);
      }
    }
  }, [profileData]);

  const updateMutation = useMutation({
    mutationFn: (data: Partial<PatientProfileDto>) => adminUserId ? PatientProfileService.updateUserProfile(adminUserId, data) : PatientProfileService.updateMyProfile(data),
    onSuccess: () => {
      toast.success('اطلاعات با موفقیت ذخیره شد');
    },
    onError: () => {
      toast.error('خطا در ذخیره اطلاعات');
    }
  });

  const completeMutation = useMutation({
    mutationFn: () => adminUserId ? PatientProfileService.updateUserProfile(adminUserId, { ...formData, isCompleted: true, completionPercentage: 100 }) : PatientProfileService.completeMyProfile(),
    onSuccess: () => {
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

  const handleNext = async (stepData: Partial<PatientProfileDto>) => {
    const newData = { ...formData, ...stepData, currentStep: currentStep + 1 };
    setFormData(newData);
    
    // Auto-save
    await updateMutation.mutateAsync(newData);
    
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{adminUserId ? 'ویرایش پروفایل درمانی' : 'تکمیل پروفایل درمانی'}</h1>
          <p className="text-gray-600 dark:text-gray-400">برای دریافت خدمات بهتر، لطفاً اطلاعات زیر را با دقت تکمیل کنید.</p>
        </div>
        
        <ProfileWizardProgress currentStep={currentStep} totalSteps={totalSteps} percentage={profileStatus?.completionPercentage || 0} />
        
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 md:p-8 mt-8 border border-gray-100 dark:border-gray-700">
          <ProfileWizardSteps 
            currentStep={currentStep} 
            formData={formData} 
            onNext={handleNext} 
            onPrev={handlePrev}
            isSaving={updateMutation.isPending || completeMutation.isPending}
          />
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
