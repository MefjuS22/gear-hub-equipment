namespace GearHub.Api.Services;

public static class FileStoragePathHelper
{
    public static string ResolveAbsoluteRoot(string contentRoot, string configuredRoot)
    {
        return Path.IsPathRooted(configuredRoot)
            ? Path.GetFullPath(configuredRoot)
            : Path.GetFullPath(Path.Combine(contentRoot, configuredRoot));
    }
}
