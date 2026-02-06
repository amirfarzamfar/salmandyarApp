'use client';

import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-teal-50 to-white pt-32 pb-20 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-block px-4 py-1.5 bg-teal-100 text-teal-800 rounded-full text-sm font-semibold mb-6">
              #۱ پلتفرم معتبر مراقبت از سالمند
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              مراقبت دلسوزانه <br />
              <span className="text-teal-600">در آرامش خانه</span>
            </h1>
            <p className="text-lg text-gray-600 mb-8 max-w-lg leading-relaxed">
              ما شما را با پرستاران حرفه‌ای و تایید شده مرتبط می‌کنیم تا اطمینان حاصل کنیم که عزیزان شما بهترین حمایت، راحتی و مراقبت‌های پزشکی را در امنیت خانه خود دریافت می‌کنند.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto">درخواست پرستار</Button>
              </Link>
              <Link href="#services">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">مشاهده خدمات</Button>
              </Link>
            </div>
            
            <div className="mt-10 flex items-center gap-6">
              <div className="flex -space-x-4 flex-row-reverse">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">
                     کاربر
                  </div>
                ))}
              </div>
              <div>
                <p className="font-bold text-gray-900">۲,۰۰۰+ خانواده راضی</p>
                <div className="flex text-yellow-400 text-sm gap-1">★★★★★</div>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
             {/* Placeholder for Hero Image - Using a decorative div for now or an SVG */}
             <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-teal-100 to-white aspect-square sm:aspect-[4/3] flex items-center justify-center">
                <svg viewBox="0 0 800 600" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style={{ stopColor: '#ccfbf1', stopOpacity: 1 }} />
                      <stop offset="100%" style={{ stopColor: '#99f6e4', stopOpacity: 1 }} />
                    </linearGradient>
                  </defs>
                  
                  {/* Background Blob */}
                  <motion.path 
                    d="M400,300 Q600,100 700,300 T400,500 T100,300 T400,300" 
                    fill="url(#grad1)" 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1, d: ["M400,300 Q600,100 700,300 T400,500 T100,300 T400,300", "M400,300 Q650,150 750,300 T400,550 T50,300 T400,300", "M400,300 Q600,100 700,300 T400,500 T100,300 T400,300"] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                  />

                  {/* Nurse Figure */}
                  <motion.g initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5, duration: 0.8 }}>
                    {/* Hair */}
                    <path d="M280,200 Q320,150 360,200 L360,240 Q320,250 280,240 Z" fill="#334155" />
                    {/* Face */}
                    <circle cx="320" cy="220" r="35" fill="#fde047" opacity="0.5" /> 
                    <circle cx="320" cy="220" r="35" fill="#ffedd5" />
                    {/* Body */}
                    <path d="M270,260 Q320,260 370,260 L390,450 L250,450 Z" fill="#0d9488" />
                    {/* Uniform Detail */}
                    <path d="M310,260 L330,260 L330,350 L310,350 Z" fill="#ccfbf1" opacity="0.3" />
                  </motion.g>

                  {/* Senior Figure */}
                  <motion.g initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.8, duration: 0.8 }}>
                    {/* Chair */}
                    <path d="M420,300 L550,300 L550,450 L420,450 Z" fill="#94a3b8" />
                    <rect x="540" y="250" width="20" height="200" fill="#64748b" rx="5" />
                    
                    {/* Body */}
                    <path d="M440,280 Q480,280 520,280 L530,420 L430,420 Z" fill="#60a5fa" />
                    {/* Head */}
                    <circle cx="480" cy="240" r="35" fill="#ffedd5" />
                    <path d="M445,240 Q480,200 515,240" fill="none" stroke="#cbd5e1" strokeWidth="10" strokeLinecap="round" />
                    
                    {/* Legs */}
                    <path d="M440,420 L440,480" stroke="#1e293b" strokeWidth="15" strokeLinecap="round" />
                    <path d="M500,420 L500,480" stroke="#1e293b" strokeWidth="15" strokeLinecap="round" />
                  </motion.g>

                  {/* Floating Elements */}
                  <motion.circle cx="200" cy="150" r="10" fill="#2dd4bf" animate={{ y: [0, -20, 0] }} transition={{ duration: 3, repeat: Infinity }} />
                  <motion.circle cx="600" cy="100" r="15" fill="#facc15" animate={{ y: [0, 20, 0] }} transition={{ duration: 4, repeat: Infinity, delay: 1 }} />
                </svg>
             </div>
             
             {/* Floating Cards */}
             <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="absolute -bottom-6 -right-6 bg-white p-4 rounded-xl shadow-lg max-w-xs"
             >
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                      ✓
                   </div>
                   <div>
                      <p className="font-bold text-gray-900">پرسنل تایید شده</p>
                      <p className="text-xs text-gray-500">بررسی سوء پیشینه</p>
                   </div>
                </div>
             </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
