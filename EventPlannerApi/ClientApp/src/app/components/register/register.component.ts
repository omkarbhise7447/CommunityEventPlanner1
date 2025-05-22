import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
    MatIconModule,
    RouterLink
  ],
  animations: [
    trigger('fadeIn', [
      state('void', style({ opacity: 0, transform: 'translateY(20px)' })),
      transition(':enter', [
        animate('600ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6), Validators.pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit() {
    this.registerForm.reset();
  }

  passwordMatchValidator(form: FormGroup) {
    
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  togglePasswordVisibility(field: string) {
    if (field === 'password') {
      this.showPassword = !this.showPassword;
      const inputElement = document.querySelector('input[formControlName="password"]') as HTMLInputElement;
      inputElement.type = this.showPassword ? 'text' : 'password';
    } else {
      this.showConfirmPassword = !this.showConfirmPassword;
      const inputElement = document.querySelector('input[formControlName="confirmPassword"]') as HTMLInputElement;
      inputElement.type = this.showConfirmPassword ? 'text' : 'password';
    }
  }

  onSubmit() {
    if (this.registerForm.valid) {
      const { username, email, password } = this.registerForm.value;
      this.authService.register({ username, email, password }).subscribe({
        next: (response) => {
          if (response.Success) {
            if (response.Data && response.Data.token) {
              // If the backend provides a token, auto-login and redirect to /events
              this.snackBar.open('Registration successful! You are now logged in.', 'Close', { duration: 5000 });
              setTimeout(() => {
                this.router.navigate(['/events']);
              }, 100);
            } else {
              // If no token is provided, redirect to login
              this.snackBar.open('Registration successful! Please log in.', 'Close', { duration: 5000 });
              setTimeout(() => {
                this.router.navigate(['/login']);
              }, 100);
            }
          } else {
            this.snackBar.open(response.Message || 'Registration failed', 'Close', { duration: 5000 });
          }
        },
        error: (err: Error) => {
          console.error('Registration error:', err);
          this.snackBar.open(err.message || 'Registration failed', 'Close', { duration: 5000 });
        }
      });
    }
  }
}