'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import {
  Folder,
  Hash,
  TreeDeciduous,
  Tags,
  Plus,
  Pencil,
  Trash2,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  XCircle,
  Layers,
  FileText,
  Award,
  X,
  Loader2
} from 'lucide-react';
import { contentCategories, contentTags, articles } from '@/lib/data/content-data';
import type { ContentCategory, ContentTag } from '@/lib/types/content';
import adminContentApi, { type CategoryItem, type TagItem } from '@/lib/content-admin-api';

export default function TaxonomyAdminPage() {
  const [catSearch, setCatSearch] = useState('');
  const [tagSearch, setTagSearch] = useState('');
  const [expandedCats, setExpandedCats] = useState<Set<number>>(new Set());

  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [tags, setTags] = useState<TagItem[]>([]);
  const [loading, setLoading] = useState<{ cats: boolean; tags: boolean }>({ cats: true, tags: true });

  const [catModalOpen, setCatModalOpen] = useState(false);
  const [tagModalOpen, setTagModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState<'cat' | 'tag' | null>(null);
  const [deletingId, setDeletingId] = useState<{ kind: 'cat' | 'tag'; id: number } | null>(null);

  const [catForm, setCatForm] = useState({ name: '', slug: '', description: '', parentId: 0 as number | '', displayOrder: 0 as number | '', isActive: true, showInMenu: true, metaTitle: '', metaDescription: '' });
  const [tagForm, setTagForm] = useState({ name: '', slug: '', description: '', isActive: true, metaTitle: '', metaDescription: '' });

  useEffect(() => {
    let alive = true;
    setLoading({ cats: true, tags: true });
    Promise.all([
      adminContentApi.listCategories().catch(() => null),
      adminContentApi.listTags().catch(() => null),
    ]).then(([catsData, tagsData]) => {
      if (!alive) return;
      if (Array.isArray(catsData) && catsData.length > 0) setCategories(catsData);
      else setCategories((contentCategories as unknown) as CategoryItem[]);
      if (Array.isArray(tagsData) && tagsData.length > 0) setTags(tagsData);
      else setTags((contentTags as unknown) as TagItem[]);
      setLoading({ cats: false, tags: false });
    });
    return () => { alive = false; };
  }, []);

  const refresh = (kind: 'cats' | 'tags' | 'both' = 'both') => {
    if (kind === 'cats' || kind === 'both') {
      setLoading(prev => ({ ...prev, cats: true }));
      adminContentApi.listCategories()
        .then(data => setCategories(data))
        .catch(() => setCategories((contentCategories as unknown) as CategoryItem[]))
        .finally(() => setLoading(prev => ({ ...prev, cats: false })));
    }
    if (kind === 'tags' || kind === 'both') {
      setLoading(prev => ({ ...prev, tags: true }));
      adminContentApi.listTags()
        .then(data => setTags(data))
        .catch(() => setTags((contentTags as unknown) as TagItem[]))
        .finally(() => setLoading(prev => ({ ...prev, tags: false })));
    }
  };

  const articleCountByCategory = useMemo(() => {
    const m = new Map<number, number>();
    if (Array.isArray(categories)) categories.forEach(c => { if ((c as any).articleCount) m.set(c.id, (c as any).articleCount); });
    if (m.size === 0) articles.forEach((a) => { if (a.categoryId) m.set(a.categoryId, (m.get(a.categoryId) ?? 0) + 1); });
    return m;
  }, [categories]);

  const articleCountByTag = useMemo(() => {
    const m = new Map<number, number>();
    if (Array.isArray(tags)) tags.forEach(t => { if ((t as any).articleCount) m.set(t.id, (t as any).articleCount); });
    if (m.size === 0) articles.forEach((a) => { a.tags?.forEach((t) => { m.set(t.id, (m.get(t.id) ?? 0) + 1); }); });
    return m;
  }, [tags]);

  const catMetrics = useMemo(() => {
    const total = categories.length;
    const roots = categories.filter((c) => !(c as any).parentId).length;
    const subs = total - roots;
    return { total, roots, subs };
  }, [categories]);

  const tagMetrics = useMemo(() => {
    const sorted = tags
      .map((t) => ({ tag: t, count: articleCountByTag.get(t.id) ?? 0 }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    return { total: tags.length, top: sorted };
  }, [tags, articleCountByTag]);

  const filteredCategories = useMemo(() => {
    if (!catSearch) return categories;
    const q = catSearch.toLowerCase();
    return categories.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.slug.toLowerCase().includes(q) ||
        ((c as any).description ?? '').toLowerCase().includes(q)
    );
  }, [catSearch, categories]);

  const filteredTags = useMemo(() => {
    if (!tagSearch) return tags;
    const q = tagSearch.toLowerCase();
    return tags.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.slug.toLowerCase().includes(q) ||
        ((t as any).description ?? '').toLowerCase().includes(q)
    );
  }, [tagSearch, tags]);

  const toggleExpand = (id: number) => {
    setExpandedCats((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const getParentName = (parentId?: number | null) => {
    if (!parentId) return null;
    return categories.find((c) => c.id === parentId)?.name ?? (contentCategories.find((c: any) => c.id === parentId)?.name ?? null);
  };

  const tagColors = [
    'bg-violet-100 text-violet-700',
    'bg-blue-100 text-blue-700',
    'bg-emerald-100 text-emerald-700',
    'bg-amber-100 text-amber-700',
    'bg-rose-100 text-rose-700',
    'bg-teal-100 text-teal-700',
    'bg-sky-100 text-sky-700',
    'bg-fuchsia-100 text-fuchsia-700'
  ];
  const getTagColor = (id: number) => tagColors[id % tagColors.length];

  const autoSlug = (name: string) => name
    .trim()
    .toLowerCase()
    .replace(/[\s\u200c]+/g, '-')
    .replace(/[^a-z0-9\-آ-ی]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  const handleCreateCat = () => {
    setCatForm({ name: '', slug: '', description: '', parentId: 0, displayOrder: 0, isActive: true, showInMenu: true, metaTitle: '', metaDescription: '' });
    setCatModalOpen(true);
  };
  const submitCreateCat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catForm.name.trim() || !catForm.slug.trim()) { toast.error('نام و نامک الزامی است'); return; }
    setSubmitting('cat');
    try {
      const res: any = await adminContentApi.createCategory({
        name: catForm.name.trim(), slug: catForm.slug.trim(), description: catForm.description || null,
        parentId: Number(catForm.parentId) || 0, displayOrder: Number(catForm.displayOrder) || 0,
        isActive: catForm.isActive, showInMenu: catForm.showInMenu,
        metaTitle: catForm.metaTitle || null, metaDescription: catForm.metaDescription || null,
      });
      toast.success(res?.message || 'دسته‌بندی با موفقیت ساخته شد');
      setCatModalOpen(false);
      refresh('cats');
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? 'خطا در ساخت دسته‌بندی';
      toast.error(msg);
    } finally { setSubmitting(null); }
  };

  const handleCreateTag = () => {
    setTagForm({ name: '', slug: '', description: '', isActive: true, metaTitle: '', metaDescription: '' });
    setTagModalOpen(true);
  };
  const submitCreateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tagForm.name.trim() || !tagForm.slug.trim()) { toast.error('نام و نامک الزامی است'); return; }
    setSubmitting('tag');
    try {
      const res: any = await adminContentApi.createTag({
        name: tagForm.name.trim(), slug: tagForm.slug.trim(), description: tagForm.description || null,
        isActive: tagForm.isActive,
        metaTitle: tagForm.metaTitle || null, metaDescription: tagForm.metaDescription || null,
      });
      toast.success(res?.message || 'برچسب با موفقیت ساخته شد');
      setTagModalOpen(false);
      refresh('tags');
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? 'خطا در ساخت برچسب';
      toast.error(msg);
    } finally { setSubmitting(null); }
  };

  const handleDeleteCat = async (c: CategoryItem) => {
    if (!confirm(`آیا از حذف دسته «${c.name}» مطمئن هستید؟`)) return;
    setDeletingId({ kind: 'cat', id: c.id });
    try {
      const res: any = await adminContentApi.deleteCategory(c.id);
      toast.success(res?.message || 'دسته‌بندی با موفقیت حذف شد');
      refresh('cats');
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? 'خطا در حذف دسته‌بندی';
      toast.error(msg);
    } finally { setDeletingId(null); }
  };
  const handleEditCat = (c: CategoryItem) => {
    toast.success(`ویرایش دسته «${c.name}» (بعداً پیاده‌سازی)`);
  };

  const handleDeleteTag = async (t: TagItem) => {
    if (!confirm(`آیا از حذف برچسب «${t.name}» مطمئن هستید؟`)) return;
    setDeletingId({ kind: 'tag', id: t.id });
    try {
      const res: any = await adminContentApi.deleteTag(t.id);
      toast.success(res?.message || 'برچسب با موفقیت حذف شد');
      refresh('tags');
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? 'خطا در حذف برچسب';
      toast.error(msg);
    } finally { setDeletingId(null); }
  };
  const handleEditTag = (t: TagItem) => {
    toast.success(`ویرایش برچسب «${t.name}» (بعداً پیاده‌سازی)`);
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8" dir="rtl">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Layers className="h-7 w-7 text-teal-600" />
            دسته‌بندی‌ها و برچسب‌ها
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            ساختار درختی دسته‌بندی مقالات (Topic Clusters) و برچسب‌های پزشکی
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleCreateTag}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 inline-flex items-center gap-2"
          >
            <Tags className="h-4 w-4 text-violet-600" />
            برچسب جدید
          </button>
          <button
            type="button"
            onClick={handleCreateCat}
            className="rounded-xl bg-gradient-to-l from-teal-600 to-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-md shadow-teal-600/20 transition hover:from-teal-700 hover:to-emerald-700 inline-flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            دسته جدید
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* CARD 1: Categories */}
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 bg-gradient-to-l from-teal-50/60 to-slate-50">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-700">
                  <Folder className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    📁 دسته‌بندی‌های محتوا
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">ساختار درختی و Topic Clusters</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCreateCat}
                className="rounded-xl border border-teal-200 bg-teal-50 px-3 py-2 text-xs font-bold text-teal-700 transition hover:bg-teal-100 inline-flex items-center gap-1"
              >
                <Plus className="h-3.5 w-3.5" />
                دسته
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="rounded-xl bg-white p-3 border border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-100 text-teal-700">
                    <TreeDeciduous className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-500">کل</div>
                    <div className="text-lg font-bold text-slate-800">
                      {catMetrics.total.toLocaleString('fa-IR')}
                    </div>
                  </div>
                </div>
              </div>
              <div className="rounded-xl bg-white p-3 border border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                    <Folder className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-500">دسته‌های اصلی</div>
                    <div className="text-lg font-bold text-slate-800">
                      {catMetrics.roots.toLocaleString('fa-IR')}
                    </div>
                  </div>
                </div>
              </div>
              <div className="rounded-xl bg-white p-3 border border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                    <ChevronDown className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-500">زیرمجموعه</div>
                    <div className="text-lg font-bold text-slate-800">
                      {catMetrics.subs.toLocaleString('fa-IR')}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative mt-4">
              <Hash className="absolute right-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={catSearch}
                onChange={(e) => setCatSearch(e.target.value)}
                placeholder="جستجو در دسته‌ها..."
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-4 pr-10 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
              />
            </div>
          </div>

          <div className="overflow-x-auto flex-1">
            {loading.cats ? (
              <div className="p-8 flex flex-col items-center justify-center gap-2 text-slate-500">
                <Loader2 className="h-6 w-6 animate-spin text-teal-600" />
                <span className="text-sm">در حال بارگذاری دسته‌بندی‌ها...</span>
              </div>
            ) : (
              <table className="w-full text-right text-sm">
                <thead className="border-b border-slate-200 bg-slate-50/60 text-slate-600 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-xs">شناسه</th>
                    <th className="px-4 py-3 font-semibold text-xs">نام</th>
                    <th className="px-4 py-3 font-semibold text-xs">والد</th>
                    <th className="px-4 py-3 font-semibold text-xs">نمایش در منو</th>
                    <th className="px-4 py-3 font-semibold text-xs">مقالات</th>
                    <th className="px-4 py-3 font-semibold text-xs">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCategories.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                        <div className="flex flex-col items-center gap-2">
                          <Folder className="h-8 w-8 text-slate-300" />
                          <span className="text-sm">دسته‌ای یافت نشد</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredCategories.map((c) => {
                      const hasChildren = categories.some((x) => (x as any).parentId === c.id);
                      const count = articleCountByCategory.get(c.id) ?? 0;
                      const isDeleting = deletingId?.kind === 'cat' && deletingId.id === c.id;
                      return (
                        <tr key={c.id} className="transition hover:bg-slate-50/60">
                          <td className="px-4 py-3 text-slate-500 font-mono text-xs">#{c.id}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              {hasChildren && (
                                <button
                                  type="button"
                                  onClick={() => toggleExpand(c.id)}
                                  className="p-1 rounded-md hover:bg-slate-200 transition"
                                >
                                  {expandedCats.has(c.id) ? (
                                    <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
                                  ) : (
                                    <ChevronRight className="h-3.5 w-3.5 text-slate-500" />
                                  )}
                                </button>
                              )}
                              {!hasChildren && <span className="w-6" />}
                              <div className="flex items-center gap-2">
                                <div
                                  className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                                    (c as any).parentId ? 'bg-blue-100 text-blue-700' : 'bg-teal-100 text-teal-700'
                                  }`}
                                >
                                  <Folder className="h-4 w-4" />
                                </div>
                                <div>
                                  <div className="font-semibold text-slate-800">{c.name}</div>
                                  <div className="text-[11px] text-slate-500 font-mono" dir="ltr">
                                    /{c.slug}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            {getParentName((c as any).parentId) ? (
                              <span className="rounded-lg bg-slate-100 px-2 py-1 text-[11px] text-slate-700">
                                {getParentName((c as any).parentId)}
                              </span>
                            ) : (
                              <span className="text-[11px] text-slate-400">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {(c as any).showInMenu ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
                                <CheckCircle2 className="h-3 w-3" />
                                بله
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-500">
                                <XCircle className="h-3 w-3" />
                                خیر
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center gap-1 rounded-lg bg-slate-50 border border-slate-200 px-2 py-1 text-[11px] font-bold text-slate-700">
                              <FileText className="h-3 w-3 text-teal-600" />
                              {count.toLocaleString('fa-IR')}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleEditCat(c)}
                                className="rounded-lg border border-teal-200 bg-teal-50 px-2 py-1 text-[11px] font-bold text-teal-700 inline-flex items-center gap-1 transition hover:bg-teal-100"
                              >
                                <Pencil className="h-3 w-3" />
                                ویرایش
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteCat(c)}
                                disabled={isDeleting}
                                className="rounded-lg border border-rose-200 bg-rose-50 px-2 py-1 text-[11px] font-bold text-rose-700 inline-flex items-center gap-1 transition hover:bg-rose-100 disabled:opacity-50"
                              >
                                {isDeleting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
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
            )}
          </div>
          <div className="px-4 py-3 text-[11px] text-slate-500 border-t border-slate-100 bg-slate-50/40 flex items-center justify-between">
            <span>نمایش {filteredCategories.length} دسته از {categories.length}</span>
            <span className="inline-flex items-center gap-1">
              <Award className="h-3 w-3 text-teal-600" /> Silo structure: {catMetrics.roots} خوشه اصلی
            </span>
          </div>
        </section>

        {/* CARD 2: Tags */}
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 bg-gradient-to-l from-violet-50/60 to-slate-50">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-700">
                  <Tags className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    🏷️ برچسب‌ها (Content Tags)
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">برچسب‌های پزشکی و موضوعی</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCreateTag}
                className="rounded-xl border border-violet-200 bg-violet-50 px-3 py-2 text-xs font-bold text-violet-700 transition hover:bg-violet-100 inline-flex items-center gap-1"
              >
                <Plus className="h-3.5 w-3.5" />
                برچسب
              </button>
            </div>

            <div className="mt-4 rounded-xl bg-white p-3 border border-slate-100">
              <div className="flex items-center justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 text-violet-700">
                    <Award className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-500">۵ برچسب پرکاربرد</div>
                    <div className="text-lg font-bold text-slate-800">
                      {tagMetrics.total.toLocaleString('fa-IR')} <span className="text-sm text-slate-400 font-normal">کل</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {tagMetrics.top.map(({ tag, count }) => (
                  <span
                    key={tag.id}
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${getTagColor(tag.id)}`}
                  >
                    #{tag.name}
                    <span className="rounded-full bg-white/70 px-1.5 text-[10px] text-slate-600">
                      {count.toLocaleString('fa-IR')}
                    </span>
                  </span>
                ))}
                {tagMetrics.top.length === 0 && (
                  <span className="text-xs text-slate-400 py-1 px-2">هنوز برچسبی ثبت نشده</span>
                )}
              </div>
            </div>

            <div className="relative mt-4">
              <Hash className="absolute right-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={tagSearch}
                onChange={(e) => setTagSearch(e.target.value)}
                placeholder="جستجو در برچسب‌ها..."
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-4 pr-10 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-100"
              />
            </div>
          </div>

          <div className="overflow-x-auto flex-1">
            {loading.tags ? (
              <div className="p-8 flex flex-col items-center justify-center gap-2 text-slate-500">
                <Loader2 className="h-6 w-6 animate-spin text-violet-600" />
                <span className="text-sm">در حال بارگذاری برچسب‌ها...</span>
              </div>
            ) : (
              <table className="w-full text-right text-sm">
                <thead className="border-b border-slate-200 bg-slate-50/60 text-slate-600 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-xs">شناسه</th>
                    <th className="px-4 py-3 font-semibold text-xs">نام برچسب</th>
                    <th className="px-4 py-3 font-semibold text-xs">فعال</th>
                    <th className="px-4 py-3 font-semibold text-xs">تعداد مقاله</th>
                    <th className="px-4 py-3 font-semibold text-xs">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTags.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-12 text-center text-slate-500">
                        <div className="flex flex-col items-center gap-2">
                          <Tags className="h-8 w-8 text-slate-300" />
                          <span className="text-sm">برچسبی یافت نشد</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredTags.map((t) => {
                      const count = articleCountByTag.get(t.id) ?? 0;
                      const isDeleting = deletingId?.kind === 'tag' && deletingId.id === t.id;
                      return (
                        <tr key={t.id} className="transition hover:bg-slate-50/60">
                          <td className="px-4 py-3 text-slate-500 font-mono text-xs">#{t.id}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className={`rounded-lg px-2 py-1 text-xs font-bold ${getTagColor(t.id)}`}>#{t.name}</span>
                              <span className="text-[11px] text-slate-500 font-mono" dir="ltr">/{t.slug}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            {(t as any).isActive ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
                                <CheckCircle2 className="h-3 w-3" /> بله
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-500">
                                <XCircle className="h-3 w-3" /> خیر
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center gap-1 rounded-lg bg-slate-50 border border-slate-200 px-2 py-1 text-[11px] font-bold text-slate-700">
                              <FileText className="h-3 w-3 text-violet-600" />
                              {count.toLocaleString('fa-IR')}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleEditTag(t)}
                                className="rounded-lg border border-violet-200 bg-violet-50 px-2 py-1 text-[11px] font-bold text-violet-700 inline-flex items-center gap-1 transition hover:bg-violet-100"
                              >
                                <Pencil className="h-3 w-3" />
                                ویرایش
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteTag(t)}
                                disabled={isDeleting}
                                className="rounded-lg border border-rose-200 bg-rose-50 px-2 py-1 text-[11px] font-bold text-rose-700 inline-flex items-center gap-1 transition hover:bg-rose-100 disabled:opacity-50"
                              >
                                {isDeleting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
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
            )}
          </div>
          <div className="px-4 py-3 text-[11px] text-slate-500 border-t border-slate-100 bg-slate-50/40 flex items-center justify-between">
            <span>نمایش {filteredTags.length} برچسب از {tags.length}</span>
            <span className="inline-flex items-center gap-1">
              <Hash className="h-3 w-3 text-violet-600" /> Tag cloud فعال
            </span>
          </div>
        </section>
      </div>

      {/* ================ MODAL: Create Category ================ */}
      {catModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" dir="rtl">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-gradient-to-l from-teal-50/60 to-slate-50">
              <h3 className="text-lg font-bold text-slate-900 inline-flex items-center gap-2">
                <Plus className="h-5 w-5 text-teal-600" /> دسته‌بندی جدید
              </h3>
              <button type="button" onClick={() => setCatModalOpen(false)} disabled={submitting === 'cat'} className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-50">
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>
            <form onSubmit={submitCreateCat} className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">نام دسته *</label>
                  <input type="text" required value={catForm.name}
                    onChange={(e) => setCatForm(p => ({ ...p, name: e.target.value, slug: p.slug || autoSlug(e.target.value) }))}
                    placeholder="مثلاً دیابت"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">نامک (Slug) *</label>
                  <input type="text" required dir="ltr" value={catForm.slug}
                    onChange={(e) => setCatForm(p => ({ ...p, slug: e.target.value }))}
                    placeholder="example-slug"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">توضیحات کوتاه</label>
                <textarea rows={2} value={catForm.description}
                  onChange={(e) => setCatForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="توضیح مختصر دسته‌بندی..."
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100 resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">دسته والد</label>
                  <select value={String(catForm.parentId)}
                    onChange={(e) => setCatForm(p => ({ ...p, parentId: Number(e.target.value) }))}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100 bg-white">
                    <option value="0">دسته اصلی</option>
                    {categories.filter(c => !(c as any).parentId).map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">ترتیب نمایش</label>
                  <input type="number" min={0} value={catForm.displayOrder}
                    onChange={(e) => setCatForm(p => ({ ...p, displayOrder: Number(e.target.value) }))}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Meta Title</label>
                  <input type="text" value={catForm.metaTitle}
                    onChange={(e) => setCatForm(p => ({ ...p, metaTitle: e.target.value }))}
                    placeholder="عنوان سئو"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Meta Description</label>
                  <input type="text" value={catForm.metaDescription}
                    onChange={(e) => setCatForm(p => ({ ...p, metaDescription: e.target.value }))}
                    placeholder="توضیحات سئو (160 کاراکتر)"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100" />
                </div>
              </div>
              <div className="flex items-center gap-6 pt-1">
                <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer select-none">
                  <input type="checkbox" checked={catForm.isActive} onChange={(e) => setCatForm(p => ({ ...p, isActive: e.target.checked }))}
                    className="w-4 h-4 text-teal-600 border-slate-300 rounded focus:ring-teal-500" />
                  فعال است
                </label>
                <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer select-none">
                  <input type="checkbox" checked={catForm.showInMenu} onChange={(e) => setCatForm(p => ({ ...p, showInMenu: e.target.checked }))}
                    className="w-4 h-4 text-teal-600 border-slate-300 rounded focus:ring-teal-500" />
                  نمایش در منو
                </label>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 -mx-5 -mb-5 px-5 py-4 bg-slate-50/60">
                <button type="button" onClick={() => setCatModalOpen(false)} disabled={submitting === 'cat'}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50">
                  انصراف
                </button>
                <button type="submit" disabled={submitting === 'cat'}
                  className="rounded-xl bg-gradient-to-l from-teal-600 to-emerald-600 px-5 py-2 text-sm font-bold text-white shadow-md shadow-teal-600/20 transition hover:from-teal-700 hover:to-emerald-700 inline-flex items-center gap-2 disabled:opacity-60">
                  {submitting === 'cat' ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  ذخیره دسته‌بندی
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================ MODAL: Create Tag ================ */}
      {tagModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" dir="rtl">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-gradient-to-l from-violet-50/60 to-slate-50">
              <h3 className="text-lg font-bold text-slate-900 inline-flex items-center gap-2">
                <Plus className="h-5 w-5 text-violet-600" /> برچسب جدید
              </h3>
              <button type="button" onClick={() => setTagModalOpen(false)} disabled={submitting === 'tag'} className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-50">
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>
            <form onSubmit={submitCreateTag} className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">نام برچسب *</label>
                  <input type="text" required value={tagForm.name}
                    onChange={(e) => setTagForm(p => ({ ...p, name: e.target.value, slug: p.slug || autoSlug(e.target.value) }))}
                    placeholder="مثلاً قند خون"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-100" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">نامک (Slug) *</label>
                  <input type="text" required dir="ltr" value={tagForm.slug}
                    onChange={(e) => setTagForm(p => ({ ...p, slug: e.target.value }))}
                    placeholder="tag-slug"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-100" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">توضیحات کوتاه</label>
                <textarea rows={2} value={tagForm.description}
                  onChange={(e) => setTagForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="توضیح مختصر برچسب..."
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-100 resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Meta Title</label>
                  <input type="text" value={tagForm.metaTitle}
                    onChange={(e) => setTagForm(p => ({ ...p, metaTitle: e.target.value }))}
                    placeholder="عنوان سئو"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-100" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Meta Description</label>
                  <input type="text" value={tagForm.metaDescription}
                    onChange={(e) => setTagForm(p => ({ ...p, metaDescription: e.target.value }))}
                    placeholder="توضیحات سئو"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-100" />
                </div>
              </div>
              <div className="flex items-center gap-6 pt-1">
                <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer select-none">
                  <input type="checkbox" checked={tagForm.isActive} onChange={(e) => setTagForm(p => ({ ...p, isActive: e.target.checked }))}
                    className="w-4 h-4 text-violet-600 border-slate-300 rounded focus:ring-violet-500" />
                  فعال است
                </label>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 -mx-5 -mb-5 px-5 py-4 bg-slate-50/60">
                <button type="button" onClick={() => setTagModalOpen(false)} disabled={submitting === 'tag'}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50">
                  انصراف
                </button>
                <button type="submit" disabled={submitting === 'tag'}
                  className="rounded-xl bg-gradient-to-l from-violet-600 to-purple-600 px-5 py-2 text-sm font-bold text-white shadow-md shadow-violet-600/20 transition hover:from-violet-700 hover:to-purple-700 inline-flex items-center gap-2 disabled:opacity-60">
                  {submitting === 'tag' ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  ذخیره برچسب
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
