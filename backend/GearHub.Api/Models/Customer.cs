namespace GearHub.Api.Models;

public class Customer
{
    public int Id { get; set; }
    public string CompanyName { get; set; } = string.Empty;
    public string ContactPerson { get; set; } = string.Empty;

    public ICollection<RentalOrder> RentalOrders { get; set; } = new List<RentalOrder>();
}
