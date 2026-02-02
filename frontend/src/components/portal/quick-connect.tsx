"use client";

import { Phone, MessageCircle } from "lucide-react";
import { PortalButton } from "./ui/portal-button";

export function QuickConnect() {
  return (
    <div className="fixed bottom-6 left-0 right-0 px-4 md:px-0 z-40 pointer-events-none">
      <div className="max-w-md mx-auto md:max-w-7xl md:flex md:justify-end pointer-events-auto">
        <div className="flex gap-3 bg-white/90 backdrop-blur-xl p-2 rounded-[24px] shadow-soft-lg border border-white/40 ring-1 ring-black/5">
          <PortalButton variant="primary" size="md" className="flex-1 md:flex-none shadow-medical-500/20">
            <Phone className="w-5 h-5" />
            <span>تماس فوری با پرستار</span>
          </PortalButton>
          <PortalButton variant="secondary" size="icon" className="md:hidden aspect-square">
            <MessageCircle className="w-6 h-6" />
          </PortalButton>
        </div>
      </div>
    </div>
  );
}
