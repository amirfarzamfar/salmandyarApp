# Debug Session: lab-module-500-svg-error

- **Status**: [OPEN]
- **Session ID**: `lab-module-500-svg-error`
- **Opened**: 2026-09-28
- **User Symptom (verbatim)**:
  - `:5016/api/labs/categories?all=true` → 500 Internal Server Error (repeated)
  - `:5016/api/labs/definitions` → 500 Internal Server Error (repeated)
  - Console: `Error: <path> attribute d: Expected moveto path command ('M' or 'm'), "undefined".` — Recharts SVG render crash
  - Side errors (pre-existing unrelated): `127.0.0.1:7777/event` Connection Refused (NotificationCenter), PWA Banner not shown
  - User also requested: "طبق دسته بندی که گفته بودم آزمایشات رو ایجاد کن" → Ensure lab categories/definitions seeded according to project spec (9 categories + ~37 formulas from LabModelConfiguration HasData)

## 3–5 Falsifiable Hypotheses (Evidence-Required)

| # | Hypothesis | Prediction | Test Point |
|---|-----------|------------|------------|
| H1 | Migration `AddPatientLaboratoryModule` has NOT been applied to the runtime database; tables `LabTestCategories` / `LabTestDefinitions` etc. DO NOT EXIST → SqlException → 500 | `LabsController.GetCategories` throws SqlException with `Invalid object name '...'` | LabsController + DB connection |
| H2 | `ApplicationDbContext` is MISSING required `DbSet<LabTestCategory>`, `DbSet<LabTestDefinition>`, `DbSet<PatientLabReport>`, `DbSet<PatientLabResult>` → InvalidOperationException (Cannot create DbSet) → 500 | EF throws before reaching SQL | `ApplicationDbContext.cs` |
| H3 | `LabService` / `LabsController` has System.Text.Json enum serialization bug (e.g., `LabDataType` / `LabStatus` enum not registered as global string converter) → response serialization fails → 500 | Controller returns 200 with data but ASP.NET fails writing response body (ObjectResult with IEnumerable) | `Program.cs` JSON options + `LabsController.cs` |
| H4 | SVG path error (`d="undefined"`) comes from `LabTrendChart.tsx` Recharts LineChart: points array has at least one row where `x` (performedAt) or `y` (numericValue) is `undefined`/`null` → Line path generation returns "undefined" | `points.some(p => !p.performedAt || !Number.isFinite(p.numericValue))` is true at render time | `LabTrendChart.tsx` points + render |
| H5 | (Controller logic bug) Even when tables exist, `LabsController.GetCategories(all=true)` or `GetDefinitions()` throws NRE (e.g., `labService` not injected / null, `include`/filter on `IsActive` with bad cast, route binding `all` parameter mis-mapped) | `labService` is null in controller constructor, or filter throws | `LabsController.cs` constructor + action |

## Static Discovery (Pre-Instrumentation, Read-Only)

| File | Status |
|------|--------|
| `ApplicationDbContext.cs` (DbSets) | TBD |
| `LabsController.cs` (constructor + `GetCategories` + `GetDefinitions`) | TBD |
| Migrations folder: `AddPatientLaboratoryModule` exists? | TBD |
| `LabModelConfiguration.cs` (HasData seed) | TBD |
| `Program.cs` JSON enum converter | TBD |
| `LabTrendChart.tsx` points type guard | TBD |

## Instrumentation Plan (Next, BEFORE any fix)

1. **Backend**: Wrap `LabsController.GetCategories` and `GetDefinitions` in try/catch, use Debug Server reporting endpoint to send `{endpoint, ex.Message, ex.GetType().Name, ex.StackTrace}`.
2. **Frontend**: In `LabTrendChart.tsx` right before rendering `LineChart`, send `{pointsCount, firstPointKeys, firstPointPerformedAtType, firstPointNumericValue, anyUndefinedPerformedAt, anyInvalidNumericValue}` to Debug Server.
3. Start Debug Server with sessionId `lab-module-500-svg-error` on port.

## Evidence Log

| Source | Timestamp | Event | Conclusion on H? |
|--------|-----------|-------|------------------|
| (empty) | - | - | - |

## Fix Log

| # | File | Change | Hyp Addressed | Pre Post Evidence |
|---|------|--------|---------------|-------------------|
| (empty) | - | - | - | - |

## User Confirmation Gate

- Status: **AWAITING USER CONFIRMATION** (not yet; must reach post-fix compare first)
