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
    private NavItem? _selectedNavItem;
    private bool _suppressNavSelection;

    private LoginView? _loginContent;

    private readonly Stack<NavigationState> _backStack = new();
    private string? _currentTarget;
    private object? _currentParameter;

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
            RaisePropertyChanged(nameof(IsPortalSection));
            RaisePropertyChanged(nameof(IsStaffSection));
            NavigateToDefaultForSection();
        }
    }

    public NavItem? SelectedNavItem
    {
        get => _selectedNavItem;
        set
        {
            if (ReferenceEquals(_selectedNavItem, value))
            {
                return;
            }

            _selectedNavItem = value;
            RaisePropertyChanged();
            if (!_suppressNavSelection && value is not null)
            {
                NavigateTo(value.Target);
            }
        }
    }

    public bool IsPortalSection => SelectedSection == NavSection.Portal;

    public bool IsStaffSection => SelectedSection == NavSection.Staff;

    public bool IsAuthenticated => _session.IsAuthenticated;
    public bool ShowStaff => _session.IsAdmin;
    public string UserLabel => _session.User?.Email ?? "Guest";
    public int CartCount => _cart.ItemCount;

    public bool CanGoBack => _backStack.Count > 0;

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
        ClearNavigationHistory();
        CurrentContent = null;
        RefreshAuthState();
    }

    public void GoBack()
    {
        if (_backStack.Count == 0)
        {
            return;
        }

        var state = _backStack.Pop();
        _currentTarget = state.Target;
        _currentParameter = state.Parameter;

        _suppressNavSelection = true;
        _selectedNavItem = state.SelectedNavItem;
        RaisePropertyChanged(nameof(SelectedNavItem));
        _suppressNavSelection = false;

        CurrentContent = state.Content;
        RaisePropertyChanged(nameof(CanGoBack));
    }

    public void NavigateTo(string target, object? parameter = null)
    {
        var isTopLevelNav = parameter is null && NavItems.Any(item => item.Target == target);
        if (isTopLevelNav)
        {
            ClearNavigationHistory();
        }
        else if (CurrentContent is not null)
        {
            _backStack.Push(new NavigationState
            {
                Target = _currentTarget ?? string.Empty,
                Parameter = _currentParameter,
                Content = CurrentContent,
                SelectedNavItem = _selectedNavItem,
            });
            RaisePropertyChanged(nameof(CanGoBack));
        }

        _currentTarget = target;
        _currentParameter = parameter;

        var navItem = NavItems.FirstOrDefault(item => item.Target == target);
        if (navItem is not null)
        {
            _suppressNavSelection = true;
            _selectedNavItem = navItem;
            RaisePropertyChanged(nameof(SelectedNavItem));
            _suppressNavSelection = false;
        }

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
            "staff-equipment-form" when parameter is EquipmentFormNavigation nav => CreateAndLoad(
                _services.GetRequiredService<EquipmentFormView>(),
                view => view.LoadAsync(nav.EquipmentId)),
            "staff-customers" => CreateAndLoad<CustomersView>(),
            "staff-categories" => CreateAndLoad<CategoriesView>(),
            "staff-brands" => CreateAndLoad<BrandsView>(),
            "staff-warehouses" => CreateAndLoad<WarehousesView>(),
            "staff-users" => CreateAndLoad<UsersView>(),
            "staff-cms" => CreateAndLoad<CmsPostsAdminView>(),
            "staff-cms-post-form" when parameter is CmsPostFormNavigation nav => CreateAndLoad(
                _services.GetRequiredService<CmsPostFormView>(),
                view => view.LoadAsync(nav.PostId)),
            "staff-portal-texts" => CreateAndLoad<PortalTextsAdminView>(),
            "staff-portal-text-form" when parameter is PortalTextFormNavigation nav => CreateAndLoad(
                _services.GetRequiredService<PortalTextFormView>(),
                view => view.LoadAsync(nav.Key)),
            "staff-maintenance" => CreateAndLoad<MaintenanceView>(),
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

    private void ClearNavigationHistory()
    {
        _backStack.Clear();
        _currentTarget = null;
        _currentParameter = null;
        RaisePropertyChanged(nameof(CanGoBack));
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
