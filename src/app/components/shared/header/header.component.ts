import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LucideAngularModule, Phone, Clock, MapPin, Search, Menu } from 'lucide-angular';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, LucideAngularModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  readonly Phone = Phone;
  readonly Clock = Clock;
  readonly MapPin = MapPin;
  readonly Search = Search;
  readonly Menu = Menu;

  menuOpen = false;

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu(): void {
    this.menuOpen = false;
  }

  navItems = [
    { label: 'Home', id: '', path: '/' },
    { label: 'Services', id: 'services', path: '/services' },
    { label: 'Doctors', id: 'doctors', path: '/doctors' },
    { label: 'About us', id: 'about', path: '/about' },
    { label: 'Contact', id: 'contact', path: '/contact' }
  ];
}
