import { redirect } from "next/navigation";

export default function VitalSignsRedirectPage() {
  redirect("/nurse-portal/patient-management");
}
