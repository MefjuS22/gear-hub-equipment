namespace GearHubDesktop.Authorization;

/// <summary>
/// Permission names returned to clients on GET /api/Auth/me and in login/register payloads.
/// </summary>
public static class AppPermissions
{
    public const string EquipmentRead = "equipment.read";
    public const string EquipmentManage = "equipment.manage";

    public const string BrandsManage = "brands.manage";
    public const string CategoriesManage = "categories.manage";
    public const string WarehousesManage = "warehouses.manage";

    public const string CustomersRead = "customers.read";

    public const string OrdersRead = "orders.read";
    public const string OrdersCreate = "orders.create";
    public const string DashboardRead = "dashboard.read";

    public const string CmsReadPublished = "cms.read.published";
    public const string CmsManage = "cms.manage";

    public const string FilesUpload = "files.upload";

    public const string UsersManage = "users.manage";

    public static IReadOnlyList<string> All { get; } =
    [
        EquipmentRead,
        EquipmentManage,
        BrandsManage,
        CategoriesManage,
        WarehousesManage,
        CustomersRead,
        OrdersRead,
        OrdersCreate,
        DashboardRead,
        CmsReadPublished,
        CmsManage,
        FilesUpload,
        UsersManage,
    ];

    /// <summary>Permissions granted to the <see cref="AppRoles.User"/> role.</summary>
    public static IReadOnlyList<string> UserRoleDefaults { get; } =
    [
        EquipmentRead,
        CustomersRead,
        OrdersRead,
        OrdersCreate,
        CmsReadPublished,
    ];
}
