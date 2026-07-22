[OPEN] Debug Session: blood-sugar-save-error

## Symptoms
- Saving vital signs (in admin, nurse, and patient panels) fails after adding blood sugar.
- Backend returns: "An error occurred while saving the entity changes. See the inner exception for details."
- Vital signs registration UI (nurse/salmandyar) is not responsive and overflows the page.

## Expected
- Vital signs save succeeds across all panels.
- Vital signs registration UI is responsive and stays within viewport.

## Hypotheses (falsifiable)
1. EF Core DbUpdateException is caused by a missing DB column/table for the new blood sugar field (migration not applied / wrong schema).
2. The new blood sugar field violates a NOT NULL constraint or data type mismatch (e.g., decimal vs int) for existing rows or incoming payload.
3. Enum/string mapping mismatch for blood sugar measurement type (e.g., fasting/random) causes conversion failure on save.
4. Backend validation allows a value range that violates a DB CHECK constraint (or precision/scale constraint).
5. The frontend sends an unexpected shape (e.g., nested object vs scalar) and backend model-binding persists incorrect values.

## Evidence to collect
- Full inner exception message + stack trace from backend when saving vital signs.
- The exact request payload sent from frontend when saving.
- DB schema for the vital sign table/columns related to blood sugar.

## Current status
- Awaiting instrumentation and reproduction logs.

