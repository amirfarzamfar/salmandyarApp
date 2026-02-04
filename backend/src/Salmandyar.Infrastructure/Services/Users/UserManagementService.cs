using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Salmandyar.Application.DTOs.Users;
using Salmandyar.Application.Services.Users;
using Salmandyar.Domain.Entities;
using Salmandyar.Infrastructure.Persistence;
using System;
using System.Text.Json;

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
            var log = new AuditLog
            {
                UserId = userId,
                Action = action,
                EntityName = entityName,
                EntityId = entityId,
                Details = details,
                IpAddress = ipAddress,
                CreatedAt = DateTime.UtcNow
            };

            _context.AuditLogs.Add(log);
            await _context.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            // Log to console/logger but don't crash the main operation
            Console.WriteLine($"Error saving audit log: {ex.Message}");
        }
    }

    public async Task<List<AuditLogDto>> GetLogsForUserAsync(string userId)
    {
        return await _context.AuditLogs
            .Where(x => x.EntityId == userId && x.EntityName == "User")
            .OrderByDescending(x => x.CreatedAt)
            .Select(x => new AuditLogDto
            {
                Id = x.Id,
                Action = x.Action,
                Details = x.Details,
                IpAddress = x.IpAddress,
                CreatedAt = x.CreatedAt,
                PerformedBy = x.UserId ?? "Unknown"
            })
            .ToListAsync();
    }
}

public class UserManagementService : IUserManagementService
{
    private readonly UserManager<User> _userManager;
    private readonly RoleManager<IdentityRole> _roleManager;
    private readonly IAuditLogService _auditLogService;
    private readonly ApplicationDbContext _context;

    public UserManagementService(
        UserManager<User> userManager,
        RoleManager<IdentityRole> roleManager,
        IAuditLogService auditLogService,
        ApplicationDbContext context)
    {
        _userManager = userManager;
        _roleManager = roleManager;
        _auditLogService = auditLogService;
        _context = context;
    }

    public async Task<PaginatedResult<UserListDto>> GetUsersAsync(UserFilterDto filter)
    {
        Console.WriteLine($"GetUsersAsync called: SearchTerm='{filter.SearchTerm}', Role='{filter.Role}', IsActive={filter.IsActive}, Page={filter.PageNumber}, Size={filter.PageSize}");
        var query = _context.Users.AsNoTracking();
        
        Console.WriteLine($"Total users in DB: {await _context.Users.CountAsync()}");

        if (!string.IsNullOrWhiteSpace(filter.SearchTerm))
        {
            var term = filter.SearchTerm.Trim();
            // Check if term is empty to avoid filtering
            if (term.Length > 0) 
            {
                query = query.Where(u => 
                    u.FirstName.Contains(term) || 
                    u.LastName.Contains(term) || 
                    u.Email.Contains(term) || 
                    u.UserName.Contains(term) ||
                    u.PhoneNumber.Contains(term) ||
                    (u.NationalCode != null && u.NationalCode.Contains(term)));
            }
        }

        if (filter.IsActive.HasValue)
        {
            query = query.Where(u => u.IsActive == filter.IsActive.Value);
        }

        // Filtering by Role requires a Join since Roles are in a separate table
        if (!string.IsNullOrWhiteSpace(filter.Role))
        {
             // This is a bit complex with Identity but manageable
             var userIdsInRole = await _userManager.GetUsersInRoleAsync(filter.Role);
             var ids = userIdsInRole.Select(u => u.Id).ToList();
             query = query.Where(u => ids.Contains(u.Id));
        }

        var totalCount = await query.CountAsync();
        
        var items = await query
            .Skip((filter.PageNumber - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .ToListAsync();

        var userDtos = new List<UserListDto>();
        foreach (var user in items)
        {
            var roles = await _userManager.GetRolesAsync(user);
            userDtos.Add(new UserListDto
            {
                Id = user.Id,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email ?? "",
                PhoneNumber = user.PhoneNumber ?? "",
                NationalCode = user.NationalCode ?? "",
                IsActive = user.IsActive,
                CreatedAt = user.CreatedAt,
                LastLoginDate = user.LastLoginDate,
                Role = roles.FirstOrDefault() ?? "No Role"
            });
        }

        return new PaginatedResult<UserListDto>
        {
            Items = userDtos,
            TotalCount = totalCount,
            PageNumber = filter.PageNumber,
            PageSize = filter.PageSize
        };
    }

    public async Task<UserDetailDto?> GetUserByIdAsync(string userId)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null) return null;

        var roles = await _userManager.GetRolesAsync(user);
        var logs = await _auditLogService.GetLogsForUserAsync(userId);

        return new UserDetailDto
        {
            Id = user.Id,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Email = user.Email ?? "",
            PhoneNumber = user.PhoneNumber ?? "",
            NationalCode = user.NationalCode ?? "",
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt,
            LastLoginDate = user.LastLoginDate,
            LastLoginIp = user.LastLoginIp,
            BanReason = user.BanReason,
            AdminNotes = user.AdminNotes,
            Role = roles.FirstOrDefault() ?? "No Role",
            LockoutEnabled = user.LockoutEnabled,
            LockoutEnd = user.LockoutEnd,
            AuditLogs = logs
        };
    }

    public async Task<bool> ChangeUserStatusAsync(string userId, ChangeUserStatusDto dto, string adminId)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null) return false;

        var oldStatus = user.IsActive;
        user.IsActive = dto.IsActive;
        user.BanReason = dto.IsActive ? null : dto.BanReason;
        
        // If banning, also lockout
        if (!dto.IsActive)
        {
            await _userManager.SetLockoutEndDateAsync(user, DateTimeOffset.MaxValue);
            await _userManager.UpdateSecurityStampAsync(user); // Force logout
        }
        else
        {
            await _userManager.SetLockoutEndDateAsync(user, null);
        }

        var result = await _userManager.UpdateAsync(user);
        
        if (result.Succeeded)
        {
            await _auditLogService.LogAsync(adminId, "ChangeStatus", "User", userId, 
                $"Changed status from {oldStatus} to {dto.IsActive}. Reason: {dto.BanReason}", null);
            return true;
        }
        return false;
    }

    public async Task<bool> ChangeUserRoleAsync(string userId, UpdateUserRoleDto dto, string adminId)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null) return false;

        var currentRoles = await _userManager.GetRolesAsync(user);
        var removeResult = await _userManager.RemoveFromRolesAsync(user, currentRoles);
        if (!removeResult.Succeeded) return false;

        var addResult = await _userManager.AddToRoleAsync(user, dto.Role);
        
        if (addResult.Succeeded)
        {
            await _auditLogService.LogAsync(adminId, "ChangeRole", "User", userId, 
                $"Changed role from {string.Join(",", currentRoles)} to {dto.Role}", null);
            return true;
        }
        return false;
    }

    public async Task<bool> ResetPasswordAsync(string userId, string newPassword, string adminId)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null) return false;

        var token = await _userManager.GeneratePasswordResetTokenAsync(user);
        var result = await _userManager.ResetPasswordAsync(user, token, newPassword);

        if (result.Succeeded)
        {
            await _auditLogService.LogAsync(adminId, "ResetPassword", "User", userId, "Admin reset password", null);
            return true;
        }
        return false;
    }

    public async Task<bool> ForceLogoutAsync(string userId, string adminId)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null) return false;

        var result = await _userManager.UpdateSecurityStampAsync(user);
        
        if (result.Succeeded)
        {
            await _auditLogService.LogAsync(adminId, "ForceLogout", "User", userId, "Admin forced logout", null);
            return true;
        }
        return false;
    }

    public async Task<bool> PerformBulkActionAsync(BulkActionDto dto, string adminId)
    {
        foreach (var userId in dto.UserIds)
        {
            if (dto.Action == "Activate")
            {
                await ChangeUserStatusAsync(userId, new ChangeUserStatusDto { IsActive = true }, adminId);
            }
            else if (dto.Action == "Deactivate")
            {
                await ChangeUserStatusAsync(userId, new ChangeUserStatusDto { IsActive = false, BanReason = dto.Reason }, adminId);
            }
        }
        return true;
    }
}
