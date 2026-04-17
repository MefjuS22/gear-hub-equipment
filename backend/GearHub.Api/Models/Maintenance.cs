namespace GearHub.Api.Models;

public class Maintenance
{
    public int Id { get; set; }
    public int EquipmentId { get; set; }
    public Equipment? Equipment { get; set; }

    public string Description { get; set; } = string.Empty;
    public DateTime Date { get; set; }
}
