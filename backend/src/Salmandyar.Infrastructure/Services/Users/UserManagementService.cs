using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Salmandyar.Application.DTOs.Users;
using Salmandyar.Application.Services.Patients;
using Salmandyar.Application.Services.Users;
using Salmandyar.Domain.Constants;
using Salmandyar.Domain.Entities;
using Salmandyar.Domain.Enums;
using Salmandyar.Infrastructure.Persistence;

namespace Salmandyar.Infrastructure.Services.Users;

public class AuditLogService : IAuditLogService
{
    private readonly ApplicationDbContext _context;

    public AuditLogService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task LogAsync(string? userId, string action, string entityName, string? entityId, string? details, string? ipAddress)
    {
        try
        {
            _context.AuditLogs.Add(new AuditLog
            {
                UserId = userId,
                Action = action,
                EntityName = entityName,
                EntityId = entityId,
                Details = details,
                IpAddress = ipAddress,
                CreatedAt = DateTime.UtcNow
            });

            await _context.SaveChangesAsync();
        }
        catch
        {
            // Audit failures must never break business flows.
        }
    }

    public async Task<List<AuditLogDto>> GetLogsForUserAsync(string userId)
    {
        var actorNames = await _context.Users
            .AsNoTracking()
            .Select(x => new
            {
                x.Id,
                FullName = $"{x.FirstName} {x.LastName}".Trim()
            })
            .ToDictionaryAsync(x => x.Id, x => string.IsNullOrWhiteSpace(x.FullName) ? x.Id : x.FullName);

        var logs = await _context.AuditLogs
            .AsNoTracking()
            .Where(x => x.EntityId == userId && x.EntityName == "User")
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync();

        return logs.Select(x => new AuditLogDto
        {
            Id = x.Id,
            Action = x.Action,
            Details = x.Details,
            IpAddress = x.IpAddress,
            CreatedAt = x.CreatedAt,
            PerformedBy = x.UserId != null && actorNames.TryGetValue(x.UserId, out var name) ? name : "نامشخص"
        }).ToList();
    }
}

public class UserManagementService : IUserManagementService
{
    private static readonly HashSet<string> SystemRoles = new(
    [
        Roles.SuperAdmin,
        Roles.Admin,
        Roles.Manager,
        Roles.Supervisor,
        Roles.Nurse,
        Roles.AssistantNurse,
        Roles.Physiotherapist,
        Roles.ElderlyCareAssistant,
        Roles.Elderly,
        Roles.Patient,
        Roles.PatientFamily
    ], StringComparer.OrdinalIgnoreCase);

    private readonly UserManager<User> _userManager;
    private readonly RoleManager<IdentityRole> _roleManager;
    private readonly IAuditLogService _auditLogService;
    private readonly ApplicationDbContext _context;
    private readonly IPatientService _patientService;
    private readonly IUserPresenceTracker _presenceTracker;

    public UserManagementService(
        UserManager<User> userManager,
        RoleManager<IdentityRole> roleManager,
        IAuditLogService auditLogService,
        ApplicationDbContext context,
        IPatientService patientService,
        IUserPresenceTracker presenceTracker)
    {
        _userManager = userManager;
        _roleManager = roleManager;
        _auditLogService = auditLogService;
        _context = context;
        _patientService = patientService;
        _presenceTracker = presenceTracker;
    }

    public async Task<PaginatedResult<UserListDto>> GetUsersAsync(UserFilterDto filter)
    {
        var pageNumber = filter.PageNumber <= 0 ? 1 : filter.PageNumber;
        var pageSize = Math.Clamp(filter.PageSize <= 0 ? 10 : filter.PageSize, 1, 100);
        var now = DateTimeOffset.UtcNow;
        IQueryable<User> query = _userManager.Users.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(filter.SearchTerm))
        {
            var term = filter.SearchTerm.Trim();
            query = query.Where(u =>
                u.FirstName.Contains(term) ||
                u.LastName.Contains(term) ||
                (u.Email != null && u.Email.Contains(term)) ||
                (u.UserName != null && u.UserName.Contains(term)) ||
                (u.PhoneNumber != null && u.PhoneNumber.Contains(term)) ||
                (u.NationalCode != null && u.NationalCode.Contains(term)));
        }

        if (filter.IsActive.HasValue)
        {
            query = query.Where(u => u.IsActive == filter.IsActive.Value);
        }

        if (filter.IsLocked.HasValue)
        {
            query = filter.IsLocked.Value
                ? query.Where(u => u.LockoutEnd != null && u.LockoutEnd > now)
                : query.Where(u => u.LockoutEnd == null || u.LockoutEnd <= now);
        }

        if (!string.IsNullOrWhiteSpace(filter.Role))
        {
            var userIdsInRole = await _userManager.GetUsersInRoleAsync(filter.Role.Trim());
            var selectedIds = userIdsInRole.Select(x => x.Id).ToList();
            query = query.Where(u => selectedIds.Contains(u.Id));
        }

        var totalCount = await query.CountAsync();
        var items = await query
            .OrderByDescending(u => u.CreatedAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var userIds = items.Select(x => x.Id).ToList();
        var rolesByUserId = await GetRolesByUserIdsAsync(userIds);
        var permissionsByRole = await GetPermissionsByRoleAsync(rolesByUserId.Values.SelectMany(x => x).Distinct(StringComparer.OrdinalIgnoreCase));
        var directPermissionsByUserId = await GetDirectPermissionsByUserIdsAsync(userIds);

        return new PaginatedResult<UserListDto>
        {
            Items = items.Select(user => MapListDto(
                user,
                rolesByUserId.TryGetValue(user.Id, out var roles) ? roles : new List<string>(),
                permissionsByRole,
                directPermissionsByUserId.TryGetValue(user.Id, out var directPermissions) ? directPermissions : new List<string>())).ToList(),
            TotalCount = totalCount,
            PageNumber = pageNumber,
            PageSize = pageSize
        };
    }

    public async Task<UserDetailDto?> GetUserByIdAsync(string userId)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
        {
            return null;
        }

        var roles = (await _userManager.GetRolesAsync(user)).Distinct(StringComparer.OrdinalIgnoreCase).OrderBy(x => x).ToList();
        var permissionsByRole = await GetPermissionsByRoleAsync(roles);
        var directPermissions = await GetDirectPermissionsAsync(user);
        var auditLogs = await _auditLogService.GetLogsForUserAsync(userId);
        var assignedPatients = await GetAssignedPatientsAsync(userId);

        return MapDetailDto(user, roles, permissionsByRole, directPermissions, auditLogs, assignedPatients);
    }

    public async Task<UserDetailDto> CreateUserAsync(CreateAdminUserDto dto, string adminId)
    {
        var roles = NormalizeRoles(dto.Roles);
        if (roles.Count == 0)
        {
            throw new InvalidOperationException("حداقل یک نقش برای کاربر الزامی است.");
        }

        await EnsureRolesExistAsync(roles);
        await EnsureUniqueContactAsync(dto.Email, dto.PhoneNumber, null);

        var user = new User
        {
            UserName = dto.PhoneNumber.Trim(),
            Email = dto.Email?.Trim(),
            PhoneNumber = dto.PhoneNumber.Trim(),
            FirstName = dto.FirstName.Trim(),
            LastName = dto.LastName.Trim(),
            NationalCode = dto.NationalCode?.Trim(),
            AdminNotes = dto.AdminNotes?.Trim(),
            IsActive = dto.IsActive,
            EmailConfirmed = dto.EmailConfirmed,
            PhoneNumberConfirmed = dto.PhoneNumberConfirmed,
            LockoutEnabled = true
        };

        var createResult = await _userManager.CreateAsync(user, dto.Password);
        EnsureIdentitySucceeded(createResult, "ایجاد کاربر");

        var addRolesResult = await _userManager.AddToRolesAsync(user, roles);
        EnsureIdentitySucceeded(addRolesResult, "تخصیص نقش به کاربر");

        if (!dto.IsActive)
        {
            user.BanReason = "کاربر هنگام ایجاد غیرفعال ثبت شده است.";
            await _userManager.SetLockoutEndDateAsync(user, DateTimeOffset.MaxValue);
        }

        var updateResult = await _userManager.UpdateAsync(user);
        EnsureIdentitySucceeded(updateResult, "ذخیره اطلاعات کاربر");

        await EnsurePatientRecordForRolesAsync(user, roles);
        await _auditLogService.LogAsync(adminId, "CreateUser", "User", user.Id, $"کاربر '{user.FirstName} {user.LastName}'. نقش‌ها: {string.Join(", ", roles)}", null);

        return await GetUserByIdAsync(user.Id) ?? throw new InvalidOperationException("دریافت کاربر ایجادشده ممکن نشد.");
    }

    public async Task<UserDetailDto> UpdateUserAsync(string userId, UpdateAdminUserDto dto, string adminId)
    {
        var user = await _userManager.FindByIdAsync(userId) ?? throw new KeyNotFoundException("کاربر یافت نشد.");
        var normalizedRoles = NormalizeRoles(dto.Roles);
        if (normalizedRoles.Count == 0)
        {
            throw new InvalidOperationException("حداقل یک نقش برای کاربر الزامی است.");
        }

        await EnsureRolesExistAsync(normalizedRoles);
        await EnsureUniqueContactAsync(dto.Email, dto.PhoneNumber, userId);

        var previousRoles = (await _userManager.GetRolesAsync(user)).ToList();
        var previousActiveState = user.IsActive;

        user.FirstName = dto.FirstName.Trim();
        user.LastName = dto.LastName.Trim();
        user.Email = string.IsNullOrWhiteSpace(dto.Email) ? null : dto.Email.Trim();
        user.PhoneNumber = dto.PhoneNumber.Trim();
        user.UserName = dto.PhoneNumber.Trim();
        user.NationalCode = dto.NationalCode?.Trim();
        user.AdminNotes = dto.AdminNotes?.Trim();
        user.EmailConfirmed = dto.EmailConfirmed;
        user.PhoneNumberConfirmed = dto.PhoneNumberConfirmed;
        user.IsActive = dto.IsActive;
        user.BanReason = dto.IsActive ? null : (user.BanReason ?? "حساب کاربری توسط ادمین غیرفعال شده است.");

        var updateResult = await _userManager.UpdateAsync(user);
        EnsureIdentitySucceeded(updateResult, "بروزرسانی کاربر");

        await SyncRolesAsync(user, normalizedRoles);
        await EnsurePatientRecordForRolesAsync(user, normalizedRoles);

        if (!dto.IsActive)
        {
            await _userManager.SetLockoutEndDateAsync(user, DateTimeOffset.MaxValue);
            await _userManager.UpdateSecurityStampAsync(user);
        }
        else if (!previousActiveState)
        {
            await _userManager.SetLockoutEndDateAsync(user, null);
        }

        await _auditLogService.LogAsync(
            adminId,
            "UpdateUser",
            "User",
            userId,
            $"ویرایش کاربر. نقش‌های قبلی: {string.Join(", ", previousRoles)} | نقش‌های جدید: {string.Join(", ", normalizedRoles)}",
            null);

        return await GetUserByIdAsync(userId) ?? throw new InvalidOperationException("بازیابی اطلاعات کاربر ممکن نشد.");
    }

    public async Task DeleteUserAsync(string userId, string adminId)
    {
        var user = await _userManager.FindByIdAsync(userId) ?? throw new KeyNotFoundException("کاربر یافت نشد.");

        var hasLinkedPatient = await _context.CareRecipients.AnyAsync(x => x.UserId == userId);
        var hasLinkedAssignments = await _context.CareAssignments.AnyAsync(x => x.CaregiverId == userId);
        if (hasLinkedPatient || hasLinkedAssignments)
        {
            throw new InvalidOperationException("این کاربر به پرونده بیمار یا تخصیص مراقبتی متصل است و حذف مستقیم آن مجاز نیست. ابتدا ارتباط‌ها را مدیریت کنید.");
        }

        var result = await _userManager.DeleteAsync(user);
        EnsureIdentitySucceeded(result, "حذف کاربر");

        await _auditLogService.LogAsync(adminId, "DeleteUser", "User", userId, $"حذف کاربر '{user.FirstName} {user.LastName}'", null);
    }

    public async Task<bool> ChangeUserStatusAsync(string userId, ChangeUserStatusDto dto, string adminId)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
        {
            return false;
        }

        var oldStatus = user.IsActive;
        user.IsActive = dto.IsActive;
        user.BanReason = dto.IsActive ? null : dto.BanReason?.Trim();

        var updateResult = await _userManager.UpdateAsync(user);
        EnsureIdentitySucceeded(updateResult, "تغییر وضعیت کاربر");

        if (!dto.IsActive)
        {
            await _userManager.SetLockoutEndDateAsync(user, DateTimeOffset.MaxValue);
            await _userManager.UpdateSecurityStampAsync(user);
        }
        else
        {
            await _userManager.SetLockoutEndDateAsync(user, null);
        }

        await _auditLogService.LogAsync(adminId, "ChangeStatus", "User", userId, $"وضعیت کاربر از {oldStatus} به {dto.IsActive} تغییر کرد. دلیل: {dto.BanReason}", null);
        return true;
    }

    public Task<bool> ChangeUserRoleAsync(string userId, UpdateUserRoleDto dto, string adminId)
    {
        return ChangeUserRolesAsync(userId, new UpdateUserRolesDto { Roles = [dto.Role] }, adminId);
    }

    public async Task<bool> ChangeUserRolesAsync(string userId, UpdateUserRolesDto dto, string adminId)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
        {
            return false;
        }

        var roles = NormalizeRoles(dto.Roles);
        if (roles.Count == 0)
        {
            throw new InvalidOperationException("حداقل یک نقش برای کاربر الزامی است.");
        }

        var previousRoles = await _userManager.GetRolesAsync(user);
        await EnsureRolesExistAsync(roles);
        await SyncRolesAsync(user, roles);
        await EnsurePatientRecordForRolesAsync(user, roles);

        await _auditLogService.LogAsync(adminId, "ChangeRoles", "User", userId, $"نقش‌ها از {string.Join(", ", previousRoles)} به {string.Join(", ", roles)} تغییر یافت.", null);
        return true;
    }

    public async Task<bool> ResetPasswordAsync(string userId, string newPassword, string adminId)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
        {
            return false;
        }

        var token = await _userManager.GeneratePasswordResetTokenAsync(user);
        var result = await _userManager.ResetPasswordAsync(user, token, newPassword);
        EnsureIdentitySucceeded(result, "ریست رمز عبور");

        await _userManager.UpdateSecurityStampAsync(user);
        await _auditLogService.LogAsync(adminId, "ResetPassword", "User", userId, "ادمین رمز عبور کاربر را ریست کرد.", null);
        return true;
    }

    public async Task<bool> ForceLogoutAsync(string userId, string adminId)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
        {
            return false;
        }

        var result = await _userManager.UpdateSecurityStampAsync(user);
        EnsureIdentitySucceeded(result, "خروج اجباری کاربر");

        await _auditLogService.LogAsync(adminId, "ForceLogout", "User", userId, "ادمین کاربر را به‌صورت اجباری از سیستم خارج کرد.", null);
        return true;
    }

    public async Task<bool> SetUserLockAsync(string userId, SetUserLockDto dto, string adminId)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
        {
            return false;
        }

        await _userManager.SetLockoutEnabledAsync(user, true);
        await _userManager.SetLockoutEndDateAsync(user, dto.IsLocked ? dto.LockoutEnd ?? DateTimeOffset.MaxValue : null);
        await _userManager.UpdateSecurityStampAsync(user);

        await _auditLogService.LogAsync(adminId, dto.IsLocked ? "LockUser" : "UnlockUser", "User", userId, dto.Reason, null);
        return true;
    }

    public async Task<bool> UpdateUserContactVerificationAsync(string userId, UpdateUserContactVerificationDto dto, string adminId)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
        {
            return false;
        }

        user.EmailConfirmed = dto.EmailConfirmed;
        user.PhoneNumberConfirmed = dto.PhoneNumberConfirmed;

        var result = await _userManager.UpdateAsync(user);
        EnsureIdentitySucceeded(result, "بروزرسانی وضعیت تایید تماس");

        await _auditLogService.LogAsync(
            adminId,
            "UpdateContactVerification",
            "User",
            userId,
            $"EmailConfirmed={dto.EmailConfirmed}, PhoneNumberConfirmed={dto.PhoneNumberConfirmed}",
            null);

        return true;
    }

    public async Task<bool> UpdateUserPermissionsAsync(string userId, UpdateUserPermissionsDto dto, string adminId)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
        {
            return false;
        }

        var normalizedPermissions = NormalizePermissions(dto.Permissions);
        var invalidPermissions = normalizedPermissions.Except(Permissions.All, StringComparer.OrdinalIgnoreCase).ToList();
        if (invalidPermissions.Count > 0)
        {
            throw new InvalidOperationException($"سطوح دسترسی نامعتبر هستند: {string.Join(", ", invalidPermissions)}");
        }

        var previousPermissions = await GetDirectPermissionsAsync(user);
        await SyncUserPermissionsAsync(user, normalizedPermissions);

        await _auditLogService.LogAsync(
            adminId,
            "UpdateUserPermissions",
            "User",
            userId,
            $"دسترسی‌های مستقیم کاربر از {string.Join(", ", previousPermissions)} به {string.Join(", ", normalizedPermissions)} تغییر یافت.",
            null);

        return true;
    }

    public async Task<RoleCatalogDto> GetRoleCatalogAsync()
    {
        var roles = await _roleManager.Roles.AsNoTracking().OrderBy(x => x.Name).ToListAsync();
        var roleIds = roles.Select(x => x.Id).ToList();

        var userCounts = await _context.UserRoles
            .Where(x => roleIds.Contains(x.RoleId))
            .GroupBy(x => x.RoleId)
            .Select(x => new { x.Key, Count = x.Count() })
            .ToDictionaryAsync(x => x.Key, x => x.Count);

        var permissions = await _context.RoleClaims
            .Where(x => roleIds.Contains(x.RoleId) && x.ClaimType == Permissions.ClaimType)
            .GroupBy(x => x.RoleId)
            .ToDictionaryAsync(
                x => x.Key,
                x => x.Select(c => c.ClaimValue ?? string.Empty)
                    .Where(v => !string.IsNullOrWhiteSpace(v))
                    .Distinct(StringComparer.OrdinalIgnoreCase)
                    .OrderBy(v => v)
                    .ToList());

        return new RoleCatalogDto
        {
            AvailablePermissions = Permissions.Definitions
                .OrderBy(x => x.GroupDisplayName)
                .ThenBy(x => x.DisplayName)
                .Select(x => new PermissionDefinitionDto
                {
                    Key = x.Key,
                    Group = x.Group,
                    GroupDisplayName = x.GroupDisplayName,
                    DisplayName = x.DisplayName,
                    Description = x.Description
                })
                .ToList(),
            Roles = roles.Select(role => new RoleManagementDto
            {
                Name = role.Name ?? string.Empty,
                IsSystemRole = role.Name != null && SystemRoles.Contains(role.Name),
                UserCount = userCounts.TryGetValue(role.Id, out var count) ? count : 0,
                Permissions = permissions.TryGetValue(role.Id, out var rolePermissions) ? rolePermissions : new List<string>()
            }).ToList()
        };
    }

    public async Task<RoleManagementDto> UpsertRoleAsync(string? currentRoleName, UpsertRoleDto dto, string adminId)
    {
        var targetName = dto.Name.Trim();
        if (string.IsNullOrWhiteSpace(targetName))
        {
            throw new InvalidOperationException("نام نقش الزامی است.");
        }

        var normalizedPermissions = dto.Permissions
            .Where(x => !string.IsNullOrWhiteSpace(x))
            .Select(x => x.Trim())
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .OrderBy(x => x)
            .ToList();

        var invalidPermissions = normalizedPermissions.Except(Permissions.All, StringComparer.OrdinalIgnoreCase).ToList();
        if (invalidPermissions.Count > 0)
        {
            throw new InvalidOperationException($"سطوح دسترسی نامعتبر هستند: {string.Join(", ", invalidPermissions)}");
        }

        IdentityRole role;
        var isCreate = string.IsNullOrWhiteSpace(currentRoleName);
        if (isCreate)
        {
            if (await _roleManager.RoleExistsAsync(targetName))
            {
                throw new InvalidOperationException("نقشی با این نام از قبل وجود دارد.");
            }

            role = new IdentityRole(targetName);
            EnsureIdentitySucceeded(await _roleManager.CreateAsync(role), "ایجاد نقش");
        }
        else
        {
            role = await _roleManager.FindByNameAsync(currentRoleName!) ?? throw new KeyNotFoundException("نقش موردنظر یافت نشد.");

            if (!string.Equals(role.Name, targetName, StringComparison.OrdinalIgnoreCase))
            {
                if (await _roleManager.RoleExistsAsync(targetName))
                {
                    throw new InvalidOperationException("نقش جدیدی با این نام از قبل وجود دارد.");
                }

                role.Name = targetName;
                role.NormalizedName = targetName.ToUpperInvariant();
                EnsureIdentitySucceeded(await _roleManager.UpdateAsync(role), "بروزرسانی نام نقش");
            }
        }

        var existingClaims = await _roleManager.GetClaimsAsync(role);
        foreach (var claim in existingClaims.Where(x => x.Type == Permissions.ClaimType))
        {
            EnsureIdentitySucceeded(await _roleManager.RemoveClaimAsync(role, claim), "حذف دسترسی‌های قبلی نقش");
        }

        foreach (var permission in normalizedPermissions)
        {
            EnsureIdentitySucceeded(await _roleManager.AddClaimAsync(role, new System.Security.Claims.Claim(Permissions.ClaimType, permission)), "افزودن دسترسی به نقش");
        }

        await _auditLogService.LogAsync(adminId, isCreate ? "CreateRole" : "UpdateRole", "Role", role.Name, $"مجوزها: {string.Join(", ", normalizedPermissions)}", null);

        var catalog = await GetRoleCatalogAsync();
        return catalog.Roles.First(x => x.Name.Equals(role.Name, StringComparison.OrdinalIgnoreCase));
    }

    public async Task DeleteRoleAsync(string roleName, string adminId)
    {
        var role = await _roleManager.FindByNameAsync(roleName) ?? throw new KeyNotFoundException("نقش یافت نشد.");
        if (role.Name != null && SystemRoles.Contains(role.Name))
        {
            throw new InvalidOperationException("حذف نقش‌های سیستمی مجاز نیست.");
        }

        var hasUsers = await _context.UserRoles.AnyAsync(x => x.RoleId == role.Id);
        if (hasUsers)
        {
            throw new InvalidOperationException("این نقش به یک یا چند کاربر تخصیص داده شده است و قابل حذف نیست.");
        }

        EnsureIdentitySucceeded(await _roleManager.DeleteAsync(role), "حذف نقش");
        await _auditLogService.LogAsync(adminId, "DeleteRole", "Role", roleName, "حذف نقش سفارشی", null);
    }

    public async Task<bool> PerformBulkActionAsync(BulkActionDto dto, string adminId)
    {
        foreach (var userId in dto.UserIds.Distinct(StringComparer.OrdinalIgnoreCase))
        {
            if (dto.Action.Equals("Activate", StringComparison.OrdinalIgnoreCase))
            {
                await ChangeUserStatusAsync(userId, new ChangeUserStatusDto { IsActive = true }, adminId);
            }
            else if (dto.Action.Equals("Deactivate", StringComparison.OrdinalIgnoreCase))
            {
                await ChangeUserStatusAsync(userId, new ChangeUserStatusDto { IsActive = false, BanReason = dto.Reason }, adminId);
            }
            else if (dto.Action.Equals("Unlock", StringComparison.OrdinalIgnoreCase))
            {
                await SetUserLockAsync(userId, new SetUserLockDto { IsLocked = false }, adminId);
            }
        }

        return true;
    }

    public async Task<bool> UpdateUserProfileAsync(string userId, UpdateUserProfileDto dto)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
        {
            return false;
        }

        await EnsureUniqueContactAsync(dto.Email, dto.PhoneNumber, userId);

        user.FirstName = dto.FirstName.Trim();
        user.LastName = dto.LastName.Trim();
        user.PhoneNumber = dto.PhoneNumber.Trim();
        user.Email = string.IsNullOrWhiteSpace(dto.Email) ? null : dto.Email.Trim();
        user.UserName = dto.PhoneNumber.Trim();

        var result = await _userManager.UpdateAsync(user);
        EnsureIdentitySucceeded(result, "بروزرسانی پروفایل");
        return true;
    }

    public async Task RecordSuccessfulLoginAsync(string userId, string? ipAddress)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
        {
            return;
        }

        user.LastLoginDate = DateTime.UtcNow;
        user.LastLoginIp = ipAddress;
        await _userManager.UpdateAsync(user);
    }

    private UserListDto MapListDto(
        User user,
        List<string> roles,
        Dictionary<string, List<string>> permissionsByRole,
        List<string> directPermissions)
    {
        var effectivePermissions = roles
            .SelectMany(role => permissionsByRole.TryGetValue(role, out var permissions) ? permissions : [])
            .Concat(directPermissions)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .OrderBy(x => x)
            .ToList();

        var isLocked = user.LockoutEnd.HasValue && user.LockoutEnd > DateTimeOffset.UtcNow;

        return new UserListDto
        {
            Id = user.Id,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Email = user.Email ?? string.Empty,
            PhoneNumber = user.PhoneNumber ?? string.Empty,
            NationalCode = user.NationalCode ?? string.Empty,
            Role = roles.FirstOrDefault() ?? string.Empty,
            Roles = roles,
            EffectivePermissions = effectivePermissions,
            IsActive = user.IsActive,
            EmailConfirmed = user.EmailConfirmed,
            PhoneNumberConfirmed = user.PhoneNumberConfirmed,
            IsLocked = isLocked,
            IsOnline = _presenceTracker.IsOnline(user.Id),
            CreatedAt = user.CreatedAt,
            LastLoginDate = user.LastLoginDate,
            LockoutEnd = user.LockoutEnd
        };
    }

    private UserDetailDto MapDetailDto(
        User user,
        List<string> roles,
        Dictionary<string, List<string>> permissionsByRole,
        List<string> directPermissions,
        List<AuditLogDto> auditLogs,
        List<UserPatientAssignmentDto> assignedPatients)
    {
        var baseDto = MapListDto(user, roles, permissionsByRole, directPermissions);
        return new UserDetailDto
        {
            Id = baseDto.Id,
            FirstName = baseDto.FirstName,
            LastName = baseDto.LastName,
            Email = baseDto.Email,
            PhoneNumber = baseDto.PhoneNumber,
            NationalCode = baseDto.NationalCode,
            Role = baseDto.Role,
            Roles = baseDto.Roles,
            EffectivePermissions = baseDto.EffectivePermissions,
            IsActive = baseDto.IsActive,
            EmailConfirmed = baseDto.EmailConfirmed,
            PhoneNumberConfirmed = baseDto.PhoneNumberConfirmed,
            IsLocked = baseDto.IsLocked,
            IsOnline = baseDto.IsOnline,
            CreatedAt = baseDto.CreatedAt,
            LastLoginDate = baseDto.LastLoginDate,
            LockoutEnd = baseDto.LockoutEnd,
            AdminNotes = user.AdminNotes,
            BanReason = user.BanReason,
            LastLoginIp = user.LastLoginIp,
            LockoutEnabled = user.LockoutEnabled,
            DirectPermissions = directPermissions,
            AuditLogs = auditLogs,
            AssignedPatients = assignedPatients
        };
    }

    private async Task<List<UserPatientAssignmentDto>> GetAssignedPatientsAsync(string userId)
    {
        return await _context.CareAssignments
            .AsNoTracking()
            .Include(x => x.Patient)
            .Where(x => x.CaregiverId == userId)
            .OrderByDescending(x => x.StartDate)
            .Take(50)
            .Select(x => new UserPatientAssignmentDto
            {
                Id = x.Id,
                PatientId = x.PatientId,
                PatientName = $"{x.Patient.FirstName} {x.Patient.LastName}".Trim(),
                AssignmentType = (int)x.AssignmentType,
                ShiftSlot = x.ShiftSlot.HasValue ? (int)x.ShiftSlot.Value : null,
                Status = (int)x.Status,
                IsPrimaryCaregiver = x.IsPrimaryCaregiver,
                StartDate = x.StartDate,
                EndDate = x.EndDate,
                Notes = x.Notes
            })
            .ToListAsync();
    }

    private async Task EnsureUniqueContactAsync(string? email, string phoneNumber, string? currentUserId)
    {
        var trimmedPhone = phoneNumber.Trim();
        var phoneExists = await _userManager.Users.AnyAsync(x => x.Id != currentUserId && x.PhoneNumber == trimmedPhone);
        if (phoneExists)
        {
            throw new InvalidOperationException("کاربری با این شماره موبایل قبلاً ثبت شده است.");
        }

        if (!string.IsNullOrWhiteSpace(email))
        {
            var trimmedEmail = email.Trim();
            var emailExists = await _userManager.Users.AnyAsync(x => x.Id != currentUserId && x.Email == trimmedEmail);
            if (emailExists)
            {
                throw new InvalidOperationException("کاربری با این ایمیل قبلاً ثبت شده است.");
            }
        }
    }

    private async Task EnsureRolesExistAsync(IEnumerable<string> roles)
    {
        foreach (var role in roles)
        {
            if (!await _roleManager.RoleExistsAsync(role))
            {
                throw new InvalidOperationException($"نقش '{role}' در سیستم وجود ندارد.");
            }
        }
    }

    private async Task SyncRolesAsync(User user, IReadOnlyCollection<string> roles)
    {
        var currentRoles = await _userManager.GetRolesAsync(user);
        var toRemove = currentRoles.Except(roles, StringComparer.OrdinalIgnoreCase).ToList();
        var toAdd = roles.Except(currentRoles, StringComparer.OrdinalIgnoreCase).ToList();

        if (toRemove.Count > 0)
        {
            EnsureIdentitySucceeded(await _userManager.RemoveFromRolesAsync(user, toRemove), "حذف نقش‌های قبلی کاربر");
        }

        if (toAdd.Count > 0)
        {
            EnsureIdentitySucceeded(await _userManager.AddToRolesAsync(user, toAdd), "افزودن نقش‌های جدید کاربر");
        }
    }

    private async Task EnsurePatientRecordForRolesAsync(User user, IReadOnlyCollection<string> roles)
    {
        if (roles.Contains(Roles.Patient, StringComparer.OrdinalIgnoreCase) ||
            roles.Contains(Roles.Elderly, StringComparer.OrdinalIgnoreCase))
        {
            await _patientService.CreatePatientForUserAsync(user.Id, user.FirstName, user.LastName);
        }
    }

    private async Task<Dictionary<string, List<string>>> GetRolesByUserIdsAsync(IReadOnlyCollection<string> userIds)
    {
        if (userIds.Count == 0)
        {
            return new Dictionary<string, List<string>>();
        }

        var rows = await _context.UserRoles
            .Where(ur => userIds.Contains(ur.UserId))
            .Join(_context.Roles, ur => ur.RoleId, r => r.Id, (ur, r) => new
            {
                ur.UserId,
                RoleName = r.Name ?? string.Empty
            })
            .ToListAsync();

        return rows
            .GroupBy(x => x.UserId)
            .ToDictionary(
                x => x.Key,
                x => x.Select(v => v.RoleName)
                    .Where(v => !string.IsNullOrWhiteSpace(v))
                    .Distinct(StringComparer.OrdinalIgnoreCase)
                    .OrderBy(v => v)
                    .ToList());
    }

    private async Task<Dictionary<string, List<string>>> GetPermissionsByRoleAsync(IEnumerable<string> roles)
    {
        var roleList = roles
            .Where(x => !string.IsNullOrWhiteSpace(x))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();

        if (roleList.Count == 0)
        {
            return new Dictionary<string, List<string>>(StringComparer.OrdinalIgnoreCase);
        }

        var rows = await _context.RoleClaims
            .Join(_context.Roles, rc => rc.RoleId, r => r.Id, (rc, r) => new
            {
                RoleName = r.Name ?? string.Empty,
                rc.ClaimType,
                rc.ClaimValue
            })
            .Where(x => roleList.Contains(x.RoleName) && x.ClaimType == Permissions.ClaimType)
            .ToListAsync();

        return rows
            .GroupBy(x => x.RoleName, StringComparer.OrdinalIgnoreCase)
            .ToDictionary(
                x => x.Key,
                x => x.Select(v => v.ClaimValue ?? string.Empty)
                    .Where(v => !string.IsNullOrWhiteSpace(v))
                    .Distinct(StringComparer.OrdinalIgnoreCase)
                    .OrderBy(v => v)
                    .ToList(),
                StringComparer.OrdinalIgnoreCase);
    }

    private async Task<List<string>> GetDirectPermissionsAsync(User user)
    {
        var claims = await _userManager.GetClaimsAsync(user);
        return claims
            .Where(x => x.Type == Permissions.ClaimType && !string.IsNullOrWhiteSpace(x.Value))
            .Select(x => x.Value)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .OrderBy(x => x)
            .ToList();
    }

    private async Task<Dictionary<string, List<string>>> GetDirectPermissionsByUserIdsAsync(IReadOnlyCollection<string> userIds)
    {
        if (userIds.Count == 0)
        {
            return new Dictionary<string, List<string>>(StringComparer.OrdinalIgnoreCase);
        }

        var rows = await _context.UserClaims
            .Where(x => userIds.Contains(x.UserId) && x.ClaimType == Permissions.ClaimType)
            .Select(x => new
            {
                x.UserId,
                Permission = x.ClaimValue ?? string.Empty
            })
            .ToListAsync();

        return rows
            .GroupBy(x => x.UserId, StringComparer.OrdinalIgnoreCase)
            .ToDictionary(
                x => x.Key,
                x => x.Select(v => v.Permission)
                    .Where(v => !string.IsNullOrWhiteSpace(v))
                    .Distinct(StringComparer.OrdinalIgnoreCase)
                    .OrderBy(v => v)
                    .ToList(),
                StringComparer.OrdinalIgnoreCase);
    }

    private async Task SyncUserPermissionsAsync(User user, IReadOnlyCollection<string> permissions)
    {
        var existingClaims = await _userManager.GetClaimsAsync(user);
        foreach (var claim in existingClaims.Where(x => x.Type == Permissions.ClaimType))
        {
            EnsureIdentitySucceeded(await _userManager.RemoveClaimAsync(user, claim), "حذف دسترسی‌های مستقیم قبلی کاربر");
        }

        foreach (var permission in permissions)
        {
            EnsureIdentitySucceeded(await _userManager.AddClaimAsync(user, new Claim(Permissions.ClaimType, permission)), "افزودن دسترسی مستقیم به کاربر");
        }

        await _userManager.UpdateSecurityStampAsync(user);
    }

    private static List<string> NormalizeRoles(IEnumerable<string> roles)
    {
        return roles
            .Where(x => !string.IsNullOrWhiteSpace(x))
            .Select(x => x.Trim())
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .OrderBy(x => x)
            .ToList();
    }

    private static List<string> NormalizePermissions(IEnumerable<string> permissions)
    {
        return permissions
            .Where(x => !string.IsNullOrWhiteSpace(x))
            .Select(x => x.Trim())
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .OrderBy(x => x)
            .ToList();
    }

    private static void EnsureIdentitySucceeded(IdentityResult result, string operation)
    {
        if (result.Succeeded)
        {
            return;
        }

        var message = string.Join("، ", result.Errors.Select(x => x.Description));
        throw new InvalidOperationException($"{operation} انجام نشد: {message}");
    }
}
