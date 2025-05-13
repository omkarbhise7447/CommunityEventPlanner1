﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;

namespace Data
{
    public class User : IdentityUser
    {
        public ICollection<Event> Events { get; set; }
        public ICollection<RSVP> RSVPs { get; set; }
    }
}
