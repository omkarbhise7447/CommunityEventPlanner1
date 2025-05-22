using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AutoMapper;
using Data;
using Models.Response;
using Models.User.Request;
    

namespace Services.Mapper.AuthService
{
    public class AuthMappingProfile : Profile
    {
        public AuthMappingProfile() 
        {
            CreateMap<UserRegisterModel, User>();
            CreateMap<User, LoginResponseModel>();
        }
    }
}
