namespace GearHub.Api.Models;

public class RentalOrder
{
    public int Id { get; set; }

    public int CustomerId { get; set; }
    public Customer? Customer { get; set; }

    public int UserId { get; set; }
    public User? User { get; set; }

    public DateTime OrderDate { get; set; }
    public DateTime RentalStartDate { get; set; }
    public DateTime RentalEndDate { get; set; }

    public ICollection<RentalOrderItem> Items { get; set; } = new List<RentalOrderItem>();
}
