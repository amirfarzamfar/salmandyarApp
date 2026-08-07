'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Menu, X, Phone, ChevronDown, Clock, Stethoscope, HeartPulse, BookOpen, Wrench, MapPin, Home, UserRound } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useUser } from '@/components/auth/UserContext';
import { resolveRoleHomePath } from '@/utils/role-routing';
import { getMegamenu, listTools, type MegamenuResponse } from '@/lib/content-api';
import * as mock from '@/lib/data/content-data';

function createFallbackMegamenu(): MegamenuResponse {
  return {
    categories: mock.contentCategories
      .filter((c: any) => !c.parentId)
      .slice(0, 6)
      .map((c: any) => ({
        ...c,
        articles: mock.articles
          .filter((a: any) => a.status === 'Published' && a.categoryId === c.id)
          .slice(0, 5),
      })),
    services: mock.serviceSeoProfiles
      .filter((s: any) => s.serviceDefinition)
      .slice(0, 8)
      .map((s: any) => ({
        id: s.serviceDefinition?.id,
        code: s.serviceDefinition?.code,
        title: s.serviceDefinition?.title,
        slug: s.slug,
      })),
    diseases: mock.diseases.slice(0, 8).map((d: any) => ({ id: d.id, name: d.name, slug: d.slug })),
    cities: mock.cities.slice(0, 8).map((c: any) => ({ id: c.id, name: c.name, slug: c.slug, province: c.province })),
  };
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeMega, setActiveMega] = useState<string | null>(null);
  const { user, loading } = useUser();

  const panelHref = resolveRoleHomePath(user?.role);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-mega-wrapper]')) {
        setActiveMega(null);
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const fallbackMega = useMemo(() => createFallbackMegamenu(), []);
  const fallbackTools = useMemo(() => (mock.healthTools as any[]).slice(0, 5), []);

  const { data: menuData } = useQuery<MegamenuResponse>({
    queryKey: ['megamenu'],
    queryFn: () => getMegamenu(),
    initialData: fallbackMega,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const { data: topTools = fallbackTools } = useQuery({
    queryKey: ['topTools'],
    queryFn: () => listTools().then(list => (list as any[]).slice(0, 5)),
    initialData: fallbackTools,
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const renderDesktopActions = () => {
    if (loading) {
      return <div className="h-9 w-36 rounded-full bg-gray-100 animate-pulse" />;
    }

    if (user) {
      return (
        <Link href={panelHref}>
          <Button size="sm">ورود به پنل کاربری</Button>
        </Link>
      );
    }

    return (
      <>
        <Link href="/login">
          <Button variant="ghost" size="sm">ورود</Button>
        </Link>
        <Link href="/register">
          <Button size="sm">شروع کنید</Button>
        </Link>
      </>
    );
  };

  const servicesWithSeo = (menuData?.services || []).map((svc: any) => ({
    id: svc.id,
    slug: svc.slug,
    serviceDefinition: { id: svc.id, code: svc.code, title: svc.title, description: svc.description || '' },
    priceRangeText: svc.priceRangeText || '',
  })).slice(0, 8);

  const menuCategories = (menuData?.categories || []).slice(0, 6);
  const topCities = (menuData?.cities || []).slice(0, 6);
  const topDiseases = (menuData?.diseases || []).slice(0, 5);

  return (
    <nav className="fixed top-0 z-50 w-full bg-white/80 backdrop-blur-lg border-b border-gray-100/60 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.08)]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-lg shadow-teal-500/20 group-hover:scale-105 transition">
                <HeartPulse size={20} className="text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-l from-teal-600 to-teal-500 bg-clip-text text-transparent">سالمندیار</span>
            </Link>

            {/* Desktop Mega Menu */}
            <div className="hidden lg:block mr-10">
              <div className="flex items-baseline gap-1">
                {/* Services Mega Menu */}
                <div className="relative" data-mega-wrapper>
                  <button
                    onMouseEnter={() => setActiveMega('services')}
                    onClick={() => setActiveMega(activeMega === 'services' ? null : 'services')}
                    className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition ${activeMega === 'services' ? 'text-teal-600 bg-teal-50' : 'text-gray-700 hover:text-teal-600 hover:bg-gray-50'}`}
                  >
                    <Stethoscope size={16} className="opacity-70" />
                    خدمات
                    <ChevronDown size={14} className={`transition ${activeMega === 'services' ? 'rotate-180' : ''}`} />
                  </button>
                  {activeMega === 'services' && (
                    <div
                      onMouseEnter={() => setActiveMega('services')}
                      className="absolute top-full right-0 mt-2 w-[700px] bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 animate-in fade-in slide-in-from-top-2 duration-200"
                    >
                      <div className="grid grid-cols-4 gap-4">
                        {servicesWithSeo.map((svc) => (
                          <Link
                            key={svc.id}
                            href={`/services/${svc.slug}`}
                            className="group p-4 rounded-xl hover:bg-teal-50/60 border border-transparent hover:border-teal-100 transition-all"
                          >
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-50 to-teal-100 flex items-center justify-center text-teal-600 mb-3 group-hover:scale-110 transition">
                              <Home size={20} />
                            </div>
                            <h4 className="font-bold text-gray-900 text-sm mb-1 group-hover:text-teal-600 transition">
                              {svc.serviceDefinition?.title}
                            </h4>
                            <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
                              {svc.serviceDefinition?.description}
                            </p>
                            {svc.priceRangeText && (
                              <p className="text-xs text-teal-600 font-semibold mt-2">{svc.priceRangeText}</p>
                            )}
                          </Link>
                        ))}
                      </div>
                      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                        <p className="text-xs text-gray-500">
                          <Clock size={14} className="inline ml-1" />
                          آماده ارائه خدمات ۲۴ ساعته در تهران و کرج
                        </p>
                        <Link href="/services" className="text-sm font-bold text-teal-600 hover:text-teal-700">
                          مشاهده همه خدمات ←
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                {/* Articles Mega Menu */}
                <div className="relative" data-mega-wrapper>
                  <button
                    onMouseEnter={() => setActiveMega('articles')}
                    onClick={() => setActiveMega(activeMega === 'articles' ? null : 'articles')}
                    className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition ${activeMega === 'articles' ? 'text-teal-600 bg-teal-50' : 'text-gray-700 hover:text-teal-600 hover:bg-gray-50'}`}
                  >
                    <BookOpen size={16} className="opacity-70" />
                    مجله سلامت
                    <ChevronDown size={14} className={`transition ${activeMega === 'articles' ? 'rotate-180' : ''}`} />
                  </button>
                  {activeMega === 'articles' && (
                    <div
                      onMouseEnter={() => setActiveMega('articles')}
                      className="absolute top-full right-0 mt-2 w-[750px] bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 animate-in fade-in slide-in-from-top-2 duration-200"
                    >
                      <div className="grid grid-cols-12 gap-6">
                        <div className="col-span-4">
                          <h4 className="text-xs font-bold text-teal-600 mb-3 uppercase tracking-wide">دسته‌بندی‌ها</h4>
                          <ul className="space-y-1">
                            {menuCategories.map((cat) => (
                              <li key={cat.id}>
                                <Link
                                  href={`/articles/category/${cat.slug}`}
                                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 group text-sm"
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400 group-hover:bg-teal-500 transition" />
                                  <span className="text-gray-700 group-hover:text-teal-600 transition">{cat.name}</span>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="col-span-4">
                          <h4 className="text-xs font-bold text-teal-600 mb-3 uppercase tracking-wide">بیماری‌ها</h4>
                          <ul className="space-y-1">
                            {topDiseases.map((d) => (
                              <li key={d.id}>
                                <Link
                                  href={`/diseases/${d.slug}`}
                                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-red-50/50 group text-sm"
                                >
                                  <UserRound size={14} className="text-red-400" />
                                  <span className="text-gray-700 group-hover:text-red-600 transition">{d.name}</span>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="col-span-4">
                          <div className="bg-gradient-to-br from-teal-50 to-white rounded-xl p-4 border border-teal-100">
                            <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center mb-3">
                              ✍️
                            </div>
                            <h4 className="font-bold text-gray-900 text-sm mb-1">مقالات تخصصی سلامت</h4>
                            <p className="text-xs text-gray-500 mb-3 leading-relaxed">
                              تمام مقالات توسط تیم پزشکی سالمندیار بررسی و تایید علمی می‌شوند.
                            </p>
                            <Link href="/articles" className="inline-flex items-center text-xs font-bold text-teal-600">
                              مشاهده همه مقالات ←
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Tools Mega Menu */}
                <div className="relative" data-mega-wrapper>
                  <button
                    onMouseEnter={() => setActiveMega('tools')}
                    onClick={() => setActiveMega(activeMega === 'tools' ? null : 'tools')}
                    className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition ${activeMega === 'tools' ? 'text-teal-600 bg-teal-50' : 'text-gray-700 hover:text-teal-600 hover:bg-gray-50'}`}
                  >
                    <Wrench size={16} className="opacity-70" />
                    ابزارهای سلامت
                    <ChevronDown size={14} className={`transition ${activeMega === 'tools' ? 'rotate-180' : ''}`} />
                  </button>
                  {activeMega === 'tools' && (
                    <div
                      onMouseEnter={() => setActiveMega('tools')}
                      className="absolute top-full right-0 mt-2 w-[500px] bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 animate-in fade-in slide-in-from-top-2 duration-200"
                    >
                      <div className="grid grid-cols-2 gap-3">
                        {topTools.map((tool) => (
                          <Link
                            key={tool.id}
                            href={`/tools/${tool.slug}`}
                            className="group p-3 rounded-xl border border-gray-100 hover:border-teal-200 hover:bg-teal-50/40 transition"
                          >
                            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center text-orange-600 mb-2 group-hover:scale-110 transition">
                              <Wrench size={18} />
                            </div>
                            <h4 className="font-bold text-sm text-gray-900 mb-1 group-hover:text-orange-600 transition">{tool.name}</h4>
                            <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{tool.shortDescription}</p>
                          </Link>
                        ))}
                      </div>
                      <div className="mt-4 pt-4 border-t border-gray-100 text-center">
                        <Link href="/tools" className="text-sm font-bold text-teal-600 hover:text-teal-700">
                          همه ابزارهای رایگان ←
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                {/* Cities Mega Menu */}
                <div className="relative" data-mega-wrapper>
                  <button
                    onMouseEnter={() => setActiveMega('cities')}
                    onClick={() => setActiveMega(activeMega === 'cities' ? null : 'cities')}
                    className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition ${activeMega === 'cities' ? 'text-teal-600 bg-teal-50' : 'text-gray-700 hover:text-teal-600 hover:bg-gray-50'}`}
                  >
                    <MapPin size={16} className="opacity-70" />
                    شهرها
                    <ChevronDown size={14} className={`transition ${activeMega === 'cities' ? 'rotate-180' : ''}`} />
                  </button>
                  {activeMega === 'cities' && (
                    <div
                      onMouseEnter={() => setActiveMega('cities')}
                      className="absolute top-full right-0 mt-2 w-[500px] bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 animate-in fade-in slide-in-from-top-2 duration-200"
                    >
                      <h4 className="text-xs font-bold text-teal-600 mb-4 uppercase tracking-wide">انتخاب شهر خود</h4>
                      <div className="grid grid-cols-3 gap-3">
                        {topCities.map((city) => (
                          <Link
                            key={city.id}
                            href={`/cities/${city.slug}`}
                            className="group p-4 rounded-xl border border-gray-100 hover:border-teal-200 hover:bg-gradient-to-br hover:from-teal-50/50 hover:to-white transition text-center"
                          >
                            <MapPin size={20} className="mx-auto text-teal-500 mb-2 group-hover:scale-125 transition" />
                            <h4 className="font-bold text-gray-900 group-hover:text-teal-600 transition">{city.name}</h4>
                            {city.province && (
                              <p className="text-xs text-gray-400 mt-0.5">{city.province}</p>
                            )}
                          </Link>
                        ))}
                      </div>
                      <div className="mt-4 pt-4 border-t border-gray-100 text-center">
                        <Link href="/cities" className="text-sm font-bold text-teal-600 hover:text-teal-700">
                          مشاهده همه شهرهای تحت پوشش ←
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                <Link href="#guest-request" className="text-gray-700 hover:text-teal-600 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition">
                  درخواست فوری
                </Link>
                <Link href="/login" className="text-gray-700 hover:text-teal-600 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition">
                  درباره ما
                </Link>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="hidden md:flex items-center md:ml-6 gap-3">
            <a href="tel:02112345678" className="flex items-center gap-2 text-gray-700 ml-2 hover:text-teal-600 transition px-3 py-1.5 rounded-lg hover:bg-gray-50">
              <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center">
                <Phone size={16} className="text-teal-600" />
              </div>
              <div className="leading-tight">
                <p className="text-xs text-gray-400">تماس با ما</p>
                <p className="font-bold text-sm" dir="ltr">۰۲۱-۱۲۳۴۵۶۷۸</p>
              </div>
            </a>
            {renderDesktopActions()}
          </div>

          {/* Mobile Toggle */}
          <div className="-mr-2 flex lg:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center rounded-xl p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none transition"
              aria-label={isOpen ? 'بستن منو' : 'باز کردن منو'}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 max-h-[80vh] overflow-y-auto">
          <div className="px-4 py-4 space-y-1.5">
            <div className="p-3 rounded-xl bg-gradient-to-br from-teal-50 to-white border border-teal-100 mb-2">
              <p className="text-xs text-teal-600 font-bold mb-1">خدمات فوری</p>
              <a href="tel:02112345678" className="flex items-center justify-between group">
                <div>
                  <p className="text-xs text-gray-400">۲۴ ساعته پاسخگوی شما هستیم</p>
                  <p className="font-bold text-xl text-teal-600" dir="ltr">۰۲۱-۱۲۳۴۵۶۷۸</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-teal-500 text-white flex items-center justify-center shadow-lg shadow-teal-500/30 group-hover:scale-110 transition">
                  <Phone size={18} />
                </div>
              </a>
            </div>

            <MobileMenuSection title="خدمات پرستاری" icon={<Stethoscope size={16} />} items={servicesWithSeo.map(s => ({ label: s.serviceDefinition?.title || '', href: `/services/${s.slug}` }))} />
            <MobileMenuSection title="دسته‌بندی مقالات" icon={<BookOpen size={16} />} items={menuCategories.map(c => ({ label: c.name, href: `/articles/category/${c.slug}` }))} />
            <MobileMenuSection title="بیماری‌ها" icon={<UserRound size={16} />} items={topDiseases.map(d => ({ label: d.name, href: `/diseases/${d.slug}` }))} />
            <MobileMenuSection title="ابزارهای سلامت" icon={<Wrench size={16} />} items={topTools.map(t => ({ label: t.name, href: `/tools/${t.slug}` }))} />
            <MobileMenuSection title="شهرها" icon={<MapPin size={16} />} items={topCities.map(c => ({ label: c.name, href: `/cities/${c.slug}` }))} />

            <div className="pt-4 space-y-2">
              <Link href="/articles" className="block w-full">
                <Button variant="outline" className="w-full justify-center">مقالات سلامت</Button>
              </Link>
              <Link href="/portal/home-care/request" className="block w-full">
                <Button className="w-full justify-center bg-gradient-to-l from-teal-500 to-teal-600 shadow-lg shadow-teal-500/25">
                  درخواست فوری پرستار
                </Button>
              </Link>
              {user ? (
                <Link href={panelHref} className="block w-full">
                  <Button variant="ghost" className="w-full justify-center">ورود به پنل کاربری</Button>
                </Link>
              ) : (
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Link href="/login" className="w-full">
                    <Button variant="outline" className="w-full justify-center">ورود</Button>
                  </Link>
                  <Link href="/register" className="w-full">
                    <Button variant="ghost" className="w-full justify-center">ثبت‌نام</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

function MobileMenuSection({ title, icon, items }: { title: string; icon: React.ReactNode; items: { label: string; href: string }[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-100 pb-2">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-2.5 text-sm font-bold text-gray-800"
      >
        <span className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center">{icon}</span>
          {title}
        </span>
        <ChevronDown size={18} className={`text-gray-400 transition ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <ul className="space-y-0.5 pr-10 pb-2">
          {items.map((item, idx) => (
            <li key={idx}>
              <Link
                href={item.href}
                className="block text-sm text-gray-600 hover:text-teal-600 hover:bg-teal-50/50 px-3 py-2 rounded-lg transition"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
