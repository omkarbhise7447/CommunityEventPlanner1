using System.Threading.Tasks;
using Data.Contract;
using Microsoft.EntityFrameworkCore;
using Models.Request;

namespace Data.Concrete
{
    public class EventRepository : IEventRepository
    {
        private readonly ApplicationDbContext _dbcontext;

        public EventRepository(ApplicationDbContext dbcontext)
        {
            _dbcontext = dbcontext;
        }

        public async Task<Event> CreateEventAsync(Event ev)
        {
            _dbcontext.Events.Add(ev);
            await _dbcontext.SaveChangesAsync();
            return ev;
        }

        public async Task<bool> EventExistsAtLocationAsync(DateOnly date, TimeOnly time, double lat, double lng)
        {
            return await _dbcontext.Events.AnyAsync(e =>
                e.Date == date &&
                e.Time == time &&
                e.Location.Latitude == lat &&
                e.Location.Longitude == lng);
        }

        public async Task<IEnumerable<Event>> GetAllEventsAsync() =>
        await _dbcontext.Events.Include(e => e.Location).ThenInclude(l => l.Address).Include(e => e.Category).Include(e => e.CreatedBy).ToListAsync();

        public async Task<IEnumerable<Event>> GetMyEventsAsync(string userId) =>
            await _dbcontext.Events.Where(e => e.CreatedByUserId == userId).Include(e => e.Location).ThenInclude(l => l.Address).Include(e => e.Category).ToListAsync();

        public async Task<Event> GetEventByIdAsync(int id) =>
            await _dbcontext.Events.Include(e => e.Location).ThenInclude(l => l.Address).Include(e => e.Category).FirstOrDefaultAsync(e => e.Id == id);

        public async Task<Event> UpdateEventAsync(Event ev)
        {
            _dbcontext.Events.Update(ev);
            await _dbcontext.SaveChangesAsync();
            return ev;
        }

        public async Task<bool> DeleteEventAsync(int id, string userId)
        {
            var ev = await _dbcontext.Events.FirstOrDefaultAsync(e => e.Id == id && e.CreatedByUserId == userId);
            if (ev == null) return false;
            _dbcontext.Events.Remove(ev);
            await _dbcontext.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<Event>> FilterEventsAsync(EventFilterRequest filter)
        {
            var query = _dbcontext.Events
                .Include(e => e.Location)
                    .ThenInclude(l => l.Address)
                .Include(e => e.Category)
                .Include(e => e.CreatedBy)
                .AsQueryable();

            if (filter.CategoryId.HasValue)
            {
                query = query.Where(e => e.CategoryId == filter.CategoryId);

            }

            if (filter.StartDate.HasValue && filter.EndDate.HasValue)
            {

                query = query.Where(e => e.Date >= filter.StartDate.Value && e.Date <= filter.EndDate.Value);
            }
            else if (filter.StartDate.HasValue)
            {

                query = query.Where(e => e.Date >= filter.StartDate.Value);
            }
            else if (filter.EndDate.HasValue)
            {

                query = query.Where(e => e.Date <= filter.EndDate.Value);
            }


            if (!string.IsNullOrWhiteSpace(filter.City))
            {

                query = query.Where(e => e.Location.Address.City.ToLower().Contains(filter.City.ToLower()));
            }

            return await query.ToListAsync();
        }


    }
}



































//using System;
//using System.Collections.Generic;
//using System.Linq;
//using System.Text;
//using System.Threading.Tasks;
//using Data.Contract;
//using Microsoft.EntityFrameworkCore;
//using static System.Runtime.InteropServices.JavaScript.JSType;

//namespace Data.Concrete
//{
//    public class EventRepository : IEventRepository
//    {
//        private readonly ApplicationDbContext _dbcontext;

//        public EventRepository(ApplicationDbContext dbcontext)
//        {
//            _dbcontext = dbcontext;
//        }

//        public async Task<Event> CreateEventAsync(Event ev)
//        {
//            _dbcontext.Events.Add(ev);

//            await _dbcontext.SaveChangesAsync();

//            return ev;
//        }

//        public async Task<bool> EventExistsAtLocationAsync(DateOnly Date, TimeOnly Time, double lat, double lng)
//        {
//            return await _dbcontext.Events.AnyAsync(e => e.Date == Date && e.Time == Time && e.Location.Latitude == lat && e.Location.Longitude == lng);
//        }
//    }
//}
