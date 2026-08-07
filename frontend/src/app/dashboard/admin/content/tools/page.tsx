'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import {
  Calculator,
  List,
  Eye,
  Plus,
  Search,
  Filter,
  Pencil,
  Trash2,
  BarChart,
  Star,
  Video,
  CheckCircle2,
  XCircle,
  Award,
  Activity,
  Stethoscope
} from 'lucide-react';
import { healthTools, serviceSeoProfiles, articles, authors } from '@/lib/data/content-data';
import type { HealthTool } from '@/lib/types/content';

const mockUsageCounts = [1247, 892, 1534, 2100, 1876];
const mockFeatured = [true, false, true, true, false];
const mockStatus = ['Published', 'Published', 'Published', 'Draft', 'Published'];
const mockAuthorIds = [1, 2, 1, 2, 1];

const toolTypeLabels: Record<string, string> = {
  Calculator: 'ماشین حساب',
  Checklist: 'چک‌لیست',
  Assessment: 'امتیازبندی',
  Converter: 'مبدل',
  Tracker: 'راهنما'
};

const toolTypeBadgeClass: Record<string, string> = {
  Calculator: 'bg-blue-100 text-blue-700',
  Checklist: 'bg-emerald-100 text-emerald-700',
  Assessment: 'bg-violet-100 text-violet-700',
  Converter: 'bg-amber-100 text-amber-700',
  Tracker: 'bg-teal-100 text-teal-700'
};

const statusLabels: Record<string, { label: string; class: string }> = {
  Published: { label: 'انتشار یافته', class: 'bg-emerald-100 text-emerald-700' },
  Draft: { label: 'پیش‌نویس', class: 'bg-amber-100 text-amber-700' },
  Archived: { label: 'آرشیو شده', class: 'bg-slate-100 text-slate-600' },
  PendingReview: { label: 'در انتظار بررسی', class: 'bg-blue-100 text-blue-700' }
};

export default function ToolsAdminPage() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const enrichedTools = useMemo(() => {
    return healthTools.map((tool, index) => ({
      ...tool,
      usageCount: mockUsageCounts[index] ?? Math.floor(Math.random() * 1000) + 100,
      isFeatured: mockFeatured[index] ?? false,
      status: mockStatus[index] ?? 'Published',
      authorId: mockAuthorIds[index] ?? 1
    }));
  }, []);

  const authorMap = useMemo(() => {
    const map = new Map<number, typeof authors[0]>();
    authors.forEach((a) => map.set(a.id, a));
    return map;
  }, []);

  const metrics = useMemo(() => {
    const total = enrichedTools.length;
    const featured = enrichedTools.filter((t) => t.isFeatured).length;
    const totalUsage = enrichedTools.reduce((sum, t) => sum + (t.usageCount ?? 0), 0);
    const hasVideo = enrichedTools.filter((t) => t.howToUse && t.howToUse.length > 0).length;
    return { total, featured, totalUsage, hasVideo };
  }, [enrichedTools]);

  const filteredTools = useMemo(() => {
    return enrichedTools.filter((tool) => {
      if (search) {
        const s = search.toLowerCase();
        if (
          !tool.name.toLowerCase().includes(s) &&
          !tool.slug.toLowerCase().includes(s) &&
          !(tool.shortDescription ?? '').toLowerCase().includes(s)
        ) {
          return false;
        }
      }
      if (typeFilter && tool.toolType !== typeFilter) return false;
      if (statusFilter && (tool as any).status !== statusFilter) return false;
      return true;
    });
  }, [enrichedTools, search, typeFilter, statusFilter]);

  const handleDelete = (tool: HealthTool) => {
    toast.success(`ابزار «${tool.name}» با موفقیت حذف شد.`);
  };

  const handleEdit = (tool: HealthTool) => {
    toast.success(`در حال ویرایش «${tool.name}»...`);
  };

  const handleCreate = () => {
    toast.success('فرم ایجاد ابزار جدید باز شد.');
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8" dir="rtl">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Calculator className="h-7 w-7 text-teal-600" />
            مدیریت ابزارهای سلامت
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            ابزارهای محاسباتی و چک‌لیست‌های پرستاری
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/tools"
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 inline-flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            پیش‌نمایش /tools
          </Link>
          <button
            type="button"
            onClick={handleCreate}
            className="rounded-xl bg-gradient-to-l from-teal-600 to-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-md shadow-teal-600/20 transition hover:from-teal-700 hover:to-emerald-700 inline-flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            ابزار جدید
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600">
              <Calculator className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-medium text-slate-500">کل ابزارها</div>
              <div className="mt-1 text-2xl font-bold text-slate-900">{metrics.total}</div>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
              <Star className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-medium text-slate-500">ابزارهای ویژه</div>
              <div className="mt-1 text-2xl font-bold text-slate-900">{metrics.featured}</div>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
              <BarChart className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-medium text-slate-500">مجموع استفاده‌ها</div>
              <div className="mt-1 text-2xl font-bold text-slate-900">{metrics.totalUsage.toLocaleString('fa-IR')}</div>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600">
              <Video className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-medium text-slate-500">ابزارهای دارای راهنما</div>
              <div className="mt-1 text-2xl font-bold text-slate-900">{metrics.hasVideo}</div>
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
                placeholder="نام ابزار، نامک یا توضیح..."
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-4 pr-10 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 flex items-center gap-1">
              <Filter className="h-3.5 w-3.5" />
              نوع ابزار
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
            >
              <option value="">همه نوع‌ها</option>
              <option value="Calculator">ماشین حساب</option>
              <option value="Checklist">چک‌لیست</option>
              <option value="Assessment">ارزیابی</option>
              <option value="Converter">مبدل</option>
              <option value="Tracker">سایر</option>
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
              <option value="Published">انتشار یافته</option>
              <option value="Draft">پیش‌نویس</option>
              <option value="PendingReview">در انتظار بررسی</option>
              <option value="Archived">آرشیو شده</option>
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
                <th className="px-5 py-4 font-semibold">نام ابزار</th>
                <th className="px-5 py-4 font-semibold">نوع</th>
                <th className="px-5 py-4 font-semibold">استفاده</th>
                <th className="px-5 py-4 font-semibold">متخصص</th>
                <th className="px-5 py-4 font-semibold">نحوه استفاده</th>
                <th className="px-5 py-4 font-semibold">راهنمای تفسیر</th>
                <th className="px-5 py-4 font-semibold">وضعیت</th>
                <th className="px-5 py-4 font-semibold">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTools.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center gap-3 text-slate-500">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                        <Activity className="h-7 w-7 text-slate-400" />
                      </div>
                      <div className="font-medium">ابزاری یافت نشد</div>
                      <div className="text-xs">عبارت دیگری را جستجو کنید یا فیلترها را تغییر دهید.</div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTools.map((tool, idx) => {
                  const statusInfo = statusLabels[(tool as any).status] ?? statusLabels.Published;
                  const author = authorMap.get((tool as any).authorId);
                  return (
                    <tr key={tool.id} className="transition hover:bg-slate-50/80">
                      <td className="px-5 py-4 text-slate-500">{(idx + 1).toLocaleString('fa-IR')}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-100 to-emerald-100 text-teal-700">
                            {tool.toolType === 'Calculator' ? (
                              <Calculator className="h-5 w-5" />
                            ) : tool.toolType === 'Checklist' ? (
                              <List className="h-5 w-5" />
                            ) : tool.toolType === 'Assessment' ? (
                              <Stethoscope className="h-5 w-5" />
                            ) : (
                              <Activity className="h-5 w-5" />
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900">{tool.name}</div>
                            <div className="text-xs text-slate-500 font-mono" dir="ltr">/tools/{tool.slug}</div>
                          </div>
                          {(tool as any).isFeatured && (
                            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                              <Star className="h-3 w-3 inline -mt-0.5 ml-0.5" />
                              ویژه
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${toolTypeBadgeClass[tool.toolType] ?? 'bg-slate-100 text-slate-700'}`}>
                          {toolTypeLabels[tool.toolType] ?? tool.toolType}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-medium text-slate-700">
                        {((tool as any).usageCount ?? 0).toLocaleString('fa-IR')}
                      </td>
                      <td className="px-5 py-4">
                        {author ? (
                          <div className="flex items-center gap-2">
                            {author.profileImageUrl ? (
                              <img src={author.profileImageUrl} alt="" className="h-7 w-7 rounded-full object-cover ring-2 ring-slate-100" />
                            ) : (
                              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-100 text-[11px] font-bold text-teal-700">
                                {author.firstName?.[0]}
                              </div>
                            )}
                            <span className="text-xs text-slate-700">{author.fullName}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        {tool.howToUse ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">
                            <CheckCircle2 className="h-3 w-3" />
                            بله
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
                            <XCircle className="h-3 w-3" />
                            خیر
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        {tool.interpretationGuide ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">
                            <CheckCircle2 className="h-3 w-3" />
                            بله
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
                            <XCircle className="h-3 w-3" />
                            خیر
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusInfo.class}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <Link
                            href={`/tools/${tool.slug}`}
                            className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 inline-flex items-center gap-1"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            پیش‌نمایش
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleEdit(tool)}
                            className="rounded-lg border border-teal-200 bg-teal-50 px-2.5 py-1.5 text-xs font-medium text-teal-700 transition hover:bg-teal-100 inline-flex items-center gap-1"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            ویرایش
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(tool)}
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
          {filteredTools.length === 0 ? (
            <div className="px-4 py-16 text-center text-slate-500">ابزاری یافت نشد.</div>
          ) : (
            filteredTools.map((tool, idx) => {
              const statusInfo = statusLabels[(tool as any).status] ?? statusLabels.Published;
              const author = authorMap.get((tool as any).authorId);
              return (
                <div key={tool.id} className="space-y-4 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-100 to-emerald-100 text-teal-700">
                        {tool.toolType === 'Calculator' ? (
                          <Calculator className="h-5 w-5" />
                        ) : tool.toolType === 'Checklist' ? (
                          <List className="h-5 w-5" />
                        ) : (
                          <Activity className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">{tool.name}</div>
                        <div className="text-xs text-slate-500 font-mono" dir="ltr">/tools/{tool.slug}</div>
                      </div>
                    </div>
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${statusInfo.class}`}>
                      {statusInfo.label}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-xl bg-slate-50 p-3">
                      <div className="text-xs text-slate-500">نوع</div>
                      <div className="mt-1 font-medium text-slate-700">{toolTypeLabels[tool.toolType]}</div>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-3">
                      <div className="text-xs text-slate-500">استفاده</div>
                      <div className="mt-1 font-medium text-slate-700">
                        {((tool as any).usageCount ?? 0).toLocaleString('fa-IR')}
                      </div>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-3">
                      <div className="text-xs text-slate-500">متخصص</div>
                      <div className="mt-1 font-medium text-slate-700 text-xs">{author?.fullName ?? '-'}</div>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-3">
                      <div className="text-xs text-slate-500">ویژه</div>
                      <div className="mt-1">
                        {(tool as any).isFeatured ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700">
                            <Star className="h-3.5 w-3.5" /> بله
                          </span>
                        ) : (
                          <span className="text-xs text-slate-500">خیر</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Link
                      href={`/tools/${tool.slug}`}
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 inline-flex items-center gap-1"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      پیش‌نمایش
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleEdit(tool)}
                      className="rounded-lg border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs font-medium text-teal-700 inline-flex items-center gap-1"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      ویرایش
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(tool)}
                      className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-700 inline-flex items-center gap-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      حذف
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="border-t border-slate-200 px-5 py-4 text-xs text-slate-500 flex items-center justify-between">
          <span>نمایش {filteredTools.length} ابزار از {enrichedTools.length}</span>
          <div className="inline-flex items-center gap-1 text-slate-500">
            <Award className="h-3.5 w-3.5 text-teal-600" />
            تاریخ انقضا E-E-A-T: 3 ماه
          </div>
        </div>
      </div>
    </div>
  );
}
