import { Component, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LucideAngularModule, Phone, Clock, MapPin, Search, LogOut } from 'lucide-angular';
import { Observable, of } from 'rxjs';
import { LoginModalComponent } from '../login-modal/login-modal.component';

// Temporary user interface for Step 2
interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'doctor' | 'admin';
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, LucideAngularModule, LoginModalComponent],
  templateUrl: './header.component.html'
})
export class HeaderComponent {
  readonly Phone = Phone;
  readonly Clock = Clock;
  readonly MapPin = MapPin;
  readonly Search = Search;
  readonly LogOut = LogOut;

  @ViewChild(LoginModalComponent) loginModal!: LoginModalComponent;

  isLoginModalOpen = signal(false);
  currentUser$: Observable<User | null> = of(null);
  loginAttemptFailed = signal(false);

  navItems = [
    { label: 'Home', id: '', path: '/' },
    { label: 'Services', id: 'services', path: '/services' },
    { label: 'Doctors', id: 'doctors', path: '/doctors' },
    { label: 'About us', id: 'about', path: '/about' },
    { label: 'Contact', id: 'contact', path: '/contact' }
  ];

  openLoginModal(): void {
    this.isLoginModalOpen.set(true);
  }

  closeLoginModal(): void {
    this.isLoginModalOpen.set(false);
    this.loginAttemptFailed.set(false);
  }

  handleLogin(credentials: { email: string; password: string }): void {
    // TODO: Connect to AuthService in Step 3
    // For now, show error handling placeholder
    console.log('Login attempt with:', credentials);
  }
}
