﻿﻿﻿import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LucideAngularModule, LogOut, ArrowUp, Calendar, User as UserIcon, Clock, CheckCircle, AlertCircle } from 'lucide-angular';
import { AuthService, User } from '../../../services/auth.service';
import { Observable } from 'rxjs';

interface Appointment {
  id: string;
  doctorName: string;
  date: string;
  time: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  specialty: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  readonly LogOut = LogOut;
  readonly ArrowUp = ArrowUp;
  readonly Calendar = Calendar;
  readonly UserIcon = UserIcon;
  readonly Clock = Clock;
  readonly CheckCircle = CheckCircle;
  readonly AlertCircle = AlertCircle;

  currentUser$!: Observable<User | null>;
  currentUser: User | null = null;
  isScrollVisible = false;

  // Mock data for different roles
  mockAppointments: Appointment[] = [
    {
      id: '1',
      doctorName: 'Dr. Sarah Johnson',
      date: '2026-03-10',
      time: '10:00 AM',
      status: 'upcoming',
      specialty: 'Cardiology'
    },
    {
      id: '2',
      doctorName: 'Dr. Michael Chen',
      date: '2026-03-15',
      time: '2:30 PM',
      status: 'upcoming',
      specialty: 'Neurology'
    },
    {
      id: '3',
      doctorName: 'Dr. Emma Watson',
      date: '2026-02-28',
      time: '11:00 AM',
      status: 'completed',
      specialty: 'Dermatology'
    }
  ];

  mockPatients = [
    { id: '1', name: 'John Doe', email: 'john@example.com', lastVisit: '2026-02-15' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', lastVisit: '2026-02-20' },
    { id: '3', name: 'Bob Wilson', email: 'bob@example.com', lastVisit: '2026-02-25' }
  ];

  mockStats = {
    totalAppointments: 12,
    completedAppointments: 8,
    pendingAppointments: 3,
    cancelledAppointments: 1
  };

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser$ = this.authService.currentUser$;
    this.currentUser$.subscribe((user) => {
      this.currentUser = user;
      // If not authenticated, redirect to home
      if (!user) {
        this.router.navigate(['/']);
      }
    });

    // Add scroll listener
    window.addEventListener('scroll', this.onWindowScroll.bind(this));
  }

  onWindowScroll(): void {
    this.isScrollVisible = window.pageYOffset > 300;
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'upcoming':
        return 'status-upcoming';
      case 'completed':
        return 'status-completed';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return '';
    }
  }

  getRoleColor(): string {
    switch (this.currentUser?.role) {
      case 'admin':
        return '#FF6B6B';
      case 'doctor':
        return '#4ECDC4';
      case 'user':
        return '#95E1D3';
      default:
        return '#BFD2F8';
    }
  }

  getUserFirstName(): string {
    if (!this.currentUser?.name) {
      return 'User';
    }
    const firstName = this.currentUser.name.split(' ')[0];
    return firstName || 'User';
  }
}

