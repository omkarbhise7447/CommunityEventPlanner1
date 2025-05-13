using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Data;
using Models.Response;

namespace Services.Contract
{
    public interface ITokenGenratorService
    {
        string GenerateToken(User user);
    }
}
