using System.Collections.ObjectModel;
using GearHubDesktop.DTOs;
using GearHubDesktop.Services;
using GearHubDesktop.Shell;
using Microsoft.Win32;

namespace GearHubDesktop.Views;

public partial class EquipmentAdminView : ViewControllerBase, ILoadableView
{
    private readonly GearHubApiClient _api;
    private string _searchText = string.Empty;

    public EquipmentAdminView(GearHubApiClient api)
    {
        _api = api;
        InitializeComponent();
        DataContext = this;
    }

    public ObservableCollection<EquipmentDto> Equipment { get; } = [];

    public string SearchText
    {
        get => _searchText;
        set => SetProperty(ref _searchText, value);
    }

    public async Task LoadAsync() => await LoadEquipmentAsync();

    private async void Search_Click(object sender, System.Windows.RoutedEventArgs e) =>
        await LoadEquipmentAsync();

    private async void Refresh_Click(object sender, System.Windows.RoutedEventArgs e) =>
        await LoadEquipmentAsync();

    private async void ExportExcel_Click(object sender, System.Windows.RoutedEventArgs e)
    {
        var dialog = new SaveFileDialog
        {
            FileName = $"gearhub-equipment-{DateTime.UtcNow:yyyyMMdd-HHmm}.xlsx",
            Filter = "Excel workbook (*.xlsx)|*.xlsx",
            DefaultExt = ".xlsx",
        };

        if (dialog.ShowDialog() != true)
        {
            return;
        }

        await RunAsync(async () =>
        {
            await _api.DownloadFileAsync("/api/Equipment/export/excel", dialog.FileName);
            StatusMessage = "Equipment export saved.";
        });
    }

    private async Task LoadEquipmentAsync()
    {
        await RunAsync(async () =>
        {
            StatusMessage = null;
            var result = await _api.GetEquipmentAsync(1, 200, SearchText);
            Equipment.Clear();
            foreach (var item in result.Items)
            {
                Equipment.Add(item);
            }

            StatusMessage = $"{result.TotalCount} item(s) loaded.";
        });
    }
}
