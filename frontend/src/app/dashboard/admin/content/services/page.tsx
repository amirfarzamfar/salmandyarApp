'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import {
  Layers,
  MapPin,
  Star,
  ShieldCheck,
  Eye,
  Plus,
  Search,
  Filter,
  Pencil,
  Trash2,
  Award,
  Users,
  Stethoscope,
  Activity,
  Target,
  MessageSquareQuote
} from 'lucide-react';
import { serviceSeoProfiles, diseases, cities, authors } from '@/lib/data/content-data';
import type { ServiceSeoProfile } from '@/lib/types/content';

const mockIsActive = [true, true, true, false];
const mockCategoryLabels: Record<string, string> = {
  PersonalCare: 'مراقبت شخصی سالمند',
  Nursing: 'پرستاری در منزل',
  Therapy: 'توان‌بخشی',
  Companion: 'همیاری',
  Medical: 'خدمات پزشکی'
};

export default function ServicesAdminPage() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const enrichedServices = useMemo(() => {
    return serviceSeoProfiles.map((s, idx) => ({
      ...s,
      isActive: mockIsActive[idx] ?? true
    }));
  }, []);

  const metrics = useMemo(() => {
    const total = enrichedServices.length;
    const active = enrichedServices.filter((s) => (s as any).isActive).length;
    const totalBenefits = enrichedServices.reduce((sum, s) => sum + (s.benefits?.length ?? 0), 0);
    const totalCoverage = enrichedServices.reduce((sum, s) => sum + (s.coverageAreas?.length ?? 0), 0);
    return { total, active, totalBenefits, totalCoverage };
  }, [enrichedServices]);

  const categoryOptions = useMemo(() => {
    const set = new Set<string>();
    enrichedServices.forEach((s) => {
      if (s.serviceDefinition?.category) set.add(s.serviceDefinition.category);
    });
    return Array.from(set);
  }, [enrichedServices]);

  const filteredServices = useMemo(() => {
    return enrichedServices.filter((s) => {
      if (search) {
        const q = search.toLowerCase();
        const title = s.serviceDefinition?.title ?? '';
        const code = s.serviceDefinition?.code ?? '';
        const hay = `${title} ${code} ${s.slug} ${s.primaryKeyword ?? ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (categoryFilter && s.serviceDefinition?.category !== categoryFilter) return false;
      if (statusFilter === 'active' && !(s as any).isActive) return false;
      if (statusFilter === 'inactive' && (s as any).isActive) return false;
      if (statusFilter === 'featured' && !s.isFeatured) return false;
      return true;
    });
  }, [enrichedServices, search, categoryFilter, statusFilter]);

  const handleDelete = (s: ServiceSeoProfile) => {
    toast.success(`لندینگ «${s.serviceDefinition?.title ?? s.slug}» حذف شد.`);
  };
  const handleEdit = (s: ServiceSeoProfile) => {
    toast.success(`ویرایش «${s.serviceDefinition?.title ?? s.slug}» باز شد.`);
  };
  const handleCreate = () => {
    toast.success('فرم لندینگ جدید باز شد.');
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8" dir="rtl">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Layers className="h-7 w-7 text-teal-600" />
            لندینگ خدمات و SEO
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            تعیین Meta, Benefits, Coverage, Testimonials هر سرویس برای تبدیل بالا
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/services"
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 inline-flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            پیش‌نمایش /services
          </Link>
          <button
            type="button"
            onClick={handleCreate}
            className="rounded-xl bg-gradient-to-l from-teal-600 to-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-md shadow-teal-600/20 transition hover:from-teal-700 hover:to-emerald-700 inline-flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            لندینگ جدید
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-medium text-slate-500">کل لندینگ‌ها</div>
              <div className="mt-1 text-2xl font-bold text-slate-900">{metrics.total}</div>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-medium text-slate-500">لندینگ‌های فعال</div>
              <div className="mt-1 text-2xl font-bold text-slate-900">{metrics.active}</div>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-medium text-slate-500">مزایا Benefits</div>
              <div className="mt-1 text-2xl font-bold text-slate-900">{metrics.totalBenefits.toLocaleString('fa-IR')}</div>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-medium text-slate-500">مناطق تحت پوشش</div>
              <div className="mt-1 text-2xl font-bold text-slate-900">{metrics.totalCoverage.toLocaleString('fa-IR')}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700">جستجو</label>
            <div className="relative">
              <Search className="absolute right-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="نام سرویس، کد، نامک یا کلمه کلیدی..."
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-4 pr-10 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 flex items-center gap-1">
              <Filter className="h-3.5 w-3.5" />
              دسته‌بندی
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
            >
              <option value="">همه دسته‌ها</option>
              {categoryOptions.map((c) => (
                <option key={c} value={c}>
                  {mockCategoryLabels[c] ?? c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">وضعیت</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
            >
              <option value="">همه</option>
              <option value="active">فعال</option>
              <option value="inactive">غیرفعال</option>
              <option value="featured">ویژه (Featured)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="hidden overflow-x-auto lg:block">
          <table className="w-full text-right text-sm">
            <thead className="border-b border-slate-200 bg-gradient-to-l from-slate-50 to-teal-50/40 text-slate-600">
              <tr>
                <th className="px-5 py-4 font-semibold">ردیف</th>
                <th className="px-5 py-4 font-semibold">سرویس</th>
                <th className="px-5 py-4 font-semibold">دسته‌بندی</th>
                <th className="px-5 py-4 font-semibold">مزایا</th>
                <th className="px-5 py-4 font-semibold">مناطق تحت پوشش</th>
                <th className="px-5 py-4 font-semibold">نظرات</th>
                <th className="px-5 py-4 font-semibold">بیماران هدف</th>
                <th className="px-5 py-4 font-semibold">وضعیت</th>
                <th className="px-5 py-4 font-semibold">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredServices.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center gap-3 text-slate-500">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                        <Layers className="h-7 w-7 text-slate-400" />
                      </div>
                      <div className="font-medium">لندینگی یافت نشد</div>
                      <div className="text-xs">عبارت دیگری را جستجو کنید یا فیلترها را تغییر دهید.</div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredServices.map((s, idx) => {
                  const tCount = s.testimonials?.length ?? 0;
                  const approvedT = s.testimonials?.filter((t) => t.isApproved).length ?? 0;
                  const avgRating =
                    tCount > 0
                      ? (s.testimonials!.reduce((sum, t) => sum + t.rating, 0) / tCount).toFixed(1)
                      : '-';
                  const cat = s.serviceDefinition?.category ?? '';
                  return (
                    <tr key={s.id} className="transition hover:bg-slate-50/80">
                      <td className="px-5 py-4 text-slate-500">{(idx + 1).toLocaleString('fa-IR')}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-100 to-blue-100 text-teal-700">
                            <Stethoscope className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-slate-900">
                                {s.serviceDefinition?.title ?? 'بدون عنوان'}
                              </span>
                              {s.isFeatured && (
                                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700 inline-flex items-center gap-0.5">
                                  <Star className="h-3 w-3 -mt-0.5" />
                                  ویژه
                                </span>
                              )}
                            </div>
                            <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-500">
                              <span className="font-mono bg-slate-100 rounded px-1.5 py-0.5" dir="ltr">
                                {s.serviceDefinition?.code ?? '—'}
                              </span>
                              <span className="font-mono" dir="ltr">/services/{s.slug}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2.5 py-1 text-xs font-bold text-violet-700">
                          <Activity className="h-3 w-3" />
                          {mockCategoryLabels[cat] ?? cat ?? '—'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                            <Award className="h-4 w-4" />
                          </div>
                          <span className="text-sm font-bold text-slate-800">
                            {(s.benefits?.length ?? 0).toLocaleString('fa-IR')}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                            <MapPin className="h-4 w-4" />
                          </div>
                          <span className="text-sm font-bold text-slate-800">
                            {(s.coverageAreas?.length ?? 0).toLocaleString('fa-IR')}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5">
                            <MessageSquareQuote className="h-4 w-4 text-emerald-600" />
                            <span className="text-xs font-bold text-slate-800">
                              {approvedT.toLocaleString('fa-IR')} تایید شده / {tCount.toLocaleString('fa-IR')}
                            </span>
                          </div>
                          {tCount > 0 && (
                            <div className="flex items-center gap-1 text-xs text-amber-600 font-bold">
                              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                              میانگین: {Number(avgRating).toLocaleString('fa-IR')}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-100 text-rose-700">
                            <Target className="h-4 w-4" />
                          </div>
                          <span className="text-sm font-bold text-slate-800">
                            {(s.targetPatients?.length ?? 0).toLocaleString('fa-IR')}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-col gap-1 items-start">
                          {(s as any).isActive ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700">
                              <ShieldCheck className="h-3 w-3" />
                              فعال
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
                              غیرفعال
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <Link
                            href={`/services/${s.slug}`}
                            className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 inline-flex items-center gap-1"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            پیش‌نمایش
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleEdit(s)}
                            className="rounded-lg border border-teal-200 bg-teal-50 px-2.5 py-1.5 text-xs font-medium text-teal-700 transition hover:bg-teal-100 inline-flex items-center gap-1"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            ویرایش
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(s)}
                            className="rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-medium text-rose-700 transition hover:bg-rose-100 inline-flex items-center gap-1"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            حذف
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="divide-y divide-slate-200 lg:hidden">
          {filteredServices.length === 0 ? (
            <div className="px-4 py-16 text-center text-slate-500">لندینگی یافت نشد.</div>
          ) : (
            filteredServices.map((s, idx) => {
              const tCount = s.testimonials?.length ?? 0;
              const approvedT = s.testimonials?.filter((t) => t.isApproved).length ?? 0;
              const avgRating =
                tCount > 0
                  ? (s.testimonials!.reduce((sum, t) => sum + t.rating, 0) / tCount).toFixed(1)
                  : '-';
              const cat = s.serviceDefinition?.category ?? '';
              return (
                <div key={s.id} className="space-y-4 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-100 to-blue-100 text-teal-700">
                        <Stethoscope className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">
                          {s.serviceDefinition?.title ?? 'بدون عنوان'}
                        </div>
                        <div className="text-xs text-slate-500 font-mono" dir="ltr">
                          {s.serviceDefinition?.code} / /services/{s.slug}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      {(s as any).isActive ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-bold text-emerald-700">
                          فعال
                        </span>
                      ) : (
                        <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-600">غیرفعال</span>
                      )}
                      {s.isFeatured && (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700 inline-flex items-center gap-0.5">
                          <Star className="h-2.5 w-2.5" /> ویژه
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2.5 py-1 text-xs font-bold text-violet-700">
                    <Activity className="h-3 w-3" />
                    {mockCategoryLabels[cat] ?? cat ?? '—'}
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-xl bg-slate-50 p-3">
                      <div className="text-xs text-slate-500">مزایا</div>
                      <div className="mt-1 font-bold text-slate-700">
                        {(s.benefits?.length ?? 0).toLocaleString('fa-IR')}
                      </div>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-3">
                      <div className="text-xs text-slate-500">مناطق</div>
                      <div className="mt-1 font-bold text-slate-700">
                        {(s.coverageAreas?.length ?? 0).toLocaleString('fa-IR')}
                      </div>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-3">
                      <div className="text-xs text-slate-500">نظرات تایید شده</div>
                      <div className="mt-1 font-bold text-slate-700">{approvedT.toLocaleString('fa-IR')}</div>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-3">
                      <div className="text-xs text-slate-500">بیماران هدف</div>
                      <div className="mt-1 font-bold text-slate-700">
                        {(s.targetPatients?.length ?? 0).toLocaleString('fa-IR')}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Link
                      href={`/services/${s.slug}`}
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 inline-flex items-center gap-1"
                    >
                      <Eye className="h-3.5 w-3.5" /> پیش‌نمایش
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleEdit(s)}
                      className="rounded-lg border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs font-medium text-teal-700 inline-flex items-center gap-1"
                    >
                      <Pencil className="h-3.5 w-3.5" /> ویرایش
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(s)}
                      className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-700 inline-flex items-center gap-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> حذف
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="border-t border-slate-200 px-5 py-4 text-xs text-slate-500 flex items-center justify-between">
          <span>نمایش {filteredServices.length} لندینگ از {enrichedServices.length}</span>
          <div className="inline-flex items-center gap-1">
            <Award className="h-3.5 w-3.5 text-teal-600" /> نمره SEO: ۴.۶ از ۵
          </div>
        </div>
      </div>
    </div>
  );
}
