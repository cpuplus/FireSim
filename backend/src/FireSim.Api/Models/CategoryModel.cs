using System.Collections.Generic;

namespace FireSim.Api.Models
{
    public class MenuItemDto
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public List<MenuItemDto>? Children { get; set; }
    }

    public class MenuCategoryDto
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public List<MenuItemDto> Items { get; set; } = new();
    }
}