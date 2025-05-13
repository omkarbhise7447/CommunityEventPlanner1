using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Data.Configuration
{
    public class EventConfiguration : IEntityTypeConfiguration<Event>
    {
        public void Configure(EntityTypeBuilder<Event> builder)
        {
            builder.HasKey(e => e.Id);

            builder.Property(e => e.Title)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(e => e.Description)
                .HasMaxLength(1000);

            builder.Property(e => e.Date)
                .IsRequired();

            builder.Property(e => e.Time).IsRequired();

            builder.HasOne(e => e.Category)
                .WithMany(c => c.Events)
                .HasForeignKey(e => e.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(e => e.Location)
              .WithMany(l => l.Events)
              .HasForeignKey(e => e.LocationId)
              .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(e => e.CreatedBy)
                .WithMany(u => u.Events)
                .HasForeignKey(e => e.CreatedByUserId)
                .OnDelete(DeleteBehavior.Restrict); // Prevent cascade delete for events
        }
    }
}
