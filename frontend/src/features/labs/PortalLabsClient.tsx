"use client";

import Link from "next/link";
import { AlertTriangle, FlaskConical, ArrowLeft, UserPlus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { labApi, labError } from "./lab-api";
import { LabError, LabLoading } from "./LabShared";
import { PatientLabsTab } from "./PatientLabsTab";
import { motion } from "framer-motion";

export default function PortalLabsClient() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["labs", "me"],
    queryFn: () => labApi.me(),
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return <LabLoading />;
  }

  if (error) {
    return (
      <div className="space-y-4">
        <LabError message={labError(error)} retry={() => refetch()} />
      </div>
    );
  }

  const patientId = data?.patientId;

  if (!patientId || !Number.isFinite(patientId)) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        <div className="rounded-[32px] bg-white p-8 md:p-10 text-center shadow-sm ring-1 ring-black/5">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 ring-1 ring-amber-100">
            <AlertTriangle className="h-8 w-8 text-amber-600" />
          </div>
          <h2 className="text-xl md:text-2xl font-black text-gray-900 mb-3">
            پرونده بیمار شما ثبت نشده است
          </h2>
          <p className="text-gray-600 leading-relaxed mb-6">
            برای مشاهده گزارش‌های آزمایشگاهی، ابتدا باید پرونده پزشکی شما توسط
            تیم درمانی سالمندیار ثبت شود. در صورت وجود مشکل با پشتیبانی تماس
            بگیرید.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/portal/profile"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-medical-600 px-6 py-3 text-sm font-black text-white shadow-sm hover:bg-medical-700 transition-colors"
            >
              <UserPlus className="h-4 w-4" />
              مشاهده پروفایل من
            </Link>
            <Link
              href="/portal"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gray-50 px-6 py-3 text-sm font-black text-gray-700 ring-1 ring-gray-100 hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              بازگشت به خانه
            </Link>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-medical-50 ring-1 ring-medical-100 text-medical-700">
            <FlaskConical className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-gray-900">
              آزمایش‌های من
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              مشاهده گزارش‌های آزمایشگاهی، روند نتایج و دانلود فایل‌ها
            </p>
          </div>
        </div>
        <Link
          href="/portal"
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-sm font-bold text-gray-700 shadow-sm ring-1 ring-gray-100 hover:bg-gray-50 transition-colors self-start md:self-auto"
        >
          <ArrowLeft className="h-4 w-4" />
          بازگشت
        </Link>
      </div>

      <PatientLabsTab patientId={Number(patientId)} canManage={false} />
    </div>
  );
}
