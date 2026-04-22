import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { User } from '../models/expense';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private readonly USERS_STORAGE_KEY = 'expense_tracker_users';
  private readonly CURRENT_USER_KEY = 'expense_tracker_current_user';

  currentUser = signal<User | null>(null);
  isLoading = signal(false);
  error = signal<string | null>(null);

  isAuthenticated = computed(() => this.currentUser() !== null);

  constructor() {
    this.initializeAuth();
  }

  private initializeAuth(): void {
    // Check if user is logged in from localStorage
    const storedUserId = localStorage.getItem(this.CURRENT_USER_KEY);
    if (storedUserId) {
      const users = this.getAllUsers();
      const user = users.find(u => u.id === storedUserId);
      if (user) {
        this.currentUser.set(user);
      }
    }
  }

  async register(
    email: string,
    password: string,
    displayName: string
  ): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      // Simulate async operation
      await this.delay(500);

      const users = this.getAllUsers();

      // Check if email already exists
      if (users.some(u => u.email === email)) {
        this.error.set('This email is already registered. Please login or use a different email.');
        this.isLoading.set(false);
        return;
      }

      // Create new user
      const newUser: User = {
        id: this.generateId(),
        email: email,
        displayName: displayName,
        budget: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        password: password, // Store password (in production, use hashing)
      };

      // Save user to localStorage
      users.push(newUser);
      localStorage.setItem(this.USERS_STORAGE_KEY, JSON.stringify(users));

      this.router.navigate(['/login']);
    } catch (err) {
      console.error('Registration error:', err);
      this.error.set('An error occurred. Please try again.');
    } finally {
      this.isLoading.set(false);
    }
  }

  async login(email: string, password: string): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      // Simulate async operation
      await this.delay(500);

      const users = this.getAllUsers();
      const user = users.find(u => u.email === email);

      if (!user) {
        this.error.set('No account found with this email address. Please create a new account first.');
        this.isLoading.set(false);
        return;
      }

      if (user.password !== password) {
        this.error.set('Incorrect password. Please try again.');
        this.isLoading.set(false);
        return;
      }

      // Login successful
      this.currentUser.set(user);
      localStorage.setItem(this.CURRENT_USER_KEY, user.id);
      this.snackBar.open('Login successful!', 'Close', { duration: 3000 });
      this.router.navigate(['/dashboard']);
    } catch (err) {
      console.error('Login error:', err);
      this.error.set('An error occurred. Please try again.');
    } finally {
      this.isLoading.set(false);
    }
  }

  async logout(): Promise<void> {
    try {
      this.currentUser.set(null);
      localStorage.removeItem(this.CURRENT_USER_KEY);
      this.router.navigate(['/login']);
    } catch (err) {
      console.error('Error signing out:', err);
    }
  }

  private getAllUsers(): User[] {
    const data = localStorage.getItem(this.USERS_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  private generateId(): string {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
