namespace GearHub.Api.DTOs;

public class OrderCreateDto
{
    public int CustomerId { get; set; }
    public DateTime RentalStartDate { get; set; }
    public DateTime RentalEndDate { get; set; }
    public List<OrderItemDto> Items { get; set; } = [];
}
