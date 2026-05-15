using GearHub.Api.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace GearHub.Api.Data;

public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
    : IdentityDbContext<ApplicationUser, IdentityRole<int>, int>(options)
{
    public DbSet<Permission> Permissions => Set<Permission>();
    public DbSet<RolePermission> RolePermissions => Set<RolePermission>();
    public DbSet<Warehouse> Warehouses => Set<Warehouse>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Brand> Brands => Set<Brand>();
    public DbSet<Equipment> Equipment => Set<Equipment>();
    public DbSet<Maintenance> Maintenances => Set<Maintenance>();
    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<RentalOrder> RentalOrders => Set<RentalOrder>();
    public DbSet<RentalOrderItem> RentalOrderItems => Set<RentalOrderItem>();
    public DbSet<CmsPost> CmsPosts => Set<CmsPost>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<RentalOrderItem>()
            .HasKey(item => new { item.RentalOrderId, item.EquipmentId });

        modelBuilder.Entity<RentalOrder>()
            .HasOne(order => order.User)
            .WithMany(user => user.RentalOrders)
            .HasForeignKey(order => order.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<RolePermission>(entity =>
        {
            entity.HasKey(rp => new { rp.RoleId, rp.PermissionId });
            entity.HasOne(rp => rp.Role)
                .WithMany()
                .HasForeignKey(rp => rp.RoleId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(rp => rp.Permission)
                .WithMany(permission => permission.RolePermissions)
                .HasForeignKey(rp => rp.PermissionId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Permission>(entity =>
        {
            entity.HasIndex(permission => permission.Name).IsUnique();
        });

        modelBuilder.Entity<CmsPost>(entity =>
        {
            entity.HasIndex(post => post.Slug).IsUnique();
            entity.Property(post => post.Id).HasDefaultValueSql("gen_random_uuid()");
            entity.Property(post => post.CoverImageUrl).HasMaxLength(2000);
        });

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

        modelBuilder.Entity<Equipment>(entity =>
        {
            entity.Property(e => e.ImageUrl).HasMaxLength(2000);
            entity.HasData(
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
            });
        });
    }
}
