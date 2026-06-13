using System.Globalization;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Media;
using GearHubDesktop.DTOs;
using GearHubDesktop.Helpers;
using GearHubDesktop.Services;

namespace GearHubDesktop.Views;

public partial class EquipmentDetailView : ViewControllerBase
{
    private readonly GearHubApiClient _api;
    private readonly ICartService _cart;
    private readonly ApiSettings _settings;
    private readonly IRemoteImageService _images;

    private EquipmentDto? _equipment;
    private ImageSource? _imageSource;
    private bool _isLoading;

    public EquipmentDetailView(
        GearHubApiClient api,
        ICartService cart,
        ApiSettings settings,
        IRemoteImageService images)
    {
        _api = api;
        _cart = cart;
        _settings = settings;
        _images = images;
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

    public ImageSource? ImageSource
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
        ImageSource = null;
        try
        {
            _equipment = await _api.GetEquipmentByIdAsync(id);
            RaiseEquipmentProperties();
            ImageSource = await _images.LoadAsync(_equipment.ImageUrl);
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

    private void LoadDescriptionHtml(string? html)
    {
        if (string.IsNullOrWhiteSpace(html))
        {
            DescriptionBrowser.NavigateToString("<html><body></body></html>");
            return;
        }

        var document = CmsHtmlHelper.BuildWebBrowserDocument(html, _settings.BaseUrl);
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
