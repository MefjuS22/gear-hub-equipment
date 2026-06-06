using GearHub.Api.Authorization;
using GearHub.Api.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace GearHub.Api.Data;

public static class IdentityDataSeeder
{
    public const string AdminEmail = "admin@gearhub.com";
    public const string AdminPassword = "Admin123!";
    public const string UserEmail = "user@gearhub.com";
    public const string UserPassword = "User123!";

    public static async Task SeedAsync(IServiceProvider services, CancellationToken cancellationToken = default)
    {
        var db = services.GetRequiredService<ApplicationDbContext>();
        var roleManager = services.GetRequiredService<RoleManager<IdentityRole<int>>>();
        var userManager = services.GetRequiredService<UserManager<ApplicationUser>>();

        await SeedPermissionsAsync(db, cancellationToken);
        await SeedRolesAndPermissionsAsync(db, roleManager, cancellationToken);
        await SeedUsersAsync(userManager, cancellationToken);
    }

    private static async Task SeedPermissionsAsync(ApplicationDbContext db, CancellationToken cancellationToken)
    {
        var definitions = new (string Name, string Description)[]
        {
            (AppPermissions.EquipmentRead, "View equipment catalog"),
            (AppPermissions.EquipmentManage, "Create, update, and delete equipment"),
            (AppPermissions.BrandsManage, "Manage brands"),
            (AppPermissions.CategoriesManage, "Manage categories"),
            (AppPermissions.WarehousesManage, "Manage warehouses"),
            (AppPermissions.CustomersRead, "View customers"),
            (AppPermissions.OrdersRead, "View rental orders"),
            (AppPermissions.OrdersCreate, "Create rental orders"),
            (AppPermissions.DashboardRead, "View dashboard statistics and exports"),
            (AppPermissions.CmsReadPublished, "View published CMS posts"),
            (AppPermissions.CmsManage, "Manage CMS posts"),
            (AppPermissions.FilesUpload, "Upload files"),
            (AppPermissions.UsersManage, "Register and manage users"),
        };

        foreach (var (name, description) in definitions)
        {
            if (await db.Permissions.AnyAsync(p => p.Name == name, cancellationToken))
            {
                continue;
            }

            db.Permissions.Add(new Permission { Name = name, Description = description });
        }

        await db.SaveChangesAsync(cancellationToken);
    }

    private static async Task SeedRolesAndPermissionsAsync(
        ApplicationDbContext db,
        RoleManager<IdentityRole<int>> roleManager,
        CancellationToken cancellationToken)
    {
        var adminRole = await EnsureRoleAsync(roleManager, AppRoles.Admin);
        var userRole = await EnsureRoleAsync(roleManager, AppRoles.User);

        var allPermissions = await db.Permissions.ToListAsync(cancellationToken);
        var permissionByName = allPermissions.ToDictionary(p => p.Name, StringComparer.OrdinalIgnoreCase);

        await AssignPermissionsAsync(db, adminRole.Id, allPermissions.Select(p => p.Name), permissionByName, cancellationToken);
        await AssignPermissionsAsync(
            db,
            userRole.Id,
            AppPermissions.UserRoleDefaults,
            permissionByName,
            cancellationToken);
    }

    private static async Task<IdentityRole<int>> EnsureRoleAsync(
        RoleManager<IdentityRole<int>> roleManager,
        string roleName)
    {
        var role = await roleManager.FindByNameAsync(roleName);
        if (role is not null)
        {
            return role;
        }

        var result = await roleManager.CreateAsync(new IdentityRole<int> { Name = roleName });
        if (!result.Succeeded)
        {
            throw new InvalidOperationException(
                $"Failed to create role '{roleName}': {string.Join(", ", result.Errors.Select(e => e.Description))}");
        }

        return (await roleManager.FindByNameAsync(roleName))!;
    }

    private static async Task AssignPermissionsAsync(
        ApplicationDbContext db,
        int roleId,
        IEnumerable<string> permissionNames,
        Dictionary<string, Permission> permissionByName,
        CancellationToken cancellationToken)
    {
        var existing = await db.RolePermissions
            .Where(rp => rp.RoleId == roleId)
            .Select(rp => rp.PermissionId)
            .ToListAsync(cancellationToken);

        foreach (var name in permissionNames)
        {
            if (!permissionByName.TryGetValue(name, out var permission))
            {
                continue;
            }

            if (existing.Contains(permission.Id))
            {
                continue;
            }

            db.RolePermissions.Add(new RolePermission { RoleId = roleId, PermissionId = permission.Id });
        }

        await db.SaveChangesAsync(cancellationToken);
    }

    private static async Task SeedUsersAsync(
        UserManager<ApplicationUser> userManager,
        CancellationToken cancellationToken)
    {
        await EnsureUserAsync(
            userManager,
            AdminEmail,
            AdminPassword,
            "GearHub Admin",
            AppRoles.Admin,
            cancellationToken);

        await EnsureUserAsync(
            userManager,
            UserEmail,
            UserPassword,
            "GearHub User",
            AppRoles.User,
            cancellationToken);
    }

    private static async Task EnsureUserAsync(
        UserManager<ApplicationUser> userManager,
        string email,
        string password,
        string displayName,
        string role,
        CancellationToken cancellationToken)
    {
        var user = await userManager.FindByEmailAsync(email);
        if (user is null)
        {
            user = new ApplicationUser
            {
                UserName = email,
                Email = email,
                DisplayName = displayName,
                EmailConfirmed = true,
            };

            var create = await userManager.CreateAsync(user, password);
            if (!create.Succeeded)
            {
                throw new InvalidOperationException(
                    $"Failed to create user '{email}': {string.Join(", ", create.Errors.Select(e => e.Description))}");
            }
        }
        else if (string.IsNullOrWhiteSpace(user.DisplayName))
        {
            user.DisplayName = displayName;
            await userManager.UpdateAsync(user);
        }

        if (!await userManager.IsInRoleAsync(user, role))
        {
            await userManager.AddToRoleAsync(user, role);
        }
    }
}
