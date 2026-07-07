namespace GearHubDesktop.Views;

public sealed class LookupListItem
{
    public LookupListItem(int id, string display)
    {
        Id = id;
        Display = display;
    }

    public int Id { get; }
    public string Display { get; }

    public override string ToString() => Display;
}
