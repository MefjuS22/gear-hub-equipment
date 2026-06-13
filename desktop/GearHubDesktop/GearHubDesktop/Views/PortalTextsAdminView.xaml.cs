using System.Collections.ObjectModel;
using System.Windows;
using System.Windows.Controls;
using GearHubDesktop.DTOs;
using GearHubDesktop.Helpers;
using GearHubDesktop.Services;
using GearHubDesktop.Shell;
using GearHubDesktop.Views.Dialogs;
using Microsoft.Extensions.DependencyInjection;

namespace GearHubDesktop.Views;

public partial class PortalTextsAdminView : ViewControllerBase, ILoadableView
{
    private readonly GearHubApiClient _api;
    private readonly IAppNavigation _navigation;
    private readonly IServiceProvider _services;

    private readonly List<PortalTextRow> _allTexts = [];
    private string _filterText = string.Empty;

    public PortalTextsAdminView(GearHubApiClient api, IAppNavigation navigation, IServiceProvider services)
    {
        _api = api;
        _navigation = navigation;
        _services = services;
        InitializeComponent();
        DataContext = this;
    }

    public ObservableCollection<PortalTextRow> Texts { get; } = [];

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

    public async Task LoadAsync() => await LoadTextsAsync();

    private void NewsPosts_Click(object sender, RoutedEventArgs e) =>
        _navigation.NavigateTo("staff-cms");

    private async void Refresh_Click(object sender, RoutedEventArgs e) =>
        await LoadTextsAsync();

    private async void EditRow_Click(object sender, RoutedEventArgs e)
    {
        if (sender is not Button { DataContext: PortalTextRow row })
        {
            return;
        }

        if (await FormDialog.ShowPortalTextAsync(_services, row.Key))
        {
            await LoadTextsAsync();
        }
    }

    private async Task LoadTextsAsync() => await RunAsync(LoadTextsCoreAsync);

    private async Task LoadTextsCoreAsync()
    {
        StatusMessage = null;
        var result = await _api.GetPortalTextsAsync(1, 200);
        _allTexts.Clear();
        foreach (var text in result.Items)
        {
            _allTexts.Add(new PortalTextRow(text));
        }

        ApplyFilter();
        StatusMessage = $"{result.TotalCount} text block(s) loaded.";
    }

    private void ApplyFilter()
    {
        Texts.Clear();
        var query = FilterText.Trim();
        foreach (var text in _allTexts.Where(row =>
                     string.IsNullOrWhiteSpace(query)
                     || row.Title.Contains(query, StringComparison.OrdinalIgnoreCase)
                     || row.PlacementHint.Contains(query, StringComparison.OrdinalIgnoreCase)
                     || row.Preview.Contains(query, StringComparison.OrdinalIgnoreCase)))
        {
            Texts.Add(text);
        }
    }

    public sealed class PortalTextRow
    {
        public PortalTextRow(PortalTextDto text)
        {
            Key = text.Key;
            Title = text.Title;
            PlacementHint = text.PlacementHint;
            Preview = PortalTextHelper.ToPlainText(text.BodyHtml);
        }

        public string Key { get; }
        public string Title { get; }
        public string PlacementHint { get; }
        public string Preview { get; }
    }
}
