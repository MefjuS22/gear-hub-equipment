using System.Collections.ObjectModel;
using GearHubDesktop.DTOs;
using GearHubDesktop.Services;
using GearHubDesktop.Shell;
using GearHubDesktop.Views.Dialogs;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Win32;

namespace GearHubDesktop.Views;

public partial class EquipmentAdminView : ViewControllerBase, ILoadableView
{
    private readonly GearHubApiClient _api;
    private readonly IServiceProvider _services;
    private string _searchText = string.Empty;
    private EquipmentDto? _selectedEquipment;

    public EquipmentAdminView(GearHubApiClient api, IServiceProvider services)
    {
        _api = api;
        _services = services;
        InitializeComponent();
        DataContext = this;
    }

    public ObservableCollection<EquipmentDto> Equipment { get; } = [];

    public string SearchText
    {
        get => _searchText;
        set => SetProperty(ref _searchText, value);
    }

    public EquipmentDto? SelectedEquipment
    {
        get => _selectedEquipment;
        set => SetProperty(ref _selectedEquipment, value);
    }

    public async Task LoadAsync() => await LoadEquipmentAsync();

    private async void Search_Click(object sender, System.Windows.RoutedEventArgs e) =>
        await LoadEquipmentAsync();

    private async void Refresh_Click(object sender, System.Windows.RoutedEventArgs e) =>
        await LoadEquipmentAsync();

    private async void Add_Click(object sender, System.Windows.RoutedEventArgs e)
    {
        if (await FormDialog.ShowEquipmentAsync(_services, null))
        {
            await LoadEquipmentAsync();
        }
    }

    private async void Edit_Click(object sender, System.Windows.RoutedEventArgs e)
    {
        if (SelectedEquipment is null)
        {
            ErrorMessage = "Select equipment to edit.";
            return;
        }

        ErrorMessage = null;
        if (await FormDialog.ShowEquipmentAsync(_services, SelectedEquipment.Id))
        {
            await LoadEquipmentAsync();
        }
    }

    private async void Delete_Click(object sender, System.Windows.RoutedEventArgs e)
    {
        if (SelectedEquipment is null)
        {
            ErrorMessage = "Select equipment to delete.";
            return;
        }

        var confirm = System.Windows.MessageBox.Show(
            $"Delete \"{SelectedEquipment.Name}\"?",
            "Confirm delete",
            System.Windows.MessageBoxButton.YesNo,
            System.Windows.MessageBoxImage.Warning);

        if (confirm != System.Windows.MessageBoxResult.Yes)
        {
            return;
        }

        await RunAsync(async () =>
        {
            await _api.DeleteEquipmentAsync(SelectedEquipment.Id);
            StatusMessage = "Equipment deleted.";
            await LoadEquipmentCoreAsync();
        });
    }

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

    private async Task LoadEquipmentAsync() => await RunAsync(LoadEquipmentCoreAsync);

    private async Task LoadEquipmentCoreAsync()
    {
        StatusMessage = null;
        var result = await _api.GetEquipmentAsync(1, 200, SearchText);
        Equipment.Clear();
        foreach (var item in result.Items)
        {
            Equipment.Add(item);
        }

        StatusMessage = $"{result.TotalCount} item(s) loaded.";
    }
}
