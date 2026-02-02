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
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? LastLoginDate { get; set; }
}

public class UserDetailDto : UserListDto
{
    public string? AdminNotes { get; set; }
    public string? BanReason { get; set; }
    public string? LastLoginIp { get; set; }
    public bool LockoutEnabled { get; set; }
    public DateTimeOffset? LockoutEnd { get; set; }
    public List<AuditLogDto> AuditLogs { get; set; } = new();
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

public class BulkActionDto
{
    public List<string> UserIds { get; set; } = new();
    public string Action { get; set; } = string.Empty; // Activate, Deactivate
    public string? Reason { get; set; }
}
