using System.Windows.Controls;

namespace GearHubDesktop.Shell;

internal sealed class NavigationState
{
    public required string Target { get; init; }

    public object? Parameter { get; init; }

    public required UserControl Content { get; init; }

    public NavItem? SelectedNavItem { get; init; }
}
