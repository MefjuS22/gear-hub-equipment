using GearHub.Api.DTOs;
using GearHub.Api.Responses;

namespace GearHub.Api.Services;

public interface IUserAdminService
{
    Task<IReadOnlyList<UserAdminListDto>> GetAllAsync(CancellationToken cancellationToken = default);

    Task<ServiceResult<UserAdminListDto>> CreateAsync(
        CreateUserAdminDto dto,
        CancellationToken cancellationToken = default);

    Task<ServiceResult> SetRolesAsync(
        int userId,
        SetUserRolesDto dto,
        int currentUserId,
        CancellationToken cancellationToken = default);

    Task<ServiceResult> DeleteAsync(
        int userId,
        int currentUserId,
        CancellationToken cancellationToken = default);
}
