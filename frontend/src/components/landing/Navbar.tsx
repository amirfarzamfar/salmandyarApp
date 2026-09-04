'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import {
  Menu, X, Phone, ChevronDown, ChevronLeft, Clock, Stethoscope, HeartPulse, BookOpen,
  Wrench, MapPin, Home, UserRound, Sparkles, Zap,
  Calculator, CheckSquare, Brain, ShieldCheck, Activity, Pill, TrendingUp,
} from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useUser } from '@/components/auth/UserContext';
import { resolveRoleHomePath } from '@/utils/role-routing';
import { getMegamenu, listTools, type MegamenuResponse } from '@/lib/content-api';
import * as mock from '@/lib/data/content-data';

const TOOL_ICON_BY_SLUG: Record<string, any> = {
  'bmi-calculator': TrendingUp,
  'drug-dosage-calculator': Pill,
  'gcs-calculator': Brain,
  'drip-rate-calculator': Activity,
  'braden-scale-pressure-ulcer-risk': ShieldCheck,
  'daily-care-checklist': CheckSquare,
};

const TOOL_COLORS: Record<string, { bg: string; text: string; ring: string }> = {
  Calculator: { bg: 'from-blue-500 to-cyan-600', text: 'text-cyan-700', ring: 'ring-cyan-500/20' },
  Checklist: { bg: 'from-emerald-500 to-green-600', text: 'text-emerald-700', ring: 'ring-emerald-500/20' },
  Assessment: { bg: 'from-fuchsia-500 to-purple-600', text: 'text-fuchsia-700', ring: 'ring-fuchsia-500/20' },
  Converter: { bg: 'from-indigo-500 to-blue-600', text: 'text-indigo-700', ring: 'ring-indigo-500/20' },
  Tracker: { bg: 'from-rose-500 to-red-600', text: 'text-rose-700', ring: 'ring-rose-500/20' },
};

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
  const fallbackTools = useMemo(() => (
    (mock.healthTools as any[])
      .slice()
      .sort((a: any, b: any) => {
        const oa = (a.isFeatured ? 0 : 1) * 1000 + (a.displayOrder ?? 999);
        const ob = (b.isFeatured ? 0 : 1) * 1000 + (b.displayOrder ?? 999);
        return oa - ob;
      })
      .slice(0, 8)
  ), []);

  const { data: menuData } = useQuery<MegamenuResponse>({
    queryKey: ['megamenu'],
    queryFn: () => getMegamenu(),
    initialData: fallbackMega,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const { data: topTools = fallbackTools } = useQuery({
    queryKey: ['topTools'],
    queryFn: () => listTools().then(list => (list as any[]).slice(0, 8)),
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
                    className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition ${activeMega === 'tools' ? 'text-purple-700 bg-purple-50' : 'text-gray-700 hover:text-purple-700 hover:bg-purple-50/50'}`}
                  >
                    <Wrench size={16} className="opacity-80" />
                    ابزارهای سلامت
                    <ChevronDown size={14} className={`transition ${activeMega === 'tools' ? 'rotate-180' : ''}`} />
                  </button>
                  {activeMega === 'tools' && (
                    <div
                      onMouseEnter={() => setActiveMega('tools')}
                      className="absolute top-full right-0 mt-2 w-[720px] max-w-[calc(100vw-2rem)] bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
                    >
                      {/* Header */}
                      <div className="relative bg-gradient-to-l from-purple-600 via-purple-500 to-pink-500 text-white px-7 py-5 overflow-hidden">
                        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
                        <div className="absolute -bottom-20 -left-10 w-56 h-56 rounded-full bg-cyan-300/20 blur-3xl" />
                        <div className="relative flex items-center justify-between gap-3 flex-wrap">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur border border-white/20 flex items-center justify-center">
                              <Sparkles size={22} />
                            </div>
                            <div>
                              <h3 className="font-black text-lg leading-tight flex items-center gap-2">
                                ابزارهای سلامت رایگان
                                <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-yellow-400/90 text-yellow-950">
                                  <Zap size={10} fill="currentColor" /> {topTools.length}+ ابزار فعال
                                </span>
                              </h3>
                              <p className="text-white/85 text-xs sm:text-sm font-medium mt-0.5">محاسبات پزشکی و پرستاری · بدون ثبت نام · نتایج فوری</p>
                            </div>
                          </div>
                          <Link href="/tools" className="shrink-0 h-9 px-4 rounded-xl bg-white/15 backdrop-blur border border-white/25 hover:bg-white/25 text-white text-xs font-black transition flex items-center gap-1.5">
                            مشاهده همه ابزارها <ChevronLeft size={14} />
                          </Link>
                        </div>
                      </div>

                      <div className="p-5 sm:p-6 grid grid-cols-5 gap-5">
                        {/* FEATURED TOOLS (left column - 3 of 5 cols) */}
                        <div className="col-span-5 sm:col-span-3 space-y-2.5">
                          <h4 className="text-[11px] font-black uppercase tracking-wider text-purple-700 mb-3 flex items-center gap-1.5 px-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" /> ابزارهای ویژه پرکاربرد
                          </h4>

                          {/* Health Tests Featured Card */}
                          <Link
                            href="/health-tests"
                            className="group block p-4 rounded-2xl bg-gradient-to-br from-rose-50 via-white to-amber-50 border-2 border-rose-200 hover:border-rose-400 hover:shadow-xl hover:shadow-rose-500/10 transition-all duration-300 relative overflow-hidden"
                          >
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-[0.08] transition bg-gradient-to-br from-rose-500 to-amber-500" />
                            <div className="relative flex items-start gap-3.5">
                              <div className="shrink-0 w-[52px] h-[52px] rounded-2xl bg-gradient-to-br from-rose-500 via-orange-500 to-amber-500 text-white flex items-center justify-center shadow-xl shadow-rose-500/25 group-hover:scale-110 group-hover:rotate-[-2deg] transition-all duration-300 ring-8 ring-rose-500/10">
                                <HeartPulse size={24} strokeWidth={2.3} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2 mb-1">
                                  <h5 className="font-black text-base text-gray-900 leading-tight">
                                    تست‌های سلامت سالمند
                                  </h5>
                                  <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-lg bg-gradient-to-l from-rose-500 to-orange-500 text-white shadow shadow-rose-500/20">
                                    <Zap size={9} fill="currentColor" /> جدید
                                  </span>
                                </div>
                                <p className="text-xs text-gray-600 leading-relaxed line-clamp-2 mb-2">
                                  در چند دقیقه، وضعیت سلامت، حافظه، خطر سقوط و نیاز به مراقبت سالمند خانواده را ارزیابی کنید.
                                </p>
                                <div className="inline-flex items-center gap-1 text-xs font-black text-rose-700 group-hover:-translate-x-1 transition-transform">
                                  شروع تست‌ها
                                  <ChevronLeft size={13} strokeWidth={2.5} />
                                </div>
                              </div>
                            </div>
                          </Link>

                          {topTools.filter((t: any) => !!t.isFeatured).slice(0, 2).map((tool: any) => {
                            const Icon = TOOL_ICON_BY_SLUG[tool.slug] || Calculator;
                            const color = TOOL_COLORS[tool.toolType as keyof typeof TOOL_COLORS] || TOOL_COLORS.Calculator;
                            return (
                              <Link
                                key={tool.id}
                                href={`/tools/${tool.slug}`}
                                className="group block p-4 rounded-2xl bg-gradient-to-br from-slate-50 via-white to-white border-2 border-gray-100 hover:border-transparent hover:shadow-xl hover:shadow-gray-200/40 transition-all duration-300 relative overflow-hidden"
                              >
                                <div className={`absolute inset-0 opacity-0 group-hover:opacity-[0.07] transition bg-gradient-to-br ${color.bg}`} />
                                <div className="relative flex items-start gap-3.5">
                                  <div className={`w-13 h-13 shrink-0 w-[52px] h-[52px] rounded-2xl bg-gradient-to-br ${color.bg} text-white flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-[-2deg] transition-all duration-300 ring-8 ${color.ring}`}>
                                    <Icon size={24} strokeWidth={2.3} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2 mb-1">
                                      <h5 className="font-black text-base text-gray-900 group-hover:text-slate-900 leading-tight">{tool.name}</h5>
                                      <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-lg bg-gradient-to-l from-orange-500 to-amber-500 text-white shadow shadow-orange-500/20">
                                        <Zap size={9} fill="currentColor" /> ویژه
                                      </span>
                                    </div>
                                    <p className="text-xs text-gray-600 leading-relaxed line-clamp-2 mb-2">
                                      {tool.shortDescription || tool.description}
                                    </p>
                                    <div className={`inline-flex items-center gap-1 text-xs font-black ${color.text} group-hover:-translate-x-1 transition-transform`}>
                                      شروع محاسبه <ChevronLeft size={13} strokeWidth={2.5} />
                                    </div>
                                  </div>
                                </div>
                              </Link>
                            );
                          })}
                        </div>

                        {/* COMPACT TOOLS LIST (right column - 2 of 5 cols) */}
                        <div className="col-span-5 sm:col-span-2">
                          <h4 className="text-[11px] font-black uppercase tracking-wider text-indigo-700 mb-3 flex items-center gap-1.5 px-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" /> لیست کامل ابزارها
                          </h4>
                          <div className="space-y-1.5">
                            {topTools.map((tool: any) => {
                              const Icon = TOOL_ICON_BY_SLUG[tool.slug] || Calculator;
                              const color = TOOL_COLORS[tool.toolType as keyof typeof TOOL_COLORS] || TOOL_COLORS.Calculator;
                              return (
                                <Link
                                  key={tool.id}
                                  href={`/tools/${tool.slug}`}
                                  className="group flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-gray-50 transition"
                                >
                                  <div className={`w-9 h-9 shrink-0 rounded-xl bg-gradient-to-br ${color.bg} text-white flex items-center justify-center shadow group-hover:scale-110 transition-transform`}>
                                    <Icon size={17} strokeWidth={2.3} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <span className="block font-bold text-sm text-gray-900 group-hover:text-slate-900 truncate leading-tight">{tool.name}</span>
                                    <span className="block text-[11px] text-gray-500 truncate leading-tight mt-0.5">
                                      {tool.shortDescription?.slice(0, 40) || 'ابزار پزشکی رایگان'}
                                    </span>
                                  </div>
                                  <ChevronLeft size={14} className="text-gray-300 group-hover:text-gray-600 group-hover:-translate-x-0.5 shrink-0 transition" />
                                </Link>
                              );
                            })}
                          </div>
                        </div>
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
            <a href="tel:09128718237" className="flex items-center gap-2 text-gray-700 ml-2 hover:text-teal-600 transition px-3 py-1.5 rounded-lg hover:bg-gray-50">
              <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center">
                <Phone size={16} className="text-teal-600" />
              </div>
              <div className="leading-tight">
                <p className="text-xs text-gray-400">تماس با ما</p>
                <p className="font-bold text-sm" dir="ltr">۰۹۱۲۸۷۱۸۲۳۷</p>
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
              <a href="tel:09128718237" className="flex items-center justify-between group">
                <div>
                  <p className="text-xs text-gray-400">۲۴ ساعته پاسخگوی شما هستیم</p>
                  <p className="font-bold text-xl text-teal-600" dir="ltr">۰۹۱۲۸۷۱۸۲۳۷</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-teal-500 text-white flex items-center justify-center shadow-lg shadow-teal-500/30 group-hover:scale-110 transition">
                  <Phone size={18} />
                </div>
              </a>
            </div>

            <Link
              href="/health-tests"
              onClick={() => setIsOpen(false)}
              className="block mb-3 rounded-2xl p-3.5 border border-rose-100 bg-gradient-to-br from-rose-50/70 via-orange-50/70 to-amber-50/60 hover:from-rose-50 hover:via-orange-50 hover:to-amber-50 transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 via-orange-500 to-amber-400 text-white flex items-center justify-center shadow-lg shadow-rose-500/20 shrink-0">
                  <HeartPulse size={22} strokeWidth={2.3} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-black text-base text-slate-900">تست‌های سلامت سالمند</span>
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black">
                      <Zap size={10} fill="currentColor" />
                      جدید
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-snug mt-0.5">
                    بررسی وضعیت حافظه، خطر سقوط، تغذیه و نیاز به مراقبت — رایگان
                  </p>
                </div>
                <div className="w-8 h-8 rounded-full bg-white/80 border border-rose-100 text-rose-500 flex items-center justify-center shrink-0">
                  <ChevronLeft size={15} strokeWidth={2.5} />
                </div>
              </div>
            </Link>

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
