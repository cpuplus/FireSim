using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FireSim.Api.Models
{
    [Table("CrossDetails")]
    public class CrossDetail
    {
        [Key]
        [MaxLength(50)]
        public string PartId { get; set; } = string.Empty;
        
        //[ForeignKey("PartId")]
        //public Part? Part { get; set; }

        public string NominalSizeMain { get; set; }= string.Empty;

        public string NominalSizeCross { get; set; }= string.Empty;

        [Column(TypeName = "decimal(10,2)")]
        public decimal OuterDiameterMain { get; set; }

        [Column(TypeName = "decimal(10,2)")]
        public decimal OuterDiameterCross { get; set; }
        
        [Column(TypeName = "decimal(10,2)")]
        public decimal Thickness { get; set; }
    }
}