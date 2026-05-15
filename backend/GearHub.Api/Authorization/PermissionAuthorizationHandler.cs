using System.Security.Claims;
using GearHub.Api.Models;
using GearHub.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.JsonWebTokens;

namespace GearHub.Api.Authorization;

/// <summary>
/// Resolves the current user's permissions from the database (via <see cref="IAuthService"/>).
/// Permissions are intentionally not embedded in JWTs; clients should call <c>GET /api/Auth/me</c> after sign-in.
/// </summary>
public sealed class PermissionAuthorizationHandler(IServiceScopeFactory scopeFactory)
    : AuthorizationHandler<PermissionRequirement>
{
    protected override async Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        PermissionRequirement requirement)
    {
        if (context.User.Identity?.IsAuthenticated != true)
        {
            return;
        }

        var userIdClaim =
            context.User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? context.User.FindFirstValue(JwtRegisteredClaimNames.Sub);
        if (!int.TryParse(userIdClaim, out _))
        {
            return;
        }

        await using var scope = scopeFactory.CreateAsyncScope();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
        var authService = scope.ServiceProvider.GetRequiredService<IAuthService>();

        var user = await userManager.FindByIdAsync(userIdClaim);
        if (user is null)
        {
            return;
        }

        var permissions = await authService.GetPermissionsForUserAsync(user, CancellationToken.None);
        if (permissions.Any(p =>
                string.Equals(p, requirement.Permission, StringComparison.OrdinalIgnoreCase)))
        {
            context.Succeed(requirement);
        }
    }
}
