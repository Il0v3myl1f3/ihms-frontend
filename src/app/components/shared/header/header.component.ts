import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LucideAngularModule, Phone, Clock, MapPin, Search } from 'lucide-angular';

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

  navItems = [
    { label: 'Home', id: '', path: '/' }
  ];
}
