"use client";

import { Button } from "@/components/ui/Button";
import { cn, formatJalaliDateTime } from "@/lib/utils";
import {
  ArrowLeftRight,
  CheckCircle2,
  Download,
  ExternalLink,
  Printer,
  RefreshCw,
  ShieldCheck,
  UserCircle2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ContractAssignmentDto, ContractDocumentDto } from "@/types/contract";

/**
 * FormalContractLetter — reusable A4-ready RTL Persian letter used in:
 *  - Nurse Portal → قرارداد همکاری → سند نهایی / امضا شده
 *  - Admin Personnel → تب «قرارداد همکاری» → مشاهده سند
 *  - Admin Contracts → Assignments → View Document
 *
 * Layout:
 *  - Print wrapper (@page A4, @media print hide all chrome)
 *  - Header: لوگو / عنوان سازمانی سالمندیار + شماره قرارداد + تاریخ + نسخه
 *  - عنوان نامه: «قرارداد همکاری ارائه خدمات مراقبت از سالمند»
 *  - اطلاعات طرفین قرارداد (کارفرما + مراقب + سالمند در صورت وجود)
 *  - متن کامل قرارداد (renderedHtml یا فرم‌خوان با Placeholderهای پر شده)
 *  - بخش امضاها (سه‌جانبه)
 *  - Footer: شماره پیج + هش + شناسه تراکنش در صورت وجود
 *  - Toolbar: Print / باز کردن در پنجره جدید / بروزرسانی / بستن
 */

type Props = {
  assignment: ContractAssignmentDto;
  document?: ContractDocumentDto | null;
  renderedHtml?: string;
  title?: string;
  showToolbar?: boolean;
  onClose?: () => void;
  onRefresh?: () => void;
  loading?: boolean;
};

const fmtJalali = (x: any): string => {
  if (!x) return "—";
  try {
    const d = new Date(x);
    if (isNaN(d.getTime())) return "—";
    return new Intl.DateTimeFormat("fa-IR-u-ca-persian", { dateStyle: "medium" }).format(d);
  } catch {
    return "—";
  }
};

const nowJalaliDateOnly = () => fmtJalali(new Date());

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

function formatContractNumber(n: string | number | undefined, fallbackId: number) {
  if (n && String(n).trim()) return String(n);
  return `SC-${String(fallbackId).padStart(6, "0")}`;
}

export default function FormalContractLetter({
  assignment,
  document,
  renderedHtml,
  title,
  showToolbar = true,
  onClose,
  onRefresh,
  loading,
}: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [printReadyHtml, setPrintReadyHtml] = useState<string>("");

  const letterHtml = useMemo(() => {
    const finalHtml = renderedHtml ?? document?.renderedHtml ?? "";
    const contractNo = formatContractNumber(
      assignment.contractNumber ?? document?.contractNumber,
      assignment.id
    );
    const jalaliAssigned = assignment.assignedAt
      ? fmtJalali(assignment.assignedAt)
      : nowJalaliDateOnly();
    const jalaliSigned = assignment.signedAt
      ? fmtJalali(assignment.signedAt)
      : "—";
    const jalaliStart = assignment.startDate
      ? typeof assignment.startDate === "string" && /^\d{4}-\d{2}-\d{2}/.test(assignment.startDate)
        ? fmtJalali(assignment.startDate)
        : assignment.startDate
      : "—";
    const jalaliEnd = assignment.endDate
      ? typeof assignment.endDate === "string" && /^\d{4}-\d{2}-\d{2}/.test(assignment.endDate)
        ? fmtJalali(assignment.endDate)
        : assignment.endDate
      : "نامحدود";

    const caregiverFull = assignment.userFullName || "نام و نام خانوادگی پرستار/مراقب";
    const caregiverNational = (assignment as any).userNationalCode || "(کد ملی در پروفایل ثبت شود)";
    const caregiverPhone = (assignment as any).userPhoneNumber || "";
    const version = assignment.templateVersion ?? 0;
    const cooperation =
      (assignment as any).cooperationType ??
      (assignment as any).defaultCooperationType ??
      "پاره‌وقت / بر اساس قرارداد";
    const hash = document?.signedSnapshotContentHash ?? "";

    const buildSignatureLine = (role: string, nameHint: string, subHint: string) =>
      `<tr>
        <td class="sig-cell">
          <div class="sig-name">${role}</div>
          <div class="sig-sub">${subHint}</div>
          <div class="sig-placeholder"></div>
          <div class="sig-real-name">${nameHint}</div>
        </td>
      </tr>`;

    const letter = `<!doctype html>
<html dir="rtl" lang="fa">
<head>
<meta charset="utf-8" />
<title>قرارداد همکاری - سالمندیار - ${contractNo}</title>
<style>
  @page { size: A4; margin: 18mm 15mm 18mm 15mm; }
  * { box-sizing: border-box; }
  html, body { margin:0; padding:0; color:#0f172a; font-family: "B Yekan", "IRANSans", "Tahoma", sans-serif; background:#ffffff; }
  body { font-size: 13.5px; line-height: 2; }
  .letter { width: 100%; }
  .letter-head {
    display: grid;
    grid-template-columns: 90px 1fr auto;
    gap: 16px;
    align-items: center;
    padding-bottom: 12px;
    border-bottom: 3px double #0f766e;
    margin-bottom: 16px;
  }
  .logo {
    width: 90px; height: 90px; border-radius: 18px;
    background:
      radial-gradient(circle at 30% 30%, #a7f3d0 0%, transparent 60%),
      linear-gradient(135deg, #0f766e 0%, #14b8a6 60%, #6ee7b7 100%);
    color:#fff; display:flex; align-items:center; justify-content:center;
    font-size: 28px; font-weight: 900; letter-spacing: 2px;
    box-shadow: inset 0 0 0 3px #ffffffaa, 0 4px 10px #0f766e22;
  }
  .org h1 { margin:0; font-size: 20px; color:#0f766e; font-weight: 900; }
  .org h2 { margin:2px 0 0; font-size: 13px; color:#475569; font-weight: 500; }
  .org .tag { display:inline-block; margin-top:6px; padding:2px 10px; border-radius:999px; background:#ccfbf1; color:#0f766e; font-size:11px; font-weight:700; border:1px solid #5eead4; }
  .meta { text-align:left; direction:ltr; font-size:12px; color:#334155; line-height: 2; }
  .meta .m-row { display:flex; gap:6px; align-items:center; justify-content:flex-end; }
  .meta .m-label { color:#94a3b8; min-width:84px; text-align:right; direction:rtl; }
  .meta .m-value { font-weight:800; color:#0f172a; direction:rtl; }
  .subject {
    margin: 20px 0 18px; padding: 14px 20px; border-radius: 14px;
    background: linear-gradient(135deg,#ecfeff,#f0fdfa);
    border:1px solid #99f6e4;
    text-align:center;
  }
  .subject .k { font-size:16px; font-weight: 900; color:#0f766e; letter-spacing: 0.3px; }
  .subject .s { margin-top:6px; font-size:12px; color:#334155; }
  .parties {
    display:grid; grid-template-columns: 1fr 1fr; gap: 10px;
    margin-bottom: 22px;
  }
  .party {
    padding: 12px 14px; border-radius: 12px; background:#f8fafc;
    border: 1px solid #e2e8f0;
  }
  .party .role { font-weight: 900; color:#0f172a; margin-bottom: 6px; font-size: 13px; }
  .party .row { display:flex; gap:6px; font-size:12px; color:#334155; }
  .party .row .r { color:#64748b; min-width: 84px; }
  .party .row .v { font-weight: 700; }
  .contract-body {
    padding: 0 2px;
    text-align: justify;
    font-size: 13.5px;
    line-height: 2.1;
    color: #0f172a;
  }
  .contract-body :is(h1,h2,h3,h4) { color:#0f766e; margin-top: 18px; font-weight: 900; }
  .contract-body article, .contract-body .article {
    margin: 10px 0; padding: 10px 14px; border-radius: 10px;
    background: #ffffff; border: 1px solid #e2e8f0;
  }
  .signatures {
    margin-top: 26px; padding-top: 16px;
    border-top: 1px dashed #94a3b8;
  }
  .sig-table { width: 100%; border-collapse: separate; border-spacing: 10px 0; table-layout: fixed;}
  .sig-cell {
    width: 33%;
    vertical-align: bottom;
    padding: 12px 14px 10px;
    border: 1px solid #e2e8f0;
    border-radius: 14px;
    background: #f8fafc;
  }
  .sig-name { font-size: 13px; font-weight: 900; color:#0f172a; text-align: center; }
  .sig-sub  { font-size: 11px; color:#64748b; text-align: center; margin-bottom: 14px; }
  .sig-placeholder {
    height: 68px;
    border-bottom: 2px dashed #94a3b8;
    margin: 0 6px 6px;
    position: relative;
  }
  .sig-real-name { font-size: 12px; color:#0f172a; text-align:center; font-weight: 800; }
  .footer {
    margin-top: 22px; padding: 10px 14px; border-radius: 12px;
    background: #f1f5f9; border: 1px solid #e2e8f0;
    font-size: 10.5px; color:#475569; display:flex; gap:14px; align-items:center; flex-wrap:wrap;
    justify-content: space-between;
  }
  .footer .hash { font-family: monospace; direction: ltr; font-size: 10.5px; color:#0f172a; word-break: break-all; }
  .footer .meta2 { font-size: 11px; color:#475569; }
  @media print {
    body { background: #fff; }
  }
</style>
</head>
<body>
  <div class="letter">
    <div class="letter-head">
      <div class="logo">SM</div>
      <div class="org">
        <h1>سامانه جامع مراقبت و خدمات سالمندیار</h1>
        <h2>دفتر قراردادهای همکاری با نیروهای پرستاری و مراقبت از سالمند</h2>
        <span class="tag">سند رسمی • سازمانی</span>
      </div>
      <div class="meta">
        <div class="m-row"><span class="m-label">شماره قرارداد:</span><span class="m-value">${contractNo}</span></div>
        <div class="m-row"><span class="m-label">نسخه قرارداد:</span><span class="m-value">نسخه ${version}</span></div>
        <div class="m-row"><span class="m-label">تاریخ تنظیم:</span><span class="m-value">${jalaliAssigned}</span></div>
        <div class="m-row"><span class="m-label">تاریخ امضا:</span><span class="m-value">${jalaliSigned}</span></div>
        <div class="m-row"><span class="m-label">مدت قرارداد:</span><span class="m-value">${jalaliStart} تا ${jalaliEnd}</span></div>
        <div class="m-row"><span class="m-label">نوع همکاری:</span><span class="m-value">${cooperation}</span></div>
      </div>
    </div>

    <div class="subject">
      <div class="k">قرارداد همکاری ارائه خدمات مراقبت و نگهداری از سالمند</div>
      <div class="s">این قرارداد مطابق با مقررات و آیین‌نامه‌های سازمانی سامانه سالمندیار، بین طرفین منعقد می‌گردد.</div>
    </div>

    <div class="parties">
      <div class="party">
        <div class="role">الف) کارفرما (سرویس سالمندیار)</div>
        <div class="row"><span class="r">نام سازمان:</span><span class="v">سامانه جامع سالمندیار</span></div>
        <div class="row"><span class="r">شناسه رسمی:</span><span class="v">SM-ORG-۱۴۰۴</span></div>
        <div class="row"><span class="r">آدرس دفتر:</span><span class="v">تهران، واحد قراردادها</span></div>
      </div>
      <div class="party">
        <div class="role">ب) طرف مقابل (پرستار / مراقب)</div>
        <div class="row"><span class="r">نام و نام خانوادگی:</span><span class="v">${caregiverFull}</span></div>
        <div class="row"><span class="r">کد ملی:</span><span class="v">${caregiverNational}</span></div>
        <div class="row"><span class="r">شماره تماس:</span><span class="v">${caregiverPhone || "—"}</span></div>
      </div>
    </div>

    <div class="contract-body" id="contract-body">
      ${
        finalHtml && finalHtml.trim().length > 200
          ? // Remove outer <html>/<body> if document was a full page (to embed into letter)
            finalHtml
              .replace(/^[\s\S]*?<body[^>]*>/i, "")
              .replace(/<\/body>[\s\S]*?$/i, "")
              .replace(/<style[\s\S]*?<\/style>/gi, "")
          : `<div class="article">متن قرارداد هنوز تنظیم نشده است. لطفاً برای مشاهده متن کامل قرارداد روی دکمه «بازسازی سند» کلیک کنید یا متن قرارداد را در شابلون‌ها وارد نمایید.</div>`
      }
    </div>

    <div class="signatures">
      <table class="sig-table">
        <tbody>
          <tr>
            <td class="sig-cell">
              <div class="sig-name">کارفرما / مدیرعامل</div>
              <div class="sig-sub">امضا و مهر سرویس سالمندیار</div>
              <div class="sig-placeholder"></div>
              <div class="sig-real-name">سامانه جامع سالمندیار</div>
            </td>
            <td class="sig-cell">
              <div class="sig-name">شاهد قرارداد</div>
              <div class="sig-sub">در صورت حضور (امضا)</div>
              <div class="sig-placeholder"></div>
              <div class="sig-real-name">نام و نام خانوادگی شاهد</div>
            </td>
            <td class="sig-cell">
              <div class="sig-name">طرف مقابل (مراقب)</div>
              <div class="sig-sub">مطابق با اصل احراز هویت</div>
              <div class="sig-placeholder"></div>
              <div class="sig-real-name">${caregiverFull}</div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="footer">
      <div class="meta2">
        ※ سند مذکور، با تایید الکترونیکی طرفین و ثبت هش یکپارچه در سامانه سالمندیار اعتبار رسمی دارد.
        <br />چاپ شده در: <span id="print-date">${formatJalaliDateTime(new Date().toISOString()) || ""}</span>
      </div>
      ${
        hash
          ? `<div class="hash"># Hash: ${hash}</div>`
          : ""
      }
    </div>
  </div>
</body>
</html>`;
    return letter;
  }, [assignment, document, renderedHtml]);

  useEffect(() => {
    setPrintReadyHtml(letterHtml);
  }, [letterHtml]);

  const openPrint = () => {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.open();
    w.document.write(printReadyHtml || letterHtml);
    w.document.close();
    // Delay print for CSS fonts
    const tryPrint = () => {
      try {
        (w as any).focus();
        (w as any).print();
      } catch {}
    };
    setTimeout(tryPrint, 550);
  };

  const printIframe = () => {
    const f = iframeRef.current;
    if (!f) return openPrint();
    try {
      (f.contentWindow as any).focus();
      (f.contentWindow as any).print();
    } catch {
      openPrint();
    }
  };

  return (
    <div className={cn("w-full", "formal-contract-root")}>
      {showToolbar && (
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-xl font-black text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <ShieldCheck className="text-medical-500" size={20} />
              {title ?? "سند رسمی قرارداد همکاری"}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              ظاهر نامه اداری • مناسب پرینت برحسب اندازه A4 • با لوگو و شماره قرارداد و امضاها
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="ghost" size="sm" onClick={onRefresh} disabled={loading || !onRefresh}>
              {loading ? (
                <RefreshCw size={14} className="animate-spin" />
              ) : (
                <RefreshCw size={14} />
              )}
              بازسازی سند
            </Button>
            <Button variant="secondary" size="sm" onClick={openPrint}>
              <ExternalLink size={14} />
              باز در پنجره جدید
            </Button>
            <Button variant="primary" size="sm" onClick={printIframe}>
              <Printer size={14} />
              پرینت قرارداد
            </Button>
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X size={14} />
                بستن
              </Button>
            )}
          </div>
        </div>
      )}

      <div className="rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-900">
        {loading && !printReadyHtml ? (
          <div className="h-[70vh] flex items-center justify-center text-gray-500 gap-2">
            <RefreshCw size={18} className="animate-spin text-medical-500" />
            در حال آماده‌سازی سند رسمی...
          </div>
        ) : (
          <iframe
            ref={iframeRef}
            title="formal-contract-letter"
            srcDoc={printReadyHtml}
            className="w-full h-[80vh] bg-white"
          />
        )}
      </div>

      <style>{`
        @media print {
          body > *:not(.formal-contract-root) { display: none !important; }
          .formal-contract-root > *:not(.rounded-2xl) { display: none !important; }
          .formal-contract-root .rounded-2xl {
            border:none !important; box-shadow:none !important; overflow:visible !important;
          }
        }
      `}</style>
    </div>
  );
}
