'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  FlaskConical, PlusCircle, Layers, Tag, Edit3, Trash2, ToggleLeft, ToggleRight,
  Search, Filter, Loader2, AlertTriangle, AlertCircle, Hash
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { PortalButton } from '@/components/portal/ui/portal-button';
import { PageHeader } from '@/components/navigation/PageHeader';
import { getPanelNavigation } from '@/components/navigation/panel-navigation';
import { usePathname } from 'next/navigation';
import { labApi, labError, LabCategory, LabDefinition, LabDataType } from './lab-api';
import { LabDrawer, LabEmpty, LabError, LabField, LabLoading, labInput } from './LabShared';

const CODE_REGEX = /^[A-Za-z0-9_.-]{1,50}$/;

type CategoryInput = { name: string; description: string; sortOrder: number; isActive: boolean };
type DefinitionInput = {
  categoryId: number;
  name: string;
  englishName: string;
  code: string;
  unit: string;
  dataType: LabDataType;
  referenceMin?: number | null;
  referenceMax?: number | null;
  criticalMin?: number | null;
  criticalMax?: number | null;
  sortOrder: number;
  isActive: boolean;
};

function makeEmptyCategory(): CategoryInput {
  return { name: '', description: '', sortOrder: 0, isActive: true };
}

function makeEmptyDefinition(categories: LabCategory[]): DefinitionInput {
  return {
    categoryId: categories[0]?.id ?? 0,
    name: '',
    englishName: '',
    code: '',
    unit: '',
    dataType: 'Number',
    referenceMin: null,
    referenceMax: null,
    criticalMin: null,
    criticalMax: null,
    sortOrder: 0,
    isActive: true,
  };
}

function validateCategory(input: CategoryInput): string | null {
  if (!input.name.trim()) return 'نام دسته الزامی است.';
  if (input.name.length > 100) return 'نام دسته حداکثر ۱۰۰ کاراکتر است.';
  if (input.description.length > 500) return 'توضیح دسته حداکثر ۵۰۰ کاراکتر است.';
  return null;
}

function validateDefinition(input: DefinitionInput): string | null {
  if (!input.categoryId || input.categoryId < 1) return 'دسته آزمایش الزامی است.';
  if (!input.name.trim()) return 'نام آزمایش (فارسی) الزامی است.';
  if (input.name.length > 200) return 'نام آزمایش حداکثر ۲۰۰ کاراکتر است.';
  if (input.englishName.length > 200) return 'نام انگلیسی حداکثر ۲۰۰ کاراکتر است.';
  if (!CODE_REGEX.test(input.code)) return 'کد آزمایش باید انگلیسی، ۱ تا ۵۰ کاراکتر و شامل حروف، اعداد و _.- باشد.';
  if (input.unit.length > 50) return 'واحد حداکثر ۵۰ کاراکتر است.';
  if (input.dataType === 'Number') {
    const refMin = input.referenceMin ?? null;
    const refMax = input.referenceMax ?? null;
    const criMin = input.criticalMin ?? null;
    const criMax = input.criticalMax ?? null;
    if (refMin != null && refMax != null && refMin >= refMax) return 'کمینه مرجع باید کمتر از بیشینه مرجع باشد.';
    if (criMin != null && criMax != null && criMin >= criMax) return 'کمینه خطر باید کمتر از بیشینه خطر باشد.';
    if (criMin != null && refMin != null && criMin > refMin) return 'کمینه خطر باید کمتر یا مساوی کمینه مرجع باشد.';
    if (criMax != null && refMax != null && criMax < refMax) return 'بیشینه خطر باید بزرگتر یا مساوی بیشینه مرجع باشد.';
  }
  return null;
}

export function LabCatalogClient() {
  const pathname = usePathname();
  const nav = getPanelNavigation('dashboard', pathname);
  const queryClient = useQueryClient();

  const [tab, setTab] = useState<'categories' | 'definitions'>('categories');
  const [defCat, setDefCat] = useState<number | ''>('');
  const [defSearch, setDefSearch] = useState('');
  const [defActive, setDefActive] = useState<'all' | 'active' | 'inactive'>('all');

  const [catDrawer, setCatDrawer] = useState<{ open: boolean; edit?: LabCategory | null }>({ open: false, edit: null });
  const [defDrawer, setDefDrawer] = useState<{ open: boolean; edit?: LabDefinition | null }>({ open: false, edit: null });
  const [deleteCat, setDeleteCat] = useState<LabCategory | null>(null);
  const [deleteDef, setDeleteDef] = useState<LabDefinition | null>(null);

  const categories = useQuery({
    queryKey: ['labs', 'categories', 'all'],
    queryFn: () => labApi.categories({ all: true }),
  });
  const definitions = useQuery({
    queryKey: ['labs', 'definitions', 'all', defCat, defSearch, defActive],
    queryFn: () => labApi.definitions({ categoryId: defCat || undefined, search: defSearch.trim() || undefined, isActive: defActive === 'all' ? undefined : defActive === 'active' }),
  });

  const saveCat = useMutation({
    mutationFn: (v: { id?: number; body: CategoryInput }) => (v.id ? labApi.updateCategory(v.id, v.body) : labApi.createCategory(v.body)),
    onSuccess: () => {
      toast.success(catDrawer.edit ? 'دسته آزمایش با موفقیت ویرایش شد.' : 'دسته آزمایش با موفقیت ایجاد شد.');
      setCatDrawer({ open: false, edit: null });
      void queryClient.invalidateQueries({ queryKey: ['labs', 'categories'] });
      void queryClient.invalidateQueries({ queryKey: ['labs', 'definitions'] });
    },
    onError: (e) => toast.error(labError(e)),
  });
  const delCat = useMutation({
    mutationFn: (id: number) => labApi.deleteCategory(id),
    onSuccess: () => {
      toast.success('دسته آزمایش حذف (غیرفعال) شد.');
      setDeleteCat(null);
      void queryClient.invalidateQueries({ queryKey: ['labs', 'categories'] });
      void queryClient.invalidateQueries({ queryKey: ['labs', 'definitions'] });
    },
    onError: (e) => {
      const msg = labError(e);
      if (msg.includes('409') || msg.includes('در حال استفاده') || msg.includes('has active')) {
        toast.error('این دسته دارای فرمول فعال است و قابل حذف نیست؛ فقط می‌توانید آن را غیرفعال کنید.');
      } else {
        toast.error(msg);
      }
    },
  });
  const saveDef = useMutation({
    mutationFn: (v: { id?: number; body: DefinitionInput }) => (v.id ? labApi.updateDefinition(v.id, v.body) : labApi.createDefinition(v.body)),
    onSuccess: () => {
      toast.success(defDrawer.edit ? 'فرمول آزمایش با موفقیت ویرایش شد.' : 'فرمول آزمایش با موفقیت ایجاد شد.');
      setDefDrawer({ open: false, edit: null });
      void queryClient.invalidateQueries({ queryKey: ['labs', 'definitions'] });
    },
    onError: (e) => toast.error(labError(e)),
  });
  const delDef = useMutation({
    mutationFn: (id: number) => labApi.deleteDefinition(id),
    onSuccess: () => {
      toast.success('فرمول آزمایش حذف (غیرفعال) شد.');
      setDeleteDef(null);
      void queryClient.invalidateQueries({ queryKey: ['labs', 'definitions'] });
    },
    onError: (e) => toast.error(labError(e)),
  });

  const activeCatMap = useMemo(() => {
    const m = new Map<number, LabCategory>();
    (categories.data || []).forEach((c) => m.set(c.id, c));
    return m;
  }, [categories.data]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="مدیریت آزمایش‌ها"
        description="مدیریت دسته‌ها و فرمول‌های آزمایشگاهی قابل ثبت برای بیماران"
        backHref={nav.backHref || '/dashboard'}
        backLabel="بازگشت به پیشخوان"
        breadcrumbs={nav.breadcrumbs}
      />

      <div className="flex gap-1.5 rounded-[28px] border border-slate-200 bg-white p-1.5 shadow-sm ring-1 ring-slate-100" role="tablist" aria-label="کاتالوگ آزمایش‌ها">
        <button
          role="tab"
          aria-selected={tab === 'categories'}
          type="button"
          onClick={() => setTab('categories')}
          className={`flex flex-1 items-center justify-center gap-2 rounded-[1.4rem] px-4 py-3 text-sm font-black transition ${
            tab === 'categories'
              ? 'bg-teal-600 text-white shadow-lg shadow-teal-500/20'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Layers className="h-4 w-4" /> دسته‌ها
          <span className={`rounded-lg px-2 py-0.5 text-[11px] ${tab === 'categories' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'}`}>
            {(categories.data || []).length.toLocaleString('fa-IR')}
          </span>
        </button>
        <button
          role="tab"
          aria-selected={tab === 'definitions'}
          type="button"
          onClick={() => setTab('definitions')}
          className={`flex flex-1 items-center justify-center gap-2 rounded-[1.4rem] px-4 py-3 text-sm font-black transition ${
            tab === 'definitions'
              ? 'bg-teal-600 text-white shadow-lg shadow-teal-500/20'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <FlaskConical className="h-4 w-4" /> فرمول‌ها
          <span className={`rounded-lg px-2 py-0.5 text-[11px] ${tab === 'definitions' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'}`}>
            {(definitions.data || []).length.toLocaleString('fa-IR')}
          </span>
        </button>
      </div>

      {tab === 'categories' && (
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm ring-1 ring-slate-100">
            <div>
              <h2 className="text-lg font-black text-slate-900">دسته‌بندی آزمایش‌ها</h2>
              <p className="mt-1 text-sm text-slate-600">گروه‌بندی آزمایش‌ها مانند هماتولوژی، اندوکرین، ادرار، قلب و ...</p>
            </div>
            <PortalButton onClick={() => setCatDrawer({ open: true, edit: null })} aria-label="افزودن دسته جدید">
              <PlusCircle className="h-4 w-4" /> دسته جدید
            </PortalButton>
          </div>

          {categories.isPending && <LabLoading />}
          {categories.isError && <LabError message={labError(categories.error)} retry={() => void categories.refetch()} />}
          {!categories.isPending && !categories.isError && (categories.data || []).length === 0 && (
            <LabEmpty text="هنوز دسته‌ای تعریف نشده است. برای شروع اولین دسته را بسازید." />
          )}
          {!categories.isPending && !categories.isError && (categories.data || []).length > 0 && (
            <ul className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {(categories.data || []).map((c) => {
                const defCount = (definitions.data || []).filter((d) => d.categoryId === c.id && d.isActive).length;
                return (
                  <li key={c.id} className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm ring-1 ring-slate-100">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-black text-slate-900">{c.name}</h3>
                          {c.isActive ? (
                            <span className="inline-flex items-center gap-1 rounded-xl bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700 ring-1 ring-emerald-200">
                              <ToggleRight className="h-3.5 w-3.5" /> فعال
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-xl bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-700 ring-1 ring-slate-200">
                              <ToggleLeft className="h-3.5 w-3.5" /> غیرفعال
                            </span>
                          )}
                        </div>
                        <p className="mt-2 line-clamp-3 min-h-[3rem] text-sm text-slate-600">{c.description || 'توضیحی ثبت نشده.'}</p>
                        <dl className="mt-4 grid grid-cols-2 gap-2 text-xs text-slate-600">
                          <div>
                            <dt className="font-bold text-slate-700">فرمول‌های فعال</dt>
                            <dd className="mt-0.5 font-black text-slate-800">{defCount.toLocaleString('fa-IR')}</dd>
                          </div>
                          <div>
                            <dt className="font-bold text-slate-700">ترتیب نمایش</dt>
                            <dd className="mt-0.5 font-black text-slate-800">{c.sortOrder.toLocaleString('fa-IR')}</dd>
                          </div>
                        </dl>
                      </div>
                    </div>
                    <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                      <PortalButton variant="outline" size="sm" onClick={() => setCatDrawer({ open: true, edit: c })} aria-label={`ویرایش دسته ${c.name}`}>
                        <Edit3 className="h-4 w-4" /> ویرایش
                      </PortalButton>
                      <PortalButton variant="danger" size="sm" onClick={() => setDeleteCat(c)} aria-label={`حذف دسته ${c.name}`}>
                        <Trash2 className="h-4 w-4" /> حذف
                      </PortalButton>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}

      {tab === 'definitions' && (
        <section className="space-y-4">
          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm ring-1 ring-slate-100">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-black text-slate-900">فرمول‌های آزمایشی</h2>
                <p className="mt-1 text-sm text-slate-600">تعریف هر پارامتر آزمایشگاهی شامل کد، واحد، نوع داده و محدوده‌های مرجع و خطر</p>
              </div>
              <PortalButton onClick={() => setDefDrawer({ open: true, edit: null })} aria-label="افزودن فرمول جدید">
                <PlusCircle className="h-4 w-4" /> فرمول جدید
              </PortalButton>
            </div>
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <LabField label="دسته آزمایش">
                <select className={labInput} value={defCat} onChange={(e) => setDefCat(e.target.value === '' ? '' : Number(e.target.value))}>
                  <option value="">همه دسته‌ها</option>
                  {(categories.data || []).map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </LabField>
              <LabField label="جستجو (نام / کد / انگلیسی)">
                <label className="relative block">
                  <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    className={labInput + ' pr-9'}
                    value={defSearch}
                    onChange={(e) => setDefSearch(e.target.value)}
                    placeholder="مثال: قند خون یا FBS"
                    aria-label="جستجوی فرمول آزمایش"
                  />
                </label>
              </LabField>
              <LabField label="وضعیت فعال">
                <select className={labInput} value={defActive} onChange={(e) => setDefActive(e.target.value as 'all' | 'active' | 'inactive')}>
                  <option value="all">همه موارد</option>
                  <option value="active">فقط فعال</option>
                  <option value="inactive">فقط غیرفعال</option>
                </select>
              </LabField>
              <LabField label="عملکرد فیلترها">
                <div className="flex flex-wrap gap-2">
                  <PortalButton variant="outline" size="sm" onClick={() => { setDefCat(''); setDefSearch(''); setDefActive('all'); }}>
                    پاکسازی
                  </PortalButton>
                  <PortalButton variant="ghost" size="sm" onClick={() => void definitions.refetch()} aria-label="بارگذاری مجدد">
                    <Filter className="h-4 w-4" /> اعمال مجدد
                  </PortalButton>
                </div>
              </LabField>
            </div>
          </div>

          {definitions.isPending && <LabLoading />}
          {definitions.isError && <LabError message={labError(definitions.error)} retry={() => void definitions.refetch()} />}
          {!definitions.isPending && !definitions.isError && (definitions.data || []).length === 0 && (
            <LabEmpty text="فرمولی با این فیلترها یافت نشد. فیلترها را تغییر دهید یا اولین فرمول را بسازید." />
          )}
          {!definitions.isPending && !definitions.isError && (definitions.data || []).length > 0 && (
            <div className="overflow-x-auto rounded-[28px] border border-slate-200 bg-white shadow-sm ring-1 ring-slate-100">
              <table className="min-w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 text-xs font-black text-slate-700">
                    <th className="px-4 py-3 text-right">کد</th>
                    <th className="px-4 py-3 text-right">نام</th>
                    <th className="px-4 py-3 text-right">دسته</th>
                    <th className="px-4 py-3 text-right">واحد</th>
                    <th className="px-4 py-3 text-right">نوع داده</th>
                    <th className="px-4 py-3 text-right">مرجع</th>
                    <th className="px-4 py-3 text-right">خطر</th>
                    <th className="px-4 py-3 text-right">ترتیب</th>
                    <th className="px-4 py-3 text-right">وضعیت</th>
                    <th className="px-4 py-3 text-right">عملیات</th>
                  </tr>
                </thead>
                <tbody>
                  {(definitions.data || []).map((d) => {
                    const cat = activeCatMap.get(d.categoryId);
                    return (
                      <tr key={d.id} className="border-t border-slate-100 hover:bg-teal-50/40">
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-2 py-1 font-mono text-xs font-bold text-teal-200">
                            <Hash className="h-3 w-3" /> {d.code}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-900">{d.name}</div>
                          {d.englishName && <div className="text-xs text-slate-500" dir="ltr">{d.englishName}</div>}
                        </td>
                        <td className="px-4 py-3 text-slate-700">{cat?.name || <span className="text-amber-700">نامعلوم</span>}</td>
                        <td className="px-4 py-3 text-slate-700">{d.unit || '—'}</td>
                        <td className="px-4 py-3">
                          <span className={`rounded-md px-2 py-0.5 text-[11px] font-bold ${
                            d.dataType === 'Number' ? 'bg-teal-50 text-teal-700' : d.dataType === 'Boolean' ? 'bg-amber-50 text-amber-700' : 'bg-sky-50 text-sky-700'
                          }`}>{d.dataType}</span>
                        </td>
                        <td className="px-4 py-3 text-slate-700">
                          {d.dataType === 'Number'
                            ? <bdi>{(d.referenceMin ?? '...') + ' تا ' + (d.referenceMax ?? '...')}</bdi>
                            : '—'}
                        </td>
                        <td className="px-4 py-3 text-slate-700">
                          {d.dataType === 'Number' && (d.criticalMin != null || d.criticalMax != null)
                            ? <span className="rounded-md bg-rose-50 px-2 py-0.5 text-[11px] font-bold text-rose-700"><bdi>{(d.criticalMin ?? '...') + ' تا ' + (d.criticalMax ?? '...')}</bdi></span>
                            : '—'}
                        </td>
                        <td className="px-4 py-3 text-slate-700">{d.sortOrder.toLocaleString('fa-IR')}</td>
                        <td className="px-4 py-3">
                          {d.isActive ? (
                            <span className="inline-flex items-center gap-1 rounded-xl bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700 ring-1 ring-emerald-200">
                              <ToggleRight className="h-3.5 w-3.5" /> فعال
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-xl bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-700 ring-1 ring-slate-200">
                              <ToggleLeft className="h-3.5 w-3.5" /> غیرفعال
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1.5">
                            <button
                              type="button"
                              onClick={() => setDefDrawer({ open: true, edit: d })}
                              className="inline-flex items-center gap-1 rounded-xl bg-slate-50 px-2.5 py-1.5 text-xs font-bold text-slate-700 ring-1 ring-slate-200 transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-teal-400"
                              aria-label={`ویرایش فرمول ${d.name}`}
                            >
                              <Edit3 className="h-3.5 w-3.5" /> ویرایش
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteDef(d)}
                              className="inline-flex items-center gap-1 rounded-xl bg-rose-50 px-2.5 py-1.5 text-xs font-bold text-rose-700 ring-1 ring-rose-200 transition hover:bg-rose-100 focus:outline-none focus:ring-2 focus:ring-rose-400"
                              aria-label={`حذف فرمول ${d.name}`}
                            >
                              <Trash2 className="h-3.5 w-3.5" /> حذف
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {catDrawer.open && (
        <CategoryDrawer
          edit={catDrawer.edit ?? null}
          onClose={() => setCatDrawer({ open: false, edit: null })}
          onSubmit={async (body) => {
            await saveCat.mutateAsync({ id: catDrawer.edit?.id, body });
          }}
          submitting={saveCat.isPending}
        />
      )}

      {defDrawer.open && (
        <DefinitionDrawer
          categories={categories.data || []}
          edit={defDrawer.edit ?? null}
          onClose={() => setDefDrawer({ open: false, edit: null })}
          onSubmit={async (body) => {
            await saveDef.mutateAsync({ id: defDrawer.edit?.id, body });
          }}
          submitting={saveDef.isPending}
        />
      )}

      <Dialog open={!!deleteCat} onOpenChange={(o) => { if (!o && !delCat.isPending) setDeleteCat(null); }}>
        <DialogContent dir="rtl" className="w-[92vw] max-w-lg rounded-[28px] bg-white p-6 text-right ring-1 ring-slate-200">
          <DialogTitle className="text-right text-lg font-black text-slate-900">حذف دسته آزمایش</DialogTitle>
          <DialogDescription className="mt-2 text-right text-sm leading-7 text-slate-600">
            در صورت حذف، دسته <span className="font-black text-slate-900">«{deleteCat?.name}»</span> به‌صورت نرم حذف (غیرفعال) می‌شود.
            اگر دسته دارای فرمول فعال باشد، ممکن است سرور اجازه حذف ندهد و باید ابتدا فرمول‌ها را منتقل یا غیرفعال کنید.
          </DialogDescription>
          <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <PortalButton variant="outline" disabled={delCat.isPending} onClick={() => setDeleteCat(null)}>انصراف</PortalButton>
            <PortalButton variant="danger" isLoading={delCat.isPending} onClick={() => { if (deleteCat) void delCat.mutateAsync(deleteCat.id); }}>
              {delCat.isPending ? (<><Loader2 className="h-4 w-4 animate-spin" /> در حال حذف...</>) : (<><Trash2 className="h-4 w-4" /> حذف / غیرفعال‌سازی</>)}
            </PortalButton>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteDef} onOpenChange={(o) => { if (!o && !delDef.isPending) setDeleteDef(null); }}>
        <DialogContent dir="rtl" className="w-[92vw] max-w-lg rounded-[28px] bg-white p-6 text-right ring-1 ring-slate-200">
          <DialogTitle className="text-right text-lg font-black text-slate-900">حذف فرمول آزمایش</DialogTitle>
          <DialogDescription className="mt-2 text-right text-sm leading-7 text-slate-600">
            فرمول <span className="font-black text-slate-900">«{deleteDef?.name}»</span> به‌صورت نرم حذف (غیرفعال) می‌گردد.
            نتایج ثبت‌شده در گزارش‌های گذشته به صورت Snapshot باقی می‌مانند و تحت تأثیر این تغییر قرار نمی‌گیرند.
          </DialogDescription>
          <div className="mt-2 flex items-start gap-2 rounded-2xl bg-amber-50 p-3 text-xs text-amber-800 ring-1 ring-amber-200">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            توجه کنید: بیمارانی که در گذشته این آزمایش را انجام داده‌اند، همچنان مقدار و محدوده ثبت‌شدهٔ قدیمی را خواهند دید.
          </div>
          <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <PortalButton variant="outline" disabled={delDef.isPending} onClick={() => setDeleteDef(null)}>انصراف</PortalButton>
            <PortalButton variant="danger" isLoading={delDef.isPending} onClick={() => { if (deleteDef) void delDef.mutateAsync(deleteDef.id); }}>
              {delDef.isPending ? (<><Loader2 className="h-4 w-4 animate-spin" /> در حال حذف...</>) : (<><Trash2 className="h-4 w-4" /> حذف / غیرفعال‌سازی</>)}
            </PortalButton>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CategoryDrawer({ edit, onClose, onSubmit, submitting }: {
  edit: LabCategory | null; onClose: () => void; onSubmit: (body: CategoryInput) => Promise<void>; submitting: boolean;
}) {
  const [form, setForm] = useState<CategoryInput>(() => (edit ? {
    name: edit.name,
    description: edit.description ?? '',
    sortOrder: edit.sortOrder ?? 0,
    isActive: edit.isActive,
  } : makeEmptyCategory()));
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setError(validateCategory(form));
    if (error) return;
    const v = validateCategory(form);
    if (v) { setError(v); return; }
    try {
      await onSubmit({ ...form, name: form.name.trim(), description: form.description.trim() });
    } catch {
      // error handled by parent toast
    }
  }

  return (
    <LabDrawer
      title={edit ? `ویرایش دسته «${edit.name}»` : 'دسته آزمایش جدید'}
      description="گروه‌بندی سطح بالای آزمایش‌ها، مثلاً هماتولوژی، ادرار، قلب و غیره"
      onClose={onClose}
      busy={submitting}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <LabField label="نام دسته (فارسی) *">
            <input
              className={labInput}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              maxLength={100}
              placeholder="مثال: هماتولوژی کامل خون"
              aria-label="نام دسته آزمایش"
            />
          </LabField>
          <LabField label="ترتیب نمایش">
            <input
              type="number"
              className={labInput}
              value={form.sortOrder}
              onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) || 0 })}
              aria-label="ترتیب نمایش دسته"
            />
          </LabField>
        </div>
        <LabField label="توضیح دسته">
          <textarea
            className={labInput + ' min-h-[96px] resize-none'}
            rows={4}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            maxLength={500}
            placeholder="توضیح کوتاه در مورد این دسته و محدوده آزمایش‌های آن..."
            aria-label="توضیح دسته آزمایش"
          />
          <div className="mt-1 text-left text-xs text-slate-500">{(form.description.length).toLocaleString('fa-IR')} / ۵۰۰ کاراکتر</div>
        </LabField>
        <label className="flex cursor-pointer items-center justify-between rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-200">
          <div>
            <div className="text-sm font-black text-slate-800">وضعیت فعال بودن دسته</div>
            <div className="text-xs text-slate-600">اگر غیرفعال باشد، در لیست ثبت آزمایش برای کاربران نمایش داده نمی‌شود.</div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={form.isActive}
            onClick={() => setForm({ ...form, isActive: !form.isActive })}
            className={`relative h-7 w-14 shrink-0 rounded-full transition ${form.isActive ? 'bg-teal-600' : 'bg-slate-300'}`}
          >
            <span className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all ${form.isActive ? 'left-0.5' : 'left-7'}`} />
          </button>
        </label>

        {error && (
          <div className="flex items-start gap-2 rounded-2xl bg-rose-50 p-3 text-sm text-rose-800 ring-1 ring-rose-200">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
          </div>
        )}

        <div className="sticky bottom-0 z-10 -mx-4 -mb-4 mt-2 border-t border-slate-100 bg-white/80 px-4 py-4 backdrop-blur sm:-mx-6 sm:-mb-6 sm:px-6 sm:py-5">
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <PortalButton variant="outline" disabled={submitting} onClick={onClose}>انصراف</PortalButton>
            <PortalButton isLoading={submitting} onClick={() => void submit()}>
              {submitting ? (<><Loader2 className="h-4 w-4 animate-spin" /> در حال ذخیره...</>) : (<><Tag className="h-4 w-4" /> {edit ? 'ذخیره تغییرات' : 'ایجاد دسته'}</>)}
            </PortalButton>
          </div>
        </div>
      </div>
    </LabDrawer>
  );
}

function DefinitionDrawer({ categories, edit, onClose, onSubmit, submitting }: {
  categories: LabCategory[]; edit: LabDefinition | null; onClose: () => void; onSubmit: (body: DefinitionInput) => Promise<void>; submitting: boolean;
}) {
  const [form, setForm] = useState<DefinitionInput>(() => (edit ? {
    categoryId: edit.categoryId,
    name: edit.name,
    englishName: edit.englishName ?? '',
    code: edit.code,
    unit: edit.unit ?? '',
    dataType: edit.dataType,
    referenceMin: edit.referenceMin ?? null,
    referenceMax: edit.referenceMax ?? null,
    criticalMin: edit.criticalMin ?? null,
    criticalMax: edit.criticalMax ?? null,
    sortOrder: edit.sortOrder ?? 0,
    isActive: edit.isActive,
  } : makeEmptyDefinition(categories)));
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof DefinitionInput>(key: K, value: DefinitionInput[K]) {
    const next = { ...form, [key]: value };
    if (key === 'dataType' && value !== 'Number') {
      next.referenceMin = null; next.referenceMax = null; next.criticalMin = null; next.criticalMax = null;
    }
    setForm(next);
  }

  async function submit() {
    const v = validateDefinition(form);
    if (v) { setError(v); return; }
    setError(null);
    try {
      await onSubmit({
        ...form,
        name: form.name.trim(),
        englishName: form.englishName.trim(),
        code: form.code.trim(),
        unit: form.unit.trim(),
      });
    } catch {
      // error handled by parent toast
    }
  }

  const numeric = form.dataType === 'Number';

  return (
    <LabDrawer
      title={edit ? `ویرایش فرمول «${edit.name}»` : 'فرمول آزمایش جدید'}
      description="مشخصات هر پارامتر آزمایشگاهی، محدوده‌های مرجع و خطر"
      onClose={onClose}
      busy={submitting}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <LabField label="دسته آزمایش *">
            <select className={labInput} value={form.categoryId} onChange={(e) => update('categoryId', Number(e.target.value) || 0)} aria-label="دسته آزمایش">
              <option value={0}>انتخاب دسته...</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </LabField>
          <LabField label="نوع داده *">
            <select className={labInput} value={form.dataType} onChange={(e) => update('dataType', e.target.value as LabDataType)} aria-label="نوع داده">
              <option value="Number">عددی (Number)</option>
              <option value="Text">متنی (Text)</option>
              <option value="Boolean">بله/خیر (Boolean)</option>
            </select>
          </LabField>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <LabField label="نام آزمایش (فارسی) *">
            <input className={labInput} value={form.name} onChange={(e) => update('name', e.target.value)} maxLength={200} placeholder="مثال: قند خون ناشتا" aria-label="نام فارسی" />
          </LabField>
          <LabField label="نام آزمایش (انگلیسی)">
            <input className={labInput} value={form.englishName} onChange={(e) => update('englishName', e.target.value)} maxLength={200} placeholder="مثال: Fasting Blood Sugar" dir="ltr" aria-label="نام انگلیسی" />
          </LabField>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <LabField label="کد آزمایش (Code) *">
            <input className={labInput + ' font-mono'} value={form.code} onChange={(e) => update('code', e.target.value)} maxLength={50} dir="ltr" placeholder="مثال: FBS ، HGB ، TSH" aria-label="کد آزمایش" />
            <div className="mt-1 text-[11px] text-slate-500">فقط حروف انگلیسی، اعداد و _ . - و ۱ تا ۵۰ کاراکتر</div>
          </LabField>
          <LabField label="واحد اندازه‌گیری">
            <input className={labInput} value={form.unit} onChange={(e) => update('unit', e.target.value)} maxLength={50} placeholder="مثال: mg/dL ، گرم بر دسی‌لیتر" aria-label="واحد" />
          </LabField>
        </div>

        <div className={`rounded-[28px] border p-5 ring-1 ${numeric ? 'border-teal-200 bg-teal-50/30 ring-teal-100' : 'border-dashed border-slate-300 bg-slate-50 ring-slate-100'}`}>
          <div className="mb-3 flex items-start gap-2 text-sm text-slate-700">
            {numeric ? <FlaskConical className="mt-0.5 h-4 w-4 text-teal-600" /> : <AlertCircle className="mt-0.5 h-4 w-4 text-slate-400" />}
            <div>
              <div className="font-black text-slate-800">محدوده‌های مرجع و خطر</div>
              <div className="text-xs text-slate-600">
                {numeric ? 'این محدوده‌ها برای تشخیص نرمال/غیرطبیعی و روند استفاده می‌شوند. مقدار null یعنی «نامشخص» است.' : 'این فیلدها فقط برای نوع داده «عددی» معنی‌دار هستند. برای متنی یا بولی، این بخش نادیده گرفته می‌شود.'}
              </div>
            </div>
          </div>
          <fieldset disabled={!numeric} className="grid grid-cols-1 gap-4 sm:grid-cols-2 disabled:opacity-60">
            <LabField label="کمینه مرجع (Reference Min)">
              <input type="number" step="any" className={labInput} value={form.referenceMin ?? ''} onChange={(e) => update('referenceMin', e.target.value === '' ? null : Number(e.target.value))} aria-label="کمینه مرجع" />
            </LabField>
            <LabField label="بیشینه مرجع (Reference Max)">
              <input type="number" step="any" className={labInput} value={form.referenceMax ?? ''} onChange={(e) => update('referenceMax', e.target.value === '' ? null : Number(e.target.value))} aria-label="بیشینه مرجع" />
            </LabField>
            <LabField label="کمینه خطر (Critical Min)">
              <input type="number" step="any" className={labInput} value={form.criticalMin ?? ''} onChange={(e) => update('criticalMin', e.target.value === '' ? null : Number(e.target.value))} aria-label="کمینه خطر" />
            </LabField>
            <LabField label="بیشینه خطر (Critical Max)">
              <input type="number" step="any" className={labInput} value={form.criticalMax ?? ''} onChange={(e) => update('criticalMax', e.target.value === '' ? null : Number(e.target.value))} aria-label="بیشینه خطر" />
            </LabField>
          </fieldset>
          {numeric && (
            <div className="mt-4 grid grid-cols-1 gap-2 text-xs text-slate-700 sm:grid-cols-2">
              <div className="rounded-xl bg-white p-3 ring-1 ring-slate-200">
                <div className="font-black text-teal-700">محیط نرمال</div>
                <div className="mt-1 leading-6">وقتی نتیجه آزمایش بین Reference Min تا Reference Max باشد.</div>
              </div>
              <div className="rounded-xl bg-rose-50 p-3 ring-1 ring-rose-200">
                <div className="font-black text-rose-700">خطر بحرانی</div>
                <div className="mt-1 leading-6">وقتی نتیجه ≤ Critical Min یا ≥ Critical Max باشد (مهم‌تر از نرمال/غیرنرمال).</div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <LabField label="ترتیب نمایش در لیست">
            <input type="number" className={labInput} value={form.sortOrder} onChange={(e) => update('sortOrder', Number(e.target.value) || 0)} aria-label="ترتیب نمایش" />
          </LabField>
          <LabField label=" ">
            <label className="flex h-full cursor-pointer items-center justify-between rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-200">
              <div>
                <div className="text-sm font-black text-slate-800">فرمول فعال است</div>
                <div className="text-xs text-slate-600">اگر غیرفعال باشد، در لیست ثبت آزمایش نمایش داده نمی‌شود.</div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={form.isActive}
                onClick={() => update('isActive', !form.isActive)}
                className={`relative h-7 w-14 shrink-0 rounded-full transition ${form.isActive ? 'bg-teal-600' : 'bg-slate-300'}`}
              >
                <span className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all ${form.isActive ? 'left-0.5' : 'left-7'}`} />
              </button>
            </label>
          </LabField>
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-2xl bg-rose-50 p-3 text-sm text-rose-800 ring-1 ring-rose-200">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
          </div>
        )}

        <div className="sticky bottom-0 z-10 -mx-4 -mb-4 mt-2 border-t border-slate-100 bg-white/80 px-4 py-4 backdrop-blur sm:-mx-6 sm:-mb-6 sm:px-6 sm:py-5">
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <PortalButton variant="outline" disabled={submitting} onClick={onClose}>انصراف</PortalButton>
            <PortalButton isLoading={submitting} onClick={() => void submit()}>
              {submitting ? (<><Loader2 className="h-4 w-4 animate-spin" /> در حال ذخیره...</>) : (<><FlaskConical className="h-4 w-4" /> {edit ? 'ذخیره تغییرات' : 'ایجاد فرمول آزمایش'}</>)}
            </PortalButton>
          </div>
        </div>
      </div>
    </LabDrawer>
  );
}
