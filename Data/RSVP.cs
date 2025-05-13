using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Data
{
    public class RSVP
    {
        public int Id { get; set; }

        public string UserId { get; set; }
        
        [ForeignKey("UserId")]
        public User User { get; set; }

        public int EventId { get; set; }
        
        [ForeignKey("EventId")]
        public Event Event { get; set; }

        public DateTime RSVPDate { get; set; } = DateTime.UtcNow;
    }
}
