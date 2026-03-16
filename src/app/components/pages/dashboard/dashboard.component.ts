import { Component, OnInit, inject, ChangeDetectionStrategy, signal, computed, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, User } from '../../../services/auth.service';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { Observable } from 'rxjs';
import { LucideAngularModule, Search, Bell, Settings } from 'lucide-angular';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [SidebarComponent, LucideAngularModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements OnInit {
  readonly Search = Search;
  readonly Bell = Bell;
  readonly Settings = Settings;

  isSidebarCollapsed = signal(false);
  isNotificationOpen = signal(false);

  notifications = signal([
    { id: 1, text: 'New appointment scheduled by John Doe', time: '2m ago', read: false },
    { id: 2, text: 'Dr. Smith updated medical records', time: '1h ago', read: false },
    { id: 3, text: 'System maintenance scheduled for tonight', time: '5h ago', read: true },
    { id: 4, text: 'Weekly report generated successfully', time: '1d ago', read: true }
  ]);

  unreadCount = computed(() => this.notifications().filter(n => !n.read).length);

  currentUser$!: Observable<User | null>;
  currentUser: User | null = null;

  private authService = inject(AuthService);
  private router = inject(Router);

  ngOnInit(): void {
    this.currentUser$ = this.authService.currentUser$;
    this.currentUser$.subscribe((user) => {
      this.currentUser = user;
      if (!user) {
        this.router.navigate(['/']);
      }
    });
  }

  toggleSidebar(): void {
    this.isSidebarCollapsed.update(v => !v);
  }

  toggleNotifications(event: Event): void {
    event.stopPropagation();
    this.isNotificationOpen.update(v => !v);
  }

  @HostListener('document:click')
  closeNotifications(): void {
    if (this.isNotificationOpen()) {
      this.isNotificationOpen.set(false);
    }
  }

  markAsRead(id: number, event: Event): void {
    event.stopPropagation();
    this.notifications.update(nots => nots.map(n => n.id === id ? { ...n, read: true } : n));
  }

  markAllAsRead(event: Event): void {
    event.stopPropagation();
    this.notifications.update(nots => nots.map(n => ({ ...n, read: true })));
  }
}
