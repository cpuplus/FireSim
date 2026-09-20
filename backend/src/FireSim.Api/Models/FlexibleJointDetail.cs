using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FireSim.Api.Models
{
    [Table("FlexibleJointDetails")]
    public class FlexibleJointDetail
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Column("JointSpecId")]
        public int JointSpecId { get; set; }

        [Column("PartId")]
        [MaxLength(50)]
        public string? PartId { get; set; }

        [Column("PiperDiameter")]
        public int PiperDiameter { get; set; }

        [Column("Length")]
        public int Length { get; set; }

        // 💡 하나의 [Column] 안에 이름과 타입을 같이 설정
        [Column("OuterDiameter", TypeName = "decimal(10,2)")]
        public decimal OuterDiameter { get; set; }

        [Column("PitchCircleDiameter", TypeName = "decimal(10,2)")]
        public decimal PitchCircleDiameter { get; set; }

        [Column("BoltHoleSpec")]
        [MaxLength(50)]
        public string BoltHoleSpec { get; set; } = string.Empty;

        [Column("FlangeThickness", TypeName = "decimal(10,2)")]
        public decimal FlangeThickness { get; set; }

        [Column("Description")]
        [MaxLength(200)]
        public string? Description { get; set; }
    }
}