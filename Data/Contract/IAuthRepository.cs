using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;

namespace Data.Contract
{
    public interface IAuthRepository
    {
        Task<User> GetUserByEmailAsync(string email);
        Task<bool> CheckPasswordAsync(User user, string password);
        Task<IdentityResult> RegisterUserAsync(User user, string password);
        bool EmailExists(string email);
    }
}
