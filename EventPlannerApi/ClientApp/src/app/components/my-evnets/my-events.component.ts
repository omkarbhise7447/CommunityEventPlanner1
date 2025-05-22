import { Component, OnInit, OnDestroy, ViewChild, ChangeDetectorRef } from '@angular/core';
import { EventService } from '../../services/event.service';
import { Event } from '../../models/event.model';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
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
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { EventDetailsComponent } from '../event-details/event-details.component';

@Component({
  selector: 'app-my-events',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
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
    MatMenuModule,
    MatDialogModule,
    MatSnackBarModule,
  ],
  templateUrl: './my-events.component.html',
  styleUrls: ['./my-events.component.scss'],
})
export class MyEventsComponent implements OnInit, OnDestroy {
  displayedColumns: string[] = ['title', 'date', 'city', 'categoryName', 'actions'];
  dataSource = new MatTableDataSource<Event>([]);
  pageSize = 10;
  pageIndex = 0;
  totalEvents = 0;
  searchQuery = '';
  category = '';
  manualStartDate: Date | null = null;
  manualEndDate: Date | null = null;
  eventFilter: 'all' | 'past' | 'future' = 'all';
  userId: string | null = null;
  errorMessage: string | null = null;
  categories: string[] = [];
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();
  private eventDialogRef: MatDialogRef<EventDetailsComponent> | null = null;

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private eventService: EventService,
    private authService: AuthService,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.authService.isAuthenticated$.pipe(takeUntil(this.destroy$)).subscribe(isAuth => {
      if (isAuth) {
        const token = this.authService.getToken();
        if (token && typeof token === 'string' && token.split('.').length === 3) {
          try {
            const decodedToken = this.decodeToken(token);
            this.userId = decodedToken ? (decodedToken.userId || decodedToken.sub) : null;
            this.loadEvents();
          } catch (error) {
            console.error('Error decoding token:', error);
            this.userId = null;
            this.errorMessage = 'Unable to load user profile.';
          }
        } else {
          console.error('Invalid or missing token:', token);
          this.userId = null;
          this.errorMessage = 'Authentication token is invalid.';
        }
      } else {
        this.router.navigate(['/login']);
      }
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
    this.cdr.detectChanges();
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

  setEventFilter(filter: 'all' | 'past' | 'future') {
    this.eventFilter = filter;
    this.manualStartDate = null;
    this.manualEndDate = null;
    this.applyFilters();
  }

  onDateChange() {
    if (this.manualStartDate || this.manualEndDate) {
      this.eventFilter = 'all';
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
    this.errorMessage = null;

    let startDate: string | undefined;
    let endDate: string | undefined;

    if (this.manualStartDate && this.manualEndDate) {
      startDate = this.formatDate(this.manualStartDate);
      endDate = this.formatDate(this.manualEndDate);
    }

    const today = new Date('2025-05-21T12:24:00+05:30'); // Updated to May 21, 2025, 12:24 PM IST
    const todayFormatted = this.formatDate(today);

    if (this.eventFilter === 'past') {
      endDate = todayFormatted;
    } else if (this.eventFilter === 'future') {
      startDate = todayFormatted;
    }

    const filters = {
      search: this.searchQuery,
      category: this.category,
      startDate: startDate,
      endDate: endDate,
    };

    console.log('MyEventsComponent: Applying filters:', filters);

    this.eventService.getMyEvents(this.pageIndex + 1, this.pageSize, filters).subscribe({
      next: response => {
        console.log('MyEventsComponent: Loaded events:', response);
        this.dataSource.data = response.events || [];
        this.totalEvents = response.total || 0;
        this.categories = [...new Set(this.dataSource.data.map(event => event.categoryName))].filter(cat => cat);
        this.cdr.markForCheck();
        this.cdr.detectChanges();
        if (this.dataSource.data.length === 0) {
          this.errorMessage = 'No events found for the selected filters.';
        }
        console.log('MyEventsComponent: Updated dataSource:', this.dataSource.data);
      },
      error: err => {
        console.error('MyEventsComponent: Error loading events:', err);
        this.errorMessage = 'Failed to load events. Please try again later.';
        this.cdr.detectChanges();
      },
    });
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`; // e.g., "25-05-21"
  }

  formatDateForDisplay(date: string): string {
    if (date === '0001-01-01') {
      return 'TBD';
    }
    try {
      const [year, month, day] = date.split('-').map(Number);
      const fullYear = year < 100 ? 2000 + year : year;
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

  deleteEvent(id: number) {
    if (confirm('Are you sure you want to delete this event?')) {
      this.eventService.deleteEvent(id).subscribe({
        next: () => {
          console.log(`MyEventsComponent: Event ${id} deleted successfully`);
          this.snackBar.open('Event deleted successfully', 'Close', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            panelClass: ['success-snackbar'],
          });
          this.pageIndex = 0;
          // Close open dialog if it matches the deleted event
          if (this.eventDialogRef && this.eventDialogRef.componentInstance.data.eventId === id) {
            this.eventDialogRef.close();
            this.eventDialogRef = null;
          }
          this.loadEvents();
        },
        error: err => {
          console.error(`MyEventsComponent: Error deleting event ${id}:`, err);
          this.snackBar.open('Failed to delete event. Please try again.', 'Close', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            panelClass: ['error-snackbar'],
          });
          this.cdr.detectChanges();
        },
      });
    }
  }

  editEvent(id: number) {
    this.router.navigate(['/edit-event', id]);
  }

  openEventDetails(event: Event) {
    this.eventDialogRef = this.dialog.open(EventDetailsComponent, {
      data: { eventId: event.id },
      width: '600px',
      maxWidth: '90vw',
      maxHeight: '90vh',
      panelClass: 'event-details-dialog',
      enterAnimationDuration: '300ms',
      exitAnimationDuration: '300ms',
    });

    this.eventDialogRef.afterClosed().subscribe(result => {
      this.eventDialogRef = null;
      if (result) {
        this.loadEvents();
      }
    });
  }
}