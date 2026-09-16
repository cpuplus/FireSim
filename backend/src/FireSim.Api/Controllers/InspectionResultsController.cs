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
            result.CreatedAt = DateTime.UtcNow;
            _context.InspectionResults.Add(result);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetInspectionResults), new { id = result.ResultId }, result);
        }
    }
}