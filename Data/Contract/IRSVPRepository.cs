using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Data.Contract
{
    public interface IRSVPRepository
    {
        Task<RSVP> CreateRSVPAsync(RSVP rsvp);
        Task<bool> CancelRSVPAsync(int eventId, string userId);
        Task<bool> HasRSVPedAsync(int eventId, string userId);
        Task<IEnumerable<RSVP>> GetRSVPsByEventIdAsync(int eventId);
        Task<IEnumerable<RSVP>> GetMyRSVPsAsync(string userId);


    }
}
