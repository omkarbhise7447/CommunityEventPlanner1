import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
  ],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
})
export class LayoutComponent implements OnInit {
  isAuthenticated = false;
  userEmail: string | null = null;
  isMobileMenuOpen = false;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.authService.isAuthenticated$.subscribe(auth => {
      this.isAuthenticated = auth;
      if (auth) {
        const token = this.authService.getToken();
        if (token && typeof token === 'string' && token.split('.').length === 3) {
          try {
            const decodedToken = this.decodeToken(token);
            console.log('Decoded Token:', decodedToken); // Debug the token payload
            // Try different fields that might contain the email
            this.userEmail = decodedToken?.email || decodedToken?.sub || decodedToken?.name || 'User';
          } catch (error) {
            console.error('Error decoding token:', error);
            this.userEmail = 'User'; // Fallback if decoding fails
          }
        } else {
          console.error('Invalid or missing token:', token);
          this.userEmail = 'User'; // Fallback if token is invalid
        }
      } else {
        this.userEmail = null;
      }
    });
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

  logout() {
    this.authService.logout();
    this.isMobileMenuOpen = false;
    this.router.navigate(['/login']);
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false;
  }
}