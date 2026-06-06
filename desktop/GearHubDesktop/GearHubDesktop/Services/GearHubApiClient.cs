using System.Net.Http;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text;
using GearHubDesktop.DTOs;
using GearHubDesktop.Models;

namespace GearHubDesktop.Services;

public sealed class GearHubApiClient
{
    private readonly HttpClient _http;
    private readonly IAuthSession _session;

    public GearHubApiClient(HttpClient http, IAuthSession session)
    {
        _http = http;
        _session = session;
    }

    public void ApplyAuthHeader()
    {
        if (string.IsNullOrWhiteSpace(_session.AccessToken))
        {
            _http.DefaultRequestHeaders.Authorization = null;
            return;
        }

        _http.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", _session.AccessToken);
    }

    public async Task<AuthResponseDto> LoginAsync(string email, string password)
    {
        var response = await _http.PostAsJsonAsync(
            "api/Auth/login",
            new LoginRequestDto { Email = email, Password = password },
            ApiJson.Options);
        await ApiJson.EnsureSuccessAsync(response);
        return await ApiJson.ReadAsync<AuthResponseDto>(response);
    }

    public async Task<AuthResponseDto> RegisterAsync(string email, string password, string displayName)
    {
        var response = await _http.PostAsJsonAsync(
            "api/Auth/register",
            new RegisterUserRequestDto { Email = email, Password = password, DisplayName = displayName },
            ApiJson.Options);
        await ApiJson.EnsureSuccessAsync(response);
        return await ApiJson.ReadAsync<AuthResponseDto>(response);
    }

    public async Task<UserProfileDto> GetMeAsync()
    {
        var response = await _http.GetAsync("api/Auth/me");
        await ApiJson.EnsureSuccessAsync(response);
        return await ApiJson.ReadAsync<UserProfileDto>(response);
    }

    public async Task<PagedResultDto<EquipmentDto>> GetEquipmentAsync(
        int page,
        int pageSize,
        string? search = null,
        string? category = null)
    {
        var query = BuildQuery(
            ("page", page.ToString()),
            ("pageSize", pageSize.ToString()),
            ("search", search),
            ("category", category));
        var response = await _http.GetAsync($"api/Equipment{query}");
        await ApiJson.EnsureSuccessAsync(response);
        return await ApiJson.ReadAsync<PagedResultDto<EquipmentDto>>(response);
    }

    public async Task<string[]> GetEquipmentCategoriesAsync(string? search = null)
    {
        var query = BuildQuery(("search", search));
        var response = await _http.GetAsync($"api/Equipment/Categories{query}");
        await ApiJson.EnsureSuccessAsync(response);
        return await ApiJson.ReadAsync<string[]>(response) ?? [];
    }

    public async Task<EquipmentDto> GetEquipmentByIdAsync(int id)
    {
        var response = await _http.GetAsync($"api/Equipment/{id}");
        await ApiJson.EnsureSuccessAsync(response);
        return await ApiJson.ReadAsync<EquipmentDto>(response);
    }

    public async Task<PagedResultDto<RentalOrderListDto>> GetOrdersAsync(
        int page,
        int pageSize,
        string? search = null)
    {
        var query = BuildQuery(
            ("page", page.ToString()),
            ("pageSize", pageSize.ToString()),
            ("search", search));
        var response = await _http.GetAsync($"api/Order{query}");
        await ApiJson.EnsureSuccessAsync(response);
        return await ApiJson.ReadAsync<PagedResultDto<RentalOrderListDto>>(response);
    }

    public async Task<RentalOrderListDto> GetOrderByIdAsync(int id)
    {
        var response = await _http.GetAsync($"api/Order/{id}");
        await ApiJson.EnsureSuccessAsync(response);
        return await ApiJson.ReadAsync<RentalOrderListDto>(response);
    }

    public async Task CreateOrderAsync(OrderCreateDto dto)
    {
        var response = await _http.PostAsJsonAsync("api/Order/CreateOrder", dto, ApiJson.Options);
        await ApiJson.EnsureSuccessAsync(response);
    }

    public async Task<IReadOnlyList<CustomerCheckoutOptionDto>> GetMyCustomersAsync()
    {
        var response = await _http.GetAsync("api/Customer/mine");
        await ApiJson.EnsureSuccessAsync(response);
        return await ApiJson.ReadAsync<List<CustomerCheckoutOptionDto>>(response) ?? [];
    }

    public async Task<PagedResultDto<Customer>> GetCustomersAsync(int page, int pageSize)
    {
        var query = BuildQuery(("page", page.ToString()), ("pageSize", pageSize.ToString()));
        var response = await _http.GetAsync($"api/Customer{query}");
        await ApiJson.EnsureSuccessAsync(response);
        return await ApiJson.ReadAsync<PagedResultDto<Customer>>(response);
    }

    public async Task<DashboardStatsDto> GetDashboardStatsAsync()
    {
        var response = await _http.GetAsync("api/Dashboard/stats");
        await ApiJson.EnsureSuccessAsync(response);
        return await ApiJson.ReadAsync<DashboardStatsDto>(response);
    }

    public async Task<PagedResultDto<BrandLookupDto>> GetBrandsAsync(int page, int pageSize)
    {
        var query = BuildQuery(("page", page.ToString()), ("pageSize", pageSize.ToString()));
        var response = await _http.GetAsync($"api/Brand{query}");
        await ApiJson.EnsureSuccessAsync(response);
        return await ApiJson.ReadAsync<PagedResultDto<BrandLookupDto>>(response);
    }

    public async Task CreateBrandAsync(string name)
    {
        var response = await _http.PostAsJsonAsync("api/Brand", new BrandUpsertDto { Name = name }, ApiJson.Options);
        await ApiJson.EnsureSuccessAsync(response);
    }

    public async Task<PagedResultDto<CategoryLookupDto>> GetCategoriesAsync(int page, int pageSize)
    {
        var query = BuildQuery(("page", page.ToString()), ("pageSize", pageSize.ToString()));
        var response = await _http.GetAsync($"api/Category{query}");
        await ApiJson.EnsureSuccessAsync(response);
        return await ApiJson.ReadAsync<PagedResultDto<CategoryLookupDto>>(response);
    }

    public async Task CreateCategoryAsync(string name)
    {
        var response = await _http.PostAsJsonAsync(
            "api/Category",
            new CategoryUpsertDto { Name = name, Description = string.Empty },
            ApiJson.Options);
        await ApiJson.EnsureSuccessAsync(response);
    }

    public async Task<PagedResultDto<WarehouseLookupDto>> GetWarehousesAsync(int page, int pageSize)
    {
        var query = BuildQuery(("page", page.ToString()), ("pageSize", pageSize.ToString()));
        var response = await _http.GetAsync($"api/Warehouse{query}");
        await ApiJson.EnsureSuccessAsync(response);
        return await ApiJson.ReadAsync<PagedResultDto<WarehouseLookupDto>>(response);
    }

    public async Task CreateWarehouseAsync(string name, string location)
    {
        var response = await _http.PostAsJsonAsync(
            "api/Warehouse",
            new WarehouseUpsertDto { Name = name, Location = location },
            ApiJson.Options);
        await ApiJson.EnsureSuccessAsync(response);
    }

    public async Task<PagedResultDto<UserAdminListDto>> GetUsersAsync(int page, int pageSize)
    {
        var query = BuildQuery(("page", page.ToString()), ("pageSize", pageSize.ToString()));
        var response = await _http.GetAsync($"api/Users{query}");
        await ApiJson.EnsureSuccessAsync(response);
        return await ApiJson.ReadAsync<PagedResultDto<UserAdminListDto>>(response);
    }

    public async Task<PagedResultDto<CmsPostPublicSummaryDto>> GetPublishedNewsAsync(int page, int pageSize)
    {
        var query = BuildQuery(("page", page.ToString()), ("pageSize", pageSize.ToString()));
        var response = await _http.GetAsync($"api/CmsPost/Published{query}");
        await ApiJson.EnsureSuccessAsync(response);
        return await ApiJson.ReadAsync<PagedResultDto<CmsPostPublicSummaryDto>>(response);
    }

    public async Task<CmsPostPublicDetailDto> GetNewsBySlugAsync(string slug)
    {
        var response = await _http.GetAsync($"api/CmsPost/Published/{Uri.EscapeDataString(slug)}");
        await ApiJson.EnsureSuccessAsync(response);
        return await ApiJson.ReadAsync<CmsPostPublicDetailDto>(response);
    }

    public async Task DownloadFileAsync(string relativePath, string destinationPath, IDictionary<string, string?>? query = null)
    {
        var pairs = query?
            .Where(pair => !string.IsNullOrWhiteSpace(pair.Value))
            .Select(pair => (pair.Key, pair.Value!))
            .ToArray() ?? [];
        var path = relativePath.StartsWith('/') ? relativePath : $"/{relativePath}";
        var url = pairs.Length == 0 ? path.TrimStart('/') : $"{path.TrimStart('/')}{BuildQuery(pairs)}";

        var response = await _http.GetAsync(url, HttpCompletionOption.ResponseHeadersRead);
        await ApiJson.EnsureSuccessAsync(response);
        await using var stream = await response.Content.ReadAsStreamAsync();
        await using var file = File.Create(destinationPath);
        await stream.CopyToAsync(file);
    }

    private static string BuildQuery(params (string Key, string? Value)[] pairs)
    {
        var builder = new StringBuilder();
        var first = true;
        foreach (var (key, value) in pairs)
        {
            if (string.IsNullOrWhiteSpace(value))
            {
                continue;
            }

            builder.Append(first ? '?' : '&');
            builder.Append(Uri.EscapeDataString(key));
            builder.Append('=');
            builder.Append(Uri.EscapeDataString(value));
            first = false;
        }

        return builder.ToString();
    }
}
