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
    [Route("api/part-menu")]
    [ApiController]
    public class PartMenuController : ControllerBase
    {
        private readonly AppDbContext _context;

        public PartMenuController(AppDbContext context)
        {
            _context = context;
        }

        // 사이드바 메뉴 트리 구조 조회 API (GET /api/part-menu/categories)
        [HttpGet("categories")]
        public async Task<ActionResult<IEnumerable<MenuCategoryDto>>> GetMenuCategories()
        {
            try
            {
                var categoriesDb = await _context.Categories
                    .OrderBy(c => c.CategoryName)
                    .ToListAsync() ?? new List<Category>();

                var rawParts = await _context.Parts.ToListAsync() ?? new List<Part>();

                var categories = categoriesDb.Select(c => new MenuCategoryDto
                {
                    Id = c.CategoryId ?? string.Empty,
                    Name = c.CategoryName ?? string.Empty,
                    Items = BuildCategoryItems(rawParts.Where(p => p.CategoryId == c.CategoryId).ToList(), c.CategoryName ?? string.Empty)
                }).ToList();

                return Ok(categories);
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, new
                {
                    message = "메뉴 데이터를 불러오는 중 오류가 발생했습니다.",
                    error = ex.Message,
                    innerError = ex.InnerException?.Message
                });
            }
        }

        // 헬퍼 메서드: 중복 그룹 껍데기 방지 및 정렬 로직
        private List<MenuItemDto> BuildCategoryItems(List<Part> parts, string categoryName)
        {
            var resultItems = new List<MenuItemDto>();

            var standaloneParts = parts.Where(p => string.IsNullOrEmpty(p.GroupName))
                                       .OrderBy(p => p.PartName)
                                       .ToList();

            foreach (var part in standaloneParts)
            {
                resultItems.Add(new MenuItemDto
                {
                    Id = part.PartId ?? string.Empty,
                    Name = part.PartName ?? string.Empty,
                    Children = new List<MenuItemDto>()
                });
            }

            var groupedParts = parts.Where(p => !string.IsNullOrEmpty(p.GroupName))
                                     .GroupBy(p => p.GroupName)
                                     .ToList();

            foreach (var group in groupedParts)
            {
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
                    Name = child.PartName ?? string.Empty,
                    Children = new List<MenuItemDto>()
                }).ToList();

                if (group.Key == categoryName)
                {
                    resultItems.AddRange(sortedChildren);
                }
                else if (sortedChildren.Count == 1)
                {
                    resultItems.Add(sortedChildren.First());
                }
                else
                {
                    resultItems.Add(new MenuItemDto
                    {
                        Id = $"group-{group.Key}",
                        Name = group.Key ?? string.Empty,
                        Children = sortedChildren
                    });
                }
            }

            return resultItems.OrderBy(item => item.Name).ToList();
        }
    }
}