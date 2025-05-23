﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Models.Common;

namespace Models.Request
{
    public class CreateEventModel
    {
        public string Title { get; set; }
        public string? Description { get; set; }
        public string EventDate { get; set; }
        
        public string EventTime { get; set; }
        public int CategoryId { get; set; }
        public LocationDto Location { get; set; }
    }
}
