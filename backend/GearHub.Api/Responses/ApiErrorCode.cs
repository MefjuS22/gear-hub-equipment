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
}
