"use client";

import { PortalCard } from "./ui/portal-card";
import { FileText, Download } from "lucide-react";

export function NursingReportFeed() {
  const reports = [
    { id: 1, date: "امروز، ۰۸:۳۰", nurse: "پرستار احمدی", summary: "وضعیت بیمار پایدار است. فشار خون کنترل شد و داروهای صبحگاهی مصرف شدند." },
    { id: 2, date: "دیروز، ۱۸:۰۰", nurse: "پرستار احمدی", summary: "بیمار کمی احساس ضعف داشت. استراحت تجویز شد." },
  ];

  return (
    <div className="mb-8">
      <h2 className="text-lg font-bold text-gray-800 mb-4">گزارش‌های پرستاری</h2>
      <div className="space-y-4">
        {reports.map((report) => (
          <PortalCard key={report.id} variant="glass">
            <div className="flex justify-between items-start mb-2">
              <span className="text-sm font-bold text-medical-700">{report.nurse}</span>
              <span className="text-xs text-gray-500">{report.date}</span>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed mb-3">
              {report.summary}
            </p>
            <button className="text-medical-500 text-xs font-medium flex items-center gap-1 hover:text-medical-700">
              <FileText className="w-3 h-3" />
              مشاهده کامل
            </button>
          </PortalCard>
        ))}
      </div>
    </div>
  );
}
