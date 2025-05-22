using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Models.Request;

namespace Data.Contract
{
    public interface IEventRepository
    {
        Task<Event> CreateEventAsync(Event ev);
        Task<bool> EventExistsAtLocationAsync(DateOnly Date, TimeOnly Time, double lat, double lng, int? eventId = null);

        Task<IEnumerable<Event>> GetAllEventsAsync();
        Task<(IEnumerable<Event> events, int totalCount)> GetEventsAsync(int page, int pageSize, EventFilterRequest filters);
        Task<(IEnumerable<Event> events, int totalCount)> GetMyEventsAsync(string userId, int page, int pageSize, EventFilterRequest filters);
        Task<Event> GetEventByIdAsync(int id);
        Task<Event> UpdateEventAsync(Event ev);
        Task<bool> DeleteEventAsync(int id, string userId);

        Task<IEnumerable<Event>> FilterEventsAsync(EventFilterRequest filter);

    }
}
