namespace Salmandyar.Application.DTOs.Users;

public class UserListDto
{
    public string Id { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string NationalCode { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public List<string> Roles { get; set; } = new();
    public List<string> EffectivePermissions { get; set; } = new();
    public bool IsActive { get; set; }
    public bool EmailConfirmed { get; set; }
    public bool PhoneNumberConfirmed { get; set; }
    public bool IsLocked { get; set; }
    public bool IsOnline { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? LastLoginDate { get; set; }
    public DateTimeOffset? LockoutEnd { get; set; }
}

public class UserDetailDto : UserListDto
{
    public string? AdminNotes { get; set; }
    public string? BanReason { get; set; }
    public string? LastLoginIp { get; set; }
    public bool LockoutEnabled { get; set; }
    public List<string> DirectPermissions { get; set; } = new();
    public List<AuditLogDto> AuditLogs { get; set; } = new();
    public List<UserPatientAssignmentDto> AssignedPatients { get; set; } = new();
}

public class AuditLogDto
{
    public int Id { get; set; }
    public string Action { get; set; } = string.Empty;
    public string? Details { get; set; }
    public string? IpAddress { get; set; }
    public DateTime CreatedAt { get; set; }
    public string PerformedBy { get; set; } = string.Empty;
}

public class UserFilterDto
{
    public string? SearchTerm { get; set; } // Name, Email, Phone, NationalCode
    public string? Role { get; set; }
    public bool? IsActive { get; set; }
    public bool? IsLocked { get; set; }
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
}

public class PaginatedResult<T>
{
    public List<T> Items { get; set; } = new();
    public int TotalCount { get; set; }
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
}

public class ChangeUserStatusDto
{
    public bool IsActive { get; set; }
    public string? BanReason { get; set; }
}

public class UpdateUserRoleDto
{
    public string Role { get; set; } = string.Empty;
}

public class UpdateUserRolesDto
{
    public List<string> Roles { get; set; } = new();
}

public class BulkActionDto
{
    public List<string> UserIds { get; set; } = new();
    public string Action { get; set; } = string.Empty; // Activate, Deactivate
    public string? Reason { get; set; }
}

public class CreateAdminUserDto
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string PhoneNumber { get; set; } = string.Empty;
    public string? NationalCode { get; set; }
    public string Password { get; set; } = string.Empty;
    public List<string> Roles { get; set; } = new();
    public bool IsActive { get; set; } = true;
    public bool EmailConfirmed { get; set; }
    public bool PhoneNumberConfirmed { get; set; }
    public string? AdminNotes { get; set; }
}

public class UpdateAdminUserDto
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string PhoneNumber { get; set; } = string.Empty;
    public string? NationalCode { get; set; }
    public List<string> Roles { get; set; } = new();
    public bool IsActive { get; set; } = true;
    public bool EmailConfirmed { get; set; }
    public bool PhoneNumberConfirmed { get; set; }
    public string? AdminNotes { get; set; }
}

public class AdminResetPasswordDto
{
    public string NewPassword { get; set; } = string.Empty;
}

public class SetUserLockDto
{
    public bool IsLocked { get; set; }
    public DateTimeOffset? LockoutEnd { get; set; }
    public string? Reason { get; set; }
}

public class UpdateUserContactVerificationDto
{
    public bool EmailConfirmed { get; set; }
    public bool PhoneNumberConfirmed { get; set; }
}

public class UpdateUserPermissionsDto
{
    public List<string> Permissions { get; set; } = new();
}

public class UserPatientAssignmentDto
{
    public Guid Id { get; set; }
    public int PatientId { get; set; }
    public string PatientName { get; set; } = string.Empty;
    public int AssignmentType { get; set; }
    public int? ShiftSlot { get; set; }
    public int Status { get; set; }
    public bool IsPrimaryCaregiver { get; set; }
    public DateTimeOffset StartDate { get; set; }
    public DateTimeOffset? EndDate { get; set; }
    public string Notes { get; set; } = string.Empty;
}

public class RoleManagementDto
{
    public string Name { get; set; } = string.Empty;
    public bool IsSystemRole { get; set; }
    public int UserCount { get; set; }
    public List<string> Permissions { get; set; } = new();
}

public class PermissionDefinitionDto
{
    public string Key { get; set; } = string.Empty;
    public string Group { get; set; } = string.Empty;
    public string GroupDisplayName { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
}

public class UpsertRoleDto
{
    public string Name { get; set; } = string.Empty;
    public List<string> Permissions { get; set; } = new();
}

public class RoleCatalogDto
{
    public List<RoleManagementDto> Roles { get; set; } = new();
    public List<PermissionDefinitionDto> AvailablePermissions { get; set; } = new();
}
