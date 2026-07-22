import type { Metadata } from "next";
import "./portal.css";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { PanelPageNav } from "@/components/navigation/PanelPageNav";
import { PortalSectionNav } from "@/components/portal/portal-section-nav";

export const metadata: Metadata = {
  title: "پروفایل سلامت | سالمندیار",
  description: "مدیریت سلامت و مراقبت در منزل",
};

const portalRoles = ["Patient", "Elderly", "PatientFamily"];

export default function PortalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ProtectedRoute allowedRoles={portalRoles}>
      <div className="min-h-screen bg-medical-50 text-gray-800 font-sans selection:bg-medical-200 selection:text-medical-900 pb-20 md:pb-0">
        <main className="max-w-md mx-auto md:max-w-7xl md:px-6 md:py-8 min-h-screen">
          <PanelPageNav panel="portal" />
          <PortalSectionNav />
          {children}
        </main>
      
        {/* Footer Branding - Mobile Only (Desktop has it in sidebar/footer) */}
        <footer className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-100 py-3 text-center text-xs text-gray-400 md:hidden z-50">
          <p>با ❤️ برای شما | سالمندیار</p>
        </footer>
      </div>
    </ProtectedRoute>
  );
}
