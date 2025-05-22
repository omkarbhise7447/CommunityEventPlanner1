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

namespace Services.Mapper.RSVPService
{
    public class RSVPMappingProfile : Profile
    {
        public RSVPMappingProfile()
        {
            CreateMap<RSVP, RSVPResponseModel>()
            .ForMember(dest => dest.EventTitle, opt => opt.MapFrom(src => src.Event.Title))
            .ForMember(dest => dest.Description, opt => opt.MapFrom(src => src.Event.Description))
            .ForMember(dest => dest.RSVPDate, opt => opt.MapFrom(src => src.RSVPDate.ToLocalTime()))
            .ForMember(dest => dest.Location, opt => opt.MapFrom(src => src.Event.Location))
            .ForMember(dest => dest.categoryName, opt => opt.MapFrom(src => src.Event.Category.Name))
             .ForMember(dest => dest.user, opt => opt.MapFrom(src => src.Event.CreatedBy)); ;

            CreateMap<Location, LocationDto>();
            CreateMap<Address, AddressDto>();
            CreateMap<RSVPRequestModel, RSVP>();
            CreateMap<User, UserDto>()
            .ForMember(dest => dest.UserId, opt => opt.MapFrom(src => src.Id));
        }
    }
}
