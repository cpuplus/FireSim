using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FireSim.Api.Models
{
    [Table("PipeDetails")] // DB의 실제 테이블 이름 매핑
    public class PipeDetail
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int PipeSpecId { get; set; }

        [Required]
        [MaxLength(50)]
        public string PartId { get; set; } = string.Empty;

        [Column(TypeName = "decimal(5,2)")]
        public decimal OuterDiameter { get; set; }

        [Column(TypeName = "decimal(5,2)")]
        public decimal Thickness { get; set; }

        [MaxLength(255)]
        public string? Description { get; set; } // NULL 허용 필드
    }
}