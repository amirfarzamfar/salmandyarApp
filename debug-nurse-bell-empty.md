[OPEN]

# Session: nurse-bell-empty

## Symptom
- Nurse/Elderly-care panels: notification bell shows nothing (no list / no updates).
- Medication missed-dose notifications also not visible here.

## Expected
- Bell dropdown/list shows latest notifications and unread indicator updates in real-time.

## Hypotheses
1. Realtime listener is not mounted in nurse/admin layouts, so SignalR messages never reach those pages.
2. Bell UI relies on REST `unreadCount`/`GetUserNotifications` polling, but the refresh event is not wired or request fails (401/403).
3. SignalR connects but does not join `User_{userId}` group (JoinMyGroup not invoked or hub path mismatch), so pushes are sent to a group nobody joined.
4. Backend creates notifications but with wrong `UserId`/recipient selection, so nurse/admin never get rows in `UserNotifications`.
5. Notifications exist in DB but frontend query filters them out (type/severity mismatch) or caching prevents refetch.

## Evidence to Collect
- Frontend: when/where bell component mounts; current unread count; last REST response; SignalR connection state + JoinMyGroup success.
- Backend: CreateNotificationAsync calls (recipient userId, type, severity, referenceId); Hub dispatch target group; GetUserNotifications response size.

## Repro Steps (to fill)
- TBD

