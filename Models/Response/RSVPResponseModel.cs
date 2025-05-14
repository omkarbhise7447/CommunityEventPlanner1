using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Models.Common;

namespace Models.Response
{
    public class RSVPResponseModel
    {
        public int Id { get; set; }
        public int EventId { get; set; }
        public string EventTitle { get; set; }

        public DateOnly EventDate { get; set; }

        public TimeOnly EventTime { get; set; }
        public DateTime RSVPDate { get; set; }

        public LocationDto Location { get; set; }
    }
}
