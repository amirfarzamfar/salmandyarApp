# Debug Session: medication-kardex-list
- **Status**: [OPEN]
- **Issue**: A newly created medication can be added from the kardex flow, but it does not appear in medication lists across all three panels.
- **Debug Server**: pending
- **Log File**: .dbg/trae-debug-log-medication-kardex-list.ndjson

## Reproduction Steps
1. Open any panel that allows adding a medication from the kardex flow.
2. Create a new medication successfully.
3. Return to the medication list view in each panel.
4. Observe that the new medication is not shown.

## Hypotheses & Verification
| ID | Hypothesis | Likelihood | Effort | Evidence |
|----|------------|------------|--------|----------|
| A | The create mutation succeeds, but the list query cache is not invalidated/refetched in the three panels. | High | Low | Rejected: logs show `invalidating medication queries after create` and repeated list queries after create. |
| B | The create endpoint persists the medication, but the list endpoints apply a filter/status that excludes newly created records. | High | Medium | Confirmed: medication `Id=4` for `CareRecipientId=3` persisted successfully, then list endpoint was called but never reached the post-query success log; query date filtering was using a local `DateTime` value likely incompatible with PostgreSQL `timestamp with time zone` comparison. |
| C | The kardex wizard posts data successfully, but the schedule endpoint fails to find/produce doses for the selected date. | Medium | Medium | Confirmed: `GetDailySchedule` reached day-boundary computation but never reached `active medications for schedule queried`, indicating the PostgreSQL failure occurred in the active-medications LINQ filter that used `.Date` comparisons. |
| D | The three panels share a common medication hook/service that reads from a stale or wrong endpoint. | High | Low | Confirmed in part: all three panels share the same `useMedications` + `GET /medications/patient/{id}` path, which explains why the same bug appears everywhere. |
| E | The medication is created for a different patient/context id than the list panels are querying. | Medium | Medium | Rejected: create and list both use patient `3`. |

## Log Evidence
- Pre-fix list logs repeatedly show `patientId=3` in `useMedications.ts` and `GetPatientMedications called` in `MedicationsController.cs`.
- Pre-fix create logs show `create medication request succeeded` with `createdMedicationId=4` and `responseCareRecipientId=3`.
- Pre-fix backend logs show `medication persisted` with `Id=4`, `CareRecipientId=3`, and `EndDate=null`.
- Pre-fix list flow never produced the `patient medication list queried` success log from `MedicationService.cs`, indicating the LINQ query failed before returning results.
- Minimal fix changes the list filter to compare `EndDate` against `startOfTodayUtc` instead of comparing `.Date` against an unspecified local date value.
- Pre-fix schedule logs show `GetDailySchedule called` and `daily schedule boundaries computed` for `patientId=3` and `date=2026-06-26`, but never reach `active medications for schedule queried` or `daily schedule doses queried`.
- Minimal fix changes the schedule filter to compare `StartDate/EndDate` against `startOfDayUtc/endOfDayUtc` directly instead of using `.Date` comparisons against local unspecified values.

## Verification Conclusion
- Root cause is in the shared medication list query path used by all three panels, not in the create wizard.
- The create flow works; the list query likely fails on PostgreSQL date comparison because it mixes local `DateTime` values with `timestamp with time zone`.
- Minimal fixes have been applied in `MedicationService.GetPatientMedicationsAsync` and `MedicationService.GetDailyScheduleAsync`.
- Post-fix verification is still pending user confirmation after backend restart and reproduction.
