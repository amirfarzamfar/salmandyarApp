SET client_encoding = 'UTF8';

DO $$
DECLARE
    _patient_id INT := 3;
    _admin_id TEXT := '2d722119-cd99-4a4d-a95c-fde932846ab6';

    _rpt_cbc UUID := gen_random_uuid();   -- 2025-09-21 CBC (مهر ۱۴۰۴)
    _rpt_sugar UUID := gen_random_uuid(); -- 2025-09-27 Sugar
    _rpt_kidney UUID := gen_random_uuid();-- 2025-10-07 Kidney
    _rpt_liver UUID := gen_random_uuid(); -- 2025-10-17 Liver
    _rpt_cbc2 UUID := gen_random_uuid();  -- 2025-08-11 CBC Trend (older)
    _rpt_sugar2 UUID := gen_random_uuid();-- 2025-08-23 Sugar Trend older
    _now timestamptz := NOW();
BEGIN
    IF NOT EXISTS (SELECT 1 FROM "CareRecipients" WHERE "Id" = _patient_id) THEN
        RAISE WARNING 'CareRecipient % وجود ندارد — SKIPPED.', _patient_id;
        RETURN;
    END IF;

    -- =====================================================================
    -- REPORTS
    -- =====================================================================

    INSERT INTO "PatientLabReports"
        ("Id", "PatientId", "CategoryId", "ReportTitle", "LaboratoryName",
         "PerformedAt", "FileUrl", "FileType",
         "Notes", "CreatedByUserId", "CreatedAt", "UpdatedAt",
         "IsDeleted", "Version")
    VALUES
        (_rpt_cbc, _patient_id, 1, 'آزمایش CBC — مهر ۱۴۰۴', 'آزمایشگاه سپهر',
         '2025-09-21 08:30:00+03:30'::timestamptz, NULL, NULL,
         'گزارش اولیه هماتولوژی. کم‌خونی خفیف هموگلوبین 12.4.',
         _admin_id, _now, _now,
         false, gen_random_uuid()),

        (_rpt_cbc2, _patient_id, 1, 'آزمایش CBC — مرداد ۱۴۰۴ (Trend)', 'آزمایشگاه سپهر',
         '2025-08-11 08:15:00+03:30'::timestamptz, NULL, NULL,
         'گزارش قبلی جهت مقایسه روند هموگلوبین (13.2 مرداد vs 12.4 مهر).',
         _admin_id, _now, _now,
         false, gen_random_uuid()),

        (_rpt_sugar, _patient_id, 2, 'آزمایش قند خون — مهر ۱۴۰۴', 'آزمایشگاه سپهر',
         '2025-09-27 07:45:00+03:30'::timestamptz, NULL, NULL,
         'ناشتای ۱۲ ساعت. FBS 132 / HbA1c 7.2% (دیابت محدوده).',
         _admin_id, _now, _now,
         false, gen_random_uuid()),

        (_rpt_sugar2, _patient_id, 2, 'آزمایش قند خون — مرداد ۱۴۰۴ (Trend)', 'آزمایشگاه سپهر',
         '2025-08-23 07:30:00+03:30'::timestamptz, NULL, NULL,
         'گزارش پیشین FBS 112 / HbA1c 6.4% (پیش‌دیابت).',
         _admin_id, _now, _now,
         false, gen_random_uuid()),

        (_rpt_kidney, _patient_id, 3, 'آزمایش عملکرد کلیه — مهر ۱۴۰۴', 'آزمایشگاه سپهر',
         '2025-10-07 08:00:00+03:30'::timestamptz, NULL, NULL,
         'BUN 28 / کراتینین 1.3 (مرز بالا) — هیدراتاسیون.',
         _admin_id, _now, _now,
         false, gen_random_uuid()),

        (_rpt_liver, _patient_id, 4, 'آزمایش عملکرد کبد — مهر ۱۴۰۴', 'آزمایشگاه سپهر',
         '2025-10-17 08:20:00+03:30'::timestamptz, NULL, NULL,
         'AST=54 / ALT=72 بالا — رژیم低脂 و سونوگرافی.',
         _admin_id, _now, _now,
         false, gen_random_uuid());

    -- =====================================================================
    -- RESULTS — DataType = 1 (Numeric)
    -- =====================================================================

    -- REPORT 1: CBC Sep 21
    INSERT INTO "PatientLabResults"
        ("Id", "PatientLabReportId", "LabTestDefinitionId", "Name", "DataType",
         "NumericValue", "Unit", "ReferenceMin", "ReferenceMax", "IsAbnormal", "Notes")
    VALUES
        (gen_random_uuid(), _rpt_cbc, 1,  'WBC',        1,  7.2,  '10^3/uL',  4.0,  11.0, false, NULL),
        (gen_random_uuid(), _rpt_cbc, 2,  'RBC',        1,  4.1,  '10^6/uL',  4.2,  5.8,  true,  'RBC کم‌محور خفیف'),
        (gen_random_uuid(), _rpt_cbc, 3,  'Hb',         1,  12.4, 'g/dL',     13.0, 17.0,  true,  'کم‌خونی خفیف هموگلوبین'),
        (gen_random_uuid(), _rpt_cbc, 4,  'Hct',        1,  37.5, '%',        38.0, 52.0,  false, NULL),
        (gen_random_uuid(), _rpt_cbc, 5,  'MCV',        1,  88.1, 'fL',       80.0, 100.0, false, NULL),
        (gen_random_uuid(), _rpt_cbc, 6,  'MCH',        1,  30.2, 'pg',       27.0, 33.0,  false, NULL),
        (gen_random_uuid(), _rpt_cbc, 7,  'MCHC',       1,  33.8, '%',        32.0, 36.0,  false, NULL),
        (gen_random_uuid(), _rpt_cbc, 8,  'PLT',        1,  245,  '10^3/uL',  150,  400,   false, NULL),
        (gen_random_uuid(), _rpt_cbc, 9,  'Neutrophil', 1,  60.2, '%',        40.0, 75.0,  false, NULL),
        (gen_random_uuid(), _rpt_cbc, 10, 'Lymphocyte', 1,  30.1, '%',        20.0, 45.0,  false, NULL);

    -- REPORT 2: CBC OLDER Aug 11 — Hb 13.2
    INSERT INTO "PatientLabResults"
        ("Id", "PatientLabReportId", "LabTestDefinitionId", "Name", "DataType",
         "NumericValue", "Unit", "ReferenceMin", "ReferenceMax", "IsAbnormal", "Notes")
    VALUES
        (gen_random_uuid(), _rpt_cbc2, 1,  'WBC',        1,  7.6,  '10^3/uL', 4.0,  11.0, false, NULL),
        (gen_random_uuid(), _rpt_cbc2, 2,  'RBC',        1,  4.4,  '10^6/uL', 4.2,  5.8,  false, NULL),
        (gen_random_uuid(), _rpt_cbc2, 3,  'Hb',         1,  13.2, 'g/dL',    13.0, 17.0, false, NULL),
        (gen_random_uuid(), _rpt_cbc2, 4,  'Hct',        1,  40.1, '%',       38.0, 52.0, false, NULL),
        (gen_random_uuid(), _rpt_cbc2, 8,  'PLT',        1,  262,  '10^3/uL', 150,  400,  false, NULL),
        (gen_random_uuid(), _rpt_cbc2, 9,  'Neutrophil', 1,  62.0, '%',       40.0, 75.0, false, NULL),
        (gen_random_uuid(), _rpt_cbc2, 10, 'Lymphocyte', 1,  28.7, '%',       20.0, 45.0, false, NULL);

    -- REPORT 3: Sugar Sep 27 (Cat=2 Def 11..13)
    INSERT INTO "PatientLabResults"
        ("Id", "PatientLabReportId", "LabTestDefinitionId", "Name", "DataType",
         "NumericValue", "Unit", "ReferenceMin", "ReferenceMax", "IsAbnormal", "Notes")
    VALUES
        (gen_random_uuid(), _rpt_sugar, 11, 'FBS',   1, 132,  'mg/dL', 70,  100,  true,  'قند ناشتا بالا (دیابت محدوده)'),
        (gen_random_uuid(), _rpt_sugar, 12, 'BS',    1, 178,  'mg/dL', 80,  140,  true,  'قند تصادفی بالا'),
        (gen_random_uuid(), _rpt_sugar, 13, 'HbA1c', 1, 7.2,  '%',     4.0, 5.6,  true,  'HbA1c بالا (کنترل متوسط)');

    -- REPORT 4: Sugar OLDER (Aug 23) — FBS 112 HbA1c 6.4
    INSERT INTO "PatientLabResults"
        ("Id", "PatientLabReportId", "LabTestDefinitionId", "Name", "DataType",
         "NumericValue", "Unit", "ReferenceMin", "ReferenceMax", "IsAbnormal", "Notes")
    VALUES
        (gen_random_uuid(), _rpt_sugar2, 11, 'FBS',   1, 112, 'mg/dL', 70, 100, true, 'پیش‌دیابت مرداد'),
        (gen_random_uuid(), _rpt_sugar2, 12, 'BS',    1, 154, 'mg/dL', 80, 140, true, NULL),
        (gen_random_uuid(), _rpt_sugar2, 13, 'HbA1c', 1, 6.4, '%',     4.0, 5.6, true, 'HbA1c بالا (پیش‌دیابت مرداد');

    -- REPORT 5: Kidney Oct 7 (Cat=3 Def 14..16) BUN 28 Cre 1.3
    INSERT INTO "PatientLabResults"
        ("Id", "PatientLabReportId", "LabTestDefinitionId", "Name", "DataType",
         "NumericValue", "Unit", "ReferenceMin", "ReferenceMax", "IsAbnormal", "Notes")
    VALUES
        (gen_random_uuid(), _rpt_kidney, 14, 'BUN',        1, 28,  'mg/dL', 7,   22,  true,  'BUN بالا — هیدراتاسیون توصیه'),
        (gen_random_uuid(), _rpt_kidney, 15, 'Creatinine', 1, 1.3, 'mg/dL', 0.6, 1.3, false, 'مرز بالای محدوده'),
        (gen_random_uuid(), _rpt_kidney, 16, 'Uric Acid',  1, 6.9, 'mg/dL', 3.5, 7.2, false, NULL);

    -- REPORT 6: Liver Oct 17 (Cat=4 Def 17..21) AST 54 ALT 72
    INSERT INTO "PatientLabResults"
        ("Id", "PatientLabReportId", "LabTestDefinitionId", "Name", "DataType",
         "NumericValue", "Unit", "ReferenceMin", "ReferenceMax", "IsAbnormal", "Notes")
    VALUES
        (gen_random_uuid(), _rpt_liver, 17, 'AST',              1, 54,   'U/L',   8,   40,  true,  'AST بالا — رژیم低脂'),
        (gen_random_uuid(), _rpt_liver, 18, 'ALT',              1, 72,   'U/L',   8,   41,  true,  'ALT بالا — NAFLD محتمل'),
        (gen_random_uuid(), _rpt_liver, 19, 'ALP',              1, 98,   'U/L',   35,  104, false, NULL),
        (gen_random_uuid(), _rpt_liver, 20, 'Bilirubin Total',  1, 1.1,  'mg/dL', 0.2, 1.2, false, NULL),
        (gen_random_uuid(), _rpt_liver, 21, 'Bilirubin Direct', 1, 0.35, 'mg/dL', 0.0, 0.4, false, NULL);

    RAISE NOTICE 'SEED SUCCESS: Patient=%. 6 reports created for Haider Haidari (PatientId=%).', _patient_id, _patient_id;
END $$;
