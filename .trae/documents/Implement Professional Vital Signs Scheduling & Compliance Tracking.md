I will enhance the Vital Signs module to implement a professional "Drift-Free" scheduling system with alerts for both nurses and managers.

### 1. Drift-Free Scheduling Logic

Instead of simply adding the interval to the *last* measurement (which causes the schedule to drift if a nurse is late), I will implement an **Anchor-Based Schedule**:

* **Anchor Point**: The schedule will be anchored to the `manualResetTime` (set when Care Level changes) or the first measurement of the sequence.

* **Calculation**: `Next Due = Anchor + (N * Interval)`.

  * *Example*: If Care Level is q4h (4 hours) starting at 08:00.

  * Schedule: 08:00, 12:00, 16:00, 20:00.

  * Even if the 12:00 check is done at 12:30, the next check remains **16:00** (not 16:30).

### 2. Nurse Alerts (Form & Dashboard)

* **Dashboard**: Display a prominent "Next Scheduled Time" with a countdown.

* **Form Validation**:

  * When opening the form, pass the `Expected Time`.

  * If the entered `measuredAt` time deviates significantly (e.g., >30 mins) from the schedule, show a **Clinical Warning**: "This measurement is late according to the schedule."

### 3. Manager Dashboard (History Table)

* **Interval Analysis**: Add a new column "Time Since Last" to the history table.

* **Compliance Badges**:

  * **On Time (Green)**: Recorded within ±30 mins of the interval.

  * **Late (Red)**: Recorded >30 mins after the interval.

  * **Early (Yellow)**: Recorded significantly early.

* This allows the manager to instantly verify if care protocols are being followed, independent of data entry delays.

### Files to Modify

* `VitalSignsTab.tsx`: Implement anchor logic and table analysis.

* `VitalSignForm.tsx`: Add schedule deviation warnings.

