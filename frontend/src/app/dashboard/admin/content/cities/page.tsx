'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Plus,
  Eye,
  Search,
  Filter,
  Pencil,
  Trash2,
  Download,
  MapPin,
  Map,
  CheckCircle2,
  Users,
  Phone,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { City } from '@/lib/types/content';
import {
  cities,
  serviceSeoProfiles,
} from '@/lib/data/content-data';

type CityExt = City & {
  isFeatured?: boolean;
  isActive?: boolean;
};

const toFaDigits = (num: number | string) =>
  String(num).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[Number(d)]);

const formatNumber = (num: number) =>
  toFaDigits(num.toLocaleString('en-US'));

export default function CitiesAdminPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'featured'>('all');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const filtered = useMemo(() => {
    return (cities || []).filter((item) => {
      const c = item as CityExt;
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.slug.toLowerCase().includes(q) ||
        (c.province || '').toLowerCase().includes(q) ||
        (c.phoneNumber || '').includes(q);
      let matchesStatus = true;
      if (statusFilter === 'featured') matchesStatus = c.isFeatured === true;
      if (statusFilter === 'active') matchesStatus = c.isActive !== false;
      if (statusFilter === 'inactive') matchesStatus = c.isActive === false;
      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter]);

  const metrics = useMemo(() => {
    const list = (cities || []) as CityExt[];
    const featured = list.filter((c) => c.isFeatured === true).length;
    const population = list.reduce(
      (sum, c) => sum + (c.population || 0),
      0,
    );
    const activeServices = (serviceSeoProfiles || []).filter(
      (s) => s.showInHomePage,
    ).length;
    return { total: list.length, featured, population, activeServices };
  }, []);

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">مدیریت شهرها</h1>
          <p className="mt-2 text-sm text-slate-500">
            شهرهای تحت پوشش، مناطق سرویس‌دهی، اطلاعات تماس محلی و وضعیت فعال.
          </p>
        </div>
        <div className="flex flex-row-reverse flex-wrap items-center gap-2">
          <Link
            href="/cities"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <Eye className="h-4 w-4" />
            پیش‌نمایش عمومی /cities
          </Link>
          <Link
            href="#"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-teal-700"
          >
            <Plus className="h-4 w-4" />
            جدید +Plus
          </Link>
        </div>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="کل شهرها"
          value={metrics.total}
          icon={<MapPin className="h-5 w-5 text-teal-600" />}
          tint="bg-teal-50"
        />
        <MetricCard
          title="شهرهای ویژه"
          value={metrics.featured}
          icon={<CheckCircle2 className="h-5 w-5 text-amber-600" />}
          tint="bg-amber-50"
        />
        <MetricCard
          title="جمعیت کل"
          value={metrics.population}
          icon={<Users className="h-5 w-5 text-blue-600" />}
          tint="bg-blue-50"
          formatted
        />
        <MetricCard
          title="خدمات فعال در کل شهرها"
          value={metrics.activeServices}
          icon={<Map className="h-5 w-5 text-emerald-600" />}
          tint="bg-emerald-50"
        />
      </section>

      <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative">
              <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="جستجو: نام شهر، استان، شماره تماس..."
                className="w-full rounded-2xl border border-slate-200 bg-white py-2 pr-9 pl-3 text-sm outline-none focus:border-teal-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive' | 'featured')}
              className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-teal-500"
            >
              <option value="all">همه وضعیت‌ها</option>
              <option value="active">فعال</option>
              <option value="inactive">غیرفعال</option>
              <option value="featured">ویژه</option>
            </select>
          </div>
          <div className="flex flex-row-reverse items-center gap-2">
            <Button variant="outline" size="sm" className="flex-row-reverse">
              <Filter className="h-4 w-4" />
              فیلتر
            </Button>
            <Button variant="secondary" size="sm" className="flex-row-reverse">
              <Download className="h-4 w-4" />
              خروجی اکسل
            </Button>
          </div>
        </div>

        <div className="mt-5 overflow-x-auto">
          {filtered.length === 0 ? (
            <EmptyState
              title="هنوز شهری ثبت نشده است"
              description="با دکمه «جدید +Plus» اولین شهر را اضافه کنید."
              icon={<MapPin className="h-12 w-12 text-slate-300" />}
            />
          ) : (
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-slate-500">
                  <th className="px-3 py-3 text-right font-bold">ردیف</th>
                  <th className="px-3 py-3 text-right font-bold">نام شهر</th>
                  <th className="px-3 py-3 text-right font-bold">slug</th>
                  <th className="px-3 py-3 text-right font-bold">جمعیت</th>
                  <th className="px-3 py-3 text-right font-bold">مناطق تحت پوشش</th>
                  <th className="px-3 py-3 text-right font-bold">خدمات فعال</th>
                  <th className="px-3 py-3 text-right font-bold">شماره تماس محلی</th>
                  <th className="px-3 py-3 text-right font-bold">وضعیت فعال</th>
                  <th className="px-3 py-3 text-left font-bold">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((item, idx) => {
                  const c = item as CityExt;
                  const coverageCount = (c.coveredAreas || []).length;
                  const cityServices = (serviceSeoProfiles || []).filter(
                    (s) => s.showInHomePage,
                  ).length;
                  const population = c.population || 0;
                  const isActive = c.isActive !== false;
                  return (
                    <tr
                      key={c.id}
                      className="border-b border-slate-50 align-middle transition hover:bg-slate-50/60"
                    >
                      <td className="px-3 py-4 text-slate-600">
                        {toFaDigits((page - 1) * pageSize + idx + 1)}
                      </td>
                      <td className="px-3 py-4">
                        <div className="flex flex-row-reverse items-start gap-3">
                          <div className="rounded-2xl bg-teal-50 p-2 text-teal-600">
                            <MapPin className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="font-black text-gray-900">{c.name}</div>
                            {c.province && (
                              <div className="mt-0.5 text-xs text-slate-500">
                                استان {c.province}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-4 text-xs text-slate-500">
                        /{c.slug}
                      </td>
                      <td className="px-3 py-4 font-bold text-slate-700">
                        {population > 0 ? formatNumber(population) : '—'}
                      </td>
                      <td className="px-3 py-4 text-slate-700">
                        <span className="rounded-xl bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
                          {toFaDigits(coverageCount)} منطقه
                        </span>
                      </td>
                      <td className="px-3 py-4 text-slate-700">
                        <span className="rounded-xl bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                          {toFaDigits(cityServices)} خدمت
                        </span>
                      </td>
                      <td className="px-3 py-4">
                        {c.phoneNumber ? (
                          <a
                            href={`tel:${c.phoneNumber}`}
                            className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-700"
                          >
                            <Phone className="h-3 w-3" />
                            {toFaDigits(c.phoneNumber)}
                          </a>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-3 py-4">
                        <FakeSwitch value={isActive} />
                      </td>
                      <td className="px-3 py-4">
                        <div className="flex flex-row-reverse items-center justify-start gap-1">
                          <Link
                            href={`/cities/${c.slug}`}
                            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-slate-50"
                            title="پیش‌نمایش"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <button
                            type="button"
                            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-slate-50"
                            title="ویرایش"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            className="inline-flex items-center justify-center rounded-xl border border-red-100 bg-white p-2 text-red-600 transition hover:bg-red-50"
                            title="حذف"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {filtered.length > 0 && (
          <Pagination
            page={page}
            totalPages={totalPages}
            onChange={setPage}
          />
        )}
      </section>
    </div>
  );
}

function MetricCard({
  title,
  value,
  icon,
  tint = 'bg-slate-50',
  formatted = false,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  tint?: string;
  formatted?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex flex-row-reverse items-center justify-between">
        <div className="text-left">
          <div className="text-sm font-bold text-slate-500">{title}</div>
          <div className="mt-2 text-3xl font-black text-gray-900">
            {formatted ? formatNumber(value) : toFaDigits(value)}
          </div>
        </div>
        <div className={`rounded-2xl p-3 ${tint}`}>{icon}</div>
      </div>
    </div>
  );
}

function FakeSwitch({ value }: { value: boolean }) {
  return (
    <div
      className={`inline-flex h-5 w-9 items-center rounded-full transition ${
        value ? 'bg-teal-600' : 'bg-slate-200'
      }`}
    >
      <div
        className={`h-4 w-4 rounded-full bg-white shadow transition ${
          value ? 'mr-4' : 'mr-0.5'
        }`}
      />
    </div>
  );
}

function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (p: number) => void;
}) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  return (
    <div className="mt-5 flex flex-row-reverse items-center justify-between gap-3 border-t border-slate-100 pt-4">
      <div className="text-xs text-slate-500">
        صفحه {toFaDigits(page)} از {toFaDigits(totalPages)}
      </div>
      <div className="flex flex-row-reverse items-center gap-1">
        <button
          type="button"
          onClick={() => onChange(Math.max(1, page - 1))}
          disabled={page === 1}
          className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
        >
          قبلی
        </button>
        {pages.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
              p === page
                ? 'bg-teal-600 text-white shadow-sm'
                : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            {toFaDigits(p)}
          </button>
        ))}
        <button
          type="button"
          onClick={() => onChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
        >
          بعدی
        </button>
      </div>
    </div>
  );
}

function EmptyState({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      {icon}
      <div className="font-black text-gray-900">{title}</div>
      <div className="text-sm text-slate-500">{description}</div>
    </div>
  );
}
