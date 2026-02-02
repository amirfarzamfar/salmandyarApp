'use client';

import { Stethoscope, HeartHandshake, User, Activity, Clock, ShieldCheck } from 'lucide-react';

const services = [
  {
    title: 'مراقبت از سالمند',
    description: 'کمک در فعالیت‌های روزانه، بهداشت فردی و همدم سالمندان در منزل.',
    icon: HeartHandshake,
    color: 'bg-orange-100 text-orange-600',
  },
  {
    title: 'پرستاری در منزل',
    description: 'مراقبت‌های پزشکی حرفه‌ای شامل تزریقات، پانسمان و پایش علائم حیاتی.',
    icon: Stethoscope,
    color: 'bg-blue-100 text-blue-600',
  },
  {
    title: 'فیزیوتراپی',
    description: 'تمرینات توانبخشی و جلسات فیزیوتراپی تخصصی در منزل.',
    icon: Activity,
    color: 'bg-green-100 text-green-600',
  },
  {
    title: 'همراه بیمار',
    description: 'پشتیبانی اختصاصی برای بیماران در حال بهبود پس از جراحی یا بیماری.',
    icon: User,
    color: 'bg-purple-100 text-purple-600',
  },
  {
    title: 'پایش ۲۴ ساعته',
    description: 'نظارت شبانه‌روزی برای نیازهای مراقبتی حساس و بحرانی.',
    icon: Clock,
    color: 'bg-red-100 text-red-600',
  },
  {
    title: 'ICU در منزل',
    description: 'تجهیزات پزشکی پیشرفته و پرستاری ویژه برای مراقبت‌های ویژه.',
    icon: ShieldCheck,
    color: 'bg-teal-100 text-teal-600',
  },
];

export default function ServicesSection() {
  return (
    <section id="services" className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">خدمات جامع ما</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            ما طیف وسیعی از خدمات مراقبتی حرفه‌ای را متناسب با نیازهای منحصر به فرد هر فرد ارائه می‌دهیم.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div 
              key={index} 
              className="group p-8 rounded-2xl border border-gray-100 hover:border-teal-100 hover:shadow-xl transition-all duration-300 bg-white"
            >
              <div className={`w-14 h-14 rounded-xl ${service.color} flex items-center justify-center mb-6 transition-transform group-hover:scale-110`}>
                <service.icon size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-teal-600 transition-colors">
                {service.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
