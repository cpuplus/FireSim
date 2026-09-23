using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace FireSim.Api.Models
{
    [Table("SliponFlangeDetails")]
    public class SliponFlangeDetail
    {
        [Key]
        [MaxLength(50)]
        public string PartId { get; set; } = string.Empty;

        //[ForeignKey("PartId")]
        //[JsonIgnore]
        //public Part? Part { get; set; }

        [MaxLength(10)]
        public string NominalBore { get; set; } = string.Empty; // 호칭경 (40A, 50A 등)

        [Column(TypeName = "decimal(10,2)")]
        public decimal InnerDiameter { get; set; } // 플랜지 내경

        [Column(TypeName = "decimal(10,2)")]
        public decimal OuterDiameter { get; set; } // 플랜지 외경 D

        [Column(TypeName = "decimal(10,2)")]
        public decimal Thickness { get; set; } // 두께 t

        [Column(TypeName = "decimal(10,2)")]
        public decimal PitchCircleDiameter { get; set; } // 볼트 원 지름 c

        public int NumberOfHoles { get; set; } // 볼트 구멍 개수

        [Column(TypeName = "decimal(10,2)")]
        public decimal HoleDiameter { get; set; } // 볼트 구멍 지름 h

        [MaxLength(20)]
        public string NominalBoltSize { get; set; } = string.Empty; // 볼트 호칭 치수 (M16 등)
    }
}