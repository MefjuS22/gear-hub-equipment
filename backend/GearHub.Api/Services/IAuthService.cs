using GearHub.Api.DTOs;
using GearHub.Api.Models;

namespace GearHub.Api.Services;

public interface IAuthService
{
    Task<ServiceResult<AuthResponseDto>> LoginAsync(LoginRequestDto request, CancellationToken cancellationToken = default);
    Task<ServiceResult<AuthResponseDto>> RegisterAsync(RegisterUserRequestDto request, CancellationToken cancellationToken = default);
    Task<ServiceResult<UserProfileDto>> GetProfileAsync(ApplicationUser user, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<string>> GetPermissionsForUserAsync(ApplicationUser user, CancellationToken cancellationToken = default);
}
