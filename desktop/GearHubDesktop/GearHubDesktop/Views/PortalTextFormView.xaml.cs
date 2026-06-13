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

    public PortalTextFormView(GearHubApiClient api, IAppNavigation navigation)
    {
        _api = api;
        _navigation = navigation;
        InitializeComponent();
        DataContext = this;
        BodyEditor.HtmlChanged += (_, _) => _bodyHtml = BodyEditor.GetHtml();
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
        }
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
        if (string.IsNullOrWhiteSpace(Title))
        {
            ErrorMessage = "Staff label is required.";
            return;
        }

        var body = HtmlEditorHelper.NormalizeOutput(await BodyEditor.GetHtmlAsync());
        if (string.IsNullOrEmpty(body))
        {
            ErrorMessage = "Portal content is required.";
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
