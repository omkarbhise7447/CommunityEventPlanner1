using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AutoMapper;
using Data;
using Models.Common;
using Models.Request;
using Models.Response;

namespace Services.Mapper.EventService
{
    public class EventMappingProfile : Profile
    {
        public EventMappingProfile() 
        {
            CreateMap<AddressDto, Address>();
            CreateMap<Event, EventResponseModel>();
        }
    }
}
