using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Models.Request;
using Models.Response;

namespace Services.Contract
{
    public interface IEventService
    {
        Task<EventResponseModel> CreateEventAsync(CreateEventModel model, string userId);
        Task<IEnumerable<EventResponseModel>> GetAllEventsAsync();
        Task<(IEnumerable<EventResponseModel> events, int totalCount)> GetMyEventsAsync(string userId, int page, int pageSize, EventFilterRequest filters);
        Task<EventResponseModel> GetEventByIdAsync(int id);

        Task<EventResponseModel> UpdateEventAsync(int eventId, CreateEventModel model, string userId);
        Task<bool> DeleteEventAsync(int id, string userId);

        Task<IEnumerable<EventResponseModel>> FilterEventsAsync(EventFilterRequest filter);

        Task<(IEnumerable<EventResponseModel> events, int totalCount)> GetEventsAsync(int page, int pageSize, EventFilterRequest filters);

    }
}
