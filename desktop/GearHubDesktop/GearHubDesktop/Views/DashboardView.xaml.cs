using GearHubDesktop.DTOs;
using GearHubDesktop.Services;
using GearHubDesktop.Shell;
using Microsoft.Win32;

namespace GearHubDesktop.Views;

public partial class DashboardView : ViewControllerBase, ILoadableView
{
    private readonly GearHubApiClient _api;
    private DashboardSummaryDto _summary = new();

    public DashboardView(GearHubApiClient api)
    {
        _api = api;
        InitializeComponent();
        DataContext = this;
    }

    public DashboardSummaryDto Summary
    {
        get => _summary;
        private set => SetProperty(ref _summary, value);
    }

    public string EstimatedRevenueDisplay => Summary.EstimatedRevenueLast30Days.ToString("C");

    public async Task LoadAsync()
    {
        await RunAsync(async () =>
        {
            StatusMessage = null;
            var stats = await _api.GetDashboardStatsAsync();
            Summary = stats.Summary;
            RaisePropertyChanged(nameof(EstimatedRevenueDisplay));
        });
    }

    private async void ExportExcel_Click(object sender, System.Windows.RoutedEventArgs e)
    {
        var dialog = new SaveFileDialog
        {
            FileName = $"gearhub-dashboard-{DateTime.UtcNow:yyyyMMdd-HHmm}.xlsx",
            Filter = "Excel workbook (*.xlsx)|*.xlsx",
            DefaultExt = ".xlsx",
        };

        if (dialog.ShowDialog() != true)
        {
            return;
        }

        await RunAsync(async () =>
        {
            await _api.DownloadFileAsync("/api/Dashboard/export/excel", dialog.FileName);
            StatusMessage = "Dashboard export saved.";
        });
    }
}
