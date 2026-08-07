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
  GraduationCap,
  Video,
  List,
  User,
  CheckCircle2,
  XCircle,
  Clock,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { Guide } from '@/lib/types/content';
import {
  guides,
} from '@/lib/data/content-data';

type GuideExt = Guide & {
  videoTutorialUrl?: string;
  videoPresentationUrl?: string;
  toolsRequired?: string[];
};

const toFaDigits = (num: number | string) =>
  String(num).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[Number(d)]);

export default function GuidesAdminPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'published' | 'draft' | 'featured' | 'video'
  >('all');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const filtered = useMemo(() => {
    return (guides || []).filter((item) => {
      const g = item as GuideExt;
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        g.title.toLowerCase().includes(q) ||
        g.slug.toLowerCase().includes(q) ||
        (g.primaryKeyword || '').toLowerCase().includes(q);
      let matchesStatus = true;
      if (statusFilter === 'featured') matchesStatus = g.isFeatured === true;
      if (statusFilter === 'published') matchesStatus = !!g.publishedAt;
      if (statusFilter === 'draft') matchesStatus = !g.publishedAt;
      if (statusFilter === 'video')
        matchesStatus = !!g.videoTutorialUrl || !!g.videoPresentationUrl;
      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter]);

  const metrics = useMemo(() => {
    const list = (guides || []) as GuideExt[];
    const withVideo = list.filter(
      (g) => !!g.videoTutorialUrl || !!g.videoPresentationUrl,
    ).length;
    const totalMinutes = list.reduce(
      (sum, g) => sum + (g.estimatedReadingTimeMinutes || 0),
      0,
    );
    const uniqueAuthorIds = new Set(
      list.filter((g) => g.authorId).map((g) => g.authorId),
    ).size;
    return {
      total: list.length,
      withVideo,
      totalMinutes,
      activeAuthors: uniqueAuthorIds,
    };
  }, []);

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  const defaultTools = ['دستکش استریل', 'گاز استریل', 'سرم فیزیولوژی'];

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">مدیریت راهنماها</h1>
          <p className="mt-2 text-sm text-slate-500">
            راهنماهای آموزشی، ویدیوها، مراحل گام به گام و نویسندگان محتوا.
          </p>
        </div>
        <div className="flex flex-row-reverse flex-wrap items-center gap-2">
          <Link
            href="/guides"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <Eye className="h-4 w-4" />
            پیش‌نمایش عمومی /guides
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
          title="کل راهنماها"
          value={metrics.total}
          icon={<GraduationCap className="h-5 w-5 text-teal-600" />}
          tint="bg-teal-50"
        />
        <MetricCard
          title="ویدیویی"
          value={metrics.withVideo}
          icon={<Video className="h-5 w-5 text-pink-600" />}
          tint="bg-pink-50"
        />
        <MetricCard
          title="زمان تخمینی مطالعه کل"
          value={metrics.totalMinutes}
          icon={<Clock className="h-5 w-5 text-indigo-600" />}
          tint="bg-indigo-50"
          suffix="دقیقه"
        />
        <MetricCard
          title="نویسندگان فعال"
          value={metrics.activeAuthors}
          icon={<Users className="h-5 w-5 text-amber-600" />}
          tint="bg-amber-50"
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
                placeholder="جستجو: عنوان راهنما، slug، کلمه کلیدی..."
                className="w-full rounded-2xl border border-slate-200 bg-white py-2 pr-9 pl-3 text-sm outline-none focus:border-teal-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'published' | 'draft' | 'featured' | 'video')}
              className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-teal-500"
            >
              <option value="all">همه وضعیت‌ها</option>
              <option value="published">منتشرشده</option>
              <option value="draft">پیش‌نویس</option>
              <option value="featured">ویژه</option>
              <option value="video">دارای ویدیو</option>
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
              title="هنوز راهنمایی ثبت نشده است"
              description="با دکمه «جدید +Plus» اولین راهنمای آموزشی را اضافه کنید."
              icon={<GraduationCap className="h-12 w-12 text-slate-300" />}
            />
          ) : (
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-slate-500">
                  <th className="px-3 py-3 text-right font-bold">ردیف</th>
                  <th className="px-3 py-3 text-right font-bold">عنوان راهنما</th>
                  <th className="px-3 py-3 text-right font-bold">دسته‌بندی</th>
                  <th className="px-3 py-3 text-right font-bold">نویسنده</th>
                  <th className="px-3 py-3 text-right font-bold">زمان تخمینی</th>
                  <th className="px-3 py-3 text-right font-bold">ابزارهای موردنیاز</th>
                  <th className="px-3 py-3 text-right font-bold">وضعیت منتشرشده</th>
                  <th className="px-3 py-3 text-right font-bold">تعداد مراحل</th>
                  <th className="px-3 py-3 text-left font-bold">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((item, idx) => {
                  const g = item as GuideExt;
                  const steps = g.steps || [];
                  const stepCount = steps.length;
                  const isPublished = !!g.publishedAt;
                  const hasVideo =
                    !!g.videoTutorialUrl ||
                    !!g.videoPresentationUrl;
                  const cat = g.category;
                  const auth = g.author;
                  const estimated = g.estimatedReadingTimeMinutes || 0;
                  const tools: string[] = g.toolsRequired || defaultTools;
                  return (
                    <tr
                      key={g.id}
                      className="border-b border-slate-50 align-middle transition hover:bg-slate-50/60"
                    >
                      <td className="px-3 py-4 text-slate-600">
                        {toFaDigits((page - 1) * pageSize + idx + 1)}
                      </td>
                      <td className="px-3 py-4">
                        <div className="flex items-start gap-2">
                          <div>
                            <div className="font-black text-gray-900">
                              {g.title}
                            </div>
                            <div className="mt-0.5 flex flex-row-reverse items-center gap-2">
                              <span className="text-xs text-slate-500">
                                /{g.slug}
                              </span>
                              {hasVideo && (
                                <span className="inline-flex items-center gap-1 rounded-full border border-pink-200 bg-pink-50 px-2 py-0.5 text-[10px] font-bold text-pink-700">
                                  <Video className="h-3 w-3" />
                                  ویدیو
                                </span>
                              )}
                              {g.isFeatured && (
                                <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                                  ویژه
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-4">
                        {cat ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-teal-200 bg-teal-50 px-2.5 py-0.5 text-xs font-bold text-teal-700">
                            <List className="h-3 w-3" />
                            {cat.name}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-3 py-4">
                        {auth ? (
                          <div className="flex flex-row-reverse items-center gap-2">
                            <div className="rounded-full bg-slate-100 p-1.5 text-slate-500">
                              <User className="h-3 w-3" />
                            </div>
                            <div className="text-left">
                              <div className="text-xs font-black text-slate-800">
                                {auth.fullName || `${auth.firstName} ${auth.lastName}`}
                              </div>
                              {auth.title && (
                                <div className="text-[10px] text-slate-500">
                                  {auth.title}
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-3 py-4">
                        {estimated > 0 ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-indigo-700">
                            <Clock className="h-3 w-3" />
                            {toFaDigits(estimated)} دقیقه
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-3 py-4">
                        <div className="flex flex-wrap flex-row-reverse items-center gap-1">
                          {tools.slice(0, 2).map((t) => (
                            <span
                              key={t}
                              className="rounded-xl bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600"
                            >
                              {t}
                            </span>
                          ))}
                          {tools.length > 2 && (
                            <span className="rounded-xl bg-slate-50 border border-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                              +{toFaDigits(tools.length - 2)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-4">
                        {isPublished ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                            <CheckCircle2 className="h-3 w-3" />
                            منتشرشده
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-bold text-slate-500">
                            <XCircle className="h-3 w-3" />
                            پیش‌نویس
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-4 text-slate-700">
                        {stepCount > 0 ? (
                          <span className="rounded-xl bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
                            {toFaDigits(stepCount)} مرحله
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-3 py-4">
                        <div className="flex flex-row-reverse items-center justify-start gap-1">
                          <Link
                            href={`/guides/${g.slug}`}
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
  suffix,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  tint?: string;
  suffix?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex flex-row-reverse items-center justify-between">
        <div className="text-left">
          <div className="text-sm font-bold text-slate-500">{title}</div>
          <div className="mt-2 flex items-baseline gap-1 text-gray-900">
            <span className="text-3xl font-black">{toFaDigits(value)}</span>
            {suffix && (
              <span className="text-xs font-bold text-slate-500">
                {suffix}
              </span>
            )}
          </div>
        </div>
        <div className={`rounded-2xl p-3 ${tint}`}>{icon}</div>
      </div>
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
