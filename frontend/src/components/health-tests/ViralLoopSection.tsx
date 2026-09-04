'use client';

import Link from 'next/link';
import { ArrowLeft, Heart, Share2, Users, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import type { HealthTest } from '@/lib/health-tests/types';

interface Props {
  test: HealthTest;
  forSelf: boolean | null;
  className?: string;
}

export default function ViralLoopSection({ test, forSelf, className }: Props) {
  const [copied, setCopied] = useState(false);

  const shareUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/health-tests/${test.slug}`
      : `/health-tests/${test.slug}`;

  const suggestForFamilyText =
    forSelf === true
      ? 'حالا نوبت پدر و مادرت است ❤️'
      : forSelf === false
        ? 'این تست را برای سایر عزیزانت هم بفرست 💌'
        : 'این تست را برای خانواده‌ات بفرست 🫂';

  const suggestDescription =
    forSelf === true
      ? 'اگر این تست را برای خودت انجام دادی، می‌توانی آن را برای پدر، مادر یا یکی از اعضای خانواده‌ات هم ارسال کنی.'
      : 'اگر برای یکی از عزیزانت انجام دادی، احتمالاً سایر بستگان هم از این تست بهره‌مند می‌شوند؛ لینک را با آنها به اشتراک بگذار.';

  const handleCopy = async () => {
    const text = `${suggestForFamilyText}\n${suggestDescription}\nلینک تست:\n${shareUrl}`;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setCopied(true);
      toast.success('لینک و پیام کپی شد؛ حالا می‌توانی بفرستی.', { duration: 2500 });
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error('کپی انجام نشد؛ لطفاً دستی کپی کنید.');
    }
  };

  return (
    <section
      aria-labelledby="viral-loop-heading"
      className={cn(
        'relative rounded-3xl overflow-hidden shadow-lg shadow-rose-500/10 border border-rose-100',
        className,
      )}
    >
      <div
        className="absolute inset-0 bg-gradient-to-br from-rose-500 via-pink-500 to-orange-500"
        aria-hidden="true"
      />
      <div
        className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/20 blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-20 -left-10 w-64 h-64 rounded-full bg-amber-300/30 blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative p-5 sm:p-6 text-white">
        <header className="flex items-start gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur border border-white/25 flex items-center justify-center shrink-0">
            <Heart size={22} fill="currentColor" className="text-amber-200" />
          </div>
          <div>
            <h3 id="viral-loop-heading" className="font-black text-xl sm:text-2xl leading-tight mb-1">
              {suggestForFamilyText}
            </h3>
            <p className="text-sm sm:text-base text-white/85 leading-relaxed max-w-md">
              {suggestDescription}
            </p>
          </div>
        </header>

        <div className="rounded-2xl bg-white/10 border border-white/20 backdrop-blur p-3.5 sm:p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Users size={14} />
            <p className="text-[11px] font-black uppercase tracking-widest text-white/80">
              لینک تست برای خانواده
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 text-sm bg-white/10 border border-white/20 rounded-xl px-3 py-2 truncate text-white/95 font-mono">
              {shareUrl}
            </div>
            <Button
              size="md"
              variant="outline"
              onClick={handleCopy}
              className={cn(
                'shrink-0 rounded-xl border-2 backdrop-blur transition-all',
                copied
                  ? 'bg-emerald-400 border-emerald-300 text-white hover:bg-emerald-500'
                  : 'bg-white/10 border-white/25 text-white hover:bg-white/15',
              )}
            >
              {copied ? (
                <>
                  <Check size={16} strokeWidth={3} />
                  کپی شد
                </>
              ) : (
                <>
                  <Copy size={16} />
                  کپی لینک
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            size="lg"
            asChild
            className="rounded-full bg-white text-rose-700 hover:bg-white/95 shadow-lg shadow-black/10 ring-4 ring-white/20 border-0"
          >
            <Link href="/health-tests">
              <Share2 size={17} />
              مشاهده همه تست‌ها
              <ArrowLeft size={16} strokeWidth={2.5} />
            </Link>
          </Button>
          <Button
            size="lg"
            asChild
            variant="outline"
            className="rounded-full border-2 border-white/30 bg-white/10 hover:bg-white/15 backdrop-blur"
          >
            <Link href="/portal/home-care/request">
              <Heart size={17} />
              درخواست فوری پرستار
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
