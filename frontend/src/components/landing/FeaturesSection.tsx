'use client';

import { CheckCircle2 } from 'lucide-react';

const features = [
  'پرسنل با گواهی عدم سوء پیشینه',
  'متخصصان دارای مجوز رسمی',
  'پشتیبانی ۲۴ ساعته مشتریان',
  'برنامه‌های مراقبتی شخصی‌سازی شده',
  'گزارش‌های منظم وضعیت سلامت',
  'قیمت‌گذاری شفاف و مقرون به صرفه',
];

export default function FeaturesSection() {
  return (
    <section className="py-20 bg-teal-900 text-white relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-teal-800 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-800 rounded-full mix-blend-multiply filter blur-3xl opacity-20 translate-x-1/2 translate-y-1/2"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">چرا سالمندیار را انتخاب کنید؟</h2>
            <p className="text-teal-100 text-lg mb-8 leading-relaxed">
              ما آرامش خاطر شما را در اولویت قرار می‌دهیم. فرآیند دقیق گزینش ما و تعهد به تعالی تضمین می‌کند که عزیزان شما در دستان امن و توانمندی هستند.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <CheckCircle2 className="text-teal-400" size={20} />
                  <span className="font-medium">{feature}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="relative">
             <div className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl border border-white/20">
                <div className="flex items-start gap-4 mb-6">
                   <div className="w-12 h-12 bg-teal-500 rounded-full flex items-center justify-center font-bold text-xl">
                      ۹۸٪
                   </div>
                   <div>
                      <h4 className="text-xl font-bold">نرخ رضایت</h4>
                      <p className="text-teal-200 text-sm">بر اساس ۵۰۰+ نظر</p>
                   </div>
                </div>
                <p className="italic text-teal-100 mb-6 leading-relaxed">
                   "سالمندیار برای خانواده ما مثل یک معجزه بود. پرستاری که معرفی کردند نه تنها ماهر است، بلکه با پدرم بسیار مهربان رفتار می‌کند."
                </p>
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                   <div>
                      <p className="font-bold">سارا م.</p>
                      <p className="text-xs text-teal-300">تهران، ایران</p>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
}
