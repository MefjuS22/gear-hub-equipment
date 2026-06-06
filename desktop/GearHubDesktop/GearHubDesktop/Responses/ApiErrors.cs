namespace GearHubDesktop.Responses;

public enum ApiErrorCode
{
    Unknown = 0,
    ValidationFailed = 1,
    InternalError = 2,

    EquipmentNotFound = 100,
    EquipmentReferenceInvalid = 101,
    EquipmentReloadFailed = 102,

    OrderCustomerNotFound = 200,
    OrderUserNotFound = 201,
    OrderEquipmentNotFound = 202,
    OrderEquipmentUnavailable = 203,
    OrderNotFound = 204,

    BrandNotFound = 300,
    BrandInUse = 301,
    CategoryNotFound = 302,
    CategoryInUse = 303,
    WarehouseNotFound = 304,
    WarehouseInUse = 305,

    CmsPostNotFound = 306,
    CmsPostSlugTaken = 307,

    FileUploadInvalid = 308,
    PortalTextNotFound = 309,

    AuthInvalidCredentials = 400,
    AuthRoleNotFound = 401,
    AuthForbidden = 403,

    UserNotFound = 410,
    UserEmailTaken = 411,
    UserCannotDeleteSelf = 412,
    UserLastAdmin = 413,
}

public sealed class ApiErrorResponse
{
    public ApiErrorCode Code { get; set; }
    public string Message { get; set; } = string.Empty;
    public Dictionary<string, string[]>? Errors { get; set; }
}
