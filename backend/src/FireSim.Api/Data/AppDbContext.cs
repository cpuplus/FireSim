using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using FireSim.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace FireSim.Api.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<EquipmentType> EquipmentTypes { get; set; }
        public DbSet<InspectionResult> InspectionResults { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Part> Parts { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<User>().ToTable("Users");
            modelBuilder.Entity<EquipmentType>().ToTable("EquipmentTypes");
            modelBuilder.Entity<InspectionResult>().ToTable("InspectionResults");

            modelBuilder.Entity<EquipmentType>().HasData(
                new EquipmentType { EquipmentTypeId = 1, Code = "PUMP_PERF", Name = "펌프성능검사", Description = "주펌프 및 충압펌프의 체절운전, 정격운전, 과부하운전 성능 검사 모듈", ModelPath = "/models/water_pump.glb" },
                new EquipmentType { EquipmentTypeId = 2, Code = "WATER_SYS", Name = "수계소화설비", Description = "옥내/옥외소화전 및 스프링클러 설비 작동 실습 모듈", ModelPath = "/models/valve_ii.glb" },
                new EquipmentType { EquipmentTypeId = 3, Code = "GAS_SYS", Name = "가스소화설비", Description = "이산화탄소/하론/할로게화합물 소화설비 제어반 및 밸브 실습 모듈", ModelPath = "" }
            );
        }
    }

    public class EquipmentType
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int EquipmentTypeId { get; set; }
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? ModelPath { get; set; }
    }

    public class User
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int UserId { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public string Role { get; set; } = "Student";
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    public class InspectionResult
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
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