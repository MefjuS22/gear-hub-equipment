namespace GearHubDesktop.Shell;

public interface IAppNavigation
{
    void OnAuthenticated();

    void NavigateTo(string target, object? parameter = null);
}

public interface ILoadableView
{
    Task LoadAsync();
}
