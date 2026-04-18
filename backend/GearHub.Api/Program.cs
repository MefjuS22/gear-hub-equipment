using FluentValidation;
using FluentValidation.AspNetCore;
using GearHub.Api.Data;
using GearHub.Api.Middleware;
using GearHub.Api.Repositories;
using GearHub.Api.Responses;
using GearHub.Api.Services;
using GearHub.Api.Swagger;
using GearHub.Api.Validators;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.Converters.Add(
            new JsonStringEnumConverter(JsonNamingPolicy.CamelCase, allowIntegerValues: false));
    });
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddValidatorsFromAssemblyContaining<OrderCreateDtoValidator>();
builder.Services.Configure<ApiBehaviorOptions>(options =>
{
    options.InvalidModelStateResponseFactory = context =>
    {
        var errors = context.ModelState
            .Where(static kvp => kvp.Value is { Errors.Count: > 0 })
            .ToDictionary(
                static kvp => kvp.Key,
                static kvp => kvp.Value!.Errors
                    .Select(static e => string.IsNullOrEmpty(e.ErrorMessage) ? "Invalid value." : e.ErrorMessage)
                    .ToArray());
        var response = new ApiErrorResponse(
            ApiErrorCode.ValidationFailed,
            "One or more validation errors occurred.",
            errors);
        return new BadRequestObjectResult(response);
    };
});
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SchemaFilter<ApiErrorCodeSchemaFilter>();
});

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<IEquipmentRepository, EquipmentRepository>();
builder.Services.AddScoped<IOrderRepository, OrderRepository>();
builder.Services.AddScoped<IOrderService, OrderService>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowMobileApp", policy =>
    {
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowMobileApp");
app.UseHttpsRedirection();
app.UseMiddleware<ExceptionHandlingMiddleware>();
app.MapControllers();

using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    if (dbContext.Database.GetMigrations().Any())
    {
        dbContext.Database.Migrate();
    }
    else
    {
        dbContext.Database.EnsureCreated();
    }
}

app.Run();
