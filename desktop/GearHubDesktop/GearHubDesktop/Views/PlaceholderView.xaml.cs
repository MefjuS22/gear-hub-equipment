namespace GearHubDesktop.Views;

public partial class PlaceholderView : ViewControllerBase
{
    private string _title = string.Empty;
    private string _message = string.Empty;

    public PlaceholderView()
    {
        InitializeComponent();
        DataContext = this;
    }

    public string Title
    {
        get => _title;
        private set => SetProperty(ref _title, value);
    }

    public string Message
    {
        get => _message;
        private set => SetProperty(ref _message, value);
    }

    public void Configure(string title, string message)
    {
        Title = title;
        Message = message;
    }
}
