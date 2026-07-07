using System.Collections.ObjectModel;
using GearHubDesktop.Services;
using GearHubDesktop.Shell;
using GearHubDesktop.Views.Dialogs;

namespace GearHubDesktop.Views;

public partial class BrandsView : ViewControllerBase, ILoadableView
{
    private readonly GearHubApiClient _api;
    private readonly List<LookupGridRow> _allItems = [];
    private string _filterText = string.Empty;
    private LookupGridRow? _selectedItem;

    public BrandsView(GearHubApiClient api)
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
        var dialog = new TextInputDialog("Add brand", "Brand name");
        if (DialogWindowHelper.Show(dialog, 400, null) != true)
        {
            return;
        }

        await RunAsync(async () =>
        {
            await _api.CreateBrandAsync(dialog.Value.Trim());
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
                $"Delete brand \"{SelectedItem.Name}\"?",
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

    private async void Refresh_Click(object sender, System.Windows.RoutedEventArgs e) =>
        await ReloadAsync();

    private async Task ReloadAsync() => await RunAsync(ReloadCoreAsync);

    private async Task ReloadCoreAsync()
    {
        var result = await _api.GetBrandsAsync(1, 500);
        _allItems.Clear();
        foreach (var brand in result.Items)
        {
            _allItems.Add(new LookupGridRow { Id = brand.Id, Name = brand.Name });
        }

        ApplyFilter();
        StatusMessage = $"{result.TotalCount} brand(s) loaded.";
    }

    private void ApplyFilter()
    {
        Items.Clear();
        var query = FilterText.Trim();
        foreach (var item in _allItems.Where(row =>
                     string.IsNullOrWhiteSpace(query)
                     || row.Name.Contains(query, StringComparison.OrdinalIgnoreCase)
                     || row.Id.ToString().Contains(query, StringComparison.OrdinalIgnoreCase)))
        {
            Items.Add(item);
        }
    }
}
