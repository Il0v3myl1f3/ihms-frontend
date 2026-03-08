import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { AuthService, User } from '../../../../services/auth.service';

@Component({
    selector: 'app-dashboard-home',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './dashboard-home.component.html',
    styleUrls: ['./dashboard-home.component.css']
})
export class DashboardHomeComponent implements OnInit {
    currentUser$!: Observable<User | null>;
    currentUser: User | null = null;

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
}
