import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService, User } from '../../../../services/auth.service';
import { LucideAngularModule, Users, Stethoscope, CalendarDays, CreditCard, FileText, Activity, ClipboardList, Heart, DoorOpen, BedDouble, Clock, MapPin, Pill } from 'lucide-angular';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-dashboard-home',
    imports: [LucideAngularModule, RouterModule],
    templateUrl: './dashboard-home.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardHomeComponent implements OnInit {
    currentUser$!: Observable<User | null>;
    currentUser: User | null = null;

    // Icons
    readonly Users = Users;
    readonly Stethoscope = Stethoscope;
    readonly CalendarDays = CalendarDays;
    readonly CreditCard = CreditCard;
    readonly FileText = FileText;
    readonly Activity = Activity;
    readonly ClipboardList = ClipboardList;
    readonly Heart = Heart;
    readonly DoorOpen = DoorOpen;
    readonly BedDouble = BedDouble;
    readonly Clock = Clock;
    readonly MapPin = MapPin;
    readonly Pill = Pill;

    // Data for user dashboard
    upcomingAppointment = {
        day: '22',
        month: 'Mar',
        title: 'General Checkup',
        time: '10:00 AM — 10:30 AM',
        doctorName: 'Dr. Mia Kensington',
        cabinet: 'Cabinet 3, Floor 2'
    };

    activePrescriptions = [
        { name: 'Lisinopril', dosage: '10mg · Once daily', doctor: 'Dr. Benjamin Carter' },
        { name: 'Metformin', dosage: '850mg · 2x/day', doctor: 'Dr. Elijah Stone' },
        { name: 'Omeprazole', dosage: '20mg · Once daily', doctor: 'Dr. Clara Whitmore' },
    ];

    private authService = inject(AuthService);

    ngOnInit(): void {
        this.currentUser$ = this.authService.currentUser$;
        this.currentUser$.subscribe((user) => {
            this.currentUser = user;
        });
    }

    getUserFirstName(): string {
        if (!this.currentUser?.name) return 'User';
        return this.currentUser.name.split(' ')[0] || 'User';
    }

    get userRole(): string {
        return this.currentUser?.role ?? 'user';
    }
}
