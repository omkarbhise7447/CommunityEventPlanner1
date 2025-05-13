using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Data.Contract
{
    public interface IEventRepository
    {
        Task<Event> CreateEventAsync(Event ev);
        Task<bool> EventExistsAtLocationAsync(DateOnly Date, TimeOnly Time, double lat, double lng);
         
    }
}
