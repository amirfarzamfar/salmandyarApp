I will implement the Notification Settings module following Clean Architecture principles.

### Backend Implementation

1.  **Domain Layer**
    *   Create `NotificationSettings` entity in `Salmandyar.Domain.Entities`.
    *   It will store SMTP and SMS provider configurations.

2.  **Infrastructure Layer (Persistence)**
    *   Add `DbSet<NotificationSettings>` to `ApplicationDbContext`.
    *   Create a database migration `AddNotificationSettings`.
    *   Seed a default settings record if none exists (handled in the service).

3.  **Application Layer**
    *   Create DTOs: `NotificationSettingsDto` and `UpdateNotificationSettingsDto`.
    *   Define Interface: `INotificationSettingsService` with `GetSettingsAsync` and `UpdateSettingsAsync`.

4.  **Infrastructure Layer (Implementation)**
    *   Implement `NotificationSettingsService`. It will ensure a singleton-like behavior (always fetching the first record or creating default).
    *   **Refactor `LoggerNotificationService`**: Inject `INotificationSettingsService`. Before logging "Email Sent" or "SMS Sent", it will check `settings.EmailEnabled` or `settings.SmsEnabled`. It will also include the configured Provider/Host in the log message to demonstrate usage.

5.  **API Layer**
    *   Create `NotificationSettingsController` with endpoints:
        *   `GET /api/admin/notification-settings`
        *   `PUT /api/admin/notification-settings`

### Frontend Implementation

1.  **Service Integration**
    *   Create `notification-settings.service.ts` to communicate with the API.

2.  **Admin UI**
    *   Create a new page `src/app/dashboard/admin/settings/notifications/page.tsx`.
    *   Implement a comprehensive form using `react-hook-form` and `zod` validation.
    *   The form will have tabs or sections for "Email Settings" and "SMS Settings" with toggle switches to enable/disable them.

This ensures that the notification logic remains decoupled, and the settings are managed dynamically by the admin without code changes.
