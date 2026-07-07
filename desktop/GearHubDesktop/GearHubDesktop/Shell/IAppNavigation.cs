namespace GearHubDesktop.Shell;

public interface IAppNavigation
{
    void OnAuthenticated();

    void NavigateTo(string target, object? parameter = null);

    void GoBack();

    bool CanGoBack { get; }
}

public interface ILoadableView
{
    Task LoadAsync();
}
