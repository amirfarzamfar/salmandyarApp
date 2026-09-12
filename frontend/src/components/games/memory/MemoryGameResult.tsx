'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Check,
  CheckCircle2,
  ChevronLeft,
  Copy,
  Eye,
  HeartHandshake,
  Lightbulb,
  MessageCircle,
  RefreshCw,
  Send,
  Share2,
  Sparkles,
  Target,
  X,
  Users,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import type { MemoryGameResult as MemoryGameResultT } from '@/lib/memory-game/types';
import { scoreEncouragement } from '@/lib/memory-game/scoring';
import { track } from '@/lib/analytics';
import { cn } from '@/lib/utils';

type ShareChannel = 'native' | 'whatsapp' | 'telegram' | 'copy';

export interface MemoryGameResultProps {
  result: MemoryGameResultT;
  onReset: () => void;
  onExit?: () => void;
}

function encode(s: string): string {
  return encodeURIComponent(s);
}

function CircularScore({ value }: { value: number }) {
  const size = 200;
  const stroke = 16;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
      aria-label={`امتیاز ${value} از ۱۰۰`}
    >
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={stroke}
          className="fill-none stroke-slate-100"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={stroke}
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="fill-none stroke-[url(#scoreGrad)] transition-[stroke-dashoffset] duration-1000 ease-out"
        />
        <defs>
          <linearGradient id="scoreGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0d9488" />
            <stop offset="50%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-4xl sm:text-5xl font-black text-slate-900 leading-none">{value}</div>
        <div className="text-sm sm:text-base font-bold text-slate-500 mt-1">از ۱۰۰</div>
      </div>
    </div>
  );
}

function MetricBar({
  label,
  icon,
  value,
  tone,
}: {
  label: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  value: number;
  tone: 'teal' | 'violet' | 'amber';
}) {
  const Icon = icon;
  const tones = {
    teal: 'from-teal-500 to-emerald-500 text-teal-700 bg-teal-50 border-teal-100',
    violet: 'from-violet-500 to-fuchsia-500 text-violet-700 bg-violet-50 border-violet-100',
    amber: 'from-amber-500 to-orange-500 text-amber-700 bg-amber-50 border-amber-100',
  } as const;
  return (
    <div className={cn('rounded-2xl p-4 sm:p-5 border shadow-sm', tones[tone])}>
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-white/70 shadow-sm">
            <Icon size={18} strokeWidth={2.3} />
          </span>
          <span className="font-black text-base sm:text-lg">{label}</span>
        </div>
        <span className="text-xl sm:text-2xl font-black text-slate-900">{value}</span>
      </div>
      <div className="w-full h-2.5 rounded-full bg-white/60 overflow-hidden">
        <div
          className={cn('h-full rounded-full bg-gradient-to-l transition-[width] duration-1000 ease-out', tones[tone])}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

export function MemoryGameResult({ result, onReset, onExit }: MemoryGameResultProps) {
  const { score } = result;
  const encouragement = useMemo(() => scoreEncouragement(score.total), [score.total]);
  const [shareUrl] = useState<string>(() =>
    typeof window !== 'undefined'
      ? window.location.href.split('#')[0]
      : 'https://salmandyar.com/games/memory',
  );
  const [signupDismissed, setSignupDismissed] = useState<boolean>(() => {
    try {
      if (typeof localStorage === 'undefined') return false;
      return localStorage.getItem('salmandyar.memory.dismissSignup') === '1';
    } catch {
      return false;
    }
  });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      if (signupDismissed && typeof localStorage !== 'undefined') {
        localStorage.setItem('salmandyar.memory.dismissSignup', '1');
      }
    } catch {
      // ignore
    }
  }, [signupDismissed]);

  const shareMessage = useMemo(
    () =>
      `🧠 من امروز در بازی حافظه سالمندیار امتیاز ${score.total} گرفتم!\nتو چند می‌گیری؟\n${shareUrl}`,
    [score.total, shareUrl],
  );

  const handleShare = async (channel: ShareChannel) => {
    try {
      if (channel === 'native') {
        type N = Navigator & {
          share?: (d: { title?: string; text?: string; url?: string }) => Promise<void>;
        };
        if (typeof navigator !== 'undefined' && typeof (navigator as N).share === 'function') {
          await (navigator as N).share({
            title: 'نتیجه بازی حافظه سالمندیار',
            text: shareMessage,
            url: shareUrl,
          });
        } else {
          await handleShare('copy');
          return;
        }
      } else if (channel === 'whatsapp') {
        const href = `https://wa.me/?text=${encode(shareMessage)}`;
        window.open(href, '_blank', 'noopener,noreferrer');
      } else if (channel === 'telegram') {
        const href = `https://t.me/share/url?url=${encode(shareUrl)}&text=${encode(shareMessage)}`;
        window.open(href, '_blank', 'noopener,noreferrer');
      } else if (channel === 'copy') {
        try {
          if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(shareMessage);
          } else {
            const ta = document.createElement('textarea');
            ta.value = shareMessage;
            ta.style.position = 'fixed';
            ta.style.opacity = '0';
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
          }
          setCopied(true);
          toast.success('متن نتیجه در کلیپ‌بورد کپی شد.', { duration: 2500 });
          window.setTimeout(() => setCopied(false), 2500);
        } catch {
          toast.error('کپی انجام نشد؛ دستی کپی کنید.', { duration: 3000 });
        }
      }
      track('memory_game_shared', {
        channel,
        score: score.total,
      });
    } catch {
      // user cancelled or network error
    }
  };

  const handleSignupClick = () => {
    track('memory_game_signup_clicked', {
      variant: 'cta_main',
      score: score.total,
    });
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <section aria-labelledby="mg-result-heading" className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 id="mg-result-heading" className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
              نتیجه بازی
            </h2>
            <p className="mt-1 text-sm sm:text-base text-slate-600">
              امروز تمرین خوبی را با هم انجام دادیم.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="md" onClick={onReset} className="rounded-2xl">
              <RefreshCw size={18} />
              بازی دوباره
            </Button>
            <Button variant="outline" size="md" onClick={onExit} className="rounded-2xl">
              <X size={18} />
              خروج
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-5 items-stretch">
          <div className="lg:col-span-2 rounded-[2rem] border-2 border-slate-100 bg-gradient-to-br from-teal-50 via-emerald-50 to-amber-50 p-6 sm:p-8 flex flex-col items-center text-center shadow-sm">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 border border-white shadow-sm text-xs sm:text-sm font-black text-teal-700 mb-5">
              <Sparkles size={14} />
              امتیاز امروز شما
            </div>
            <CircularScore value={score.total} />
            <div className="mt-6 text-slate-900">
              <div className="text-2xl sm:text-3xl font-black leading-tight">
                {encouragement.emoji} {encouragement.title}
              </div>
              <p className="mt-2 text-sm sm:text-base text-slate-600 leading-relaxed max-w-md mx-auto">
                {encouragement.subtitle}
              </p>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3 w-full max-w-sm text-sm font-bold text-slate-700">
              <div className="rounded-2xl bg-white/80 border border-white p-3">
                پاسخ‌های درست
                <div className="text-xl sm:text-2xl font-black text-emerald-700 mt-0.5">
                  {result.correctCount} از {result.totalQuestions}
                </div>
              </div>
              <div className="rounded-2xl bg-white/80 border border-white p-3">
                مدت تمرین
                <div className="text-xl sm:text-2xl font-black text-teal-700 mt-0.5">
                  {Math.round(result.durationMs / 1000)} ثانیه
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 space-y-4">
            <div className="grid gap-3 sm:gap-4 sm:grid-cols-3">
              <MetricBar label="حافظه دیداری" icon={Eye} value={score.visualMemory} tone="teal" />
              <MetricBar label="توجه" icon={Target} value={score.attention} tone="violet" />
              <MetricBar label="یادآوری" icon={Lightbulb} value={score.recall} tone="amber" />
            </div>

            <div className="rounded-2xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 p-5 sm:p-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white inline-flex items-center justify-center shrink-0 shadow">
                  <CheckCircle2 size={20} strokeWidth={2.4} />
                </div>
                <div className="space-y-1.5 text-amber-950">
                  <p className="font-black text-base sm:text-lg leading-tight">
                    این امتیاز یک معیار بازی است و برای تشخیص آلزایمر یا دمانس طراحی نشده است.
                  </p>
                  <p className="text-sm sm:text-base leading-relaxed">
                    این بازی ابزار تشخیص یا درمان آلزایمر نیست و نتیجه آن جایگزین ارزیابی پزشک یا متخصص
                    نمی‌شود. در صورت نگرانی، به پزشک یا مرکز تخصصی مراجعه کنید.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Conversion CTA */}
      {!signupDismissed && (
        <section
          aria-labelledby="mg-cta-heading"
          className="relative overflow-hidden rounded-[2rem] border-2 border-teal-100 bg-gradient-to-br from-teal-500 via-emerald-500 to-green-600 text-white p-6 sm:p-8 shadow-xl shadow-teal-500/20"
        >
          <div className="absolute inset-0 opacity-20 pointer-events-none" aria-hidden>
            <div className="absolute top-6 left-6 w-56 h-56 rounded-full bg-white blur-3xl" />
            <div className="absolute bottom-6 right-6 w-64 h-64 rounded-full bg-yellow-200 blur-3xl" />
          </div>
          <div className="relative grid gap-6 lg:grid-cols-5 items-center">
            <div className="lg:col-span-3 space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 border border-white/25 backdrop-blur text-xs sm:text-sm font-black">
                <Users size={14} />
                برای دنبال کردن روند روزمره
              </div>
              <h3 id="mg-cta-heading" className="text-2xl sm:text-3xl font-black leading-tight">
                می‌خواهید نتیجه بازی‌های خود را ذخیره کنید؟
              </h3>
              <p className="text-white/90 text-sm sm:text-lg leading-relaxed max-w-2xl">
                با عضویت رایگان در سالمندیار می‌توانید روند بازی‌های خود را در روزهای مختلف دنبال کنید و در
                صورت تمایل اعضای خانواده را به پروفایل سالمند اضافه کنید.
              </p>
            </div>
            <div className="lg:col-span-2 space-y-3 w-full">
              <Button
                asChild
                size="lg"
                className="w-full justify-center rounded-2xl bg-white text-teal-700 hover:bg-white/95 shadow-xl shadow-black/10 ring-4 ring-white/20 border-0 py-4 text-base sm:text-lg font-black"
                onClick={handleSignupClick}
              >
                <Link href="/register?utm_source=memory_game">
                  <HeartHandshake size={20} strokeWidth={2.3} />
                  ثبت‌نام رایگان در سالمندیار برای تقویت و مراقبت از سالمند شما
                  <ChevronLeft size={18} strokeWidth={2.3} />
                </Link>
              </Button>
              <button
                type="button"
                onClick={() => setSignupDismissed(true)}
                className="w-full text-center text-sm sm:text-base font-bold text-white/80 hover:text-white underline underline-offset-4 py-3 rounded-2xl transition-colors"
              >
                فعلاً نمی‌خواهم
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Share */}
      <section
        aria-labelledby="mg-share-heading"
        className="rounded-3xl border border-slate-100 bg-gradient-to-br from-white via-slate-50/40 to-white p-5 sm:p-6 shadow-sm"
      >
        <header className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white flex items-center justify-center shadow-lg shadow-violet-500/20 ring-8 ring-violet-500/10 shrink-0">
              <Share2 size={20} strokeWidth={2.3} />
            </div>
            <div>
              <h3 id="mg-share-heading" className="font-black text-lg sm:text-xl text-slate-900">
                اشتراک‌گذاری نتیجه
              </h3>
              <p className="text-xs sm:text-sm text-slate-500">
                برای خانواده، دوستان یا پرستار معالج ارسال کنید.
              </p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 mb-4">
          <Button
            variant="outline"
            size="md"
            onClick={() => handleShare('whatsapp')}
            className="justify-start border-emerald-200 bg-emerald-50/50 text-emerald-800 hover:bg-emerald-100 rounded-2xl"
          >
            <MessageCircle size={17} className="text-emerald-600" />
            واتساپ
          </Button>
          <Button
            variant="outline"
            size="md"
            onClick={() => handleShare('telegram')}
            className="justify-start border-sky-200 bg-sky-50/50 text-sky-800 hover:bg-sky-100 rounded-2xl"
          >
            <Send size={17} className="text-sky-600" />
            تلگرام
          </Button>
          <Button
            variant="outline"
            size="md"
            onClick={() => handleShare('native')}
            className="justify-start border-violet-200 bg-violet-50/50 text-violet-800 hover:bg-violet-100 rounded-2xl"
          >
            <Share2 size={17} className="text-violet-600" />
            اشتراک‌گذاری
          </Button>
          <Button
            variant="outline"
            size="md"
            onClick={() => handleShare('copy')}
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
              <Copy size={17} className="text-slate-500" />
            )}
            {copied ? 'کپی شد' : 'کپی متن'}
          </Button>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm leading-relaxed text-slate-700">
          <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2">
            پیش‌نمایش متن ارسال
          </p>
          <pre className="whitespace-pre-wrap font-[inherit] text-slate-700">{shareMessage}</pre>
        </div>
      </section>
    </div>
  );
}
