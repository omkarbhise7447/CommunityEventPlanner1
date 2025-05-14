using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Models.Common;
using Models.Response;

namespace Services.Contract
{
    public interface IRSVPService
    {
        Task<RSVPResponseModel> RSVPAsync(int eventId, string userId);
        Task<bool> CancelRSVPAsync(int eventId, string userId);
        Task<IEnumerable<AttendeeDto>> GetAttendeesAsync(int eventId);
        Task<IEnumerable<RSVPResponseModel>> GetMyRSVPsAsync(string userId);
        Task<IEnumerable<RSVPResponseModel>> GetMyUpcomingEventsAsync(string userId);
    }
}
