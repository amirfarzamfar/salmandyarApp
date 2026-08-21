'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  Syringe, Heart, Zap, Activity, Brain, Pill, FlaskConical, Stethoscope,
  Calculator, Gauge, Droplets, ArrowUpDown,
} from 'lucide-react';
import { DRUG_TAB_ORDER, getDrugContent, type DrugCalculationTab } from '@/lib/data/drug-content';
import { DrugCalcTabId, DRUG_CALC_TAB_IDS } from './DrugDosageCalculatorTool';

const iconMap: Record<DrugCalculationTab, React.ComponentType<{ size?: number; className?: string }>> = {
  heparin: Syringe,
  dopamine: Heart,
  epinephrine: Zap,
  nitroglycerin: Activity,
  amiodarone: Brain,
  pantoprazole: Pill,
  midazolam: Brain,
  fentanyl: FlaskConical,
  octreotide: Stethoscope,
  general: Calculator,
  percentage: Gauge,
  drops: Droplets,
  converter: ArrowUpDown,
};

const accentMap: Record<DrugCalculationTab, {
  gradient: string;
  text: string;
  bgSoft: string;
  border: string;
  pill: string;
}> = {
  heparin:     { gradient: 'from-rose-500 to-red-600',   text: 'text-rose-700',     bgSoft: 'bg-rose-50',     border: 'border-rose-200',     pill: 'bg-rose-50 text-rose-700 border-rose-100' },
  dopamine:    { gradient: 'from-pink-500 to-fuchsia-600', text: 'text-pink-700',   bgSoft: 'bg-pink-50',     border: 'border-pink-200',     pill: 'bg-pink-50 text-pink-700 border-pink-100' },
  epinephrine: { gradient: 'from-orange-500 to-red-600', text: 'text-orange-700',  bgSoft: 'bg-orange-50',   border: 'border-orange-200',   pill: 'bg-orange-50 text-orange-700 border-orange-100' },
  nitroglycerin:{ gradient: 'from-emerald-500 to-teal-600', text: 'text-emerald-700', bgSoft: 'bg-emerald-50', border: 'border-emerald-200',  pill: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  amiodarone:  { gradient: 'from-violet-500 to-indigo-600', text: 'text-violet-700', bgSoft: 'bg-violet-50',   border: 'border-violet-200',   pill: 'bg-violet-50 text-violet-700 border-violet-100' },
  pantoprazole:{ gradient: 'from-cyan-500 to-blue-600',  text: 'text-cyan-700',    bgSoft: 'bg-cyan-50',     border: 'border-cyan-200',     pill: 'bg-cyan-50 text-cyan-700 border-cyan-100' },
  midazolam:   { gradient: 'from-indigo-500 to-violet-600', text: 'text-indigo-700', bgSoft: 'bg-indigo-50',   border: 'border-indigo-200',   pill: 'bg-indigo-50 text-indigo-700 border-indigo-100' },
  fentanyl:    { gradient: 'from-fuchsia-500 to-pink-600', text: 'text-fuchsia-700', bgSoft: 'bg-fuchsia-50',  border: 'border-fuchsia-200',  pill: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-100' },
  octreotide:  { gradient: 'from-lime-600 to-emerald-600', text: 'text-emerald-700', bgSoft: 'bg-lime-50',    border: 'border-lime-200',     pill: 'bg-lime-50 text-emerald-700 border-lime-100' },
  general:     { gradient: 'from-indigo-500 via-purple-500 to-pink-600', text: 'text-indigo-700', bgSoft: 'bg-indigo-50', border: 'border-indigo-200',   pill: 'bg-indigo-50 text-indigo-700 border-indigo-100' },
  percentage:  { gradient: 'from-sky-500 to-blue-600',   text: 'text-sky-700',     bgSoft: 'bg-sky-50',      border: 'border-sky-200',      pill: 'bg-sky-50 text-sky-700 border-sky-100' },
  drops:       { gradient: 'from-blue-500 to-cyan-600',  text: 'text-blue-700',    bgSoft: 'bg-blue-50',     border: 'border-blue-200',     pill: 'bg-blue-50 text-blue-700 border-blue-100' },
  converter:   { gradient: 'from-teal-500 to-cyan-600',  text: 'text-teal-700',    bgSoft: 'bg-teal-50',     border: 'border-teal-200',     pill: 'bg-teal-50 text-teal-700 border-teal-100' },
};

const slugToTabId = (slug: string | null | undefined): DrugCalcTabId => {
  if (!slug) return 'heparin';
  const clean = slug.replace(/^#/, '').trim();
  if ((DRUG_CALC_TAB_IDS as readonly string[]).includes(clean)) return clean as DrugCalcTabId;
  return 'heparin';
};

export default function DrugCalculatorSidebarNav() {
  const router = useRouter();
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState<DrugCalcTabId>('heparin');
  const [, forceTick] = useState(0);

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

  const switchTab = useCallback((e: React.MouseEvent, tab: DrugCalcTabId) => {
    e.preventDefault();
    if (activeTab === tab) return;
    setActiveTab(tab);
    if (typeof window !== 'undefined') {
      const newHash = `#${tab}`;
      if (window.location.hash !== newHash) {
        try {
          router.replace(`${pathname}${newHash}`, { scroll: false });
        } catch {
          window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}${newHash}`);
        }
      }
      const anchor = document.getElementById('drug-calc-calculator-anchor');
      if (anchor) {
        anchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [activeTab, pathname, router]);

  return (
    <nav
      aria-label="لیست داروهای موجود در ماشین حساب دارویی"
      className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-100 shadow-sm"
    >
      <h3 className="font-black text-base sm:text-lg text-gray-900 mb-3 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500" />
        محاسبات دارویی موجود
      </h3>
      <p className="text-xs sm:text-[13px] text-gray-500 leading-relaxed mb-4">
        ۱۳ ابزار پرکاربرد دارویی برای پرستاران ICU و اورژانس. روی هر مورد کلیک کنید تا ماشین‌حساب اختصاصی همان دارو نمایش داده شود.
      </p>

      <ul className="space-y-1.5">
        {DRUG_TAB_ORDER.map(tab => {
          const c = getDrugContent(tab);
          const Icon = iconMap[tab];
          const accent = accentMap[tab];
          const isActive = hydrated && tab === activeTab;
          return (
            <li key={tab}>
              <a
                href={`#${tab}`}
                onClick={(e) => switchTab(e, tab)}
                className={`group flex items-center justify-between gap-3 p-2.5 rounded-2xl transition border ${
                  isActive
                    ? `${accent.bgSoft} ${accent.border} shadow-sm`
                    : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                }`}
                aria-current={isActive ? 'true' : undefined}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-9 h-9 rounded-xl shrink-0 bg-gradient-to-br ${accent.gradient} text-white flex items-center justify-center shadow-sm`}>
                    <Icon size={16} />
                  </div>
                  <div className="min-w-0">
                    <div className={`text-sm font-bold leading-tight truncate ${isActive ? accent.text : 'text-gray-800 group-hover:text-gray-900'}`}>
                      {c.persianName}
                    </div>
                    <div className="text-[11px] text-gray-500 mt-0.5 truncate">
                      {c.units.slice(0, 2).join(' · ')}
                    </div>
                  </div>
                </div>
                <div className={`shrink-0 rounded-lg px-2 py-0.5 text-[10px] font-black border ${isActive ? accent.pill : 'bg-gray-50 text-gray-500 border-gray-100 group-hover:bg-white'}`}>
                  #{tab}
                </div>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
