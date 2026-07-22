export type PanelKey = "dashboard" | "nurse" | "portal";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

type PanelNav = {
  title: string;
  breadcrumbs: BreadcrumbItem[];
  backHref?: string;
  show: boolean;
};

function startsWithAny(pathname: string, prefixes: string[]) {
  return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function getDashboardNav(pathname: string): PanelNav {
  if (!pathname.startsWith("/dashboard")) return { title: "", breadcrumbs: [], show: false };

  const breadcrumbs: BreadcrumbItem[] = [{ label: "داشبورد", href: "/dashboard" }];

  if (pathname === "/dashboard") {
    return { title: "داشبورد", breadcrumbs, show: false };
  }

  if (pathname === "/dashboard/patients") {
    return { title: "مدیریت بیماران", breadcrumbs: [...breadcrumbs, { label: "مدیریت بیماران" }], backHref: "/dashboard", show: true };
  }

  if (pathname === "/dashboard/services") {
    return { title: "مدیریت خدمات", breadcrumbs: [...breadcrumbs, { label: "مدیریت خدمات" }], backHref: "/dashboard", show: true };
  }

  if (pathname === "/dashboard/personnel") {
    return { title: "مدیریت پرسنل", breadcrumbs: [...breadcrumbs, { label: "مدیریت پرسنل" }], backHref: "/dashboard", show: true };
  }

  if (pathname === "/dashboard/reports") {
    return { title: "گزارش‌ها", breadcrumbs: [...breadcrumbs, { label: "گزارش‌ها" }], backHref: "/dashboard", show: true };
  }

  if (pathname.startsWith("/dashboard/admin/")) {
    const adminRoot: BreadcrumbItem = { label: "ادمین", href: "/dashboard/admin/users" };
    const base = [...breadcrumbs, adminRoot];

    if (pathname.startsWith("/dashboard/admin/users")) {
      return { title: "مدیریت کاربران", breadcrumbs: [...base, { label: "مدیریت کاربران" }], backHref: "/dashboard", show: true };
    }

    if (pathname.startsWith("/dashboard/admin/shifts")) {
      return { title: "مدیریت شیفت‌ها", breadcrumbs: [...base, { label: "مدیریت شیفت‌ها" }], backHref: "/dashboard", show: true };
    }

    if (pathname.startsWith("/dashboard/admin/medication-administration")) {
      return { title: "پایش مصرف دارو", breadcrumbs: [...base, { label: "پایش مصرف دارو" }], backHref: "/dashboard", show: true };
    }

    if (pathname.startsWith("/dashboard/admin/report-config")) {
      return { title: "پیکربندی گزارشات", breadcrumbs: [...base, { label: "پیکربندی گزارشات" }], backHref: "/dashboard", show: true };
    }

    if (pathname.startsWith("/dashboard/admin/matching")) {
      return { title: "تطبیق هوشمند", breadcrumbs: [...base, { label: "تطبیق هوشمند" }], backHref: "/dashboard", show: true };
    }

    if (startsWithAny(pathname, ["/dashboard/admin/settings/notifications", "/dashboard/admin/settings/auth-otp", "/dashboard/admin/settings/medication-alerts"])) {
      const settingsBase = [...base, { label: "تنظیمات", href: "/dashboard/admin/settings/notifications" }];
      if (pathname.startsWith("/dashboard/admin/settings/notifications")) {
        return { title: "تنظیمات پیام", breadcrumbs: [...settingsBase, { label: "تنظیمات پیام" }], backHref: "/dashboard", show: true };
      }
      if (pathname.startsWith("/dashboard/admin/settings/auth-otp")) {
        return { title: "ورود با رمز یکبار مصرف", breadcrumbs: [...settingsBase, { label: "ورود با رمز یکبار مصرف" }], backHref: "/dashboard", show: true };
      }
      return { title: "تنظیم پیام هشدار دارو", breadcrumbs: [...settingsBase, { label: "تنظیم پیام هشدار دارو" }], backHref: "/dashboard", show: true };
    }

    if (pathname.startsWith("/dashboard/admin/assessments")) {
      const assessmentsBase = [...base, { label: "مدیریت آزمون‌ها", href: "/dashboard/admin/assessments" }];
      if (pathname === "/dashboard/admin/assessments") {
        return { title: "لیست آزمون‌ها", breadcrumbs: [...assessmentsBase, { label: "لیست آزمون‌ها" }], backHref: "/dashboard", show: true };
      }
      if (pathname.startsWith("/dashboard/admin/assessments/create")) {
        return { title: "ایجاد آزمون", breadcrumbs: [...assessmentsBase, { label: "ایجاد آزمون" }], backHref: "/dashboard/admin/assessments", show: true };
      }
      if (pathname.includes("/edit")) {
        return { title: "ویرایش آزمون", breadcrumbs: [...assessmentsBase, { label: "ویرایش آزمون" }], backHref: "/dashboard/admin/assessments", show: true };
      }
      if (pathname.startsWith("/dashboard/admin/assessments/user-assignments")) {
        return { title: "مدیریت آزمون کاربران", breadcrumbs: [...assessmentsBase, { label: "مدیریت آزمون کاربران" }], backHref: "/dashboard/admin/assessments", show: true };
      }
      if (pathname.startsWith("/dashboard/admin/assessments/reports/attempt/")) {
        return { title: "جزئیات پاسخ‌نامه", breadcrumbs: [...assessmentsBase, { label: "گزارش آزمون‌ها", href: "/dashboard/admin/assessments/reports" }, { label: "جزئیات پاسخ‌نامه" }], backHref: "/dashboard/admin/assessments/reports", show: true };
      }
      if (pathname.startsWith("/dashboard/admin/assessments/reports/")) {
        return { title: "جزئیات گزارش آزمون", breadcrumbs: [...assessmentsBase, { label: "گزارش آزمون‌ها", href: "/dashboard/admin/assessments/reports" }, { label: "جزئیات گزارش آزمون" }], backHref: "/dashboard/admin/assessments/reports", show: true };
      }
      if (pathname.startsWith("/dashboard/admin/assessments/reports")) {
        return { title: "گزارش آزمون‌ها", breadcrumbs: [...assessmentsBase, { label: "گزارش آزمون‌ها" }], backHref: "/dashboard/admin/assessments", show: true };
      }
      return { title: "مدیریت آزمون‌ها", breadcrumbs: assessmentsBase, backHref: "/dashboard", show: true };
    }

    if (pathname.startsWith("/dashboard/admin/user-evaluations")) {
      const evalBase = [...base, { label: "مدیریت ارزیابی کاربران", href: "/dashboard/admin/user-evaluations" }];
      if (pathname === "/dashboard/admin/user-evaluations") {
        return { title: "لیست فرم‌های ارزیابی", breadcrumbs: [...evalBase, { label: "لیست فرم‌های ارزیابی" }], backHref: "/dashboard", show: true };
      }
      if (pathname.startsWith("/dashboard/admin/user-evaluations/create")) {
        return { title: "ایجاد فرم ارزیابی", breadcrumbs: [...evalBase, { label: "ایجاد فرم ارزیابی" }], backHref: "/dashboard/admin/user-evaluations", show: true };
      }
      if (pathname.includes("/edit")) {
        return { title: "ویرایش فرم ارزیابی", breadcrumbs: [...evalBase, { label: "ویرایش فرم ارزیابی" }], backHref: "/dashboard/admin/user-evaluations", show: true };
      }
      if (pathname.startsWith("/dashboard/admin/user-evaluations/user-assignments")) {
        return { title: "مدیریت ارزیابی کاربران", breadcrumbs: [...evalBase, { label: "مدیریت ارزیابی کاربران" }], backHref: "/dashboard/admin/user-evaluations", show: true };
      }
      return { title: "مدیریت ارزیابی کاربران", breadcrumbs: evalBase, backHref: "/dashboard", show: true };
    }

    return { title: "مدیریت", breadcrumbs: base, backHref: "/dashboard", show: true };
  }

  return { title: "داشبورد", breadcrumbs, backHref: "/dashboard", show: true };
}

function getNurseNav(pathname: string): PanelNav {
  if (!pathname.startsWith("/nurse-portal")) return { title: "", breadcrumbs: [], show: false };

  const breadcrumbs: BreadcrumbItem[] = [{ label: "پنل پرستار", href: "/nurse-portal" }];

  if (pathname === "/nurse-portal") return { title: "داشبورد پرستار", breadcrumbs, show: false };

  if (pathname.startsWith("/nurse-portal/patient-management")) {
    return { title: "مدیریت بیماران", breadcrumbs: [...breadcrumbs, { label: "مدیریت بیماران" }], backHref: "/nurse-portal", show: true };
  }

  if (pathname.startsWith("/nurse-portal/patient/")) {
    return {
      title: "پرونده بیمار",
      breadcrumbs: [...breadcrumbs, { label: "مدیریت بیماران", href: "/nurse-portal/patient-management" }, { label: "پرونده بیمار" }],
      backHref: "/nurse-portal/patient-management",
      show: false,
    };
  }

  if (pathname.startsWith("/nurse-portal/exams")) {
    if (pathname === "/nurse-portal/exams") {
      return { title: "آزمون‌ها", breadcrumbs: [...breadcrumbs, { label: "آزمون‌ها" }], backHref: "/nurse-portal", show: true };
    }
    return { title: "جزئیات آزمون", breadcrumbs: [...breadcrumbs, { label: "آزمون‌ها", href: "/nurse-portal/exams" }, { label: "جزئیات آزمون" }], backHref: "/nurse-portal/exams", show: false };
  }

  if (pathname.startsWith("/nurse-portal/assessments")) {
    if (pathname === "/nurse-portal/assessments") {
      return { title: "ارزیابی‌ها", breadcrumbs: [...breadcrumbs, { label: "ارزیابی‌ها" }], backHref: "/nurse-portal", show: true };
    }
    return { title: "جزئیات ارزیابی", breadcrumbs: [...breadcrumbs, { label: "ارزیابی‌ها", href: "/nurse-portal/assessments" }, { label: "جزئیات ارزیابی" }], backHref: "/nurse-portal/assessments", show: false };
  }

  if (pathname.startsWith("/nurse-portal/reports")) {
    return { title: "گزارش‌ها", breadcrumbs: [...breadcrumbs, { label: "گزارش‌ها" }], backHref: "/nurse-portal", show: true };
  }

  if (pathname.startsWith("/nurse-portal/services")) {
    return { title: "خدمات", breadcrumbs: [...breadcrumbs, { label: "خدمات" }], backHref: "/nurse-portal", show: true };
  }

  if (pathname.startsWith("/nurse-portal/profile")) {
    return { title: "پروفایل", breadcrumbs: [...breadcrumbs, { label: "پروفایل" }], backHref: "/nurse-portal", show: true };
  }

  if (pathname.startsWith("/nurse-portal/employment-profile")) {
    return { title: "پروفایل استخدامی", breadcrumbs: [...breadcrumbs, { label: "پروفایل استخدامی" }], backHref: "/nurse-portal", show: true };
  }

  return { title: "پنل پرستار", breadcrumbs, backHref: "/nurse-portal", show: true };
}

function getPortalNav(pathname: string): PanelNav {
  if (!pathname.startsWith("/portal")) return { title: "", breadcrumbs: [], show: false };

  const breadcrumbs: BreadcrumbItem[] = [{ label: "پورتال سلامت", href: "/portal" }];

  if (pathname === "/portal") return { title: "پورتال سلامت", breadcrumbs, show: false };

  if (pathname.startsWith("/portal/profile")) {
    return { title: "پروفایل", breadcrumbs: [...breadcrumbs, { label: "پروفایل" }], backHref: "/portal", show: true };
  }

  if (pathname.startsWith("/portal/profile-wizard")) {
    return { title: "تکمیل پروفایل", breadcrumbs: [...breadcrumbs, { label: "تکمیل پروفایل" }], backHref: "/portal", show: true };
  }

  if (pathname.startsWith("/portal/assessments")) {
    if (pathname === "/portal/assessments") {
      return { title: "آزمون‌ها", breadcrumbs: [...breadcrumbs, { label: "آزمون‌ها" }], backHref: "/portal", show: true };
    }
    return { title: "جزئیات آزمون", breadcrumbs: [...breadcrumbs, { label: "آزمون‌ها", href: "/portal/assessments" }, { label: "جزئیات آزمون" }], backHref: "/portal/assessments", show: true };
  }

  return { title: "پورتال سلامت", breadcrumbs, backHref: "/portal", show: true };
}

export function getPanelNavigation(panel: PanelKey, pathname: string): PanelNav {
  if (panel === "dashboard") return getDashboardNav(pathname);
  if (panel === "nurse") return getNurseNav(pathname);
  return getPortalNav(pathname);
}

