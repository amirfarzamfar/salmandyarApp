# Debug Session: backend-postgres-startup
- **Status**: [OPEN]
- **Issue**: Backend still fails at startup after PostgreSQL was started.
- **Debug Server**: pending
- **Log File**: .dbg/trae-debug-log-backend-postgres-startup.ndjson

## Reproduction Steps
1. Start PostgreSQL locally.
2. Run `dotnet run --project .\backend\src\Salmandyar.API\Salmandyar.API.csproj`.
3. Observe startup failure in database access / migration / background services.

## Hypotheses & Verification
| ID | Hypothesis | Likelihood | Effort | Evidence |
|----|------------|------------|--------|----------|
| A | PostgreSQL is running but credentials or database name are invalid. | High | Low | Rejected: debug log shows `canConnect=true` with configured host/database. |
| B | `MigrateAsync()` fails because schema creation or permissions are wrong. | High | Low | Rejected: debug log shows `database migration completed`. |
| C | Startup migration succeeds but seed or a background service fails immediately on first query. | Medium | Low | Confirmed: first run failed during seed with `DateTime Kind=Unspecified`; after fix, seed completed and background loops succeeded. |
| D | PostgreSQL is listening on a different host binding or instance than `localhost:5432`. | Medium | Low | Rejected: service is running and TCP test to `localhost:5432` succeeded. |
| E | The generated PostgreSQL migration exists, but runtime hits a schema mismatch on first access. | Medium | Medium | Rejected: migrations applied and live queries executed successfully after seed fix. |

## Log Evidence
- Pre-fix: `database connectivity check completed` with `canConnect=true`.
- Pre-fix: `database migration completed`.
- Pre-fix: `startup migration or seed failed` with inner error `Cannot write DateTime with Kind=Unspecified to PostgreSQL type 'timestamp with time zone'`.
- Post-fix: `database seed completed`.
- Post-fix: reminder and medication background loops both started and completed successfully.

## Verification Conclusion
- Root cause was PostgreSQL rejecting seed data that used `DateTime` values with `Kind=Unspecified` in `DbInitializer`.
- Minimal fix changed seeded `DateOfBirth` values to explicit UTC dates.
- Backend starts successfully after the fix and continues running.
