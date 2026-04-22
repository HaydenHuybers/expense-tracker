import { Injectable, inject, signal, computed } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  AuthError,
} from '@angular/fire/auth';
import { Firestore, collection, doc, setDoc, getDoc } from '@angular/fire/firestore';
import { User } from '../models/expense';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private router = inject(Router);

  currentUser = signal<User | null>(null);
  isLoading = signal(false);
  error = signal<string | null>(null);

  isAuthenticated = computed(() => this.currentUser() !== null);

  constructor() {
    this.initializeAuth();
  }

  private initializeAuth(): void {
    onAuthStateChanged(this.auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDocRef = doc(this.firestore, 'users', firebaseUser.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            this.currentUser.set({
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: userData['displayName'] || '',
              photoURL: firebaseUser.photoURL || undefined,
              budget: userData['budget'] || 0,
              createdAt: userData['createdAt']?.toDate() || new Date(),
              updatedAt: userData['updatedAt']?.toDate() || new Date(),
            });
          }
        } catch (err) {
          console.error('Error fetching user data:', err);
          this.currentUser.set(null);
        }
      } else {
        this.currentUser.set(null);
      }
    });
  }

  async register(
    email: string,
    password: string,
    displayName: string
  ): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        this.auth,
        email,
        password
      );

      // Update profile
      await updateProfile(userCredential.user, {
        displayName: displayName,
      });

      // Create user document in Firestore
      const userRef = doc(this.firestore, 'users', userCredential.user.uid);
      await setDoc(userRef, {
        displayName: displayName,
        email: email,
        budget: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      this.currentUser.set({
        id: userCredential.user.uid,
        email: email,
        displayName: displayName,
        budget: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      this.router.navigate(['/dashboard']);
    } catch (err) {
      const authError = err as AuthError;
      this.error.set(this.getErrorMessage(authError.code));
    } finally {
      this.isLoading.set(false);
    }
  }

  async login(email: string, password: string): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      await signInWithEmailAndPassword(this.auth, email, password);
      this.router.navigate(['/dashboard']);
    } catch (err) {
      const authError = err as AuthError;
      this.error.set(this.getErrorMessage(authError.code));
    } finally {
      this.isLoading.set(false);
    }
  }

  async logout(): Promise<void> {
    try {
      await signOut(this.auth);
      this.currentUser.set(null);
      this.router.navigate(['/login']);
    } catch (err) {
      console.error('Error signing out:', err);
    }
  }

  private getErrorMessage(code: string): string {
    const errorMessages: { [key: string]: string } = {
      'auth/email-already-in-use':
        'This email is already registered. Please login or use a different email.',
      'auth/weak-password': 'Password should be at least 6 characters long.',
      'auth/invalid-email': 'Please enter a valid email address.',
      'auth/user-not-found': 'No account found with this email address.',
      'auth/wrong-password': 'Incorrect password. Please try again.',
    };

    return errorMessages[code] || 'An error occurred. Please try again.';
  }
}
