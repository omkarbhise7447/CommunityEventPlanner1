using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Models.Request;
using Models.User.Request;
using Services.Concrete;
using Services.Contract;

namespace EventPlannerApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly IUserService _userService;
        public UsersController(IUserService userService)
        {
            _userService = userService;
        }
        [HttpGet("/GetAllUsers")]
        public async Task<IActionResult> getAllUsers()
        {
            var users = await _userService.GetAllUsersAsync();
            return Ok(new { users });
        }

        [HttpPut("/UpdateUser")]
        public async Task<IActionResult> UpdateUser([FromBody] UserUpdateModel model)
        {
            var errorMessage = await _userService.UpdateUserAsync(model);

            if (errorMessage != null)
                return BadRequest(errorMessage);

            return Ok("User Updated successfully.");
        }

        [HttpDelete("/DeleteUser/{userId}")]
        public async Task<IActionResult> Delete(string userId)
        {
            var errorMessage = await _userService.DeleteUserAsync(userId);

            if (errorMessage != null)
                return BadRequest(errorMessage);

            return Ok("User Deleted successfully.");
        }
    }
}
