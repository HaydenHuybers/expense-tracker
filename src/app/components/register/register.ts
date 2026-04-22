import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  template: `
    <div class="register-container">
      <mat-card class="register-card">
        <mat-card-header>
          <mat-card-title>Create Account</mat-card-title>
          <mat-card-subtitle>Join Expense Tracker Today</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          @if (authService.error()) {
            <div class="error-message">{{ authService.error() }}</div>
          }

          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="fill" class="full-width">
              <mat-label>Full Name</mat-label>
              <input
                matInput
                type="text"
                formControlName="displayName"
                placeholder="Enter your full name"
              />
              @if (
                registerForm.get('displayName')?.invalid &&
                registerForm.get('displayName')?.touched
              ) {
                <mat-error>Name is required</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="fill" class="full-width">
              <mat-label>Email</mat-label>
              <input
                matInput
                type="email"
                formControlName="email"
                placeholder="Enter your email"
              />
              @if (
                registerForm.get('email')?.invalid &&
                registerForm.get('email')?.touched
              ) {
                <mat-error>Please enter a valid email</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="fill" class="full-width">
              <mat-label>Password</mat-label>
              <input
                matInput
                type="password"
                formControlName="password"
                placeholder="Enter your password (min 6 characters)"
              />
              @if (
                registerForm.get('password')?.invalid &&
                registerForm.get('password')?.touched
              ) {
                <mat-error>Password must be at least 6 characters</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="fill" class="full-width">
              <mat-label>Confirm Password</mat-label>
              <input
                matInput
                type="password"
                formControlName="confirmPassword"
                placeholder="Confirm your password"
              />
              @if (
                registerForm.get('confirmPassword')?.invalid &&
                registerForm.get('confirmPassword')?.touched
              ) {
                <mat-error>Passwords must match</mat-error>
              }
            </mat-form-field>

            <button
              mat-raised-button
              color="primary"
              type="submit"
              [disabled]="!registerForm.valid || authService.isLoading()"
              class="full-width"
            >
              @if (authService.isLoading()) {
                <mat-spinner diameter="20"></mat-spinner>
              } @else {
                Create Account
              }
            </button>
          </form>

          <div class="login-link">
            Already have an account?
            <a routerLink="/login">Login here</a>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: `
    .register-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #1e88e5 0%, #1565c0 100%);
    }

    .register-card {
      width: 100%;
      max-width: 450px;
      padding: 20px;
    }

    mat-card-header {
      margin-bottom: 20px;
    }

    mat-form-field {
      margin-bottom: 20px;
    }

    .full-width {
      width: 100%;
    }

    .error-message {
      color: #f44336;
      padding: 10px;
      margin-bottom: 15px;
      background-color: #ffebee;
      border-radius: 4px;
    }

    .login-link {
      text-align: center;
      margin-top: 20px;
      font-size: 14px;
    }

    .login-link a {
      color: #667eea;
      text-decoration: none;
      margin-left: 5px;
    }

    .login-link a:hover {
      text-decoration: underline;
    }
  `,
})
export class RegisterComponent {
  authService = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);

  registerForm: FormGroup;

  constructor() {
    this.registerForm = this.fb.group(
      {
        displayName: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  passwordMatchValidator(form: FormGroup): { [key: string]: boolean } | null {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  async onSubmit(): Promise<void> {
    if (this.registerForm.valid) {
      const { email, password, displayName } = this.registerForm.value;
      try {
        await this.authService.register(email, password, displayName);
        this.snackBar.open('Account created successfully!', 'Close', {
          duration: 3000,
        });
      } catch (error) {
        this.snackBar.open(
          'Registration failed. Please try again.',
          'Close',
          { duration: 3000 }
        );
      }
    }
  }
}
