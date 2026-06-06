using System.Collections.ObjectModel;
using GearHubDesktop.Services;
using GearHubDesktop.Shell;

namespace GearHubDesktop.Views;

public partial class WarehousesView : ViewControllerBase, ILoadableView
{
    private readonly GearHubApiClient _api;
    private string _newName = string.Empty;
    private string _newLocation = string.Empty;
    private LookupListItem? _selectedItem;

    public WarehousesView(GearHubApiClient api)
    {
        _api = api;
        InitializeComponent();
        DataContext = this;
    }

    public ObservableCollection<LookupListItem> Items { get; } = [];

    public string NewName
    {
        get => _newName;
        set => SetProperty(ref _newName, value);
    }

    public string NewLocation
    {
        get => _newLocation;
        set => SetProperty(ref _newLocation, value);
    }

    public LookupListItem? SelectedItem
    {
        get => _selectedItem;
        set => SetProperty(ref _selectedItem, value);
    }

    public async Task LoadAsync() => await ReloadAsync();

    private async void Add_Click(object sender, System.Windows.RoutedEventArgs e)
    {
        if (string.IsNullOrWhiteSpace(NewName))
        {
            ErrorMessage = "Enter a warehouse name.";
            return;
        }

        if (string.IsNullOrWhiteSpace(NewLocation))
        {
            ErrorMessage = "Enter a location.";
            return;
        }

        await RunAsync(async () =>
        {
            await _api.CreateWarehouseAsync(NewName.Trim(), NewLocation.Trim());
            NewName = string.Empty;
            NewLocation = string.Empty;
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
                $"Delete warehouse \"{SelectedItem.Display}\"?",
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

    private async Task ReloadAsync()
    {
        await RunAsync(ReloadCoreAsync);
    }

    private async Task ReloadCoreAsync()
    {
        var result = await _api.GetWarehousesAsync(1, 500);
        Items.Clear();
        foreach (var warehouse in result.Items)
        {
            Items.Add(new LookupListItem(warehouse.Id, $"{warehouse.Id} · {warehouse.Name} · {warehouse.Location}"));
        }

        StatusMessage = $"{result.TotalCount} warehouse(s) loaded.";
    }
}
