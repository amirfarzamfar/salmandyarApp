"use client";

import { useQuery } from "@tanstack/react-query";
import { patientService } from "@/services/patient.service";
import { PortalCard } from "./ui/portal-card";
import DateObject from "react-date-object";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { Activity, Thermometer, Droplet, Heart, Clock, User, FileText, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface VitalSignsHistoryProps {
  patientId: number;
}

export function VitalSignsHistory({ patientId }: VitalSignsHistoryProps) {
  const { data: vitals, isLoading } = useQuery({
    queryKey: ["vitals", patientId],
    queryFn: () => patientService.getVitals(patientId),
  });

  if (isLoading) {
    return (
      <PortalCard className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </PortalCard>
    );
  }

  if (!vitals || vitals.length === 0) {
    return null;
  }

  // Sort by date descending (newest first)
  const sortedVitals = [...vitals].sort(
    (a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime()
  );

  return (
    <PortalCard className="overflow-hidden h-full flex flex-col">
      <div className="p-4 md:p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
        <h3 className="text-base md:text-lg font-bold text-gray-800 flex items-center gap-2">
          <FileText className="text-medical-600" size={20} />
          تاریخچه علائم حیاتی
        </h3>
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full whitespace-nowrap">
          {vitals.length} رکورد
        </span>
      </div>

      {/* Mobile View (Cards) */}
      <div className="md:hidden divide-y divide-gray-100">
        {sortedVitals.map((vital) => (
          <div key={vital.id} className="p-4 space-y-3 hover:bg-gray-50/50 transition-colors">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
              <div className="flex items-center gap-1.5">
                <Calendar size={14} className="text-medical-500" />
                {new DateObject({ date: new Date(vital.recordedAt), calendar: persian, locale: persian_fa }).format("YYYY/MM/DD")}
              </div>
              <div className="flex items-center gap-1.5">
                <Clock size={14} className="text-medical-500" />
                {new DateObject({ date: new Date(vital.recordedAt), calendar: persian, locale: persian_fa }).format("HH:mm")}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-blue-50/50">
                <Activity size={18} className="text-blue-500" />
                <div>
                  <span className="block text-sm font-bold text-gray-800 leading-none mb-1">
                    {vital.systolicBloodPressure}/{vital.diastolicBloodPressure}
                  </span>
                  <span className="text-[10px] text-gray-500">فشار خون</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 p-2 rounded-lg bg-rose-50/50">
                <Heart size={18} className="text-rose-500" />
                <div>
                  <span className="block text-sm font-bold text-gray-800 leading-none mb-1">
                    {vital.pulseRate}
                  </span>
                  <span className="text-[10px] text-gray-500">ضربان</span>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2 rounded-lg bg-orange-50/50">
                <Thermometer size={18} className="text-orange-500" />
                <div>
                  <span className="block text-sm font-bold text-gray-800 leading-none mb-1">
                    {vital.bodyTemperature}
                  </span>
                  <span className="text-[10px] text-gray-500">دما</span>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2 rounded-lg bg-sky-50/50">
                <Droplet size={18} className="text-sky-500" />
                <div>
                  <span className="block text-sm font-bold text-gray-800 leading-none mb-1">
                    {vital.oxygenSaturation}
                  </span>
                  <span className="text-[10px] text-gray-500">اکسیژن</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-400 pt-1 border-t border-gray-50 mt-2">
              <User size={12} />
              <span>ثبت کننده: {vital.recorderName}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop View (Table) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm text-right">
          <thead className="bg-gray-50 text-gray-500 sticky top-0">
            <tr>
              <th className="px-6 py-4 font-medium whitespace-nowrap">تاریخ و زمان</th>
              <th className="px-6 py-4 font-medium whitespace-nowrap">فشار خون</th>
              <th className="px-6 py-4 font-medium whitespace-nowrap">ضربان قلب</th>
              <th className="px-6 py-4 font-medium whitespace-nowrap">دما</th>
              <th className="px-6 py-4 font-medium whitespace-nowrap">اکسیژن</th>
              <th className="px-6 py-4 font-medium whitespace-nowrap">ثبت کننده</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sortedVitals.map((vital) => (
              <tr key={vital.id} className="hover:bg-gray-50/50 transition-colors group">
                <td className="px-6 py-4 text-gray-600 font-medium whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-gray-400" />
                    {new DateObject({ date: new Date(vital.recordedAt), calendar: persian, locale: persian_fa }).format("YYYY/MM/DD HH:mm")}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <Activity size={16} className="text-blue-500" />
                    <span className="font-bold text-gray-800">
                      {vital.systolicBloodPressure}/{vital.diastolicBloodPressure}
                    </span>
                    <span className="text-xs text-gray-400">mmHg</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <Heart size={16} className="text-rose-500" />
                    <span className="font-bold text-gray-800">{vital.pulseRate}</span>
                    <span className="text-xs text-gray-400">bpm</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <Thermometer size={16} className="text-orange-500" />
                    <span className="font-bold text-gray-800">{vital.bodyTemperature}</span>
                    <span className="text-xs text-gray-400">°C</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <Droplet size={16} className="text-sky-500" />
                    <span className="font-bold text-gray-800">{vital.oxygenSaturation}</span>
                    <span className="text-xs text-gray-400">%</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2 text-gray-500">
                    <User size={14} />
                    <span>{vital.recorderName}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PortalCard>
  );
}
