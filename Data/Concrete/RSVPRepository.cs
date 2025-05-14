using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Data.Contract;
using Microsoft.EntityFrameworkCore;

namespace Data.Concrete
{
    public class RSVPRepository : IRSVPRepository
    {
        private readonly ApplicationDbContext _dbontext;

        public RSVPRepository(ApplicationDbContext dbcontext)
        {
            _dbontext = dbcontext;
        }

        public async Task<RSVP> CreateRSVPAsync(RSVP rsvp)
        {
            _dbontext.RSVPs.Add(rsvp);
            await _dbontext.SaveChangesAsync();
            return await _dbontext.RSVPs.Include(r => r.Event).FirstOrDefaultAsync(r => r.Id == rsvp.Id);
        }

        public async Task<bool> CancelRSVPAsync(int eventId, string userId)
        {
            var rsvp = await _dbontext.RSVPs.FirstOrDefaultAsync(r => r.EventId == eventId && r.UserId == userId);
            if (rsvp == null) return false;

            _dbontext.RSVPs.Remove(rsvp);
            await _dbontext.SaveChangesAsync();
            return true;
        }

        public async Task<bool> HasRSVPedAsync(int eventId, string userId)
        {
            return await _dbontext.RSVPs.AnyAsync(r => r.EventId == eventId && r.UserId == userId);
        }

        public async Task<IEnumerable<RSVP>> GetRSVPsByEventIdAsync(int eventId)
        {
            return await _dbontext.RSVPs
                .Where(r => r.EventId == eventId)
                .Include(r => r.User)
                .ToListAsync();
        }

        public async Task<IEnumerable<RSVP>> GetMyRSVPsAsync(string userId)
        {
            return await _dbontext.RSVPs
                .Include(r => r.Event)
                    .ThenInclude(e => e.Location)
                        .ThenInclude(l => l.Address)
                .Include(r => r.Event.Category)
                .Include(r => r.User)
                .Where(r => r.UserId == userId)
                .ToListAsync();
        }
    }
}
