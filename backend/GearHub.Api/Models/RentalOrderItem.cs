namespace GearHub.Api.Models;

public class RentalOrderItem
{
    public int RentalOrderId { get; set; }
    public RentalOrder? RentalOrder { get; set; }

    public int EquipmentId { get; set; }
    public Equipment? Equipment { get; set; }

    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
}
