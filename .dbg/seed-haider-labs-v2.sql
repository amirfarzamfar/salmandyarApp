-- ================================================================
-- SEED REPORT LABORATORY TESTI — PATIENT (CareRecipient) ID = 5
-- (Haider Haidari — found via SELECT on CareRecipients matching query)
-- Creates: 6 reports × multiple results across dates for Trend chart
-- Tables: "CareRecipients" (patients), "PatientLabReports", "PatientLabResults",
--         "LabTestCategories", "LabTestDefinitions"
-- ================================================================
SET client_encoding = 'UTF8';

DO $$
DECLARE
    _patient_id INT := 5;
    _actor_id INT := 1;

    _rpt_cbc UUID := gen_random_uuid();   -- 2025-09-21 CBC (مهر ۱۴۰۴)
    _rpt_sugar UUID := gen_random_uuid(); -- 2025-09-27 Sugar
    _rpt_kidney UUID := gen_random_uuid();-- 2025-10-07 Kidney
    _rpt_liver UUID := gen_random_uuid(); -- 2025-10-17 Liver
    _rpt_cbc2 UUID := gen_random_uuid();  -- 2025-08-11 CBC Trend (older)
    _rpt_sugar2 UUID := gen_random_uuid();-- 2025-08-23 Sugar Trend older
    _ver UUID;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM "CareRecipients" WHERE "Id" = _patient_id) THEN
        RAISE WARNING 'CareRecipient with Id=% does not exist — SKIPPING LAB SEED.', _patient_id;
        RETURN;
    END IF;

    -- (1) Report 1: CBC (Cat=1) — 2025-09-21 (مهر ۱۴۰۴)
    _ver := gen_random_uuid();
    INSERT INTO "PatientLabReports"
        ("Id", "PatientId", "LabTestCategoryId", "Title", "LaboratoryName",
         "PerformedAt", "FilePath", "FileName", "FileSizeBytes", "FileContentType",
         "ResultNotes", "CreatedById", "CreatedAt", "UpdatedById", "UpdatedAt",
         "IsDeleted", "Version", "ConcurrencyStamp")
    VALUES
        (_rpt_cbc, _patient_id, 1, 'آزمایش CBC — مهر ۱۴۰۴', 'آزمایشگاه سپهر',
         '2025-09-21 08:30:00+03:30'::timestamptz, NULL, NULL, 0, NULL,
         'گزارش اولیه هماتولوژی، بر اساس ناشتایی ۱۰ ساعته. کم‌خونی خفیف در Hb.',
         _actor_id, NOW(), _actor_id, NOW(),
         false, 1, _ver);

    -- (2) Report 2: CBC Older (Cat=1) — 2025-08-11 مرداد
    _ver := gen_random_uuid();
    INSERT INTO "PatientLabReports"
        ("Id", "PatientId", "LabTestCategoryId", "Title", "LaboratoryName",
         "PerformedAt", "FilePath", "FileName", "FileSizeBytes", "FileContentType",
         "ResultNotes", "CreatedById", "CreatedAt", "UpdatedById", "UpdatedAt",
         "IsDeleted", "Version", "ConcurrencyStamp")
    VALUES
        (_rpt_cbc2, _patient_id, 1, 'آزمایش CBC — مرداد ۱۴۰۴ (Trend)', 'آزمایشگاه سپهر',
         '2025-08-11 08:15:00+03:30'::timestamptz, NULL, NULL, 0, NULL,
         'گزارش قبلی جهت مقایسه روند هموگلوبین.',
         _actor_id, NOW(), _actor_id, NOW(),
         false, 1, _ver);

    -- (3) Report 3: Sugar (Cat=2) — 2025-09-27
    _ver := gen_random_uuid();
    INSERT INTO "PatientLabReports"
        ("Id", "PatientId", "LabTestCategoryId", "Title", "LaboratoryName",
         "PerformedAt", "FilePath", "FileName", "FileSizeBytes", "FileContentType",
         "ResultNotes", "CreatedById", "CreatedAt", "UpdatedById", "UpdatedAt",
         "IsDeleted", "Version", "ConcurrencyStamp")
    VALUES
        (_rpt_sugar, _patient_id, 2, 'آزمایش قند خون — مهر ۱۴۰۴', 'آزمایشگاه سپهر',
         '2025-09-27 07:45:00+03:30'::timestamptz, NULL, NULL, 0, NULL,
         'ناشتای ۱۲ ساعت. مصرف متفورمین ۵۰۰mg هر ۱۲ ساعت — قند ناشتا بالا (132mg/dL) و HbA1c 7.2%.',
         _actor_id, NOW(), _actor_id, NOW(),
         false, 1, _ver);

    -- (4) Report 4: Sugar Older (Cat=2) — 2025-08-23 مرداد
    _ver := gen_random_uuid();
    INSERT INTO "PatientLabReports"
        ("Id", "PatientId", "LabTestCategoryId", "Title", "LaboratoryName",
         "PerformedAt", "FilePath", "FileName", "FileSizeBytes", "FileContentType",
         "ResultNotes", "CreatedById", "CreatedAt", "UpdatedById", "UpdatedAt",
         "IsDeleted", "Version", "ConcurrencyStamp")
    VALUES
        (_rpt_sugar2, _patient_id, 2, 'آزمایش قند خون — مرداد ۱۴۰۴ (Trend)', 'آزمایشگاه سپهر',
         '2025-08-23 07:30:00+03:30'::timestamptz, NULL, NULL, 0, NULL,
         'گزارش پیشین جهت مقایسه روند قند ناشتا از ۱۱۲ به ۱۳۲.',
         _actor_id, NOW(), _actor_id, NOW(),
         false, 1, _ver);

    -- (5) Report 5: Kidney (Cat=3) — 2025-10-07 مهر
    _ver := gen_random_uuid();
    INSERT INTO "PatientLabReports"
        ("Id", "PatientId", "LabTestCategoryId", "Title", "LaboratoryName",
         "PerformedAt", "FilePath", "FileName", "FileSizeBytes", "FileContentType",
         "ResultNotes", "CreatedById", "CreatedAt", "UpdatedById", "UpdatedAt",
         "IsDeleted", "Version", "ConcurrencyStamp")
    VALUES
        (_rpt_kidney, _patient_id, 3, 'آزمایش عملکرد کلیه — مهر ۱۴۰۴', 'آزمایشگاه سپهر',
         '2025-10-07 08:00:00+03:30'::timestamptz, NULL, NULL, 0, NULL,
         'بررسی BUN / کراتینین و اسید اوریک — BUN بالا (28) و کراتینین 1.3mg/dL.',
         _actor_id, NOW(), _actor_id, NOW(),
         false, 1, _ver);

    -- (6) Report 6: Liver (Cat=4) — 2025-10-17 مهر
    _ver := gen_random_uuid();
    INSERT INTO "PatientLabReports"
        ("Id", "PatientId", "LabTestCategoryId", "Title", "LaboratoryName",
         "PerformedAt", "FilePath", "FileName", "FileSizeBytes", "FileContentType",
         "ResultNotes", "CreatedById", "CreatedAt", "UpdatedById", "UpdatedAt",
         "IsDeleted", "Version", "ConcurrencyStamp")
    VALUES
        (_rpt_liver, _patient_id, 4, 'آزمایش عملکرد کبد — مهر ۱۴۰۴', 'آزمایشگاه سپهر',
         '2025-10-17 08:20:00+03:30'::timestamptz, NULL, NULL, 0, NULL,
         'آزمایش آنزیم‌های کبد و بیلیروبین — AST=54 ALT=72، رژیم低脂 و سونوگرافی پیشنهاد شده.',
         _actor_id, NOW(), _actor_id, NOW(),
         false, 1, _ver);

    -- =====================================================================
    -- RESULTS
    -- =====================================================================

    -- REPORT 1: CBC Sep 21 (Cat=1 Definition 1..10) Hb LOW 12.4, RBC LOW 4.1
    INSERT INTO "PatientLabResults"
        ("Id", "PatientLabReportId", "LabTestDefinitionId",
         "TextValue", "NumericValue", "Unit",
         "ReferenceMin", "ReferenceMax", "IsAbnormal", "Remarks", "Version", "ConcurrencyStamp")
    VALUES
        (gen_random_uuid(), _rpt_cbc, 1,  NULL,  7.2,  '10^3/uL',  4.0,  11.0, false, NULL, 1, gen_random_uuid()),  -- WBC
        (gen_random_uuid(), _rpt_cbc, 2,  NULL,  4.1,  '10^6/uL',  4.2,  5.8,  true,  'RBC کم‌محور خفیف', 1, gen_random_uuid()),  -- RBC low
        (gen_random_uuid(), _rpt_cbc, 3,  NULL,  12.4, 'g/dL',     13.0, 17.0,  true,  'کم‌خونی خفیف هموگلوبین', 1, gen_random_uuid()), -- Hb
        (gen_random_uuid(), _rpt_cbc, 4,  NULL,  37.5, '%',        38.0, 52.0,  false, NULL, 1, gen_random_uuid()), -- Hct
        (gen_random_uuid(), _rpt_cbc, 5,  NULL,  88.1, 'fL',       80.0, 100.0, false, NULL, 1, gen_random_uuid()), -- MCV
        (gen_random_uuid(), _rpt_cbc, 6,  NULL,  30.2, 'pg',       27.0, 33.0,  false, NULL, 1, gen_random_uuid()), -- MCH
        (gen_random_uuid(), _rpt_cbc, 7,  NULL,  33.8, '%',        32.0, 36.0,  false, NULL, 1, gen_random_uuid()), -- MCHC
        (gen_random_uuid(), _rpt_cbc, 8,  NULL,  245,  '10^3/uL',  150,  400,   false, NULL, 1, gen_random_uuid()), -- PLT
        (gen_random_uuid(), _rpt_cbc, 9,  NULL,  60.2, '%',        40.0, 75.0,  false, NULL, 1, gen_random_uuid()), -- Neutrophil
        (gen_random_uuid(), _rpt_cbc, 10, NULL,  30.1, '%',        20.0, 45.0,  false, NULL, 1, gen_random_uuid()); -- Lymphocyte

    -- REPORT 2: CBC OLDER Aug 11 — Hb 13.2 (higher for Trend)
    INSERT INTO "PatientLabResults"
        ("Id", "PatientLabReportId", "LabTestDefinitionId",
         "TextValue", "NumericValue", "Unit",
         "ReferenceMin", "ReferenceMax", "IsAbnormal", "Remarks", "Version", "ConcurrencyStamp")
    VALUES
        (gen_random_uuid(), _rpt_cbc2, 1,  NULL,  7.6,  '10^3/uL',  4.0,  11.0, false, NULL, 1, gen_random_uuid()),
        (gen_random_uuid(), _rpt_cbc2, 2,  NULL,  4.4,  '10^6/uL',  4.2,  5.8,  false, NULL, 1, gen_random_uuid()),
        (gen_random_uuid(), _rpt_cbc2, 3,  NULL,  13.2, 'g/dL',     13.0, 17.0,  false, NULL, 1, gen_random_uuid()),
        (gen_random_uuid(), _rpt_cbc2, 4,  NULL,  40.1, '%',        38.0, 52.0,  false, NULL, 1, gen_random_uuid()),
        (gen_random_uuid(), _rpt_cbc2, 8,  NULL,  262,  '10^3/uL',  150,  400,   false, NULL, 1, gen_random_uuid()),
        (gen_random_uuid(), _rpt_cbc2, 9,  NULL,  62.0, '%',        40.0, 75.0,  false, NULL, 1, gen_random_uuid()),
        (gen_random_uuid(), _rpt_cbc2, 10, NULL,  28.7, '%',        20.0, 45.0,  false, NULL, 1, gen_random_uuid());

    -- REPORT 3: Sugar Sep 27 (Cat=2 Def 11..13) FBS=132, HbA1c=7.2
    INSERT INTO "PatientLabResults"
        ("Id", "PatientLabReportId", "LabTestDefinitionId",
         "TextValue", "NumericValue", "Unit",
         "ReferenceMin", "ReferenceMax", "IsAbnormal", "Remarks", "Version", "ConcurrencyStamp")
    VALUES
        (gen_random_uuid(), _rpt_sugar, 11, NULL, 132,  'mg/dL', 70,  100,  true,  'FBS بالا — دیابت محدوده', 1, gen_random_uuid()), -- FBS
        (gen_random_uuid(), _rpt_sugar, 12, NULL, 178,  'mg/dL', 80,  140,  true,  'BS تصادفی بالا', 1, gen_random_uuid()), -- BS
        (gen_random_uuid(), _rpt_sugar, 13, NULL, 7.2,  '%',     4.0, 5.6,  true,  'HbA1c بالا — کنترل متوسط', 1, gen_random_uuid()); -- HbA1c

    -- REPORT 4: Sugar OLDER Aug 23 — FBS 112 HbA1c 6.4 (for Trend decline)
    INSERT INTO "PatientLabResults"
        ("Id", "PatientLabReportId", "LabTestDefinitionId",
         "TextValue", "NumericValue", "Unit",
         "ReferenceMin", "ReferenceMax", "IsAbnormal", "Remarks", "Version", "ConcurrencyStamp")
    VALUES
        (gen_random_uuid(), _rpt_sugar2, 11, NULL, 112, 'mg/dL', 70, 100, true, 'پیش‌دیابت FBS (مرداد)', 1, gen_random_uuid()),
        (gen_random_uuid(), _rpt_sugar2, 12, NULL, 154, 'mg/dL', 80, 140, true, NULL, 1, gen_random_uuid()),
        (gen_random_uuid(), _rpt_sugar2, 13, NULL, 6.4, '%',     4.0, 5.6, true, 'HbA1c مرداد بالا', 1, gen_random_uuid());

    -- REPORT 5: Kidney Oct 7 (Cat=3 Def 14..16) BUN 28 Cre 1.3
    INSERT INTO "PatientLabResults"
        ("Id", "PatientLabReportId", "LabTestDefinitionId",
         "TextValue", "NumericValue", "Unit",
         "ReferenceMin", "ReferenceMax", "IsAbnormal", "Remarks", "Version", "ConcurrencyStamp")
    VALUES
        (gen_random_uuid(), _rpt_kidney, 14, NULL, 28,  'mg/dL', 7,  22,  true,  'BUN بالا — هیدراتاسیون توصیه', 1, gen_random_uuid()), -- BUN
        (gen_random_uuid(), _rpt_kidney, 15, NULL, 1.3, 'mg/dL', 0.6, 1.3, false, 'مرز بالای محدوده', 1, gen_random_uuid()), -- Cre
        (gen_random_uuid(), _rpt_kidney, 16, NULL, 6.9, 'mg/dL', 3.5, 7.2, false, NULL, 1, gen_random_uuid()); -- Uric Acid

    -- REPORT 6: Liver Oct 17 (Cat=4 Def 17..21) AST 54, ALT 72
    INSERT INTO "PatientLabResults"
        ("Id", "PatientLabReportId", "LabTestDefinitionId",
         "TextValue", "NumericValue", "Unit",
         "ReferenceMin", "ReferenceMax", "IsAbnormal", "Remarks", "Version", "ConcurrencyStamp")
    VALUES
        (gen_random_uuid(), _rpt_liver, 17, NULL, 54,   'U/L',  8,  40,  true,  'AST بالا — رژیم低脂', 1, gen_random_uuid()), -- AST
        (gen_random_uuid(), _rpt_liver, 18, NULL, 72,   'U/L',  8,  41,  true,  'ALT بالا — NAFLD محتمل', 1, gen_random_uuid()), -- ALT
        (gen_random_uuid(), _rpt_liver, 19, NULL, 98,   'U/L',  35, 104, false, NULL, 1, gen_random_uuid()), -- ALP
        (gen_random_uuid(), _rpt_liver, 20, NULL, 1.1,  'mg/dL', 0.2, 1.2, false, NULL, 1, gen_random_uuid()), -- T Bili
        (gen_random_uuid(), _rpt_liver, 21, NULL, 0.35, 'mg/dL', 0.0, 0.4, false, NULL, 1, gen_random_uuid()); -- D Bili

    RAISE NOTICE 'SUCCESS: Seed lab tests for CareRecipient (%) — 6 reports inserted.', _patient_id;
END $$;
