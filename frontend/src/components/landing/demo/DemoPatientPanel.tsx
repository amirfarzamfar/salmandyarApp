'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/Button';
import {
  Activity, Pill, BarChart3, Calendar, Plus, Bell, User, FileText, AlertTriangle, Check, Lock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  demoPatientInfo, demoVitalSigns, demoMedications, demoCarePlan,
  demoNotifications, demoChartData, demoFeatures, demoKardexEntries,
} from './demo-data';
import type { DemoFeature } from './demo-data';
import { DemoVitals } from './DemoVitals';
import { DemoHealthChart } from './DemoHealthChart';
import { DemoMedications, DemoMedicationKardex } from './DemoMedications';
import { DemoCarePlan, DemoNotifications } from './DemoCarePlan';
import { DemoFeaturesGrid } from './DemoFeaturesGrid';
import { DemoProgressTracker } from './DemoProgress';
import { DemoRegisterModal } from './DemoRegisterModal';
import { DemoVitalsForm, DemoMedicationAlertCheck } from './DemoInteractiveForms';
import Link from 'next/link';

type PanelTab = 'dashboard' | 'vitals' | 'meds' | 'chart' | 'care' | 'alerts' | 'forms' | 'features';

const tabs: { id: PanelTab; label: string; icon: any; progressReward: number }[] = [
  { id: 'dashboard', label: 'داشبورد', icon: User, progressReward: 10 },
  { id: 'vitals', label: 'علائم', icon: Activity, progressReward: 10 },
  { id: 'meds', label: 'داروها', icon: Pill, progressReward: 10 },
  { id: 'chart', label: 'نمودار', icon: BarChart3, progressReward: 10 },
  { id: 'care', label: 'برنامه', icon: Calendar, progressReward: 10 },
  { id: 'forms', label: 'ثبت', icon: Plus, progressReward: 10 },
  { id: 'alerts', label: 'اعلان‌ها', icon: Bell, progressReward: 5 },
  { id: 'features', label: 'امکانات', icon: FileText, progressReward: 5 },
];

interface Props {
  onDiscover?: () => void;
}

export function DemoPatientPanel({ onDiscover }: Props) {
  const [activeTab, setActiveTab] = useState<PanelTab>('dashboard');
  const [discovered, setDiscovered] = useState<Set<string>>(new Set(['dashboard']));
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [registerTrigger, setRegisterTrigger] = useState<string | undefined>();
  const [medsSubTab, setMedsSubTab] = useState<'list' | 'kardex' | 'alert'>('list');

  const discoveredTabsCount = tabs.filter(t => discovered.has(t.id)).length;
  const discoveredFeaturesCount = demoFeatures.filter(f => f.unlocked && discovered.has(`feat_${f.id}`)).length;
  const totalDiscoverable = tabs.length + demoFeatures.filter(f => f.unlocked).length;

  const totalDiscovered = discoveredTabsCount + discoveredFeaturesCount;
  const progress = Math.min(100, Math.round((totalDiscovered / totalDiscoverable) * 100));

  const discover = (key: string, reward: number) => {
    setDiscovered(prev => {
      if (prev.has(key)) return prev;
      const next = new Set(prev);
      next.add(key);
      onDiscover?.();
      const afterTabs = tabs.filter(t => next.has(t.id)).length;
      const afterFeats = demoFeatures.filter(f => f.unlocked && next.has(`feat_${f.id}`)).length;
      const totalAfter = afterTabs + afterFeats;
      if (!prev.has(key) && totalAfter >= 3 && Math.random() < 0.3) {
        setTimeout(() => {
          setRegisterTrigger('ادامه کشف امکانات');
          setRegisterModalOpen(true);
        }, 2000);
      }
      return next;
    });
  };

  useEffect(() => {
    discover(activeTab, tabs.find(t => t.id === activeTab)?.progressReward ?? 5);
  }, [activeTab]);

  const handleFeatureClick = (feature: DemoFeature) => {
    if (feature.unlocked) {
      discover(`feat_${feature.id}`, feature.progressReward);
      if (feature.id === 'f1') setActiveTab('vitals');
      else if (feature.id === 'f2' || feature.id === 'f3') setActiveTab('meds');
      else if (feature.id === 'f4') setActiveTab('care');
      else if (feature.id === 'f5') setActiveTab('forms');
    } else {
      setRegisterTrigger(feature.title);
      setRegisterModalOpen(true);
    }
  };

  const showSmartCTA = progress >= 30 && progress < 90;

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardOverview progress={progress} />;
      case 'vitals':
        return <DemoVitals vitals={demoVitalSigns} />;
      case 'meds':
        return (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
              {[
                { id: 'list' as const, label: 'لیست داروها', icon: Pill },
                { id: 'kardex' as const, label: 'کاردکس', icon: FileText },
                { id: 'alert' as const, label: 'هشدار دارویی', icon: AlertTriangle, badge: 'جدید' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setMedsSubTab(tab.id);
                    if (tab.id !== 'list') discover(`meds_${tab.id}`, 3);
                  }}
                  className={cn(
                    'flex-1 min-w-[100px] flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black transition-all',
                    medsSubTab === tab.id
                      ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-400 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  )}
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  {tab.label}
                  {tab.badge && (
                    <Badge className="text-[8px] px-1 py-0 bg-rose-500 text-white">{tab.badge}</Badge>
                  )}
                </button>
              ))}
            </div>
            {medsSubTab === 'list' && <DemoMedications medications={demoMedications} />}
            {medsSubTab === 'kardex' && <DemoMedicationKardex entries={demoKardexEntries} />}
            {medsSubTab === 'alert' && <DemoMedicationAlertCheck onSubmitted={() => discover('meds_alert_done', 5)} />}
          </div>
        );
      case 'chart':
        return <DemoHealthChart data={demoChartData} />;
      case 'care':
        return <DemoCarePlan tasks={demoCarePlan} completionPercent={demoPatientInfo.careCompletion} />;
      case 'alerts':
        return <DemoNotifications notifications={demoNotifications} />;
      case 'forms':
        return (
          <div className="space-y-5">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <h4 className="text-base font-black text-slate-800 dark:text-slate-100">ثبت علائم حیاتی</h4>
              </div>
              <DemoVitalsForm onSubmitted={() => discover('form_vitals_done', 7)} />
            </div>
            <div className="border-t border-dashed border-slate-200 dark:border-slate-700 pt-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <h4 className="text-base font-black text-slate-800 dark:text-slate-100">بررسی هشدار دارویی</h4>
              </div>
              <DemoMedicationAlertCheck onSubmitted={() => discover('form_medalert_done', 7)} />
            </div>
          </div>
        );
      case 'features':
        return (
          <DemoFeaturesGrid
            features={demoFeatures}
            discovered={Array.from(discovered).reduce((acc, k) => {
              if (k.startsWith('feat_')) acc.add(k.replace('feat_', ''));
              return acc;
            }, new Set<string>())}
            onFeatureClick={handleFeatureClick}
          />
        );
    }
  };

  return (
    <div className="relative">
      <div className="rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl shadow-slate-900/5 overflow-hidden">
        <DemoPanelHeader progress={progress} />

        <div className="px-3 sm:px-5 pb-3 pt-2">
          <DemoProgressTracker progress={progress} discoveredCount={totalDiscovered} totalCount={totalDiscoverable} />
        </div>

        <div className="px-3 sm:px-5 pb-4">
          <div className="flex p-1.5 bg-slate-100 dark:bg-slate-800/60 rounded-[1.75rem] overflow-x-auto gap-1 shadow-inner">
            {tabs.map(tab => {
              const active = activeTab === tab.id;
              const isDiscovered = discovered.has(tab.id);
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'relative flex items-center justify-center gap-1.5 px-2.5 sm:px-4 py-2.5 rounded-[1.25rem] text-[11px] sm:text-xs font-black transition-all duration-300 whitespace-nowrap shrink-0',
                    active
                      ? 'bg-gradient-to-bl from-teal-600 to-emerald-600 text-white shadow-lg shadow-teal-600/20 scale-[1.02]'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/60 dark:hover:bg-slate-700/60'
                  )}
                >
                  <tab.icon className={cn('w-3.5 h-3.5 sm:w-4 sm:h-4', active ? 'stroke-[2.5px]' : '')} />
                  <span>{tab.label}</span>
                  {isDiscovered && !active && (
                    <Check className="w-2.5 h-2.5 text-emerald-500" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="px-3 sm:px-6 pb-6 pt-2 overflow-x-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {showSmartCTA && (
            <motion.div
              initial={{ opacity: 0, y: 20, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: 10, height: 0 }}
              className="overflow-hidden"
            >
              <div className="mx-3 sm:mx-6 mb-6 p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-teal-500 via-emerald-500 to-teal-600 text-white relative overflow-hidden shadow-xl shadow-teal-500/25">
                <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
                <div className="relative flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Badge className="bg-white/20 text-white border-none text-[10px]">
                        <Check className="w-3 h-3 ml-1" />
                        پیشرفت {progress}٪
                      </Badge>
                      <Badge className="bg-amber-400/90 text-white border-none text-[10px]">
                        ✨ پیشنهاد ویژه
                      </Badge>
                    </div>
                    <h5 className="text-base sm:text-lg font-black leading-tight mb-1">
                      شما بخشی از سالمندیار را تجربه کردید
                    </h5>
                    <p className="text-xs sm:text-sm text-teal-50/90 leading-relaxed">
                      برای ادامه و دسترسی به امکانات کامل شامل ارتباط با پرستار، پرونده پزشکی و گزارش‌های جامع، حساب خود را بسازید.
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    <Link href="/register" className="w-full sm:w-auto">
                      <Button
                        size="lg"
                        className="w-full sm:w-auto justify-center gap-2 rounded-2xl py-3 text-sm font-black bg-white text-teal-700 hover:bg-teal-50 shadow-xl"
                      >
                        شروع رایگان
                        <Lock className="w-4 h-4" />
                      </Button>
                    </Link>
                    <button
                      onClick={() => setRegisterModalOpen(true)}
                      className="text-[11px] font-bold text-teal-50 hover:text-white underline underline-offset-2 decoration-teal-200/40"
                    >
                      بیشتر بدانید
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mx-3 sm:mx-6 mb-6 p-5 sm:p-7 rounded-[2rem] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-56 h-56 bg-teal-500/15 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-56 h-56 bg-emerald-500/15 rounded-full blur-3xl" />
          <div className="relative flex flex-col md:flex-row md:items-center gap-5">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-[10px] font-black border border-teal-500/30">
                  🚀 مرحله نهایی
                </span>
              </div>
              <h4 className="text-xl sm:text-2xl font-black leading-tight mb-2">
                آماده‌ای سالمندیار را برای واقعی امتحان کنی؟
              </h4>
              <p className="text-sm text-slate-300 leading-relaxed max-w-xl">
                ثبت‌نام رایگان، دسترسی کامل به پنل بیمار، اختصاص پرستار و پشتیبانی ۲۴ ساعته. بدون نیاز به کارت بانکی.
              </p>
            </div>
            <Link href="/register" className="shrink-0 w-full md:w-auto">
              <Button
                size="lg"
                className="w-full md:w-auto justify-center gap-2 rounded-2xl py-4 sm:py-5 px-6 sm:px-8 text-base sm:text-lg font-black shadow-2xl shadow-teal-500/30 bg-gradient-to-l from-teal-500 via-emerald-500 to-teal-400 hover:from-teal-400 hover:to-emerald-400 text-slate-900"
              >
                ثبت‌نام رایگان و شروع استفاده
                <motion.span
                  animate={{ x: [-2, 2, -2] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                  className="inline-flex items-center gap-1"
                >
                  <Check className="w-5 h-5" />
                </motion.span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <DemoRegisterModal
        open={registerModalOpen}
        onOpenChange={setRegisterModalOpen}
        triggerFeature={registerTrigger}
        progress={progress}
      />
    </div>
  );
}

function DemoPanelHeader({ progress }: { progress: number }) {
  return (
    <div className="relative px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-l from-teal-50/70 via-white to-white dark:from-slate-800 dark:via-slate-900 dark:to-slate-900">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative shrink-0">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-teal-400 to-emerald-600 flex items-center justify-center text-white shadow-lg shadow-teal-500/20">
              <User className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [1, 0.6, 1] }}
              transition={{ duration: 1.8, repeat: Infinity }}
              className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900"
            />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h3 className="text-base sm:text-lg font-black text-slate-800 dark:text-slate-100 truncate">
                {demoPatientInfo.name}
              </h3>
              <Badge variant="outline" className="text-[9px] sm:text-[10px] font-black px-2 py-0.5 border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-300 shrink-0">
                حالت آزمایشی
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 text-[10px] sm:text-[11px]">
              <Badge variant="secondary" className="text-[9px] font-bold px-2 py-0">{demoPatientInfo.age} سال</Badge>
              <Badge variant="secondary" className="text-[9px] font-bold px-2 py-0">گروه خونی {demoPatientInfo.bloodType}</Badge>
              <Badge className="text-[9px] font-bold px-2 py-0 bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300 border-none">
                {demoPatientInfo.currentStatus}
              </Badge>
            </div>
          </div>
        </div>

        <div className="text-left shrink-0 hidden sm:block">
          <div className="text-[10px] font-black text-slate-400 mb-1">آخرین پایش</div>
          <div className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1">
            <motion.span
              animate={{ backgroundColor: ['#10b981', '#059669', '#10b981'] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="inline-block w-2 h-2 rounded-full"
            />
            {demoPatientInfo.lastCheckup}
          </div>
          <div className="text-[10px] font-bold text-teal-600 dark:text-teal-400 mt-1">
            {demoPatientInfo.caregiverName}
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardOverview({ progress: _progress }: { progress: number }) {
  const topVitals = demoVitalSigns.slice(0, 4);
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <QuickStat label="سطح سلامت" value={`${demoPatientInfo.careCompletion + 18}٪`} hint="کلی" color="emerald" icon={Check} />
        <QuickStat label="مراقبت امروز" value={`${demoPatientInfo.careCompletion}٪`} hint={`${demoCarePlan.filter(t=>t.status==='done').length} کار`} color="teal" icon={Calendar} />
        <QuickStat label="داروها" value={`${demoMedications.filter(m=>m.status==='taken').length}/${demoMedications.length}`} hint="مصرف شده" color="blue" icon={Pill} />
        <QuickStat label="اعلان‌ها" value={`${demoNotifications.filter(n=>!n.read).length}`} hint="خوانده نشده" color="amber" icon={Bell} />
      </div>

      <DemoVitals vitals={topVitals} onAnimate={false} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="rounded-2xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-black text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-teal-500" />
              انجام کارهای امروز
            </h4>
            <Badge variant="secondary" className="text-[10px]">{demoPatientInfo.careCompletion}٪</Badge>
          </div>
          <div className="space-y-1.5">
            {demoCarePlan.slice(0, 4).map(task => (
              <div key={task.id} className="flex items-center gap-2 py-1.5 border-b border-slate-50 dark:border-slate-700/50 last:border-0">
                <div className={cn(
                  'w-5 h-5 rounded-md flex items-center justify-center shrink-0 text-[10px] font-black',
                  task.status === 'done' ? 'bg-emerald-500 text-white' :
                  task.status === 'in-progress' ? 'bg-blue-500 text-white' :
                  task.status === 'overdue' ? 'bg-rose-500 text-white' :
                  'bg-slate-200 dark:bg-slate-700 text-slate-500'
                )}>
                  {task.status === 'done' ? '✓' : task.status === 'in-progress' ? '●' : task.status === 'overdue' ? '!' : task.time.split(':')[0]}
                </div>
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 truncate flex-1">{task.title}</span>
                <span className="text-[10px] text-slate-400 shrink-0">{task.time}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="rounded-2xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-black text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
              <Pill className="w-4 h-4 text-blue-500" />
              داروهای زمان بعدی
            </h4>
            <Badge variant="secondary" className="text-[10px]">{demoMedications.length} دارو</Badge>
          </div>
          <div className="space-y-1.5">
            {demoMedications.slice(0, 4).map(m => (
              <div key={m.id} className="flex items-center gap-2 py-1.5 border-b border-slate-50 dark:border-slate-700/50 last:border-0">
                <span className="text-lg">{m.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-black text-slate-700 dark:text-slate-200 truncate">{m.name}</div>
                  <div className="text-[9px] text-slate-400 truncate">{m.dosage} • {m.nextDose}</div>
                </div>
                <span className={cn(
                  'text-[9px] font-black px-1.5 py-0.5 rounded-md',
                  m.status === 'taken' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' :
                  m.status === 'missed' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300' :
                  'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                )}>
                  {m.status === 'taken' ? '✓' : m.status === 'missed' ? '!' : '⏰'}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function QuickStat({
  label, value, hint, color, icon: Icon,
}: {
  label: string; value: string; hint: string;
  color: 'emerald' | 'teal' | 'blue' | 'amber';
  icon: any;
}) {
  const map: Record<string, string> = {
    emerald: 'from-emerald-500 to-green-600',
    teal: 'from-teal-500 to-cyan-600',
    blue: 'from-blue-500 to-indigo-600',
    amber: 'from-amber-500 to-orange-500',
  };
  const mapBg: Record<string, string> = {
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400',
    teal: 'bg-teal-50 text-teal-600 dark:bg-teal-900/20 dark:text-teal-400',
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400',
  };
  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.02 }}
      className="relative overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 shadow-sm"
    >
      <div className={cn('absolute top-0 left-0 w-16 h-16 bg-gradient-to-br opacity-10 blur-xl -translate-x-4 -translate-y-4', map[color])} />
      <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center mb-2', mapBg[color])}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="text-[10px] font-bold text-slate-400">{label}</div>
      <div className="text-lg sm:text-xl font-black text-slate-800 dark:text-slate-100 leading-tight">{value}</div>
      <div className="text-[10px] font-bold text-slate-400 mt-0.5">{hint}</div>
    </motion.div>
  );
}
