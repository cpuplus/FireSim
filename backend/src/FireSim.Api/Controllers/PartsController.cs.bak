using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FireSim.Api.Data;
using FireSim.Api.Models;
using System.Text.RegularExpressions;

namespace FireSim.Api.Controllers
{
    [Route("api/parts")]
    [ApiController]
    public class PartsController : ControllerBase
    {
        private readonly AppDbContext _context;

        // 생성자 단일 주입
        public PartsController(AppDbContext context)
        {
            _context = context;
        }

        // 고유 라우트 지정 (DB 데이터를 동적으로 조회하여 반환)
        [HttpGet("categories")]
        public async Task<ActionResult<IEnumerable<MenuCategoryDto>>> GetMenuCategories()
        {
            try
            {
                // 1. 실제 DB의 Categories 테이블 조회 (CategoryId, CategoryName)
                var categoriesDb = await _context.Categories
                .OrderBy(c => c.CategoryName) // 가나다순(오름차순) 정렬
                .ToListAsync() ?? new List<Category>();

                // 2. 전체 부품 데이터를 안전하게 가져옵니다.
                var rawParts = await _context.Parts.ToListAsync() ?? new List<Part>();

                // 3. DB 데이터를 프론트엔드가 요구하는 DTO 형태로 매핑 (카테고리 이름을 헬퍼에 함께 전달)
                var categories = categoriesDb.Select(c => new MenuCategoryDto
                {
                    Id = c.CategoryId ?? string.Empty,    // DB 컬럼명에 맞춤
                    Name = c.CategoryName ?? string.Empty, // DB 컬럼명에 맞춤
                    Items = BuildCategoryItems(rawParts.Where(p => p.CategoryId == c.CategoryId).ToList(), c.CategoryName ?? string.Empty)
                }).ToList();

                return Ok(categories);
            }
            catch (System.Exception ex)
            {
                // 500 에러 발생 시 구체적인 원인(InnerException 포함)을 함께 반환하여 디버깅 용이하게 처리
                return StatusCode(500, new
                {
                    message = "DB 데이터를 불러오는 중 오류가 발생했습니다.",
                    error = ex.Message,
                    innerError = ex.InnerException?.Message
                });
            }
        }

        // 💡 헬퍼 메서드: CategoryName과 GroupName을 비교하여 중복 그룹 껍데기를 방지하는 로직
        private List<MenuItemDto> BuildCategoryItems(List<Part> parts, string categoryName)
        {
            var resultItems = new List<MenuItemDto>();

            // A. GroupName이 없는 독립형 부품들 (예: 엘보, 티, 크로스 등)
            var standaloneParts = parts.Where(p => string.IsNullOrEmpty(p.GroupName))
                                       .OrderBy(p => p.PartName)
                                       .ToList();

            foreach (var part in standaloneParts)
            {
                resultItems.Add(new MenuItemDto
                {
                    Id = part.PartId ?? string.Empty,
                    Name = part.PartName ?? string.Empty,
                    Children = new List<MenuItemDto>() // 하위 메뉴 없음
                });
            }

            // B. GroupName이 있는 그룹형 부품들
            var groupedParts = parts.Where(p => !string.IsNullOrEmpty(p.GroupName))
                                     .GroupBy(p => p.GroupName)
                                     .ToList();

            foreach (var group in groupedParts)
            {
                // 자식 규격들 정렬 (숫자 크기순 오름차순 정렬 적용)
                var sortedChildren = group.OrderBy(child =>
                {
                    var name = child.PartName ?? string.Empty;
                    var match = Regex.Match(name, @"\d+");
                    return match.Success ? int.Parse(match.Value) : int.MaxValue;
                })
                .ThenBy(child => child.PartName)
                .Select(child => new MenuItemDto
                {
                    Id = child.PartId ?? string.Empty,
                    Name = child.PartName ?? string.Empty
                }).ToList();

                // 💡 핵심 수정: 그룹 이름(group.Key)이 대분류 카테고리 이름(categoryName)과 같다면
                // 의미 없는 중복 상위 그룹 껍데기를 만들지 않고, 그 자식 항목들을 바로 최상위 목록으로 풀어버립니다.
                if (group.Key == categoryName)
                {
                    foreach (var child in sortedChildren)
                    {
                        resultItems.Add(new MenuItemDto
                        {
                            Id = child.Id,
                            Name = child.Name,
                            Children = new List<MenuItemDto>()
                        });
                    }
                }
                // C. 하위 메뉴가 1개뿐인 경우: 단독 메뉴로 처리
                else if (sortedChildren.Count == 1)
                {
                    var singleChild = sortedChildren.First();
                    resultItems.Add(new MenuItemDto
                    {
                        Id = singleChild.Id,
                        Name = singleChild.Name,
                        Children = new List<MenuItemDto>()
                    });
                }
                else
                {
                    // D. 일반적인 그룹 구조 (예: 파이프 -> 100A, 125A 등)
                    resultItems.Add(new MenuItemDto
                    {
                        Id = $"group-{group.Key}",
                        Name = group.Key ?? string.Empty,
                        Children = sortedChildren
                    });
                }
            }

            // 전체 아이템 목록 최종 정렬 (이름 기준)
            return resultItems.OrderBy(item => item.Name).ToList();
        }
    }
}