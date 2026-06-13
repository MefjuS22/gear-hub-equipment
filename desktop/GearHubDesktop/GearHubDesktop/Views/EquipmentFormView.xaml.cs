using System.Collections.ObjectModel;
using System.Windows;
using GearHubDesktop.DTOs;
using GearHubDesktop.Helpers;
using GearHubDesktop.Services;
using GearHubDesktop.Shell;
using GearHubDesktop.Views.Dialogs;
using Microsoft.Win32;

namespace GearHubDesktop.Views;

public partial class EquipmentFormView : ViewControllerBase, INotifyDialogFinished
{
    private readonly GearHubApiClient _api;
    private readonly ApiSettings _settings;
    private readonly IAppNavigation? _navigation;

    private bool _dialogMode;
    private int? _equipmentId;
    private string _equipmentName = string.Empty;
    private string _imageUrl = string.Empty;
    private string _descriptionHtml = string.Empty;
    private decimal _dailyRate;
    private bool _isAvailable = true;
    private int _categoryId;
    private int _brandId;
    private int _warehouseId;

    public EquipmentFormView(GearHubApiClient api, ApiSettings settings, IAppNavigation navigation)
    {
        _api = api;
        _settings = settings;
        _navigation = navigation;
        InitializeComponent();
        DataContext = this;
        DescriptionEditor.ResolveImageUrlAsync = UploadEditorImageAsync;
        DescriptionEditor.HtmlChanged += (_, _) => _descriptionHtml = DescriptionEditor.GetHtml();
    }

    public event EventHandler<bool>? DialogFinished;

    public void ConfigureAsDialog() => _dialogMode = true;

    public bool ShowPageHeader => !_dialogMode;

    public ObservableCollection<CategoryLookupDto> Categories { get; } = [];
    public ObservableCollection<BrandLookupDto> Brands { get; } = [];
    public ObservableCollection<WarehouseLookupDto> Warehouses { get; } = [];

    public string PageTitle => _equipmentId is null ? "New equipment" : $"Edit equipment #{_equipmentId}";

    public string EquipmentName
    {
        get => _equipmentName;
        set => SetProperty(ref _equipmentName, value);
    }

    public string ImageUrl
    {
        get => _imageUrl;
        set => SetProperty(ref _imageUrl, value);
    }

    public string DescriptionHtml
    {
        get => _descriptionHtml;
        set
        {
            SetProperty(ref _descriptionHtml, value);
            DescriptionEditor.SetHtml(value);
        }
    }

    public decimal DailyRate
    {
        get => _dailyRate;
        set => SetProperty(ref _dailyRate, value);
    }

    public bool IsAvailable
    {
        get => _isAvailable;
        set => SetProperty(ref _isAvailable, value);
    }

    public int CategoryId
    {
        get => _categoryId;
        set => SetProperty(ref _categoryId, value);
    }

    public int BrandId
    {
        get => _brandId;
        set => SetProperty(ref _brandId, value);
    }

    public int WarehouseId
    {
        get => _warehouseId;
        set => SetProperty(ref _warehouseId, value);
    }

    public async Task LoadAsync(int? equipmentId)
    {
        _equipmentId = equipmentId;
        RaisePropertyChanged(nameof(PageTitle));
        RaisePropertyChanged(nameof(ShowPageHeader));

        await RunAsync(async () =>
        {
            var categories = await _api.GetCategoriesAsync(1, 500);
            var brands = await _api.GetBrandsAsync(1, 500);
            var warehouses = await _api.GetWarehousesAsync(1, 500);

            Categories.Clear();
            foreach (var item in categories.Items)
            {
                Categories.Add(item);
            }

            Brands.Clear();
            foreach (var item in brands.Items)
            {
                Brands.Add(item);
            }

            Warehouses.Clear();
            foreach (var item in warehouses.Items)
            {
                Warehouses.Add(item);
            }

            if (equipmentId is int id)
            {
                var equipment = await _api.GetEquipmentByIdAsync(id);
                EquipmentName = equipment.Name;
                ImageUrl = equipment.ImageUrl ?? string.Empty;
                DescriptionHtml = equipment.DescriptionHtml ?? string.Empty;
                DailyRate = equipment.DailyRate;
                IsAvailable = equipment.IsAvailable;
                CategoryId = equipment.CategoryId;
                BrandId = equipment.BrandId;
                WarehouseId = equipment.WarehouseId;
            }
            else
            {
                DescriptionHtml = string.Empty;
                CategoryId = Categories.FirstOrDefault()?.Id ?? 0;
                BrandId = Brands.FirstOrDefault()?.Id ?? 0;
                WarehouseId = Warehouses.FirstOrDefault()?.Id ?? 0;
            }
        });
    }

    private async void UploadImage_Click(object sender, RoutedEventArgs e)
    {
        var dialog = new OpenFileDialog
        {
            Filter = "Images|*.png;*.jpg;*.jpeg;*.webp;*.gif|All files|*.*",
        };

        if (dialog.ShowDialog() != true)
        {
            return;
        }

        await RunAsync(async () =>
        {
            var upload = await _api.UploadFileAsync(dialog.FileName, "equipment");
            ImageUrl = upload.PublicPath;
            StatusMessage = "Image uploaded.";
        });
    }

    private async Task<string?> UploadEditorImageAsync()
    {
        string? filePath = await Dispatcher.InvokeAsync(() =>
        {
            return FileDialogHelper.TryPickImage(this, out var path) ? path : null;
        });

        if (string.IsNullOrWhiteSpace(filePath))
        {
            return null;
        }

        try
        {
            var upload = await _api.UploadFileAsync(filePath, "equipment");
            return FileUrls.ResolvePublicFileUrl(_settings.BaseUrl, upload.PublicPath);
        }
        catch (Exception ex)
        {
            await Dispatcher.InvokeAsync(() => ErrorMessage = ex.Message);
            return null;
        }
    }

    private async void Save_Click(object sender, RoutedEventArgs e)
    {
        if (string.IsNullOrWhiteSpace(EquipmentName))
        {
            ErrorMessage = "Name is required.";
            return;
        }

        if (EquipmentName.Trim().Length < 3)
        {
            ErrorMessage = "Name must be at least 3 characters.";
            return;
        }

        if (DailyRate <= 0)
        {
            ErrorMessage = "Daily rate must be greater than zero.";
            return;
        }

        if (CategoryId <= 0 || BrandId <= 0 || WarehouseId <= 0)
        {
            ErrorMessage = "Category, brand, and warehouse are required.";
            return;
        }

        var description = HtmlEditorHelper.NormalizeOutput(await DescriptionEditor.GetHtmlAsync());
        var dto = new EquipmentUpsertDto
        {
            Name = EquipmentName.Trim(),
            CategoryId = CategoryId,
            BrandId = BrandId,
            WarehouseId = WarehouseId,
            DailyRate = DailyRate,
            IsAvailable = IsAvailable,
            ImageUrl = string.IsNullOrWhiteSpace(ImageUrl) ? null : ImageUrl.Trim(),
            DescriptionHtml = string.IsNullOrEmpty(description) ? null : description,
        };

        await RunAsync(async () =>
        {
            if (_equipmentId is int id)
            {
                await _api.UpdateEquipmentAsync(id, dto);
                StatusMessage = "Equipment updated.";
            }
            else
            {
                await _api.CreateEquipmentAsync(dto);
                StatusMessage = "Equipment created.";
            }

            if (_dialogMode)
            {
                DialogFinished?.Invoke(this, true);
            }
            else
            {
                _navigation!.NavigateTo("staff-equipment");
            }
        });
    }

    private void Cancel_Click(object sender, RoutedEventArgs e)
    {
        if (_dialogMode)
        {
            DialogFinished?.Invoke(this, false);
            return;
        }

        _navigation!.NavigateTo("staff-equipment");
    }
}
