using System.Collections.ObjectModel;
using GearHubDesktop.Models;
using GearHubDesktop.Services;
using GearHubDesktop.Shell;
using Microsoft.Win32;

namespace GearHubDesktop.Views;

public partial class CustomersView : ViewControllerBase, ILoadableView
{
    private readonly GearHubApiClient _api;

    public CustomersView(GearHubApiClient api)
    {
        _api = api;
        InitializeComponent();
        DataContext = this;
    }

    public ObservableCollection<Customer> Customers { get; } = [];

    public async Task LoadAsync()
    {
        await RunAsync(async () =>
        {
            StatusMessage = null;
            var result = await _api.GetCustomersAsync(1, 200);
            Customers.Clear();
            foreach (var customer in result.Items)
            {
                Customers.Add(customer);
            }

            StatusMessage = $"{result.TotalCount} customer(s) loaded.";
        });
    }

    private async void ExportExcel_Click(object sender, System.Windows.RoutedEventArgs e)
    {
        var dialog = new SaveFileDialog
        {
            FileName = $"gearhub-customers-{DateTime.UtcNow:yyyyMMdd-HHmm}.xlsx",
            Filter = "Excel workbook (*.xlsx)|*.xlsx",
            DefaultExt = ".xlsx",
        };

        if (dialog.ShowDialog() != true)
        {
            return;
        }

        await RunAsync(async () =>
        {
            await _api.DownloadFileAsync("/api/Customer/export/excel", dialog.FileName);
            StatusMessage = "Customers export saved.";
        });
    }
}
