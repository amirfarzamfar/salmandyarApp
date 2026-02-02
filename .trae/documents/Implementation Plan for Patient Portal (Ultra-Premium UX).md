I have updated the implementation plan to include the Premium UX Enhancements requested.

### 1. Project Structure & Routing
- **New Route Group**: Create `src/app/portal` to isolate the patient experience.
- **Dedicated Layout**: `src/app/portal/layout.tsx` with "Calm" theme, including **Subtle Branding** footer and **Trust Indicators**.
- **Mock Data**: Create `src/services/portal-mock.ts` for Medications, Family Contacts, and **Notification Previews**.

### 2. Design System Implementation (Calm & Medical)
Create `src/components/portal/ui` with **WCAG AA Accessibility** focus:
- **Theme**: "Medical Calm" palette with **Dark Mode** support.
- **PortalCard**: "Glassmorphism" cards with soft shadows (24px rounded).
- **PortalButton**: Large touch targets (min 48px) with focus rings for accessibility.
- **EmptyState**: Reassuring components with calm illustrations for zero-data states.
- **PrivacyBadge**: Visual indicator of data security.

### 3. Key Feature Components
- **SmartHeader**: Patient status with **Human-readable Timestamps** (e.g., "Checked 5 mins ago").
- **HealthSnapshot**: Vitals with minimal charts.
- **MedicationTimeline**: Scrollable timeline with **Notification UI Preview** (demo toasts).
- **CarePlanCards**: Service cards with clear status indicators.
- **NursingReportFeed**: Read-only notes.
- **QuickConnect**: "Call Nurse" action bar.

### 4. Advanced UX & Modes
- **Elder Mode**: High contrast, larger fonts (`text-lg` base), simplified layout.
- **Family Awareness Mode**: Permission-based view toggling detailed medical data.
- **Emotional Copywriting**: Use "You are doing great" instead of "Status: OK".

### 5. Implementation Steps
1.  **Setup**: Configure `portal` routes, Tailwind theme, and Layout.
2.  **Base UI**: Build `PortalCard`, `PortalButton`, `EmptyState`, and accessible primitives.
3.  **Features**: Implement Header, Vitals (w/ charts), Meds, and Notification demos.
4.  **Logic**: Connect real data (Patient, Vitals) + Mock data, implement "Human Time" helpers.
5.  **Refinement**: Add `framer-motion` animations, Elder/Family mode toggles, and ARIA labels.
