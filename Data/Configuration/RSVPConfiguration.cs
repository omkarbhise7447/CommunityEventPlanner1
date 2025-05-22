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
           
            builder.HasKey(r => r.Id);

            
            builder.HasOne(r => r.User)
                .WithMany(u => u.RSVPs)
                .HasForeignKey(r => r.UserId)
                .OnDelete(DeleteBehavior.Restrict); 

            builder.HasOne(r => r.Event)
                .WithMany(e => e.RSVPs)
                .HasForeignKey(r => r.EventId)
                .OnDelete(DeleteBehavior.Cascade); 

            
            builder.HasIndex(r => new { r.UserId, r.EventId })
                .IsUnique(); 
        }
    }
}
