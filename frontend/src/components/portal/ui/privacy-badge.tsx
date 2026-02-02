import { ShieldCheck } from "lucide-react";

export function PrivacyBadge() {
  return (
    <div className="flex items-center gap-2 justify-center py-4 opacity-60 hover:opacity-100 transition-opacity">
      <ShieldCheck className="w-4 h-4 text-medical-600" />
      <span className="text-xs text-gray-500 font-medium">اطلاعات شما با استاندارد پزشکی محافظت می‌شود</span>
    </div>
  );
}
