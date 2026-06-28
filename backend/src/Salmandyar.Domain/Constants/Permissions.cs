namespace Salmandyar.Domain.Constants;

public static class Permissions
{
    public const string ClaimType = "permission";

    public const string UsersView = "users.view";
    public const string UsersCreate = "users.create";
    public const string UsersEdit = "users.edit";
    public const string UsersDelete = "users.delete";
    public const string UsersManageRoles = "users.manage_roles";
    public const string UsersManagePermissions = "users.manage_permissions";
    public const string UsersResetPassword = "users.reset_password";
    public const string UsersLock = "users.lock";
    public const string UsersAuditView = "users.audit_view";
    public const string UsersManageAssignments = "users.manage_assignments";

    public static IReadOnlyList<string> All { get; } =
    [
        UsersView,
        UsersCreate,
        UsersEdit,
        UsersDelete,
        UsersManageRoles,
        UsersManagePermissions,
        UsersResetPassword,
        UsersLock,
        UsersAuditView,
        UsersManageAssignments
    ];
}
