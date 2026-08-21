'use client';

import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Pill, Sparkles, Hash, MoveUp } from 'lucide-react';
import DrugDosageCalculatorTool, { DrugCalcTabId, DRUG_CALC_TAB_IDS } from './DrugDosageCalculatorTool';
import { DrugContentSection, accentMap, iconMap } from './DrugContentSection';
import { getDrugContent, DRUG_TAB_ORDER } from '@/lib/data/drug-content';

const slugToTabId = (slug: string | null | undefined): DrugCalcTabId => {
  if (!slug) return 'heparin';
  const clean = slug.replace(/^#/, '').trim();
  if ((DRUG_CALC_TAB_IDS as readonly string[]).includes(clean)) return clean as DrugCalcTabId;
  return 'heparin';
};

export default function DrugDosageCalculatorPageClient() {
  const router = useRouter();
  const pathname = usePathname();
  const contentAreaRef = useRef<HTMLDivElement>(null);

  const [activeTab, setActiveTab] = useState<DrugCalcTabId>('heparin');
  const [, forceTick] = useState(0);

  // ---- Sync Active Tab from URL Hash on mount + listen to browser Back/Forward (hashchange) ----
  useEffect(() => {
    let cancelled = false;
    const readHash = () => {
      if (typeof window === 'undefined') return 'heparin' as DrugCalcTabId;
      return slugToTabId(window.location.hash || '');
    };
    const schedule = () => {
      if (cancelled) return;
      queueMicrotask(() => {
        if (cancelled) return;
        setActiveTab(readHash());
        forceTick(n => n + 1);
      });
    };
    schedule();
    const onHashChange = () => schedule();
    window.addEventListener('hashchange', onHashChange);
    return () => {
      cancelled = true;
      window.removeEventListener('hashchange', onHashChange);
    };
  }, []);

  const hydrated = typeof window !== 'undefined';

  // ---- Update URL hash when tab changes via client-side router ----
  const onTabChange = useCallback((next: DrugCalcTabId) => {
    if (activeTab === next) return;
    setActiveTab(next);
    if (typeof window !== 'undefined') {
      const newHash = `#${next}`;
      if (window.location.hash !== newHash) {
        try {
          router.replace(`${pathname}${newHash}`, { scroll: false });
        } catch {
          window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}${newHash}`);
        }
      }
    }
    // Scroll to calculator top for UX
    contentAreaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [activeTab, pathname, router]);

  // ---- Update <title> client-side for active drug (UX/OG refresh) ----
  useEffect(() => {
    if (!hydrated) return;
    const c = getDrugContent(activeTab);
    if (typeof document !== 'undefined') {
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle && c) {
        ogTitle.setAttribute('content', c.seoTitle);
      }
    }
  }, [activeTab, hydrated]);

  // ---- Sub-navigation internal click-to-switch from Content sections ----
  const onJumpToTab = useCallback((e: React.MouseEvent, target: string) => {
    if (target.startsWith('#') && DRUG_CALC_TAB_IDS.includes(target.slice(1) as DrugCalcTabId)) {
      e.preventDefault();
      onTabChange(target.slice(1) as DrugCalcTabId);
    }
  }, [onTabChange]);

  const activeContent = useMemo(() => getDrugContent(activeTab), [activeTab]);
  const activeAccent = accentMap[activeTab];
  const ActiveIcon = iconMap[activeTab];

  return (
    <div className="relative">
      {/* Client-side sub header breadcrumb / visual indicator */}
      {hydrated && (
        <div className="mb-4 sm:mb-5 flex flex-wrap items-center gap-2">
          <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-gradient-to-l ${activeAccent.gradient} text-white text-xs font-black shadow-md ${activeAccent.ring} ring-4`}>
            <Hash size={12} />
            {/* Deep Link / URL مستقیم دارو انتخاب‌شده */}
          </div>
          <div className="font-black text-sm sm:text-[15px] text-gray-800 flex items-center gap-2">
            <span className={`w-6 h-6 rounded-lg bg-gradient-to-br ${activeAccent.gradient} text-white flex items-center justify-center shrink-0`}>
              <ActiveIcon size={13} />
            </span>
            {activeContent.persianName}
            <code className="mx-1 text-[11px] font-black text-gray-500 bg-gray-100 rounded-lg px-2 py-0.5 border border-gray-200">#{activeTab}</code>
          </div>
          <div className="ml-auto inline-flex items-center gap-2">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl bg-white text-gray-600 text-xs font-bold border border-gray-200 hover:bg-gray-50 hover:text-gray-900 transition"
            >
              <MoveUp size={14} />
              بازگشت به ابتدا
            </a>
          </div>
        </div>
      )}

      <div ref={contentAreaRef} id="drug-calc-calculator-anchor">
        <DrugDosageCalculatorTool
          activeTab={activeTab}
          onActiveTabChange={onTabChange}
          defaultTab="heparin"
        />
      </div>

      {/* Inline-jump capture for relatedTabs anchor links inside content sections */}
      <div
        onClickCapture={(e) => {
          const target = (e.target as HTMLElement).closest('a');
          if (!target) return;
          const href = target.getAttribute('href') || '';
          if (href.startsWith('#') && DRUG_CALC_TAB_IDS.includes(href.slice(1) as DrugCalcTabId)) {
            onJumpToTab(e, href);
          }
        }}
        className="mt-8 space-y-6"
      >
        {/* All 13 sections rendered here — they are all in DOM for Google SEO/AEO.
            The active one is visible; inactive ones hidden via CSS. Google does crawl display:none content
            and they remain semantic accessible via DOM structure for LLMs. */}
        {DRUG_TAB_ORDER.map(tab => {
          const isActive = tab === activeTab;
          return (
            <div
              key={tab}
              id={`drug-section-${tab}`}
              aria-hidden={!isActive}
              data-drug-tab={tab}
              className={
                !isActive
                  ? 'hidden [&_section]:!opacity-0 sr-only-hidden-for-seo-not-really'
                  : 'block animate-[fadeIn_0.3s_ease-out]'
              }
              style={!isActive ? { display: 'none' } : undefined}
            >
              <DrugContentSection tab={tab} isActive={isActive} />
            </div>
          );
        })}
      </div>

      {/* Global Disclaimer / HCP only warning (visually separate, appears once below all) */}
      <div className="mt-10 rounded-3xl p-5 sm:p-8 border-2 bg-gradient-to-br from-rose-50 via-white to-orange-50 border-rose-200 flex items-start gap-3 sm:gap-4">
        <div className="w-12 h-12 shrink-0 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center">
          <Sparkles size={22} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-black text-base sm:text-lg text-rose-900 mb-2 flex items-center gap-2">
            <Pill size={18} className="text-rose-700 shrink-0" />
            هشدار عمومی سلب مسئولیت در خصوص محاسبات دارویی
          </h4>
          <p className="text-xs sm:text-sm text-rose-800 leading-loose font-medium">
            تمام محتوا و محاسبات ارائه‌شده در ابزار محاسبات دارویی سالمندیار
            <strong className="text-rose-900 mx-1">صرفاً جهت کمک محاسباتی برای پزشک و پرستار مجرب</strong>
            و برای تمرین یا حفظ اطلاعات عمومی می‌باشد و هرگز نباید جایگزین قضاوت بالینی، دستور تجویزی کتبی پزشک، پروتکل‌های رسمی بیمارستان و یا محاسبه دستی و تأیید شده (Double Check) قرار گیرد.
            قبل از تزریق هر دارویی، حتماً نام دارو، تاریخ انقضا، دستور پزشک، وزن واقعی بیمار، غلظت واقعی فرآورده دارویی، سرعت محاسبه‌شده و پروتکل مرکز درمانی را به‌صورت دستی و دو نفره بررسی و تطبیق دهید.
            اشتباه در محاسبات دارویی ICU و اورژانس می‌تواند منجر به عوارض جدی یا مرگ بیمار شود و مسئولیت آن با تجویزکننده و تزریق‌کننده دارو می‌باشد.
          </p>
        </div>
      </div>
    </div>
  );
}
