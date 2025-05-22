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

        public async Task<bool> EventExistsAtLocationAsync(DateOnly date, TimeOnly time, double lat, double lng, int? eventId = null)
        {
            return await _dbcontext.Events.AnyAsync(e =>
                e.Date == date &&
                e.Time == time &&
                e.Location.Latitude == lat &&
                e.Location.Longitude == lng && (e.Id == null || e.Id != eventId));
        }

        public async Task<IEnumerable<Event>> GetAllEventsAsync()
        {

            return await _dbcontext.Events.Include(e => e.Location).ThenInclude(l => l.Address).Include(e => e.Category).Include(e => e.CreatedBy).ToListAsync();
        }

        public async Task<(IEnumerable<Event> events, int totalCount)> GetEventsAsync(int page, int pageSize, EventFilterRequest filters)
        {
            var query = _dbcontext.Events
                .Include(e => e.Location).ThenInclude(l => l.Address)
                .Include(e => e.Category)
                .Include(e => e.CreatedBy)
                .AsQueryable();

            if (!string.IsNullOrEmpty(filters.Category))
                query = query.Where(e => e.Category.Name.ToLower().Contains(filters.Category.ToLower()));

            if (!string.IsNullOrWhiteSpace(filters.City))
                query = query.Where(e => e.Location.Address.City.ToLower() == filters.City.ToLower());

            if (filters.StartDate.HasValue)
                query = query.Where(e => e.Date >= filters.StartDate.Value);

            if (filters.EndDate.HasValue)
                query = query.Where(e => e.Date <= filters.EndDate.Value);

            if (!string.IsNullOrEmpty(filters.Search))
            {
                query = query.Where(e => e.Title.ToLower().Contains(filters.Search.ToLower()) || e.Location.Address.City.ToLower().Contains(filters.Search.ToLower())) ;
            }

            var totalCount = await query.CountAsync();

            var events = await query
                .OrderBy(e => e.Date).ThenBy(e => e.Time)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (events, totalCount);
        }


        public async Task<(IEnumerable<Event> events, int totalCount)> GetMyEventsAsync(string userId, int page, int pageSize, EventFilterRequest filters)
        {

            var query = _dbcontext.Events.Where(e => e.CreatedByUserId == userId).Include(e => e.Location).ThenInclude(l => l.Address).Include(e => e.Category).AsQueryable();

            if (!string.IsNullOrEmpty(filters.Category))
                query = query.Where(e => e.Category.Name.ToLower().Contains(filters.Category.ToLower()));

            if (!string.IsNullOrWhiteSpace(filters.City))
                query = query.Where(e => e.Location.Address.City.ToLower() == filters.City.ToLower());

            if (filters.StartDate.HasValue)
                query = query.Where(e => e.Date >= filters.StartDate.Value);

            if (filters.EndDate.HasValue)
                query = query.Where(e => e.Date <= filters.EndDate.Value);

            if (!string.IsNullOrEmpty(filters.Search))
            {
                query = query.Where(e => e.Title.ToLower().Contains(filters.Search.ToLower()) || e.Location.Address.City.ToLower().Contains(filters.Search.ToLower()));
            }

            var totalCount = await query.CountAsync();

            var events = await query
                .OrderBy(e => e.Date).ThenBy(e => e.Time)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();


            return (events, totalCount);
        }

        public async Task<Event> GetEventByIdAsync(int id)
        {
            return await _dbcontext.Events.Include(e => e.Location).ThenInclude(l => l.Address).Include(e => e.Category).Include(e => e.CreatedBy).FirstOrDefaultAsync(e => e.Id == id);

        }

        public async Task<Event> UpdateEventAsync(Event ev)
        {
            _dbcontext.Events.Update(ev);
            await _dbcontext.SaveChangesAsync();
            return ev;
        }

        public async Task<bool> DeleteEventAsync(int id, string userId)
        {
            var ev = await _dbcontext.Events.FirstOrDefaultAsync(e => e.Id == id && e.CreatedByUserId == userId);

           
            if (ev == null) 
                return false;

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

            if (!string.IsNullOrEmpty(filter.Category))
                query = query.Where(e => e.Category.Name.ToLower().Contains(filter.Category.ToLower()));

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






