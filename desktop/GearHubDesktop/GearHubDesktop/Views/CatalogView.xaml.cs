using System.Collections.ObjectModel;
using System.Windows;
using System.Windows.Controls;
using GearHubDesktop.DTOs;
using GearHubDesktop.Services;
using GearHubDesktop.Shell;

namespace GearHubDesktop.Views;

public partial class CatalogView : ViewControllerBase, ILoadableView
{
    private const int PageSize = 20;

    private readonly GearHubApiClient _api;
    private readonly ICartService _cart;
    private readonly IAppNavigation _navigation;

    private string _searchText = string.Empty;
    private string? _selectedCategory;
    private int _page = 1;
    private int _totalPages = 1;
    private int _totalCount;

    public CatalogView(GearHubApiClient api, ICartService cart, IAppNavigation navigation)
    {
        _api = api;
        _cart = cart;
        _navigation = navigation;
        InitializeComponent();
        DataContext = this;
        Items = [];
        Categories = new ObservableCollection<string>(["All categories"]);
        SelectedCategory = Categories[0];
    }

    public ObservableCollection<EquipmentDto> Items { get; }

    public ObservableCollection<string> Categories { get; }

    public string SearchText
    {
        get => _searchText;
        set => SetProperty(ref _searchText, value);
    }

    public string? SelectedCategory
    {
        get => _selectedCategory;
        set => SetProperty(ref _selectedCategory, value);
    }

    public string PaginationLabel => $"Page {_page} of {Math.Max(_totalPages, 1)} ({_totalCount} items)";

    public bool CanGoPrevious => _page > 1 && !IsBusy;

    public bool CanGoNext => _page < _totalPages && !IsBusy;

    public async Task LoadAsync()
    {
        await RunAsync(async () =>
        {
            await LoadCategoriesAsync();
            await LoadPageAsync(resetPage: true);
        });
    }

    private async void Search_Click(object sender, RoutedEventArgs e) =>
        await RunAsync(() => LoadPageAsync(resetPage: true));

    private async void PreviousPage_Click(object sender, RoutedEventArgs e)
    {
        if (_page <= 1)
        {
            return;
        }

        _page--;
        await RunAsync(() => LoadPageAsync(resetPage: false));
    }

    private async void NextPage_Click(object sender, RoutedEventArgs e)
    {
        if (_page >= _totalPages)
        {
            return;
        }

        _page++;
        await RunAsync(() => LoadPageAsync(resetPage: false));
    }

    private void Open_Click(object sender, RoutedEventArgs e)
    {
        if (sender is not Button { DataContext: EquipmentDto item })
        {
            return;
        }

        _navigation.NavigateTo("portal-equipment", item.Id);
    }

    private async void AddToCart_Click(object sender, RoutedEventArgs e)
    {
        if (sender is not Button { DataContext: EquipmentDto item })
        {
            return;
        }

        _cart.Add(item);
        await _cart.SaveAsync();
        StatusMessage = $"Added {item.Name} to cart.";
    }

    private async Task LoadCategoriesAsync()
    {
        var categories = await _api.GetEquipmentCategoriesAsync(SearchText.Trim());
        Categories.Clear();
        Categories.Add("All categories");
        foreach (var category in categories.OrderBy(name => name))
        {
            Categories.Add(category);
        }

        if (SelectedCategory is null || !Categories.Contains(SelectedCategory))
        {
            SelectedCategory = Categories[0];
        }
    }

    private async Task LoadPageAsync(bool resetPage)
    {
        if (resetPage)
        {
            _page = 1;
        }

        var categoryFilter = SelectedCategory == "All categories" ? null : SelectedCategory;
        var result = await _api.GetEquipmentAsync(
            _page,
            PageSize,
            string.IsNullOrWhiteSpace(SearchText) ? null : SearchText.Trim(),
            categoryFilter);

        _totalPages = Math.Max(result.TotalPages, 1);
        _totalCount = result.TotalCount;
        _page = result.Page;

        Items.Clear();
        foreach (var item in result.Items)
        {
            Items.Add(item);
        }

        RaisePaginationProperties();
        StatusMessage = Items.Count == 0 ? "No equipment found." : null;
    }

    private void RaisePaginationProperties()
    {
        RaisePropertyChanged(nameof(PaginationLabel));
        RaisePropertyChanged(nameof(CanGoPrevious));
        RaisePropertyChanged(nameof(CanGoNext));
    }
}
