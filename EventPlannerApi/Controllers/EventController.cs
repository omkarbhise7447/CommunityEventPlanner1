using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Threading.Tasks;
using Models.Request;
using Services.Contract;
using Data;

namespace EventPlannerApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class EventController : ControllerBase
    {
        private readonly IEventService _eventService;

        public EventController(IEventService eventService)
        {
            _eventService = eventService;
        }

        [HttpPost("AddEvent")]
        public async Task<IActionResult> AddEvent([FromBody] CreateEventModel model)
        {
            if (!ModelState.IsValid)
            {

                return BadRequest(ModelState);
            }

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(userId))
            {

                return Unauthorized("User not found in token.");
            }

            var createdEvent = await _eventService.CreateEventAsync(model, userId);
            return Ok(createdEvent);
        }

        [HttpGet("nofilter")]
        [AllowAnonymous]
        public async Task<IActionResult> GetAll()
        {

            return Ok(await _eventService.GetAllEventsAsync());
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int pageSize = 10, [FromQuery] string? category = null, [FromQuery] string? city = null, [FromQuery] DateOnly? startDate = null, [FromQuery] DateOnly? endDate = null, [FromQuery] string? search = null)
        {
            var filter = new EventFilterRequest
            {
                Category = category,
                City = city,
                StartDate = startDate,
                EndDate = endDate,
                Search = search
            };

            var (events, totalCount) = await _eventService.GetEventsAsync(page, pageSize, filter);
            return Ok(new { events, total = totalCount });
        }

        [HttpGet("my")]
        public async Task<IActionResult> GetMy([FromQuery] int page = 1, [FromQuery] int pageSize = 10, [FromQuery] string? category = null, [FromQuery] string? city = null, [FromQuery] DateOnly? startDate = null, [FromQuery] DateOnly? endDate = null, [FromQuery] string? search = null)
        {
            string userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var filter = new EventFilterRequest
            {
                Category = category,
                City = city,
                StartDate = startDate,
                EndDate = endDate,
                Search = search
            };

            var (events, totalCount) = await _eventService.GetMyEventsAsync(userId, page, pageSize, filter);

            return Ok(new { events, total = totalCount });
        } 

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> Get(int id)
        {

            return Ok(await _eventService.GetEventByIdAsync(id));
        }

        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateEvent(int id, [FromBody] CreateEventModel model)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var result = await _eventService.UpdateEventAsync(id, model, userId);

            return Ok(result);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var success = await _eventService.DeleteEventAsync(id, userId);
            return success ? Ok(success) : Forbid();
        }

        [HttpPost("filter")]
        public async Task<IActionResult> Filter([FromBody] EventFilterRequest filter)
        {
            var result = await _eventService.FilterEventsAsync(filter);
            return Ok(result);
        }

    }
}



























