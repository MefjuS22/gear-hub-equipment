using System.Windows;
using System.Windows.Media;

namespace GearHubDesktop.Views.Dialogs;

public static class DialogWindowHelper
{
    public static bool? Show(Window dialog, double? width = null, double? height = null)
    {
        Configure(dialog, width, height);
        return dialog.ShowDialog();
    }

    public static void Configure(Window dialog, double? width = null, double? height = null)
    {
        dialog.Owner = Application.Current.MainWindow;
        dialog.WindowStartupLocation = WindowStartupLocation.CenterOwner;
        dialog.ShowInTaskbar = false;
        dialog.Background = GetResource<Brush>("BackgroundBrush") ?? Brushes.White;
        dialog.FontFamily = GetResource<FontFamily>("AppFont") ?? new FontFamily("Segoe UI");

        if (Application.Current.TryFindResource("ModalDialogWindow") is Style windowStyle)
        {
            dialog.Style = windowStyle;
        }

        if (width is not null)
        {
            dialog.Width = width.Value;
        }

        if (height is not null)
        {
            dialog.Height = height.Value;
        }
    }

    private static T? GetResource<T>(string key)
        where T : class
    {
        return Application.Current.TryFindResource(key) as T;
    }
}
