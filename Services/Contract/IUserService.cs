using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Models.Common;
using Models.Request;
using Models.User.Request;

namespace Services.Contract
{
    public interface IUserService
    {
        Task<IEnumerable<UserDto>> GetAllUsersAsync();
        Task<string?> UpdateUserAsync(UserUpdateModel model);

        Task<string?> DeleteUserAsync(string userId);
    }
}
