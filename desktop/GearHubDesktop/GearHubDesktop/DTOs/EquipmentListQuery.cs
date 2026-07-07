namespace GearHubDesktop.DTOs;

public class EquipmentListQuery : PaginationQuery
{
    public string? Search { get; set; }
    public string? Category { get; set; }
}
