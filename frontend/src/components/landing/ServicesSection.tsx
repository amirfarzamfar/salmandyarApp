'use client';

import Link from 'next/link';
import { Stethoscope, HeartHandshake, User, Activity, Clock, ShieldCheck, ArrowLeft } from 'lucide-react';

const services = [
  {
    title: 'مراقبت از سالمند',
    description: 'کمک در فعالیت‌های روزانه، بهداشت فردی و همراهی دلسوز سالمندان در منزل با پرستاران مجرب.',
    icon: HeartHandshake,
    color: 'bg-orange-100 text-orange-600',
    slug: 'elderly-care-at-home',
    keywords: ['پرستار سالمند', 'سالمندیار در منزل', 'مراقبت از سالمند'],
  },
  {
    title: 'پرستاری در منزل',
    description: 'مراقبت‌های پزشکی حرفه‌ای شامل تزریقات، پانسمان، پایش علائم حیاتی و مدیریت دارو.',
    icon: Stethoscope,
    color: 'bg-blue-100 text-blue-600',
    slug: 'home-nursing',
    keywords: ['پرستاری در منزل', 'پرستار در منزل', 'خدمات پرستاری'],
  },
  {
    title: 'فیزیوتراپی در منزل',
    description: 'تمرینات توانبخشی، ماساژ درمانی و جلسات فیزیوتراپی تخصصی توسط کارشناسان مجرب.',
    icon: Activity,
    color: 'bg-green-100 text-green-600',
    slug: 'physiotherapy-at-home',
    keywords: ['فیزیوتراپی در منزل', 'توانبخشی در منزل', 'کاینزیوتراپی'],
  },
  {
    title: 'همراهی بیمار',
    description: 'پشتیبانی اختصاصی شبانه‌روزی یا ساعتی برای بیماران در حال نقاهت پس از جراحی یا بیماری.',
    icon: User,
    color: 'bg-purple-100 text-purple-600',
    slug: 'patient-companion',
    keywords: ['همراه بیمار', 'پرستار همراه', 'مراقبت نقاهت'],
  },
  {
    title: 'پایش ۲۴ ساعته بیمار',
    description: 'نظارت کامل شبانه‌روزی، کنترل مداوم علائم حیاتی و پاسخگویی سریع برای نیازهای بحرانی.',
    icon: Clock,
    color: 'bg-red-100 text-red-600',
    slug: '24h-patient-monitoring',
    keywords: ['پایش ۲۴ ساعته', 'مراقبت شبانه', 'نظارت بر بیمار'],
  },
  {
    title: 'ICU در منزل',
    description: 'تجهیزات پزشکی پیشرفته، پرستار ویژه و مدیریت ونتیلاتور و تراکئوستومی برای مراقبت‌های ویژه.',
    icon: ShieldCheck,
    color: 'bg-teal-100 text-teal-600',
    slug: 'icu-home-care-nursing',
    keywords: ['ICU در منزل', 'پرستار ویژه', 'ونتیلاتور در منزل'],
  },
];

export default function ServicesSection() {
  return (
    <section id="services" className="py-20 sm:py-28 bg-gradient-to-b from-white to-slate-50 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-teal-100/30 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-blue-100/30 blur-3xl pointer-events-none" />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-50 text-teal-700 text-xs font-black mb-5 border border-teal-100">
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
            خدمات با مجوز وزارت بهداشت
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 mb-5 leading-tight">
            خدمات جامع <span className="text-teal-600">پرستاری و مراقبت در منزل</span>
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">
            ما طیف وسیعی از خدمات مراقبتی و پزشکی را متناسب با نیازهای منحصر به فرد سالمندان و بیماران، با بالاترین کیفیت و در امنیت محیط خانگی ارائه می‌دهیم.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {services.map((service, index) => (
            <Link
              key={index}
              href={`/services/${service.slug}`}
              aria-label={`اطلاعات بیشتر درباره ${service.title}`}
              className="group relative flex flex-col p-7 sm:p-8 rounded-[2rem] border border-gray-100 hover:border-teal-200 hover:shadow-2xl hover:shadow-teal-100/40 transition-all duration-500 bg-white overflow-hidden"
            >
              <div className="absolute -top-16 -left-16 w-40 h-40 rounded-full bg-gradient-to-br from-teal-50 to-blue-50 opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-500 pointer-events-none" />
              <div className="relative">
                <div className={`w-16 h-16 rounded-2xl ${service.color} flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg shadow-sm`}>
                  <service.icon size={30} />
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-gray-900 mb-3 group-hover:text-teal-700 transition-colors leading-tight">
                  {service.title}
                </h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  {service.description}
                </p>
                <ul className="space-y-1.5 mb-6">
                  {service.keywords.map((kw, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs font-bold text-gray-500">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                      {kw}
                    </li>
                  ))}
                </ul>
                <div className="flex items-center gap-1.5 text-sm font-black text-teal-700 group-hover:text-teal-800 transition-colors">
                  مشاهده جزئیات و قیمت
                  <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-14 text-center">
          <Link
            href="/services"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-l from-teal-600 to-teal-700 text-white font-black shadow-xl shadow-teal-600/20 hover:shadow-2xl hover:scale-[1.02] transition-all text-lg"
          >
            مشاهده لیست کامل خدمات
            <ArrowLeft size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}
