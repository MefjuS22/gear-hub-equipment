using GearHub.Api.Responses;
using Microsoft.OpenApi.Any;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;
using System.Text.Json;

namespace GearHub.Api.Swagger;

public sealed class ApiErrorCodeSchemaFilter : ISchemaFilter
{
    public void Apply(OpenApiSchema schema, SchemaFilterContext context)
    {
        if (context.Type != typeof(ApiErrorCode))
        {
            return;
        }

        schema.Type = "string";
        schema.Format = null;
        schema.Enum = Enum.GetNames<ApiErrorCode>()
            .Select(static name => (IOpenApiAny)new OpenApiString(JsonNamingPolicy.CamelCase.ConvertName(name)))
            .ToList();
    }
}
