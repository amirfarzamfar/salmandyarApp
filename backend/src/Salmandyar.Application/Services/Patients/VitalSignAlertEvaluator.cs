using Salmandyar.Application.Services.Patients.Dtos;
using Salmandyar.Domain.Entities;
using System.Linq;

namespace Salmandyar.Application.Services.Patients;

public static class VitalSignAlertEvaluator
{
    public static List<VitalSignAlertDto> Evaluate(IReadOnlyList<VitalSign> vitalsDescendingByMeasuredAt)
    {
        if (vitalsDescendingByMeasuredAt.Count == 0) return new List<VitalSignAlertDto>();

        var latest = vitalsDescendingByMeasuredAt[0];
        var alerts = new List<VitalSignAlertDto>();

        AddRangeAlerts(alerts, latest);
        AddTrendAlerts(alerts, vitalsDescendingByMeasuredAt);

        return alerts
            .GroupBy(a => a.Code)
            .Select(g => g.OrderByDescending(x => x.Severity).First())
            .OrderByDescending(a => a.Severity)
            .ToList();
    }

    private static void AddRangeAlerts(List<VitalSignAlertDto> alerts, VitalSign v)
    {
        AddThreshold(alerts, "SBP", v.SystolicBloodPressure,
            criticalLow: 80, warningLow: 90,
            warningHigh: 160, criticalHigh: 180,
            unit: "mmHg",
            title: "فشار سیستولیک غیرطبیعی");

        AddThreshold(alerts, "DBP", v.DiastolicBloodPressure,
            criticalLow: 50, warningLow: 60,
            warningHigh: 100, criticalHigh: 120,
            unit: "mmHg",
            title: "فشار دیاستولیک غیرطبیعی");

        AddThreshold(alerts, "MAP", v.MeanArterialPressure,
            criticalLow: 55, warningLow: 65,
            warningHigh: 110, criticalHigh: 125,
            unit: "mmHg",
            title: "MAP غیرطبیعی");

        AddThreshold(alerts, "PR", v.PulseRate,
            criticalLow: 40, warningLow: 50,
            warningHigh: 120, criticalHigh: 140,
            unit: "bpm",
            title: "نبض غیرطبیعی");

        AddThreshold(alerts, "RR", v.RespiratoryRate,
            criticalLow: 8, warningLow: 10,
            warningHigh: 24, criticalHigh: 30,
            unit: "rpm",
            title: "تنفس غیرطبیعی");

        AddThreshold(alerts, "TEMP", v.BodyTemperature,
            criticalLow: 34.0, warningLow: 35.0,
            warningHigh: 38.5, criticalHigh: 39.5,
            unit: "°C",
            title: "دمای بدن غیرطبیعی");

        AddThreshold(alerts, "SPO2", v.OxygenSaturation,
            criticalLow: 88, warningLow: 92,
            warningHigh: 100, criticalHigh: 101,
            unit: "%",
            title: "اشباع اکسیژن پایین");

        if (v.GlasgowComaScale.HasValue)
        {
            if (v.GlasgowComaScale.Value <= 8)
            {
                alerts.Add(new VitalSignAlertDto("GCS_LOW", VitalAlertSeverity.Critical, "کاهش شدید سطح هوشیاری (GCS)", $"کاهش سطح هوشیاری (GCS): {v.GlasgowComaScale.Value}"));
            }
            else if (v.GlasgowComaScale.Value <= 14)
            {
                alerts.Add(new VitalSignAlertDto("GCS_LOW", VitalAlertSeverity.Warning, "کاهش سطح هوشیاری (GCS)", $"کاهش سطح هوشیاری (GCS): {v.GlasgowComaScale.Value}"));
            }
        }
    }

    private static void AddTrendAlerts(List<VitalSignAlertDto> alerts, IReadOnlyList<VitalSign> vitalsDesc)
    {
        if (vitalsDesc.Count < 2) return;

        var v0 = vitalsDesc[0];
        var v1 = vitalsDesc[1];
        var deltaMinutes = Math.Abs((v0.MeasuredAt - v1.MeasuredAt).TotalMinutes);
        var within2Hours = deltaMinutes <= 120;
        var within6Hours = deltaMinutes <= 360;

        if (within2Hours)
        {
            var spo2Drop = v1.OxygenSaturation - v0.OxygenSaturation;
            if (spo2Drop >= 6)
            {
                alerts.Add(new VitalSignAlertDto("SPO2_DROPPING", VitalAlertSeverity.Critical, "سیر خطرناک SpO2", $"SpO2 در مدت کوتاه {spo2Drop} واحد کاهش یافته است."));
            }
            else if (spo2Drop >= 4)
            {
                alerts.Add(new VitalSignAlertDto("SPO2_DROPPING", VitalAlertSeverity.Warning, "افت SpO2", $"SpO2 در مدت کوتاه {spo2Drop} واحد کاهش یافته است."));
            }

            var sbpDrop = v1.SystolicBloodPressure - v0.SystolicBloodPressure;
            if (sbpDrop >= 30)
            {
                alerts.Add(new VitalSignAlertDto("SBP_DROPPING", VitalAlertSeverity.Critical, "سیر خطرناک فشار سیستولیک", $"فشار سیستولیک در مدت کوتاه {sbpDrop} واحد کاهش یافته است."));
            }
            else if (sbpDrop >= 20)
            {
                alerts.Add(new VitalSignAlertDto("SBP_DROPPING", VitalAlertSeverity.Warning, "افت فشار سیستولیک", $"فشار سیستولیک در مدت کوتاه {sbpDrop} واحد کاهش یافته است."));
            }

            var pulseRise = v0.PulseRate - v1.PulseRate;
            if (pulseRise >= 40)
            {
                alerts.Add(new VitalSignAlertDto("PULSE_RISING", VitalAlertSeverity.Critical, "سیر خطرناک نبض", $"نبض در مدت کوتاه {pulseRise} واحد افزایش یافته است."));
            }
            else if (pulseRise >= 30)
            {
                alerts.Add(new VitalSignAlertDto("PULSE_RISING", VitalAlertSeverity.Warning, "افزایش سریع نبض", $"نبض در مدت کوتاه {pulseRise} واحد افزایش یافته است."));
            }
        }

        if (within6Hours)
        {
            var tempRise = v0.BodyTemperature - v1.BodyTemperature;
            if (tempRise >= 1.5)
            {
                alerts.Add(new VitalSignAlertDto("TEMP_RISING", VitalAlertSeverity.Critical, "سیر خطرناک تب", $"دما در مدت کوتاه {tempRise:0.0} درجه افزایش یافته است."));
            }
            else if (tempRise >= 1.0)
            {
                alerts.Add(new VitalSignAlertDto("TEMP_RISING", VitalAlertSeverity.Warning, "افزایش دما", $"دما در مدت کوتاه {tempRise:0.0} درجه افزایش یافته است."));
            }
        }

        if (vitalsDesc.Count >= 3)
        {
            var v2 = vitalsDesc[2];
            var spo2Drop2 = v2.OxygenSaturation - v0.OxygenSaturation;
            var sbpDrop2 = v2.SystolicBloodPressure - v0.SystolicBloodPressure;

            if (spo2Drop2 >= 8)
            {
                alerts.Add(new VitalSignAlertDto("SPO2_TREND", VitalAlertSeverity.Critical, "روند نزولی SpO2", $"SpO2 نسبت به اندازه‌گیری‌های قبلی {spo2Drop2} واحد کاهش داشته است."));
            }
            else if (spo2Drop2 >= 6)
            {
                alerts.Add(new VitalSignAlertDto("SPO2_TREND", VitalAlertSeverity.Warning, "روند نزولی SpO2", $"SpO2 نسبت به اندازه‌گیری‌های قبلی {spo2Drop2} واحد کاهش داشته است."));
            }

            if (sbpDrop2 >= 40)
            {
                alerts.Add(new VitalSignAlertDto("SBP_TREND", VitalAlertSeverity.Critical, "روند نزولی فشار سیستولیک", $"فشار سیستولیک نسبت به اندازه‌گیری‌های قبلی {sbpDrop2} واحد کاهش داشته است."));
            }
            else if (sbpDrop2 >= 30)
            {
                alerts.Add(new VitalSignAlertDto("SBP_TREND", VitalAlertSeverity.Warning, "روند نزولی فشار سیستولیک", $"فشار سیستولیک نسبت به اندازه‌گیری‌های قبلی {sbpDrop2} واحد کاهش داشته است."));
            }
        }
    }

    private static void AddThreshold(List<VitalSignAlertDto> alerts, string codePrefix, double value,
        double criticalLow, double warningLow, double warningHigh, double criticalHigh, string unit, string title)
    {
        if (value <= criticalLow)
        {
            alerts.Add(new VitalSignAlertDto($"{codePrefix}_LOW", VitalAlertSeverity.Critical, title, $"{title}: {value}{unit}"));
            return;
        }

        if (value <= warningLow)
        {
            alerts.Add(new VitalSignAlertDto($"{codePrefix}_LOW", VitalAlertSeverity.Warning, title, $"{title}: {value}{unit}"));
            return;
        }

        if (value >= criticalHigh)
        {
            alerts.Add(new VitalSignAlertDto($"{codePrefix}_HIGH", VitalAlertSeverity.Critical, title, $"{title}: {value}{unit}"));
            return;
        }

        if (value >= warningHigh)
        {
            alerts.Add(new VitalSignAlertDto($"{codePrefix}_HIGH", VitalAlertSeverity.Warning, title, $"{title}: {value}{unit}"));
        }
    }
}
