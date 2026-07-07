using System.Collections.ObjectModel;
using GearHubDesktop.DTOs;
using GearHubDesktop.Services;
using GearHubDesktop.Shell;
using GearHubDesktop.Views.Dialogs;

namespace GearHubDesktop.Views;

public partial class MaintenanceView : ViewControllerBase, ILoadableView
{
    private readonly GearHubApiClient _api;
    private readonly List<MaintenanceDto> _allItems = [];
    private string _filterText = string.Empty;
    private MaintenanceDto? _selectedItem;

    public MaintenanceView(GearHubApiClient api)
    {
        _api = api;
        InitializeComponent();
        DataContext = this;
    }

    public ObservableCollection<MaintenanceDto> Items { get; } = [];

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

    public MaintenanceDto? SelectedItem
    {
        get => _selectedItem;
        set => SetProperty(ref _selectedItem, value);
    }

    public async Task LoadAsync() => await ReloadAsync();

    private async void Add_Click(object sender, System.Windows.RoutedEventArgs e)
    {
        var equipment = await _api.GetEquipmentAsync(1, 500);
        if (equipment.Items.Count == 0)
        {
            ErrorMessage = "Add equipment before scheduling maintenance.";
            return;
        }

        var dialog = new MaintenanceDialog(equipment.Items);
        if (DialogWindowHelper.Show(dialog, 480, null) != true)
        {
            return;
        }

        await RunAsync(async () =>
        {
            await _api.CreateMaintenanceAsync(new MaintenanceUpsertDto
            {
                EquipmentId = dialog.EquipmentId,
                Date = dialog.Date,
                Description = dialog.Description,
            });

            StatusMessage = "Maintenance scheduled.";
            await ReloadCoreAsync();
        });
    }

    private async void Delete_Click(object sender, System.Windows.RoutedEventArgs e)
    {
        if (SelectedItem is null)
        {
            ErrorMessage = "Select a maintenance record to delete.";
            return;
        }

        if (System.Windows.MessageBox.Show(
                $"Delete maintenance for \"{SelectedItem.EquipmentName}\"?",
                "Confirm delete",
                System.Windows.MessageBoxButton.YesNo,
                System.Windows.MessageBoxImage.Warning) != System.Windows.MessageBoxResult.Yes)
        {
            return;
        }

        await RunAsync(async () =>
        {
            await _api.DeleteMaintenanceAsync(SelectedItem.Id);
            StatusMessage = "Maintenance deleted.";
            await ReloadCoreAsync();
        });
    }

    private async void Refresh_Click(object sender, System.Windows.RoutedEventArgs e) =>
        await ReloadAsync();

    private async Task ReloadAsync() => await RunAsync(ReloadCoreAsync);

    private async Task ReloadCoreAsync()
    {
        var result = await _api.GetMaintenancesAsync(1, 500);
        _allItems.Clear();
        _allItems.AddRange(result.Items);
        ApplyFilter();
        StatusMessage = $"{result.TotalCount} record(s) loaded.";
    }

    private void ApplyFilter()
    {
        Items.Clear();
        var query = FilterText.Trim();
        foreach (var item in _allItems.Where(row =>
                     string.IsNullOrWhiteSpace(query)
                     || row.EquipmentName.Contains(query, StringComparison.OrdinalIgnoreCase)
                     || row.Description.Contains(query, StringComparison.OrdinalIgnoreCase)
                     || row.Id.ToString().Contains(query, StringComparison.OrdinalIgnoreCase)))
        {
            Items.Add(item);
        }
    }
}
