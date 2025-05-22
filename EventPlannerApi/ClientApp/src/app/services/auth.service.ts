import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { enviroment } from '../../environments/environment';
import { throwError } from 'rxjs';

// Define the expected response structure
interface AuthResponse {
  Success: boolean;
  Data: {
    token: string;
  };
  Message: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = enviroment.apiUrl + '/api/auth';
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.checkAuthStatus();
  }

  register(user: { username: string; email: string; password: string }): Observable<AuthResponse> {
    return this.http.post(`${this.apiUrl}/register`, user, { responseType: 'text' }).pipe(
      map((response: string) => {
        console.log('Raw register response:', response); 
        
        return {
          Success: true, 
          Message: response || 'User registered successfully'
        } as AuthResponse;
      }),
      tap((response: AuthResponse) => {
        console.log('Mapped register response:', response);
        
      }),
      catchError(this.handleError)
    );
  }

  login(credentials: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap((response: AuthResponse) => {
        if (response.Success && response.Data && response.Data.token) {
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('token', response.Data.token);
            this.isAuthenticatedSubject.next(true);
          }
        } else {
          throw new Error('Token not found in response');
        }
      }),
      catchError(this.handleError)
    );
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
    }
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/login']);
  }

  checkAuthStatus() {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('token');
      this.isAuthenticatedSubject.next(!!token);
    } else {
      this.isAuthenticatedSubject.next(false);
    }
  }

  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('token');
    }
    return null;
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred';
    if (error.status === 0) {
      errorMessage = 'Cannot connect to the server. Please ensure the backend is running.';
    } else if (error.status === 401) {
      errorMessage = 'Invalid email or password';
    } else if (error.status === 400) {
      errorMessage = error.error?.Message || 'Bad request';
    } else if (error.error && error.error.Message) {
      errorMessage = error.error.Message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    return throwError(() => new Error(errorMessage));
  }
}