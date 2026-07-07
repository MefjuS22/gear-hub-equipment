using System.Collections.ObjectModel;
using System.Text.Json;
using GearHubDesktop.DTOs;

namespace GearHubDesktop.Services;

public sealed class CartLine
{
    public int EquipmentId { get; init; }
    public string Name { get; init; } = string.Empty;
    public decimal DailyRate { get; init; }
    public int Quantity { get; set; } = 1;
}

public interface ICartService
{
    ObservableCollection<CartLine> Lines { get; }
    int ItemCount { get; }
    event EventHandler? Changed;
    void Add(EquipmentDto equipment);
    void Remove(int equipmentId);
    void SetQuantity(int equipmentId, int quantity);
    void Clear();
    Task LoadAsync();
    Task SaveAsync();
}

public sealed class CartService : ICartService
{
    private static readonly string StoragePath = Path.Combine(
        Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
        "GearHub",
        "cart.json");

    public ObservableCollection<CartLine> Lines { get; } = [];

    public int ItemCount => Lines.Sum(line => line.Quantity);

    public event EventHandler? Changed;

    public void Add(EquipmentDto equipment)
    {
        var existing = Lines.FirstOrDefault(line => line.EquipmentId == equipment.Id);
        if (existing is not null)
        {
            existing.Quantity++;
        }
        else
        {
            Lines.Add(new CartLine
            {
                EquipmentId = equipment.Id,
                Name = equipment.Name,
                DailyRate = equipment.DailyRate,
                Quantity = 1,
            });
        }

        Changed?.Invoke(this, EventArgs.Empty);
    }

    public void Remove(int equipmentId)
    {
        var line = Lines.FirstOrDefault(item => item.EquipmentId == equipmentId);
        if (line is null)
        {
            return;
        }

        Lines.Remove(line);
        Changed?.Invoke(this, EventArgs.Empty);
    }

    public void SetQuantity(int equipmentId, int quantity)
    {
        var line = Lines.FirstOrDefault(item => item.EquipmentId == equipmentId);
        if (line is null)
        {
            return;
        }

        line.Quantity = Math.Max(1, quantity);
        Changed?.Invoke(this, EventArgs.Empty);
    }

    public void Clear()
    {
        Lines.Clear();
        Changed?.Invoke(this, EventArgs.Empty);
    }

    public async Task LoadAsync()
    {
        if (!File.Exists(StoragePath))
        {
            return;
        }

        var json = await File.ReadAllTextAsync(StoragePath);
        var lines = JsonSerializer.Deserialize<List<CartLine>>(json, ApiJson.Options) ?? [];
        Lines.Clear();
        foreach (var line in lines)
        {
            Lines.Add(line);
        }
    }

    public async Task SaveAsync()
    {
        var directory = Path.GetDirectoryName(StoragePath)!;
        Directory.CreateDirectory(directory);
        var json = JsonSerializer.Serialize(Lines.ToList(), ApiJson.Options);
        await File.WriteAllTextAsync(StoragePath, json);
    }
}
