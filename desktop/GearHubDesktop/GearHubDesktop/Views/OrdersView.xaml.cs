using System.Collections.ObjectModel;
using GearHubDesktop.DTOs;
using GearHubDesktop.Models;
using GearHubDesktop.Services;
using GearHubDesktop.Shell;
using Microsoft.Win32;

namespace GearHubDesktop.Views;

public partial class OrdersView : ViewControllerBase, ILoadableView
{
    private readonly GearHubApiClient _api;
    private readonly IAppNavigation _navigation;
    private string _searchText = string.Empty;
    private DateTime? _orderDateFrom;
    private DateTime? _orderDateTo;
    private RentalOrderListDto? _selectedOrder;
    private Customer? _selectedCustomer;
    private bool _allCustomers = true;

    public OrdersView(GearHubApiClient api, IAppNavigation navigation)
    {
        _api = api;
        _navigation = navigation;
        InitializeComponent();
        DataContext = this;
    }

    public ObservableCollection<RentalOrderListDto> Orders { get; } = [];
    public ObservableCollection<Customer> Customers { get; } = [];

    public string SearchText
    {
        get => _searchText;
        set => SetProperty(ref _searchText, value);
    }

    public DateTime? OrderDateFrom
    {
        get => _orderDateFrom;
        set => SetProperty(ref _orderDateFrom, value);
    }

    public DateTime? OrderDateTo
    {
        get => _orderDateTo;
        set => SetProperty(ref _orderDateTo, value);
    }

    public RentalOrderListDto? SelectedOrder
    {
        get => _selectedOrder;
        set => SetProperty(ref _selectedOrder, value);
    }

    public Customer? SelectedCustomer
    {
        get => _selectedCustomer;
        set
        {
            SetProperty(ref _selectedCustomer, value);
            AllCustomers = value is null;
        }
    }

    public bool AllCustomers
    {
        get => _allCustomers;
        set => SetProperty(ref _allCustomers, value);
    }

    public async Task LoadAsync()
    {
        await RunAsync(async () =>
        {
            var customers = await _api.GetCustomersAsync(1, 500);
            Customers.Clear();
            foreach (var customer in customers.Items)
            {
                Customers.Add(customer);
            }

            await LoadOrdersCoreAsync();
        });
    }

    private async void Search_Click(object sender, System.Windows.RoutedEventArgs e) =>
        await LoadOrdersAsync();

    private async void Refresh_Click(object sender, System.Windows.RoutedEventArgs e) =>
        await LoadOrdersAsync();

    private async void ClearFilters_Click(object sender, System.Windows.RoutedEventArgs e)
    {
        SearchText = string.Empty;
        OrderDateFrom = null;
        OrderDateTo = null;
        SelectedCustomer = null;
        AllCustomers = true;
        await LoadOrdersAsync();
    }

    private void OpenOrder_Click(object sender, System.Windows.RoutedEventArgs e) => OpenSelectedOrder();

    private void OrdersGrid_MouseDoubleClick(object sender, System.Windows.Input.MouseButtonEventArgs e) =>
        OpenSelectedOrder();

    private void OpenSelectedOrder()
    {
        if (SelectedOrder is null)
        {
            ErrorMessage = "Select an order first.";
            return;
        }

        ErrorMessage = null;
        _navigation.NavigateTo("staff-order", SelectedOrder.Id);
    }

    private Dictionary<string, string?> BuildExportQuery() =>
        new()
        {
            ["search"] = SearchText,
            ["orderDateFrom"] = OrderDateFrom?.ToString("yyyy-MM-dd"),
            ["orderDateTo"] = OrderDateTo?.ToString("yyyy-MM-dd"),
            ["customerId"] = AllCustomers || SelectedCustomer is null ? null : SelectedCustomer.Id.ToString(),
        };

    private async void ExportPdf_Click(object sender, System.Windows.RoutedEventArgs e) =>
        await ExportAsync("pdf", "/api/Order/export/pdf", "PDF document (*.pdf)|*.pdf", ".pdf");

    private async void ExportExcel_Click(object sender, System.Windows.RoutedEventArgs e) =>
        await ExportAsync("xlsx", "/api/Order/export/excel", "Excel workbook (*.xlsx)|*.xlsx", ".xlsx");

    private async Task ExportAsync(string ext, string path, string filter, string defaultExt)
    {
        var dialog = new SaveFileDialog
        {
            FileName = $"gearhub-orders-{DateTime.UtcNow:yyyyMMdd-HHmm}.{ext}",
            Filter = filter,
            DefaultExt = defaultExt,
        };

        if (dialog.ShowDialog() != true)
        {
            return;
        }

        await RunAsync(async () =>
        {
            await _api.DownloadFileAsync(path, dialog.FileName, BuildExportQuery());
            StatusMessage = "Export saved.";
        });
    }

    private async Task LoadOrdersAsync()
    {
        await RunAsync(LoadOrdersCoreAsync);
    }

    private async Task LoadOrdersCoreAsync()
    {
        StatusMessage = null;
        int? customerId = AllCustomers || SelectedCustomer is null ? null : SelectedCustomer.Id;
        var result = await _api.GetOrdersAsync(1, 100, SearchText, OrderDateFrom, OrderDateTo, customerId);
        Orders.Clear();
        foreach (var order in result.Items)
        {
            Orders.Add(order);
        }

        StatusMessage = $"{result.TotalCount} order(s) loaded.";
    }
}
