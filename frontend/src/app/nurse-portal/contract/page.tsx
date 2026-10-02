"use client";

import dynamic from "next/dynamic";

const NurseContractPageClient = dynamic(
  () => import("@/components/nurse-portal/NurseContractPageClient"),
  { ssr: false, loading: () => (
    <div className="space-y-6">
      {[0,1,2,3].map((i) => (
        <div key={i} className="h-28 bg-white/60 dark:bg-gray-900/60 rounded-3xl animate-pulse" />
      ))}
    </div>
  ) }
);

export default function NurseContractPage() {
  return (
    <div className="space-y-6 px-4 py-6 md:px-0">
      <NurseContractPageClient />
    </div>
  );
}
