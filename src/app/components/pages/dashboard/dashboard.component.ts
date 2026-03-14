import { Component, OnInit, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, User } from '../../../services/auth.service';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { Observable } from 'rxjs';
import { LucideAngularModule, Search, Bell } from 'lucide-angular';
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

  isSidebarCollapsed = signal(false);

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
}
