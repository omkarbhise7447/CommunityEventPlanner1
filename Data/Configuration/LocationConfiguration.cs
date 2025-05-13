using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Data.Configuration
{
    public class LocationConfiguration : IEntityTypeConfiguration<Location>
    {
        public void Configure(EntityTypeBuilder<Location> builder)
        {
            builder.HasKey(l => l.Id);

            builder.Property(l => l.Name)
                   .IsRequired()
                   .HasMaxLength(100);

            builder.Property(l => l.Latitude)
                   .IsRequired();

            builder.Property(l => l.Longitude)
                   .IsRequired();

            builder.HasOne(l => l.Address)
                   .WithMany(a => a.Locations)
                   .HasForeignKey(l => l.AddressId)
                   .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
