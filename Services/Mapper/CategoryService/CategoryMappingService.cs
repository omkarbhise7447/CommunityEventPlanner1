using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AutoMapper;
using Data;
using Models.Response;

namespace Services.Mapper.CategoryService
{
    public class CategoryMappingService : Profile
    {
        public CategoryMappingService() {
            CreateMap<Category, CategoryResponse>();
        }
    }

}
