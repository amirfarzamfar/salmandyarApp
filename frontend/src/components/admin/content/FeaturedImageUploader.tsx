'use client';

import React, { useRef, useState } from 'react';
import {
  Upload,
  X,
  Image as ImageIcon,
  Loader2,
  RotateCcw,
  Trash2,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import adminContentApi, { type UploadImageResult } from '@/lib/content-admin-api';

type Props = {
  imageUrl: string | null;
  imageAlt: string;
  onImageChange: (url: string | null, result?: UploadImageResult) => void;
  onAltChange: (alt: string) => void;
  title?: string;
};

export default function FeaturedImageUploader({
  imageUrl,
  imageAlt,
  onImageChange,
  onAltChange,
  title = 'عکس شاخص مقاله',
}: Props) {
  const [uploading, setUploading] = useState(false);
  const [previewError, setPreviewError] = useState(false);
  const [lastUploadInfo, setLastUploadInfo] = useState<{ sizeKB: number } | null>(null);
  const hiddenInputRef = useRef<HTMLInputElement | null>(null);

  const resolvedUrl = imageUrl || '';
  const hasImage = !!resolvedUrl && !previewError;

  const triggerSelect = () => {
    if (uploading) return;
    hiddenInputRef.current?.click();
  };

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;

    if (!f.type.startsWith('image/')) {
      toast.error('فایل انتخاب شده تصویر نیست');
      return;
    }
    if (f.size > 8 * 1024 * 1024) {
      toast.error('حجم تصویر نباید بیشتر از ۸ مگابایت باشد');
      return;
    }

    setUploading(true);
    setPreviewError(false);
    const toastId = toast.loading('در حال آپلود تصویر شاخص...');
    try {
      const result = await adminContentApi.uploadImage(f, 'featured');
      if (!imageAlt) {
        const defaultAlt = f.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ');
        onAltChange(defaultAlt);
      }
      onImageChange(result.url, result);
      setLastUploadInfo({ sizeKB: result.sizeKB });
      toast.success('تصویر با موفقیت آپلود شد', { id: toastId });
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? 'خطا در آپلود تصویر';
      toast.error(msg, { id: toastId });
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    if (!confirm('تصویر شاخص حذف شود؟')) return;
    onImageChange(null);
    setPreviewError(false);
    setLastUploadInfo(null);
    toast.success('تصویر شاخص حذف شد');
  };

  const handleReplace = () => {
    triggerSelect();
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-600 inline-flex items-center gap-1">
            <ImageIcon className="h-3.5 w-3.5 text-rose-500" />
            {title}
          </span>
          {lastUploadInfo && hasImage && (
            <span className="text-[11px] font-bold text-emerald-600 inline-flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              آپلود شده · {lastUploadInfo.sizeKB.toLocaleString('fa-IR')} KB
            </span>
          )}
        </div>

        {hasImage ? (
          <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 group shadow-sm">
            {uploading && (
              <div className="absolute inset-0 bg-white/85 backdrop-blur-sm z-10 flex flex-col items-center justify-center gap-2">
                <Loader2 className="h-8 w-8 text-teal-600 animate-spin" />
                <span className="text-sm font-bold text-slate-700">در حال آپلود...</span>
              </div>
            )}
            <img
              src={resolvedUrl}
              alt={imageAlt || title}
              onError={() => {
                setPreviewError(true);
                toast.error('بارگذاری تصویر ناموفق بود');
              }}
              className="w-full aspect-video object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-wrap gap-2 justify-end">
              <button
                type="button"
                onClick={handleReplace}
                disabled={uploading}
                className="inline-flex items-center gap-1.5 rounded-lg bg-white text-slate-800 px-3 py-1.5 text-xs font-black shadow-sm hover:bg-slate-100 transition-colors disabled:opacity-50"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                جایگزین کردن
              </button>
              <button
                type="button"
                onClick={handleRemove}
                disabled={uploading}
                className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 text-white px-3 py-1.5 text-xs font-black shadow-sm hover:bg-rose-700 transition-colors disabled:opacity-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
                حذف تصویر
              </button>
            </div>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-full aspect-video rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 hover:border-teal-400 hover:bg-teal-50/40 cursor-pointer transition-all group relative overflow-hidden">
            <input
              ref={hiddenInputRef}
              type="file"
              className="hidden"
              accept="image/jpeg,image/png,image/webp,image/gif,image/bmp"
              onChange={handleFileSelected}
              disabled={uploading}
            />
            {uploading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-10 w-10 text-teal-600 animate-spin" />
                <div className="text-sm font-black text-slate-700">در حال آپلود تصویر...</div>
                <div className="text-xs text-slate-500">لطفاً منتظر بمانید</div>
              </div>
            ) : previewError ? (
              <div className="flex flex-col items-center gap-2 text-center px-4">
                <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center mb-1">
                  <ImageIcon className="h-6 w-6 text-rose-500" />
                </div>
                <div className="text-sm font-black text-rose-700">مشکلی در نمایش تصویر قبلی پیش آمد</div>
                <div className="text-xs text-rose-500">جهت مشاهده مجدد یا جایگزین کردن کلیک کنید</div>
              </div>
            ) : (
              <>
                <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mb-3 shadow-sm group-hover:scale-105 transition-transform">
                  <Upload className="h-6 w-6 text-teal-500" />
                </div>
                <div className="text-sm font-black text-slate-700">آپلود تصویر شاخص</div>
                <div className="text-xs text-slate-400 mt-1 text-center max-w-xs">
                  نسبت ۱۶:۹، فرمت JPG/PNG/WEBP، حداکثر ۸ مگابایت
                </div>
                <div className="mt-3 inline-flex items-center gap-1 rounded-xl bg-teal-600 text-white px-4 py-1.5 text-xs font-black shadow-sm group-hover:bg-teal-700 transition-colors">
                  <Upload className="h-3.5 w-3.5" />
                  انتخاب تصویر
                </div>
              </>
            )}
          </label>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-600 block inline-flex items-center gap-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Alt Text (توضیح تصویر برای سئو و دسترسی‌پذیری)
          </label>
          <span className={`text-[11px] font-bold ${imageAlt.length > 125 ? 'text-rose-600' : 'text-slate-400'}`}>
            {imageAlt.length}/۱۲۵
          </span>
        </div>
        <input
          type="text"
          value={imageAlt}
          onChange={(e) => onAltChange(e.target.value)}
          placeholder="مانند: پرستار در حال مراقبت از سالمند در خانه..."
          maxLength={300}
          className="w-full rounded-2xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all"
        />
        <p className="text-[11px] font-bold text-slate-400 leading-relaxed">
          Alt Text به موتورهای جستجو کمک می‌کند محتوای تصویر را بفهمند و برای کاربران نابینا مهم است.
        </p>
      </div>
    </div>
  );
}
