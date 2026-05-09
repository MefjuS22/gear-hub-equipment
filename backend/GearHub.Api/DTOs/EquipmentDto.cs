namespace GearHub.Api.DTOs;

public class EquipmentDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int CategoryId { get; set; }
    public string? CategoryName { get; set; }
    public int BrandId { get; set; }
    public string? BrandName { get; set; }
    public int WarehouseId { get; set; }
    public string? WarehouseName { get; set; }
    public decimal DailyRate { get; set; }
    public bool IsAvailable { get; set; }
    public string? ImageUrl { get; set; }
}
