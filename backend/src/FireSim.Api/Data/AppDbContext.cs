using Microsoft.EntityFrameworkCore;

namespace FireSim.Api.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<EquipmentType> EquipmentTypes { get; set; }
        public DbSet<InspectionResult> InspectionResults { get; set; }
    }

    public class User
    {
        public int UserId { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public string Role { get; set; } = "Student";
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    public class EquipmentType
    {
        public int EquipmentTypeId { get; set; }
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
    }

    public class InspectionResult
    {
        public int ResultId { get; set; }
        public int UserId { get; set; }
        public int EquipmentTypeId { get; set; }
        public int Score { get; set; }
        public bool IsPassed { get; set; }
        public int? CompletionTimeSeconds { get; set; }
        public string? DetailsJson { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
