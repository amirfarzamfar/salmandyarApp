-- ================================================================
-- SEED REPORT LABORATORY TESTI — PATIENT ID = 3 (Haider Haidari)
-- Creates: 4 reports × multiple results across dates for Trend chart
-- Backend: ApplicationDbContext
-- Tables used: "PatientLabReports", "PatientLabResults"
-- Also uses Lookups: "LabTestCategories", "LabTestDefinitions"
-- ================================================================

DO $$
DECLARE
    _patient_id INT := 3;
    _actor_id INT := 1;  -- SuperAdmin default

    -- Report 1: CBC (CategoryId=1) — 30 Shahrivar 1404 = 2025-09-21
    _rpt_cbc UUID := gen_random_uuid();
    -- Report 2: FBS/Blood Sugar (CategoryId=2) — 05 Mehr 1404 = 2025-09-27
    _rpt_sugar UUID := gen_random_uuid();
    -- Report 3: Kidney Function (CategoryId=3) — 15 Mehr 1404 = 2025-10-07
    _rpt_kidney UUID := gen_random_uuid();
    -- Report 4: Liver Function (CategoryId=4) — 25 Mehr 1404 = 2025-10-17
    _rpt_liver UUID := gen_random_uuid();
    -- Report 5 (Trend point): OLDER CBC (for LineChart) — 20 Mordad 1404 = 2025-08-11
    _rpt_cbc2 UUID := gen_random_uuid();
    -- Report 6: Blood Sugar OLDER — 01 Shahrivar 1404 = 2025-08-23
    _rpt_sugar2 UUID := gen_random_uuid();

    _ver UUID;
BEGIN
    -- (0) Make sure lookups have IDs from HasData (migration):
    -- CategoryId 1..9, DefinitionIds:
    -- CBC cat=1: 1(WBC), 2(RBC), 3(Hb), 4(Hct), 5(MCV), 6(MCH), 7(MCHC), 8(PLT), 9(Neutrophil), 10(Lymphocyte)
    -- Sugar cat=2: 11(FBS), 12(BS), 13(HbA1c)
    -- Kidney cat=3: 14(BUN), 15(Creatinine), 16(UricAcid)
    -- Liver  cat=4: 17(AST), 18(ALT), 19(ALP), 20(BilirubinTotal), 21(BilirubinDirect)

    -- (1) Patient existence — only run seed if Patient 3 is present:
    IF NOT EXISTS (SELECT 1 FROM "Patients" WHERE "Id" = _patient_id) THEN
        RAISE WARNING 'Patient with Id=3 (Haider Haidari) does not exist — SKIPPING LAB SEED.';
        RETURN;
    END IF;

    -- (2) Insert reports — CreatedById = 1 (SuperAdmin), IsDeleted = false, Version = 1
    -- Helper to set consistent version timestamp:
    _ver := gen_random_uuid();

    -- Report 1: CBC — 2025-09-21
    INSERT INTO "PatientLabReports"
        ("Id", "PatientId", "LabTestCategoryId", "Title", "LaboratoryName",
         "PerformedAt", "FilePath", "FileName", "FileSizeBytes", "FileContentType",
         "ResultNotes", "CreatedById", "CreatedAt", "UpdatedById", "UpdatedAt",
         "IsDeleted", "Version", "ConcurrencyStamp")
    VALUES
        (_rpt_cbc, _patient_id, 1, 'آزمایش CBC — مهر ۱۴۰۴ (اولین)', 'آزمایشگاه سپهر',
         '2025-09-21 08:30:00+03:30'::timestamptz, NULL, NULL, 0, NULL,
         'گزارش اولیه هماتولوژی، بر اساس ناشتایی ۱۰ ساعته.',
         _actor_id, NOW(), _actor_id, NOW(),
         false, 1, _ver);

    _ver := gen_random_uuid();
    INSERT INTO "PatientLabReports"
        ("Id", "PatientId", "LabTestCategoryId", "Title", "LaboratoryName",
         "PerformedAt", "FilePath", "FileName", "FileSizeBytes", "FileContentType",
         "ResultNotes", "CreatedById", "CreatedAt", "UpdatedById", "UpdatedAt",
         "IsDeleted", "Version", "ConcurrencyStamp")
    VALUES
        (_rpt_cbc2, _patient_id, 1, 'آزمایش CBC — مرداد ۱۴۰۴ (Trend)', 'آزمایشگاه سپهر',
         '2025-08-11 08:15:00+03:30'::timestamptz, NULL, NULL, 0, NULL,
         'گزارش قبلی جهت مقایسه.',
         _actor_id, NOW(), _actor_id, NOW(),
         false, 1, _ver);

    _ver := gen_random_uuid();
    INSERT INTO "PatientLabReports"
        ("Id", "PatientId", "LabTestCategoryId", "Title", "LaboratoryName",
         "PerformedAt", "FilePath", "FileName", "FileSizeBytes", "FileContentType",
         "ResultNotes", "CreatedById", "CreatedAt", "UpdatedById", "UpdatedAt",
         "IsDeleted", "Version", "ConcurrencyStamp")
    VALUES
        (_rpt_sugar, _patient_id, 2, 'آزمایش قند خون — مهر ۱۴۰۴', 'آزمایشگاه سپهر',
         '2025-09-27 07:45:00+03:30'::timestamptz, NULL, NULL, 0, NULL,
         'ناشتای ۱۲ ساعت. مصرف دارو: متفورمین ۵۰۰ هر ۱۲ ساعت.',
         _actor_id, NOW(), _actor_id, NOW(),
         false, 1, _ver);

    _ver := gen_random_uuid();
    INSERT INTO "PatientLabReports"
        ("Id", "PatientId", "LabTestCategoryId", "Title", "LaboratoryName",
         "PerformedAt", "FilePath", "FileName", "FileSizeBytes", "FileContentType",
         "ResultNotes", "CreatedById", "CreatedAt", "UpdatedById", "UpdatedAt",
         "IsDeleted", "Version", "ConcurrencyStamp")
    VALUES
        (_rpt_sugar2, _patient_id, 2, 'آزمایش قند خون — مرداد ۱۴۰۴ (Trend)', 'آزمایشگاه سپهر',
         '2025-08-23 07:30:00+03:30'::timestamptz, NULL, NULL, 0, NULL,
         'گزارش پیشین جهت مقایسه روند قند.',
         _actor_id, NOW(), _actor_id, NOW(),
         false, 1, _ver);

    _ver := gen_random_uuid();
    INSERT INTO "PatientLabReports"
        ("Id", "PatientId", "LabTestCategoryId", "Title", "LaboratoryName",
         "PerformedAt", "FilePath", "FileName", "FileSizeBytes", "FileContentType",
         "ResultNotes", "CreatedById", "CreatedAt", "UpdatedById", "UpdatedAt",
         "IsDeleted", "Version", "ConcurrencyStamp")
    VALUES
        (_rpt_kidney, _patient_id, 3, 'آزمایش عملکرد کلیه — مهر ۱۴۰۴', 'آزمایشگاه سپهر',
         '2025-10-07 08:00:00+03:30'::timestamptz, NULL, NULL, 0, NULL,
         'بررسی BUN / کراتینین و اسید اوریک.',
         _actor_id, NOW(), _actor_id, NOW(),
         false, 1, _ver);

    _ver := gen_random_uuid();
    INSERT INTO "PatientLabReports"
        ("Id", "PatientId", "LabTestCategoryId", "Title", "LaboratoryName",
         "PerformedAt", "FilePath", "FileName", "FileSizeBytes", "FileContentType",
         "ResultNotes", "CreatedById", "CreatedAt", "UpdatedById", "UpdatedAt",
         "IsDeleted", "Version", "ConcurrencyStamp")
    VALUES
        (_rpt_liver, _patient_id, 4, 'آزمایش عملکرد کبد — مهر ۱۴۰۴', 'آزمایشگاه سپهر',
         '2025-10-17 08:20:00+03:30'::timestamptz, NULL, NULL, 0, NULL,
         'آزمایش آنزیم‌های کبد و بیلیروبین.',
         _actor_id, NOW(), _actor_id, NOW(),
         false, 1, _ver);

    -- =====================================================================
    -- RESULTS
    -- =====================================================================

    -- -----------------------------
    -- REPORT 1: CBC — Sep 21 (Recent, slightly Hb low normal-range)
    -- -----------------------------
    INSERT INTO "PatientLabResults"
        ("Id", "PatientLabReportId", "LabTestDefinitionId",
         "TextValue", "NumericValue", "Unit",
         "ReferenceMin", "ReferenceMax", "IsAbnormal",
         "Remarks", "Version", "ConcurrencyStamp")
    VALUES
        (gen_random_uuid(), _rpt_cbc, 1,  NULL,  7.2,  '10^3/uL',  4.0,  11.0, false, NULL, 1, gen_random_uuid()), -- WBC
        (gen_random_uuid(), _rpt_cbc, 2,  NULL,  4.1,  '10^6/uL',  4.2,  5.8,  true,  'کمی پایین‌تر از حد', 1, gen_random_uuid()), -- RBC
        (gen_random_uuid(), _rpt_cbc, 3,  NULL,  12.4, 'g/dL',     13.0, 17.0,  true,  'کم‌خونی خفیف', 1, gen_random_uuid()), -- Hb low
        (gen_random_uuid(), _rpt_cbc, 4,  NULL,  37.5, '%',        38.0, 52.0,  false, NULL, 1, gen_random_uuid()), -- Hct
        (gen_random_uuid(), _rpt_cbc, 5,  NULL,  88.1, 'fL',       80.0, 100.0, false, NULL, 1, gen_random_uuid()), -- MCV
        (gen_random_uuid(), _rpt_cbc, 6,  NULL,  30.2, 'pg',       27.0, 33.0,  false, NULL, 1, gen_random_uuid()), -- MCH
        (gen_random_uuid(), _rpt_cbc, 7,  NULL,  33.8, '%',        32.0, 36.0,  false, NULL, 1, gen_random_uuid()), -- MCHC
        (gen_random_uuid(), _rpt_cbc, 8,  NULL,  245,  '10^3/uL',  150,  400,   false, NULL, 1, gen_random_uuid()), -- PLT
        (gen_random_uuid(), _rpt_cbc, 9,  NULL,  60.2, '%',        40.0, 75.0,  false, NULL, 1, gen_random_uuid()), -- Neutrophil
        (gen_random_uuid(), _rpt_cbc, 10, NULL,  30.1, '%',        20.0, 45.0,  false, NULL, 1, gen_random_uuid()); -- Lymphocyte

    -- -----------------------------
    -- REPORT 5 (older CBC): Aug 11 — Hb a bit higher, to show Trend decline
    -- -----------------------------
    INSERT INTO "PatientLabResults"
        ("Id", "PatientLabReportId", "LabTestDefinitionId",
         "TextValue", "NumericValue", "Unit",
         "ReferenceMin", "ReferenceMax", "IsAbnormal",
         "Remarks", "Version", "ConcurrencyStamp")
    VALUES
        (gen_random_uuid(), _rpt_cbc2, 1,  NULL,  7.6,  '10^3/uL',  4.0,  11.0, false, NULL, 1, gen_random_uuid()),
        (gen_random_uuid(), _rpt_cbc2, 2,  NULL,  4.4,  '10^6/uL',  4.2,  5.8,  false, NULL, 1, gen_random_uuid()),
        (gen_random_uuid(), _rpt_cbc2, 3,  NULL,  13.2, 'g/dL',     13.0, 17.0,  false, NULL, 1, gen_random_uuid()), -- Hb = 13.2
        (gen_random_uuid(), _rpt_cbc2, 4,  NULL,  40.1, '%',        38.0, 52.0,  false, NULL, 1, gen_random_uuid()),
        (gen_random_uuid(), _rpt_cbc2, 8,  NULL,  262,  '10^3/uL',  150,  400,   false, NULL, 1, gen_random_uuid()),
        (gen_random_uuid(), _rpt_cbc2, 9,  NULL,  62.0, '%',        40.0, 75.0,  false, NULL, 1, gen_random_uuid()),
        (gen_random_uuid(), _rpt_cbc2, 10, NULL,  28.7, '%',        20.0, 45.0,  false, NULL, 1, gen_random_uuid());

    -- -----------------------------
    -- REPORT 2: Sugar — Sep 27, FBS slight above 126 (diabetic borderline trend with older 112)
    -- -----------------------------
    INSERT INTO "PatientLabResults"
        ("Id", "PatientLabReportId", "LabTestDefinitionId",
         "TextValue", "NumericValue", "Unit",
         "ReferenceMin", "ReferenceMax", "IsAbnormal",
         "Remarks", "Version", "ConcurrencyStamp")
    VALUES
        (gen_random_uuid(), _rpt_sugar, 11, NULL, 132,  'mg/dL', 70,  100,  true,  'قند ناشتا بالا — به‌روزرسانی مصرف متفورمین', 1, gen_random_uuid()), -- FBS > 126
        (gen_random_uuid(), _rpt_sugar, 12, NULL, 178,  'mg/dL', 80,  140,  true,  'تصادفی بالا', 1, gen_random_uuid()), -- BS random
        (gen_random_uuid(), _rpt_sugar, 13, NULL, 7.2,  '%',     4.0, 5.6,  true,  'HbA1c دیابت محدوده — کنترل متوسط', 1, gen_random_uuid()); -- HbA1c

    -- REPORT 6: Older sugar — Aug 23, FBS 112
    INSERT INTO "PatientLabResults"
        ("Id", "PatientLabReportId", "LabTestDefinitionId",
         "TextValue", "NumericValue", "Unit",
         "ReferenceMin", "ReferenceMax", "IsAbnormal",
         "Remarks", "Version", "ConcurrencyStamp")
    VALUES
        (gen_random_uuid(), _rpt_sugar2, 11, NULL, 112, 'mg/dL', 70, 100, true, 'قند ناشتای پیشین (پیش‌دیابت)', 1, gen_random_uuid()),
        (gen_random_uuid(), _rpt_sugar2, 12, NULL, 154, 'mg/dL', 80, 140, true, NULL, 1, gen_random_uuid()),
        (gen_random_uuid(), _rpt_sugar2, 13, NULL, 6.4, '%',     4.0, 5.6, true, 'HbA1c بالا', 1, gen_random_uuid());

    -- -----------------------------
    -- REPORT 3: Kidney — Oct 7, Creatinine slightly up
    -- -----------------------------
    INSERT INTO "PatientLabResults"
        ("Id", "PatientLabReportId", "LabTestDefinitionId",
         "TextValue", "NumericValue", "Unit",
         "ReferenceMin", "ReferenceMax", "IsAbnormal",
         "Remarks", "Version", "ConcurrencyStamp")
    VALUES
        (gen_random_uuid(), _rpt_kidney, 14, NULL, 28,  'mg/dL', 7,  22,  true,  'BUN بالا — هیدراتاسیون بیشتر', 1, gen_random_uuid()), -- BUN
        (gen_random_uuid(), _rpt_kidney, 15, NULL, 1.3, 'mg/dL', 0.6, 1.3, false, 'مرز بالا محدوده مرجع', 1, gen_random_uuid()), -- Creatinine = top of range
        (gen_random_uuid(), _rpt_kidney, 16, NULL, 6.9, 'mg/dL', 3.5, 7.2, false, NULL, 1, gen_random_uuid()); -- Uric acid

    -- -----------------------------
    -- REPORT 4: Liver — Oct 17, ALT/AST slightly elevated (NAFLD suspected)
    -- -----------------------------
    INSERT INTO "PatientLabResults"
        ("Id", "PatientLabReportId", "LabTestDefinitionId",
         "TextValue", "NumericValue", "Unit",
         "ReferenceMin", "ReferenceMax", "IsAbnormal",
         "Remarks", "Version", "ConcurrencyStamp")
    VALUES
        (gen_random_uuid(), _rpt_liver, 17, NULL, 54,  'U/L',  8,  40,  true,  'AST بالا — رژیم低脂 و سونوگرافی', 1, gen_random_uuid()), -- AST
        (gen_random_uuid(), _rpt_liver, 18, NULL, 72,  'U/L',  8,  41,  true,  'ALT بالا — سونوگرافی تایید NAFLD', 1, gen_random_uuid()), -- ALT
        (gen_random_uuid(), _rpt_liver, 19, NULL, 98,  'U/L',  35, 104, false, NULL, 1, gen_random_uuid()), -- ALP
        (gen_random_uuid(), _rpt_liver, 20, NULL, 1.1, 'mg/dL', 0.2, 1.2, false, NULL, 1, gen_random_uuid()), -- Total bilirubin
        (gen_random_uuid(), _rpt_liver, 21, NULL, 0.35,'mg/dL', 0.0, 0.4, false, NULL, 1, gen_random_uuid()); -- Direct bilirubin

    RAISE NOTICE 'SEED LAB TEST — SUCCESS (Patient %) — 6 Reports inserted.', _patient_id;
END $$;
