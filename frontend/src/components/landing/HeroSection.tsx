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
             <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-teal-200 aspect-square sm:aspect-[4/3]">
                <div className="absolute inset-0 bg-gradient-to-tl from-teal-500/20 to-transparent"></div>
                {/* Ideally this would be an <Image /> component */}
                <div className="absolute inset-0 flex items-center justify-center text-teal-800/50">
                    <span className="text-9xl font-bold opacity-20">مراقبت</span>
                </div>
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
