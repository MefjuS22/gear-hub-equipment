namespace GearHub.Api.DTOs;

public static class Pagination
{
    public const int DefaultPageSize = 10;
    public const int MaxPageSize = 100;

    public static (int Page, int PageSize, int Skip) Normalize(PaginationQuery query) =>
        Normalize(query.Page, query.PageSize);

    public static (int Page, int PageSize, int Skip) Normalize(int page, int pageSize)
    {
        page = page < 1 ? 1 : page;
        pageSize = pageSize < 1 ? DefaultPageSize : Math.Min(pageSize, MaxPageSize);
        return (page, pageSize, (page - 1) * pageSize);
    }

    public static PagedResultDto<T> Create<T>(
        IReadOnlyList<T> items,
        int page,
        int pageSize,
        int totalCount) =>
        new()
        {
            Items = items,
            Page = page,
            PageSize = pageSize,
            TotalCount = totalCount,
            TotalPages = totalCount == 0 ? 0 : (int)Math.Ceiling(totalCount / (double)pageSize),
        };
}
