namespace GearHub.Api.Models;

public class LoginEvent
{
    public int Id { get; set; }
    public int? UserId { get; set; }
    public ApplicationUser? User { get; set; }
    public string Email { get; set; } = string.Empty;
    public DateTime LoggedInAtUtc { get; set; }
    public bool Success { get; set; }
    public string? IpAddress { get; set; }
}
