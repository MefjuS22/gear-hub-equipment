using System.Text.Json;
using GearHubDesktop.Authorization;
using GearHubDesktop.DTOs;

namespace GearHubDesktop.Services;

public interface IAuthSession
{
    bool IsAuthenticated { get; }
    bool IsAdmin { get; }
    UserProfileDto? User { get; }
    string? AccessToken { get; }
    event EventHandler? Changed;
    void SetSession(AuthResponseDto auth);
    void Clear();
    bool HasPermission(string permission);
    Task LoadAsync();
    Task SaveAsync();
}

public sealed class AuthSession : IAuthSession
{
    private static readonly string StoragePath = Path.Combine(
        Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
        "GearHub",
        "session.json");

    private UserProfileDto? _user;
    private string? _accessToken;
    private DateTime? _expiresAtUtc;

    public bool IsAuthenticated =>
        !string.IsNullOrWhiteSpace(_accessToken)
        && _expiresAtUtc is { } expiry
        && expiry > DateTime.UtcNow;

    public bool IsAdmin => _user?.Roles.Contains(AppRoles.Admin) == true;

    public UserProfileDto? User => _user;

    public string? AccessToken => _accessToken;

    public event EventHandler? Changed;

    public void SetSession(AuthResponseDto auth)
    {
        _accessToken = auth.AccessToken;
        _expiresAtUtc = auth.ExpiresAtUtc;
        _user = auth.User;
        Changed?.Invoke(this, EventArgs.Empty);
    }

    public void Clear()
    {
        _accessToken = null;
        _expiresAtUtc = null;
        _user = null;
        Changed?.Invoke(this, EventArgs.Empty);
    }

    public bool HasPermission(string permission) =>
        _user?.Permissions.Contains(permission) == true;

    public async Task LoadAsync()
    {
        if (!File.Exists(StoragePath))
        {
            return;
        }

        var json = await File.ReadAllTextAsync(StoragePath);
        var stored = JsonSerializer.Deserialize<StoredSession>(json, ApiJson.Options);
        if (stored is null || string.IsNullOrWhiteSpace(stored.AccessToken))
        {
            return;
        }

        SetSession(new AuthResponseDto
        {
            AccessToken = stored.AccessToken,
            ExpiresAtUtc = stored.ExpiresAtUtc,
            User = stored.User ?? new UserProfileDto(),
        });
    }

    public async Task SaveAsync()
    {
        var directory = Path.GetDirectoryName(StoragePath)!;
        Directory.CreateDirectory(directory);

        if (!IsAuthenticated)
        {
            if (File.Exists(StoragePath))
            {
                File.Delete(StoragePath);
            }

            return;
        }

        var stored = new StoredSession
        {
            AccessToken = _accessToken!,
            ExpiresAtUtc = _expiresAtUtc ?? DateTime.UtcNow,
            User = _user ?? new UserProfileDto(),
        };
        await File.WriteAllTextAsync(StoragePath, JsonSerializer.Serialize(stored, ApiJson.Options));
    }

    private sealed class StoredSession
    {
        public string AccessToken { get; set; } = string.Empty;
        public DateTime ExpiresAtUtc { get; set; }
        public UserProfileDto? User { get; set; }
    }
}
