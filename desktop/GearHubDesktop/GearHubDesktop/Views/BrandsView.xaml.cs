using System.Collections.ObjectModel;
using GearHubDesktop.Services;
using GearHubDesktop.Shell;

namespace GearHubDesktop.Views;

public partial class BrandsView : ViewControllerBase, ILoadableView
{
    private readonly GearHubApiClient _api;
    private string _newName = string.Empty;
    private LookupListItem? _selectedItem;

    public BrandsView(GearHubApiClient api)
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
            ErrorMessage = "Enter a brand name.";
            return;
        }

        await RunAsync(async () =>
        {
            await _api.CreateBrandAsync(NewName.Trim());
            NewName = string.Empty;
            StatusMessage = "Brand added.";
            await ReloadCoreAsync();
        });
    }

    private async void Delete_Click(object sender, System.Windows.RoutedEventArgs e)
    {
        if (SelectedItem is null)
        {
            ErrorMessage = "Select a brand to delete.";
            return;
        }

        if (System.Windows.MessageBox.Show(
                $"Delete brand \"{SelectedItem.Display}\"?",
                "Confirm delete",
                System.Windows.MessageBoxButton.YesNo,
                System.Windows.MessageBoxImage.Warning) != System.Windows.MessageBoxResult.Yes)
        {
            return;
        }

        await RunAsync(async () =>
        {
            await _api.DeleteBrandAsync(SelectedItem.Id);
            StatusMessage = "Brand deleted.";
            await ReloadCoreAsync();
        });
    }

    private async Task ReloadAsync()
    {
        await RunAsync(ReloadCoreAsync);
    }

    private async Task ReloadCoreAsync()
    {
        var result = await _api.GetBrandsAsync(1, 500);
        Items.Clear();
        foreach (var brand in result.Items)
        {
            Items.Add(new LookupListItem(brand.Id, $"{brand.Id} · {brand.Name}"));
        }

        StatusMessage = $"{result.TotalCount} brand(s) loaded.";
    }
}
