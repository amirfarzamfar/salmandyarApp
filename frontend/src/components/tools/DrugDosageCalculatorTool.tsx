'use client';

import { useState } from 'react';
import {
  Pill,
  Calculator,
  AlertTriangle,
  CheckCircle2,
  Droplets,
  ArrowUpDown,
  Syringe,
  Heart,
  Activity,
  Brain,
  Stethoscope,
  Gauge,
  Zap,
  FlaskConical,
  Scale,
} from 'lucide-react';

type TabId =
  | 'heparin'
  | 'dopamine'
  | 'epinephrine'
  | 'nitroglycerin'
  | 'amiodarone'
  | 'pantoprazole'
  | 'midazolam'
  | 'fentanyl'
  | 'octreotide'
  | 'general'
  | 'percentage'
  | 'drops'
  | 'converter';

const TAB_LIST: { id: TabId; label: string; icon: React.ReactNode; short: string }[] = [
  { id: 'heparin', label: 'هپارین / انسولین', icon: <Syringe size={16} />, short: 'واحد بر ساعت' },
  { id: 'dopamine', label: 'دوپامین / دبوتامین', icon: <Heart size={16} />, short: 'مک‌گرم/کگ/دقیقه' },
  { id: 'epinephrine', label: 'اپی / نوراپی نفرین', icon: <Zap size={16} />, short: 'مک‌گرم/دقیقه' },
  { id: 'nitroglycerin', label: 'نیتروگلیسیرین', icon: <Activity size={16} />, short: 'مک‌گرم/دقیقه' },
  { id: 'amiodarone', label: 'آمیودارون / لیدوکایین', icon: <Brain size={16} />, short: 'میلی‌گرم/دقیقه' },
  { id: 'pantoprazole', label: 'پنتاپرازول', icon: <Pill size={16} />, short: 'میلی‌گرم/ساعت' },
  { id: 'midazolam', label: 'میدازولام', icon: <Brain size={16} />, short: 'میلی یا میکروگرم/ساعت' },
  { id: 'fentanyl', label: 'فنتانیل', icon: <FlaskConical size={16} />, short: 'میکروگرم/ساعت' },
  { id: 'octreotide', label: 'اکتریوتاید', icon: <Stethoscope size={16} />, short: 'میکروگرم/ساعت' },
  { id: 'general', label: 'محاسبه عمومی دارو', icon: <Calculator size={16} />, short: 'همه داروها' },
  { id: 'percentage', label: 'داروهای درصدی', icon: <Gauge size={16} />, short: '۱٪ = ۱۰ میلی‌گرم/میلی‌لیتر' },
  { id: 'drops', label: 'قطرات سرم', icon: <Droplets size={16} />, short: 'فاکتور ۱۵' },
  { id: 'converter', label: 'تبدیل واحدها', icon: <ArrowUpDown size={16} />, short: 'گرم ↔ میلی ↔ میکرو' },
];

type Num = number | '';

export default function DrugDosageCalculatorTool() {
  const [activeTab, setActiveTab] = useState<TabId>('heparin');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [results, setResults] = useState<Record<string, any>>({});

  // ====== Heparin / Insulin ======
  const [hepDose, setHepDose] = useState<Num>('');
  const [hepDrug, setHepDrug] = useState<Num>('');
  const [hepVol, setHepVol] = useState<Num>('');

  // ====== Dopamine / Dobutamine / Milrinone ======
  const [dopDose, setDopDose] = useState<Num>('');
  const [dopWeight, setDopWeight] = useState<Num>('');
  const [dopDrug, setDopDrug] = useState<Num>('');
  const [dopVol, setDopVol] = useState<Num>('');

  // ====== Epinephrine / Norepinephrine ======
  const [epiDose, setEpiDose] = useState<Num>('');
  const [epiDrug, setEpiDrug] = useState<Num>('');
  const [epiVol, setEpiVol] = useState<Num>('');

  // ====== Nitroglycerin ======
  const [nitroDose, setNitroDose] = useState<Num>('');
  const [nitroDrug, setNitroDrug] = useState<Num>('');
  const [nitroVol, setNitroVol] = useState<Num>('');

  // ====== Amiodarone / Lidocaine ======
  const [amioDose, setAmioDose] = useState<Num>('');
  const [amioDrug, setAmioDrug] = useState<Num>('');
  const [amioVol, setAmioVol] = useState<Num>('');

  // ====== Pantoprazole ======
  const [panDose, setPanDose] = useState<Num>('');
  const [panDrug, setPanDrug] = useState<Num>('');
  const [panVol, setPanVol] = useState<Num>('');

  // ====== Midazolam ======
  const [midDose, setMidDose] = useState<Num>('');
  const [midDrug, setMidDrug] = useState<Num>('');
  const [midVol, setMidVol] = useState<Num>('');
  const [midUnit, setMidUnit] = useState<'mg' | 'mcg'>('mg');

  // ====== Fentanyl ======
  const [fenDose, setFenDose] = useState<Num>('');
  const [fenDrug, setFenDrug] = useState<Num>('');
  const [fenVol, setFenVol] = useState<Num>('');

  // ====== Octreotide ======
  const [octDose, setOctDose] = useState<Num>('');
  const [octDrug, setOctDrug] = useState<Num>('');
  const [octVol, setOctVol] = useState<Num>('');

  // ====== General Drug ======
  const [gDrugName, setGDrugName] = useState('');
  const [gPatient, setGPatient] = useState('');
  const [gNurse, setGNurse] = useState('');
  const [gDose, setGDose] = useState<Num>('');
  const [gDoseUnit, setGDoseUnit] = useState<'mcg' | 'mg' | 'g' | 'U'>('mg');
  const [gSyringeVol, setGSyringeVol] = useState<Num>('');
  const [gPrescribed, setGPrescribed] = useState<Num>('');
  const [gPrescribedUnit, setGPrescribedUnit] = useState<string>('mg/hr');
  const [gWeight, setGWeight] = useState<Num>('');
  const [gMethod, setGMethod] = useState<'macroset' | 'microset'>('macroset');

  // ====== Percentage Drug ======
  const [pct, setPct] = useState<Num>('');
  const [pctDose, setPctDose] = useState<Num>('');
  const [pctUnit, setPctUnit] = useState<'mg' | 'g'>('mg');

  // ====== Serum Drops ======
  const [sVol, setSVol] = useState<Num>('');
  const [sHours, setSHours] = useState<Num>('');

  // ====== Unit Converter ======
  const [cVal, setCVal] = useState<Num>('');
  const [cFrom, setCFrom] = useState<'mcg' | 'mg' | 'g' | 'kg'>('mg');
  const [cTo, setCTo] = useState<'mcg' | 'mg' | 'g' | 'kg'>('mcg');

  const PRESCRIBED_UNITS = [
    'mg/hr', 'mg/min', 'mg/kg/hr', 'mg/kg/min',
    'mcg/hr', 'mcg/min', 'mcg/kg/hr', 'mcg/kg/min',
    'U/hr', 'U/min', 'U/kg/hr', 'U/kg/min',
  ];

  const clearTab = (tab: TabId) => {
    const res = { ...results }; delete res[tab]; setResults(res);
    const err = { ...errors }; delete err[tab]; setErrors(err);
    switch (tab) {
      case 'heparin': setHepDose(''); setHepDrug(''); setHepVol(''); break;
      case 'dopamine': setDopDose(''); setDopWeight(''); setDopDrug(''); setDopVol(''); break;
      case 'epinephrine': setEpiDose(''); setEpiDrug(''); setEpiVol(''); break;
      case 'nitroglycerin': setNitroDose(''); setNitroDrug(''); setNitroVol(''); break;
      case 'amiodarone': setAmioDose(''); setAmioDrug(''); setAmioVol(''); break;
      case 'pantoprazole': setPanDose(''); setPanDrug(''); setPanVol(''); break;
      case 'midazolam': setMidDose(''); setMidDrug(''); setMidVol(''); break;
      case 'fentanyl': setFenDose(''); setFenDrug(''); setFenVol(''); break;
      case 'octreotide': setOctDose(''); setOctDrug(''); setOctVol(''); break;
      case 'general':
        setGDrugName(''); setGPatient(''); setGNurse('');
        setGDose(''); setGSyringeVol(''); setGPrescribed(''); setGWeight(''); break;
      case 'percentage': setPct(''); setPctDose(''); break;
      case 'drops': setSVol(''); setSHours(''); break;
      case 'converter': setCVal(''); break;
    }
  };

  const err = (msg: string) => ({ error: msg });
  const allP = (...nums: Num[]) => nums.every(n => typeof n === 'number' && !isNaN(n) && n > 0);

  // ============ CALCULATIONS ============
  const calcHeparin = () => {
    if (!allP(hepDose, hepDrug, hepVol)) return err('لطفاً مقادیر معتبر و بزرگتر از صفر وارد کنید');
    const infusion = (Number(hepDose) * Number(hepVol)) / Number(hepDrug);
    return {
      infusion, unit: 'میلی‌لیتر در ساعت',
      lines: [
        { k: 'دوز تجویز شده', v: `${hepDose} واحد/ساعت` },
        { k: 'مقدار کل دارو', v: `${hepDrug} واحد` },
        { k: 'حجم کل محلول', v: `${hepVol} میلی‌لیتر` },
      ],
      formula: `(${hepDose} × ${hepVol}) ÷ ${hepDrug} = ${infusion.toFixed(2)} میلی‌لیتر/ساعت`,
    };
  };

  const calcDopamine = () => {
    if (!allP(dopDose, dopWeight, dopDrug, dopVol)) return err('لطفاً همه مقادیر شامل وزن بیمار را وارد کنید');
    const conc = Number(dopDrug) / Number(dopVol);
    const infusion = (Number(dopDose) * Number(dopWeight) * 60) / (conc * 1000);
    return {
      infusion, unit: 'میلی‌لیتر در ساعت',
      lines: [
        { k: 'دوز تجویز شده', v: `${dopDose} میکروگرم/کیلوگرم/دقیقه` },
        { k: 'وزن بیمار', v: `${dopWeight} کیلوگرم` },
        { k: 'مقدار کل دارو', v: `${dopDrug} میلی‌گرم` },
        { k: 'حجم کل محلول', v: `${dopVol} میلی‌لیتر` },
        { k: 'غلظت محاسبه شده', v: `${conc.toFixed(2)} میلی‌گرم/میلی‌لیتر` },
      ],
      formula: `(${dopDose} × ${dopWeight} × ۶۰) ÷ (${conc.toFixed(2)} × ۱۰۰۰) = ${infusion.toFixed(2)} ml/hr`,
    };
  };

  const calcEpinephrine = () => {
    if (!allP(epiDose, epiDrug, epiVol)) return err('لطفاً همه مقادیر را وارد کنید');
    const conc = Number(epiDrug) / Number(epiVol);
    const infusion = (Number(epiDose) * 60) / (conc * 1000);
    return {
      infusion, unit: 'میلی‌لیتر در ساعت',
      lines: [
        { k: 'دوز تجویز شده', v: `${epiDose} میکروگرم/دقیقه` },
        { k: 'مقدار کل دارو', v: `${epiDrug} میلی‌گرم` },
        { k: 'حجم کل محلول', v: `${epiVol} میلی‌لیتر` },
        { k: 'غلظت', v: `${conc.toFixed(2)} میلی‌گرم/میلی‌لیتر` },
      ],
      formula: `(${epiDose} × ۶۰) ÷ (${conc.toFixed(2)} × ۱۰۰۰) = ${infusion.toFixed(2)} ml/hr`,
    };
  };

  const calcNitro = () => {
    if (!allP(nitroDose, nitroDrug, nitroVol)) return err('لطفاً همه مقادیر را وارد کنید');
    const conc = Number(nitroDrug) / Number(nitroVol);
    const infusion = (Number(nitroDose) * 60) / (conc * 1000);
    return {
      infusion, unit: 'میلی‌لیتر در ساعت',
      lines: [
        { k: 'دوز تجویز شده', v: `${nitroDose} میکروگرم/دقیقه` },
        { k: 'مقدار کل دارو', v: `${nitroDrug} میلی‌گرم` },
        { k: 'حجم کل محلول', v: `${nitroVol} میلی‌لیتر` },
      ],
      formula: `(${nitroDose} × ۶۰) ÷ (${conc.toFixed(2)} × ۱۰۰۰) = ${infusion.toFixed(2)} ml/hr`,
    };
  };

  const calcAmio = () => {
    if (!allP(amioDose, amioDrug, amioVol)) return err('لطفاً همه مقادیر را وارد کنید');
    const conc = Number(amioDrug) / Number(amioVol);
    const infusion = (Number(amioDose) * 60) / conc;
    return {
      infusion, unit: 'میلی‌لیتر در ساعت',
      lines: [
        { k: 'دوز تجویز شده', v: `${amioDose} میلی‌گرم/دقیقه` },
        { k: 'مقدار کل دارو', v: `${amioDrug} میلی‌گرم` },
        { k: 'حجم کل محلول', v: `${amioVol} میلی‌لیتر` },
      ],
      formula: `(${amioDose} × ۶۰) ÷ ${conc.toFixed(2)} = ${infusion.toFixed(2)} ml/hr`,
    };
  };

  const calcPan = () => {
    if (!allP(panDose, panDrug, panVol)) return err('لطفاً همه مقادیر را وارد کنید');
    const infusion = (Number(panDose) * Number(panVol)) / Number(panDrug);
    const conc = Number(panDrug) / Number(panVol);
    return {
      infusion, unit: 'میلی‌لیتر در ساعت',
      lines: [
        { k: 'دوز تجویز شده', v: `${panDose} میلی‌گرم/ساعت` },
        { k: 'مقدار کل دارو', v: `${panDrug} میلی‌گرم` },
        { k: 'حجم کل محلول', v: `${panVol} میلی‌لیتر` },
        { k: 'غلظت', v: `${conc.toFixed(2)} میلی‌گرم/میلی‌لیتر` },
      ],
      formula: `(${panDose} × ${panVol}) ÷ ${panDrug} = ${infusion.toFixed(2)} ml/hr`,
    };
  };

  const calcMid = () => {
    if (!allP(midDose, midDrug, midVol)) return err('لطفاً همه مقادیر را وارد کنید');
    const infusion = (Number(midDose) * Number(midVol)) / Number(midDrug);
    const dUnit = midUnit === 'mg' ? 'میلی‌گرم/ساعت' : 'میکروگرم/ساعت';
    const drugUnit = midUnit === 'mg' ? 'میلی‌گرم' : 'میکروگرم';
    return {
      infusion, unit: 'میلی‌لیتر در ساعت',
      lines: [
        { k: 'دوز تجویز شده', v: `${midDose} ${dUnit}` },
        { k: 'مقدار کل دارو', v: `${midDrug} ${drugUnit}` },
        { k: 'حجم کل محلول', v: `${midVol} میلی‌لیتر` },
      ],
      formula: `(${midDose} × ${midVol}) ÷ ${midDrug} = ${infusion.toFixed(2)} ml/hr`,
    };
  };

  const calcFen = () => {
    if (!allP(fenDose, fenDrug, fenVol)) return err('لطفاً همه مقادیر را وارد کنید');
    const infusion = (Number(fenDose) * Number(fenVol)) / Number(fenDrug);
    return {
      infusion, unit: 'میلی‌لیتر در ساعت',
      lines: [
        { k: 'دوز تجویز شده', v: `${fenDose} میکروگرم/ساعت` },
        { k: 'مقدار کل دارو', v: `${fenDrug} میکروگرم` },
        { k: 'حجم کل محلول', v: `${fenVol} میلی‌لیتر` },
      ],
      formula: `(${fenDose} × ${fenVol}) ÷ ${fenDrug} = ${infusion.toFixed(2)} ml/hr`,
    };
  };

  const calcOct = () => {
    if (!allP(octDose, octDrug, octVol)) return err('لطفاً همه مقادیر را وارد کنید');
    const infusion = (Number(octDose) * Number(octVol)) / Number(octDrug);
    return {
      infusion, unit: 'میلی‌لیتر در ساعت',
      lines: [
        { k: 'دوز تجویز شده', v: `${octDose} میکروگرم/ساعت` },
        { k: 'مقدار کل دارو', v: `${octDrug} میکروگرم` },
        { k: 'حجم کل محلول', v: `${octVol} میلی‌لیتر` },
      ],
      formula: `(${octDose} × ${octVol}) ÷ ${octDrug} = ${infusion.toFixed(2)} ml/hr`,
    };
  };

  const calcGeneral = () => {
    if (!allP(gDose, gSyringeVol, gPrescribed)) return err('لطفاً حداقل دوز دارو، حجم سرنگ و دوز تجویزی را وارد کنید');
    const includesKg = gPrescribedUnit.includes('kg');
    if (includesKg && (!gWeight || Number(gWeight) <= 0)) return err('برای دوز بر اساس کیلوگرم، وزن بیمار را وارد کنید');

    let totalBase = Number(gDose);
    const isUnit = gDoseUnit === 'U';
    if (!isUnit) {
      if (gDoseUnit === 'g') totalBase *= 1000000;
      else if (gDoseUnit === 'mg') totalBase *= 1000;
    }

    const presNumer = gPrescribedUnit.split('/')[0];
    if (presNumer === 'U' && !isUnit) return err('واحد دارو جرمی است اما دوز تجویزی بر اساس U (واحد) می‌باشد');
    if (presNumer !== 'U' && isUnit) return err('واحد دارو U است اما دوز تجویزی جرمی می‌باشد');

    let perHour = Number(gPrescribed);
    if (gPrescribedUnit.includes('min')) perHour *= 60;
    if (includesKg) perHour *= Number(gWeight);
    if (presNumer === 'mg') perHour *= 1000;
    else if (presNumer === 'g') perHour *= 1000000;

    const conc = totalBase / Number(gSyringeVol);
    let rateMlHr = perHour / conc;
    let rate = rateMlHr;
    let rateUnit = 'میلی‌لیتر در ساعت';

    if (gMethod === 'microset') {
      rate = rateMlHr;
      rateUnit = 'قطره در دقیقه (میکروست - ۶۰ قطره/میلی‌لیتر)';
    }

    return {
      infusion: rate, unit: rateUnit,
      lines: [
        { k: 'دوز تجویزی', v: `${gPrescribed} ${gPrescribedUnit}` },
        { k: 'حجم کل محلول', v: `${gSyringeVol} میلی‌لیتر` },
        { k: 'مقدار کل دارو', v: `${gDose} ${gDoseUnit}` },
        ...(includesKg ? [{ k: 'وزن بیمار', v: `${gWeight} کیلوگرم` }] : []),
        { k: 'غلظت', v: `${conc.toFixed(2)} ${isUnit ? 'Unit' : 'mcg'}/میلی‌لیتر` },
      ],
      formula: `غلظت = ${totalBase.toFixed(0)} ÷ ${gSyringeVol} = ${conc.toFixed(2)} | سرعت = ${perHour.toFixed(2)} ÷ ${conc.toFixed(2)} = ${rateMlHr.toFixed(2)}`,
      meta: {
        drugName: gDrugName, patient: gPatient, nurse: gNurse,
      },
    };
  };

  const calcPct = () => {
    if (!allP(pct, pctDose)) return err('لطفاً درصد و دوز مورد نیاز را وارد کنید');
    const concMgMl = Number(pct) * 10; // 1% = 10 mg/ml
    let reqDoseMg = Number(pctDose);
    if (pctUnit === 'g') reqDoseMg *= 1000;
    const volNeeded = reqDoseMg / concMgMl;
    return {
      infusion: volNeeded, unit: 'میلی‌لیتر از دارو',
      lines: [
        { k: 'درصد دارو', v: `${pct}٪` },
        { k: 'غلظت معادل', v: `${concMgMl} میلی‌گرم در هر میلی‌لیتر` },
        { k: 'دوز مورد نیاز', v: `${pctDose} ${pctUnit === 'g' ? 'گرم' : 'میلی‌گرم'}` },
      ],
      formula: `حجم (ml) = دوز (mg) ÷ (درصد × ۱۰) = ${reqDoseMg} ÷ ${concMgMl} = ${volNeeded.toFixed(2)} ml`,
    };
  };

  const calcDrops = () => {
    if (!allP(sVol, sHours)) return err('لطفاً حجم و ساعت را وارد کنید');
    const mins = Number(sHours) * 60;
    const drops = (Number(sVol) * 15) / mins;
    return {
      infusion: drops, unit: 'قطره در دقیقه',
      lines: [
        { k: 'حجم کل', v: `${sVol} میلی‌لیتر` },
        { k: 'مدت زمان', v: `${sHours} ساعت (${mins.toLocaleString('fa-IR')} دقیقه)` },
        { k: 'فاکتور قطره', v: `۱۵ قطره/میلی‌لیتر (ماکروست استاندارد)` },
      ],
      formula: `(${sVol} × ۱۵) ÷ (${sHours} × ۶۰) = ${drops.toFixed(2)} قطره/دقیقه`,
      rounded: Math.round(drops),
    };
  };

  const calcConverter = () => {
    if (!cVal || Number(cVal) <= 0) return err('لطفاً یک عدد بزرگتر از صفر وارد کنید');
    if (cFrom === cTo) return err('واحد مبدا و مقصد نباید یکسان باشد');
    let inMcg = Number(cVal);
    switch (cFrom) {
      case 'mg': inMcg *= 1000; break;
      case 'g': inMcg *= 1000000; break;
      case 'kg': inMcg *= 1000000000; break;
    }
    let result = inMcg; let unit = 'میکروگرم';
    switch (cTo) {
      case 'mg': result = inMcg / 1000; unit = 'میلی‌گرم'; break;
      case 'g': result = inMcg / 1000000; unit = 'گرم'; break;
      case 'kg': result = inMcg / 1000000000; unit = 'کیلوگرم'; break;
      case 'mcg': result = inMcg; unit = 'میکروگرم'; break;
    }
    const fName = (u: string) => ({ mcg: 'میکروگرم', mg: 'میلی‌گرم', g: 'گرم', kg: 'کیلوگرم' } as any)[u];
    return {
      infusion: result, unit,
      lines: [
        { k: 'واحد مبدا', v: `${cVal} ${fName(cFrom)}` },
        { k: 'واحد مقصد', v: `${result.toFixed(6)} ${unit}` },
      ],
      formula: `${cVal} ${fName(cFrom)} = ${result.toFixed(6)} ${unit}`,
      simple: true,
    };
  };

  const compute = (tab: TabId) => {
    let res: any;
    switch (tab) {
      case 'heparin': res = calcHeparin(); break;
      case 'dopamine': res = calcDopamine(); break;
      case 'epinephrine': res = calcEpinephrine(); break;
      case 'nitroglycerin': res = calcNitro(); break;
      case 'amiodarone': res = calcAmio(); break;
      case 'pantoprazole': res = calcPan(); break;
      case 'midazolam': res = calcMid(); break;
      case 'fentanyl': res = calcFen(); break;
      case 'octreotide': res = calcOct(); break;
      case 'general': res = calcGeneral(); break;
      case 'percentage': res = calcPct(); break;
      case 'drops': res = calcDrops(); break;
      case 'converter': res = calcConverter(); break;
    }
    if (res && (res as any).error) {
      const e = { ...errors }; e[tab] = (res as any).error; setErrors(e);
      const r = { ...results }; delete r[tab]; setResults(r);
    } else if (res) {
      const e = { ...errors }; delete e[tab]; setErrors(e);
      setResults({ ...results, [tab]: res });
    }
  };

  const activeTabMeta = TAB_LIST.find(t => t.id === activeTab)!;
  const res = results[activeTab];
  const errMsg = errors[activeTab];

  const Field = ({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) => (
    <div className="space-y-2">
      <label className="block text-sm font-bold text-gray-700">{label}</label>
      {children}
      {hint && <p className="text-[11px] text-gray-400 font-medium">{hint}</p>}
    </div>
  );

  const NInput = ({ value, set, placeholder, unit, min = 0 }: { value: Num; set: (v: Num) => void; placeholder: string; unit?: string; min?: number }) => (
    <div className="relative">
      {unit && <span className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-400 font-bold text-xs whitespace-nowrap">{unit}</span>}
      <input
        type="number"
        placeholder={placeholder}
        min={min}
        value={value}
        onChange={e => set(e.target.value === '' ? '' : Number(e.target.value))}
        className={`w-full h-12 pr-${unit ? '24' : '4'} pl-4 rounded-2xl bg-gray-50 border-2 border-gray-100 focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-500/10 transition text-base font-bold ${unit ? 'pr-24' : ''}`}
      />
    </div>
  );

  return (
    <div>
      <div className="flex items-center gap-3 mb-6 sm:mb-7">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 text-white flex items-center justify-center shadow-lg shadow-purple-500/20">
          <Pill size={28} />
        </div>
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900">ماشین حساب محاسبات دارویی</h2>
          <p className="text-sm text-gray-500 mt-1">۱۳ محاسبه مختلف ICU و اورژانس برای پرستاران و پزشکان</p>
        </div>
      </div>

      {/* Tab List */}
      <div className="flex overflow-x-auto pb-2 mb-5 gap-1.5 border-b border-gray-100 -mx-4 px-4 sm:mx-0 sm:px-0">
        {TAB_LIST.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`shrink-0 h-11 px-3.5 rounded-xl flex items-center gap-2 text-sm font-bold transition border-2 ${
              activeTab === tab.id
                ? 'bg-gradient-to-l from-purple-600 to-pink-600 text-white border-transparent shadow-lg shadow-purple-500/25'
                : 'bg-gray-50 text-gray-600 border-gray-100 hover:bg-gray-100 hover:text-gray-800'
            }`}
          >
            <span className={activeTab === tab.id ? 'text-white' : 'text-purple-500'}>{tab.icon}</span>
            <div className="text-right leading-tight">
              <div className="whitespace-nowrap">{tab.label}</div>
              <div className={`text-[10px] font-medium ${activeTab === tab.id ? 'text-white/80' : 'text-gray-400'}`}>{tab.short}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Form */}
      <div className="bg-gradient-to-br from-slate-50 to-white rounded-3xl border border-gray-100 p-5 sm:p-7 lg:p-8 mb-6">
        <div className="flex items-center justify-between gap-3 mb-6 pb-4 border-b border-gray-100">
          <h3 className="font-black text-lg text-gray-900 flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">{activeTabMeta.icon}</span>
            محاسبه {activeTabMeta.label}
          </h3>
          <button
            onClick={() => clearTab(activeTab)}
            className="h-9 px-3.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition flex items-center gap-1.5"
          >
            پاک کردن فرم
          </button>
        </div>

        {activeTab === 'heparin' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="دوز دارو در ساعت" hint="برای انسولین/هپارین بر حسب واحد">
              <NInput value={hepDose} set={setHepDose} placeholder="مثلاً ۵۰۰" unit="واحد/ساعت" />
            </Field>
            <Field label="مقدار کل دارو در سرنگ/کیسه" hint="مثلاً ۲۵۰۰۰ واحد هپارین در ۵۰۰ میلی‌لیتر">
              <NInput value={hepDrug} set={setHepDrug} placeholder="مثلاً ۲۵۰۰۰" unit="واحد" />
            </Field>
            <Field label="حجم کل محلول">
              <NInput value={hepVol} set={setHepVol} placeholder="مثلاً ۵۰۰" unit="میلی‌لیتر" />
            </Field>
          </div>
        )}

        {activeTab === 'dopamine' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Field label="دوز تجویزی">
              <NInput value={dopDose} set={setDopDose} placeholder="مثلاً ۵" unit="مک‌گرم/کگ/دقیقه" />
            </Field>
            <Field label="وزن بیمار">
              <NInput value={dopWeight} set={setDopWeight} placeholder="مثلاً ۷۰" unit="کیلوگرم" />
            </Field>
            <Field label="مقدار کل دارو">
              <NInput value={dopDrug} set={setDopDrug} placeholder="مثلاً ۲۰۰" unit="میلی‌گرم" />
            </Field>
            <Field label="حجم کل محلول">
              <NInput value={dopVol} set={setDopVol} placeholder="مثلاً ۵۰" unit="میلی‌لیتر" />
            </Field>
          </div>
        )}

        {activeTab === 'epinephrine' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="دوز تجویزی" hint="پمپ اپی نفرین / نوراپی نفرین">
              <NInput value={epiDose} set={setEpiDose} placeholder="مثلاً ۲" unit="مک‌گرم/دقیقه" />
            </Field>
            <Field label="مقدار کل دارو">
              <NInput value={epiDrug} set={setEpiDrug} placeholder="مثلاً ۴" unit="میلی‌گرم" />
            </Field>
            <Field label="حجم کل محلول">
              <NInput value={epiVol} set={setEpiVol} placeholder="مثلاً ۵۰" unit="میلی‌لیتر" />
            </Field>
          </div>
        )}

        {activeTab === 'nitroglycerin' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="دوز تجویزی">
              <NInput value={nitroDose} set={setNitroDose} placeholder="مثلاً ۲۵" unit="مک‌گرم/دقیقه" />
            </Field>
            <Field label="مقدار کل دارو">
              <NInput value={nitroDrug} set={setNitroDrug} placeholder="مثلاً ۵۰" unit="میلی‌گرم" />
            </Field>
            <Field label="حجم کل محلول">
              <NInput value={nitroVol} set={setNitroVol} placeholder="مثلاً ۲۵۰" unit="میلی‌لیتر" />
            </Field>
          </div>
        )}

        {activeTab === 'amiodarone' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="دوز تجویزی" hint="آمیودارون یا لیدوکایین">
              <NInput value={amioDose} set={setAmioDose} placeholder="مثلاً ۱" unit="میلی‌گرم/دقیقه" />
            </Field>
            <Field label="مقدار کل دارو">
              <NInput value={amioDrug} set={setAmioDrug} placeholder="مثلاً ۹۰۰" unit="میلی‌گرم" />
            </Field>
            <Field label="حجم کل محلول">
              <NInput value={amioVol} set={setAmioVol} placeholder="مثلاً ۵۰۰" unit="میلی‌لیتر" />
            </Field>
          </div>
        )}

        {activeTab === 'pantoprazole' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="دوز تجویزی">
              <NInput value={panDose} set={setPanDose} placeholder="مثلاً ۸" unit="میلی‌گرم/ساعت" />
            </Field>
            <Field label="مقدار کل دارو">
              <NInput value={panDrug} set={setPanDrug} placeholder="مثلاً ۴۰" unit="میلی‌گرم" />
            </Field>
            <Field label="حجم کل محلول">
              <NInput value={panVol} set={setPanVol} placeholder="مثلاً ۱۰۰" unit="میلی‌لیتر" />
            </Field>
          </div>
        )}

        {activeTab === 'midazolam' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Field label="نوع واحد دوز">
              <select value={midUnit} onChange={e => setMidUnit(e.target.value as any)}
                className="w-full h-12 px-4 rounded-2xl bg-gray-50 border-2 border-gray-100 focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-500/10 transition text-base font-bold appearance-none">
                <option value="mg">میلی‌گرم (mg)</option>
                <option value="mcg">میکروگرم (mcg)</option>
              </select>
            </Field>
            <Field label="دوز تجویزی">
              <NInput value={midDose} set={setMidDose} placeholder={midUnit === 'mg' ? 'مثلاً ۵' : 'مثلاً ۵۰۰۰'} unit={`${midUnit === 'mg' ? 'میلی‌گرم' : 'میکروگرم'}/ساعت`} />
            </Field>
            <Field label="مقدار کل دارو">
              <NInput value={midDrug} set={setMidDrug} placeholder={midUnit === 'mg' ? 'مثلاً ۵۰' : 'مثلاً ۵۰۰۰۰'} unit={midUnit === 'mg' ? 'میلی‌گرم' : 'میکروگرم'} />
            </Field>
            <Field label="حجم کل محلول">
              <NInput value={midVol} set={setMidVol} placeholder="مثلاً ۵۰" unit="میلی‌لیتر" />
            </Field>
          </div>
        )}

        {activeTab === 'fentanyl' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="دوز تجویزی">
              <NInput value={fenDose} set={setFenDose} placeholder="مثلاً ۱۰۰" unit="میکروگرم/ساعت" />
            </Field>
            <Field label="مقدار کل دارو">
              <NInput value={fenDrug} set={setFenDrug} placeholder="مثلاً ۵۰۰" unit="میکروگرم" />
            </Field>
            <Field label="حجم کل محلول">
              <NInput value={fenVol} set={setFenVol} placeholder="مثلاً ۵۰" unit="میلی‌لیتر" />
            </Field>
          </div>
        )}

        {activeTab === 'octreotide' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="دوز تجویزی">
              <NInput value={octDose} set={setOctDose} placeholder="مثلاً ۵۰" unit="میکروگرم/ساعت" />
            </Field>
            <Field label="مقدار کل دارو">
              <NInput value={octDrug} set={setOctDrug} placeholder="مثلاً ۵۰۰" unit="میکروگرم" />
            </Field>
            <Field label="حجم کل محلول">
              <NInput value={octVol} set={setOctVol} placeholder="مثلاً ۵۰" unit="میلی‌لیتر" />
            </Field>
          </div>
        )}

        {activeTab === 'general' && (
          <div className="space-y-4">
            <div className="p-3 sm:p-4 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-start gap-3">
              <Calculator size={20} className="text-indigo-600 shrink-0 mt-0.5" />
              <p className="text-xs sm:text-sm text-indigo-800 leading-relaxed font-medium">
                این قسمت برای هر دارویی کاربرد دارد. واحد دارو (جرمی یا U) و دوز تجویزی را با توجه به زمان (ساعت/دقیقه) و وزن (در صورت نیاز) انتخاب کنید. خروجی بر حسب میلی‌لیتر در ساعت یا قطره در دقیقه (میکروست) محاسبه می‌شود.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Field label="نام دارو (اختیاری)"><input value={gDrugName} onChange={e => setGDrugName(e.target.value)} placeholder="مثلاً ونکورمایسین"
                className="w-full h-12 px-4 rounded-2xl bg-gray-50 border-2 border-gray-100 focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-500/10 transition text-sm font-bold" /></Field>
              <Field label="نام بیمار (اختیاری)"><input value={gPatient} onChange={e => setGPatient(e.target.value)} placeholder="مثلاً آقای رضایی"
                className="w-full h-12 px-4 rounded-2xl bg-gray-50 border-2 border-gray-100 focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-500/10 transition text-sm font-bold" /></Field>
              <Field label="نام پرستار (اختیاری)"><input value={gNurse} onChange={e => setGNurse(e.target.value)} placeholder="مثلاً م. احمدی"
                className="w-full h-12 px-4 rounded-2xl bg-gray-50 border-2 border-gray-100 focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-500/10 transition text-sm font-bold" /></Field>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Field label="مقدار کل دارو در سرنگ"><NInput value={gDose} set={setGDose} placeholder="مثلاً ۵۰۰" /></Field>
              <Field label="واحد مقدار دارو">
                <select value={gDoseUnit} onChange={e => setGDoseUnit(e.target.value as any)}
                  className="w-full h-12 px-4 rounded-2xl bg-gray-50 border-2 border-gray-100 focus:border-purple-500 outline-none focus:ring-4 focus:ring-purple-500/10 text-sm font-bold appearance-none">
                  <option value="mg">میلی‌گرم (mg)</option>
                  <option value="g">گرم (g)</option>
                  <option value="mcg">میکروگرم (mcg)</option>
                  <option value="U">واحد (U)</option>
                </select>
              </Field>
              <Field label="حجم کل محلول/سرنگ"><NInput value={gSyringeVol} set={setGSyringeVol} placeholder="مثلاً ۵۰" unit="میلی‌لیتر" /></Field>
              <Field label="دوز تجویزی"><NInput value={gPrescribed} set={setGPrescribed} placeholder="مثلاً ۱۵" /></Field>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Field label="واحد دوز تجویزی">
                <select value={gPrescribedUnit} onChange={e => setGPrescribedUnit(e.target.value)}
                  className="w-full h-12 px-4 rounded-2xl bg-gray-50 border-2 border-gray-100 focus:border-purple-500 outline-none focus:ring-4 focus:ring-purple-500/10 text-sm font-bold appearance-none">
                  {PRESCRIBED_UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </Field>
              <Field label="وزن بیمار" hint={gPrescribedUnit.includes('kg') ? 'الزامی' : 'اختیاری'}>
                <NInput value={gWeight} set={setGWeight} placeholder="مثلاً ۷۰" unit="کیلوگرم" />
              </Field>
              <Field label="روش تزریق">
                <div className="grid grid-cols-2 gap-2 h-12 p-1 rounded-2xl bg-gray-50 border-2 border-gray-100">
                  <button onClick={() => setGMethod('macroset')} className={`rounded-xl text-xs font-bold transition ${gMethod === 'macroset' ? 'bg-white shadow text-purple-700 border border-purple-100' : 'text-gray-500 hover:bg-gray-100'}`}>سرنگ پمپ (ml/hr)</button>
                  <button onClick={() => setGMethod('microset')} className={`rounded-xl text-xs font-bold transition ${gMethod === 'microset' ? 'bg-white shadow text-purple-700 border border-purple-100' : 'text-gray-500 hover:bg-gray-100'}`}>میکروست (قطره)</button>
                </div>
              </Field>
            </div>
          </div>
        )}

        {activeTab === 'percentage' && (
          <div className="space-y-4">
            <div className="p-3 sm:p-4 rounded-2xl bg-blue-50 border border-blue-100 flex items-start gap-3">
              <Scale size={20} className="text-blue-600 shrink-0 mt-0.5" />
              <p className="text-xs sm:text-sm text-blue-800 leading-relaxed font-medium">
                فرمول کلی: <strong>درصد × ۱۰ = میلی‌گرم در هر میلی‌لیتر</strong>. مثلاً داروی ۵٪ = ۵۰ میلی‌گرم در هر میلی‌لیتر. پس برای دوز ۱۰۰ میلی‌گرم باید ۲ میلی‌لیتر مصرف شود.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Field label="درصد داروی آماده" hint="بدون علامت درصد"><NInput value={pct} set={setPct} placeholder="مثلاً ۵" unit="٪" /></Field>
              <Field label="دوز مورد نیاز"><NInput value={pctDose} set={setPctDose} placeholder="مثلاً ۱۰۰" /></Field>
              <Field label="واحد دوز مورد نظر">
                <select value={pctUnit} onChange={e => setPctUnit(e.target.value as any)}
                  className="w-full h-12 px-4 rounded-2xl bg-gray-50 border-2 border-gray-100 focus:border-purple-500 outline-none focus:ring-4 focus:ring-purple-500/10 text-sm font-bold appearance-none">
                  <option value="mg">میلی‌گرم (mg)</option>
                  <option value="g">گرم (g)</option>
                </select>
              </Field>
            </div>
          </div>
        )}

        {activeTab === 'drops' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="حجم کل سرم یا دارو" hint="مثلاً یک گلوکز ۵٪ یک لیتری">
              <NInput value={sVol} set={setSVol} placeholder="مثلاً ۱۰۰۰" unit="میلی‌لیتر" />
            </Field>
            <Field label="مدت زمان تزریق" hint="به صورت ساعت">
              <NInput value={sHours} set={setSHours} placeholder="مثلاً ۸" unit="ساعت" />
            </Field>
          </div>
        )}

        {activeTab === 'converter' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="مقدار عددی"><NInput value={cVal} set={setCVal} placeholder="مثلاً ۵۰۰" /></Field>
            <Field label="تبدیل از واحد">
              <select value={cFrom} onChange={e => setCFrom(e.target.value as any)}
                className="w-full h-12 px-4 rounded-2xl bg-gray-50 border-2 border-gray-100 focus:border-purple-500 outline-none focus:ring-4 focus:ring-purple-500/10 text-sm font-bold appearance-none">
                <option value="mcg">میکروگرم (mcg)</option>
                <option value="mg">میلی‌گرم (mg)</option>
                <option value="g">گرم (g)</option>
                <option value="kg">کیلوگرم (kg)</option>
              </select>
            </Field>
            <Field label="تبدیل به واحد">
              <select value={cTo} onChange={e => setCTo(e.target.value as any)}
                className="w-full h-12 px-4 rounded-2xl bg-gray-50 border-2 border-gray-100 focus:border-purple-500 outline-none focus:ring-4 focus:ring-purple-500/10 text-sm font-bold appearance-none">
                <option value="mcg">میکروگرم (mcg)</option>
                <option value="mg">میلی‌گرم (mg)</option>
                <option value="g">گرم (g)</option>
                <option value="kg">کیلوگرم (kg)</option>
              </select>
            </Field>
          </div>
        )}

        {/* Compute Button */}
        <div className="mt-7 flex justify-center sm:justify-end">
          <button
            onClick={() => compute(activeTab)}
            className="h-13 px-8 py-3.5 rounded-2xl bg-gradient-to-l from-purple-600 via-pink-600 to-rose-600 text-white font-black text-base shadow-2xl shadow-purple-500/30 hover:shadow-purple-500/50 hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2"
          >
            <Calculator size={20} /> محاسبه {activeTabMeta.label}
          </button>
        </div>
      </div>

      {/* Error */}
      {errMsg && (
        <div className="rounded-3xl p-6 sm:p-7 border-2 bg-rose-50 border-rose-200 mb-6 flex items-start gap-3">
          <div className="w-11 h-11 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
            <AlertTriangle size={22} />
          </div>
          <div>
            <h4 className="font-black text-lg text-rose-800 mb-1">خطا در مقادیر ورودی</h4>
            <p className="text-sm text-rose-700 font-medium leading-relaxed">{errMsg}</p>
          </div>
        </div>
      )}

      {/* Result */}
      {res && (
        <div className={`rounded-3xl p-7 sm:p-8 border-2 relative overflow-hidden mb-6 ${res.simple ? 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200' : 'bg-gradient-to-br from-purple-50 via-white to-pink-50 border-purple-200'}`}>
          <div className="absolute -top-16 -left-16 w-52 h-52 bg-purple-200/40 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -right-20 w-56 h-56 bg-pink-200/40 rounded-full blur-3xl" />
          <div className="relative">
            <div className="flex items-center gap-2.5 mb-4">
              <CheckCircle2 size={22} className={res.simple ? 'text-emerald-600' : 'text-purple-600'} />
              <span className={`text-xs font-black uppercase tracking-wider ${res.simple ? 'text-emerald-700' : 'text-purple-700'}`}>نتیجه محاسبه {activeTabMeta.label}</span>
            </div>

            <div className={`mb-5 p-5 sm:p-6 rounded-2xl ${res.simple ? 'bg-white/80 backdrop-blur border border-emerald-200' : 'bg-white/80 backdrop-blur border border-purple-200'} shadow-xl`}>
              <p className="text-xs sm:text-sm text-gray-500 font-bold mb-1.5 uppercase tracking-wider">سرعت تزریق نهایی</p>
              <div className={`font-black leading-none ${res.simple ? 'text-emerald-700' : 'text-purple-700'} tracking-tight`} style={{ fontSize: 'clamp(2rem, 6vw, 3.5rem)' }}>
                {res.rounded !== undefined && !res.simple ? (
                  <span>
                    <span>{res.rounded.toLocaleString('fa-IR')}</span>
                    <span className="text-2xl sm:text-3xl text-gray-400 mr-2 font-bold">( {res.infusion.toFixed(2)} دقیق )</span>
                  </span>
                ) : (
                  <span>{res.infusion.toFixed(2)}</span>
                )}
              </div>
              <p className={`mt-3 text-sm sm:text-base font-bold ${res.simple ? 'text-emerald-800' : 'text-purple-800'}`}>{res.unit}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-5">
              {res.lines?.map((l: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-3.5 rounded-2xl bg-white/70 border border-gray-100 backdrop-blur">
                  <span className="text-xs sm:text-sm font-bold text-gray-500">{l.k}</span>
                  <span className="text-sm sm:text-base font-black text-gray-900">{l.v}</span>
                </div>
              ))}
            </div>

            {res.meta && (
              <div className="border-t border-dashed border-purple-200 pt-4 mb-5 grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                {res.meta.drugName && <div className="flex items-start gap-2"><span className="font-bold text-purple-700 shrink-0">دارو:</span><span className="text-gray-800">{res.meta.drugName}</span></div>}
                {res.meta.patient && <div className="flex items-start gap-2"><span className="font-bold text-purple-700 shrink-0">بیمار:</span><span className="text-gray-800">{res.meta.patient}</span></div>}
                {res.meta.nurse && <div className="flex items-start gap-2"><span className="font-bold text-purple-700 shrink-0">پرستار:</span><span className="text-gray-800">{res.meta.nurse}</span></div>}
              </div>
            )}

            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 flex items-start gap-3">
              <Activity size={18} className="text-gray-500 shrink-0 mt-0.5" />
              <div>
                <span className="text-[11px] font-black text-gray-500 uppercase tracking-wider">فرمول محاسبه</span>
                <p className="text-sm sm:text-base text-gray-700 mt-1 font-bold leading-relaxed" dir="ltr">{res.formula}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="rounded-3xl p-5 sm:p-6 border-2 bg-gradient-to-br from-amber-50 via-white to-orange-50 border-amber-200 flex items-start gap-3 sm:gap-4">
        <div className="w-11 h-11 shrink-0 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
          <AlertTriangle size={22} />
        </div>
        <div>
          <h4 className="font-black text-base sm:text-lg text-amber-900 mb-1.5">سلب مسئولیت پزشکی مهم</h4>
          <p className="text-xs sm:text-sm text-amber-800 leading-loose font-medium">
            نتایج این ابزار صرفاً جهت کمک محاسباتی برای <u>پزشک و پرستار مجرب</u> می‌باشد و هرگز نباید جایگزین قضاوت بالینی و محاسبه دستی شود. <strong className="text-amber-900">قبل از تزریق هر دارویی حتماً فرمول را دستی هم بررسی کنید</strong> و در صورت عدم اطمینان با پزشک یا داروساز مشورت کنید. اشتباه در محاسبات دارویی می‌تواند منجر به عوارض جدی یا مرگ بیمار شود.
          </p>
        </div>
      </div>
    </div>
  );
}