namespace GearHubDesktop.Shell;

public enum NavSection
{
    Portal,
    Staff,
}

public sealed class NavItem
{
    public NavItem(
        NavSection section,
        string label,
        string target,
        string? requiredPermission = null)
    {
        Section = section;
        Label = label;
        Target = target;
        RequiredPermission = requiredPermission;
    }

    public NavSection Section { get; }
    public string Label { get; }
    public string Target { get; }
    public string? RequiredPermission { get; }
}
