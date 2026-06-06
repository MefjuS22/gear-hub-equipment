using System.Windows;
using System.Windows.Controls;
using GearHubDesktop.Services;
using GearHubDesktop.Shell;

namespace GearHubDesktop.Views;

public partial class LoginView : ViewControllerBase
{
    private readonly GearHubApiClient _api;
    private readonly IAuthSession _session;
    private readonly IAppNavigation _navigation;

    private string _email = string.Empty;
    private string _displayName = string.Empty;
    private bool _isRegisterMode;

    public LoginView(GearHubApiClient api, IAuthSession session, IAppNavigation navigation)
    {
        _api = api;
        _session = session;
        _navigation = navigation;
        InitializeComponent();
        DataContext = this;
    }

    public string Email
    {
        get => _email;
        set => SetProperty(ref _email, value);
    }

    public string DisplayName
    {
        get => _displayName;
        set => SetProperty(ref _displayName, value);
    }

    public bool IsRegisterMode
    {
        get => _isRegisterMode;
        set
        {
            SetProperty(ref _isRegisterMode, value);
            RaisePropertyChanged(nameof(SubmitLabel));
            RaisePropertyChanged(nameof(DisplayNameVisibility));
        }
    }

    public string SubmitLabel => IsRegisterMode ? "Create account" : "Sign in";

    public Visibility DisplayNameVisibility =>
        IsRegisterMode ? Visibility.Visible : Visibility.Collapsed;

    private async void Submit_Click(object sender, RoutedEventArgs e)
    {
        await RunAsync(async () =>
        {
            var password = PasswordInput.Password;
            if (string.IsNullOrWhiteSpace(Email) || string.IsNullOrWhiteSpace(password))
            {
                throw new InvalidOperationException("Email and password are required.");
            }

            if (IsRegisterMode && string.IsNullOrWhiteSpace(DisplayName))
            {
                throw new InvalidOperationException("Display name is required for registration.");
            }

            var auth = IsRegisterMode
                ? await _api.RegisterAsync(Email.Trim(), password, DisplayName.Trim())
                : await _api.LoginAsync(Email.Trim(), password);

            _session.SetSession(auth);
            _api.ApplyAuthHeader();
            await _session.SaveAsync();
            _navigation.OnAuthenticated();
        });
    }
}
