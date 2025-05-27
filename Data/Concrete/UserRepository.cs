using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Data.Contract;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Data.Concrete
{
    public class UserRepository : IUserRepository
    {
        private readonly ApplicationDbContext _dbcontext;
        private readonly UserManager<User> _userManager;


        public UserRepository(ApplicationDbContext dbcontext, UserManager<User> userManager)
        {
            _dbcontext = dbcontext;
            _userManager = userManager;
        }

        public async Task<IdentityResult> deleteUserAsync(User user)
        {
            _dbcontext.RSVPs.RemoveRange(user.RSVPs);
            await _dbcontext.SaveChangesAsync();


            return await _userManager.DeleteAsync(user);
        }

        public async Task<User> FindByIdAsync(string userId)
        {
            return await _userManager.Users.Include(u => u.RSVPs).FirstOrDefaultAsync(u => u.Id == userId);
        }

        public async Task<IEnumerable<User>> GetAllUsers()
        {
            return await _dbcontext.Users.ToListAsync();
        }

        public async Task<IdentityResult> UpdateUserAsync(User user)
        {
           return await _userManager.UpdateAsync(user);
        }
    }
}
