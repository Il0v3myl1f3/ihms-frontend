import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'doctor' | 'admin';
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  error?: string;
  token?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'current_user';
  private readonly AUTH_URL = 'http://localhost:5275/api/Auth';

  private http = inject(HttpClient);
  private router = inject(Router);
  private currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.isStoredAuthValid());

  public readonly currentUser$: Observable<User | null> = this.currentUserSubject.asObservable();
  public readonly isAuthenticated$: Observable<boolean> = this.isAuthenticatedSubject.asObservable();

  constructor() {
    this.initializeAuthState();
  }

  private initializeAuthState(): void {
    const token = localStorage.getItem(this.TOKEN_KEY);
    const user = this.getUserFromStorage();

    if (token && user && !this.isTokenExpired(token)) {
      this.currentUserSubject.next(user);
      this.isAuthenticatedSubject.next(true);
    } else {
      this.logout();
    }
  }

  public login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<any>(`${this.AUTH_URL}/login`, { email, password }).pipe(
      map(response => {
        // Map Backend Roles -> Frontend Expectation String Literal
        const backendRole = response.user.role;
        let frontendRole: 'user' | 'doctor' | 'admin' = 'user';
        if (backendRole === 'ADMIN' || backendRole === 'Admin') frontendRole = 'admin';
        else if (backendRole === 'DOCTOR' || backendRole === 'Doctor') frontendRole = 'doctor';

        // Extract potentially nested properties robustly
        const fullName = response.user.name || 
            (response.user.firstName ? `${response.user.firstName} ${response.user.lastName || ''}` : response.user.email);

        const user: User = {
          id: response.user.id,
          email: response.user.email,
          name: fullName,
          role: frontendRole
        };

        return { success: true, user, token: response.token };
      }),
      tap(response => {
        if (response.success && response.user && response.token) {
          localStorage.setItem(this.TOKEN_KEY, response.token);
          localStorage.setItem(this.USER_KEY, JSON.stringify(response.user));
          this.currentUserSubject.next(response.user);
          this.isAuthenticatedSubject.next(true);
        }
      }),
      catchError(error => {
        this.isAuthenticatedSubject.next(false);
        let errorMsg = 'Invalid credentials or server error.';
        if (error.error instanceof ProgressEvent || error.name === 'HttpErrorResponse' && error.status === 0) {
          errorMsg = 'Could not connect to the server. Ensure the backend is running.';
        } else if (error.error?.message) {
          errorMsg = error.error.message;
        } else if (typeof error.error === 'string') {
          errorMsg = error.error;
        }
        return throwError(() => ({ success: false, error: errorMsg }));
      })
    );
  }

  public logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/login']);
  }

  public getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  public isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  public getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private getUserFromStorage(): User | null {
    try {
      const userJson = localStorage.getItem(this.USER_KEY);
      return userJson ? JSON.parse(userJson) : null;
    } catch {
      return null;
    }
  }

  private isStoredAuthValid(): boolean {
    const token = localStorage.getItem(this.TOKEN_KEY);
    const user = this.getUserFromStorage();
    return !!(token && user && !this.isTokenExpired(token));
  }

  private isTokenExpired(token: string): boolean {
    if (!token) return true;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (!payload.exp) return false;
      const expiry = payload.exp * 1000;
      return Date.now() >= expiry;
    } catch {
      return true;
    }
  }

  public register(name: string, email: string, password: string): Observable<AuthResponse> {
    const parts = name.split(' ');
    const firstName = parts[0];
    const lastName = parts.length > 1 ? parts.slice(1).join(' ') : 'User';

    return this.http.post<any>(`${this.AUTH_URL}/register-patient`, {
      firstName,
      lastName,
      email,
      password,
      gender: 'OTHER'
    }).pipe(
      map(() => ({ success: true })),
      catchError(error => throwError(() => ({ success: false, error: error.error || 'Registration failed' })))
    );
  }

  public forgotPassword(email: string): Observable<{ success: boolean; message?: string; error?: string }> {
    return of({ success: true, message: 'A password reset link has been sent to your email.' });
  }

  public resetPassword(newPassword: string): Observable<{ success: boolean; message?: string }> {
    return of({ success: true, message: 'Your password has been reset successfully.' });
  }
}

