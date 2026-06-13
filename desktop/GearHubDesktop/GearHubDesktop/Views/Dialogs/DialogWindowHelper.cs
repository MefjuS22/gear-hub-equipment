using System.Windows;

namespace GearHubDesktop.Views.Dialogs;

public static class DialogWindowHelper
{
    public static bool? Show(Window dialog, double? width = null, double? height = null)
    {
        dialog.Owner = Application.Current.MainWindow;
        dialog.WindowStartupLocation = WindowStartupLocation.CenterOwner;
        dialog.ShowInTaskbar = false;
        if (width is not null)
        {
            dialog.Width = width.Value;
        }

        if (height is not null)
        {
            dialog.Height = height.Value;
        }

        return dialog.ShowDialog();
    }
}
