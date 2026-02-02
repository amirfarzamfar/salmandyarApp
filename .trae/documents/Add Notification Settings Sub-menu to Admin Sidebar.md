I will update the dashboard sidebar to include "Notification Settings" as a sub-category under the main "Settings" menu.

### Changes
1.  **Update `Sidebar.tsx`**:
    *   Modify the navigation structure to support nested items (sub-menus).
    *   Locate the "Settings" (تنظیمات) item.
    *   Add a sub-item for "Notification Settings" (تنظیمات پیام) linking to `/dashboard/admin/settings/notifications`.
    *   Implement logic to expand/collapse the "Settings" menu when clicked.

### File to Modify
*   `frontend/src/components/dashboard/Sidebar.tsx`
