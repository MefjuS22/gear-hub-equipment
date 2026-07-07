using GearHubDesktop.Shell;
using Microsoft.Extensions.DependencyInjection;

namespace GearHubDesktop;

public partial class MainWindow
{
    private readonly MainShell _shell;

    public MainWindow()
    {
        InitializeComponent();
        _shell = App.Services.GetRequiredService<MainShell>();
        DataContext = _shell;
        _shell.Initialize();
    }

    private void PortalButton_OnClick(object sender, System.Windows.RoutedEventArgs e) =>
        _shell.SelectedSection = NavSection.Portal;

    private void StaffButton_OnClick(object sender, System.Windows.RoutedEventArgs e) =>
        _shell.SelectedSection = NavSection.Staff;

    private void LogoutButton_OnClick(object sender, System.Windows.RoutedEventArgs e) =>
        _shell.Logout();

    private void BackButton_OnClick(object sender, System.Windows.RoutedEventArgs e) =>
        _shell.GoBack();
}
