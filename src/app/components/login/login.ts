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
  selector: 'app-login',
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
    <div class="login-container">
      <mat-card class="login-card">
        <mat-card-header>
          <mat-card-title>Login to Expense Tracker</mat-card-title>
        </mat-card-header>

        <mat-card-content>
          @if (authService.error()) {
            @if (authService.error()?.includes('No account found')) {
              <div class="error-message no-account-error">
                <strong>Account Not Found</strong>
                <p>{{ authService.error() }}</p>
                <p class="create-account-prompt">
                  Don't have an account yet?
                  <a routerLink="/register" class="create-link">Create one now</a>
                </p>
              </div>
            } @else {
              <div class="error-message">{{ authService.error() }}</div>
            }
          }

          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="fill" class="full-width">
              <mat-label>Email</mat-label>
              <input
                matInput
                type="email"
                formControlName="email"
                placeholder="Enter your email"
              />
              @if (
                loginForm.get('email')?.invalid &&
                loginForm.get('email')?.touched
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
                placeholder="Enter your password"
              />
              @if (
                loginForm.get('password')?.invalid &&
                loginForm.get('password')?.touched
              ) {
                <mat-error>Password is required</mat-error>
              }
            </mat-form-field>

            <button
              mat-raised-button
              color="primary"
              type="submit"
              [disabled]="!loginForm.valid || authService.isLoading()"
              class="full-width"
            >
              @if (authService.isLoading()) {
                <mat-spinner diameter="20"></mat-spinner>
              } @else {
                Login
              }
            </button>
          </form>

          <div class="signup-link">
            Don't have an account?
            <a routerLink="/register">Sign up here</a>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: `
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #1e88e5 0%, #1565c0 100%);
    }

    .login-card {
      width: 100%;
      max-width: 400px;
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

    .error-message.no-account-error {
      background-color: #fff3e0;
      border-left: 4px solid #ff9800;
      padding: 15px;
    }

    .error-message.no-account-error strong {
      display: block;
      color: #ff9800;
      margin-bottom: 8px;
      font-size: 15px;
    }

    .error-message.no-account-error p {
      margin: 0;
      color: #333;
      font-size: 14px;
      line-height: 1.5;
    }

    .create-account-prompt {
      margin-top: 12px !important;
      padding-top: 12px;
      border-top: 1px solid #ffe0b2;
      text-align: center;
    }

    .create-link {
      color: #ff9800;
      font-weight: bold;
      text-decoration: none;
      margin-left: 5px;
    }

    .create-link:hover {
      text-decoration: underline;
    }

    .signup-link {
      text-align: center;
      margin-top: 20px;
      font-size: 14px;
    }

    .signup-link a {
      color: #667eea;
      text-decoration: none;
      margin-left: 5px;
    }

    .signup-link a:hover {
      text-decoration: underline;
    }
  `,
})
export class LoginComponent {
  authService = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);

  loginForm: FormGroup;

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  async onSubmit(): Promise<void> {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      try {
        await this.authService.login(email, password);
        // Success message is now handled in the auth service
      } catch (error) {
        this.snackBar.open('Login failed. Please try again.', 'Close', {
          duration: 3000,
        });
      }
    }
  }
}
