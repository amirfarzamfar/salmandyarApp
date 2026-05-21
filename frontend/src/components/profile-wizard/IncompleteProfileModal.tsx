'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { PatientProfileService } from '@/services/patient-profile.service';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/Button';
import { ClipboardList } from 'lucide-react';
import { useUser } from '@/components/auth/UserContext';

const allowedProfileRoles = new Set(['Patient', 'Elderly']);

export default function IncompleteProfileModal() {
  const router = useRouter();
  const { user, loading: userLoading } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const canCompleteHealthProfile = !!user?.role && allowedProfileRoles.has(user.role);

  const { data: profileStatus, isLoading } = useQuery({
    queryKey: ['profileStatus'],
    queryFn: PatientProfileService.getMyProfileStatus,
    enabled: !!user && !userLoading && canCompleteHealthProfile,
    retry: false
  });

  useEffect(() => {
    if (!canCompleteHealthProfile) {
      setIsOpen(false);
      return;
    }

    if (profileStatus && (!profileStatus.hasProfile || !profileStatus.isCompleted)) {
      // Don't show if we are already on the wizard page
      if (!window.location.pathname.includes('/profile-wizard')) {
        setIsOpen(true);
      }
    }
  }, [canCompleteHealthProfile, profileStatus]);

  const handleComplete = () => {
    setIsOpen(false);
    router.push('/portal/profile-wizard');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader className="flex flex-col items-center justify-center space-y-4 pt-6">
          <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
            <ClipboardList className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <DialogTitle className="text-2xl font-bold text-center">تکمیل پروفایل درمانی</DialogTitle>
          <DialogDescription className="text-center text-gray-600 dark:text-gray-300 text-base leading-relaxed pt-2">
            برای دریافت خدمات بهتر، لطفاً پروفایل درمانی خود را تکمیل کنید
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col sm:flex-row gap-3 pt-6 border-t mt-4">
          <Button 
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white flex-1" 
            onClick={handleComplete}
          >
            تکمیل پروفایل
          </Button>
          <Button 
            variant="outline" 
            className="w-full sm:w-auto flex-1" 
            onClick={() => setIsOpen(false)}
          >
            بعداً یادآوری کن
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
