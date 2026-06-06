using System.Windows.Media.Imaging;

namespace GearHubDesktop.Services;

public interface IRemoteImageService
{
    Task<BitmapImage?> LoadAsync(string? publicPathOrUrl, CancellationToken cancellationToken = default);
}
