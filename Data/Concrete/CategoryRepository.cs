using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Data.Contract;
using Microsoft.EntityFrameworkCore;

namespace Data.Concrete
{
    public class CategoryRepository : ICategoryRepository
    {
        private readonly ApplicationDbContext _dbcontext;

        public CategoryRepository(ApplicationDbContext dbcontext)
        {
            _dbcontext = dbcontext;
        }

        public async Task<IEnumerable<Category>> GetAllCategoriesAsync()
        {
            return await _dbcontext.Categories.ToListAsync();
        }
    }
}
