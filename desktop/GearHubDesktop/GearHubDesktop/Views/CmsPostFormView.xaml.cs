using System.Windows;
using GearHubDesktop.DTOs;
using GearHubDesktop.Helpers;
using GearHubDesktop.Services;
using GearHubDesktop.Shell;
using GearHubDesktop.Views.Dialogs;
using Microsoft.Win32;

namespace GearHubDesktop.Views;

public partial class CmsPostFormView : ViewControllerBase, INotifyDialogFinished
{
    private readonly GearHubApiClient _api;
    private readonly ApiSettings _settings;
    private readonly IAppNavigation? _navigation;

    private bool _dialogMode;
    private Guid? _postId;
    private string _title = string.Empty;
    private string _slug = string.Empty;
    private string _excerpt = string.Empty;
    private string _coverImageUrl = string.Empty;
    private string _bodyHtml = string.Empty;
    private bool _isPublished;
    private string? _titleError;

    public CmsPostFormView(GearHubApiClient api, ApiSettings settings, IAppNavigation navigation)
    {
        _api = api;
        _settings = settings;
        _navigation = navigation;
        InitializeComponent();
        DataContext = this;
        BodyEditor.ResolveImageUrlAsync = UploadEditorImageAsync;
        BodyEditor.HtmlChanged += (_, _) => _bodyHtml = BodyEditor.GetHtml();
    }

    public event EventHandler<bool>? DialogFinished;

    public void ConfigureAsDialog() => _dialogMode = true;

    public bool ShowPageHeader => !_dialogMode;

    public string PageTitle => _postId is null ? "New post" : "Edit post";

    public string PageSubtitle => _postId is null
        ? "Create a news article for the customer portal."
        : "Update the article title, body, and publish state.";

    public string Title
    {
        get => _title;
        set
        {
            SetProperty(ref _title, value);
            SetFieldError(ref _titleError, null, nameof(TitleError), nameof(HasTitleError));
        }
    }

    public string? TitleError => _titleError;
    public bool HasTitleError => !string.IsNullOrEmpty(_titleError);

    public string Slug
    {
        get => _slug;
        set => SetProperty(ref _slug, value);
    }

    public string Excerpt
    {
        get => _excerpt;
        set => SetProperty(ref _excerpt, value);
    }

    public string CoverImageUrl
    {
        get => _coverImageUrl;
        set => SetProperty(ref _coverImageUrl, value);
    }

    public string BodyHtml
    {
        get => _bodyHtml;
        set
        {
            SetProperty(ref _bodyHtml, value);
            BodyEditor.SetHtml(value);
        }
    }

    public bool IsPublished
    {
        get => _isPublished;
        set => SetProperty(ref _isPublished, value);
    }

    public async Task LoadAsync(Guid? postId)
    {
        _postId = postId;
        RaisePropertyChanged(nameof(PageTitle));
        RaisePropertyChanged(nameof(PageSubtitle));
        RaisePropertyChanged(nameof(ShowPageHeader));

        if (postId is not Guid id)
        {
            BodyHtml = string.Empty;
            return;
        }

        await RunAsync(async () =>
        {
            var post = await _api.GetCmsPostByIdAsync(id);
            Title = post.Title;
            Slug = post.Slug;
            Excerpt = post.Excerpt ?? string.Empty;
            CoverImageUrl = post.CoverImageUrl ?? string.Empty;
            BodyHtml = post.BodyHtml;
            IsPublished = post.IsPublished;
        });
    }

    private async void UploadCover_Click(object sender, RoutedEventArgs e)
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
            var upload = await _api.UploadFileAsync(dialog.FileName, "cms");
            CoverImageUrl = upload.PublicPath;
            StatusMessage = "Cover image uploaded.";
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
            var upload = await _api.UploadFileAsync(filePath, "cms");
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
        ErrorMessage = null;
        SetFieldError(ref _titleError, null, nameof(TitleError), nameof(HasTitleError));

        if (string.IsNullOrWhiteSpace(Title))
        {
            SetFieldError(ref _titleError, "Title is required.", nameof(TitleError), nameof(HasTitleError));
            return;
        }

        var dto = new CmsPostUpsertDto
        {
            Title = Title.Trim(),
            Slug = Slug.Trim(),
            Excerpt = string.IsNullOrWhiteSpace(Excerpt) ? null : Excerpt.Trim(),
            CoverImageUrl = string.IsNullOrWhiteSpace(CoverImageUrl) ? null : CoverImageUrl.Trim(),
            BodyHtml = HtmlEditorHelper.NormalizeOutput(await BodyEditor.GetHtmlAsync()),
            IsPublished = IsPublished,
        };

        await RunAsync(async () =>
        {
            if (_postId is Guid id)
            {
                await _api.UpdateCmsPostAsync(id, dto);
                StatusMessage = "Post updated.";
            }
            else
            {
                await _api.CreateCmsPostAsync(dto);
                StatusMessage = "Post created.";
            }

            if (_dialogMode)
            {
                DialogFinished?.Invoke(this, true);
            }
            else
            {
                _navigation!.NavigateTo("staff-cms");
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

        _navigation!.NavigateTo("staff-cms");
    }
}
