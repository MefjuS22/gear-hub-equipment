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

    public async Task<EquipmentDto> CreateEquipmentAsync(EquipmentUpsertDto dto)
    {
        var response = await _http.PostAsJsonAsync("api/Equipment", dto, ApiJson.Options);
        await ApiJson.EnsureSuccessAsync(response);
        return await ApiJson.ReadAsync<EquipmentDto>(response);
    }

    public async Task UpdateEquipmentAsync(int id, EquipmentUpsertDto dto)
    {
        var response = await _http.PutAsJsonAsync($"api/Equipment/{id}", dto, ApiJson.Options);
        await ApiJson.EnsureSuccessAsync(response);
    }

    public async Task DeleteEquipmentAsync(int id)
    {
        var response = await _http.DeleteAsync($"api/Equipment/{id}");
        await ApiJson.EnsureSuccessAsync(response);
    }

    public async Task<FileUploadResponseDto> UploadFileAsync(string filePath, string folder = "general")
    {
        await using var stream = File.OpenRead(filePath);
        using var content = new MultipartFormDataContent();
        using var fileContent = new StreamContent(stream);
        fileContent.Headers.ContentType = new MediaTypeHeaderValue("application/octet-stream");
        content.Add(fileContent, "file", Path.GetFileName(filePath));
        content.Add(new StringContent(folder), "folder");

        var response = await _http.PostAsync("api/Files/upload", content);
        await ApiJson.EnsureSuccessAsync(response);
        return await ApiJson.ReadAsync<FileUploadResponseDto>(response);
    }

    public async Task<PagedResultDto<RentalOrderListDto>> GetOrdersAsync(
        int page,
        int pageSize,
        string? search = null,
        DateTime? orderDateFrom = null,
        DateTime? orderDateTo = null,
        int? customerId = null)
    {
        var query = BuildQuery(
            ("page", page.ToString()),
            ("pageSize", pageSize.ToString()),
            ("search", search),
            ("orderDateFrom", orderDateFrom?.ToString("yyyy-MM-dd")),
            ("orderDateTo", orderDateTo?.ToString("yyyy-MM-dd")),
            ("customerId", customerId?.ToString()));
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

    public async Task DeleteBrandAsync(int id)
    {
        var response = await _http.DeleteAsync($"api/Brand/{id}");
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

    public async Task DeleteCategoryAsync(int id)
    {
        var response = await _http.DeleteAsync($"api/Category/{id}");
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

    public async Task DeleteWarehouseAsync(int id)
    {
        var response = await _http.DeleteAsync($"api/Warehouse/{id}");
        await ApiJson.EnsureSuccessAsync(response);
    }

    public async Task<PagedResultDto<UserAdminListDto>> GetUsersAsync(int page, int pageSize)
    {
        var query = BuildQuery(("page", page.ToString()), ("pageSize", pageSize.ToString()));
        var response = await _http.GetAsync($"api/Users{query}");
        await ApiJson.EnsureSuccessAsync(response);
        return await ApiJson.ReadAsync<PagedResultDto<UserAdminListDto>>(response);
    }

    public async Task<UserAdminListDto> CreateUserAsync(CreateUserAdminDto dto)
    {
        var response = await _http.PostAsJsonAsync("api/Users", dto, ApiJson.Options);
        await ApiJson.EnsureSuccessAsync(response);
        return await ApiJson.ReadAsync<UserAdminListDto>(response);
    }

    public async Task SetUserRolesAsync(int id, SetUserRolesDto dto)
    {
        var response = await _http.PutAsJsonAsync($"api/Users/{id}/roles", dto, ApiJson.Options);
        await ApiJson.EnsureSuccessAsync(response);
    }

    public async Task DeleteUserAsync(int id)
    {
        var response = await _http.DeleteAsync($"api/Users/{id}");
        await ApiJson.EnsureSuccessAsync(response);
    }

    public async Task<PagedResultDto<CmsPostListDto>> GetCmsPostsAsync(int page, int pageSize)
    {
        var query = BuildQuery(("page", page.ToString()), ("pageSize", pageSize.ToString()));
        var response = await _http.GetAsync($"api/CmsPost{query}");
        await ApiJson.EnsureSuccessAsync(response);
        return await ApiJson.ReadAsync<PagedResultDto<CmsPostListDto>>(response);
    }

    public async Task<CmsPostDetailDto> GetCmsPostByIdAsync(Guid id)
    {
        var response = await _http.GetAsync($"api/CmsPost/{id}");
        await ApiJson.EnsureSuccessAsync(response);
        return await ApiJson.ReadAsync<CmsPostDetailDto>(response);
    }

    public async Task<CmsPostDetailDto> CreateCmsPostAsync(CmsPostUpsertDto dto)
    {
        var response = await _http.PostAsJsonAsync("api/CmsPost", dto, ApiJson.Options);
        await ApiJson.EnsureSuccessAsync(response);
        return await ApiJson.ReadAsync<CmsPostDetailDto>(response);
    }

    public async Task<CmsPostDetailDto> UpdateCmsPostAsync(Guid id, CmsPostUpsertDto dto)
    {
        var response = await _http.PutAsJsonAsync($"api/CmsPost/{id}", dto, ApiJson.Options);
        await ApiJson.EnsureSuccessAsync(response);
        return await ApiJson.ReadAsync<CmsPostDetailDto>(response);
    }

    public async Task DeleteCmsPostAsync(Guid id)
    {
        var response = await _http.DeleteAsync($"api/CmsPost/{id}");
        await ApiJson.EnsureSuccessAsync(response);
    }

    public async Task<PagedResultDto<PortalTextDto>> GetPortalTextsAsync(int page, int pageSize)
    {
        var query = BuildQuery(("page", page.ToString()), ("pageSize", pageSize.ToString()));
        var response = await _http.GetAsync($"api/PortalText{query}");
        await ApiJson.EnsureSuccessAsync(response);
        return await ApiJson.ReadAsync<PagedResultDto<PortalTextDto>>(response);
    }

    public async Task<PortalTextDto> GetPortalTextByKeyAsync(string key)
    {
        var response = await _http.GetAsync($"api/PortalText/{Uri.EscapeDataString(key)}");
        await ApiJson.EnsureSuccessAsync(response);
        return await ApiJson.ReadAsync<PortalTextDto>(response);
    }

    public async Task<PortalTextDto> UpdatePortalTextAsync(string key, PortalTextUpsertDto dto)
    {
        var response = await _http.PutAsJsonAsync($"api/PortalText/{Uri.EscapeDataString(key)}", dto, ApiJson.Options);
        await ApiJson.EnsureSuccessAsync(response);
        return await ApiJson.ReadAsync<PortalTextDto>(response);
    }

    public async Task<PagedResultDto<MaintenanceDto>> GetMaintenancesAsync(int page, int pageSize)
    {
        var query = BuildQuery(("page", page.ToString()), ("pageSize", pageSize.ToString()));
        var response = await _http.GetAsync($"api/Maintenance{query}");
        await ApiJson.EnsureSuccessAsync(response);
        return await ApiJson.ReadAsync<PagedResultDto<MaintenanceDto>>(response);
    }

    public async Task<MaintenanceDto> CreateMaintenanceAsync(MaintenanceUpsertDto dto)
    {
        var response = await _http.PostAsJsonAsync("api/Maintenance", dto, ApiJson.Options);
        await ApiJson.EnsureSuccessAsync(response);
        return await ApiJson.ReadAsync<MaintenanceDto>(response);
    }

    public async Task DeleteMaintenanceAsync(int id)
    {
        var response = await _http.DeleteAsync($"api/Maintenance/{id}");
        await ApiJson.EnsureSuccessAsync(response);
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
