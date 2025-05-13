using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Models.Response;
using Models.User.Request;

namespace Services.Contract
{
    public interface IAuthService
    {
        Task<string?> RegisterAsync(UserRegisterModel model);
        Task<string?> LoginAsync(LoginModel model);
    }

}
