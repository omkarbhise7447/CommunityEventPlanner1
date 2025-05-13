using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AutoMapper;
using Data;
using Data.Contract;
using Microsoft.Extensions.Configuration;
using Models.Response;
using Models.User.Request;
using Services.Contract;

namespace Services.Concrete
{
    public class AuthService : IAuthService
    {
        private readonly IAuthRepository _authRepository;
        private readonly IMapper _mapper;
        private readonly ITokenGenratorService _tokenGenratorService;
        public AuthService(IAuthRepository authRepository, IMapper mapper, ITokenGenratorService tokenGenratorService)
        {
            _authRepository = authRepository;
        
            _mapper = mapper;
            _tokenGenratorService = tokenGenratorService;
        }

        public async Task<string?> RegisterAsync(UserRegisterModel registerModel)
        {
            if (_authRepository.EmailExists(registerModel.Email))
                return "Email is already registered.";

            var user = _mapper.Map<User>(registerModel);

            var result = await _authRepository.RegisterUserAsync(user, registerModel.Password);

            if (!result.Succeeded)
                return string.Join(", ", result.Errors.Select(e => e.Description));

            return null; // success
        }

        public async Task<string?> LoginAsync(LoginModel model)
        {
            var user = await _authRepository.GetUserByEmailAsync(model.Email);

            if (user == null || !await _authRepository.CheckPasswordAsync(user, model.Password))
                return null;

            return _tokenGenratorService.GenerateToken(user);
        }

    }
}
