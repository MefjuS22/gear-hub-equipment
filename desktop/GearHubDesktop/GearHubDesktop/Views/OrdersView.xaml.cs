using System.Collections.ObjectModel;
using GearHubDesktop.DTOs;
using GearHubDesktop.Services;
using GearHubDesktop.Shell;
using Microsoft.Win32;

namespace GearHubDesktop.Views;

public partial class OrdersView : ViewControllerBase, ILoadableView
{
    private readonly GearHubApiClient _api;
    private readonly IAppNavigation _navigation;
    private string _searchText = string.Empty;
    private RentalOrderListDto? _selectedOrder;

    public OrdersView(GearHubApiClient api, IAppNavigation navigation)
    {
        _api = api;
        _navigation = navigation;
        InitializeComponent();
        DataContext = this;
    }

    public ObservableCollection<RentalOrderListDto> Orders { get; } = [];

    public string SearchText
    {
        get => _searchText;
        set => SetProperty(ref _searchText, value);
    }

    public RentalOrderListDto? SelectedOrder
    {
        get => _selectedOrder;
        set => SetProperty(ref _selectedOrder, value);
    }

    public async Task LoadAsync() => await LoadOrdersAsync();

    private async void Search_Click(object sender, System.Windows.RoutedEventArgs e) =>
        await LoadOrdersAsync();

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

    private async void ExportPdf_Click(object sender, System.Windows.RoutedEventArgs e)
    {
        var dialog = new SaveFileDialog
        {
            FileName = $"gearhub-orders-{DateTime.UtcNow:yyyyMMdd-HHmm}.pdf",
            Filter = "PDF document (*.pdf)|*.pdf",
            DefaultExt = ".pdf",
        };

        if (dialog.ShowDialog() != true)
        {
            return;
        }

        await RunAsync(async () =>
        {
            await _api.DownloadFileAsync(
                "/api/Order/export/pdf",
                dialog.FileName,
                new Dictionary<string, string?> { ["search"] = SearchText });
            StatusMessage = "Orders PDF export saved.";
        });
    }

    private async Task LoadOrdersAsync()
    {
        await RunAsync(async () =>
        {
            StatusMessage = null;
            var result = await _api.GetOrdersAsync(1, 100, SearchText);
            Orders.Clear();
            foreach (var order in result.Items)
            {
                Orders.Add(order);
            }

            StatusMessage = $"{result.TotalCount} order(s) loaded.";
        });
    }
}
