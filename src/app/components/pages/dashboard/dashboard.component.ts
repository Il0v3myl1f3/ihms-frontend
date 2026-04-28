import { Component, OnInit, inject, ChangeDetectionStrategy, signal, computed, HostListener, DestroyRef, ChangeDetectorRef, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { fromEvent, switchMap } from 'rxjs';
import { AuthService, User } from '../../../services/auth.service';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { Observable } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AvatarInitialsPipe } from '../../../core/pipes/avatar-initials.pipe';
import { LucideAngularModule, Search, Settings, Menu } from 'lucide-angular';
import { RouterModule } from '@angular/router';
import { PatientService } from '../../../services/patient.service';
import { MedicalService } from '../../../services/medical.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [SidebarComponent, LucideAngularModule, RouterModule, AvatarInitialsPipe],
  templateUrl: './dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements OnInit {
  readonly Search = Search;
  readonly Settings = Settings;
  readonly Menu = Menu;

  isSidebarCollapsed = signal(false);
  isMobileSidebarOpen = signal(false);

  currentUser$!: Observable<User | null>;
  currentUser: User | null = null;
  displayName = signal<string>('');

  private authService = inject(AuthService);
  private patientService = inject(PatientService);
  private medicalService = inject(MedicalService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  private cdr = inject(ChangeDetectorRef);
  private ngZone = inject(NgZone);

  ngOnInit(): void {
    this.currentUser$ = this.authService.currentUser$;
    this.currentUser$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((user) => {
      this.currentUser = user;
      if (user) {
        this.displayName.set(user.name || user.email);
        this.loadUserProfile(user);
      }
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

  private loadUserProfile(user: User): void {
    if (user.role === 'user') {
      this.patientService.getMyPatientId().pipe(
        switchMap((id: string) => this.patientService.getPatientById(id)),
        takeUntilDestroyed(this.destroyRef)
      ).subscribe({
        next: (patient: any) => {
          if (patient && (patient.firstName || patient.lastName)) {
            const fullName = `${patient.firstName} ${patient.lastName}`.trim();
            this.displayName.set(fullName);
            this.cdr.markForCheck();
          }
        }
      });
    } else if (user.role === 'doctor') {
      this.medicalService.getDoctors().pipe(
        takeUntilDestroyed(this.destroyRef)
      ).subscribe({
        next: (doctors) => {
          const doctor = doctors.find(d => d.email.toLowerCase() === user.email.toLowerCase());
          if (doctor && (doctor.firstName || doctor.lastName)) {
            const fullName = `${doctor.firstName} ${doctor.lastName}`.trim();
            this.displayName.set(fullName);
            this.cdr.markForCheck();
          }
        }
      });
    } else if (user.role === 'admin') {
      this.displayName.set('System Administrator');
      this.cdr.markForCheck();
    }
  }
}
