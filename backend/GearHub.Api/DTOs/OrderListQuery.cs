namespace GearHub.Api.DTOs;

public class OrderListQuery : PaginationQuery
{
    public string? Search { get; set; }
    public DateTime? OrderDateFrom { get; set; }
    public DateTime? OrderDateTo { get; set; }
    public int? CustomerId { get; set; }
}
