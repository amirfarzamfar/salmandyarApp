'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import {
  UserPen,
  GraduationCap,
  Users,
  ShieldCheck,
  Eye,
  Plus,
  Search,
  Filter,
  Pencil,
  Trash2,
  Award,
  FileText,
  Stethoscope,
  UserCheck
} from 'lucide-react';
import { authors, articles } from '@/lib/data/content-data';
import type { Author } from '@/lib/types/content';

const mockIsActive = [true, true, true, true, false];

export default function AuthorsAdminPage() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [specFilter, setSpecFilter] = useState('');

  const enrichedAuthors = useMemo(() => {
    return authors.map((author, index) => ({
      ...author,
      isActive: mockIsActive[index] ?? true
    }));
  }, []);

  const articlesByAuthor = useMemo(() => {
    const map = new Map<number, number>();
    const reviewed = new Map<number, number>();
    articles.forEach((article) => {
      if (article.authorId) {
        map.set(article.authorId, (map.get(article.authorId) ?? 0) + 1);
      }
      article.medicalReviews?.forEach((review) => {
        const rid = review.medicalReviewer?.id;
        if (rid) {
          reviewed.set(rid, (reviewed.get(rid) ?? 0) + 1);
        }
      });
    });
    return { written: map, reviewed };
  }, []);

  const specOptions = useMemo(() => {
    const set = new Set<string>();
    enrichedAuthors.forEach((a) => {
      if (a.specialization) set.add(a.specialization);
    });
    return Array.from(set);
  }, [enrichedAuthors]);

  const metrics = useMemo(() => {
    const total = enrichedAuthors.length;
    const reviewers = enrichedAuthors.filter((a) => a.isMedicalReviewer).length;
    const writers = enrichedAuthors.filter((a) => (articlesByAuthor.written.get(a.id) ?? 0) > 0).length;
    const totalArticles = Array.from(articlesByAuthor.written.values()).reduce((s, n) => s + n, 0);
    return { total, reviewers, writers, totalArticles };
  }, [enrichedAuthors, articlesByAuthor]);

  const getRoleBadge = (author: Author & { isActive: boolean }) => {
    const isWriter = (articlesByAuthor.written.get(author.id) ?? 0) > 0;
    const isReviewer = author.isMedicalReviewer;
    if (isWriter && isReviewer) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-l from-violet-100 to-blue-100 px-2.5 py-1 text-xs font-bold text-violet-700">
          <ShieldCheck className="h-3 w-3" />
          هردو
        </span>
      );
    }
    if (isReviewer) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-1 text-xs font-bold text-blue-700">
          <Stethoscope className="h-3 w-3" />
          بررسی‌کننده پزشکی
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700">
        <UserPen className="h-3 w-3" />
        نویسنده
      </span>
    );
  };

  const filteredAuthors = useMemo(() => {
    return enrichedAuthors.filter((author) => {
      if (search) {
        const s = search.toLowerCase();
        const full = `${author.firstName} ${author.lastName} ${author.fullName ?? ''} ${author.specialization ?? ''}`.toLowerCase();
        if (!full.includes(s)) return false;
      }
      if (roleFilter) {
        const isWriter = (articlesByAuthor.written.get(author.id) ?? 0) > 0;
        const isReviewer = author.isMedicalReviewer;
        if (roleFilter === 'writer' && !isWriter) return false;
        if (roleFilter === 'reviewer' && !isReviewer) return false;
        if (roleFilter === 'both' && !(isWriter && isReviewer)) return false;
      }
      if (specFilter && author.specialization !== specFilter) return false;
      return true;
    });
  }, [enrichedAuthors, search, roleFilter, specFilter, articlesByAuthor]);

  const handleDelete = (author: Author) => {
    toast.success(`عضو تیم «${author.fullName}» حذف شد.`);
  };

  const handleEdit = (author: Author) => {
    toast.success(`ویرایش «${author.fullName}» باز شد.`);
  };

  const handleCreate = () => {
    toast.success('فرم افزودن عضو تیم جدید باز شد.');
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8" dir="rtl">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="h-7 w-7 text-teal-600" />
            تیم محتوا و پزشکی
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            نویسندگان، پرستاران متخصص و بررسی‌کنندگان پزشکی (E-E-A-T)
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/authors"
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 inline-flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            پیش‌نمایش /authors
          </Link>
          <button
            type="button"
            onClick={handleCreate}
            className="rounded-xl bg-gradient-to-l from-teal-600 to-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-md shadow-teal-600/20 transition hover:from-teal-700 hover:to-emerald-700 inline-flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            افزودن عضو تیم
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-medium text-slate-500">کل اعضای تیم</div>
              <div className="mt-1 text-2xl font-bold text-slate-900">{metrics.total}</div>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-medium text-slate-500">بررسی‌کنندگان پزشکی</div>
              <div className="mt-1 text-2xl font-bold text-slate-900">{metrics.reviewers}</div>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
              <UserPen className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-medium text-slate-500">نویسندگان محتوا</div>
              <div className="mt-1 text-2xl font-bold text-slate-900">{metrics.writers}</div>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-medium text-slate-500">کل مقالات منتشرشده</div>
              <div className="mt-1 text-2xl font-bold text-slate-900">{metrics.totalArticles}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700">جستجو در تیم</label>
            <div className="relative">
              <Search className="absolute right-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="نام، تخصص یا شماره نظام پزشکی..."
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-4 pr-10 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 flex items-center gap-1">
              <Filter className="h-3.5 w-3.5" />
              سمی
            </label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
            >
              <option value="">همه</option>
              <option value="writer">فقط نویسنده</option>
              <option value="reviewer">فقط بررسی‌کننده پزشکی</option>
              <option value="both">نویسنده + بررسی‌کننده</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">تخصص</label>
            <select
              value={specFilter}
              onChange={(e) => setSpecFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
            >
              <option value="">همه تخصص‌ها</option>
              {specOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
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
                <th className="px-5 py-4 font-semibold">عضو تیم</th>
                <th className="px-5 py-4 font-semibold">تخصص</th>
                <th className="px-5 py-4 font-semibold">شماره نظام پزشکی</th>
                <th className="px-5 py-4 font-semibold">سمی</th>
                <th className="px-5 py-4 font-semibold">مقالات منتشرشده</th>
                <th className="px-5 py-4 font-semibold">مقالات بررسی‌شده</th>
                <th className="px-5 py-4 font-semibold">وضعیت</th>
                <th className="px-5 py-4 font-semibold">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAuthors.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center gap-3 text-slate-500">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                        <Users className="h-7 w-7 text-slate-400" />
                      </div>
                      <div className="font-medium">عضوی در تیم یافت نشد</div>
                      <div className="text-xs">عبارت دیگری را جستجو کنید یا فیلترها را تغییر دهید.</div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAuthors.map((author, idx) => (
                  <tr key={author.id} className="transition hover:bg-slate-50/80">
                    <td className="px-5 py-4 text-slate-500">{(idx + 1).toLocaleString('fa-IR')}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {author.profileImageUrl ? (
                          <img
                            src={author.profileImageUrl}
                            alt={author.fullName}
                            className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-100"
                          />
                        ) : (
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 text-sm font-bold text-white ring-2 ring-slate-100">
                            {author.firstName?.[0]}
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-slate-900">
                            {author.firstName} {author.lastName}
                          </div>
                          <div className="text-xs text-slate-500">{author.title ?? 'کارشناس سلامت'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-start gap-1.5">
                        <GraduationCap className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
                        <span className="text-xs text-slate-700 leading-relaxed">
                          {author.specialization ?? '—'}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      {author.medicalLicenseNumber ? (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-slate-50 px-2 py-1 text-xs font-mono text-slate-700 border border-slate-200" dir="ltr">
                          <Award className="h-3 w-3 text-teal-600" />
                          {author.medicalLicenseNumber}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4">{getRoleBadge(author)}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                          <FileText className="h-4 w-4" />
                        </div>
                        <span className="text-sm font-bold text-slate-800">
                          {(articlesByAuthor.written.get(author.id) ?? 0).toLocaleString('fa-IR')}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                          <ShieldCheck className="h-4 w-4" />
                        </div>
                        <span className="text-sm font-bold text-slate-800">
                          {(articlesByAuthor.reviewed.get(author.id) ?? 0).toLocaleString('fa-IR')}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      {(author as any).isActive ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700">
                          <UserCheck className="h-3 w-3" />
                          فعال
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-1 text-xs font-bold text-rose-700">
                          غیرفعال
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Link
                          href={`/authors/${author.slug ?? author.id}`}
                          className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 inline-flex items-center gap-1"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          پیش‌نمایش
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleEdit(author)}
                          className="rounded-lg border border-teal-200 bg-teal-50 px-2.5 py-1.5 text-xs font-medium text-teal-700 transition hover:bg-teal-100 inline-flex items-center gap-1"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          ویرایش
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(author)}
                          className="rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-medium text-rose-700 transition hover:bg-rose-100 inline-flex items-center gap-1"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          حذف
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="divide-y divide-slate-200 lg:hidden">
          {filteredAuthors.length === 0 ? (
            <div className="px-4 py-16 text-center text-slate-500">عضوی یافت نشد.</div>
          ) : (
            filteredAuthors.map((author, idx) => (
              <div key={author.id} className="space-y-4 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {author.profileImageUrl ? (
                      <img
                        src={author.profileImageUrl}
                        alt={author.fullName}
                        className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-100"
                      />
                    ) : (
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 text-sm font-bold text-white ring-2 ring-slate-100">
                        {author.firstName?.[0]}
                      </div>
                    )}
                    <div>
                      <div className="font-semibold text-slate-900">
                        {author.firstName} {author.lastName}
                      </div>
                      <div className="text-xs text-slate-500">{author.title ?? 'کارشناس سلامت'}</div>
                    </div>
                  </div>
                  {(author as any).isActive ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-700">
                      <UserCheck className="h-3 w-3" />
                      فعال
                    </span>
                  ) : (
                    <span className="rounded-full bg-rose-100 px-2 py-1 text-xs font-bold text-rose-700">غیرفعال</span>
                  )}
                </div>
                <div className="flex items-center gap-2">{getRoleBadge(author)}</div>
                <div className="text-xs text-slate-700 rounded-xl bg-slate-50 p-3">
                  <span className="text-slate-500">تخصص: </span>
                  {author.specialization ?? '—'}
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-xl bg-emerald-50 p-3">
                    <div className="text-xs text-emerald-700">مقالات منتشرشده</div>
                    <div className="mt-1 text-lg font-bold text-emerald-800">
                      {(articlesByAuthor.written.get(author.id) ?? 0).toLocaleString('fa-IR')}
                    </div>
                  </div>
                  <div className="rounded-xl bg-blue-50 p-3">
                    <div className="text-xs text-blue-700">مقالات بررسی‌شده</div>
                    <div className="mt-1 text-lg font-bold text-blue-800">
                      {(articlesByAuthor.reviewed.get(author.id) ?? 0).toLocaleString('fa-IR')}
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <Link
                    href={`/authors/${author.slug ?? author.id}`}
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 inline-flex items-center gap-1"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    پیش‌نمایش
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleEdit(author)}
                    className="rounded-lg border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs font-medium text-teal-700 inline-flex items-center gap-1"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    ویرایش
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(author)}
                    className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-700 inline-flex items-center gap-1"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    حذف
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="border-t border-slate-200 px-5 py-4 text-xs text-slate-500 flex items-center justify-between">
          <span>نمایش {filteredAuthors.length} نفر از {enrichedAuthors.length}</span>
          <div className="inline-flex items-center gap-1 text-slate-500">
            <Award className="h-3.5 w-3.5 text-teal-600" />
            اعتبار E-E-A-T: تایید شده
          </div>
        </div>
      </div>
    </div>
  );
}
