using System.Windows;

namespace GearHubDesktop.Helpers;

public static class FormValidation
{
    public static readonly DependencyProperty HasErrorProperty = DependencyProperty.RegisterAttached(
        "HasError",
        typeof(bool),
        typeof(FormValidation),
        new FrameworkPropertyMetadata(false, FrameworkPropertyMetadataOptions.Inherits));

    public static bool GetHasError(DependencyObject element) =>
        (bool)element.GetValue(HasErrorProperty);

    public static void SetHasError(DependencyObject element, bool value) =>
        element.SetValue(HasErrorProperty, value);
}
