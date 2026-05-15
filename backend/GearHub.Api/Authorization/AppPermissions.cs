namespace GearHub.Api.Authorization;

/// <summary>
/// Permission names stored in the database and issued as JWT <c>permission</c> claims.
/// Authorization policies use the same string as the policy name.
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
