using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Models.Common
{
    public class LocationDto
    {
        public string Name { get; set; }
        public AddressDto Address { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }
    }
}
