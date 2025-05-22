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

            CreateMap<User, UserDto>()
                .ForMember(dest => dest.UserId, opt => opt.MapFrom(src => src.Id));

            CreateMap<Event, EventResponseModel>()
                .ForMember(dest => dest.Location, opt => opt.MapFrom(src => src.Location))
                .ForMember(dest => dest.user, opt => opt.MapFrom(src => src.CreatedBy));
                
                

            CreateMap<Location, LocationDto>().
                ForMember(dest => dest.Address, opt=> opt.MapFrom(src => src.Address));
            
             
              
          
            CreateMap<Address, AddressDto>();
        }
    }
}
