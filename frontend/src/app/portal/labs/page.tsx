import type { Metadata } from "next";
import { Suspense } from "react";
import { LabLoading } from "@/features/labs/LabShared";
import PortalLabsClient from "@/features/labs/PortalLabsClient";

export const metadata: Metadata = {
  title: "آزمایش‌های من | پورتال بیمار | سالمندیار",
  description: "مشاهده گزارش‌های آزمایشگاهی، روند نتایج و دانلود فایل آزمایش",
};

export default function PortalLabsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-10">
      <Suspense
        fallback={
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
            <LabLoading />
          </div>
        }
      >
        <PortalLabsClient />
      </Suspense>
    </div>
  );
}
