using System.Threading.Tasks;
using Data.Contract;
using Microsoft.EntityFrameworkCore;

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
