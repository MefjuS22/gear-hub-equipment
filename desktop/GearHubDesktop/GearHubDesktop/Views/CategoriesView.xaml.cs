using System.Collections.ObjectModel;
using GearHubDesktop.Services;
using GearHubDesktop.Shell;

namespace GearHubDesktop.Views;

public partial class CategoriesView : ViewControllerBase, ILoadableView
{
    private readonly GearHubApiClient _api;
    private string _newName = string.Empty;
    private LookupListItem? _selectedItem;

    public CategoriesView(GearHubApiClient api)
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
            ErrorMessage = "Enter a category name.";
            return;
        }

        await RunAsync(async () =>
        {
            await _api.CreateCategoryAsync(NewName.Trim());
            NewName = string.Empty;
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
                $"Delete category \"{SelectedItem.Display}\"?",
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

    private async Task ReloadAsync()
    {
        await RunAsync(ReloadCoreAsync);
    }

    private async Task ReloadCoreAsync()
    {
        var result = await _api.GetCategoriesAsync(1, 500);
        Items.Clear();
        foreach (var category in result.Items)
        {
            Items.Add(new LookupListItem(category.Id, $"{category.Id} · {category.Name}"));
        }

        StatusMessage = $"{result.TotalCount} categor{(result.TotalCount == 1 ? "y" : "ies")} loaded.";
    }
}
