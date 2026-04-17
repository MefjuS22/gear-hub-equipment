using GearHub.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace GearHub.Api.Data;

public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : DbContext(options)
{
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<User> Users => Set<User>();
    public DbSet<Warehouse> Warehouses => Set<Warehouse>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Brand> Brands => Set<Brand>();
    public DbSet<Equipment> Equipment => Set<Equipment>();
    public DbSet<Maintenance> Maintenances => Set<Maintenance>();
    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<RentalOrder> RentalOrders => Set<RentalOrder>();
    public DbSet<RentalOrderItem> RentalOrderItems => Set<RentalOrderItem>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<RentalOrderItem>()
            .HasKey(item => new { item.RentalOrderId, item.EquipmentId });

        modelBuilder.Entity<Role>().HasData(
            new Role { Id = 1, Name = "Admin" },
            new Role { Id = 2, Name = "Operator" }
        );

        modelBuilder.Entity<User>().HasData(
            new User { Id = 1, Name = "Alice Carter", Email = "alice.carter@gearhub.com", RoleId = 1 }
        );

        modelBuilder.Entity<Warehouse>().HasData(
            new Warehouse { Id = 1, Name = "Main Warehouse", Location = "Warsaw, Poland" }
        );

        modelBuilder.Entity<Category>().HasData(
            new Category { Id = 1, Name = "Lifting", Description = "Lifts, cranes, and height access equipment." },
            new Category { Id = 2, Name = "Power Tools", Description = "Portable and industrial power tools." }
        );

        modelBuilder.Entity<Brand>().HasData(
            new Brand { Id = 1, Name = "LiftMaster" },
            new Brand { Id = 2, Name = "PowerPro" }
        );

        modelBuilder.Entity<Customer>().HasData(
            new Customer { Id = 1, CompanyName = "Atlas Construction Ltd.", ContactPerson = "John Smith" }
        );

        modelBuilder.Entity<Equipment>().HasData(
            new Equipment
            {
                Id = 1,
                Name = "Hydraulic Lift HLT-500",
                CategoryId = 1,
                BrandId = 1,
                WarehouseId = 1,
                DailyRate = 180m,
                IsAvailable = true
            },
            new Equipment
            {
                Id = 2,
                Name = "Telescopic Boom Lift TBL-220",
                CategoryId = 1,
                BrandId = 1,
                WarehouseId = 1,
                DailyRate = 210m,
                IsAvailable = true
            },
            new Equipment
            {
                Id = 3,
                Name = "Heavy Duty Drill HDD-90",
                CategoryId = 2,
                BrandId = 2,
                WarehouseId = 1,
                DailyRate = 60m,
                IsAvailable = true
            }
        );
    }
}
