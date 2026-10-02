"use client";

import dynamic from "next/dynamic";

const ContractsAdminPageClient = dynamic(
  () => import("@/components/admin/contracts/ContractsAdminPageClient"),
  { ssr: false }
);

export default function ContractAssignmentsPage() {
  return <ContractsAdminPageClient />;
}
