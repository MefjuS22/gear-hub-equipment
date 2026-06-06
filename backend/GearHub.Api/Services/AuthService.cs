using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using GearHub.Api.Authorization;
using GearHub.Api.Data;
using GearHub.Api.DTOs;
using GearHub.Api.Models;
using GearHub.Api.Options;
using GearHub.Api.Responses;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace GearHub.Api.Services;

public class AuthService(
    UserManager<ApplicationUser> userManager,
    SignInManager<ApplicationUser> signInManager,
    RoleManager<IdentityRole<int>> roleManager,
    ApplicationDbContext dbContext,
    IHttpContextAccessor httpContextAccessor,
    IOptions<JwtOptions> jwtOptions) : IAuthService
{
    public async Task<ServiceResult<AuthResponseDto>> LoginAsync(
        LoginRequestDto request,
        CancellationToken cancellationToken = default)
    {
        var user = await userManager.FindByEmailAsync(request.Email);
        if (user is null)
        {
            await RecordLoginEventAsync(null, request.Email, success: false, cancellationToken);
            return ServiceResult<AuthResponseDto>.Fail(
                ApiErrorCode.AuthInvalidCredentials,
                "Invalid email or password.");
        }

        var signIn = await signInManager.CheckPasswordSignInAsync(user, request.Password, lockoutOnFailure: true);
        if (!signIn.Succeeded)
        {
            await RecordLoginEventAsync(user.Id, request.Email, success: false, cancellationToken);
            return ServiceResult<AuthResponseDto>.Fail(
                ApiErrorCode.AuthInvalidCredentials,
                "Invalid email or password.");
        }

        await RecordLoginEventAsync(user.Id, request.Email, success: true, cancellationToken);
        var token = await BuildTokenAsync(user, cancellationToken);
        return ServiceResult<AuthResponseDto>.Ok(token);
    }

    public async Task<ServiceResult<AuthResponseDto>> RegisterAsync(
        RegisterUserRequestDto request,
        CancellationToken cancellationToken = default)
    {
        const string roleName = AppRoles.User;
        var role = await roleManager.FindByNameAsync(roleName);
        if (role is null)
        {
            return ServiceResult<AuthResponseDto>.Fail(
                ApiErrorCode.AuthRoleNotFound,
                $"Role '{roleName}' was not found.");
        }

        var user = new ApplicationUser
        {
            UserName = request.Email,
            Email = request.Email,
            DisplayName = request.DisplayName.Trim(),
            EmailConfirmed = true,
        };

        var create = await userManager.CreateAsync(user, request.Password);
        if (!create.Succeeded)
        {
            var message = string.Join(" ", create.Errors.Select(e => e.Description));
            return ServiceResult<AuthResponseDto>.Fail(ApiErrorCode.ValidationFailed, message);
        }

        var addRole = await userManager.AddToRoleAsync(user, roleName);
        if (!addRole.Succeeded)
        {
            await userManager.DeleteAsync(user);
            var message = string.Join(" ", addRole.Errors.Select(e => e.Description));
            return ServiceResult<AuthResponseDto>.Fail(ApiErrorCode.InternalError, message);
        }

        var token = await BuildTokenAsync(user, cancellationToken);
        return ServiceResult<AuthResponseDto>.Ok(token);
    }

    public async Task<ServiceResult<UserProfileDto>> GetProfileAsync(
        ApplicationUser user,
        CancellationToken cancellationToken = default)
    {
        var profile = await BuildProfileAsync(user, cancellationToken);
        return ServiceResult<UserProfileDto>.Ok(profile);
    }

    public async Task<IReadOnlyList<string>> GetPermissionsForUserAsync(
        ApplicationUser user,
        CancellationToken cancellationToken = default)
    {
        var roleNames = await userManager.GetRolesAsync(user);
        if (roleNames.Count == 0)
        {
            return [];
        }

        var roleIds = await dbContext.Roles
            .Where(role => roleNames.Contains(role.Name!))
            .Select(role => role.Id)
            .ToListAsync(cancellationToken);

        return await (
            from rp in dbContext.RolePermissions.AsNoTracking()
            join permission in dbContext.Permissions.AsNoTracking() on rp.PermissionId equals permission.Id
            where roleIds.Contains(rp.RoleId)
            select permission.Name)
            .Distinct()
            .OrderBy(name => name)
            .ToListAsync(cancellationToken);
    }

    private async Task<AuthResponseDto> BuildTokenAsync(ApplicationUser user, CancellationToken cancellationToken)
    {
        var profile = await BuildProfileAsync(user, cancellationToken);
        var jwt = jwtOptions.Value;
        var expires = DateTime.UtcNow.AddMinutes(jwt.ExpiryMinutes);

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new(JwtRegisteredClaimNames.Email, user.Email ?? string.Empty),
            new(JwtRegisteredClaimNames.Name, profile.DisplayName),
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
        };

        foreach (var role in profile.Roles)
        {
            claims.Add(new Claim(ClaimTypes.Role, role));
        }

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt.Key));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var token = new JwtSecurityToken(
            issuer: jwt.Issuer,
            audience: jwt.Audience,
            claims: claims,
            expires: expires,
            signingCredentials: credentials);

        return new AuthResponseDto
        {
            AccessToken = new JwtSecurityTokenHandler().WriteToken(token),
            ExpiresAtUtc = expires,
            User = profile,
        };
    }

    private async Task<UserProfileDto> BuildProfileAsync(ApplicationUser user, CancellationToken cancellationToken)
    {
        var roles = (await userManager.GetRolesAsync(user)).OrderBy(name => name).ToList();
        var permissions = await GetPermissionsForUserAsync(user, cancellationToken);

        return new UserProfileDto
        {
            Id = user.Id,
            Email = user.Email ?? string.Empty,
            DisplayName = user.DisplayName,
            Roles = roles,
            Permissions = permissions,
        };
    }

    private async Task RecordLoginEventAsync(
        int? userId,
        string email,
        bool success,
        CancellationToken cancellationToken)
    {
        var ip = httpContextAccessor.HttpContext?.Connection.RemoteIpAddress?.ToString();
        dbContext.LoginEvents.Add(new LoginEvent
        {
            UserId = userId,
            Email = email.Trim(),
            LoggedInAtUtc = DateTime.UtcNow,
            Success = success,
            IpAddress = ip,
        });
        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
