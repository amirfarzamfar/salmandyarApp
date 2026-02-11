import type { Metadata } from "next";
import "../portal/portal.css"; // Reuse the premium portal theme
import { NurseBottomNav } from "@/components/nurse-portal/bottom-nav";
import { NurseSidebar } from "@/components/nurse-portal/sidebar";
import { ToastProvider } from "@/components/ui/toast-provider";

export const metadata: Metadata = {
  title: "پنل پرستار | سالمندیار",
  description: "مدیریت بیماران و خدمات پرستاری در منزل",
};

export default function NursePortalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-neutral-warm-50 dark:bg-gray-950 text-gray-800 dark:text-gray-100 font-sans selection:bg-medical-200 selection:text-medical-900 pb-24 md:pb-0">
      <ToastProvider />
      
      {/* Desktop Sidebar */}
      <NurseSidebar />
      
      <main className="max-w-md mx-auto md:max-w-7xl md:mr-64 md:px-8 md:py-8 min-h-screen transition-all duration-300">
        {children}
      </main>
      
      {/* Mobile Bottom Navigation for Nurses - Ultra Premium Glassmorphism */}
      <NurseBottomNav />
    </div>
  );
}
