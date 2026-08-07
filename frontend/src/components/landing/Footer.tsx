import { Heart, Mail, Phone, MapPin, Instagram, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import NewsletterSubscribeForm from './NewsletterSubscribeForm';
import {
  listServicesWithSeo,
  listCategories,
  listDiseases,
  listCities,
  listTools,
  listAuthors,
} from '@/lib/content-api';

export default async function Footer() {
  const [
    servicesSeoResult,
    categoriesResult,
    diseasesResult,
    citiesResult,
    toolsResult,
    authorsResult,
  ] = await Promise.all([
    listServicesWithSeo(),
    listCategories(),
    listDiseases({ pageSize: 20 }),
    listCities(),
    listTools(),
    listAuthors(),
  ]);

  const topServices = (servicesSeoResult || [])
    .filter((s: any) => s.serviceDefinition)
    .slice(0, 6);
  const topCategories = (categoriesResult || [])
    .filter((c: any) => (c.showInMenu ?? true) && !c.parentId)
    .slice(0, 6);
  const topDiseases = (diseasesResult?.items || []).slice(0, 5);
  const topCities = (citiesResult || []).slice(0, 6);
  const topTools = (toolsResult || []).slice(0, 5);
  const topAuthors = (authorsResult || [])
    .filter((a: any) => a.isMedicalReviewer)
    .slice(0, 3);

  return (
    <footer className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white pt-16 pb-8 border-t border-slate-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Section - Newsletter & Contact Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-16 pb-12 border-b border-slate-800">
          {/* About & Newsletter */}
          <div className="lg:col-span-5">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-xl shadow-teal-500/20">
                <Heart size={22} className="text-white fill-white/30" />
              </div>
              <span className="text-2xl font-black bg-gradient-to-l from-teal-400 to-teal-200 bg-clip-text text-transparent">سالمندیار</span>
            </div>
            <p className="text-slate-400 mb-6 max-w-lg leading-relaxed text-sm">
              پلتفرم جامع خدمات پرستاری و مراقبت در منزل. ما پرستاران حرفه‌ای، دارای مجوز و دلسوز را در سریع‌ترین زمان ممکن برای سالمندان و بیماران شما فراهم می‌کنیم.
            </p>

            {/* Newsletter */}
            <NewsletterSubscribeForm />

            {/* Trust Badges */}
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/50 text-xs text-slate-300 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                ۲۴ ساعته فعال
              </span>
              <span className="px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/50 text-xs text-slate-300">
                +۵۰۰ پرستار فعال
              </span>
              <span className="px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/50 text-xs text-slate-300">
                فعال در ۱۵ شهر
              </span>
            </div>
          </div>

          {/* Quick Contact Cards */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-5 rounded-2xl bg-gradient-to-br from-teal-500/10 to-transparent border border-teal-500/20">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-teal-500/20 flex items-center justify-center">
                  <Phone size={18} className="text-teal-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">تماس رایگان</p>
                  <p className="font-black text-lg text-white" dir="ltr">۰۲۱-۱۲۳۴۵۶۷۸</p>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                کارشناسان ما ۲۴ ساعت در شبانه‌روز و ۷ روز هفته پاسخگوی سوالات شما هستند.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-br from-orange-500/10 to-transparent border border-orange-500/20">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
                  <MapPin size={18} className="text-orange-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">دفتر مرکزی</p>
                  <p className="font-bold text-sm text-white">تهران، خیابان ولیعصر</p>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                امکان مراجعه حضوری برای مشاوره رایگان، از ساعت ۹ تا ۱۸ روزهای کاری.
              </p>
            </div>

            <div className="sm:col-span-2 p-5 rounded-2xl bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/20 flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 flex items-center justify-center flex-shrink-0 border border-blue-500/20">
                <Mail size={28} className="text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-400 mb-0.5">پشتیبانی ایمیلی</p>
                <p className="font-black text-lg text-white" dir="ltr">support@salmandyar.com</p>
                <p className="text-xs text-slate-400 mt-1">پاسخگویی در کمتر از ۲ ساعت در روزهای کاری</p>
              </div>
              <a href="mailto:support@salmandyar.com" className="flex-shrink-0 px-4 py-2.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-sm font-bold border border-blue-500/20 transition">
                ارسال ایمیل
              </a>
            </div>
          </div>
        </div>

        {/* Links Section */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-12">
          {/* Services */}
          <FooterColumn
            title="خدمات پرستاری"
            titleColor="text-teal-400"
            links={[
              ...topServices.map(s => ({ label: s.serviceDefinition?.title || '', href: `/services/${s.slug}` })),
              { label: 'همه خدمات ←', href: '/services', special: true },
            ]}
          />

          {/* Articles - Categories */}
          <FooterColumn
            title="مجله سلامت"
            titleColor="text-blue-400"
            links={[
              { label: 'همه مقالات', href: '/articles' },
              ...topCategories.map(c => ({ label: c.name, href: `/articles/category/${c.slug}` })),
            ]}
          />

          {/* Diseases */}
          <FooterColumn
            title="بیماری‌ها"
            titleColor="text-rose-400"
            links={[
              ...topDiseases.map(d => ({ label: d.name, href: `/diseases/${d.slug}` })),
              { label: 'همه بیماری‌ها ←', href: '/diseases', special: true },
            ]}
          />

          {/* Cities */}
          <FooterColumn
            title="شهرهای تحت پوشش"
            titleColor="text-amber-400"
            links={[
              ...topCities.map(c => ({ label: `${c.name}${c.province ? ` (${c.province})` : ''}`, href: `/cities/${c.slug}` })),
              { label: 'همه شهرها ←', href: '/cities', special: true },
            ]}
          />

          {/* Tools */}
          <FooterColumn
            title="ابزارهای رایگان سلامت"
            titleColor="text-purple-400"
            links={[
              ...topTools.map(t => ({ label: t.name, href: `/tools/${t.slug}` })),
              { label: 'همه ابزارها ←', href: '/tools', special: true },
            ]}
          />

          {/* Platform */}
          <FooterColumn
            title="پلتفرم سالمندیار"
            titleColor="text-emerald-400"
            links={[
              { label: 'درباره ما', href: '/about' },
              { label: 'همکاری با ما', href: '/register' },
              { label: 'سوالات متداول', href: '/faq' },
              { label: 'تماس با ما', href: '/contact' },
              { label: 'قوانین و مقررات', href: '/terms' },
              { label: 'حریم خصوصی', href: '/privacy' },
            ]}
          />
        </div>

        {/* Medical Reviewers Section */}
        {topAuthors.length > 0 && (
          <div className="mb-12 p-6 rounded-3xl bg-white/5 border border-slate-800 backdrop-blur">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
              <p className="text-sm font-bold text-teal-400 uppercase tracking-wide">تیم پزشکی و محتوای علمی</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {topAuthors.map(author => (
                <div key={author.id} className="flex items-center gap-3 p-3 rounded-2xl bg-slate-800/30 border border-slate-700/50 hover:border-teal-500/30 transition">
                  <div className="w-12 h-12 rounded-2xl overflow-hidden bg-gradient-to-br from-teal-100 to-teal-50 flex-shrink-0 border border-slate-700">
                    {author.profileImageUrl ? (
                      <img src={author.profileImageUrl} alt={author.fullName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-lg font-black text-teal-600">
                        {author.firstName[0]}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-sm text-white truncate">{author.fullName}</p>
                    <p className="text-xs text-slate-400 truncate">{author.title}</p>
                    <p className="text-xs text-teal-400 truncate">{author.specialization}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 pt-5 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
              <p>✓ تمام محتوای پزشکی وب‌سایت توسط تیم پزشکی سالمندیار بررسی و تأیید می‌شود.</p>
              <Link href="/authors" className="font-bold text-teal-400 hover:text-teal-300 flex items-center gap-1">
                مشاهده تیم پزشکی
                <ArrowLeft size={14} />
              </Link>
            </div>
          </div>
        )}

        {/* Bottom */}
        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
            <p className="flex items-center gap-1.5">
              ساخته شده با
              <Heart size={14} className="text-red-500 fill-red-500/50" />
              برای بزرگان کشورمان
            </p>
            <span className="hidden sm:inline-block text-slate-700">|</span>
            <p>© ۱۴۰۴ سالمندیار. تمامی حقوق محفوظ است.</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Social */}
            <a href="#" aria-label="Instagram" className="w-10 h-10 rounded-xl bg-slate-800/60 border border-slate-700/50 text-slate-400 hover:text-pink-400 hover:bg-pink-500/10 hover:border-pink-500/20 transition flex items-center justify-center">
              <Instagram size={18} />
            </a>
            <a href="#" aria-label="LinkedIn" className="w-10 h-10 rounded-xl bg-slate-800/60 border border-slate-700/50 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 hover:border-blue-500/20 transition flex items-center justify-center text-sm font-black">
              in
            </a>
            <a href="#" aria-label="Twitter" className="w-10 h-10 rounded-xl bg-slate-800/60 border border-slate-700/50 text-slate-400 hover:text-sky-400 hover:bg-sky-500/10 hover:border-sky-500/20 transition flex items-center justify-center text-sm font-black">
              𝕏
            </a>
            <a href="#" aria-label="Telegram" className="w-10 h-10 rounded-xl bg-slate-800/60 border border-slate-700/50 text-slate-400 hover:text-sky-500 hover:bg-sky-500/10 hover:border-sky-500/20 transition flex items-center justify-center text-lg">
              ✈️
            </a>
          </div>
        </div>

        {/* Enamad / Saman Cert Placeholder */}
        <div className="mt-6 flex justify-center gap-3 opacity-70">
          <div className="w-20 h-20 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-center text-xs text-slate-500">
            نماد اعتماد
          </div>
          <div className="w-20 h-20 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-center text-xs text-slate-500">
            پرداخت امن
          </div>
          <div className="w-20 h-20 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-center text-xs text-slate-500">
            وزارت بهداشت
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, titleColor, links }: { title: string; titleColor: string; links: { label: string; href: string; special?: boolean }[] }) {
  return (
    <div>
      <h3 className={`text-sm font-black mb-4 ${titleColor} uppercase tracking-wide`}>
        {title}
      </h3>
      <ul className="space-y-2">
        {links.map((link, idx) => (
          <li key={idx}>
            <Link
              href={link.href}
              className={`text-sm transition leading-relaxed block py-0.5 ${
                link.special
                  ? 'font-bold text-teal-400 hover:text-teal-300 mt-2'
                  : 'text-slate-400 hover:text-white hover:translate-x-[-2px]'
              }`}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
