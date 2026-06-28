using Salmandyar.Application.DTOs.Users;

namespace Salmandyar.Application.Services.Users;

public interface IUserManagementService
{
    Task<PaginatedResult<UserListDto>> GetUsersAsync(UserFilterDto filter);
    Task<UserDetailDto?> GetUserByIdAsync(string userId);
    Task<UserDetailDto> CreateUserAsync(CreateAdminUserDto dto, string adminId);
    Task<UserDetailDto> UpdateUserAsync(string userId, UpdateAdminUserDto dto, string adminId);
    Task DeleteUserAsync(string userId, string adminId);
    Task<bool> ChangeUserStatusAsync(string userId, ChangeUserStatusDto dto, string adminId);
    Task<bool> ChangeUserRoleAsync(string userId, UpdateUserRoleDto dto, string adminId);
    Task<bool> ChangeUserRolesAsync(string userId, UpdateUserRolesDto dto, string adminId);
    Task<bool> ResetPasswordAsync(string userId, string newPassword, string adminId);
    Task<bool> ForceLogoutAsync(string userId, string adminId);
    Task<bool> SetUserLockAsync(string userId, SetUserLockDto dto, string adminId);
    Task<bool> UpdateUserContactVerificationAsync(string userId, UpdateUserContactVerificationDto dto, string adminId);
    Task<RoleCatalogDto> GetRoleCatalogAsync();
    Task<RoleManagementDto> UpsertRoleAsync(string? currentRoleName, UpsertRoleDto dto, string adminId);
    Task DeleteRoleAsync(string roleName, string adminId);
    Task<bool> PerformBulkActionAsync(BulkActionDto dto, string adminId);
    Task<bool> UpdateUserProfileAsync(string userId, UpdateUserProfileDto dto);
    Task RecordSuccessfulLoginAsync(string userId, string? ipAddress);
}

public interface IAuditLogService
{
    Task LogAsync(string? userId, string action, string entityName, string? entityId, string? details, string? ipAddress);
    Task<List<AuditLogDto>> GetLogsForUserAsync(string userId);
}

public interface IUserPresenceTracker
{
    void MarkOnline(string userId, string connectionId);
    void MarkOffline(string connectionId);
    bool IsOnline(string userId);
}
