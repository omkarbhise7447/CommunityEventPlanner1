using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AutoMapper;
using Data;
using Data.Contract;
using Models.Request;
using Models.Response;
using Services.Contract;

namespace Services.Concrete
{
    public class EventService : IEventService
    {
        private readonly IEventRepository _eventRepository;
        private readonly IMapper _mapper;

        public EventService(IEventRepository eventRepository, IMapper mapper)
        {
            _eventRepository = eventRepository;
            _mapper = mapper;
        }

        public async Task<EventResponseModel> CreateEventAsync(CreateEventModel model, string userId)
        {
            var parsedDate = DateOnly.ParseExact(model.EventDate, "dd/MM/yyyy", CultureInfo.InvariantCulture);
            var parsedTime = TimeOnly.ParseExact(model.EventTime, "hh:mm tt", CultureInfo.InvariantCulture);

            var exists = await _eventRepository.EventExistsAtLocationAsync(parsedDate, parsedTime, model.Location.Latitude, model.Location.Longitude);
            if (exists) throw new Exception("Event already exists at this location and time.");

            var address = _mapper.Map<Address>(model.Location.Address);

            var location = new Location
            {
                Name = model.Location.Name,
                Latitude = model.Location.Latitude,
                Longitude = model.Location.Longitude,
                Address = address
            };

            var ev = new Event
            {
                Title = model.Title,
                Description = model.Description,
                Date = parsedDate,
                Time = parsedTime,
                CategoryId = model.CategoryId,
                Location = location,
                CreatedByUserId = userId
            };

            var created = await _eventRepository.CreateEventAsync(ev);
            var respModel = _mapper.Map<EventResponseModel>(created);
            return respModel;
        }

    }
}
