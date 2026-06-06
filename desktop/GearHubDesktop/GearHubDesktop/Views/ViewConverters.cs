using System.Globalization;
using System.Windows;
using System.Windows.Data;

namespace GearHubDesktop.Views;

public sealed class InverseBooleanConverter : IValueConverter
{
    public object Convert(object value, Type targetType, object parameter, CultureInfo culture) =>
        value is bool flag ? !flag : true;

    public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture) =>
        value is bool flag ? !flag : false;
}

public sealed class NullOrEmptyToVisibilityConverter : IValueConverter
{
    public object Convert(object value, Type targetType, object parameter, CultureInfo culture) =>
        value is string text && !string.IsNullOrWhiteSpace(text)
            ? Visibility.Visible
            : Visibility.Collapsed;

    public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture) =>
        throw new NotSupportedException();
}
