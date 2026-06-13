using System.Net.Http;
using GearHubDesktop.Services;
using GearHubDesktop.Shell;
using GearHubDesktop.Views;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace GearHubDesktop;

public sealed class AppBootstrapper
{
    public IServiceProvider Build()
    {
        var configuration = new ConfigurationBuilder()
            .SetBasePath(AppContext.BaseDirectory)
            .AddJsonFile("appsettings.json", optional: true)
            .Build();

        var apiSettings = configuration.GetSection("Api").Get<ApiSettings>() ?? new ApiSettings();

        var services = new ServiceCollection();
        services.AddSingleton(apiSettings);
        services.AddSingleton<IAuthSession, AuthSession>();
        services.AddSingleton<ICartService, CartService>();
        services.AddSingleton<MainShell>();
        services.AddSingleton<IAppNavigation>(sp => sp.GetRequiredService<MainShell>());
        services.AddSingleton<GearHubApiClient>(sp =>
        {
            var settings = sp.GetRequiredService<ApiSettings>();
            var http = new HttpClient
            {
                BaseAddress = new Uri(settings.BaseUrl.TrimEnd('/') + "/"),
                Timeout = TimeSpan.FromSeconds(60),
            };
            return new GearHubApiClient(http, sp.GetRequiredService<IAuthSession>());
        });
        services.AddSingleton<IRemoteImageService>(sp =>
        {
            var settings = sp.GetRequiredService<ApiSettings>();
            var http = new HttpClient
            {
                BaseAddress = new Uri(settings.BaseUrl.TrimEnd('/') + "/"),
                Timeout = TimeSpan.FromSeconds(60),
            };
            return new RemoteImageService(http, settings);
        });
        services.AddSingleton<IServiceProvider>(sp => sp);

        services.AddTransient<LoginView>();
        services.AddTransient<CatalogView>();
        services.AddTransient<EquipmentDetailView>();
        services.AddTransient<CartView>();
        services.AddTransient<NewsListView>();
        services.AddTransient<DashboardView>();
        services.AddTransient<OrdersView>();
        services.AddTransient<OrderDetailView>();
        services.AddTransient<EquipmentAdminView>();
        services.AddTransient<EquipmentFormView>();
        services.AddTransient<CustomersView>();
        services.AddTransient<CategoriesView>();
        services.AddTransient<BrandsView>();
        services.AddTransient<WarehousesView>();
        services.AddTransient<UsersView>();
        services.AddTransient<CmsPostsAdminView>();
        services.AddTransient<CmsPostFormView>();
        services.AddTransient<PortalTextsAdminView>();
        services.AddTransient<PortalTextFormView>();
        services.AddTransient<MaintenanceView>();
        services.AddTransient<PlaceholderView>();
        services.AddSingleton<MainWindow>();

        var provider = services.BuildServiceProvider();
        return provider;
    }
}
