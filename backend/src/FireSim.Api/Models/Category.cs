using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FireSim.Api.Models
{
    [Table("Categories")]
    public class Category
    {
        [Key]                          // 1. DB의 PK(기본 키)로 지정
        [MaxLength(50)]                // 3. 문자열 최대 길이를 50자로 제한 (varchar(50) 지정)
        public string CategoryId { get; set; } = string.Empty; // 4. C# null 방지 기본값 설정

        [MaxLength(100)]
        public string CategoryName { get; set; } = string.Empty;
    }
}