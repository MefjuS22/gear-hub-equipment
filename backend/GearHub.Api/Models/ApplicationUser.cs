using Microsoft.AspNetCore.Identity;

namespace GearHub.Api.Models;

public class ApplicationUser : IdentityUser<int>
{
    public string DisplayName { get; set; } = string.Empty;

    public ICollection<RentalOrder> RentalOrders { get; set; } = new List<RentalOrder>();
}
