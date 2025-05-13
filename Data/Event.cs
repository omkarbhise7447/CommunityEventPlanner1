using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Data
{
    public class Event
    {
        public int Id { get; set; }

        [Required]
        public string Title { get; set; }

        public string Description { get; set; }

        [Required]
        public DateOnly Date { get; set; }

        [Required]
        public TimeOnly Time { get; set; }

        [Required]
        public int LocationId { get; set; }
        public Location Location { get; set; }

        [Required]
        public int CategoryId { get; set; }
        public Category Category { get; set; }


        public string CreatedByUserId { get; set; }

        [ForeignKey("CreatedByUserId")]
        public User CreatedBy { get; set; }

        public ICollection<RSVP> RSVPs { get; set; }
    }
}
