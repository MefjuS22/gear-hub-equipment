using GearHub.Api.Responses;

namespace GearHub.Api.Services;

public sealed record ServiceError(ApiErrorCode Code, string Message);

public sealed class ServiceResult
{
    public bool Success { get; }
    public ServiceError? Error { get; }

    private ServiceResult(bool success, ServiceError? error)
    {
        Success = success;
        Error = error;
    }

    public static ServiceResult Ok() => new(true, null);

    public static ServiceResult Fail(ApiErrorCode code, string message) =>
        new(false, new ServiceError(code, message));
}

public sealed class ServiceResult<T>
{
    public bool Success { get; }
    public T? Value { get; }
    public ServiceError? Error { get; }

    private ServiceResult(bool success, T? value, ServiceError? error)
    {
        Success = success;
        Value = value;
        Error = error;
    }

    public static ServiceResult<T> Ok(T value) => new(true, value, null);

    public static ServiceResult<T> Fail(ApiErrorCode code, string message) =>
        new(false, default, new ServiceError(code, message));
}
