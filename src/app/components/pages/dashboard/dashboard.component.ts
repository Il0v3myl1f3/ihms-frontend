import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService, User } from '../../../services/auth.service';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, SidebarComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  currentUser$!: Observable<User | null>;
  currentUser: User | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.currentUser$ = this.authService.currentUser$;
    this.currentUser$.subscribe((user) => {
      this.currentUser = user;
      if (!user) {
        this.router.navigate(['/']);
      }
    });
  }

  getUserFirstName(): string {
    if (!this.currentUser?.name) return 'User';
    return this.currentUser.name.split(' ')[0] || 'User';
  }
}
