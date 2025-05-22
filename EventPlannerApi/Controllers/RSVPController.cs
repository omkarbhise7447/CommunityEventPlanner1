using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Services.Contract;

namespace EventPlannerApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class RSVPController : ControllerBase
    {
        private readonly IRSVPService _rsvpService;

        public RSVPController(IRSVPService rsvpService)
        {
            _rsvpService = rsvpService;
        }

        [HttpPost("{eventId}")]
        public async Task<IActionResult> RSVP(int eventId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var result = await _rsvpService.RSVPAsync(eventId, userId);

            return Ok(new { result });
        }

        [HttpDelete("{eventId}")]
        public async Task<IActionResult> CancelRSVP(int eventId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var success = await _rsvpService.CancelRSVPAsync(eventId, userId);

            return success ? Ok(new { Success = true, Message = "RSVP canceled" })
                : NotFound(new { Success = false, Message = "RSVP not found" }); ;
        }

        [HttpGet("event/{eventId}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetAttendees(int eventId)
        {
            var result = await _rsvpService.GetAttendeesAsync(eventId);

            return Ok(new { result});
        }

        [HttpGet("my")]
        public async Task<IActionResult> GetMyRSVPs()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var result = await _rsvpService.GetMyRSVPsAsync(userId);
            return Ok(new { result });
        }

        //[HttpGet("my-upcoming-events")]
        //public async Task<IActionResult> GetMyUpcomingEvents()
        //{
        //    var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        //    var result = await _rsvpService.GetMyUpcomingEventsAsync(userId);
        //    return Ok(new { result });
        //}

        [HttpGet("my-upcoming-events")]
        public async Task<IActionResult> GetMyUpcomingEvents([FromQuery] string? date = null)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            DateOnly? filterDate = null;
            if (!string.IsNullOrEmpty(date) && DateOnly.TryParse(date, out var parsedDate))
            {
                filterDate = parsedDate;
            }
            var result = await _rsvpService.GetMyUpcomingEventsAsync(userId, filterDate);
            return Ok(new { result });
        }
    }
}
