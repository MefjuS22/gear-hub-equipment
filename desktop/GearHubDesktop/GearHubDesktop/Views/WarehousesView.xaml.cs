using System.Collections.ObjectModel;
using GearHubDesktop.Services;
using GearHubDesktop.Shell;
using GearHubDesktop.Views.Dialogs;

namespace GearHubDesktop.Views;

public partial class WarehousesView : ViewControllerBase, ILoadableView
{
    private readonly GearHubApiClient _api;
    private readonly List<LookupGridRow> _allItems = [];
    private string _filterText = string.Empty;
    private LookupGridRow? _selectedItem;

    public WarehousesView(GearHubApiClient api)
    {
        _api = api;
        InitializeComponent();
        DataContext = this;
    }

    public ObservableCollection<LookupGridRow> Items { get; } = [];

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

    public LookupGridRow? SelectedItem
    {
        get => _selectedItem;
        set => SetProperty(ref _selectedItem, value);
    }

    public async Task LoadAsync() => await ReloadAsync();

    private async void Add_Click(object sender, System.Windows.RoutedEventArgs e)
    {
        var dialog = new WarehouseDialog();
        if (DialogWindowHelper.Show(dialog, 440, null) != true)
        {
            return;
        }

        await RunAsync(async () =>
        {
            await _api.CreateWarehouseAsync(dialog.WarehouseName, dialog.Location);
            StatusMessage = "Warehouse added.";
            await ReloadCoreAsync();
        });
    }

    private async void Delete_Click(object sender, System.Windows.RoutedEventArgs e)
    {
        if (SelectedItem is null)
        {
            ErrorMessage = "Select a warehouse to delete.";
            return;
        }

        if (System.Windows.MessageBox.Show(
                $"Delete warehouse \"{SelectedItem.Name}\"?",
                "Confirm delete",
                System.Windows.MessageBoxButton.YesNo,
                System.Windows.MessageBoxImage.Warning) != System.Windows.MessageBoxResult.Yes)
        {
            return;
        }

        await RunAsync(async () =>
        {
            await _api.DeleteWarehouseAsync(SelectedItem.Id);
            StatusMessage = "Warehouse deleted.";
            await ReloadCoreAsync();
        });
    }

    private async void Refresh_Click(object sender, System.Windows.RoutedEventArgs e) =>
        await ReloadAsync();

    private async Task ReloadAsync() => await RunAsync(ReloadCoreAsync);

    private async Task ReloadCoreAsync()
    {
        var result = await _api.GetWarehousesAsync(1, 500);
        _allItems.Clear();
        foreach (var warehouse in result.Items)
        {
            _allItems.Add(new LookupGridRow
            {
                Id = warehouse.Id,
                Name = warehouse.Name,
                Extra = warehouse.Location,
            });
        }

        ApplyFilter();
        StatusMessage = $"{result.TotalCount} warehouse(s) loaded.";
    }

    private void ApplyFilter()
    {
        Items.Clear();
        var query = FilterText.Trim();
        foreach (var item in _allItems.Where(row =>
                     string.IsNullOrWhiteSpace(query)
                     || row.Name.Contains(query, StringComparison.OrdinalIgnoreCase)
                     || (row.Extra?.Contains(query, StringComparison.OrdinalIgnoreCase) ?? false)
                     || row.Id.ToString().Contains(query, StringComparison.OrdinalIgnoreCase)))
        {
            Items.Add(item);
        }
    }
}
