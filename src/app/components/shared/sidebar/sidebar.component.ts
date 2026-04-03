import { Component, OnInit, OnDestroy, inject, ChangeDetectionStrategy, input, output } from '@angular/core';
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
    LucideIconData,
    Lock,
    Plus,
    ChevronDown,
    Pill,
    FolderHeart,
    ClipboardList,
} from 'lucide-angular';

import { AuthService, User } from '../../../services/auth.service';
import { Subscription } from 'rxjs';

export interface MenuItem {
    label: string;
    icon: LucideIconData;
    route?: string;
    action?: () => void;
    /** Roles that can see this item. If omitted, visible to all roles. */
    roles?: string[];
}

export interface MenuSection {
    title: string;
    items: MenuItem[];
}

@Component({
    selector: 'app-sidebar',
    imports: [RouterModule, LucideAngularModule],
    templateUrl: './sidebar.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SidebarComponent implements OnInit, OnDestroy {
    // Icons
    readonly ChevronLeft = ChevronLeft;
    readonly LogOut = LogOut;
    readonly HelpCircle = HelpCircle;
    readonly Lock = Lock;
    readonly Plus = Plus;


    // State (Managed by parent)
    collapsed = input(false);
    mobileOpen = input(false);
    onToggle = output<void>();
    onMenuClick = output<void>();

    // Full menu definition with role restrictions
    private readonly allMenuSections: MenuSection[] = [
        {
            title: 'Menu',
            items: [
                { label: 'Dashboard', icon: LayoutDashboard, route: '/dashboard' },
                { label: 'Appointments', icon: CalendarDays, route: '/dashboard/appointments' },
                { label: 'Room', icon: DoorOpen, route: '/dashboard/room', roles: ['admin'] },
                { label: 'Payment', icon: CreditCard, route: '/dashboard/payment', roles: ['admin', 'user'] },
            ],
        },
        {
            title: 'Management',
            items: [
                { label: 'Doctor', icon: Stethoscope, route: '/dashboard/doctors', roles: ['admin'] },
                { label: 'Patient', icon: Users, route: '/dashboard/patient', roles: ['admin', 'doctor'] },
                { label: 'Inpatient', icon: BedDouble, route: '/dashboard/inpatient', roles: ['admin', 'doctor'] },
            ],
        },
        {
            title: 'Health',
            items: [
                { label: 'Prescriptions', icon: Pill, route: '/dashboard/prescriptions', roles: ['user'] },
                { label: 'Medical Records', icon: FolderHeart, route: '/dashboard/medical-records', roles: ['user'] },
            ],
        },
    ];

    /** Filtered menu sections visible to the current user */
    menuSections: MenuSection[] = [];

    bottomItems: MenuItem[] = [
        { label: 'Help Center', icon: HelpCircle },
    ];

    private userSub?: Subscription;
    private router = inject(Router);
    private authService = inject(AuthService);

    ngOnInit(): void {
        this.userSub = this.authService.currentUser$.subscribe((user) => {
            this.menuSections = this.filterMenuByRole(user);
        });
    }

    ngOnDestroy(): void {
        this.userSub?.unsubscribe();
    }

    toggleCollapse(): void {
        this.onToggle.emit();
    }

    logout(): void {
        this.authService.logout();
        this.router.navigate(['/']);
    }

    /**
     * Filters menu sections based on the user's role.
     * Removes items the user cannot access and hides sections that become empty.
     */
    private filterMenuByRole(user: User | null): MenuSection[] {
        const role = user?.role ?? 'user';

        return this.allMenuSections
            .map((section) => ({
                title: section.title,
                items: section.items.filter(
                    (item) => !item.roles || item.roles.includes(role)
                ),
            }))
            .filter((section) => section.items.length > 0);
    }
}
