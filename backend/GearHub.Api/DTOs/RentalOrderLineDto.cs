namespace GearHub.Api.DTOs;

public class RentalOrderLineDto
{
    public int EquipmentId { get; set; }
    public string EquipmentName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
}
