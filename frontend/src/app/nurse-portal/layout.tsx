import type { Metadata } from "next";
import "../portal/portal.css"; // Reuse the premium portal theme
import { NurseBottomNav } from "@/components/nurse-portal/bottom-nav";
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
    <div className="min-h-screen bg-neutral-warm-50 text-gray-800 font-sans selection:bg-medical-200 selection:text-medical-900 pb-24 md:pb-0">
      <ToastProvider />
      <main className="max-w-md mx-auto md:max-w-7xl md:px-6 md:py-8 min-h-screen">
        {children}
      </main>
      
      {/* Mobile Bottom Navigation for Nurses - Ultra Premium Glassmorphism */}
      <NurseBottomNav />
    </div>
  );
}
