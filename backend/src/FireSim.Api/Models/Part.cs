using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FireSim.Api.Models
{
    [Table("Parts")]
    public class Part
    {
        [Key]
        [MaxLength(50)]
        public string PartId { get; set; } = string.Empty;

        [MaxLength(50)]
        public string CategoryId { get; set; } = string.Empty;

        [ForeignKey("CategoryId")]
        public Category? Category { get; set; }

        [MaxLength(100)]
        public string GroupName { get; set; } = string.Empty;

        [MaxLength(100)]
        public string PartName { get; set; } = string.Empty;

        [MaxLength(255)]
        public string? Description { get; set; }

        [MaxLength(1)]
        public string UseYn { get; set; } = "N";
    }
}