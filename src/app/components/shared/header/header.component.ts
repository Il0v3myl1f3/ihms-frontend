import { Component, signal, inject, ViewChild, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { LucideAngularModule, Phone, Clock, MapPin, Search, Menu, X } from 'lucide-angular';
import { Observable } from 'rxjs';
import { LoginModalComponent } from '../login-modal/login-modal.component';
import { AuthService, User, AuthResponse } from '../../../services/auth.service';

@Component({
  selector: 'app-header',
  imports: [AsyncPipe, RouterLink, RouterLinkActive, LucideAngularModule, LoginModalComponent],
  templateUrl: './header.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent implements OnInit {
  readonly Phone = Phone;
  readonly Clock = Clock;
  readonly MapPin = MapPin;
  readonly Search = Search;
  readonly Menu = Menu;
  readonly X = X;

  menuOpen = false;

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu(): void {
    this.menuOpen = false;
  }

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

  private authService = inject(AuthService);
  private router = inject(Router);

  ngOnInit(): void {
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
          this.router.navigate(['/dashboard']);
        }
      },
      error: (error: unknown) => {
        this.loginAttemptFailed.set(true);
        const err = error as { error?: string; message?: string };
        const errorMsg = err.error || err.message || 'Invalid email or password';
        this.loginErrorMessage.set(errorMsg);
        if (this.loginModal) {
          this.loginModal.setErrorMessage(errorMsg);
        }
      }
    });
  }
}
