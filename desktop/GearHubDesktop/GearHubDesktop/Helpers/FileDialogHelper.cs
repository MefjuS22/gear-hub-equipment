using System.Windows;
using Microsoft.Win32;

namespace GearHubDesktop.Helpers;

public static class FileDialogHelper
{
    public static bool TryPickImage(DependencyObject owner, out string filePath)
    {
        filePath = string.Empty;
        var dialog = new OpenFileDialog
        {
            Filter = "Images|*.png;*.jpg;*.jpeg;*.webp;*.gif|All files|*.*",
        };

        var window = Window.GetWindow(owner);
        var accepted = window is null ? dialog.ShowDialog() : dialog.ShowDialog(window);
        if (accepted != true)
        {
            return false;
        }

        filePath = dialog.FileName;
        return !string.IsNullOrWhiteSpace(filePath);
    }
}
