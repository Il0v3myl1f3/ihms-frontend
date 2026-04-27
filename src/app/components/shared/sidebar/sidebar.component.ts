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
    FlaskConical,
    CalendarPlus,
    ClipboardCheck,
    Microscope,
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
            ],
        },
        {
            title: 'Management',
            items: [
                { label: 'Doctor', icon: Stethoscope, route: '/dashboard/doctors', roles: ['admin'] },
                { label: 'Patient', icon: Users, route: '/dashboard/patient', roles: ['admin', 'doctor'] },
            ],
        },
        {
            title: 'Health',
            items: [
                { label: 'Prescriptions', icon: Pill, route: '/dashboard/prescriptions', roles: ['user'] },
                { label: 'Medical Records', icon: FolderHeart, route: '/dashboard/medical-records', roles: ['user'] },
            ],
        },
        {
            title: 'Laboratory',
            items: [
                { label: 'Lab Availability', icon: FlaskConical, route: '/dashboard/laboratory' },
                { label: 'Schedule Analysis', icon: CalendarPlus, route: '/dashboard/schedule-analysis' },
                { label: 'Analysis Results', icon: ClipboardCheck, route: '/dashboard/analysis-results' },
                { label: 'Lab Equipment', icon: Microscope, route: '/dashboard/lab-equipment', roles: ['admin'] },
            ],
        },
    ];

    /** Filtered menu sections visible to the current user */
    menuSections: MenuSection[] = [];

    /** Filtered bottom items visible to the current user */
    filteredBottomItems: MenuItem[] = [];

    bottomItems: MenuItem[] = [
        { label: 'Help Center', icon: HelpCircle, route: '/dashboard/help-center', roles: ['user'] },
    ];

    private userSub?: Subscription;
    public router = inject(Router);
    private authService = inject(AuthService);

    ngOnInit(): void {
        this.userSub = this.authService.currentUser$.subscribe((user) => {
            this.menuSections = this.filterMenuByRole(user);
            this.filteredBottomItems = this.filterBottomItemsByRole(user);
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

    /**
     * Filters bottom items based on the user's role.
     */
    private filterBottomItemsByRole(user: User | null): MenuItem[] {
        const role = user?.role ?? 'user';
        return this.bottomItems.filter(
            (item) => !item.roles || item.roles.includes(role)
        );
    }

    isMobileScreen(): boolean {
        return window.innerWidth < 1024;
    }
}
