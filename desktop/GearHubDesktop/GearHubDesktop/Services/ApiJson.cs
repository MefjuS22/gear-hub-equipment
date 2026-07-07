using System.Net.Http;
using System.Text.Json;
using System.Text.Json.Serialization;
using GearHubDesktop.Responses;

namespace GearHubDesktop.Services;

internal static class ApiJson
{
    public static readonly JsonSerializerOptions Options = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        PropertyNameCaseInsensitive = true,
        Converters = { new JsonStringEnumConverter(JsonNamingPolicy.CamelCase) },
    };

    public static async Task<T> ReadAsync<T>(HttpResponseMessage response)
    {
        await using var stream = await response.Content.ReadAsStreamAsync();
        var result = await JsonSerializer.DeserializeAsync<T>(stream, Options);
        return result ?? throw new InvalidOperationException("Empty API response.");
    }

    public static async Task EnsureSuccessAsync(HttpResponseMessage response)
    {
        if (response.IsSuccessStatusCode)
        {
            return;
        }

        ApiErrorResponse? error = null;
        try
        {
            error = await ReadAsync<ApiErrorResponse>(response);
        }
        catch
        {
            // ignored
        }

        throw new InvalidOperationException(error?.Message ?? $"Request failed ({(int)response.StatusCode}).");
    }
}
