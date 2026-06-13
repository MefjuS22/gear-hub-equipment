namespace GearHubDesktop.Shell;

public sealed class EquipmentFormNavigation
{
    public int? EquipmentId { get; init; }
}

public sealed class CmsPostFormNavigation
{
    public Guid? PostId { get; init; }
}

public sealed class PortalTextFormNavigation
{
    public string Key { get; init; } = string.Empty;
}
