namespace GearHubDesktop.DTOs;

public class MaintenanceUpsertDto
{
    public int EquipmentId { get; set; }
    public string Description { get; set; } = string.Empty;
    public DateTime Date { get; set; }
}
