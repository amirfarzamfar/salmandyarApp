import type { BloodSugarMeasurementType, VitalAlertSeverity, VitalSignAlert } from '@/types/patient';

export type BloodSugarDisplayStatus = 'normal' | 'warning' | 'critical';

interface BloodSugarBand {
  max: number;
  status: BloodSugarDisplayStatus;
  severity?: VitalAlertSeverity;
  title: string;
  message: string;
}

interface BloodSugarRangeDefinition {
  normalMax: number;
  bands: BloodSugarBand[];
}

const BLOOD_SUGAR_CONFIG: Record<BloodSugarMeasurementType, BloodSugarRangeDefinition> = {
  fasting: {
    normalMax: 99,
    bands: [
      {
        max: 125,
        status: 'warning',
        severity: 'Warning',
        title: 'قند خون ناشتا بالاتر از محدوده نرمال',
        message: 'قند خون ناشتا بالاتر از محدوده نرمال قرار دارد و نیاز به پیگیری دارد.',
      },
      {
        max: Number.POSITIVE_INFINITY,
        status: 'critical',
        severity: 'Critical',
        title: 'قند خون ناشتا در محدوده خطرناک است',
        message: 'قند خون ناشتا در محدوده خطرناک قرار دارد و نیاز به اقدام سریع دارد.',
      },
    ],
  },
  random: {
    normalMax: 140,
    bands: [
      {
        max: 199,
        status: 'warning',
        severity: 'Warning',
        title: 'قند خون تصادفی بالاتر از محدوده نرمال',
        message: 'قند خون تصادفی بالاتر از محدوده نرمال قرار دارد و نیاز به پیگیری دارد.',
      },
      {
        max: Number.POSITIVE_INFINITY,
        status: 'critical',
        severity: 'Critical',
        title: 'قند خون تصادفی در محدوده خطرناک است',
        message: 'قند خون تصادفی در محدوده خطرناک قرار دارد و نیاز به اقدام سریع دارد.',
      },
    ],
  },
};

export function getBloodSugarMeasurementTypeLabel(type?: BloodSugarMeasurementType | null) {
  if (type === 'fasting') return 'ناشتا';
  if (type === 'random') return 'تصادفی';
  return 'نامشخص';
}

export function getBloodSugarStatusMeta(status: BloodSugarDisplayStatus) {
  if (status === 'critical') {
    return {
      label: 'خطرناک',
      badgeClassName: 'bg-red-100 text-red-700 border-red-200',
      accentClassName: 'text-red-700',
      cardClassName: 'bg-red-50 border-red-200',
    };
  }

  if (status === 'warning') {
    return {
      label: 'هشدار',
      badgeClassName: 'bg-amber-100 text-amber-700 border-amber-200',
      accentClassName: 'text-amber-700',
      cardClassName: 'bg-amber-50 border-amber-200',
    };
  }

  return {
    label: 'نرمال',
    badgeClassName: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    accentClassName: 'text-emerald-700',
    cardClassName: 'bg-emerald-50 border-emerald-200',
  };
}

export interface BloodSugarEvaluation {
  value: number;
  measurementType: BloodSugarMeasurementType;
  measurementLabel: string;
  status: BloodSugarDisplayStatus;
  statusMeta: ReturnType<typeof getBloodSugarStatusMeta>;
  title: string;
  message: string;
  isCritical: boolean;
  alert: VitalSignAlert | null;
}

export function evaluateBloodSugar(
  value?: number | null,
  measurementType?: BloodSugarMeasurementType | null,
): BloodSugarEvaluation | null {
  if (typeof value !== 'number' || Number.isNaN(value) || !measurementType) {
    return null;
  }

  const measurementLabel = getBloodSugarMeasurementTypeLabel(measurementType);

  if (value <= 54) {
    const statusMeta = getBloodSugarStatusMeta('critical');
    return {
      value,
      measurementType,
      measurementLabel,
      status: 'critical',
      statusMeta,
      title: 'افت خطرناک قند خون',
      message: `قند خون ${measurementLabel} برابر ${value} mg/dL است و در محدوده افت خطرناک قرار دارد.`,
      isCritical: true,
      alert: {
        code: 'BS_LOW',
        severity: 'Critical',
        title: 'افت خطرناک قند خون',
        message: `قند خون ${measurementLabel}: ${value} mg/dL`,
      },
    };
  }

  if (value < 70) {
    const statusMeta = getBloodSugarStatusMeta('warning');
    return {
      value,
      measurementType,
      measurementLabel,
      status: 'warning',
      statusMeta,
      title: 'قند خون پایین است',
      message: `قند خون ${measurementLabel} برابر ${value} mg/dL است و پایین‌تر از محدوده نرمال قرار دارد.`,
      isCritical: false,
      alert: {
        code: 'BS_LOW',
        severity: 'Warning',
        title: 'قند خون پایین است',
        message: `قند خون ${measurementLabel}: ${value} mg/dL`,
      },
    };
  }

  const config = BLOOD_SUGAR_CONFIG[measurementType];

  if (value <= config.normalMax) {
    const statusMeta = getBloodSugarStatusMeta('normal');
    return {
      value,
      measurementType,
      measurementLabel,
      status: 'normal',
      statusMeta,
      title: 'قند خون در محدوده نرمال است',
      message: `قند خون ${measurementLabel} برابر ${value} mg/dL است و در محدوده نرمال قرار دارد.`,
      isCritical: false,
      alert: null,
    };
  }

  const band = config.bands.find((item) => value <= item.max) ?? config.bands[config.bands.length - 1];
  const statusMeta = getBloodSugarStatusMeta(band.status);

  return {
    value,
    measurementType,
    measurementLabel,
    status: band.status,
    statusMeta,
    title: band.title,
    message: `قند خون ${measurementLabel} برابر ${value} mg/dL است. ${band.message}`,
    isCritical: band.status === 'critical',
    alert: band.severity
      ? {
          code: 'BS_HIGH',
          severity: band.severity,
          title: band.title,
          message: `قند خون ${measurementLabel}: ${value} mg/dL`,
        }
      : null,
  };
}
