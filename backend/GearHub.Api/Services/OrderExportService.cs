using GearHub.Api.DTOs;
using GearHub.Api.Models;
using GearHub.Api.Repositories;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace GearHub.Api.Services;

public class OrderExportService(IOrderRepository orderRepository) : IOrderExportService
{
    public async Task<byte[]> ExportOrdersListPdfAsync(
        OrderListQuery query,
        CancellationToken cancellationToken = default)
    {
        var orders = await orderRepository.GetFilteredOrdersWithDetailsAsync(query, cancellationToken);
        var filterSummary = DescribeFilters(query);

        var document = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Margin(30);
                page.Size(PageSizes.A4);
                page.DefaultTextStyle(text => text.FontSize(10));

                page.Header().Column(column =>
                {
                    column.Item().Text("GearHub — Orders report").FontSize(18).Bold();
                    column.Item().Text($"Generated {DateTime.UtcNow:yyyy-MM-dd HH:mm} UTC")
                        .FontColor(Colors.Grey.Darken1);
                    if (!string.IsNullOrEmpty(filterSummary))
                    {
                        column.Item().Text($"Filters: {filterSummary}")
                            .FontColor(Colors.Grey.Darken2);
                    }
                    column.Item().Text($"{orders.Count} order(s)")
                        .FontColor(Colors.Grey.Darken2);
                });

                page.Content().PaddingVertical(10).Table(table =>
                {
                    table.ColumnsDefinition(columns =>
                    {
                        columns.ConstantColumn(36);
                        columns.RelativeColumn(2);
                        columns.RelativeColumn(2);
                        columns.RelativeColumn(2);
                        columns.RelativeColumn(2);
                        columns.RelativeColumn(1);
                    });

                    table.Header(header =>
                    {
                        header.Cell().Background(Colors.Grey.Lighten3).Padding(4).Text("ID").Bold();
                        header.Cell().Background(Colors.Grey.Lighten3).Padding(4).Text("Customer").Bold();
                        header.Cell().Background(Colors.Grey.Lighten3).Padding(4).Text("User").Bold();
                        header.Cell().Background(Colors.Grey.Lighten3).Padding(4).Text("Ordered").Bold();
                        header.Cell().Background(Colors.Grey.Lighten3).Padding(4).Text("Rental period").Bold();
                        header.Cell().Background(Colors.Grey.Lighten3).Padding(4).Text("Est. total").Bold();
                    });

                    foreach (var order in orders)
                    {
                        table.Cell().Padding(4).Text(order.Id.ToString());
                        table.Cell().Padding(4).Text(order.Customer?.CompanyName ?? "—");
                        table.Cell().Padding(4).Text(order.User?.DisplayName ?? order.User?.Email ?? "—");
                        table.Cell().Padding(4).Text(order.OrderDate.ToString("yyyy-MM-dd"));
                        table.Cell().Padding(4).Text(
                            $"{order.RentalStartDate:yyyy-MM-dd} → {order.RentalEndDate:yyyy-MM-dd}");
                        table.Cell().Padding(4).Text($"{OrderStatsHelper.EstimatedTotal(order):N2}");
                    }
                });

                page.Footer().AlignCenter().Text(text =>
                {
                    text.Span("Page ");
                    text.CurrentPageNumber();
                    text.Span(" / ");
                    text.TotalPages();
                });
            });
        });

        return document.GeneratePdf();
    }

    public async Task<byte[]?> ExportOrderPdfAsync(int orderId, CancellationToken cancellationToken = default)
    {
        var order = await orderRepository.GetOrderByIdWithDetailsAsync(orderId, cancellationToken);
        if (order is null)
        {
            return null;
        }

        var document = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Margin(30);
                page.Size(PageSizes.A4);
                page.DefaultTextStyle(text => text.FontSize(10));

                page.Header().Column(column =>
                {
                    column.Item().Text($"GearHub — Order #{order.Id}").FontSize(18).Bold();
                    column.Item().Text($"Generated {DateTime.UtcNow:yyyy-MM-dd HH:mm} UTC")
                        .FontColor(Colors.Grey.Darken1);
                });

                page.Content().PaddingVertical(10).Column(column =>
                {
                    column.Spacing(8);
                    column.Item().Text(text =>
                    {
                        text.Span("Customer: ").Bold();
                        text.Span(order.Customer?.CompanyName ?? "—");
                    });
                    column.Item().Text(text =>
                    {
                        text.Span("Placed by: ").Bold();
                        text.Span($"{order.User?.DisplayName ?? "—"} ({order.User?.Email ?? "—"})");
                    });
                    column.Item().Text(text =>
                    {
                        text.Span("Ordered: ").Bold();
                        text.Span(order.OrderDate.ToString("yyyy-MM-dd HH:mm"));
                    });
                    column.Item().Text(text =>
                    {
                        text.Span("Rental period: ").Bold();
                        text.Span($"{order.RentalStartDate:yyyy-MM-dd} → {order.RentalEndDate:yyyy-MM-dd}");
                    });
                    column.Item().Text(text =>
                    {
                        text.Span("Estimated total: ").Bold();
                        text.Span($"{OrderStatsHelper.EstimatedTotal(order):N2}");
                    });

                    column.Item().PaddingTop(10).Table(table =>
                    {
                        table.ColumnsDefinition(columns =>
                        {
                            columns.RelativeColumn(3);
                            columns.ConstantColumn(50);
                            columns.ConstantColumn(80);
                            columns.ConstantColumn(80);
                        });

                        table.Header(header =>
                        {
                            header.Cell().Background(Colors.Grey.Lighten3).Padding(4).Text("Equipment").Bold();
                            header.Cell().Background(Colors.Grey.Lighten3).Padding(4).Text("Qty").Bold();
                            header.Cell().Background(Colors.Grey.Lighten3).Padding(4).Text("Unit/day").Bold();
                            header.Cell().Background(Colors.Grey.Lighten3).Padding(4).Text("Line est.").Bold();
                        });

                        var days = OrderStatsHelper.RentalDays(order);
                        foreach (var item in order.Items)
                        {
                            var lineTotal = item.Quantity * item.UnitPrice * days;
                            table.Cell().Padding(4).Text(item.Equipment?.Name ?? $"#{item.EquipmentId}");
                            table.Cell().Padding(4).Text(item.Quantity.ToString());
                            table.Cell().Padding(4).Text($"{item.UnitPrice:N2}");
                            table.Cell().Padding(4).Text($"{lineTotal:N2}");
                        }
                    });
                });

                page.Footer().AlignCenter().Text(text =>
                {
                    text.Span("Page ");
                    text.CurrentPageNumber();
                    text.Span(" / ");
                    text.TotalPages();
                });
            });
        });

        return document.GeneratePdf();
    }

    private static string DescribeFilters(OrderListQuery query)
    {
        var parts = new List<string>();

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            parts.Add($"search \"{query.Search.Trim()}\"");
        }

        if (query.CustomerId is int customerId and > 0)
        {
            parts.Add($"customer #{customerId}");
        }

        if (query.OrderDateFrom is DateTime from)
        {
            parts.Add($"ordered from {from:yyyy-MM-dd}");
        }

        if (query.OrderDateTo is DateTime to)
        {
            parts.Add($"ordered to {to:yyyy-MM-dd}");
        }

        return string.Join(", ", parts);
    }
}
