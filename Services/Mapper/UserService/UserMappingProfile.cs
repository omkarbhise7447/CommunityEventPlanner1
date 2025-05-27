using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AutoMapper;
using Data;
using Models.Common;
using Models.Request;

namespace Services.Mapper.UserService
{
    public class UserMappingProfile : Profile
    {
        public UserMappingProfile() {
            CreateMap<User, UserDto>();
            CreateMap<UserUpdateModel, User>();
        }

    }
}
