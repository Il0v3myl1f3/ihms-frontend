import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { AuthService, User } from '../../../../services/auth.service';
import { LucideAngularModule, Users, Stethoscope, CalendarDays, CreditCard, FileText, Activity, ClipboardList, Heart, DoorOpen, BedDouble } from 'lucide-angular';

@Component({
    selector: 'app-dashboard-home',
    standalone: true,
    imports: [CommonModule, LucideAngularModule],
    templateUrl: './dashboard-home.component.html',
    styleUrls: ['./dashboard-home.component.css']
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

    constructor(private authService: AuthService) { }

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

