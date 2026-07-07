namespace GearHubDesktop.DTOs;

public class DashboardStatsDto
{
    public DashboardSummaryDto Summary { get; set; } = new();
    public IReadOnlyList<DashboardChartPointDto> OrdersByDay { get; set; } = [];
    public IReadOnlyList<DashboardChartPointDto> RevenueByDay { get; set; } = [];
    public IReadOnlyList<DashboardChartPointDto> TopEquipment { get; set; } = [];
    public IReadOnlyList<DashboardChartPointDto> LoginsByDay { get; set; } = [];
}

public class DashboardSummaryDto
{
    public int TotalOrders { get; set; }
    public int OrdersLast30Days { get; set; }
    public int TotalCustomers { get; set; }
    public int TotalEquipment { get; set; }
    public int AvailableEquipment { get; set; }
    public int LoginsLast24Hours { get; set; }
    public int UniqueUsersLoggedInLast24Hours { get; set; }
    public decimal EstimatedRevenueLast30Days { get; set; }
}

public class DashboardChartPointDto
{
    public string Label { get; set; } = string.Empty;
    public decimal Value { get; set; }
}
