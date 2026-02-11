using Salmandyar.Application.DTOs.Users;

namespace Salmandyar.Application.Services.Users;

public interface IUserManagementService
{
    Task<PaginatedResult<UserListDto>> GetUsersAsync(UserFilterDto filter);
    Task<UserDetailDto?> GetUserByIdAsync(string userId);
    Task<bool> ChangeUserStatusAsync(string userId, ChangeUserStatusDto dto, string adminId);
    Task<bool> ChangeUserRoleAsync(string userId, UpdateUserRoleDto dto, string adminId);
    Task<bool> ResetPasswordAsync(string userId, string newPassword, string adminId);
    Task<bool> ForceLogoutAsync(string userId, string adminId);
    Task<bool> PerformBulkActionAsync(BulkActionDto dto, string adminId);
    Task<bool> UpdateUserProfileAsync(string userId, UpdateUserProfileDto dto);
}

public interface IAuditLogService
{
    Task LogAsync(string? userId, string action, string entityName, string? entityId, string? details, string? ipAddress);
    Task<List<AuditLogDto>> GetLogsForUserAsync(string userId);
}
