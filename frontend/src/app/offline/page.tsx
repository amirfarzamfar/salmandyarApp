'use client';

import Link from "next/link";
import { WifiOff, RefreshCw, Home, ArrowLeft } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-emerald-50 flex items-center justify-center p-4 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] pr-[env(safe-area-inset-right)] pl-[env(safe-area-inset-left)]">
      <div className="w-full max-w-md text-center">
        <div className="relative mx-auto w-28 h-28 mb-8">
          <div className="absolute inset-0 rounded-full bg-teal-100 animate-pulse" />
          <div className="absolute inset-3 rounded-full bg-white shadow-lg flex items-center justify-center">
            <WifiOff className="w-14 h-14 text-teal-600" strokeWidth={1.75} />
          </div>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
          اتصال اینترنت برقرار نیست
        </h1>
        <p className="text-gray-600 mb-2 leading-relaxed">
          به نظر می‌رسد دستگاه شما به اینترنت متصل نیست.
        </p>
        <p className="text-gray-500 text-sm mb-8 leading-relaxed">
          لطفاً اتصال Wi-Fi یا داده موبایل خود را بررسی کرده و دوباره تلاش کنید.
          <br />
          <span className="text-rose-500 mt-2 block text-xs">
            اطلاعات پزشکی و شخصی شما در حالت آفلاین نمایش داده نمی‌شود تا از صحت و به‌روزرسانی داده‌ها اطمینان حاصل شود.
          </span>
        </p>

        <div className="space-y-3">
          <button
            onClick={() => window.location.reload()}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-teal-600 text-white font-semibold shadow-lg shadow-teal-600/25 hover:bg-teal-700 active:scale-[0.98] transition-all"
          >
            <RefreshCw className="w-5 h-5" />
            تلاش مجدد برای اتصال
          </button>

          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-700 font-medium hover:bg-gray-50 active:scale-[0.98] transition-all"
            >
              <Home className="w-4 h-4" />
              صفحه اصلی
            </Link>
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-700 font-medium hover:bg-gray-50 active:scale-[0.98] transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              صفحه قبل
            </button>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-100">
          <p className="text-xs text-gray-400">
            سالمندیار — پلتفرم جامع خدمات پرستاری و مراقبت در منزل
          </p>
        </div>
      </div>
    </div>
  );
}
