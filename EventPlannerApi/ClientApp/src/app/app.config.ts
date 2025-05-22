import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { AuthInterceptor } from './services/auth.interceptor';
import { AuthGuard } from './gaurds/auth.guard';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter([
      { path: 'login', loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent) },
      { path: 'register', loadComponent: () => import('./components/register/register.component').then(m => m.RegisterComponent) },
      {
        path: '',
        loadComponent: () => import('./components/layout/layout.component').then(m => m.LayoutComponent),
        children: [
          { path: 'events', loadComponent: () => import('./components/event-list/event-list.component').then(m => m.EventListComponent) },
          { 
            path: 'event/:id', 
            loadComponent: () => import('./components/event-details/event-details.component').then(m => m.EventDetailsComponent),
            children: [
              { path: 'attendees', loadComponent: () => import('./components/attendee-list/attendee-list.component').then(m => m.AttendeeListComponent) }
            ]
          },
          { 
            path: 'my-events', 
            loadComponent: () => import('./components/my-evnets/my-events.component').then(m => m.MyEventsComponent),
            canActivate: [AuthGuard]
          },
          // {
          //   path: 'my-upcoming-events', // Add this route
          //   loadComponent: () => import('./components/my-upcoming-event/my-upcoming-events.component').then(m => m.MyUpcomingEventsComponent),
          //   canActivate: [AuthGuard]
          // },
          { 
            path: 'create-event', 
            loadComponent: () => import('./components/create-event/create-event.component').then(m => m.CreateEventComponent),
            canActivate: [AuthGuard]
          },
          { 
            path: 'edit-event/:id', 
            loadComponent: () => import('./components/edit-event/edit-event.component').then(m => m.EditEventComponent),

            canActivate: [AuthGuard]
            
          },
          { 
            path: 'events-to-attend', 
            loadComponent: () => import('./components/events-to-attend/events-to-attend.component').then(m => m.EventsToAttendComponent),

            canActivate: [AuthGuard]
            
          },
          { path: 'forgot-password', redirectTo: '/login' },
          { path: '', redirectTo: '/events', pathMatch: 'full' }
        ]
      },
      { path: '**', redirectTo: '/events' }
    ]),
    provideHttpClient(
      withInterceptors([AuthInterceptor])
    ),
    provideAnimations(),
    importProvidersFrom([
      MatNativeDateModule,
      MatDatepickerModule,
      MatPaginatorModule,
      MatFormFieldModule,
      MatInputModule,
      MatSelectModule,
      MatButtonModule,
      MatIconModule
    ])
  ]
};