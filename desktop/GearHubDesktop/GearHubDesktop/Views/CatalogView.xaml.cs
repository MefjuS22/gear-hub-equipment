using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Runtime.CompilerServices;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Media;
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
    private readonly IRemoteImageService _images;

    private string _searchText = string.Empty;
    private string? _selectedCategory;
    private int _page = 1;
    private int _totalPages = 1;
    private int _totalCount;

    public CatalogView(
        GearHubApiClient api,
        ICartService cart,
        IAppNavigation navigation,
        IRemoteImageService images)
    {
        _api = api;
        _cart = cart;
        _navigation = navigation;
        _images = images;
        InitializeComponent();
        DataContext = this;
        Items = [];
        Categories = new ObservableCollection<string>(["All categories"]);
        SelectedCategory = Categories[0];
    }

    public ObservableCollection<CatalogRow> Items { get; }

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

    private async void Refresh_Click(object sender, RoutedEventArgs e) => await LoadAsync();

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
        if (sender is not Button { DataContext: CatalogRow row })
        {
            return;
        }

        _navigation.NavigateTo("portal-equipment", row.Id);
    }

    private async void AddToCart_Click(object sender, RoutedEventArgs e)
    {
        if (sender is not Button { DataContext: CatalogRow row })
        {
            return;
        }

        _cart.Add(row.Equipment);
        await _cart.SaveAsync();
        StatusMessage = $"Added {row.Name} to cart.";
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
        var rows = result.Items.Select(item => new CatalogRow(item)).ToList();
        foreach (var row in rows)
        {
            Items.Add(row);
        }

        _ = LoadThumbnailsAsync(rows);

        RaisePaginationProperties();
        StatusMessage = Items.Count == 0 ? "No equipment found." : null;
    }

    private async Task LoadThumbnailsAsync(IReadOnlyList<CatalogRow> rows)
    {
        foreach (var row in rows)
        {
            var thumbnail = await _images.LoadAsync(row.Equipment.ImageUrl);
            await Dispatcher.InvokeAsync(() => row.Thumbnail = thumbnail);
        }
    }

    private void RaisePaginationProperties()
    {
        RaisePropertyChanged(nameof(PaginationLabel));
        RaisePropertyChanged(nameof(CanGoPrevious));
        RaisePropertyChanged(nameof(CanGoNext));
    }

    public sealed class CatalogRow : INotifyPropertyChanged
    {
        private ImageSource? _thumbnail;

        public CatalogRow(EquipmentDto equipment)
        {
            Equipment = equipment;
        }

        public EquipmentDto Equipment { get; }

        public int Id => Equipment.Id;

        public string Name => Equipment.Name;

        public string CategoryName => Equipment.CategoryName ?? string.Empty;

        public string BrandName => Equipment.BrandName ?? string.Empty;

        public decimal DailyRate => Equipment.DailyRate;

        public bool IsAvailable => Equipment.IsAvailable;

        public ImageSource? Thumbnail
        {
            get => _thumbnail;
            set
            {
                if (Equals(_thumbnail, value))
                {
                    return;
                }

                _thumbnail = value;
                PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(nameof(Thumbnail)));
                PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(nameof(HasThumbnail)));
            }
        }

        public bool HasThumbnail => Thumbnail is not null;

        public event PropertyChangedEventHandler? PropertyChanged;
    }
}
