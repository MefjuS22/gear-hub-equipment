using Microsoft.AspNetCore.Authorization;

namespace GearHub.Api.Authorization;

/// <summary>
/// Requires a <c>permission</c> claim matching <paramref name="permission"/> (not merely membership in a role).
/// </summary>
[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = true)]
public sealed class HasPermissionAttribute : AuthorizeAttribute
{
    public HasPermissionAttribute(string permission)
    {
        Policy = permission;
    }
}
