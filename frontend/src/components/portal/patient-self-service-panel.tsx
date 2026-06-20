'use client';

import { type ReactNode, useMemo, useState } from 'react';
import { X, Stethoscope, ClipboardPenLine, ShieldAlert, Clock3 } from 'lucide-react';
import VitalSignForm from '@/components/patients/VitalSignForm';
import { KardexTimeline } from '@/features/medications/components/kardex/KardexTimeline';
import { MedicationWizard } from '@/features/medications/components/wizard/MedicationWizard';
import { useCreateMedication } from '@/features/medications/hooks/useMedications';
import { MedicationFormData } from '@/features/medications/types';
import { PatientSelfServiceAccessSummary } from '@/types/patient-self-service';
import { toast } from 'react-hot-toast';
import { LowStockNotificationBanner } from '@/components/notifications/LowStockNotificationBanner';

interface PatientSelfServicePanelProps {
  patientId: number;
  accessSummary: PatientSelfServiceAccessSummary;
  onRefreshAccess: () => Promise<void> | void;
}

type ActiveModal = 'vitals' | 'kardex' | null;

export function PatientSelfServicePanel({
  patientId,
  accessSummary,
  onRefreshAccess
}: PatientSelfServicePanelProps) {
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [showMedicationWizard, setShowMedicationWizard] = useState(false);
  const { mutateAsync: createMedication } = useCreateMedication();

  const vitalsFeature = useMemo(
    () => accessSummary.features.find((feature) => feature.featureKey === 'VitalSigns'),
    [accessSummary.features]
  );

  const kardexFeature = useMemo(
    () => accessSummary.features.find((feature) => feature.featureKey === 'MedicationKardex'),
    [accessSummary.features]
  );

  const hasAnyAction = Boolean(vitalsFeature?.canSubmitNow || kardexFeature?.canSubmitNow);
  const primaryMessage =
    accessSummary.statusMessage ||
    vitalsFeature?.message ||
    kardexFeature?.message ||
    'دسترسی ثبت اطلاعات برای شما فعال نیست.';

  const closeModal = () => setActiveModal(null);

  const handleSuccess = async () => {
    closeModal();
    await onRefreshAccess();
  };

  const handleMedicationCreated = async () => {
    setShowMedicationWizard(false);
    await onRefreshAccess();
  };

  const handleCreateMedication = async (data: MedicationFormData) => {
    if (kardexFeature && !kardexFeature.canSubmitNow) {
      throw new Error(kardexFeature.message || 'امکان ثبت کاردکس برای شما فعال نیست.');
    }
    await createMedication(data);
  };

  return (
    <>
      <section className="rounded-3xl border border-gray-100 bg-white p-5 shadow-soft-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-gray-900">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-medical-50 text-medical-700">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold">ثبت اطلاعات توسط بیمار یا سالمند</h2>
                <p className="mt-1 text-sm text-gray-500">
                  دسترسی ثبت علائم حیاتی و کاردکس دارویی از این بخش کنترل می‌شود.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className={`rounded-full px-3 py-1 font-medium ${accessSummary.isEnabled ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
              {accessSummary.isEnabled ? 'دسترسی کلی فعال' : 'دسترسی کلی غیرفعال'}
            </span>
            {accessSummary.dailyAccessStartTime && accessSummary.dailyAccessEndTime && (
              <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">
                <Clock3 className="ml-1 inline h-3.5 w-3.5" />
                {accessSummary.dailyAccessStartTime} تا {accessSummary.dailyAccessEndTime}
              </span>
            )}
          </div>
        </div>

        {!hasAnyAction && (
          <div className="mt-5 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {primaryMessage}
          </div>
        )}

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <FeatureCard
            title="ثبت علائم حیاتی"
            description="فشار خون، ضربان قلب، دما و سایر علائم حیاتی را ثبت کنید."
            enabled={Boolean(vitalsFeature?.canSubmitNow)}
            disabledMessage={vitalsFeature?.message}
            icon={<Stethoscope className="h-5 w-5" />}
            actionLabel="ثبت علائم"
            onAction={() => setActiveModal('vitals')}
          />

          <FeatureCard
            title="ثبت کاردکس دارویی"
            description="ثبت مصرف داروها و دوز های دارویی را خودتان مدیریت کنید."
            enabled={Boolean(kardexFeature?.canSubmitNow)}
            disabledMessage={kardexFeature?.message}
            icon={<ClipboardPenLine className="h-5 w-5" />}
            actionLabel="ثبت کاردکس"
            onAction={() => setActiveModal('kardex')}
          />
        </div>
      </section>

      <LowStockNotificationBanner appearance="portal" />

      {activeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="relative max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-[2rem] bg-white p-4 md:p-6">
            <button
              type="button"
              onClick={closeModal}
              className="absolute left-4 top-4 rounded-full bg-slate-100 p-2 text-slate-500 transition hover:bg-slate-200"
            >
              <X className="h-5 w-5" />
            </button>

            {activeModal === 'vitals' ? (
              <VitalSignForm patientId={patientId} onSuccess={handleSuccess} onCancel={closeModal} showCloseButton={false} />
            ) : (
              <div className="pt-8">
                <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="text-sm font-bold text-slate-700">برای افزودن داروی جدید، مانند پنل پرستار/ادمین از گزینه زیر استفاده کنید.</div>
                  <button
                    type="button"
                    onClick={() => {
                      if (kardexFeature && !kardexFeature.canSubmitNow) {
                        toast.error(kardexFeature.message || 'امکان ثبت کاردکس برای شما فعال نیست.');
                        return;
                      }
                      setShowMedicationWizard(true);
                    }}
                    className="rounded-2xl bg-teal-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-teal-700"
                  >
                    افزودن داروی جدید
                  </button>
                </div>
                <KardexTimeline patientId={patientId} />
              </div>
            )}
          </div>
        </div>
      )}

      {showMedicationWizard && (
        <div className="fixed inset-0 z-[110] flex items-start justify-center overflow-y-auto bg-black/60 p-4 py-6 backdrop-blur-sm">
          <MedicationWizard
            patientId={patientId}
            onSuccess={handleMedicationCreated}
            onCancel={() => setShowMedicationWizard(false)}
            onSubmit={handleCreateMedication}
          />
        </div>
      )}
    </>
  );
}

interface FeatureCardProps {
  title: string;
  description: string;
  enabled: boolean;
  disabledMessage?: string | null;
  actionLabel: string;
  icon: ReactNode;
  onAction: () => void;
}

function FeatureCard({
  title,
  description,
  enabled,
  disabledMessage,
  actionLabel,
  icon,
  onAction
}: FeatureCardProps) {
  return (
    <div className={`rounded-3xl border p-4 transition ${enabled ? 'border-medical-100 bg-medical-50/40' : 'border-gray-200 bg-gray-50/70'}`}>
      <div className="flex items-start gap-3">
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${enabled ? 'bg-white text-medical-700' : 'bg-white text-gray-400'}`}>
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-gray-900">{title}</h3>
            <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
              {enabled ? 'فعال' : 'غیرفعال'}
            </span>
          </div>
          <p className="mt-2 text-sm leading-6 text-gray-600">{description}</p>
          {!enabled && disabledMessage && (
            <p className="mt-3 text-xs leading-6 text-rose-700">{disabledMessage}</p>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={onAction}
        disabled={!enabled}
        className={`mt-4 w-full rounded-2xl px-4 py-3 text-sm font-bold transition ${enabled ? 'bg-medical-600 text-white hover:bg-medical-700' : 'cursor-not-allowed bg-gray-200 text-gray-500'}`}
      >
        {actionLabel}
      </button>
    </div>
  );
}
