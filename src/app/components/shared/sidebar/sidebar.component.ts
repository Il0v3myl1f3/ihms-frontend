import { Component, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import {
    LucideAngularModule,
    LayoutDashboard,
    CalendarDays,
    DoorOpen,
    CreditCard,
    Stethoscope,
    Users,
    BedDouble,
    UserCog,
    Settings,
    HelpCircle,
    LogOut,
    ChevronLeft,
} from 'lucide-angular';
import { AuthService } from '../../../services/auth.service';

export interface MenuItem {
    label: string;
    icon: any;
    route?: string;
    action?: () => void;
}

export interface MenuSection {
    title: string;
    items: MenuItem[];
}

@Component({
    selector: 'app-sidebar',
    standalone: true,
    imports: [CommonModule, RouterModule, LucideAngularModule],
    templateUrl: './sidebar.component.html',
    styleUrl: './sidebar.component.css',
})
export class SidebarComponent {
    // Icons
    readonly ChevronLeft = ChevronLeft;
    readonly LogOut = LogOut;
    readonly HelpCircle = HelpCircle;

    // State
    collapsed = signal(false);
    activeItem = signal('Dashboard');

    // Menu sections
    menuSections: MenuSection[] = [
        {
            title: 'Menu',
            items: [
                { label: 'Dashboard', icon: LayoutDashboard, route: '/dashboard' },
                { label: 'Appointment', icon: CalendarDays, route: '/dashboard' },
                { label: 'Room', icon: DoorOpen, route: '/dashboard' },
                { label: 'Payment', icon: CreditCard, route: '/dashboard' },
            ],
        },
        {
            title: 'Management',
            items: [
                { label: 'Doctor', icon: Stethoscope, route: '/dashboard' },
                { label: 'Patient', icon: Users, route: '/dashboard' },
                { label: 'Inpatient', icon: BedDouble, route: '/dashboard' },
            ],
        },
        {
            title: 'Setting',
            items: [
                { label: 'User', icon: UserCog, route: '/dashboard' },
                { label: 'Settings', icon: Settings, route: '/dashboard' },
            ],
        },
    ];

    bottomItems: MenuItem[] = [
        { label: 'Help Center', icon: HelpCircle },
    ];

    constructor(
        private router: Router,
        private authService: AuthService,
    ) { }

    toggleCollapse(): void {
        this.collapsed.update((v) => !v);
    }

    setActive(item: MenuItem): void {
        this.activeItem.set(item.label);
    }

    logout(): void {
        this.authService.logout();
        this.router.navigate(['/']);
    }
}
