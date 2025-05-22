import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { EventService } from '../../services/event.service';
import { RsvpService } from '../../services/rsvp.service';
import { Event } from '../../models/event.model';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, forkJoin } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { EventDetailsComponent } from '../event-details/event-details.component';
import { LoaderComponent } from '../loader/loader.component';

@Component({
  selector: 'app-events-to-attend',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDialogModule,
    MatMenuModule,
    LoaderComponent,
  ],
  templateUrl: './events-to-attend.component.html',
  styleUrls: ['./events-to-attend.component.scss'],
})
export class EventsToAttendComponent implements OnInit, OnDestroy {
  displayedColumns: string[] = ['title', 'description', 'date', 'city', 'categoryName'];
  dataSource = new MatTableDataSource<Event>([]);
  pageSize = 10;
  pageIndex = 0;
  totalEvents = 0;
  searchQuery = '';
  category = '';
  location = '';
  manualStartDate: Date | null = null;
  manualEndDate: Date | null = null;
  userId: string | null = null;
  errorMessage: string | null = null;
  categories: string[] = [];
  loading: boolean = false;

  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private eventService: EventService,
    private rsvpService: RsvpService,
    private authService: AuthService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.authService.isAuthenticated$.subscribe(isAuth => {
      if (isAuth) {
        const token = this.authService.getToken();
        if (token && typeof token === 'string' && token.split('.').length === 3) {
          try {
            const decodedToken = this.decodeToken(token);
            this.userId = decodedToken ? (decodedToken.userId || decodedToken.sub) : null;
          } catch (error) {
            console.error('Error decoding token:', error);
            this.userId = null;
          }
        }
      }
      this.loadEvents();
    });

    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.applyFilters();
    });

    this.dataSource.sort = this.sort;
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
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

  onDateChange() {
    if (this.manualStartDate || this.manualEndDate) {
      if (this.manualStartDate && this.manualEndDate && this.manualEndDate < this.manualStartDate) {
        this.errorMessage = 'End date cannot be before start date.';
        return;
      }
      this.errorMessage = null;
    }
    this.pageIndex = 0;
    this.loadEvents();
  }

  loadEvents() {
    if (!this.userId) {
      this.errorMessage = 'Please log in to view your RSVP\'d events.';
      this.dataSource.data = [];
      this.totalEvents = 0;
      this.loading = false;
      return;
    }

    this.loading = true;
    this.errorMessage = null;

    // Fetch RSVP'd events
    this.rsvpService.getMyRsvps().subscribe({
      next: (rsvps) => {
        if (rsvps.length === 0) {
          this.dataSource.data = [];
          this.totalEvents = 0;
          this.errorMessage = 'You have not RSVP\'d to any events.';
          this.loading = false;
          this.categories = [];
          return;
        }

        // Extract event IDs and fetch event details
        const eventIds = rsvps.map(rsvp => rsvp.eventId);
        const eventObservables = eventIds.map(id => this.eventService.getEventById(id));

        forkJoin(eventObservables).subscribe({
          next: (events: Event[]) => {
            // Filter events based on search, category, location, and dates
            let filteredEvents = events.filter(event => event !== null && event.user.userId !== this.userId);

            // Apply client-side filters
            if (this.searchQuery) {
              const query = this.searchQuery.toLowerCase();
              filteredEvents = filteredEvents.filter(event =>
                event.title.toLowerCase().includes(query) ||
                (event.location?.address?.city || '').toLowerCase().includes(query)
              );
            }

            if (this.category) {
              filteredEvents = filteredEvents.filter(event => event.categoryName === this.category);
            }

            if (this.location) {
              filteredEvents = filteredEvents.filter(event =>
                (event.location?.address?.city || '').toLowerCase().includes(this.location.toLowerCase())
              );
            }

            if (this.manualStartDate) {
              const start = this.formatDateForBackend(this.manualStartDate);
              filteredEvents = filteredEvents.filter(event => event.date >= start);
            }

            if (this.manualEndDate) {
              const end = this.formatDateForBackend(this.manualEndDate);
              filteredEvents = filteredEvents.filter(event => event.date <= end);
            }

            // Paginate
            const startIndex = this.pageIndex * this.pageSize;
            const paginatedEvents = filteredEvents.slice(startIndex, startIndex + this.pageSize);

            this.dataSource.data = paginatedEvents;
            this.totalEvents = filteredEvents.length;
            this.categories = [...new Set(filteredEvents.map(event => event.categoryName))].filter(cat => cat);
            if (this.dataSource.data.length === 0) {
              this.errorMessage = 'No RSVP\'d events match the selected filters.';
            }
            this.loading = false;
          },
          error: err => {
            console.error('Error fetching RSVP\'d events:', err);
            this.errorMessage = 'Failed to load RSVP\'d events. Please try again later.';
            this.dataSource.data = [];
            this.totalEvents = 0;
            this.loading = false;
          },
        });
      },
      error: err => {
        console.error('Error fetching RSVPs:', err);
        this.errorMessage = 'Failed to load RSVP\'d events. Please try again later.';
        this.dataSource.data = [];
        this.totalEvents = 0;
        this.loading = false;
      },
    });
  }

  formatDateForBackend(date: Date): string {
    const year = date.getFullYear().toString();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  formatDateForDisplay(date: string): string {
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
      console.error('Error formatting date for display:', error);
      return date;
    }
  }

  getCity(event: Event): string {
    if (!event || !event.location || !event.location.address || !event.location.address.city) {
      return 'City not specified';
    }
    return event.location.address.city;
  }

  applyFilters() {
    this.pageIndex = 0;
    if (this.paginator) {
      this.paginator.pageIndex = 0;
    }
    this.loadEvents();
  }

  onSearchChange(query: string) {
    this.searchQuery = query;
    this.searchSubject.next(query);
  }

  onPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadEvents();
  }

  openEventDetails(event: Event) {
    const dialogRef = this.dialog.open(EventDetailsComponent, {
      data: { eventId: event.id },
      width: '600px',
      panelClass: 'event-details-dialog',
      enterAnimationDuration: '300ms',
      exitAnimationDuration: '300ms',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadEvents();
      }
    });
  }

  toggleDescription(event: Event) {
    event.showFullDescription = !event.showFullDescription;
  }
}