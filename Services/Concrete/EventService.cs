using System.Globalization;
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
            var date = DateOnly.ParseExact(model.EventDate, "dd/MM/yyyy", CultureInfo.InvariantCulture);
            var time = TimeOnly.ParseExact(model.EventTime, "hh:mm tt", CultureInfo.InvariantCulture);

            var exists = await _eventRepository.EventExistsAtLocationAsync(
                date, time, model.Location.Latitude, model.Location.Longitude);

            if (exists)
                throw new Exception("Event already exists at this location and time.");

            var location = new Location
            {
                Name = model.Location.Name,
                Latitude = model.Location.Latitude,
                Longitude = model.Location.Longitude,
                Address = _mapper.Map<Address>(model.Location.Address)
            };

            var ev = new Event
            {
                Title = model.Title,
                Description = model.Description,
                Date = date,
                Time = time,
                CategoryId = model.CategoryId,
                Location = location,
                CreatedByUserId = userId
            };

            var createdEvent = await _eventRepository.CreateEventAsync(ev);
            return _mapper.Map<EventResponseModel>(createdEvent);
        }

        public async Task<IEnumerable<EventResponseModel>> GetAllEventsAsync()
        {
            var events = await _eventRepository.GetAllEventsAsync();
            return _mapper.Map<IEnumerable<EventResponseModel>>(events);
        }

        public async Task<IEnumerable<EventResponseModel>> GetMyEventsAsync(string userId)
        {
            var events = await _eventRepository.GetMyEventsAsync(userId);
            return _mapper.Map<IEnumerable<EventResponseModel>>(events);
        }

        public async Task<EventResponseModel> GetEventByIdAsync(int id)
        {
            var ev = await _eventRepository.GetEventByIdAsync(id);
            return _mapper.Map<EventResponseModel>(ev);
        }

        public async Task<EventResponseModel> UpdateEventAsync(int eventId, CreateEventModel model, string userId)
        {
            var existingEvent = await _eventRepository.GetEventByIdAsync(eventId);
            if (existingEvent == null || existingEvent.CreatedByUserId != userId)
                throw new UnauthorizedAccessException("You are not allowed to update this event.");

            var date = DateOnly.ParseExact(model.EventDate, "dd/MM/yyyy", CultureInfo.InvariantCulture);
            var time = TimeOnly.ParseExact(model.EventTime, "hh:mm tt", CultureInfo.InvariantCulture);

            var exists = await _eventRepository.EventExistsAtLocationAsync(
                date, time, model.Location.Latitude, model.Location.Longitude);

            if (exists)
                throw new Exception("Event already exists at this location and time.");

            var location = new Location
            {
                Name = model.Location.Name,
                Latitude = model.Location.Latitude,
                Longitude = model.Location.Longitude,
                Address = _mapper.Map<Address>(model.Location.Address)
            };


            existingEvent.Title = model.Title;
            existingEvent.Description = model.Description;
            existingEvent.Time = time;
            existingEvent.Date = date;
            existingEvent.CategoryId = model.CategoryId;
            existingEvent.Location = location;
            existingEvent.CreatedByUserId = userId;
            

            var updated = await _eventRepository.UpdateEventAsync(existingEvent);
            return _mapper.Map<EventResponseModel>(updated);
        }

        public async Task<bool> DeleteEventAsync(int id, string userId)
        {

            return await _eventRepository.DeleteEventAsync(id, userId);
        }

        public async Task<IEnumerable<EventResponseModel>> FilterEventsAsync(EventFilterRequest filter)
        {
            var events = await _eventRepository.FilterEventsAsync(filter);
            return _mapper.Map<IEnumerable<EventResponseModel>>(events);
        }

    }
}








































//using System;
//using System.Collections.Generic;
//using System.Globalization;
//using System.Linq;
//using System.Text;
//using System.Threading.Tasks;
//using AutoMapper;
//using Data;
//using Data.Contract;
//using Models.Request;
//using Models.Response;
//using Services.Contract;

//namespace Services.Concrete
//{
//    public class EventService : IEventService
//    {
//        private readonly IEventRepository _eventRepository;
//        private readonly IMapper _mapper;

//        public EventService(IEventRepository eventRepository, IMapper mapper)
//        {
//            _eventRepository = eventRepository;
//            _mapper = mapper;
//        }

//        public async Task<EventResponseModel> CreateEventAsync(CreateEventModel model, string userId)
//        {
//            var parsedDate = DateOnly.ParseExact(model.EventDate, "dd/MM/yyyy", CultureInfo.InvariantCulture);
//            var parsedTime = TimeOnly.ParseExact(model.EventTime, "hh:mm tt", CultureInfo.InvariantCulture);

//            var exists = await _eventRepository.EventExistsAtLocationAsync(parsedDate, parsedTime, model.Location.Latitude, model.Location.Longitude);
//            if (exists) throw new Exception("Event already exists at this location and time.");

//            var address = _mapper.Map<Address>(model.Location.Address);

//            var location = new Location
//            {
//                Name = model.Location.Name,
//                Latitude = model.Location.Latitude,
//                Longitude = model.Location.Longitude,
//                Address = address
//            };

//            var ev = new Event
//            {
//                Title = model.Title,
//                Description = model.Description,
//                Date = parsedDate,
//                Time = parsedTime,
//                CategoryId = model.CategoryId,
//                Location = location,
//                CreatedByUserId = userId
//            };

//            var created = await _eventRepository.CreateEventAsync(ev);
//            var respModel = _mapper.Map<EventResponseModel>(created);
//            return respModel;
//        }

//    }
//}
