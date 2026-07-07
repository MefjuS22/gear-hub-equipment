using System.Collections.ObjectModel;
using GearHubDesktop.Models;
using GearHubDesktop.Services;
using GearHubDesktop.Shell;
using Microsoft.Win32;

namespace GearHubDesktop.Views;

public partial class CustomersView : ViewControllerBase, ILoadableView
{
    private readonly GearHubApiClient _api;
    private readonly List<Customer> _allCustomers = [];
    private string _filterText = string.Empty;

    public CustomersView(GearHubApiClient api)
    {
        _api = api;
        InitializeComponent();
        DataContext = this;
    }

    public ObservableCollection<Customer> Customers { get; } = [];

    public string FilterText
    {
        get => _filterText;
        set
        {
            if (Equals(_filterText, value))
            {
                return;
            }

            _filterText = value;
            RaisePropertyChanged();
            ApplyFilter();
        }
    }

    public async Task LoadAsync() => await ReloadAsync();

    private async void Refresh_Click(object sender, System.Windows.RoutedEventArgs e) =>
        await ReloadAsync();

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

    private async Task ReloadAsync() => await RunAsync(ReloadCoreAsync);

    private async Task ReloadCoreAsync()
    {
        StatusMessage = null;
        var result = await _api.GetCustomersAsync(1, 500);
        _allCustomers.Clear();
        _allCustomers.AddRange(result.Items);
        ApplyFilter();
        StatusMessage = $"{result.TotalCount} customer(s) loaded.";
    }

    private void ApplyFilter()
    {
        Customers.Clear();
        var query = FilterText.Trim();
        foreach (var customer in _allCustomers.Where(c =>
                     string.IsNullOrWhiteSpace(query)
                     || c.CompanyName.Contains(query, StringComparison.OrdinalIgnoreCase)
                     || c.ContactPerson.Contains(query, StringComparison.OrdinalIgnoreCase)
                     || c.Id.ToString().Contains(query, StringComparison.OrdinalIgnoreCase)))
        {
            Customers.Add(customer);
        }
    }
}
