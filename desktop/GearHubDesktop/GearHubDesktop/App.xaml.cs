using System.Windows;
using GearHubDesktop.Services;
using Microsoft.Extensions.DependencyInjection;

namespace GearHubDesktop;

public partial class App : Application
{
    public static IServiceProvider Services { get; private set; } = null!;

    protected override async void OnStartup(StartupEventArgs e)
    {
        base.OnStartup(e);

        try
        {
            var bootstrap = new AppBootstrapper();
            Services = bootstrap.Build();

            var session = Services.GetRequiredService<IAuthSession>();
            await session.LoadAsync();
            var cart = Services.GetRequiredService<ICartService>();
            await cart.LoadAsync();

            var mainWindow = Services.GetRequiredService<MainWindow>();
            MainWindow = mainWindow;
            ShutdownMode = ShutdownMode.OnMainWindowClose;
            mainWindow.Show();
        }
        catch (Exception ex)
        {
            MessageBox.Show(
                ex.ToString(),
                "GearHub failed to start",
                MessageBoxButton.OK,
                MessageBoxImage.Error);
            Shutdown(1);
        }
    }
}
