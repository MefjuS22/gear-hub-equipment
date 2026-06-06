namespace GearHubDesktop.Helpers;

public static class FormatCurrency
{
    public static string Format(decimal amount) => amount.ToString("C");
}
