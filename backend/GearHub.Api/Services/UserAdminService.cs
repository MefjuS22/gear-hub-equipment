using GearHub.Api.Authorization;
using GearHub.Api.Data;
using GearHub.Api.DTOs;
using GearHub.Api.Models;
using GearHub.Api.Responses;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace GearHub.Api.Services;

public class UserAdminService(
    UserManager<ApplicationUser> userManager,
    RoleManager<IdentityRole<int>> roleManager,
    ApplicationDbContext dbContext) : IUserAdminService
{
    public async Task<IReadOnlyList<UserAdminListDto>> GetAllAsync(
        CancellationToken cancellationToken = default)
    {
        var users = await userManager.Users
            .OrderBy(u => u.Email)
            .ToListAsync(cancellationToken);

        var list = new List<UserAdminListDto>(users.Count);
        foreach (var u in users)
        {
            var roles = await userManager.GetRolesAsync(u);
            list.Add(ToDto(u, roles));
        }

        return list;
    }

    public async Task<ServiceResult<UserAdminListDto>> CreateAsync(
        CreateUserAdminDto dto,
        CancellationToken cancellationToken = default)
    {
        var normalizedRoles = NormalizeRoles(dto.Roles);
        foreach (var role in normalizedRoles)
        {
            if (!await roleManager.RoleExistsAsync(role))
            {
                return ServiceResult<UserAdminListDto>.Fail(
                    ApiErrorCode.AuthRoleNotFound,
                    $"Role '{role}' does not exist.");
            }
        }

        var email = dto.Email.Trim();
        if (await userManager.FindByEmailAsync(email) is not null)
        {
            return ServiceResult<UserAdminListDto>.Fail(
                ApiErrorCode.UserEmailTaken,
                "Email is already registered.");
        }

        var user = new ApplicationUser
        {
            UserName = email,
            Email = email,
            DisplayName = dto.DisplayName.Trim(),
            EmailConfirmed = true,
        };

        var create = await userManager.CreateAsync(user, dto.Password);
        if (!create.Succeeded)
        {
            return ServiceResult<UserAdminListDto>.Fail(
                ApiErrorCode.ValidationFailed,
                string.Join(" ", create.Errors.Select(e => e.Description)));
        }

        var roleResult = await userManager.AddToRolesAsync(user, normalizedRoles);
        if (!roleResult.Succeeded)
        {
            await userManager.DeleteAsync(user);
            return ServiceResult<UserAdminListDto>.Fail(
                ApiErrorCode.ValidationFailed,
                string.Join(" ", roleResult.Errors.Select(e => e.Description)));
        }

        var reloaded = await userManager.FindByIdAsync(user.Id.ToString());
        if (reloaded is null)
        {
            return ServiceResult<UserAdminListDto>.Fail(
                ApiErrorCode.InternalError,
                "User was created but could not be loaded.");
        }

        var roles = await userManager.GetRolesAsync(reloaded);
        return ServiceResult<UserAdminListDto>.Ok(ToDto(reloaded, roles));
    }

    public async Task<ServiceResult> SetRolesAsync(
        int userId,
        SetUserRolesDto dto,
        int currentUserId,
        CancellationToken cancellationToken = default)
    {
        var user = await userManager.FindByIdAsync(userId.ToString());
        if (user is null)
        {
            return ServiceResult.Fail(ApiErrorCode.UserNotFound, "User not found.");
        }

        var normalizedRoles = NormalizeRoles(dto.Roles);
        foreach (var role in normalizedRoles)
        {
            if (!await roleManager.RoleExistsAsync(role))
            {
                return ServiceResult.Fail(
                    ApiErrorCode.AuthRoleNotFound,
                    $"Role '{role}' does not exist.");
            }
        }

        var wasAdmin = await userManager.IsInRoleAsync(user, AppRoles.Admin);
        if (wasAdmin
            && !normalizedRoles.Contains(AppRoles.Admin, StringComparer.Ordinal)
            && await IsOnlyAccountInAdminRoleAsync(user))
        {
            return ServiceResult.Fail(
                ApiErrorCode.UserLastAdmin,
                "Cannot remove the last Admin from the system.");
        }

        var current = await userManager.GetRolesAsync(user);
        var remove = current.Except(normalizedRoles, StringComparer.Ordinal).ToList();
        var add = normalizedRoles.Except(current, StringComparer.Ordinal).ToList();
        if (remove.Count > 0)
        {
            var removeResult = await userManager.RemoveFromRolesAsync(user, remove);
            if (!removeResult.Succeeded)
            {
                return ServiceResult.Fail(
                    ApiErrorCode.ValidationFailed,
                    string.Join(" ", removeResult.Errors.Select(e => e.Description)));
            }
        }

        if (add.Count > 0)
        {
            var addResult = await userManager.AddToRolesAsync(user, add);
            if (!addResult.Succeeded)
            {
                return ServiceResult.Fail(
                    ApiErrorCode.ValidationFailed,
                    string.Join(" ", addResult.Errors.Select(e => e.Description)));
            }
        }

        return ServiceResult.Ok();
    }

    public async Task<ServiceResult> DeleteAsync(
        int userId,
        int currentUserId,
        CancellationToken cancellationToken = default)
    {
        if (userId == currentUserId)
        {
            return ServiceResult.Fail(
                ApiErrorCode.UserCannotDeleteSelf,
                "You cannot delete your own account.");
        }

        var user = await userManager.FindByIdAsync(userId.ToString());
        if (user is null)
        {
            return ServiceResult.Fail(ApiErrorCode.UserNotFound, "User not found.");
        }

        if (await dbContext.RentalOrders.AnyAsync(o => o.UserId == userId, cancellationToken))
        {
            return ServiceResult.Fail(
                ApiErrorCode.ValidationFailed,
                "This user has rental orders and cannot be deleted.");
        }

        if (await userManager.IsInRoleAsync(user, AppRoles.Admin)
            && await IsOnlyAccountInAdminRoleAsync(user))
        {
            return ServiceResult.Fail(
                ApiErrorCode.UserLastAdmin,
                "Cannot delete the last Admin account.");
        }

        var delete = await userManager.DeleteAsync(user);
        if (!delete.Succeeded)
        {
            return ServiceResult.Fail(
                ApiErrorCode.ValidationFailed,
                string.Join(" ", delete.Errors.Select(e => e.Description)));
        }

        return ServiceResult.Ok();
    }

    private static List<string> NormalizeRoles(IEnumerable<string> roles) =>
        roles
            .Select(r => AppRoles.All.First(a => string.Equals(a, r, StringComparison.OrdinalIgnoreCase)))
            .Distinct(StringComparer.Ordinal)
            .OrderBy(r => r, StringComparer.Ordinal)
            .ToList();

    private async Task<bool> IsOnlyAccountInAdminRoleAsync(ApplicationUser user)
    {
        var admins = await userManager.GetUsersInRoleAsync(AppRoles.Admin);
        return admins.Count == 1 && admins[0].Id == user.Id;
    }

    private static UserAdminListDto ToDto(ApplicationUser user, IEnumerable<string> roles) =>
        new()
        {
            Id = user.Id,
            Email = user.Email ?? string.Empty,
            DisplayName = user.DisplayName,
            Roles = roles.OrderBy(r => r, StringComparer.Ordinal).ToList(),
        };
}
