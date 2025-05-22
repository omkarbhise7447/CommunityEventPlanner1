import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { RSVP } from '../models/rsvp.model';
import { Attendee } from '../models/attendee.model';
import { Event } from '../models/event.model';
import { enviroment } from '../../environments/environment';
import { ApiResponseModel } from '../models/api-response.model';

@Injectable({
  providedIn: 'root',
})
export class RsvpService {
  private apiUrl = enviroment.apiUrl + '/api/RSVP';

  constructor(private http: HttpClient) {}

  rsvpEvent(eventId: number): Observable<void> {
    return this.http.post<ApiResponseModel<null>>(`${this.apiUrl}/${eventId}`, {}).pipe(
      map(response => {
        if (!response.Success) {
          throw new Error(response.Message || 'Failed to RSVP');
        }
        return;
      }),
      catchError(error => {
        console.error('Error RSVPing:', error);
        return throwError(() => error);
      })
    );
  }

  cancelRsvp(eventId: number): Observable<void> {
    return this.http.delete<ApiResponseModel<null>>(`${this.apiUrl}/${eventId}`).pipe(
      map(response => {
        if (!response.Success) {
          throw new Error(response.Message || 'Failed to cancel RSVP');
        }
        return;
      }),
      catchError(error => {
        console.error('Error canceling RSVP:', error);
        return throwError(() => error);
      })
    );
  }

  getMyRsvps(): Observable<RSVP[]> {
    return this.http.get<ApiResponseModel<{ result: RSVP[] }>>(`${this.apiUrl}/my`).pipe(
      map(response => {
        if (!response.Success) {
          throw new Error(response.Message || 'Failed to fetch RSVPs');
        }
        return response.Data.result || [];
      }),
      catchError(error => {
        console.error('Error fetching RSVPs:', error);
        return throwError(() => new Error('Failed to fetch RSVPs'));
      })
    );
  }

  getMyRsvpedEvents(page: number, pageSize: number, filters: any): Observable<{ events: Event[]; total: number }> {
    const params: any = {
      page,
      pageSize,
      ...filters,
    };
    return this.http.get<ApiResponseModel<{ events: Event[]; total: number }>>(`${this.apiUrl}/my-upcoming-events`, { params }).pipe(
      map(response => {
        if (!response.Success) {
          throw new Error(response.Message || 'Failed to fetch RSVP\'d events');
        }
        return response.Data;
      }),
      catchError(error => {
        console.error('Error fetching RSVP\'d events:', error);
        return throwError(() => new Error('Failed to fetch RSVP\'d events'));
      })
    );
  }

  getAttendees(eventId: number): Observable<Attendee[]> {
    return this.http.get<ApiResponseModel<{ result: Attendee[] }>>(`${this.apiUrl}/event/${eventId}`).pipe(
      map(response => {
        if (!response.Success) {
          throw new Error(response.Message || 'Failed to fetch attendees');
        }
        return response.Data.result || [];
      }),
      catchError(error => {
        console.error('Error fetching attendees:', error);
        return throwError(() => new Error('Failed to fetch attendees'));
      })
    );
  }
}