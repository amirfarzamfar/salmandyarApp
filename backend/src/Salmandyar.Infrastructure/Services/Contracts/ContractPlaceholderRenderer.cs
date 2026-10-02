using System.Globalization;
using System.Text.RegularExpressions;
using Salmandyar.Domain.Entities.Contracts;

namespace Salmandyar.Infrastructure.Services.Contracts;

public partial interface IContractPlaceholderRenderer
{
    string Render(
        string contractText,
        IEnumerable<ContractFieldValue> fieldValues,
        ContractAssignment? assignment = null,
        ContractTemplate? template = null,
        Domain.Entities.User? user = null,
        Domain.Entities.CaregiverProfile? caregiver = null);

    Dictionary<string, string?> ExtractPlaceholderValues(
        IEnumerable<ContractFieldValue> fieldValues,
        ContractAssignment? assignment = null,
        ContractTemplate? template = null,
        Domain.Entities.User? user = null,
        Domain.Entities.CaregiverProfile? caregiver = null);
}

public partial class ContractPlaceholderRenderer : IContractPlaceholderRenderer
{
    [GeneratedRegex(@"\{\{\s*([a-zA-Z0-9_]+)\s*\}\}", RegexOptions.Compiled)]
    private static partial Regex PlaceholderRegex();

    public string Render(
        string contractText,
        IEnumerable<ContractFieldValue> fieldValues,
        ContractAssignment? assignment = null,
        ContractTemplate? template = null,
        Domain.Entities.User? user = null,
        Domain.Entities.CaregiverProfile? caregiver = null)
    {
        if (string.IsNullOrWhiteSpace(contractText))
            return string.Empty;

        var values = ExtractPlaceholderValues(fieldValues, assignment, template, user, caregiver);

        return PlaceholderRegex().Replace(contractText, match =>
        {
            var key = match.Groups[1].Value;
            if (values.TryGetValue(key, out var val) && !string.IsNullOrWhiteSpace(val))
                return val;
            return "[وارد نشده]";
        });
    }

    public Dictionary<string, string?> ExtractPlaceholderValues(
        IEnumerable<ContractFieldValue> fieldValues,
        ContractAssignment? assignment = null,
        ContractTemplate? template = null,
        Domain.Entities.User? user = null,
        Domain.Entities.CaregiverProfile? caregiver = null)
    {
        var result = new Dictionary<string, string?>(StringComparer.OrdinalIgnoreCase);

        foreach (var fv in fieldValues)
        {
            var value = FormatFieldValue(fv);
            result[fv.FieldKey] = value;
        }

        if (assignment != null)
        {
            result["contractNumber"] = string.IsNullOrWhiteSpace(assignment.ContractNumber)
                ? "[تخصیص داده نشده]"
                : assignment.ContractNumber;
            result["assignDate"] = FormatJalali(assignment.AssignedAt);
            result["submitDate"] = FormatJalali(assignment.SubmittedAt);
            result["signDate"] = FormatJalali(assignment.SignedAt);
            result["employerSignDate"] = FormatJalali(assignment.EmployerSignedAt);
            result["contentHash"] = string.IsNullOrWhiteSpace(assignment.ContentHash)
                ? "[تولید نشده]"
                : assignment.ContentHash;
            result["templateVersion"] = template?.Version.ToString() ?? (assignment.ContractTemplate?.Version.ToString() ?? "-");
            result["startDate"] = FormatJalali(assignment.StartDate);
            result["endDate"] = FormatJalali(assignment.EndDate) ?? "[نامحدود]";
        }

        if (template != null)
        {
            result["templateVersion"] = template.Version.ToString();
            result["contractCode"] = template.Code;
            result["cooperationType"] = string.IsNullOrWhiteSpace(result.GetValueOrDefault("cooperationType"))
                ? template.CooperationType
                : result["cooperationType"];
        }

        if (user != null)
        {
            TrySetDefault(result, "fullName", $"{user.FirstName} {user.LastName}".Trim());
            TrySetDefault(result, "phoneNumber", user.PhoneNumber);
            TrySetDefault(result, "nationalCode", user.NationalCode);
            TrySetDefault(result, "email", user.Email);
        }

        if (caregiver != null)
        {
            TrySetDefault(result, "nationalCode", caregiver.NationalCode);
            TrySetDefault(result, "address", caregiver.FullAddress);
            TrySetDefault(result, "iban", caregiver.Iban);
            TrySetDefault(result, "cooperationType", caregiver.CooperationType);
            TrySetDefault(result, "startDate", FormatJalali(caregiver.SubmittedAt ?? caregiver.CreatedAt));
            TrySetDefault(result, "emergencyContact", caregiver.EmergencyContactMobile ?? caregiver.EmergencyContactPhone);
        }

        if (assignment != null)
        {
            var signedLog = assignment.AuditLogs?.FirstOrDefault(l =>
                l.ActionType == Domain.Enums.ContractAuditActionType.Signed);
            if (signedLog != null)
            {
                result["transactionId"] = signedLog.TransactionId.ToString("N");
                if (!string.IsNullOrWhiteSpace(signedLog.ContentHash))
                    result["contentHash"] = signedLog.ContentHash;
            }
            else
            {
                result["transactionId"] = "[ثبت نشده]";
            }
        }
        else
        {
            result["transactionId"] = "[ثبت نشده]";
        }

        return result;
    }

    private static void TrySetDefault(IDictionary<string, string?> dict, string key, string? value)
    {
        if (string.IsNullOrWhiteSpace(value)) return;
        if (!dict.ContainsKey(key) || string.IsNullOrWhiteSpace(dict[key]))
            dict[key] = value;
    }

    private static string? FormatFieldValue(ContractFieldValue fv)
    {
        if (!string.IsNullOrWhiteSpace(fv.StringValue)) return fv.StringValue;
        if (fv.NumberValue.HasValue) return fv.NumberValue.Value.ToString("0.####", CultureInfo.InvariantCulture);
        if (fv.DateValue.HasValue) return FormatJalali(fv.DateValue.Value);
        return null;
    }

    private static string? FormatJalali(DateTime? dt)
    {
        if (!dt.HasValue) return null;
        try
        {
            var date = dt.Value.Kind == DateTimeKind.Utc
                ? dt.Value
                : DateTime.SpecifyKind(dt.Value, DateTimeKind.Utc);
            var iranian = new PersianCalendar();
            var local = TimeZoneInfo.ConvertTimeFromUtc(date,
                TimeZoneInfo.FindSystemTimeZoneById("Iran Standard Time"));
            return $"{iranian.GetYear(local):0000}/{iranian.GetMonth(local):00}/{iranian.GetDayOfMonth(local):00}";
        }
        catch
        {
            return dt.Value.ToString("yyyy/MM/dd", CultureInfo.InvariantCulture);
        }
    }
}
