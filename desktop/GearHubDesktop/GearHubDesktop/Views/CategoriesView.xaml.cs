using System.Collections.ObjectModel;
using GearHubDesktop.Services;
using GearHubDesktop.Shell;
using GearHubDesktop.Views.Dialogs;

namespace GearHubDesktop.Views;

public partial class CategoriesView : ViewControllerBase, ILoadableView
{
    private readonly GearHubApiClient _api;
    private readonly List<LookupGridRow> _allItems = [];
    private string _filterText = string.Empty;
    private LookupGridRow? _selectedItem;

    public CategoriesView(GearHubApiClient api)
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
        var dialog = new TextInputDialog("Add category", "Category name");
        if (DialogWindowHelper.Show(dialog, 400, null) != true)
        {
            return;
        }

        await RunAsync(async () =>
        {
            await _api.CreateCategoryAsync(dialog.Value.Trim());
            StatusMessage = "Category added.";
            await ReloadCoreAsync();
        });
    }

    private async void Delete_Click(object sender, System.Windows.RoutedEventArgs e)
    {
        if (SelectedItem is null)
        {
            ErrorMessage = "Select a category to delete.";
            return;
        }

        if (System.Windows.MessageBox.Show(
                $"Delete category \"{SelectedItem.Name}\"?",
                "Confirm delete",
                System.Windows.MessageBoxButton.YesNo,
                System.Windows.MessageBoxImage.Warning) != System.Windows.MessageBoxResult.Yes)
        {
            return;
        }

        await RunAsync(async () =>
        {
            await _api.DeleteCategoryAsync(SelectedItem.Id);
            StatusMessage = "Category deleted.";
            await ReloadCoreAsync();
        });
    }

    private async void Refresh_Click(object sender, System.Windows.RoutedEventArgs e) =>
        await ReloadAsync();

    private async Task ReloadAsync() => await RunAsync(ReloadCoreAsync);

    private async Task ReloadCoreAsync()
    {
        var result = await _api.GetCategoriesAsync(1, 500);
        _allItems.Clear();
        foreach (var category in result.Items)
        {
            _allItems.Add(new LookupGridRow { Id = category.Id, Name = category.Name });
        }

        ApplyFilter();
        StatusMessage = $"{result.TotalCount} categor{(result.TotalCount == 1 ? "y" : "ies")} loaded.";
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
