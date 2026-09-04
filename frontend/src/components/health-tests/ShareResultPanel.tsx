'use client';

import { useState } from 'react';
import {
  Share2,
  MessageCircle,
  Send,
  Link2,
  Check,
  ExternalLink,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import type { HealthTest, HealthTestResult } from '@/lib/health-tests/types';
import type { HealthTestRecommendationLevel } from '@/lib/health-tests/types';

const LABEL_BY_LEVEL: Record<HealthTestRecommendationLevel, string> = {
  low: 'در محدوده مطلوب قرار دارد',
  medium: 'نیازمند توجه و نظارت است',
  high: 'نیازمند بررسی و حمایت بیشتر است',
};

function buildShareMessage(test: HealthTest, result: HealthTestResult, forSelf: boolean | null, url: string): string {
  const subject = forSelf === false ? 'سلامت پدر و مادر' : forSelf === true ? 'سلامت من' : 'تست سلامت سالمندیار';
  const status = LABEL_BY_LEVEL[result.overallLevel];
  const message =
    `${subject} را در تست ${test.title} سالمندیار بررسی کردم و نتیجه ${status}.\n` +
    `می‌خواهی وضعیت سلامت خودت یا عزیزانت را هم بررسی کنی؟\n${url}`;
  return message;
}

function encode(s: string): string {
  return encodeURIComponent(s);
}

interface Props {
  test: HealthTest;
  result: HealthTestResult;
  forSelf: boolean | null;
  className?: string;
}

export default function ShareResultPanel({ test, result, forSelf, className }: Props) {
  const [currentUrl] = useState<string>(() => {
    if (typeof window !== 'undefined') return window.location.href;
    return '';
  });
  const [copied, setCopied] = useState(false);

  const shareUrl = currentUrl || `https://salmandyar.ir/health-tests/${test.slug}`;
  const message = buildShareMessage(test, result, forSelf, shareUrl);
  const title = `نتیجه تست ${test.title} | سالمندیار`;

  const handleNativeShare = async () => {
    type NavigatorShare = Navigator & { share?: (data: { title?: string; text?: string; url?: string }) => Promise<void> };
    if (typeof navigator !== 'undefined' && typeof (navigator as NavigatorShare).share === 'function') {
      try {
        await (navigator as NavigatorShare).share({
          title,
          text: message,
          url: shareUrl,
        });
      } catch {
        // user canceled
      }
    } else {
      handleCopyLink();
    }
  };

  const handleCopyLink = async () => {
    const textToCopy = `${message}`;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        const ta = document.createElement('textarea');
        ta.value = textToCopy;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setCopied(true);
      toast.success('نتیجه تست در کلیپ‌بورد کپی شد.', { duration: 2500 });
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error('کپی انجام نشد؛ لطفاً دستی کپی کنید.', { duration: 3000 });
    }
  };

  const handleWhatsApp = () => {
    const href = `https://wa.me/?text=${encode(message)}`;
    window.open(href, '_blank', 'noopener,noreferrer');
  };

  const handleTelegram = () => {
    const href = `https://t.me/share/url?url=${encode(shareUrl)}&text=${encode(message)}`;
    window.open(href, '_blank', 'noopener,noreferrer');
  };

  return (
    <section
      aria-labelledby="share-result-heading"
      className={cn(
        'rounded-3xl border border-slate-100 bg-gradient-to-br from-white via-slate-50/40 to-white p-5 sm:p-6 shadow-sm',
        className,
      )}
    >
      <header className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white flex items-center justify-center shadow-lg shadow-violet-500/20 ring-8 ring-violet-500/10 shrink-0">
            <Share2 size={20} strokeWidth={2.3} />
          </div>
          <div>
            <h3 id="share-result-heading" className="font-black text-lg sm:text-xl text-slate-900">
              اشتراک‌گذاری نتیجه
            </h3>
            <p className="text-xs sm:text-sm text-slate-500">
              برای خانواده، دوستان یا پزشک معالج ارسال کنید.
            </p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 mb-4">
        <Button
          variant="outline"
          size="md"
          onClick={handleWhatsApp}
          className="justify-start border-emerald-200 bg-emerald-50/50 text-emerald-800 hover:bg-emerald-100 rounded-2xl"
        >
          <MessageCircle size={17} className="text-emerald-600" />
          واتساپ
          <ExternalLink size={13} className="mr-auto opacity-60" />
        </Button>

        <Button
          variant="outline"
          size="md"
          onClick={handleTelegram}
          className="justify-start border-sky-200 bg-sky-50/50 text-sky-800 hover:bg-sky-100 rounded-2xl"
        >
          <Send size={17} className="text-sky-600" />
          تلگرام
          <ExternalLink size={13} className="mr-auto opacity-60" />
        </Button>

        <Button
          variant="outline"
          size="md"
          onClick={handleNativeShare}
          className="justify-start border-violet-200 bg-violet-50/50 text-violet-800 hover:bg-violet-100 rounded-2xl"
        >
          <Share2 size={17} className="text-violet-600" />
          اشتراک‌گذاری
          <ExternalLink size={13} className="mr-auto opacity-60" />
        </Button>

        <Button
          variant="outline"
          size="md"
          onClick={handleCopyLink}
          className={cn(
            'justify-start rounded-2xl border-2 transition-all',
            copied
              ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
              : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50',
          )}
        >
          {copied ? (
            <Check size={17} className="text-emerald-600" strokeWidth={3} />
          ) : (
            <Link2 size={17} className="text-slate-500" />
          )}
          {copied ? 'کپی شد' : 'کپی متن'}
        </Button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm leading-relaxed text-slate-700">
        <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2">
          پیش‌نمایش متن ارسال
        </p>
        <pre className="whitespace-pre-wrap font-[inherit] text-slate-700">{message}</pre>
      </div>
    </section>
  );
}
