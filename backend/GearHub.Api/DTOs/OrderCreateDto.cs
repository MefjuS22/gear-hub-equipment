namespace GearHub.Api.DTOs;

public class OrderCreateDto
{
    /// <summary>When set, links the order to an existing customer.</summary>
    public int? CustomerId { get; set; }

    /// <summary>When <see cref="CustomerId"/> is not set, creates a new customer with this company name.</summary>
    public string? CompanyName { get; set; }

    /// <summary>When <see cref="CustomerId"/> is not set, creates a new customer with this contact person.</summary>
    public string? ContactPerson { get; set; }

    public DateTime RentalStartDate { get; set; }
    public DateTime RentalEndDate { get; set; }
    public List<OrderItemDto> Items { get; set; } = [];
}
