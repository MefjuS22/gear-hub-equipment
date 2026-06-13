using System.Windows;
using GearHubDesktop.DTOs;
using GearHubDesktop.Helpers;
using GearHubDesktop.Services;
using GearHubDesktop.Shell;
using GearHubDesktop.Views.Dialogs;

namespace GearHubDesktop.Views;

public partial class PortalTextFormView : ViewControllerBase, INotifyDialogFinished
{
    private readonly GearHubApiClient _api;
    private readonly IAppNavigation? _navigation;

    private bool _dialogMode;
    private string _textKey = string.Empty;
    private string _title = string.Empty;
    private string _placementHint = string.Empty;
    private string _bodyHtml = string.Empty;
    private string? _titleError;
    private string? _bodyError;

    public PortalTextFormView(GearHubApiClient api, IAppNavigation navigation)
    {
        _api = api;
        _navigation = navigation;
        InitializeComponent();
        DataContext = this;
        BodyEditor.HtmlChanged += (_, _) =>
        {
            _bodyHtml = BodyEditor.GetHtml();
            SetFieldError(ref _bodyError, null, nameof(BodyError), nameof(HasBodyError));
        };
    }

    public event EventHandler<bool>? DialogFinished;

    public void ConfigureAsDialog() => _dialogMode = true;

    public bool ShowPageHeader => !_dialogMode;

    public string PageTitle => string.IsNullOrWhiteSpace(Title) ? "Edit portal text" : Title;

    public string PlacementHint
    {
        get => _placementHint;
        private set => SetProperty(ref _placementHint, value);
    }

    public string Title
    {
        get => _title;
        set
        {
            SetProperty(ref _title, value);
            RaisePropertyChanged(nameof(PageTitle));
            SetFieldError(ref _titleError, null, nameof(TitleError), nameof(HasTitleError));
        }
    }

    public string? TitleError => _titleError;
    public bool HasTitleError => !string.IsNullOrEmpty(_titleError);

    public string? BodyError => _bodyError;
    public bool HasBodyError => !string.IsNullOrEmpty(_bodyError);

    public string BodyHtml
    {
        get => _bodyHtml;
        set
        {
            SetProperty(ref _bodyHtml, value);
            BodyEditor.SetHtml(value);
        }
    }

    public async Task LoadAsync(string key)
    {
        _textKey = key;
        RaisePropertyChanged(nameof(ShowPageHeader));

        await RunAsync(async () =>
        {
            var text = await _api.GetPortalTextByKeyAsync(key);
            Title = text.Title;
            PlacementHint = text.PlacementHint;
            BodyHtml = text.BodyHtml;
        });
    }

    private async void Save_Click(object sender, RoutedEventArgs e)
    {
        ErrorMessage = null;
        SetFieldError(ref _titleError, null, nameof(TitleError), nameof(HasTitleError));
        SetFieldError(ref _bodyError, null, nameof(BodyError), nameof(HasBodyError));

        var valid = true;

        if (string.IsNullOrWhiteSpace(Title))
        {
            valid &= !SetFieldError(
                ref _titleError,
                "Staff label is required.",
                nameof(TitleError),
                nameof(HasTitleError));
        }

        var body = HtmlEditorHelper.NormalizeOutput(await BodyEditor.GetHtmlAsync());
        if (string.IsNullOrEmpty(body))
        {
            valid &= !SetFieldError(
                ref _bodyError,
                "Portal content is required.",
                nameof(BodyError),
                nameof(HasBodyError));
        }

        if (!valid)
        {
            return;
        }

        var dto = new PortalTextUpsertDto
        {
            Title = Title.Trim(),
            BodyHtml = body,
        };

        await RunAsync(async () =>
        {
            await _api.UpdatePortalTextAsync(_textKey, dto);
            StatusMessage = "Portal text saved.";
            if (_dialogMode)
            {
                DialogFinished?.Invoke(this, true);
            }
            else
            {
                _navigation!.NavigateTo("staff-portal-texts");
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

        _navigation!.NavigateTo("staff-portal-texts");
    }
}
