using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Data
{
    public class Location
    {
        public int Id { get; set; }

        public string Name { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }

        public int AddressId { get; set; }
        public Address Address { get; set; }

        public ICollection<Event> Events { get; set; }
    }
}
