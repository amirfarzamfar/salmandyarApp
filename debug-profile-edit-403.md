# Debug Session: profile-edit-403
- **Status**: [OPEN]
- **Issue**: Editing the treatment/profile wizard throws a React setState-during-render error and the profile update request returns 403.
- **Debug Server**: pending
- **Log File**: .dbg/trae-debug-log-profile-edit-403.ndjson

## Reproduction Steps
1. Open the profile/treatment editing flow in the frontend.
2. Interact with the wizard until `ProfileWizardSteps` renders the failing path.
3. Observe the React render error and the `PUT /PatientProfile/user/{userId}` request returning 403.

## Hypotheses & Verification
| ID | Hypothesis | Likelihood | Effort | Evidence |
|----|------------|------------|--------|----------|
| A | `ProfileWizardSteps` calls a parent state setter during render, triggering the React error. | High | Low | Pending |
| B | The render-time state mutation causes invalid wizard state, which leads to a bad update request or wrong `userId`. | Medium | Medium | Pending |
| C | The `PUT /PatientProfile/user/{userId}` request is missing valid auth context or role permissions. | High | Low | Pending |
| D | The frontend uses the wrong endpoint for the current actor/profile editing scenario. | Medium | Medium | Pending |
| E | A derived-step/render side effect triggers both the React warning and duplicate/untimely update requests. | Medium | Medium | Pending |

## Log Evidence
- Pending

## Verification Conclusion
- Pending
