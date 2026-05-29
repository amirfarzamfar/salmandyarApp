namespace Salmandyar.Domain.Constants;

public static class PatientSelfServiceFeatures
{
    public const string VitalSigns = "VitalSigns";
    public const string MedicationKardex = "MedicationKardex";

    public static readonly string[] All =
    {
        VitalSigns,
        MedicationKardex
    };

    public static bool IsValid(string? featureKey)
    {
        if (string.IsNullOrWhiteSpace(featureKey))
        {
            return false;
        }

        return All.Contains(featureKey, StringComparer.OrdinalIgnoreCase);
    }

    public static string Normalize(string featureKey)
    {
        return All.First(f => string.Equals(f, featureKey, StringComparison.OrdinalIgnoreCase));
    }

    public static string GetDisplayName(string featureKey)
    {
        var normalized = Normalize(featureKey);

        return normalized switch
        {
            VitalSigns => "ثبت علائم حیاتی",
            MedicationKardex => "ثبت کاردکس دارویی",
            _ => normalized
        };
    }
}
