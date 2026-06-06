using System.Collections.ObjectModel;
using GearHubDesktop.Services;
using GearHubDesktop.Shell;

namespace GearHubDesktop.Views;

public partial class BrandsView : ViewControllerBase, ILoadableView
{
    private readonly GearHubApiClient _api;
    private string _newName = string.Empty;

    public BrandsView(GearHubApiClient api)
    {
        _api = api;
        InitializeComponent();
        DataContext = this;
    }

    public ObservableCollection<string> Items { get; } = [];

    public string NewName
    {
        get => _newName;
        set => SetProperty(ref _newName, value);
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
            Items.Add($"{brand.Id} · {brand.Name}");
        }

        StatusMessage = $"{result.TotalCount} brand(s) loaded.";
    }
}
