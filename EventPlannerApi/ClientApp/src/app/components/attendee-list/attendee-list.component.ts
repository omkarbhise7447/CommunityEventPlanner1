import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RsvpService } from '../../services/rsvp.service';
import { Attendee } from '../../models/attendee.model';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { LoaderComponent } from '../loader/loader.component'; 

@Component({
  selector: 'app-attendee-list',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatListModule, MatIconModule, LoaderComponent],
  templateUrl: './attendee-list.component.html',
  styleUrls: ['./attendee-list.component.scss'],
})
export class AttendeeListComponent implements OnInit {
  attendees: Attendee[] = [];
  loading: boolean = true; 
  error: string | null = null;

  constructor(private route: ActivatedRoute, private rsvpService: RsvpService) {}

  ngOnInit() {
    const eventId = +this.route.parent!.snapshot.paramMap.get('id')!;
    if (eventId) {
      this.rsvpService.getAttendees(eventId).subscribe({
        next: (attendees: Attendee[]) => {
          console.log('Fetched attendees:', attendees);
          this.attendees = attendees;
          this.loading = false; 
        },
        error: (err) => {
          console.error('Error fetching attendees:', err);
          this.error = 'Failed to load attendees. Please try again later.';
          this.loading = false; 
        },
      });
    } else {
      this.error = 'Invalid event ID.';
      this.loading = false; 
    }
  }
}