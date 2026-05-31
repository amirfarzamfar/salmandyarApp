# Debug Session: backend-startup-error

Status: OPEN

## Symptom
- Backend fails during run/startup.

## Hypotheses
- H1: EF Core migration/database schema is out of sync and startup fails during DbContext initialization.
- H2: A recently added DTO/entity/mapping compiles, but runtime startup fails because the API process still uses stale locked binaries or old output artifacts.
- H3: Configuration required by backend startup is missing or invalid in `appsettings` / environment variables.
- H4: A dependency registration or controller/model binding issue causes application startup failure after recent profile changes.
- H5: Build/start fails before app boot because another running `Salmandyar.API` process locks output files.

## Evidence Log
- Pending reproduction.

## Next Step
- Reproduce startup failure and collect exact terminal/runtime evidence.
