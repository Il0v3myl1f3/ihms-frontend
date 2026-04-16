import { Component, OnInit, OnDestroy, input, output, ChangeDetectionStrategy, signal, computed, HostListener, effect, untracked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Pencil, Trash2, MoreHorizontal, Search, Filter, ChevronLeft, ChevronRight, Plus, ChevronDown, ChevronUp, Eye } from 'lucide-angular';

export interface Appointment {
    id: string;
    no: number;
    patientId: string;
    patientName: string;
    doctorId: string;
    doctorName: string;
    notes: string;
    reason: string;
    doctorImage: string;
    appointmentDate: string;
    status: 'Scheduled' | 'Cancelled' | 'Completed';
    selected: boolean;
}

@Component({
    selector: 'app-appointment-table',
    imports: [FormsModule, LucideAngularModule, CommonModule],
    templateUrl: './appointment-table.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        '(document:click)': 'closeDropdown()'
    }
})
export class AppointmentTableComponent implements OnInit, OnDestroy {
    appointments = input<Appointment[]>([]);
    compactMode = input<boolean>(false);
    showReason = input<boolean>(false);
    readOnly = input<boolean>(false);
    editAppointment = output<Appointment>();
    deleteAppointment = output<Appointment>();
    deleteSelected = output<Appointment[]>();
    addAppointment = output<void>();
    viewAppointment = output<Appointment>();

    readonly Pencil = Pencil;
    readonly Trash2 = Trash2;
    readonly MoreHorizontal = MoreHorizontal;
    readonly Search = Search;
    readonly Filter = Filter;
    readonly ChevronLeft = ChevronLeft;
    readonly ChevronRight = ChevronRight;
    readonly Plus = Plus;
    readonly ChevronDown = ChevronDown;
    readonly ChevronUp = ChevronUp;
    readonly Eye = Eye;

    activeItem: Appointment | null = null;
    dropdownPos = { top: 0, right: 0 };
    isPageSizeMenuOpen = false;

    selectAll = false;
    currentPage = signal(1);
    pageSize = signal(7);
    searchQuery = signal('');
    sortColumn = signal<string>('no');
    sortDirection = signal<'asc' | 'desc'>('asc');
    filterStatus = signal<string>('All');
    filterDoctor = signal<string>('All');
    activeFilterMenu = signal<string | null>(null);

    availableStatuses = computed(() => {
        const statuses = this.appointments().map(a => a.status).filter(s => !!s);
        return ['All', ...Array.from(new Set(statuses)).sort()];
    });

    availableDoctors = computed(() => {
        const docs = this.appointments().map(a => a.doctorName).filter(s => !!s);
        return ['All', ...Array.from(new Set(docs)).sort()];
    });

    constructor() {
        effect(() => {
            this.searchQuery();
            untracked(() => this.currentPage.set(1));
        });
    }

    filteredAppointments = computed(() => {
        const query = this.searchQuery().toLowerCase().trim();
        let result = this.appointments();

        const statFilter = this.filterStatus();
        if (statFilter !== 'All') {
            result = result.filter(a => a.status === statFilter);
        }

        const docFilter = this.filterDoctor();
        if (docFilter !== 'All') {
            result = result.filter(a => a.doctorName === docFilter);
        }

        if (query) {
            result = result.filter(a =>
                a.patientName.toLowerCase().includes(query) ||
                a.doctorName.toLowerCase().includes(query) ||
                a.reason.toLowerCase().includes(query) ||
                a.notes.toLowerCase().includes(query) ||
                a.appointmentDate.toLowerCase().includes(query) ||
                a.status.toLowerCase().includes(query) ||
                a.no.toString().includes(query)
            );
        }

        const col = this.sortColumn();
        const dir = this.sortDirection() === 'asc' ? 1 : -1;

        if (col) {
            result = [...result].sort((a, b) => {
                let aVal: any = a[col as keyof Appointment];
                let bVal: any = b[col as keyof Appointment];

                if (aVal < bVal) return -1 * dir;
                if (aVal > bVal) return 1 * dir;
                return 0;
            });
        }

        return result;
    });

    handleSort(column: string): void {
        if (this.sortColumn() === column) {
            this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
        } else {
            this.sortColumn.set(column);
            this.sortDirection.set('asc');
        }
        this.currentPage.set(1);
    }

    ngOnInit(): void {
        this.checkResponsiveSettings();
    }

    changePageSize(size: number | string): void {
        this.pageSize.set(Number(size));
        this.currentPage.set(1);
        this.isPageSizeMenuOpen = false;
    }

    closeDropdown(): void {
        this.activeItem = null;
        this.isPageSizeMenuOpen = false;
        this.activeFilterMenu.set(null);
    }

    toggleFilterMenu(menu: string, event: Event): void {
        event.stopPropagation();
        this.activeFilterMenu.set(this.activeFilterMenu() === menu ? null : menu);
        this.activeItem = null;
        this.isPageSizeMenuOpen = false;
    }

    setFilter(type: 'status' | 'doctor', value: string): void {
        if (type === 'status') this.filterStatus.set(value);
        if (type === 'doctor') this.filterDoctor.set(value);
        this.activeFilterMenu.set(null);
        this.currentPage.set(1);
    }

    togglePageSizeMenu(event: Event): void {
        event.stopPropagation();
        this.isPageSizeMenuOpen = !this.isPageSizeMenuOpen;
        this.activeItem = null;
    }

    toggleDropdown(appointment: Appointment, event: Event): void {
        event.stopPropagation();
        if (this.activeItem?.id === appointment.id) {
            this.activeItem = null;
            return;
        }
        const btn = (event.currentTarget as HTMLElement).getBoundingClientRect();
        this.dropdownPos = { top: btn.bottom + 4, right: window.innerWidth - btn.right };
        this.activeItem = appointment;
    }

    ngOnDestroy(): void { }

    @HostListener('window:scroll')
    onWindowScroll(): void {
        this.activeItem = null;
    }

    @HostListener('window:resize')
    onResize(): void {
        this.checkResponsiveSettings();
    }

    private checkResponsiveSettings(): void {
        if (window.innerWidth < 1024) {
            if (this.pageSize() !== 7) {
                this.pageSize.set(7);
            }
        }
    }

    toggleSelectAll(): void {
        this.appointments().forEach(a => a.selected = this.selectAll);
    }

    updateSelectAllState(): void {
        this.selectAll = this.appointments().every(a => a.selected);
    }

    get hasSelectedAppointments(): boolean {
        return this.appointments().some(a => a.selected);
    }

    totalPages = computed(() => {
        return Math.max(1, Math.ceil(this.filteredAppointments().length / this.pageSize()));
    });

    paginatedAppointments = computed(() => {
        const startIndex = (this.currentPage() - 1) * this.pageSize();
        return this.filteredAppointments().slice(startIndex, startIndex + this.pageSize());
    });

    visiblePages = computed(() => {
        const total = this.totalPages();
        const current = this.currentPage();
        if (total <= 5) {
            return Array.from({ length: total }, (_, i) => i + 1);
        }

        if (current <= 3) {
            return [1, 2, 3, '...', total];
        } else if (current >= total - 2) {
            return [1, '...', total - 2, total - 1, total];
        } else {
            return [1, '...', current, '...', total];
        }
    });

    goToPage(page: number | string): void {
        if (typeof page === 'number' && page >= 1 && page <= this.totalPages() && page !== this.currentPage()) {
            this.currentPage.set(page);
        }
    }

    nextPage(): void {
        if (this.currentPage() < this.totalPages()) {
            this.currentPage.update(p => p + 1);
        }
    }

    prevPage(): void {
        if (this.currentPage() > 1) {
            this.currentPage.update(p => p - 1);
        }
    }

    onEdit(appointment: Appointment): void {
        this.editAppointment.emit(appointment);
    }

    onView(appointment: Appointment): void {
        this.viewAppointment.emit(appointment);
    }

    onDelete(appointment: Appointment): void {
        if (confirm(`Are you sure you want to delete appointment #${appointment.no}?`)) {
            this.deleteAppointment.emit(appointment);
        }
    }

    onDeleteSelected(): void {
        const selected = this.appointments().filter(a => a.selected);
        if (selected.length === 0) return;
        if (confirm(`Are you sure you want to delete ${selected.length} selected appointment(s)?`)) {
            this.deleteSelected.emit(selected);
            this.selectAll = false;
        }
    }

    getStatusClasses(status: string): string {
        switch (status) {
            case 'Scheduled': return 'bg-blue-50 text-blue-700';
            case 'Cancelled': return 'bg-red-50 text-red-600';
            case 'Completed': return 'bg-emerald-50 text-emerald-700';
            default: return 'bg-gray-50 text-gray-700';
        }
    }
}
