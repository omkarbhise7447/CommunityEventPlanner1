// import { Component, OnInit, OnDestroy } from '@angular/core';
// import { EventService } from '../../services/event.service';
// import { Event } from '../../models/event.model';
// import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
// import { AuthService } from '../../services/auth.service';
// import { MatButtonModule } from '@angular/material/button';
// import { CommonModule } from '@angular/common';
// import { Router } from '@angular/router';
// import { Subject, takeUntil } from 'rxjs';
// import { EventCardComponent } from '../event-card/event-card.component';

// @Component({
//   selector: 'app-upcoming-events',
//   standalone: true,
//   imports: [
//     CommonModule,
//     MatPaginatorModule,
//     MatButtonModule,
//     EventCardComponent
//   ],
//   template: `
//     <div class="header">
//       <h2>Upcoming Events</h2>
//       <div class="time-filters">
//         <button mat-raised-button [color]="timeFilter === 'today' ? 'primary' : 'basic'" (click)="setTimeFilter('today')">Today</button>
//         <button mat-raised-button [color]="timeFilter === 'week' ? 'primary' : 'basic'" (click)="setTimeFilter('week')">This Week</button>
//         <button mat-raised-button [color]="timeFilter === 'month' ? 'primary' : 'basic'" (click)="setTimeFilter('month')">This Month</button>
//       </div>
//     </div>
//     <div *ngIf="errorMessage" class="error-message">
//       {{ errorMessage }}
//     </div>
//     <div class="event-grid" *ngIf="!errorMessage">
//       <app-event-card
//         *ngFor="let event of events"
//         [event]="event"
//         [isCreator]="isCreator(event)"
//         [showEditDelete]="false"
//         (viewEvent)="viewEvent($event)">
//       </app-event-card>
//     </div>
//     <mat-paginator [pageSizeOptions]="[5, 10, 20]" [pageSize]="pageSize" [length]="totalEvents" (page)="onPageChange($event)" *ngIf="!errorMessage"></mat-paginator>
//   `,
//   styles: [`
//     :host {
//       --primary-color: #c084fc;
//       --primary-hover: #a855f7;
//     }

//     .header {
//       max-width: 1200px;
//       margin: 20px auto;
//       padding: 0 16px;
//     }

//     .header h2 {
//       color: #333;
//       font-size: 1.8rem;
//       font-weight: 500;
//       margin-bottom: 16px;
//     }

//     .time-filters {
//       display: flex;
//       gap: 10px;
//       margin-bottom: 16px;
//     }

//     .time-filters button {
//       transition: all 0.3s ease;
//     }

//     .time-filters button[color="primary"] {
//       background: var(--primary-color);
//       color: white;
//     }

//     .time-filters button[color="primary"]:hover {
//       background: var(--primary-hover);
//     }

//     .error-message {
//       max-width: 1200px;
//       margin: 20px auto;
//       padding: 10px;
//       background: #f8d7da;
//       color: #721c24;
//       border: 1px solid #f5c6cb;
//       border-radius: 5px;
//       text-align: center;
//     }

//     .event-grid {
//       display: grid;
//       grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
//       gap: 20px;
//       padding: 16px;
//       max-width: 1200px;
//       margin: 0 auto;
//     }

//     mat-paginator {
//       max-width: 1200px;
//       margin: 16px auto;
//     }

//     @media (max-width: 768px) {
//       .event-grid {
//         grid-template-columns: 1fr;
//         padding: 8px;
//       }

//       .header h2 {
//         font-size: 1.5rem;
//       }

//       .time-filters {
//         flex-wrap: wrap;
//         gap: 8px;
//       }

//       .time-filters button {
//         flex: 1 1 auto;
//         min-width: 100px;
//       }
//     }
//   `]
// })
// export class UpcomingEventsComponent implements OnInit, OnDestroy {
//   events: Event[] = [];
//   pageSize = 10;
//   pageIndex = 0;
//   totalEvents = 0;
//   userId: string | null = null;
//   errorMessage: string | null = null;
//   timeFilter: 'today' | 'week' | 'month' = 'month'; // Default to "This Month"
//   private destroy$ = new Subject<void>();

//   constructor(
//     private eventService: EventService,
//     private authService: AuthService,
//     private router: Router
//   ) {}

//   ngOnInit() {
//     this.authService.isAuthenticated$.pipe(takeUntil(this.destroy$)).subscribe(isAuth => {
//       if (isAuth) {
//         const token = this.authService.getToken();
//         if (token && typeof token === 'string' && token.split('.').length === 3) {
//           try {
//             const decodedToken = this.decodeToken(token);
//             this.userId = decodedToken ? (decodedToken.userId || decodedToken.sub) : null;
//             this.loadEvents();
//           } catch (error) {
//             console.error('Error decoding token:', error);
//             this.userId = null;
//             this.errorMessage = 'Unable to load user profile.';
//           }
//         } else {
//           console.error('Invalid or missing token:', token);
//           this.userId = null;
//           this.errorMessage = 'Authentication token is invalid.';
//         }
//       } else {
//         this.router.navigate(['/login']);
//       }
//     });
//   }

//   ngOnDestroy() {
//     this.destroy$.next();
//     this.destroy$.complete();
//   }

//   private decodeToken(token: string): any {
//     try {
//       const base64Url = token.split('.')[1];
//       const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
//       const padding = base64.length % 4;
//       const paddedBase64 = padding ? base64 + '='.repeat(4 - padding) : base64;
//       const jsonPayload = decodeURIComponent(
//         atob(paddedBase64)
//           .split('')
//           .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
//           .join('')
//       );
//       return JSON.parse(jsonPayload);
//     } catch (error) {
//       console.error('Error in decodeToken:', error);
//       return null;
//     }
//   }

//   setTimeFilter(filter: 'today' | 'week' | 'month') {
//     this.timeFilter = filter;
//     this.pageIndex = 0;
//     this.loadEvents();
//   }

//   loadEvents() {
//     if (!this.userId) {
//       this.errorMessage = 'User ID not found. Please log in again.';
//       return;
//     }
//     this.errorMessage = null;

//     const filters: any = {};
//     const today = new Date(); // Today is May 18, 2025, based on system date
//     let startDate: string;
//     let endDate: string;

//     if (this.timeFilter === 'today') {
//       startDate = today.toISOString().split('T')[0]; // e.g., "2025-05-18"
//       endDate = startDate;
//     } else if (this.timeFilter === 'week') {
//       startDate = today.toISOString().split('T')[0];
//       const endOfWeek = new Date(today);
//       endOfWeek.setDate(today.getDate() + (7 - today.getDay())); // End of week (Saturday)
//       endDate = endOfWeek.toISOString().split('T')[0];
//     } else {
//       // This Month
//       startDate = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-01`;
//       const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
//       endDate = endOfMonth.toISOString().split('T')[0];
//     }

//     filters.startDate = startDate;
//     filters.endDate = endDate;

//     this.eventService.getEvents(this.userId, this.pageIndex + 1, this.pageSize, filters).subscribe({
//       next: response => {
//         this.events = response.events;
//         this.totalEvents = response.total;
//       },
//       error: err => {
//         console.error('Error loading upcoming events:', err);
//         this.errorMessage = 'Failed to load upcoming events. Please try again later.';
//       }
//     });
//   }

//   onPageChange(event: PageEvent) {
//     this.pageIndex = event.pageIndex;
//     this.pageSize = event.pageSize;
//     this.loadEvents();
//   }

//   isCreator(event: Event): boolean {
//     return event.user.userId === this.userId;
//   }

//   viewEvent(id: number) {
//     this.router.navigate(['/event', id]);
//   }
// }