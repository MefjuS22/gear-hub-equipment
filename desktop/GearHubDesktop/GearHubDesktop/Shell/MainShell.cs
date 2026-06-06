using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Runtime.CompilerServices;
using System.Windows.Controls;
using GearHubDesktop.Authorization;
using GearHubDesktop.Services;
using GearHubDesktop.Views;
using Microsoft.Extensions.DependencyInjection;

namespace GearHubDesktop.Shell;

public sealed class MainShell : INotifyPropertyChanged, IAppNavigation
{
    private readonly IServiceProvider _services;
    private readonly IAuthSession _session;
    private readonly ICartService _cart;
    private readonly GearHubApiClient _api;

    private UserControl? _currentContent;
    private NavSection _selectedSection = NavSection.Portal;

    private LoginView? _loginContent;

    public MainShell(
        IServiceProvider services,
        IAuthSession session,
        ICartService cart,
        GearHubApiClient api)
    {
        _services = services;
        _session = session;
        _cart = cart;
        _api = api;
        NavItems = BuildNavItems();
        _session.Changed += (_, _) => OnSessionChanged();
        _cart.Changed += (_, _) => RaisePropertyChanged(nameof(CartCount));
    }

    public ObservableCollection<NavItem> NavItems { get; }

    public LoginView LoginContent =>
        _loginContent ??= CreateLoginContent();

    private LoginView CreateLoginContent()
    {
        var view = _services.GetRequiredService<LoginView>();
        view.DataContext = view;
        return view;
    }

    public UserControl? CurrentContent
    {
        get => _currentContent;
        private set
        {
            if (ReferenceEquals(_currentContent, value))
            {
                return;
            }

            _currentContent = value;
            RaisePropertyChanged();
        }
    }

    public NavSection SelectedSection
    {
        get => _selectedSection;
        set
        {
            if (_selectedSection == value)
            {
                return;
            }

            _selectedSection = value;
            RaisePropertyChanged();
            RaisePropertyChanged(nameof(VisibleNavItems));
            NavigateToDefaultForSection();
        }
    }

    public bool IsAuthenticated => _session.IsAuthenticated;
    public bool ShowStaff => _session.IsAdmin;
    public string UserLabel => _session.User?.Email ?? "Guest";
    public int CartCount => _cart.ItemCount;

    public IEnumerable<NavItem> VisibleNavItems =>
        NavItems.Where(item =>
            item.Section == SelectedSection
            && (item.RequiredPermission is null || _session.HasPermission(item.RequiredPermission))
            && (item.Section != NavSection.Staff || ShowStaff));

    public event PropertyChangedEventHandler? PropertyChanged;

    public void Initialize()
    {
        if (_session.IsAuthenticated)
        {
            _api.ApplyAuthHeader();
            SelectedSection = NavSection.Portal;
            NavigateTo("portal-catalog");
        }
        else
        {
            RefreshAuthState();
        }
    }

    public void OnAuthenticated()
    {
        RefreshAuthState();
        SelectedSection = NavSection.Portal;
        NavigateTo("portal-catalog");
    }

    public void Logout()
    {
        _session.Clear();
        _ = _session.SaveAsync();
        CurrentContent = null;
        RefreshAuthState();
    }

    public void NavigateTo(string target, object? parameter = null)
    {
        CurrentContent = target switch
        {
            "portal-catalog" => CreateAndLoad<CatalogView>(),
            "portal-cart" => CreateAndLoad<CartView>(),
            "portal-news" => CreateAndLoad<NewsListView>(),
            "portal-equipment" when parameter is int equipmentId => CreateAndLoad(
                _services.GetRequiredService<EquipmentDetailView>(),
                view => view.LoadAsync(equipmentId)),
            "staff-dashboard" => CreateAndLoad<DashboardView>(),
            "staff-orders" => CreateAndLoad<OrdersView>(),
            "staff-order" when parameter is int orderId => CreateAndLoad(
                _services.GetRequiredService<OrderDetailView>(),
                view => view.LoadAsync(orderId)),
            "staff-equipment" => CreateAndLoad<EquipmentAdminView>(),
            "staff-customers" => CreateAndLoad<CustomersView>(),
            "staff-categories" => CreateAndLoad<CategoriesView>(),
            "staff-brands" => CreateAndLoad<BrandsView>(),
            "staff-warehouses" => CreateAndLoad<WarehousesView>(),
            "staff-users" => CreateAndLoad<UsersView>(),
            "staff-cms" => CreatePlaceholder("Portal content", "Use the web app to edit CMS posts and portal copy."),
            "staff-maintenance" => CreatePlaceholder("Maintenance", "Maintenance scheduling is not available yet."),
            _ => CurrentContent,
        };
    }

    public void NavigateTo(NavItem item) => NavigateTo(item.Target);

    private void NavigateToDefaultForSection()
    {
        NavigateTo(SelectedSection == NavSection.Portal ? "portal-catalog" : "staff-dashboard");
    }

    private T CreateAndLoad<T>()
        where T : ViewControllerBase, ILoadableView
    {
        var view = _services.GetRequiredService<T>();
        view.DataContext = view;
        _ = view.LoadAsync();
        return view;
    }

    private static T CreateAndLoad<T>(T view, Func<T, Task> loadAsync)
        where T : ViewControllerBase
    {
        view.DataContext = view;
        _ = loadAsync(view);
        return view;
    }

    private PlaceholderView CreatePlaceholder(string title, string message)
    {
        var view = _services.GetRequiredService<PlaceholderView>();
        view.Configure(title, message);
        view.DataContext = view;
        return view;
    }

    private void OnSessionChanged()
    {
        RefreshAuthState();
        if (_session.IsAuthenticated)
        {
            _api.ApplyAuthHeader();
            NavigateToDefaultForSection();
        }
        else
        {
            CurrentContent = null;
        }
    }

    private void RefreshAuthState()
    {
        RaisePropertyChanged(nameof(IsAuthenticated));
        RaisePropertyChanged(nameof(ShowStaff));
        RaisePropertyChanged(nameof(UserLabel));
        RaisePropertyChanged(nameof(VisibleNavItems));
    }

    private void RaisePropertyChanged([CallerMemberName] string? propertyName = null) =>
        PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));

    private static ObservableCollection<NavItem> BuildNavItems() =>
    [
        new NavItem(NavSection.Portal, "Catalog", "portal-catalog"),
        new NavItem(NavSection.Portal, "Cart", "portal-cart"),
        new NavItem(NavSection.Portal, "News", "portal-news"),
        new NavItem(NavSection.Staff, "Dashboard", "staff-dashboard", AppPermissions.DashboardRead),
        new NavItem(NavSection.Staff, "Orders", "staff-orders", AppPermissions.OrdersRead),
        new NavItem(NavSection.Staff, "Equipment", "staff-equipment", AppPermissions.EquipmentRead),
        new NavItem(NavSection.Staff, "Categories", "staff-categories", AppPermissions.CategoriesManage),
        new NavItem(NavSection.Staff, "Brands", "staff-brands", AppPermissions.BrandsManage),
        new NavItem(NavSection.Staff, "Warehouses", "staff-warehouses", AppPermissions.WarehousesManage),
        new NavItem(NavSection.Staff, "Customers", "staff-customers", AppPermissions.CustomersRead),
        new NavItem(NavSection.Staff, "Users", "staff-users", AppPermissions.UsersManage),
        new NavItem(NavSection.Staff, "Portal content", "staff-cms", AppPermissions.CmsManage),
        new NavItem(NavSection.Staff, "Maintenance", "staff-maintenance", AppPermissions.EquipmentRead),
    ];
}
