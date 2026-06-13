using System.ComponentModel;
using System.Runtime.CompilerServices;
using System.Windows.Controls;

namespace GearHubDesktop.Views;

public class ViewControllerBase : UserControl, INotifyPropertyChanged
{
    private bool _isBusy;
    private string? _errorMessage;
    private string? _statusMessage;

    public bool IsBusy
    {
        get => _isBusy;
        set => SetProperty(ref _isBusy, value);
    }

    public string? ErrorMessage
    {
        get => _errorMessage;
        set => SetProperty(ref _errorMessage, value);
    }

    public string? StatusMessage
    {
        get => _statusMessage;
        set => SetProperty(ref _statusMessage, value);
    }

    public event PropertyChangedEventHandler? PropertyChanged;

    protected void SetProperty<T>(ref T field, T value, [CallerMemberName] string? propertyName = null)
    {
        if (EqualityComparer<T>.Default.Equals(field, value))
        {
            return;
        }

        field = value;
        PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
    }

    protected void RaisePropertyChanged([CallerMemberName] string? propertyName = null) =>
        PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));

    protected bool SetFieldError(
        ref string? storage,
        string? message,
        string errorPropertyName,
        string hasErrorPropertyName)
    {
        if (storage == message)
        {
            return !string.IsNullOrEmpty(message);
        }

        storage = message;
        RaisePropertyChanged(errorPropertyName);
        RaisePropertyChanged(hasErrorPropertyName);
        return !string.IsNullOrEmpty(message);
    }

    protected async Task RunAsync(Func<Task> action)
    {
        ErrorMessage = null;
        IsBusy = true;
        try
        {
            await action();
        }
        catch (Exception ex)
        {
            ErrorMessage = ex.Message;
        }
        finally
        {
            IsBusy = false;
        }
    }
}
