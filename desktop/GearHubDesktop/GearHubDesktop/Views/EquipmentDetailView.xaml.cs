using System.Globalization;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Media.Imaging;
using GearHubDesktop.DTOs;
using GearHubDesktop.Helpers;
using GearHubDesktop.Services;

namespace GearHubDesktop.Views;

public partial class EquipmentDetailView : ViewControllerBase
{
    private readonly GearHubApiClient _api;
    private readonly ICartService _cart;
    private readonly ApiSettings _settings;

    private EquipmentDto? _equipment;
    private BitmapImage? _imageSource;
    private bool _isLoading;

    public EquipmentDetailView(GearHubApiClient api, ICartService cart, ApiSettings settings)
    {
        _api = api;
        _cart = cart;
        _settings = settings;
        InitializeComponent();
        DataContext = this;
    }

    public EquipmentDto Equipment =>
        _equipment ?? new EquipmentDto { Name = "Equipment" };

    public bool HasEquipment => _equipment is not null;

    public bool IsLoading
    {
        get => _isLoading;
        private set => SetProperty(ref _isLoading, value);
    }

    public BitmapImage? ImageSource
    {
        get => _imageSource;
        private set
        {
            SetProperty(ref _imageSource, value);
            RaisePropertyChanged(nameof(HasImage));
            RaisePropertyChanged(nameof(ShowImagePlaceholder));
        }
    }

    public bool HasImage => ImageSource is not null;

    public bool ShowImagePlaceholder => !HasImage;

    public bool HasDescription => !string.IsNullOrWhiteSpace(_equipment?.DescriptionHtml);

    public bool CanAddToCart => _equipment?.IsAvailable == true && !IsBusy;

    public string CategoryLabel => $"Category: {_equipment?.CategoryName ?? "—"}";

    public string BrandLabel => $"Brand: {_equipment?.BrandName ?? "—"}";

    public string WarehouseLabel => $"Warehouse: {_equipment?.WarehouseName ?? "—"}";

    public string DailyRateLabel =>
        _equipment is null ? string.Empty : $"{FormatCurrency.Format(_equipment.DailyRate)} / day";

    public string AvailabilityLabel =>
        _equipment?.IsAvailable == true ? "Available for rental" : "Currently unavailable";

    public async Task LoadAsync(int id)
    {
        ErrorMessage = null;
        StatusMessage = null;
        IsLoading = true;
        try
        {
            _equipment = await _api.GetEquipmentByIdAsync(id);
            RaiseEquipmentProperties();
            LoadImage(_equipment.ImageUrl);
            LoadDescriptionHtml(_equipment.DescriptionHtml);
        }
        catch (Exception ex)
        {
            ErrorMessage = ex.Message;
        }
        finally
        {
            IsLoading = false;
        }
    }

    private async void AddToCart_Click(object sender, RoutedEventArgs e)
    {
        if (_equipment is null)
        {
            return;
        }

        await RunAsync(async () =>
        {
            _cart.Add(_equipment);
            await _cart.SaveAsync();
            StatusMessage = $"Added {_equipment.Name} to cart.";
        });
    }

    private void LoadImage(string? imageUrl)
    {
        ImageSource = null;
        if (string.IsNullOrWhiteSpace(imageUrl))
        {
            return;
        }

        try
        {
            var uri = imageUrl.StartsWith("http", StringComparison.OrdinalIgnoreCase)
                ? new Uri(imageUrl, UriKind.Absolute)
                : new Uri(new Uri(_settings.BaseUrl.TrimEnd('/') + "/"), imageUrl.TrimStart('/'));

            var bitmap = new BitmapImage();
            bitmap.BeginInit();
            bitmap.UriSource = uri;
            bitmap.CacheOption = BitmapCacheOption.OnLoad;
            bitmap.EndInit();
            ImageSource = bitmap;
        }
        catch
        {
            ImageSource = null;
        }
    }

    private void LoadDescriptionHtml(string? html)
    {
        if (string.IsNullOrWhiteSpace(html))
        {
            DescriptionBrowser.NavigateToString("<html><body></body></html>");
            return;
        }

        var document =
            "<html><head><meta http-equiv=\"X-UA-Compatible\" content=\"IE=edge\" />" +
            "<style>body { font-family: Segoe UI, sans-serif; font-size: 14px; color: #333; }</style>" +
            "</head><body>" + html + "</body></html>";
        DescriptionBrowser.NavigateToString(document);
    }

    private void RaiseEquipmentProperties()
    {
        RaisePropertyChanged(nameof(Equipment));
        RaisePropertyChanged(nameof(HasEquipment));
        RaisePropertyChanged(nameof(CategoryLabel));
        RaisePropertyChanged(nameof(BrandLabel));
        RaisePropertyChanged(nameof(WarehouseLabel));
        RaisePropertyChanged(nameof(DailyRateLabel));
        RaisePropertyChanged(nameof(AvailabilityLabel));
        RaisePropertyChanged(nameof(CanAddToCart));
        RaisePropertyChanged(nameof(HasDescription));
    }
}
