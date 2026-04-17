using System.Text.Json.Serialization;

namespace GearHub.Api.Models;

public class Category
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;

    [JsonIgnore]
    public ICollection<Equipment> EquipmentItems { get; set; } = new List<Equipment>();
}
