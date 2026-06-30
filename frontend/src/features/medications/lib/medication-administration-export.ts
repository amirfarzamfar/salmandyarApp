import { MedicationAdministrationReportRow } from '@/types/medication';

const escapeCsv = (value: unknown) => {
  const raw = value == null ? '' : String(value);
  const escaped = raw.replace(/"/g, '""');
  return `"${escaped}"`;
};

export const downloadMedicationAdministrationCsv = (rows: MedicationAdministrationReportRow[], fileName: string) => {
  const headers = [
    'DoseId',
    'PatientId',
    'PatientName',
    'MedicationId',
    'MedicationName',
    'ScheduledTime',
    'ActualAdministrationAt',
    'Shift',
    'Outcome',
    'Timing',
    'Verification',
    'DelayMinutes',
    'RecordedBy',
    'VerifiedBy',
    'Notes'
  ];

  const lines = [
    headers.map(escapeCsv).join(','),
    ...rows.map((row) =>
      [
        row.doseId,
        row.careRecipientId,
        row.patientName,
        row.medicationId,
        row.medicationName,
        row.scheduledTime,
        row.actualAdministrationAt ?? '',
        row.scheduledShiftSlot,
        row.administrationOutcome,
        row.timingStatus,
        row.verificationStatus,
        row.delayMinutes ?? '',
        row.recordedByName ?? '',
        row.verifiedByName ?? '',
        row.notes ?? ''
      ]
        .map(escapeCsv)
        .join(',')
    )
  ].join('\n');

  const blob = new Blob(['\ufeff', lines], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName.endsWith('.csv') ? fileName : `${fileName}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

export const openMedicationAdministrationPrintView = (title: string, subtitle: string, rows: MedicationAdministrationReportRow[]) => {
  const htmlRows = rows
    .map((row) => {
      const values = [
        row.patientName,
        row.medicationName,
        new Date(row.scheduledTime).toLocaleString('fa-IR'),
        row.actualAdministrationAt ? new Date(row.actualAdministrationAt).toLocaleString('fa-IR') : '-',
        String(row.scheduledShiftSlot),
        String(row.administrationOutcome),
        String(row.timingStatus),
        String(row.verificationStatus),
        row.recordedByName ?? '-',
        row.verifiedByName ?? '-',
        row.delayMinutes ?? '-',
        row.notes ?? '-'
      ];

      return `<tr>${values.map((cell) => `<td>${String(cell).replace(/</g, '&lt;').replace(/>/g, '&gt;')}</td>`).join('')}</tr>`;
    })
    .join('');

  const html = `
  <!doctype html>
  <html lang="fa" dir="rtl">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>${title}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Tahoma, Arial, sans-serif; padding: 24px; color: #111827; }
        h1 { margin: 0 0 6px; font-size: 18px; }
        .subtitle { margin: 0 0 18px; color: #6B7280; font-size: 12px; }
        table { width: 100%; border-collapse: collapse; font-size: 11px; }
        th, td { border: 1px solid #E5E7EB; padding: 8px; vertical-align: top; }
        th { background: #F9FAFB; text-align: right; }
        .muted { color: #6B7280; }
        @media print {
          body { padding: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="no-print" style="display:flex; gap:10px; justify-content:flex-end; margin-bottom:16px;">
        <button onclick="window.print()" style="padding:10px 14px;border-radius:12px;border:1px solid #E5E7EB;background:#111827;color:white;cursor:pointer;">چاپ / PDF</button>
        <button onclick="window.close()" style="padding:10px 14px;border-radius:12px;border:1px solid #E5E7EB;background:#F3F4F6;color:#111827;cursor:pointer;">بستن</button>
      </div>
      <h1>${title}</h1>
      <p class="subtitle">${subtitle}</p>
      <table>
        <thead>
          <tr>
            <th>بیمار</th>
            <th>دارو</th>
            <th>زمان برنامه‌ریزی</th>
            <th>زمان ثبت</th>
            <th>شیفت</th>
            <th>Outcome</th>
            <th>Timing</th>
            <th>Verification</th>
            <th>ثبت‌کننده</th>
            <th>تأییدکننده</th>
            <th>تاخیر (دقیقه)</th>
            <th>یادداشت</th>
          </tr>
        </thead>
        <tbody>
          ${htmlRows}
        </tbody>
      </table>
      <p class="muted" style="margin-top:18px;">این خروجی برای ذخیره به صورت PDF از گزینه Print در مرورگر استفاده می‌کند.</p>
    </body>
  </html>
  `;

  const popup = window.open('', '_blank', 'noopener,noreferrer');
  if (!popup) {
    return;
  }

  popup.document.open();
  popup.document.write(html);
  popup.document.close();
};

