﻿﻿import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'doctor' | 'admin';
}

export interface Account extends User {
  password: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'current_user';

  // Mock accounts data - embedded for now, will be replaced with backend API later
  private readonly MOCK_ACCOUNTS: Account[] = [
    {
      id: '1',
      email: 'admin@example.com',
      password: 'admin123',
      name: 'Admin User',
      role: 'admin'
    },
    {
      id: '2',
      email: 'doctor@example.com',
      password: 'doctor123',
      name: 'Dr. Jane Smith',
      role: 'doctor'
    },
    {
      id: '3',
      email: 'user@example.com',
      password: 'user123',
      name: 'John Doe',
      role: 'user'
    }
  ];

  private currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.isStoredAuthValid());

  public readonly currentUser$: Observable<User | null> = this.currentUserSubject.asObservable();
  public readonly isAuthenticated$: Observable<boolean> = this.isAuthenticatedSubject.asObservable();

  constructor() {
    this.initializeAuthState();
  }

  /**
   * Initialize auth state from localStorage on service creation
   */
  private initializeAuthState(): void {
    const token = localStorage.getItem(this.TOKEN_KEY);
    const user = this.getUserFromStorage();

    if (token && user) {
      this.currentUserSubject.next(user);
      this.isAuthenticatedSubject.next(true);
    } else {
      this.logout();
    }
  }

  /**
   * Login user with email and password
   */
  public login(email: string, password: string): Observable<AuthResponse> {
    // Simulate async operation with of() and delay
    return of({ accounts: this.MOCK_ACCOUNTS }).pipe(
      map((data) => {
        // Find account matching email and password
        const account = data.accounts.find(
          (acc) => acc.email.toLowerCase() === email.toLowerCase() && acc.password === password
        );

        if (!account) {
          throw new Error('Invalid email or password');
        }

        // Create user object without password
        const user: User = {
          id: account.id,
          email: account.email,
          name: account.name,
          role: account.role
        };

        return { success: true, user };
      }),
      tap((response) => {
        if (response.success && response.user) {
          // Generate a mock token (in real app, this would come from backend)
          const token = this.generateMockToken(response.user);

          // Store token and user
          localStorage.setItem(this.TOKEN_KEY, token);
          localStorage.setItem(this.USER_KEY, JSON.stringify(response.user));

          // Update observables
          this.currentUserSubject.next(response.user);
          this.isAuthenticatedSubject.next(true);
        }
      }),
      catchError((error: any) => {
        let errorMessage = 'Login failed';

        if (error.status === 404) {
          errorMessage = 'Accounts database not found. Please contact support.';
        } else if (error.message) {
          errorMessage = error.message;
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        }

        this.isAuthenticatedSubject.next(false);
        return throwError(() => ({ success: false, error: errorMessage }));
      })
    );
  }

  /**
   * Logout user
   */
  public logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);

    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  /**
   * Get current user synchronously
   */
  public getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Check if user is authenticated
   */
  public isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  /**
   * Get auth token
   */
  public getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Get user from localStorage
   */
  private getUserFromStorage(): User | null {
    try {
      const userJson = localStorage.getItem(this.USER_KEY);
      return userJson ? JSON.parse(userJson) : null;
    } catch {
      return null;
    }
  }

  /**
   * Check if stored authentication is valid
   */
  private isStoredAuthValid(): boolean {
    const token = localStorage.getItem(this.TOKEN_KEY);
    const user = this.getUserFromStorage();
    return !!(token && user);
  }

  /**
   * Generate a mock authentication token
   */
  private generateMockToken(user: User): string {
    // In a real application, this would be a JWT token from the backend
    // For mock purposes, we'll create a simple base64-encoded token
    const tokenData = {
      userId: user.id,
      email: user.email,
      role: user.role,
      iat: Date.now()
    };
    return btoa(JSON.stringify(tokenData));
  }
}

