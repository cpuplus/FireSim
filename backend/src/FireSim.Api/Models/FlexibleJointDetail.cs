// backend\src\FireSim.Api\Models\FlexibleJointDetail.cs

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace FireSim.Api.Models
{
    [Table("FlexibleJointDetails")]
    public class FlexibleJointDetail
    {
        [Key]
        [MaxLength(50)]
        public string PartId { get; set; } = string.Empty;

        //[ForeignKey("PartId")]
        //public Part? Part { get; set; }

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
    }
}