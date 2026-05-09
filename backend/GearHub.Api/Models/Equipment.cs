namespace GearHub.Api.Models;

public class Equipment
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;

    public int CategoryId { get; set; }
    public Category? Category { get; set; }

    public int BrandId { get; set; }
    public Brand? Brand { get; set; }

    public int WarehouseId { get; set; }
    public Warehouse? Warehouse { get; set; }

    public decimal DailyRate { get; set; }
    public bool IsAvailable { get; set; }

    /// <summary>Optional catalog image (URL or path such as /files/equipment/…).</summary>
    public string? ImageUrl { get; set; }

    public ICollection<Maintenance> Maintenances { get; set; } = new List<Maintenance>();
    public ICollection<RentalOrderItem> RentalOrderItems { get; set; } = new List<RentalOrderItem>();
}
