using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FireSim.Api.Models
{
    [Table("Categories")]
    public class Category
    {
        [Key]
        [Column("CategoryId")]
        public string? CategoryId { get; set; }

        [Column("CategoryName")]
        public string? CategoryName { get; set; }
    }
}