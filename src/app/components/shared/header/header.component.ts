import { Component, signal, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { LucideAngularModule, Phone, Clock, MapPin, Search, LogOut } from 'lucide-angular';
import { Observable } from 'rxjs';
import { LoginModalComponent } from '../login-modal/login-modal.component';
import { AuthService, User, AuthResponse } from '../../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, LucideAngularModule, LoginModalComponent],
  templateUrl: './header.component.html'
})
export class HeaderComponent implements OnInit {
  readonly Phone = Phone;
  readonly Clock = Clock;
  readonly MapPin = MapPin;
  readonly Search = Search;
  readonly LogOut = LogOut;

  @ViewChild(LoginModalComponent) loginModal!: LoginModalComponent;

  isLoginModalOpen = signal(false);
  currentUser$!: Observable<User | null>;
  loginAttemptFailed = signal(false);
  loginErrorMessage = signal('');

  navItems = [
    { label: 'Home', id: '', path: '/' },
    { label: 'Services', id: 'services', path: '/services' },
    { label: 'Doctors', id: 'doctors', path: '/doctors' },
    { label: 'About us', id: 'about', path: '/about' },
    { label: 'Contact', id: 'contact', path: '/contact' }
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Subscribe to current user from auth service
    this.currentUser$ = this.authService.currentUser$;
  }

  openLoginModal(): void {
    this.isLoginModalOpen.set(true);
    this.loginErrorMessage.set('');
  }

  closeLoginModal(): void {
    this.isLoginModalOpen.set(false);
    this.loginAttemptFailed.set(false);
    this.loginErrorMessage.set('');
  }

  handleLogin(credentials: { email: string; password: string }): void {
    this.loginAttemptFailed.set(false);
    this.loginErrorMessage.set('');

    this.authService.login(credentials.email, credentials.password).subscribe({
      next: (response: AuthResponse) => {
        if (response.success) {
          this.closeLoginModal();
          // Redirect to dashboard after successful login
          this.router.navigate(['/dashboard']);
        }
      },
      error: (error: any) => {
        this.loginAttemptFailed.set(true);
        const errorMsg = error.error || error.message || 'Invalid email or password';
        this.loginErrorMessage.set(errorMsg);
        if (this.loginModal) {
          this.loginModal.setErrorMessage(errorMsg);
        }
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
