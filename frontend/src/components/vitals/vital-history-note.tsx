"use client";

import { VitalSignAlert } from "@/types/patient";
import { cn } from "@/lib/utils";
import { getVitalDisplayStatus, getVitalStatusMeta } from "@/utils/vital-alerts";
import { normalizePatientAcknowledgementNote } from "@/utils/vital-acknowledgement";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

interface VitalHistoryNoteProps {
  alerts: VitalSignAlert[];
  patientAcknowledgementNote?: string | null;
  patientAcknowledgedAt?: string | null;
  patientAcknowledgedByName?: string | null;
  className?: string;
}

export function VitalHistoryNote({
  alerts,
  patientAcknowledgementNote,
  patientAcknowledgedAt,
  patientAcknowledgedByName,
  className,
}: VitalHistoryNoteProps) {
  if (alerts.length === 0 && !patientAcknowledgementNote) {
    return null;
  }

  const statusMeta = getVitalStatusMeta(getVitalDisplayStatus(alerts));
  const normalizedAcknowledgementNote = normalizePatientAcknowledgementNote(patientAcknowledgementNote);

  return (
    <div className={cn("mt-3 rounded-xl border p-3 text-xs", statusMeta.cardClassName, className)}>
      {alerts.length > 0 && (
        <div className="flex items-start gap-2">
          <AlertTriangle className={cn("mt-0.5 h-4 w-4 shrink-0", statusMeta.accentClassName)} />
          <div className="space-y-1">
            <div className="font-bold text-gray-900">
              هشدار این ثبت: {statusMeta.label}
            </div>
            <div className="text-gray-700">
              {alerts.map((alert) => alert.message).join("، ")}
            </div>
          </div>
        </div>
      )}

      {normalizedAcknowledgementNote && (
        <div className={cn(alerts.length > 0 ? "mt-3 border-t border-black/5 pt-3" : "", "flex items-start gap-2")}>
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
          <div className="space-y-1">
            <div className="font-bold text-gray-900">تایید بیمار یا همراه بیمار</div>
            <div className="text-gray-700">{normalizedAcknowledgementNote}</div>
            {(patientAcknowledgedByName || patientAcknowledgedAt) && (
              <div className="text-[11px] text-gray-500">
                {patientAcknowledgedByName ? `ثبت توسط ${patientAcknowledgedByName}` : "ثبت تایید مشاهده"}
                {patientAcknowledgedAt
                  ? ` در ${new Date(patientAcknowledgedAt).toLocaleString("fa-IR")}`
                  : ""}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
