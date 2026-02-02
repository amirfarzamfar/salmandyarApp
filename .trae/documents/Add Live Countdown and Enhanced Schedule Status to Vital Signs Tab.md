I will add a live countdown timer to the "Vital Signs" tab so the "Time Remaining" status updates automatically every minute. I will also enhance the status display to show the exact scheduled time alongside the countdown.

### Changes
1.  **Live Timer**: Implement a `useEffect` hook with `setInterval` to update the current time state every 60 seconds.
2.  **Enhanced Status Text**: Update the status message to show both the **Countdown** and the **Next Due Time** (e.g., "3 hours and 15 minutes left (Next: 16:00)").

### File to Modify
*   `VitalSignsTab.tsx`: Add timer state and update `getTimeStatus`.
