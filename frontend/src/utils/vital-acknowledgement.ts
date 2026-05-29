"use client";

export function normalizePatientAcknowledgementNote(note?: string | null) {
  if (!note) {
    return "";
  }

  return note
    .replace(/^تایید بیمار\s*\(آزمایشی\)\s*:\s*/u, "")
    .replace(/^تایید بیمار\s*:\s*/u, "")
    .trim();
}

export function getVitalAcknowledgementErrorMessage(error: unknown) {
  const response = (error as {
    response?: {
      status?: number;
      data?: { error?: string; title?: string };
    };
  })?.response;

  const serverMessage = response?.data?.error || response?.data?.title;
  if (serverMessage) {
    return serverMessage;
  }

  if (response?.status === 404) {
    return "مسیر تایید مشاهده در بک‌اند پیدا نشد. احتمالاً سرویس بک‌اند هنوز ری‌استارت نشده است.";
  }

  if (response?.status === 403) {
    return "شما دسترسی لازم برای ثبت این تایید را ندارید.";
  }

  if (response?.status === 500) {
    return "ذخیره تایید مشاهده در سرور انجام نشد. لطفاً بک‌اند را ری‌استارت کنید و از اعمال مایگریشن مطمئن شوید.";
  }

  return "ثبت تایید مشاهده انجام نشد.";
}
