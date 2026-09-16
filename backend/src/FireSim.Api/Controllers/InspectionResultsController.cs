using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FireSim.Api.Data;

namespace FireSim.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class InspectionResultsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public InspectionResultsController(AppDbContext context)
        {
            _context = context;
        }

        // 1. 전체 검사 결과 목록 조회 (GET: api/InspectionResults)
        [HttpGet]
        public async Task<ActionResult<IEnumerable<InspectionResult>>> GetInspectionResults()
        {
            return await _context.InspectionResults
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();
        }

        // 2. 새로운 검사 결과 저장 (POST: api/InspectionResults)
        [HttpPost]
        public async Task<ActionResult<InspectionResult>> PostInspectionResult(InspectionResult result)
        {
            if (result.CreatedAt == default)
            {
                result.CreatedAt = DateTime.UtcNow;
            }

            _context.InspectionResults.Add(result);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetInspectionResults), new { id = result.ResultId }, result);
        }

        // 3. 설비별/상태별 필터 조회 (GET: api/InspectionResults/filter?equipmentTypeId=1&isPassed=true)
        [HttpGet("filter")]
        public async Task<ActionResult<IEnumerable<InspectionResult>>> GetFilteredResults([FromQuery] int? equipmentTypeId, [FromQuery] bool? isPassed)
        {
            var query = _context.InspectionResults.AsQueryable();

            if (equipmentTypeId.HasValue)
            {
                query = query.Where(r => r.EquipmentTypeId == equipmentTypeId.Value);
            }

            if (isPassed.HasValue)
            {
                query = query.Where(r => r.IsPassed == isPassed.Value);
            }

            var results = await query.OrderByDescending(r => r.CreatedAt).ToListAsync();
            return Ok(results);
        }

        // 4. 전체 통계 정보 조회 (GET: api/InspectionResults/stats)
        [HttpGet("stats")]
        public async Task<ActionResult> GetInspectionStats()
        {
            var totalCount = await _context.InspectionResults.CountAsync();
            var passedCount = await _context.InspectionResults.CountAsync(r => r.IsPassed);
            var avgScore = totalCount > 0 ? await _context.InspectionResults.AverageAsync(r => (double?)r.Score) ?? 0 : 0;

            var stats = new
            {
                TotalInspections = totalCount,
                PassedInspections = passedCount,
                FailedInspections = totalCount - passedCount,
                AverageScore = Math.Round(avgScore, 2),
                PassRate = totalCount > 0 ? Math.Round((double)passedCount / totalCount * 100, 1) : 0
            };

            return Ok(stats);
        }
    }
}