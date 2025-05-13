using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Models.Common;

namespace Models.Response
{
    public class EventResponseModel
    {
        public int Id { get; set; }

        public string Title { get; set; }

        public string Description { get; set; }

       
        public DateOnly Date { get; set; }

        public TimeOnly Time { get; set; }
        public int LocationId { get; set; }
        public int CategoryId { get; set; }

        public string CreatedByUserId { get; set; }

    }
}
