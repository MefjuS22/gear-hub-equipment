namespace GearHub.Api.DTOs;

public class EquipmentUpsertDto
{
    public string Name { get; set; } = string.Empty;
    public int CategoryId { get; set; }
    public int BrandId { get; set; }
    public int WarehouseId { get; set; }
    public decimal DailyRate { get; set; }
    public bool IsAvailable { get; set; }
    public string? ImageUrl { get; set; }
    public string? DescriptionHtml { get; set; }
}
