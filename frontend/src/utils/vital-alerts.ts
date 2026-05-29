import { VitalSign, VitalAlertSeverity, VitalSignAlert } from '@/types/patient';

export type VitalDisplayStatus = 'normal' | 'warning' | 'critical';

function addThreshold(
  alerts: VitalSignAlert[],
  codePrefix: string,
  value: number,
  criticalLow: number,
  warningLow: number,
  warningHigh: number,
  criticalHigh: number,
  title: string,
  unit?: string
) {
  const u = unit ? ` ${unit}` : '';
  if (value <= criticalLow) {
    alerts.push({ code: `${codePrefix}_LOW`, severity: 'Critical', title, message: `${title}: ${value}${u}` });
    return;
  }
  if (value <= warningLow) {
    alerts.push({ code: `${codePrefix}_LOW`, severity: 'Warning', title, message: `${title}: ${value}${u}` });
    return;
  }
  if (value >= criticalHigh) {
    alerts.push({ code: `${codePrefix}_HIGH`, severity: 'Critical', title, message: `${title}: ${value}${u}` });
    return;
  }
  if (value >= warningHigh) {
    alerts.push({ code: `${codePrefix}_HIGH`, severity: 'Warning', title, message: `${title}: ${value}${u}` });
  }
}

export function evaluateVitalAlerts(vitalsDesc: VitalSign[]): VitalSignAlert[] {
  if (!vitalsDesc.length) return [];

  const v0 = vitalsDesc[0];
  const alerts: VitalSignAlert[] = [];

  addThreshold(alerts, 'SBP', v0.systolicBloodPressure, 80, 90, 160, 180, 'فشار سیستولیک غیرطبیعی', 'mmHg');
  addThreshold(alerts, 'DBP', v0.diastolicBloodPressure, 50, 60, 100, 120, 'فشار دیاستولیک غیرطبیعی', 'mmHg');
  addThreshold(alerts, 'MAP', Math.round(v0.meanArterialPressure), 55, 65, 110, 125, 'MAP غیرطبیعی', 'mmHg');
  addThreshold(alerts, 'PR', v0.pulseRate, 40, 50, 120, 140, 'نبض غیرطبیعی', 'bpm');
  addThreshold(alerts, 'RR', v0.respiratoryRate, 8, 10, 24, 30, 'تنفس غیرطبیعی', 'rpm');
  addThreshold(alerts, 'TEMP', Math.round(v0.bodyTemperature * 10) / 10, 34, 35, 38.5, 39.5, 'دمای بدن غیرطبیعی', '°C');
  addThreshold(alerts, 'SPO2', v0.oxygenSaturation, 88, 92, 100, 101, 'اشباع اکسیژن پایین', '%');

  if (typeof v0.glasgowComaScale === 'number') {
    if (v0.glasgowComaScale <= 8) {
      alerts.push({ code: 'GCS_LOW', severity: 'Critical', title: 'کاهش شدید سطح هوشیاری (GCS)', message: `کاهش سطح هوشیاری (GCS): ${v0.glasgowComaScale}` });
    } else if (v0.glasgowComaScale <= 14) {
      alerts.push({ code: 'GCS_LOW', severity: 'Warning', title: 'کاهش سطح هوشیاری (GCS)', message: `کاهش سطح هوشیاری (GCS): ${v0.glasgowComaScale}` });
    }
  }

  if (vitalsDesc.length >= 2) {
    const v1 = vitalsDesc[1];
    const deltaMinutes = Math.abs((new Date(v0.measuredAt).getTime() - new Date(v1.measuredAt).getTime()) / (1000 * 60));
    const within2Hours = deltaMinutes <= 120;
    const within6Hours = deltaMinutes <= 360;

    if (within2Hours) {
      const spo2Drop = v1.oxygenSaturation - v0.oxygenSaturation;
      if (spo2Drop >= 6) alerts.push({ code: 'SPO2_DROPPING', severity: 'Critical', title: 'سیر خطرناک SpO2', message: `SpO2 در مدت کوتاه ${spo2Drop} واحد کاهش یافته است.` });
      else if (spo2Drop >= 4) alerts.push({ code: 'SPO2_DROPPING', severity: 'Warning', title: 'افت SpO2', message: `SpO2 در مدت کوتاه ${spo2Drop} واحد کاهش یافته است.` });

      const sbpDrop = v1.systolicBloodPressure - v0.systolicBloodPressure;
      if (sbpDrop >= 30) alerts.push({ code: 'SBP_DROPPING', severity: 'Critical', title: 'سیر خطرناک فشار سیستولیک', message: `فشار سیستولیک در مدت کوتاه ${sbpDrop} واحد کاهش یافته است.` });
      else if (sbpDrop >= 20) alerts.push({ code: 'SBP_DROPPING', severity: 'Warning', title: 'افت فشار سیستولیک', message: `فشار سیستولیک در مدت کوتاه ${sbpDrop} واحد کاهش یافته است.` });

      const pulseRise = v0.pulseRate - v1.pulseRate;
      if (pulseRise >= 40) alerts.push({ code: 'PULSE_RISING', severity: 'Critical', title: 'سیر خطرناک نبض', message: `نبض در مدت کوتاه ${pulseRise} واحد افزایش یافته است.` });
      else if (pulseRise >= 30) alerts.push({ code: 'PULSE_RISING', severity: 'Warning', title: 'افزایش سریع نبض', message: `نبض در مدت کوتاه ${pulseRise} واحد افزایش یافته است.` });
    }

    if (within6Hours) {
      const tempRise = Math.round((v0.bodyTemperature - v1.bodyTemperature) * 10) / 10;
      if (tempRise >= 1.5) alerts.push({ code: 'TEMP_RISING', severity: 'Critical', title: 'سیر خطرناک تب', message: `دما در مدت کوتاه ${tempRise} درجه افزایش یافته است.` });
      else if (tempRise >= 1.0) alerts.push({ code: 'TEMP_RISING', severity: 'Warning', title: 'افزایش دما', message: `دما در مدت کوتاه ${tempRise} درجه افزایش یافته است.` });
    }
  }

  const byCode = new Map<string, VitalSignAlert>();
  for (const a of alerts) {
    const existing = byCode.get(a.code);
    if (!existing) byCode.set(a.code, a);
    else if (severityRank(a.severity) > severityRank(existing.severity)) byCode.set(a.code, a);
  }

  return Array.from(byCode.values()).sort((a, b) => severityRank(b.severity) - severityRank(a.severity));
}

export function getVitalDisplayStatus(alerts: VitalSignAlert[]): VitalDisplayStatus {
  if (alerts.some((alert) => alert.severity === 'Critical')) {
    return 'critical';
  }

  if (alerts.length > 0) {
    return 'warning';
  }

  return 'normal';
}

export function getVitalStatusMeta(status: VitalDisplayStatus) {
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
      label: 'غیرنرمال',
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

export function getVitalAlertsForHistory(vitalsDesc: VitalSign[], index: number): VitalSignAlert[] {
  return evaluateVitalAlerts(vitalsDesc.slice(index, index + 3));
}

function severityRank(s: VitalAlertSeverity) {
  return s === 'Critical' ? 2 : 1;
}
