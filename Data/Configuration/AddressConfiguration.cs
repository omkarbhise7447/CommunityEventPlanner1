using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore;

namespace Data.Configuration
{
    public class AddressConfiguration : IEntityTypeConfiguration<Address>
    {
        public void Configure(EntityTypeBuilder<Address> builder)
        {
            builder.HasKey(a => a.Id);

            builder.Property(a => a.AddressLine1)
                   .IsRequired()
                   .HasMaxLength(255);

            builder.Property(a => a.AddressLine2)
                   .HasMaxLength(255);

            builder.Property(a => a.City)
                   .IsRequired()
                   .HasMaxLength(100);

            builder.Property(a => a.District)
                   .IsRequired()
                   .HasMaxLength(100);

            builder.Property(a => a.State)
                   .IsRequired()
                   .HasMaxLength(100);

            builder.Property(a => a.ZipCode)
                   .IsRequired()
                   .HasMaxLength(20);

            builder.Property(a => a.Country)
                   .IsRequired()
                   .HasMaxLength(100);
        }
    }
}
