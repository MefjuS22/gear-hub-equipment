using System.Windows.Media;

namespace GearHubDesktop.Services;

public interface IRemoteImageService
{
    Task<ImageSource?> LoadAsync(string? publicPathOrUrl, CancellationToken cancellationToken = default);
}
