import { Component, OnInit, Inject, PLATFORM_ID, ViewChild, ViewContainerRef } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { EventService } from '../../services/event.service';
import { RsvpService } from '../../services/rsvp.service';
import { AuthService } from '../../services/auth.service';
import { Event } from '../../models/event.model';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { isPlatformBrowser } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RSVP } from '../../models/rsvp.model';
import { Attendee } from '../../models/attendee.model';
import { LoaderComponent } from '../loader/loader.component';

@Component({
  selector: 'app-event-details',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatTooltipModule,
    MatSnackBarModule,
    RouterLink,
    LoaderComponent,
  ],
  templateUrl: './event-details.component.html',
  styleUrls: ['./event-details.component.scss'],
})
export class EventDetailsComponent implements OnInit {
  event: Event | null = null;
  userId: string | null = null;
  isAuthenticated: boolean = false;
  showMap: boolean = false;
  isBrowser: boolean = false;
  hasRSVPed: boolean = false;
  attendees: Attendee[] = [];
  showAttendees: boolean = false;
  loading: boolean = false;

  @ViewChild('mapContainer', { read: ViewContainerRef }) mapContainer!: ViewContainerRef;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { eventId: number },
    private dialogRef: MatDialogRef<EventDetailsComponent>,
    private eventService: EventService,
    private rsvpService: RsvpService,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit() {
    this.authService.isAuthenticated$.subscribe(isAuth => {
      this.isAuthenticated = isAuth;
      if (isAuth) {
        const token = this.authService.getToken();
        if (token && typeof token === 'string' && token.split('.').length === 3) {
          try {
            const decodedToken = this.decodeToken(token);
            this.userId = decodedToken ? (decodedToken.userId || decodedToken.sub) : null;
            if (this.event) {
              this.loadMyRsvps();
            }
          } catch (error) {
            console.error('Error decoding token:', error);
            this.userId = null;
          }
        }
      }
      this.loadEventDetails();
    });
  }

  loadEventDetails() {
    this.loading = true;
    const eventId = this.data.eventId;
    if (eventId) {
      this.eventService.getEventById(eventId).subscribe({
        next: (event: Event) => {
          this.event = event;
          this.loadAttendees(eventId);
          if (this.isAuthenticated) {
            this.loadMyRsvps();
          }
          this.loading = false;
        },
        error: err => {
          console.error('Error fetching event:', err);
          this.dialogRef.close();
          this.loading = false;
        },
      });
    }
  }

  loadMyRsvps() {
    if (this.isAuthenticated && this.event) {
      this.loading = true;
      this.rsvpService.getMyRsvps().subscribe({
        next: (rsvps: RSVP[]) => {
          this.hasRSVPed = rsvps.some(rsvp => rsvp.eventId === this.event!.id);
          this.loading = false;
        },
        error: err => {
          console.error('Error fetching my RSVPs:', err);
          this.hasRSVPed = false;
          this.loading = false;
        },
      });
    }
  }

  loadAttendees(eventId: number) {
    this.loading = true;
    this.rsvpService.getAttendees(eventId).subscribe({
      next: (attendees: Attendee[]) => {
        console.log('Attendees received:', attendees);
        this.attendees = attendees;
        this.loading = false;
      },
      error: err => {
        console.error('Error fetching attendees:', err);
        this.attendees = [];
        this.loading = false;
      },
    });
  }

  toggleAttendees() {
    this.showAttendees = !this.showAttendees;
  }

  async toggleMap() {
    this.showMap = !this.showMap;
    if (this.showMap && this.isBrowser && this.event) {
      const { MapComponent } = await import('../map/map-component');
      this.mapContainer.clear();
      const componentRef = this.mapContainer.createComponent(MapComponent);
      componentRef.instance.latitude = this.event.location.latitude;
      componentRef.instance.longitude = this.event.location.longitude;
      componentRef.instance.title = this.event.title;
    } else {
      this.mapContainer.clear();
    }
  }

  private decodeToken(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const padding = base64.length % 4;
      const paddedBase64 = padding ? base64 + '='.repeat(4 - padding) : base64;
      const jsonPayload = decodeURIComponent(
        atob(paddedBase64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error in decodeToken:', error);
      return null;
    }
  }

  isCreator(): boolean {
    if (!this.event || !this.event.user) {
      return false;
    }
    return this.event.user.userId === this.userId;
  }

  isPastEvent(): boolean {
    if (!this.event || !this.event.date || !this.event.time) return false;
    const now = new Date();

    // Parse event date (YYYY-MM-DD)
    const [year, month, day] = this.event.date.split('-').map(Number);
    const fullYear = year < 1000 ? 2000 + year : year;

    // Parse event time (HH:mm:ss)
    const [hours, minutes, seconds] = this.event.time.split(':').map(Number);

    // Create event Date object
    const eventDateTime = new Date(fullYear, month - 1, day, hours, minutes, seconds);

    // Compare with current date and time
    return eventDateTime < now;
  }

  deleteEvent() {
    if (this.event && confirm('Are you sure you want to delete this event?')) {
      this.loading = true;
      this.eventService.deleteEvent(this.event.id).subscribe({
        next: () => {
          this.snackBar.open('Event deleted successfully', 'Close', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            panelClass: ['success-snackbar'],
          });
          this.dialogRef.close(true);
          this.loading = false;
        },
        error: err => {
          console.error('Error deleting event:', err);
          this.snackBar.open('Failed to delete event. Please try again.', 'Close', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            panelClass: ['error-snackbar'],
          });
          this.loading = false;
        },
      });
    }
  }

  rsvp() {
    if (this.event) {
      this.loading = true;
      this.rsvpService.rsvpEvent(this.event.id).subscribe({
        next: () => {
          this.hasRSVPed = true;
          this.loadAttendees(this.event!.id);
          this.loading = false;
          alert('Successfully RSVP\'d to the event!');
        },
        error: err => {
          console.error('Error RSVPing to event:', err);
          const errorMessage = err.error?.Message || 'Failed to RSVP. Please try again.';
          alert(errorMessage);
          this.loading = false;
        },
      });
    }
  }

  cancelRsvp() {
    if (this.event) {
      this.loading = true;
      this.rsvpService.cancelRsvp(this.event.id).subscribe({
        next: () => {
          this.hasRSVPed = false;
          this.loadAttendees(this.event!.id);
          this.loading = false;
          alert('Successfully canceled your RSVP.');
        },
        error: err => {
          console.error('Error canceling RSVP:', err);
          alert('Failed to cancel RSVP. Please try again.');
          this.loading = false;
        },
      });
    }
  }

  editEvent() {
    if (this.event) {
      this.router.navigate(['/edit-event', this.event.id]).then(() => {
        this.dialogRef.close();
      });
    }
  }

  formatAddress(): string {
    if (!this.event || !this.event.location || !this.event.location.address) {
      return 'Location not specified';
    }
    const address = this.event.location.address;
    const parts = [
      address.addressLine1,
      address.city,
      address.state,
      address.country,
    ].filter(part => part);
    return parts.length > 0 ? parts.join(', ') : 'Location not specified';
  }

  formatTime(time: string): string {
    try {
      if (time === '00:00:00') {
        return 'TBD';
      }
      const [hours, minutes] = time.split(':').map(Number);
      const period = hours >= 12 ? 'PM' : 'AM';
      const adjustedHours = hours % 12 || 12;
      return `${adjustedHours}:${minutes.toString().padStart(2, '0')} ${period}`;
    } catch (error) {
      console.error('Error formatting time:', error);
      return time;
    }
  }

  formatDate(date: string): string {
    if (date === '0001-01-01') {
      return 'TBD';
    }
    try {
      const [year, month, day] = date.split('-').map(Number);
      const fullYear = year < 1000 ? 2000 + year : year;
      return new Date(fullYear, month - 1, day).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return date;
    }
  }

  closeDialog() {
    this.dialogRef.close();
  }
}