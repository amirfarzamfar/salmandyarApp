'use client';

import { FileText, UserCheck, CalendarCheck, Heart } from 'lucide-react';

const steps = [
  {
    title: 'ثبت درخواست',
    description: 'یک فرم ساده را با جزئیات نیازهای مراقبتی خود پر کنید.',
    icon: FileText,
  },
  {
    title: 'ارزیابی',
    description: 'مدیران پرونده ما نیازهای شما را بررسی و ارزیابی می‌کنند.',
    icon: UserCheck,
  },
  {
    title: 'تطبیق و ملاقات',
    description: 'ما شما را با بهترین پرستار متناسب برای مصاحبه آشنا می‌کنیم.',
    icon: CalendarCheck,
  },
  {
    title: 'شروع مراقبت',
    description: 'شروع دریافت مراقبت حرفه‌ای با پشتیبانی مداوم.',
    icon: Heart,
  },
];

export default function ProcessSection() {
  return (
    <section id="process" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">نحوه کار</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            دریافت مراقبت مناسب نباید پیچیده باشد. ما فرآیند را برای شما ساده کرده‌ایم.
          </p>
        </div>

        <div className="relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden lg:block absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -translate-y-1/2 z-0"></div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
            {steps.map((step, index) => (
              <div key={index} className="flex flex-col items-center text-center bg-gray-50 lg:bg-transparent p-6 rounded-xl">
                <div className="w-16 h-16 bg-white rounded-full border-4 border-teal-50 shadow-md flex items-center justify-center text-teal-600 mb-6 relative">
                  <step.icon size={32} />
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-teal-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600 text-sm">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
