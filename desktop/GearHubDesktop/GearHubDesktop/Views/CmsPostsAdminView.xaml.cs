using System.Collections.ObjectModel;
using System.Windows;
using System.Windows.Controls;
using GearHubDesktop.DTOs;
using GearHubDesktop.Services;
using GearHubDesktop.Shell;
using GearHubDesktop.Views.Dialogs;
using Microsoft.Extensions.DependencyInjection;

namespace GearHubDesktop.Views;

public partial class CmsPostsAdminView : ViewControllerBase, ILoadableView
{
    private readonly GearHubApiClient _api;
    private readonly IAppNavigation _navigation;
    private readonly IServiceProvider _services;

    private readonly List<CmsPostRow> _allPosts = [];
    private string _filterText = string.Empty;
    private CmsPostRow? _selectedPost;

    public CmsPostsAdminView(GearHubApiClient api, IAppNavigation navigation, IServiceProvider services)
    {
        _api = api;
        _navigation = navigation;
        _services = services;
        InitializeComponent();
        DataContext = this;
    }

    public ObservableCollection<CmsPostRow> Posts { get; } = [];

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

    public CmsPostRow? SelectedPost
    {
        get => _selectedPost;
        set => SetProperty(ref _selectedPost, value);
    }

    public async Task LoadAsync() => await LoadPostsAsync();

    private void PortalTexts_Click(object sender, RoutedEventArgs e) =>
        _navigation.NavigateTo("staff-portal-texts");

    private async void Refresh_Click(object sender, RoutedEventArgs e) =>
        await LoadPostsAsync();

    private async void Add_Click(object sender, RoutedEventArgs e)
    {
        if (await FormDialog.ShowCmsPostAsync(_services, null))
        {
            await LoadPostsAsync();
        }
    }

    private async void EditRow_Click(object sender, RoutedEventArgs e)
    {
        if (sender is not Button { DataContext: CmsPostRow row })
        {
            return;
        }

        if (await FormDialog.ShowCmsPostAsync(_services, row.Id))
        {
            await LoadPostsAsync();
        }
    }

    private async void DeleteRow_Click(object sender, RoutedEventArgs e)
    {
        if (sender is not Button { DataContext: CmsPostRow row })
        {
            return;
        }

        if (MessageBox.Show(
                $"Delete \"{row.Title}\"?",
                "Confirm delete",
                MessageBoxButton.YesNo,
                MessageBoxImage.Warning) != MessageBoxResult.Yes)
        {
            return;
        }

        await RunAsync(async () =>
        {
            await _api.DeleteCmsPostAsync(row.Id);
            StatusMessage = "Post deleted.";
            await LoadPostsCoreAsync();
        });
    }

    private async Task LoadPostsAsync() => await RunAsync(LoadPostsCoreAsync);

    private async Task LoadPostsCoreAsync()
    {
        StatusMessage = null;
        var result = await _api.GetCmsPostsAsync(1, 200);
        _allPosts.Clear();
        foreach (var post in result.Items)
        {
            _allPosts.Add(new CmsPostRow(post));
        }

        ApplyFilter();
        StatusMessage = $"{result.TotalCount} post(s) loaded.";
    }

    private void ApplyFilter()
    {
        Posts.Clear();
        var query = FilterText.Trim();
        foreach (var post in _allPosts.Where(row =>
                     string.IsNullOrWhiteSpace(query)
                     || row.Title.Contains(query, StringComparison.OrdinalIgnoreCase)
                     || row.Slug.Contains(query, StringComparison.OrdinalIgnoreCase)))
        {
            Posts.Add(post);
        }
    }

    public sealed class CmsPostRow
    {
        public CmsPostRow(CmsPostListDto post)
        {
            Id = post.Id;
            Title = post.Title;
            Slug = post.Slug;
            PublishedLabel = post.IsPublished ? "yes" : "draft";
        }

        public Guid Id { get; }
        public string Title { get; }
        public string Slug { get; }
        public string PublishedLabel { get; }
    }
}
