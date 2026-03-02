import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LucideAngularModule, Phone, Clock, MapPin, Search, LogOut } from 'lucide-angular';
import { Observable, of } from 'rxjs';

// Temporary user interface for Step 1
interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'doctor' | 'admin';
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, LucideAngularModule],
  templateUrl: './header.component.html'
})
export class HeaderComponent {
  readonly Phone = Phone;
  readonly Clock = Clock;
  readonly MapPin = MapPin;
  readonly Search = Search;
  readonly LogOut = LogOut;

  isLoginModalOpen = signal(false);
  currentUser$: Observable<User | null> = of(null);

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
  }
}
