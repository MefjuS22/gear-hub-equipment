using System.Collections.ObjectModel;
using GearHubDesktop.DTOs;
using GearHubDesktop.Services;
using Microsoft.Win32;

namespace GearHubDesktop.Views;

public partial class OrderDetailView : ViewControllerBase
{
    private readonly GearHubApiClient _api;
    private int _orderId;
    private RentalOrderListDto? _order;

    public OrderDetailView(GearHubApiClient api)
    {
        _api = api;
        InitializeComponent();
        DataContext = this;
    }

    public ObservableCollection<OrderLineRow> LineItems { get; } = [];

    public string HeaderText => _order is null ? "Order detail" : $"Order #{_order.Id}";

    public string CustomerLine =>
        _order is null ? string.Empty : $"Customer: {_order.CustomerCompanyName} (ID {_order.CustomerId})";

    public string UserLine =>
        _order is null ? string.Empty : $"Placed by: {_order.UserName} · {_order.UserEmail}";

    public string OrderDateLine =>
        _order is null ? string.Empty : $"Order date: {_order.OrderDate:g}";

    public string RentalPeriodLine =>
        _order is null
            ? string.Empty
            : $"Rental: {_order.RentalStartDate:d} – {_order.RentalEndDate:d}";

    public async Task LoadAsync(int orderId)
    {
        _orderId = orderId;
        await RunAsync(async () =>
        {
            StatusMessage = null;
            _order = await _api.GetOrderByIdAsync(orderId);
            LineItems.Clear();
            foreach (var item in _order.Items)
            {
                LineItems.Add(new OrderLineRow(item));
            }

            RaisePropertyChanged(nameof(HeaderText));
            RaisePropertyChanged(nameof(CustomerLine));
            RaisePropertyChanged(nameof(UserLine));
            RaisePropertyChanged(nameof(OrderDateLine));
            RaisePropertyChanged(nameof(RentalPeriodLine));
        });
    }

    private async void ExportPdf_Click(object sender, System.Windows.RoutedEventArgs e)
    {
        if (_orderId <= 0)
        {
            ErrorMessage = "No order loaded.";
            return;
        }

        var dialog = new SaveFileDialog
        {
            FileName = $"gearhub-order-{_orderId}-{DateTime.UtcNow:yyyyMMdd-HHmm}.pdf",
            Filter = "PDF document (*.pdf)|*.pdf",
            DefaultExt = ".pdf",
        };

        if (dialog.ShowDialog() != true)
        {
            return;
        }

        await RunAsync(async () =>
        {
            await _api.DownloadFileAsync($"/api/Order/{_orderId}/export/pdf", dialog.FileName);
            StatusMessage = "Order PDF export saved.";
        });
    }

    public sealed class OrderLineRow
    {
        public OrderLineRow(RentalOrderLineDto line)
        {
            EquipmentId = line.EquipmentId;
            EquipmentName = line.EquipmentName;
            Quantity = line.Quantity;
            UnitPrice = line.UnitPrice;
        }

        public int EquipmentId { get; }
        public string EquipmentName { get; }
        public int Quantity { get; }
        public decimal UnitPrice { get; }
        public string LineTotalDisplay => (UnitPrice * Quantity).ToString("C");
    }
}
