import Link from 'next/link';
import {
  Syringe, Heart, Zap, Activity, Brain, Pill, FlaskConical, Stethoscope,
  Calculator, Gauge, Droplets, ArrowUpDown, AlertCircle, BookOpen,
  ListOrdered, Lightbulb, ChevronLeft, Sparkles,
} from 'lucide-react';
import type { DrugCalculationTab, DrugContent } from '@/lib/data/drug-content';
import { getDrugContent, DRUG_CONTENT } from '@/lib/data/drug-content';
import DrugFAQAccordion from './DrugFAQAccordion';

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
  ring: string;
  text: string;
  bgSoft: string;
  border: string;
  pill: string;
}> = {
  heparin: { gradient: 'from-rose-500 to-red-600', ring: 'ring-rose-500/20', text: 'text-rose-700', bgSoft: 'bg-rose-50', border: 'border-rose-200', pill: 'bg-rose-50 text-rose-700 border-rose-100' },
  dopamine: { gradient: 'from-pink-500 to-fuchsia-600', ring: 'ring-pink-500/20', text: 'text-pink-700', bgSoft: 'bg-pink-50', border: 'border-pink-200', pill: 'bg-pink-50 text-pink-700 border-pink-100' },
  epinephrine: { gradient: 'from-orange-500 to-red-600', ring: 'ring-orange-500/20', text: 'text-orange-700', bgSoft: 'bg-orange-50', border: 'border-orange-200', pill: 'bg-orange-50 text-orange-700 border-orange-100' },
  nitroglycerin: { gradient: 'from-emerald-500 to-teal-600', ring: 'ring-emerald-500/20', text: 'text-emerald-700', bgSoft: 'bg-emerald-50', border: 'border-emerald-200', pill: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  amiodarone: { gradient: 'from-violet-500 to-indigo-600', ring: 'ring-violet-500/20', text: 'text-violet-700', bgSoft: 'bg-violet-50', border: 'border-violet-200', pill: 'bg-violet-50 text-violet-700 border-violet-100' },
  pantoprazole: { gradient: 'from-cyan-500 to-blue-600', ring: 'ring-cyan-500/20', text: 'text-cyan-700', bgSoft: 'bg-cyan-50', border: 'border-cyan-200', pill: 'bg-cyan-50 text-cyan-700 border-cyan-100' },
  midazolam: { gradient: 'from-indigo-500 to-violet-600', ring: 'ring-indigo-500/20', text: 'text-indigo-700', bgSoft: 'bg-indigo-50', border: 'border-indigo-200', pill: 'bg-indigo-50 text-indigo-700 border-indigo-100' },
  fentanyl: { gradient: 'from-fuchsia-500 to-pink-600', ring: 'ring-fuchsia-500/20', text: 'text-fuchsia-700', bgSoft: 'bg-fuchsia-50', border: 'border-fuchsia-200', pill: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-100' },
  octreotide: { gradient: 'from-lime-600 to-emerald-600', ring: 'ring-lime-500/20', text: 'text-emerald-700', bgSoft: 'bg-lime-50', border: 'border-lime-200', pill: 'bg-lime-50 text-emerald-700 border-lime-100' },
  general: { gradient: 'from-indigo-500 via-purple-500 to-pink-600', ring: 'ring-indigo-500/20', text: 'text-indigo-700', bgSoft: 'bg-indigo-50', border: 'border-indigo-200', pill: 'bg-indigo-50 text-indigo-700 border-indigo-100' },
  percentage: { gradient: 'from-sky-500 to-blue-600', ring: 'ring-sky-500/20', text: 'text-sky-700', bgSoft: 'bg-sky-50', border: 'border-sky-200', pill: 'bg-sky-50 text-sky-700 border-sky-100' },
  drops: { gradient: 'from-blue-500 to-cyan-600', ring: 'ring-blue-500/20', text: 'text-blue-700', bgSoft: 'bg-blue-50', border: 'border-blue-200', pill: 'bg-blue-50 text-blue-700 border-blue-100' },
  converter: { gradient: 'from-teal-500 to-cyan-600', ring: 'ring-teal-500/20', text: 'text-teal-700', bgSoft: 'bg-teal-50', border: 'border-teal-200', pill: 'bg-teal-50 text-teal-700 border-teal-100' },
};

interface DrugContentSectionProps {
  tab: DrugCalculationTab;
  isActive: boolean;
  relatedToolsPage?: boolean;
}

export function DrugContentSection({ tab, isActive, relatedToolsPage }: DrugContentSectionProps) {
  const c: DrugContent = getDrugContent(tab);
  const Icon = iconMap[tab];
  const accent = accentMap[tab];

  const accentFaqs =
    tab === 'nitroglycerin' || tab === 'octreotide' ? 'emerald'
    : tab === 'amiodarone' || tab === 'dopamine' || tab === 'midazolam' ? 'indigo'
    : 'purple';

  return (
    <section
      aria-label={`محتوای تخصصی محاسبه ${c.persianName}`}
      data-drug-tab={tab}
      data-active={isActive}
      className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
    >
      <div className={`relative p-5 sm:p-8 bg-gradient-to-br from-slate-50 to-white ${accent.border} border-t-4`}>
        {/* H2 */}
        <div className="flex flex-wrap items-start gap-4 mb-6">
          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${accent.gradient} text-white flex items-center justify-center shadow-lg ${accent.ring} ring-8 shrink-0`}>
            <Icon size={28} />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-2 leading-tight">
              محاسبه دوز و انفوزیون {c.persianName}
            </h2>
            <p className="text-gray-600 sm:text-base leading-relaxed max-w-3xl">
              {c.intro}
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              {c.units.slice(0, 5).map(u => (
                <kbd key={u} className={`px-2.5 py-1 rounded-lg text-[11px] font-black ${accent.pill} border`}>
                  {u}
                </kbd>
              ))}
              <span className="text-[11px] font-bold text-gray-500">
                نام انگلیسی: <span className="text-gray-700">{c.englishName}</span>
                {c.genericName && <span className="mx-1 text-gray-300">|</span>}
                {c.genericName && <span className="text-gray-700">Generic: {c.genericName}</span>}
              </span>
            </div>
          </div>
        </div>

        {/* Entity Card (AEO friendly) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="rounded-2xl bg-white/80 border border-gray-100 backdrop-blur p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={16} className={accent.text} />
              <div className="text-[11px] font-black uppercase tracking-wider text-gray-500">طبقه‌بندی دارویی</div>
            </div>
            <div className="font-black text-gray-900">{c.category}</div>
          </div>
          <div className="rounded-2xl bg-white/80 border border-gray-100 backdrop-blur p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity size={16} className={accent.text} />
              <div className="text-[11px] font-black uppercase tracking-wider text-gray-500">واحدهای رایج</div>
            </div>
            <div className="text-sm font-bold text-gray-900 tracking-tight">{c.units.join(' / ')}</div>
          </div>
          <div className="rounded-2xl bg-white/80 border border-gray-100 backdrop-blur p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calculator size={16} className={accent.text} />
              <div className="text-[11px] font-black uppercase tracking-wider text-gray-500">فرمول کلیدی</div>
            </div>
            <div className="text-[13px] font-bold text-gray-800 truncate" title={c.formulaText}>
              {c.formulaText}
            </div>
          </div>
        </div>

        {/* Sub sections */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-6">
          {/* What is */}
          <div className="lg:col-span-7 rounded-2xl border border-gray-100 bg-gradient-to-br from-white to-slate-50 p-5 sm:p-6">
            <h3 className="text-xl font-black text-gray-900 mb-3 flex items-center gap-2.5">
              <span className={`w-9 h-9 rounded-xl ${accent.bgSoft} ${accent.text} flex items-center justify-center shrink-0`}>
                <BookOpen size={17} />
              </span>
              {c.persianName} چیست؟
            </h3>
            <p className="text-gray-700 leading-loose text-sm sm:text-[15px]">
              {c.whatIs}
            </p>
          </div>

          {/* Required Params */}
          <div className="lg:col-span-5 rounded-2xl border border-gray-100 bg-gradient-to-br from-white to-indigo-50/30 p-5 sm:p-6">
            <h3 className="text-xl font-black text-gray-900 mb-3 flex items-center gap-2.5">
              <span className={`w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0`}>
                <ListOrdered size={17} />
              </span>
              چه اطلاعاتی برای محاسبه نیاز است؟
            </h3>
            <ul className="space-y-2.5">
              {c.requiredParams.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="w-5 h-5 mt-0.5 rounded-full bg-indigo-500/10 text-indigo-700 text-[11px] font-black flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <span className="text-sm sm:text-[15px] text-gray-700 leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Calculation Guide + Formula */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-6">
          <div className="lg:col-span-7 rounded-2xl border border-gray-100 bg-white p-5 sm:p-6">
            <h3 className="text-xl font-black text-gray-900 mb-3 flex items-center gap-2.5">
              <span className={`w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0`}>
                <Calculator size={17} />
              </span>
              محاسبه {c.persianName} چگونه انجام می‌شود؟
            </h3>
            <p className="text-gray-700 leading-loose text-sm sm:text-[15px] mb-4">
              {c.calculationGuide}
            </p>
            <div dir="ltr" className="rounded-2xl bg-slate-900 text-slate-50 p-4 sm:p-5 font-mono text-xs sm:text-sm border border-slate-800 shadow-inner">
              <div className="text-slate-400 text-[10px] sm:text-[11px] font-black uppercase tracking-wider mb-1.5">Formula (FA)</div>
              <div className="break-words">{c.formulaText}</div>
              <div className="border-t border-slate-700 my-3" />
              <div className="text-slate-400 text-[10px] sm:text-[11px] font-black uppercase tracking-wider mb-1.5">Formula (EN)</div>
              <div className="break-words">{c.formulaEn}</div>
            </div>
          </div>

          {/* Important Notes */}
          <div className="lg:col-span-5 rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50/60 via-white to-orange-50/60 p-5 sm:p-6">
            <h3 className="text-xl font-black text-amber-900 mb-3 flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <Lightbulb size={17} />
              </span>
              نکات مهم در محاسبه {c.persianName}
            </h3>
            <ul className="space-y-2.5">
              {c.importantNotes.map((note, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <AlertCircle size={17} className="text-amber-600 mt-0.5 shrink-0" />
                  <span className="text-sm sm:text-[15px] text-amber-900 leading-relaxed">{note}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Related Calculations Internal Links */}
        {!relatedToolsPage && c.relatedTabs.length > 0 && (
          <div className="rounded-2xl border border-gray-100 bg-slate-50/70 p-5 sm:p-6 mb-4">
            <div className="text-[11px] font-black uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-500" /> محاسبات مرتبط (لینک داخلی)
            </div>
            <div className="flex flex-wrap gap-2">
              {c.relatedTabs.map(rt => {
                const rc = (DRUG_CONTENT as Record<string, DrugContent | undefined>)[rt];
                const RIcon = (iconMap as Record<string, React.ComponentType<{ size?: number; className?: string }> | undefined>)[rt];
                const rac = (accentMap as Record<string, { gradient: string } | undefined>)[rt];
                if (!rc || !RIcon || !rac) return null;
                return (
                  <Link
                    key={rt}
                    href={`#${rt}`}
                    className={`inline-flex items-center gap-2 h-10 px-3.5 rounded-xl bg-white border border-gray-200 hover:border-transparent hover:shadow-md transition group`}
                  >
                    <span className={`w-6 h-6 rounded-lg bg-gradient-to-br ${rac.gradient} text-white flex items-center justify-center shrink-0`}>
                      <RIcon size={13} />
                    </span>
                    <span className="font-bold text-sm text-gray-800 group-hover:text-gray-900">{rc.persianName}</span>
                    <ChevronLeft size={14} className="text-gray-400 group-hover:-translate-x-1 group-hover:text-gray-600 transition shrink-0" />
                  </Link>
                );
              }).filter(Boolean)}
            </div>
          </div>
        )}

        {/* FAQ Section */}
        <div className="rounded-2xl bg-gradient-to-br from-white via-white to-slate-50/80 border border-gray-100 p-5 sm:p-6 lg:p-7">
          <div className="flex items-center gap-3 mb-5">
            <div className={`w-12 h-12 rounded-2xl ${accent.bgSoft} ${accent.text} flex items-center justify-center shrink-0`}>
              <BookOpen size={22} />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-gray-900">
                سوالات متداول درباره محاسبه {c.persianName}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {c.faqs.length} سوال متداول با پاسخ مستقیم و توضیح تکمیلی
              </p>
            </div>
          </div>
          <DrugFAQAccordion faqs={c.faqs} accentClass={accentFaqs} />
        </div>
      </div>
    </section>
  );
}

export { accentMap, iconMap };
