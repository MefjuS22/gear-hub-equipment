namespace GearHub.Api.Responses;

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

    BrandNotFound = 300,
    BrandInUse = 301,
    CategoryNotFound = 302,
    CategoryInUse = 303,
    WarehouseNotFound = 304,
    WarehouseInUse = 305,

    CmsPostNotFound = 306,
    CmsPostSlugTaken = 307,
}
