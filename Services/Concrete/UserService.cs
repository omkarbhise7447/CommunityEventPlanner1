using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AutoMapper;
using Data;
using Data.Contract;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using Models.Common;
using Models.Request;
using Models.User.Request;
using Services.Contract;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;

namespace Services.Concrete
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepository;
        private readonly IMapper _mapper;

        public UserService(IUserRepository userRepository, IMapper mapper)
        {
            _userRepository = userRepository;
            _mapper = mapper;
        }

        public async Task<string?> DeleteUserAsync(string userId)
        {
            User user = await _userRepository.FindByIdAsync(userId);

            if (user == null)
            {
                return string.Join("user Not Found with this id: ", userId);
            }
            var result = await _userRepository.deleteUserAsync(user);


            if (!result.Succeeded)
            {

                return string.Join(", ", result.Errors.Select(e => e.Description));
            }

            return null;
        }

        public async Task<IEnumerable<UserDto>> GetAllUsersAsync()
        {
            var users = await _userRepository.GetAllUsers();

            return _mapper.Map<IEnumerable<UserDto>>(users);
        }

        public async Task<string?> UpdateUserAsync(UserUpdateModel model)
        {
            User user = await _userRepository.FindByIdAsync(model.UserId);

            if (user == null)
            {
                return string.Join("user Not Found with this id: ", model.UserId);
            }

            user.UserName = model.Username;
            user.Email = model.Email;


            //var user = _mapper.Map<User>(model);
            var result = await _userRepository.UpdateUserAsync(user);


            if (!result.Succeeded)
            {

                return string.Join(", ", result.Errors.Select(e => e.Description));
            }

            return null;
        }

            
    }
}
