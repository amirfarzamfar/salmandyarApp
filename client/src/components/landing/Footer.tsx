import { Heart, Mail, Phone, MapPin } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white pt-12 pb-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl font-bold text-teal-400">سالمندیار</span>
            </div>
            <p className="text-slate-400 mb-6 max-w-md leading-relaxed">
              خدمات حرفه‌ای مراقبت از سالمند در منزل. ما پرستاران دلسوز، تایید شده و متخصص را فراهم می‌کنیم تا اطمینان حاصل کنیم که عزیزان شما ایمن و شاد هستند.
            </p>
            <div className="flex gap-4">
              {/* Social Icons Placeholder */}
              <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-teal-600 hover:text-white transition-colors cursor-pointer">
                <span className="font-bold">in</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-teal-600 hover:text-white transition-colors cursor-pointer">
                <span className="font-bold">Ig</span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 text-teal-50">لینک‌های سریع</h3>
            <ul className="space-y-2">
              <li><Link href="#services" className="text-slate-400 hover:text-teal-400 transition-colors">خدمات</Link></li>
              <li><Link href="#process" className="text-slate-400 hover:text-teal-400 transition-colors">نحوه کار</Link></li>
              <li><Link href="#about" className="text-slate-400 hover:text-teal-400 transition-colors">درباره ما</Link></li>
              <li><Link href="/register" className="text-slate-400 hover:text-teal-400 transition-colors">همکاری به عنوان پرستار</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-teal-50">تماس با ما</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-slate-400">
                <Phone size={18} className="text-teal-500" />
                <span dir="ltr">021-12345678</span>
              </li>
              <li className="flex items-center gap-3 text-slate-400">
                <Mail size={18} className="text-teal-500" />
                <span>info@salmandyar.com</span>
              </li>
              <li className="flex items-center gap-3 text-slate-400">
                <MapPin size={18} className="text-teal-500" />
                <span>تهران، خیابان آزادی</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-sm">© ۱۴۰۴ سالمندیار. تمامی حقوق محفوظ است.</p>
          <div className="flex items-center gap-1 text-slate-500 text-sm">
            <span>ساخته شده با</span>
            <Heart size={14} className="text-red-500 fill-red-500" />
            <span>برای بزرگان ما</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
