using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Models.User.Request;
using Services.Contract;

namespace EventPlannerApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] UserRegisterModel model)
        {
            var errorMessage = await _authService.RegisterAsync(model);

            if (errorMessage != null)
                return BadRequest(errorMessage);

            return Ok("User registered successfully.");
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginModel model)
        {
            var token = await _authService.LoginAsync(model);
            HttpContext.Session.SetString("token", token);
            if (token == null)
                return Unauthorized("Invalid email or password");

            return Ok(new {token});
        }
    }
}
