namespace GearHub.Api.DTOs;

public class RentalOrderListDto
{
    public int Id { get; set; }
    public int CustomerId { get; set; }
    public string CustomerCompanyName { get; set; } = string.Empty;
    public int UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string UserEmail { get; set; } = string.Empty;
    public DateTime OrderDate { get; set; }
    public DateTime RentalStartDate { get; set; }
    public DateTime RentalEndDate { get; set; }
    public IReadOnlyList<RentalOrderLineDto> Items { get; set; } = Array.Empty<RentalOrderLineDto>();
}
