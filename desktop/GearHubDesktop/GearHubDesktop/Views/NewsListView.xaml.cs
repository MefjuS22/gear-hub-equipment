using System.Collections.ObjectModel;
using System.Globalization;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Media.Imaging;
using GearHubDesktop.DTOs;
using GearHubDesktop.Helpers;
using GearHubDesktop.Services;
using GearHubDesktop.Shell;

namespace GearHubDesktop.Views;

public partial class NewsListView : ViewControllerBase, ILoadableView
{
    private const int PageSize = 50;

    private readonly GearHubApiClient _api;
    private readonly ApiSettings _settings;
    private readonly IRemoteImageService _images;

    private NewsArticleRow? _selectedArticle;
    private CmsPostPublicDetailDto? _selectedDetail;
    private BitmapImage? _coverImageSource;
    private bool _isDetailLoading;

    public NewsListView(GearHubApiClient api, ApiSettings settings, IRemoteImageService images)
    {
        _api = api;
        _settings = settings;
        _images = images;
        InitializeComponent();
        DataContext = this;
        Articles = [];
    }

    public ObservableCollection<NewsArticleRow> Articles { get; }

    public NewsArticleRow? SelectedArticle
    {
        get => _selectedArticle;
        set
        {
            if (Equals(_selectedArticle, value))
            {
                return;
            }

            _selectedArticle = value;
            RaisePropertyChanged();
            RaisePropertyChanged(nameof(ShowSelectHint));
            _ = LoadSelectedDetailAsync();
        }
    }

    public CmsPostPublicDetailDto? SelectedDetail
    {
        get => _selectedDetail;
        private set
        {
            SetProperty(ref _selectedDetail, value);
            RaisePropertyChanged(nameof(HasSelectedDetail));
            RaisePropertyChanged(nameof(SelectedDetailPublishedLabel));
            RaisePropertyChanged(nameof(SelectedDetailExcerptVisibility));
        }
    }

    public BitmapImage? CoverImageSource
    {
        get => _coverImageSource;
        private set
        {
            SetProperty(ref _coverImageSource, value);
            RaisePropertyChanged(nameof(HasCoverImage));
        }
    }

    public bool HasCoverImage => CoverImageSource is not null;

    public bool HasSelectedDetail => SelectedDetail is not null;

    public bool ShowSelectHint => SelectedArticle is null && !IsDetailLoading;

    public bool IsDetailLoading
    {
        get => _isDetailLoading;
        private set
        {
            SetProperty(ref _isDetailLoading, value);
            RaisePropertyChanged(nameof(ShowSelectHint));
        }
    }

    public bool IsListEmpty => Articles.Count == 0 && !IsBusy;

    public string SelectedDetailPublishedLabel =>
        SelectedDetail is null
            ? string.Empty
            : SelectedDetail.PublishedAtUtc.ToLocalTime().ToString("f", CultureInfo.CurrentCulture);

    public Visibility SelectedDetailExcerptVisibility =>
        string.IsNullOrWhiteSpace(SelectedDetail?.Excerpt) ? Visibility.Collapsed : Visibility.Visible;

    public async Task LoadAsync()
    {
        await RunAsync(async () =>
        {
            var result = await _api.GetPublishedNewsAsync(1, PageSize);
            Articles.Clear();
            foreach (var article in result.Items)
            {
                Articles.Add(NewsArticleRow.FromDto(article));
            }

            SelectedArticle = Articles.FirstOrDefault();
            RaisePropertyChanged(nameof(IsListEmpty));
        });
    }

    private async Task LoadSelectedDetailAsync()
    {
        SelectedDetail = null;
        CoverImageSource = null;
        ArticleBrowser.NavigateToString("<html><body></body></html>");

        if (SelectedArticle is null)
        {
            return;
        }

        IsDetailLoading = true;
        ErrorMessage = null;
        try
        {
            var detail = await _api.GetNewsBySlugAsync(SelectedArticle.Slug);
            SelectedDetail = detail;
            CoverImageSource = await _images.LoadAsync(detail.CoverImageUrl);
            LoadArticleHtml(detail.BodyHtml);
        }
        catch (Exception ex)
        {
            ErrorMessage = ex.Message;
        }
        finally
        {
            IsDetailLoading = false;
        }
    }

    private void LoadArticleHtml(string html)
    {
        if (string.IsNullOrWhiteSpace(html))
        {
            ArticleBrowser.NavigateToString("<html><body></body></html>");
            return;
        }

        ArticleBrowser.NavigateToString(CmsHtmlHelper.BuildWebBrowserDocument(html, _settings.BaseUrl));
    }

    public sealed class NewsArticleRow
    {
        public Guid Id { get; init; }
        public string Slug { get; init; } = string.Empty;
        public string Title { get; init; } = string.Empty;
        public string? Excerpt { get; init; }
        public DateTime PublishedAtUtc { get; init; }

        public string PublishedAtDisplay =>
            PublishedAtUtc.ToLocalTime().ToString("d", CultureInfo.CurrentCulture);

        public static NewsArticleRow FromDto(CmsPostPublicSummaryDto dto) =>
            new()
            {
                Id = dto.Id,
                Slug = dto.Slug,
                Title = dto.Title,
                Excerpt = dto.Excerpt,
                PublishedAtUtc = dto.PublishedAtUtc,
            };
    }
}
