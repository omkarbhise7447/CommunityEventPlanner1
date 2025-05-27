using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;

namespace Data.Contract
{
    public interface IUserRepository
    {
       Task<IEnumerable<User>> GetAllUsers();

       Task<IdentityResult> UpdateUserAsync(User user);

        Task<User> FindByIdAsync(string userId);

        Task<IdentityResult> deleteUserAsync(User user);
    }
}
