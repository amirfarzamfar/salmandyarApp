"use client";

import dynamic from "next/dynamic";

const ContractTemplateFormPage = dynamic(
  () => import("@/components/admin/contracts/ContractTemplateFormPage"),
  { ssr: false }
);

export default function EditContractTemplatePage() {
  return <ContractTemplateFormPage />;
}
