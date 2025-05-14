using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AutoMapper;
using Data;
using Data.Contract;
using Models.Common;
using Models.Response;
using Services.Contract;

namespace Services.Concrete
{
    public class RSVPService : IRSVPService
    {
        private readonly IRSVPRepository _rsvpRepository;
        private readonly IEventRepository _eventRepository;
        private readonly IMapper _mapper;

        public RSVPService(IRSVPRepository rsvpRepository, IMapper mapper, IEventRepository eventRepository )
        {
            _rsvpRepository = rsvpRepository;
            _mapper = mapper;
            _eventRepository = eventRepository;
        }

        public async Task<RSVPResponseModel> RSVPAsync(int eventId, string userId)
        {
            var alreadyRSVPed = await _rsvpRepository.HasRSVPedAsync(eventId, userId);
            if (alreadyRSVPed)
                throw new Exception("You have already RSVPed to this event.");

            var eventDetails = await _eventRepository.GetEventByIdAsync(eventId);
            if (eventDetails == null)
                throw new Exception("Event not found.");

            var today = DateOnly.FromDateTime(DateTime.UtcNow.Date);
            if (eventDetails.Date < today)
                throw new Exception("You cannot RSVP to a past event.");

            var rsvp = new RSVP
            {
                EventId = eventId,
                UserId = userId,
                RSVPDate = DateTime.UtcNow
            };

            var created = await _rsvpRepository.CreateRSVPAsync(rsvp);
            return _mapper.Map<RSVPResponseModel>(created);
        }


        public async Task<bool> CancelRSVPAsync(int eventId, string userId)
        {
            return await _rsvpRepository.CancelRSVPAsync(eventId, userId);
        }

        public async Task<IEnumerable<AttendeeDto>> GetAttendeesAsync(int eventId)
        {
            var rsvps = await _rsvpRepository.GetRSVPsByEventIdAsync(eventId);
            return rsvps.Select(r => new AttendeeDto
            {
                Name = r.User.UserName,
                Email = r.User.Email
            });
        }

        public async Task<IEnumerable<RSVPResponseModel>> GetMyRSVPsAsync(string userId)
        {
            var rsvps = await _rsvpRepository.GetMyRSVPsAsync(userId);
   
            return _mapper.Map<IEnumerable<RSVPResponseModel>>(rsvps);
        }

        public async Task<IEnumerable<RSVPResponseModel>> GetMyUpcomingEventsAsync(string userId)
        {
            var now = DateOnly.FromDateTime(DateTime.UtcNow.Date);
            var rsvps = await _rsvpRepository.GetMyRSVPsAsync(userId);
            var upcoming = rsvps.Where(r => r.Event.Date >= now);
            return _mapper.Map<IEnumerable<RSVPResponseModel>>(upcoming);
        }   
    }
}
