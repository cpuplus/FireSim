using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FireSim.Api.Models
{
    [Table("Parts")]
    public class Part
    {
        [Key]
        [Column("PartId")]
        public string? PartId { get; set; }

        [Column("CategoryId")]
        public string? CategoryId { get; set; }

        [Column("GroupName")]
        public string? GroupName { get; set; }

        [Column("PartName")]
        public string? PartName { get; set; }
    }
}