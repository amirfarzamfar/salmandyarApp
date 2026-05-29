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
