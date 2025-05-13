using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore;

namespace Data.Configuration
{
    public class RSVPConfiguration : IEntityTypeConfiguration<RSVP>
    {
        public void Configure(EntityTypeBuilder<RSVP> builder)
        {
            // Configure the RSVP entity
            builder.HasKey(r => r.Id); // Ensure Id is the primary key

            // Configure User and Event relationships
            builder.HasOne(r => r.User)
                .WithMany(u => u.RSVPs)
                .HasForeignKey(r => r.UserId)
                .OnDelete(DeleteBehavior.Restrict); // Prevent cascade delete for RSVPs

            builder.HasOne(r => r.Event)
                .WithMany(e => e.RSVPs)
                .HasForeignKey(r => r.EventId)
                .OnDelete(DeleteBehavior.Restrict); // Prevent cascade delete for RSVPs

            // Ensure that a user can RSVP only once per event
            builder.HasIndex(r => new { r.UserId, r.EventId })
                .IsUnique(); // Enforce uniqueness for each RSVP (user can only RSVP once per event)
        }
    }
}
