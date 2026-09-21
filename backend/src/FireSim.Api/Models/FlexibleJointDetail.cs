using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FireSim.Api.Models
{
    [Table("FlexibleJointDetails")]
    public class FlexibleJointDetail
    {
        [Key]
        [MaxLength(50)]
        public string PartId { get; set; } = string.Empty; 

        [ForeignKey("PartId")]
        public Part? Part { get; set; }

        public int PiperDiameter { get; set; }

        public int Length { get; set; }

        [Column(TypeName = "decimal(10,2)")]
        public decimal OuterDiameter { get; set; }

        [Column(TypeName = "decimal(10,2)")]
        public decimal PitchCircleDiameter { get; set; }

        [MaxLength(50)]
        public string BoltHoleSpec { get; set; } = string.Empty;

        [Column(TypeName = "decimal(10,2)")]
        public decimal FlangeThickness { get; set; }

        [MaxLength(255)]
        public string? Description { get; set; }
    }
}