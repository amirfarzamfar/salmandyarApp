import type { Metadata } from "next";
import "../portal/portal.css"; // Reuse the premium portal theme
import { NurseBottomNav } from "@/components/nurse-portal/bottom-nav";
import { NurseSidebar } from "@/components/nurse-portal/sidebar";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { MedicationAlertBanner } from "@/components/portal/medication-alert-banner";
import { CaregiverProfileGuard } from "@/components/caregiver-profile/CaregiverProfileGuard";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { PanelPageNav } from "@/components/navigation/PanelPageNav";
import { PublicSiteLink } from "@/components/navigation/PublicSiteLink";

export const metadata: Metadata = {
  title: "پنل پرستار | سالمندیار",
  description: "مدیریت بیماران و خدمات پرستاری در منزل",
};

const caregiverRoles = ["Nurse", "AssistantNurse", "ElderlyCareAssistant", "Physiotherapist"];

export default function NursePortalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ProtectedRoute allowedRoles={caregiverRoles}>
      <div className="min-h-screen bg-neutral-warm-50 dark:bg-gray-950 text-gray-800 dark:text-gray-100 font-sans selection:bg-medical-200 selection:text-medical-900 pb-24 md:pb-0 md:pr-64">
        {/* Desktop Sidebar */}
        <NurseSidebar />

        {/* Mobile Top Header */}
        <div className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-medical-500 to-medical-600 flex items-center justify-center text-white shadow-glow-medical">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </div>
            <span className="font-black text-gray-900 dark:text-white">سالمندیار</span>
          </div>
          <div className="flex items-center gap-2">
            <PublicSiteLink className="h-10 w-10 rounded-xl px-0" />
            <NotificationCenter appearance="dashboard" />
          </div>
        </div>
        
        <main className="w-full max-w-md mx-auto md:max-w-none md:mx-0 md:px-8 md:py-8 min-h-screen transition-all duration-300 relative">
          {/* Desktop Notification Center */}
          <div className="mb-6 hidden md:flex md:items-center md:justify-end md:gap-3">
            <PublicSiteLink />
            <NotificationCenter appearance="dashboard" />
          </div>

          <div className="mb-6">
            <CaregiverProfileGuard />
          </div>
        
          <div className="mb-6">
            <MedicationAlertBanner />
          </div>

          <PanelPageNav panel="nurse" />
      
          {children}
        </main>

        {/* Mobile Bottom Navigation for Nurses - Ultra Premium Glassmorphism */}
        <NurseBottomNav />
      </div>
    </ProtectedRoute>
  );
}
