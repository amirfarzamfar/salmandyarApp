using System.Collections.ObjectModel;

namespace Salmandyar.Domain.Constants;

public sealed record PermissionDefinition(
    string Key,
    string Group,
    string GroupDisplayName,
    string DisplayName,
    string Description);

public static class Permissions
{
    public const string ClaimType = "permission";

    public static class Dashboard
    {
        public const string View = "dashboard.view";
    }

    public static class Users
    {
        public const string View = "users.view";
        public const string Create = "users.create";
        public const string Edit = "users.edit";
        public const string Delete = "users.delete";
        public const string ManageRoles = "users.manage_roles";
        public const string ManagePermissions = "users.manage_permissions";
        public const string ResetPassword = "users.reset_password";
        public const string Lock = "users.lock";
        public const string AuditView = "users.audit_view";
        public const string ManageAssignments = "users.manage_assignments";
    }

    public static class Patients
    {
        public const string View = "patients.view";
        public const string Manage = "patients.manage";
        public const string UpdateAdminInfo = "patients.update_admin_info";
        public const string ManageProfiles = "patients.manage_profiles";
        public const string ManageSelfService = "patients.manage_self_service";
    }

    public static class Medications
    {
        public const string View = "medications.view";
        public const string Manage = "medications.manage";
        public const string ManageInventory = "medications.manage_inventory";
        public const string ManageAlerts = "medications.manage_alerts";
    }

    public static class Services
    {
        public const string View = "services.view";
        public const string ManageDefinitions = "services.manage_definitions";
        public const string ManageAssignments = "services.manage_assignments";
        public const string ManageTracking = "services.manage_tracking";
        public const string PatientServicesView = "patient_services.view";
        public const string PatientServicesCreate = "patient_services.create";
        public const string PatientServicesEdit = "patient_services.edit";
        public const string PatientServicesDelete = "patient_services.delete";
        public const string PatientServicesAssign = "patient_services.assign";
        public const string PatientServicesSchedule = "patient_services.schedule";
        public const string PatientServicesStatus = "patient_services.status";
        public const string PatientServicesNotifications = "patient_services.notifications";
        public const string PatientServicesBulk = "patient_services.bulk";
    }

    public static class Reports
    {
        public const string View = "reports.view";
        public const string CreateNursing = "reports.create_nursing";
        public const string ManageNursing = "reports.manage_nursing";
    }

    public static class Assessments
    {
        public const string View = "assessments.view";
        public const string Manage = "assessments.manage";
        public const string ManageAssignments = "assessments.manage_assignments";
        public const string ViewReports = "assessments.view_reports";
    }

    public static class Evaluations
    {
        public const string View = "evaluations.view";
        public const string Manage = "evaluations.manage";
        public const string ManageAssignments = "evaluations.manage_assignments";
    }

    public static class Shifts
    {
        public const string View = "shifts.view";
        public const string Manage = "shifts.manage";
    }

    public static class Matching
    {
        public const string View = "matching.view";
        public const string Manage = "matching.manage";
    }

    public static class Notifications
    {
        public const string ViewSettings = "notifications.view_settings";
        public const string ManageSettings = "notifications.manage_settings";
        public const string SendTest = "notifications.send_test";
    }

    public static class OtpSettings
    {
        public const string View = "otp_settings.view";
        public const string Manage = "otp_settings.manage";
    }

    public static class ReportConfig
    {
        public const string View = "report_config.view";
        public const string Manage = "report_config.manage";
    }

    public static class Exams
    {
        public const string View = "exams.view";
        public const string Participate = "exams.participate";
    }

    public static class Portal
    {
        public const string ViewProfile = "portal.view_profile";
        public const string ManageProfile = "portal.manage_profile";
        public const string RecordVitals = "portal.record_vitals";
        public const string AcknowledgeVitals = "portal.acknowledge_vitals";
        public const string ManageMedicationTimeline = "portal.manage_medication_timeline";
    }

    public static IReadOnlyList<PermissionDefinition> Definitions { get; } =
    [
        new(Dashboard.View, "dashboard", "داشبورد", "مشاهده داشبوردها", "اجازه مشاهده داشبوردهای اصلی سامانه را می‌دهد."),

        new(Users.View, "users", "مدیریت کاربران", "مشاهده کاربران", "اجازه مشاهده لیست، جزئیات و وضعیت کاربران را می‌دهد."),
        new(Users.Create, "users", "مدیریت کاربران", "ایجاد کاربر", "اجازه ایجاد کاربر جدید از پنل ادمین را می‌دهد."),
        new(Users.Edit, "users", "مدیریت کاربران", "ویرایش کاربر", "اجازه ویرایش اطلاعات پایه کاربر را می‌دهد."),
        new(Users.Delete, "users", "مدیریت کاربران", "حذف کاربر", "اجازه حذف حساب‌های کاربری مجاز را می‌دهد."),
        new(Users.ManageRoles, "users", "مدیریت کاربران", "مدیریت نقش کاربران", "اجازه تغییر نقش‌ها و عضویت کاربر در نقش‌ها را می‌دهد."),
        new(Users.ManagePermissions, "users", "مدیریت کاربران", "مدیریت سطوح دسترسی", "اجازه تنظیم دسترسی‌ها برای نقش‌ها و کاربران را می‌دهد."),
        new(Users.ResetPassword, "users", "مدیریت کاربران", "ریست رمز عبور", "اجازه ریست رمز عبور کاربران را می‌دهد."),
        new(Users.Lock, "users", "مدیریت کاربران", "قفل و بازکردن حساب", "اجازه قفل و بازکردن حساب کاربری را می‌دهد."),
        new(Users.AuditView, "users", "مدیریت کاربران", "مشاهده لاگ کاربران", "اجازه مشاهده لاگ فعالیت و تغییرات کاربران را می‌دهد."),
        new(Users.ManageAssignments, "users", "مدیریت کاربران", "مدیریت تخصیص بیماران", "اجازه تخصیص بیمار به مراقب و مدیریت آن را می‌دهد."),

        new(Patients.View, "patients", "بیماران و پرونده‌ها", "مشاهده بیماران", "اجازه مشاهده لیست بیماران و پرونده‌های مرتبط را می‌دهد."),
        new(Patients.Manage, "patients", "بیماران و پرونده‌ها", "مدیریت بیماران", "اجازه ایجاد، ویرایش و مدیریت رکوردهای بیمار را می‌دهد."),
        new(Patients.UpdateAdminInfo, "patients", "بیماران و پرونده‌ها", "ویرایش اطلاعات ادمین بیمار", "اجازه ویرایش اطلاعات مدیریتی پرونده بیمار را می‌دهد."),
        new(Patients.ManageProfiles, "patients", "بیماران و پرونده‌ها", "مدیریت پروفایل و مدارک", "اجازه مدیریت پروفایل و مدارک بیمار را می‌دهد."),
        new(Patients.ManageSelfService, "patients", "بیماران و پرونده‌ها", "مدیریت دسترسی ثبت اطلاعات", "اجازه تنظیم دسترسی self-service بیمار یا سالمند را می‌دهد."),

        new(Medications.View, "medications", "دارو و کاردکس", "مشاهده داروها", "اجازه مشاهده داروها، کاردکس و تایم‌لاین مصرف را می‌دهد."),
        new(Medications.Manage, "medications", "دارو و کاردکس", "مدیریت داروها", "اجازه افزودن، ویرایش و حذف داروها و رویدادهای مصرف را می‌دهد."),
        new(Medications.ManageInventory, "medications", "دارو و کاردکس", "مدیریت موجودی دارو", "اجازه مدیریت موجودی و اقلام دارویی را می‌دهد."),
        new(Medications.ManageAlerts, "medications", "دارو و کاردکس", "مدیریت هشدارهای دارو", "اجازه تنظیم قوانین و هشدارهای دارویی را می‌دهد."),

        new(Services.View, "services", "خدمات و سرویس‌ها", "مشاهده خدمات", "اجازه مشاهده خدمات و سرویس‌های مراقبتی را می‌دهد."),
        new(Services.ManageDefinitions, "services", "خدمات و سرویس‌ها", "مدیریت تعاریف خدمات", "اجازه مدیریت تعریف سرویس‌ها را می‌دهد."),
        new(Services.ManageAssignments, "services", "خدمات و سرویس‌ها", "مدیریت تخصیص خدمات", "اجازه تخصیص و برنامه‌ریزی خدمات را می‌دهد."),
        new(Services.ManageTracking, "services", "خدمات و سرویس‌ها", "مدیریت رهگیری خدمات", "اجازه ثبت و رهگیری اجرای خدمات را می‌دهد."),
        new(Services.PatientServicesView, "patient_services", "مدیریت خدمات بیماران", "مشاهده خدمات بیماران", "اجازه مشاهده لیست، جزئیات و آمار خدمات بیماران را می‌دهد."),
        new(Services.PatientServicesCreate, "patient_services", "مدیریت خدمات بیماران", "ثبت خدمت جدید", "اجازه ثبت و برنامه‌ریزی خدمت جدید برای بیماران را می‌دهد."),
        new(Services.PatientServicesEdit, "patient_services", "مدیریت خدمات بیماران", "ویرایش خدمات", "اجازه ویرایش اطلاعات ثبت‌شده خدمات را می‌دهد."),
        new(Services.PatientServicesDelete, "patient_services", "مدیریت خدمات بیماران", "حذف خدمات", "اجازه حذف یا لغو خدمات ثبت‌شده را می‌دهد."),
        new(Services.PatientServicesAssign, "patient_services", "مدیریت خدمات بیماران", "تخصیص خدمت‌دهنده", "اجازه تخصیص و تغییر پرستار/خدمت‌دهنده به خدمات را می‌دهد."),
        new(Services.PatientServicesSchedule, "patient_services", "مدیریت خدمات بیماران", "برنامه‌ریزی خدمات", "اجازه برنامه‌ریزی تکرارشونده و زمان‌بندی خدمات را می‌دهد."),
        new(Services.PatientServicesStatus, "patient_services", "مدیریت خدمات بیماران", "تغییر وضعیت خدمت", "اجازه تغییر وضعیت اجرایی خدمات (شروع، تکمیل، لغو و...) را می‌دهد."),
        new(Services.PatientServicesNotifications, "patient_services", "مدیریت خدمات بیماران", "مدیریت اعلان‌های خدمت", "اجازه ارسال و مدیریت اعلان‌های مربوط به خدمات را می‌دهد."),
        new(Services.PatientServicesBulk, "patient_services", "مدیریت خدمات بیماران", "عملیات گروهی خدمات", "اجازه انجام عملیات گروهی روی چند خدمت همزمان را می‌دهد."),

        new(Reports.View, "reports", "گزارش‌ها", "مشاهده گزارش‌ها", "اجازه مشاهده گزارش‌های مراقبتی و عملیاتی را می‌دهد."),
        new(Reports.CreateNursing, "reports", "گزارش‌ها", "ثبت گزارش پرستاری", "اجازه ایجاد گزارش پرستاری را می‌دهد."),
        new(Reports.ManageNursing, "reports", "گزارش‌ها", "مدیریت گزارش‌های پرستاری", "اجازه ویرایش یا مدیریت گزارش‌های پرستاری را می‌دهد."),

        new(Assessments.View, "assessments", "ارزیابی‌ها", "مشاهده ارزیابی‌ها", "اجازه مشاهده ارزیابی‌ها و فرم‌های آن‌ها را می‌دهد."),
        new(Assessments.Manage, "assessments", "ارزیابی‌ها", "مدیریت ارزیابی‌ها", "اجازه ایجاد، ویرایش و مدیریت ارزیابی‌ها را می‌دهد."),
        new(Assessments.ManageAssignments, "assessments", "ارزیابی‌ها", "مدیریت تخصیص ارزیابی", "اجازه تخصیص ارزیابی به کاربران را می‌دهد."),
        new(Assessments.ViewReports, "assessments", "ارزیابی‌ها", "مشاهده گزارش ارزیابی", "اجازه مشاهده گزارش‌ها و خروجی ارزیابی را می‌دهد."),

        new(Evaluations.View, "evaluations", "ارزیابی کاربران", "مشاهده ارزیابی کاربران", "اجازه مشاهده ارزیابی‌های کاربران را می‌دهد."),
        new(Evaluations.Manage, "evaluations", "ارزیابی کاربران", "مدیریت ارزیابی کاربران", "اجازه ایجاد و ویرایش ارزیابی کاربران را می‌دهد."),
        new(Evaluations.ManageAssignments, "evaluations", "ارزیابی کاربران", "مدیریت تخصیص ارزیابی کاربران", "اجازه تخصیص ارزیابی کاربران را می‌دهد."),

        new(Shifts.View, "shifts", "شیفت‌ها", "مشاهده شیفت‌ها", "اجازه مشاهده تقویم و برنامه شیفت‌ها را می‌دهد."),
        new(Shifts.Manage, "shifts", "شیفت‌ها", "مدیریت شیفت‌ها", "اجازه تعریف و ویرایش شیفت‌ها را می‌دهد."),

        new(Matching.View, "matching", "مچینگ و تخصیص", "مشاهده مچینگ", "اجازه مشاهده نتایج و صفحات مچینگ را می‌دهد."),
        new(Matching.Manage, "matching", "مچینگ و تخصیص", "مدیریت مچینگ", "اجازه انجام یا ویرایش عملیات مچینگ را می‌دهد."),

        new(Notifications.ViewSettings, "notifications", "اعلان‌ها", "مشاهده تنظیمات اعلان", "اجازه مشاهده تنظیمات اعلان‌ها را می‌دهد."),
        new(Notifications.ManageSettings, "notifications", "اعلان‌ها", "مدیریت تنظیمات اعلان", "اجازه تغییر تنظیمات اعلان‌ها را می‌دهد."),
        new(Notifications.SendTest, "notifications", "اعلان‌ها", "ارسال اعلان تست", "اجازه ارسال ایمیل یا پیامک تست را می‌دهد."),

        new(OtpSettings.View, "otp_settings", "تنظیمات OTP", "مشاهده تنظیمات OTP", "اجازه مشاهده تنظیمات ورود با رمز یکبار مصرف را می‌دهد."),
        new(OtpSettings.Manage, "otp_settings", "تنظیمات OTP", "مدیریت تنظیمات OTP", "اجازه ویرایش تنظیمات ورود با رمز یکبار مصرف را می‌دهد."),

        new(ReportConfig.View, "report_config", "پیکربندی گزارش", "مشاهده پیکربندی گزارش", "اجازه مشاهده تنظیمات پیکربندی گزارش را می‌دهد."),
        new(ReportConfig.Manage, "report_config", "پیکربندی گزارش", "مدیریت پیکربندی گزارش", "اجازه ویرایش پیکربندی گزارش را می‌دهد."),

        new(Exams.View, "exams", "آزمون‌ها", "مشاهده آزمون‌ها", "اجازه مشاهده آزمون‌ها و اطلاعات آن‌ها را می‌دهد."),
        new(Exams.Participate, "exams", "آزمون‌ها", "شرکت در آزمون", "اجازه شرکت در آزمون یا ارسال پاسخ را می‌دهد."),

        new(Portal.ViewProfile, "portal", "پرتال کاربری", "مشاهده پروفایل پرتال", "اجازه مشاهده اطلاعات پروفایل در پرتال را می‌دهد."),
        new(Portal.ManageProfile, "portal", "پرتال کاربری", "مدیریت پروفایل پرتال", "اجازه ویرایش پروفایل و تکمیل wizard پرتال را می‌دهد."),
        new(Portal.RecordVitals, "portal", "پرتال کاربری", "ثبت علائم حیاتی", "اجازه ثبت علائم حیاتی از پرتال یا self-service را می‌دهد."),
        new(Portal.AcknowledgeVitals, "portal", "پرتال کاربری", "تایید علائم حیاتی", "اجازه تایید یا پیگیری علائم حیاتی را می‌دهد."),
        new(Portal.ManageMedicationTimeline, "portal", "پرتال کاربری", "مدیریت تایم‌لاین دارو", "اجازه تعامل با تایم‌لاین مصرف دارو را می‌دهد.")
    ];

    public static IReadOnlyList<string> All { get; } = Definitions
        .Select(x => x.Key)
        .OrderBy(x => x)
        .ToList();

    public static IReadOnlyDictionary<string, PermissionDefinition> ByKey { get; } =
        new ReadOnlyDictionary<string, PermissionDefinition>(
            Definitions.ToDictionary(x => x.Key, x => x, StringComparer.OrdinalIgnoreCase));
}
