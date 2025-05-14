using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Threading.Tasks;
using Models.Request;
using Services.Contract;

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
                return BadRequest(ModelState);

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized("User not found in token.");

            var createdEvent = await _eventService.CreateEventAsync(model, userId);
            return Ok(createdEvent);
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAll()
        {

            return Ok(await _eventService.GetAllEventsAsync());
        }

        [HttpGet("my")]
        public async Task<IActionResult> GetMy()
        {

            return Ok(await _eventService.GetMyEventsAsync(User.FindFirstValue(ClaimTypes.NameIdentifier)));
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
            return success ? NoContent() : Forbid();
        }

        [HttpPost("filter")]
        public async Task<IActionResult> Filter([FromBody] EventFilterRequest filter)
        {
            var result = await _eventService.FilterEventsAsync(filter);
            return Ok(result);
        }

    }
}


















































//using Microsoft.AspNetCore.Authorization;
//using System.Security.Claims;
//using Microsoft.AspNetCore.Http;
//using Microsoft.AspNetCore.Mvc;
//using Models.Request;
//using Services.Contract;
//using System.IdentityModel.Tokens.Jwt;

//namespace EventPlannerApi.Controllers
//{
//    [Route("api/[controller]")]
//    [ApiController]
//    [Authorize]
//    public class EventController : ControllerBase
//    {
//        private readonly IEventService _eventService;

//        public EventController(IEventService eventService)
//        {
//            _eventService = eventService;
//        }

//        [HttpPost("AddEvent")]
//        //[AllowAnonymous]
//        public async Task<IActionResult> AddEvent([FromBody] CreateEventModel model)
//        {
//            //var temptoken = HttpContext.Session.GetString("token");
//            //if (string.IsNullOrEmpty(temptoken))
//            //    return Unauthorized("Token not found in session");

//            //var handler = new JwtSecurityTokenHandler();
//            //var jwtToken = handler.ReadJwtToken(temptoken);

//            if (!ModelState.IsValid)
//                return BadRequest(ModelState);

//            // Get user ID from JWT claims
//            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
//            if (userId == null)
//            {
//                return Unauthorized("User found in token");
//            }


//                var token = await _eventService.CreateEventAsync(model, userId);
//            return Ok(new { token });
//        }
//    }
//}
