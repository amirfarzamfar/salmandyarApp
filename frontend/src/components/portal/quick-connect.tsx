"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { LogOut, Phone } from "lucide-react";
import { PortalButton } from "./ui/portal-button";
import { patientService } from "@/services/patient.service";
import { CurrentShiftNurseContact } from "@/types/patient";
import { useUser } from "@/components/auth/UserContext";

interface QuickConnectProps {
  patientId?: number | null;
}

export function QuickConnect({ patientId }: QuickConnectProps) {
  const { logout } = useUser();
  const [contact, setContact] = useState<CurrentShiftNurseContact | null>(null);
  const [isLoadingContact, setIsLoadingContact] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const loadContact = async () => {
      if (!patientId) {
        setContact(null);
        return;
      }

      try {
        setIsLoadingContact(true);
        const currentShiftNurse = await patientService.getCurrentShiftNurseContact(patientId);
        setContact(currentShiftNurse);
      } catch (error) {
        console.error("Failed to fetch current shift nurse contact", error);
        setContact(null);
      } finally {
        setIsLoadingContact(false);
      }
    };

    void loadContact();
  }, [patientId]);

  const handleCall = () => {
    if (!contact?.phoneNumber) {
      toast.error("برای شیفت جاری پرستاری با شماره تماس معتبر تعیین نشده است.");
      return;
    }

    window.location.href = `tel:${contact.phoneNumber}`;
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
    } catch (error) {
      console.error("Logout failed", error);
      toast.error("خروج از حساب انجام نشد.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const contactHint = isLoadingContact
    ? "در حال بررسی پرستار شیفت جاری..."
    : contact?.phoneNumber
      ? `پرستار شیفت جاری: ${contact.fullName}`
      : "برای شیفت جاری پرستاری تعیین نشده است.";

  return (
    <div className="fixed bottom-6 left-0 right-0 px-4 md:px-0 z-40 pointer-events-none">
      <div className="max-w-md mx-auto md:max-w-7xl md:flex md:justify-end pointer-events-auto">
        <div className="min-w-[320px] bg-white/90 backdrop-blur-xl p-2 rounded-[24px] shadow-soft-lg border border-white/40 ring-1 ring-black/5">
          <div className="flex gap-3">
          <PortalButton
            variant="primary"
            size="md"
            className="flex-1 shadow-medical-500/20"
            onClick={handleCall}
            isLoading={isLoadingContact}
            disabled={!contact?.phoneNumber}
          >
            <Phone className="w-5 h-5" />
            <span>تماس فوری با پرستار</span>
          </PortalButton>
          <PortalButton
            variant="danger"
            size="md"
            className="px-4"
            onClick={handleLogout}
            isLoading={isLoggingOut}
          >
            <LogOut className="w-5 h-5" />
            <span className="hidden sm:inline">خروج</span>
          </PortalButton>
          </div>
          <div className="px-2 pt-2 text-xs font-medium text-slate-500">
            {contactHint}
          </div>
        </div>
      </div>
    </div>
  );
}
