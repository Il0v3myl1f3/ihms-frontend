import { Component, OnInit, inject, ChangeDetectionStrategy, signal, computed, HostListener, DestroyRef, ChangeDetectorRef, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { fromEvent } from 'rxjs';
import { AuthService, User } from '../../../services/auth.service';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { Observable } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AvatarInitialsPipe } from '../../../core/pipes/avatar-initials.pipe';
import { LucideAngularModule, Search, Bell, Settings, Menu } from 'lucide-angular';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [SidebarComponent, LucideAngularModule, RouterModule, AvatarInitialsPipe],
  templateUrl: './dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements OnInit {
  readonly Search = Search;
  readonly Bell = Bell;
  readonly Settings = Settings;
  readonly Menu = Menu;

  isSidebarCollapsed = signal(false);
  isMobileSidebarOpen = signal(false);
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
  private destroyRef = inject(DestroyRef);
  private cdr = inject(ChangeDetectorRef);
  private ngZone = inject(NgZone);

  ngOnInit(): void {
    this.currentUser$ = this.authService.currentUser$;
    this.currentUser$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((user) => {
      this.currentUser = user;
      this.cdr.markForCheck();
      if (!user) {
        this.router.navigate(['/']);
      }
    });

    // Check initial sidebar state
    this.checkSidebarState();

    this.ngZone.runOutsideAngular(() => {
      fromEvent(window, 'resize', { passive: true })
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => this.checkSidebarState());

      fromEvent(document, 'click', { passive: true })
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => {
          if (this.isNotificationOpen()) {
            this.ngZone.run(() => this.isNotificationOpen.set(false));
          }
        });
    });
  }

  private checkSidebarState(): void {
    const width = window.innerWidth;
    if (width < 1280) {
      if (!this.isSidebarCollapsed()) {
        this.ngZone.run(() => this.isSidebarCollapsed.set(true));
      }
    } else {
      if (this.isSidebarCollapsed()) {
        this.ngZone.run(() => this.isSidebarCollapsed.set(false));
      }
    }
  }

  toggleSidebar(): void {
    this.isSidebarCollapsed.update(v => !v);
  }

  toggleMobileSidebar(): void {
    this.isMobileSidebarOpen.update(v => !v);
  }

  toggleNotifications(event: Event): void {
    event.stopPropagation();
    this.isNotificationOpen.update(v => !v);
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
