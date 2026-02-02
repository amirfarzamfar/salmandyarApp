"use client";

import { PortalCard } from "./ui/portal-card";
import { CalendarDays, ChevronLeft } from "lucide-react";

export function CarePlanCards() {
  const plans = [
    { id: 1, title: "فیزیوتراپی", time: "فردا، ۱۰:۰۰ صبح", provider: "دکتر کریمی", status: "upcoming" },
    { id: 2, title: "چکاپ هفتگی", time: "جمعه، ۱۶:۰۰", provider: "پرستار احمدی", status: "upcoming" },
  ];

  return (
    <div className="mb-8">
      <h2 className="text-lg font-bold text-gray-800 mb-4">خدمات برنامه‌ریزی شده</h2>
      <div className="space-y-3">
        {plans.map((plan) => (
          <PortalCard key={plan.id} className="flex items-center justify-between group hover:shadow-md transition-all cursor-pointer" noPadding>
            <div className="flex items-center gap-4 p-4 w-full">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-100 transition-colors">
                <CalendarDays className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">{plan.title}</h3>
                <p className="text-sm text-gray-500">{plan.time} • {plan.provider}</p>
              </div>
              <ChevronLeft className="w-5 h-5 text-gray-400 mr-auto" />
            </div>
          </PortalCard>
        ))}
      </div>
    </div>
  );
}
