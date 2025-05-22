import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Event } from '../models/event.model';
import { enviroment } from '../../environments/environment';
import { ApiResponseModel } from '../models/api-response.model';

@Injectable({
  providedIn: 'root',
})
export class EventService {
  private apiUrl = enviroment.apiUrl + '/api/event';

  constructor(private http: HttpClient) {}

  getEvents(page: number, pageSize: number, filters: any): Observable<{ events: Event[], total: number }> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (filters.search) {
      params = params.set('search', filters.search);
    }
    if (filters.category) {
      params = params.set('category', filters.category);
    }
    if (filters.location) {
      params = params.set('city', filters.location);
    }
    if (filters.startDate) {
      params = params.set('startDate', filters.startDate);
    }
    if (filters.endDate) {
      params = params.set('endDate', filters.endDate);
    }

    return this.http.get<ApiResponseModel<{ events: Event[], total: number }>>(this.apiUrl, { params }).pipe(
      map(response => {
        if (!response.Success) {
          throw new Error(response.Message || 'Failed to fetch events');
        }
        return response.Data; 
      }),
      catchError(error => {
        console.error('Error fetching events:', error);
        console.error('Request URL:', `${this.apiUrl}?${params.toString()}`);
        console.error('Error details:', error.message || error);
        return throwError(() => new Error('Failed to fetch events'));
      })
    );
  }
  getMyEvents(page: number, pageSize: number, filters: any): Observable<{ events: Event[], total: number }> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());
  
    if (filters.search) {
      params = params.set('search', filters.search);
    }
    if (filters.category) {
      params = params.set('category', filters.category);
    }
    if (filters.startDate) {
      params = params.set('startDate', filters.startDate);
    }
    if (filters.endDate) {
      params = params.set('endDate', filters.endDate);
    }
  
    return this.http.get<ApiResponseModel<{ events: Event[], total: number }>>(`${this.apiUrl}/my`, { params }).pipe(
      map(response => {
        if (!response.Success) {
          throw new Error(response.Message || 'Failed to fetch events');
        }
        return response.Data;
      }),
      catchError(error => {
        console.error('Error fetching my events:', error);
        return throwError(() => new Error('Failed to fetch my events'));
      })
    );
  }

  getEventById(id: number): Observable<Event> {
    return this.http.get<ApiResponseModel<Event>>(`${this.apiUrl}/${id}`).pipe(
      map(response => {
        if (!response.Success) {
          throw new Error(response.Message || 'Failed to fetch event');
        }
        return response.Data;
      }),
      catchError(error => {
        console.error('Error fetching event:', error);
        return throwError(() => new Error('Failed to fetch event'));
      })
    );
  }

  createEvent(eventData: any): Observable<Event> {
    return this.http.post<ApiResponseModel<Event>>(`${this.apiUrl}/AddEvent`, eventData).pipe(
      map(response => {
        if (!response.Success) {
          throw new Error(response.Message || 'Failed to create event');
        }
        return response.Data;
      }),
      catchError(error => {
        console.error('Error creating event:', error);
        return throwError(() => error);
      })
    );
  }

  updateEvent(id: number, eventData: any): Observable<Event> {
    return this.http.put<ApiResponseModel<Event>>(`${this.apiUrl}/${id}`, eventData).pipe(
      map(response => {
        if (!response.Success) {
          throw new Error(response.Message || 'Failed to update event');
        }
        return response.Data;
      }),
      catchError(error => {
        console.error('Error updating event:', error);
        return throwError(() => error);
      })
    );
  }

  deleteEvent(id: number): Observable<void> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`).pipe(
      map(response => {
        if (response.Success) {
          return;
        }
        throw new Error(response.Message || 'Failed to delete event');
      }),
      catchError(error => {
        console.error('Error deleting event:', error);
        return throwError(() => new Error('Failed to delete event'));
      })
    );
  }
}