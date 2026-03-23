import { Component, OnInit, OnDestroy, input, output, ChangeDetectionStrategy, signal, computed, HostListener, effect, untracked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Search, Filter, MoreHorizontal, ChevronLeft, ChevronRight, Pencil, Trash2, Plus, ChevronDown, ChevronUp, Eye } from 'lucide-angular';
import { Doctor } from '../../../../../services/medical.service';

export interface DoctorRow extends Doctor {
    no: number;
    selected: boolean;
}

@Component({
    selector: 'app-doctor-table',
    imports: [CommonModule, FormsModule, LucideAngularModule],
    templateUrl: './doctor-table.component.html',
    styleUrl: './doctor-table.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        '(document:click)': 'closeDropdown()'
    }
})
export class DoctorTableComponent implements OnInit, OnDestroy {
    doctors = input<DoctorRow[]>([]);
    editDoctor = output<DoctorRow>();
    deleteDoctor = output<DoctorRow>();
    deleteSelected = output<DoctorRow[]>();
    viewDoctor = output<DoctorRow>();
    addDoctor = output<void>();

    readonly Search = Search;
    readonly Filter = Filter;
    readonly MoreHorizontal = MoreHorizontal;
    readonly ChevronLeft = ChevronLeft;
    readonly ChevronRight = ChevronRight;
    readonly Pencil = Pencil;
    readonly Trash2 = Trash2;
    readonly Plus = Plus;
    readonly ChevronDown = ChevronDown;
    readonly ChevronUp = ChevronUp;
    readonly Eye = Eye;

    activeItem: DoctorRow | null = null;
    dropdownPos = { top: 0, right: 0 };
    isPageSizeMenuOpen = false;

    selectAll = false;
    currentPage = signal(1);
    pageSize = signal(7);
    searchQuery = signal('');
    sortColumn = signal<string>('no');
    sortDirection = signal<'asc' | 'desc'>('asc');
    filterSpecialty = signal<string>('All');
    filterStatus = signal<string>('All');
    activeFilterMenu = signal<string | null>(null);

    availableSpecialties = computed(() => {
        const specs = this.doctors().map(d => d.specialty).filter(s => !!s);
        return ['All', ...Array.from(new Set(specs)).sort()];
    });

    availableStatuses = computed(() => {
        const statuses = this.doctors().map(d => d.availability).filter(s => !!s);
        return ['All', ...Array.from(new Set(statuses)).sort()];
    });

    constructor() {
        effect(() => {
            this.searchQuery();
            untracked(() => this.currentPage.set(1));
        });
    }

    filteredDoctors = computed(() => {
        const query = this.searchQuery().toLowerCase().trim();
        let result = this.doctors();

        const specFilter = this.filterSpecialty();
        if (specFilter !== 'All') {
            result = result.filter(d => d.specialty === specFilter);
        }

        const statFilter = this.filterStatus();
        if (statFilter !== 'All') {
            result = result.filter(d => d.availability === statFilter);
        }

        if (query) {
            result = result.filter(doc =>
                doc.name.toLowerCase().includes(query) ||
                doc.specialty.toLowerCase().includes(query) ||
                (doc.phone?.toLowerCase().includes(query)) ||
                (doc.availability?.toLowerCase().includes(query)) ||
                doc.no.toString().includes(query) ||
                doc.id.toString().includes(query)
            );
        }

        const col = this.sortColumn();
        const dir = this.sortDirection() === 'asc' ? 1 : -1;

        if (col) {
            result = [...result].sort((a, b) => {
                let aVal: any = a[col as keyof DoctorRow];
                let bVal: any = b[col as keyof DoctorRow];

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

    setFilter(type: 'specialty' | 'status', value: string): void {
        if (type === 'specialty') this.filterSpecialty.set(value);
        if (type === 'status') this.filterStatus.set(value);
        this.activeFilterMenu.set(null);
        this.currentPage.set(1);
    }

    togglePageSizeMenu(event: Event): void {
        event.stopPropagation();
        this.isPageSizeMenuOpen = !this.isPageSizeMenuOpen;
        this.activeItem = null;
    }

    toggleDropdown(doc: DoctorRow, event: Event): void {
        event.stopPropagation();
        if (this.activeItem?.id === doc.id) {
            this.activeItem = null;
            return;
        }
        const btn = (event.currentTarget as HTMLElement).getBoundingClientRect();
        this.dropdownPos = { top: btn.bottom + 4, right: window.innerWidth - btn.right };
        this.activeItem = doc;
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
        this.doctors().forEach(d => d.selected = this.selectAll);
    }

    updateSelectAllState(): void {
        this.selectAll = this.doctors().every(d => d.selected);
    }

    get hasSelectedDoctors(): boolean {
        return this.doctors().some(d => d.selected);
    }

    totalPages = computed(() => {
        return Math.max(1, Math.ceil(this.filteredDoctors().length / this.pageSize()));
    });

    paginatedDoctors = computed(() => {
        const startIndex = (this.currentPage() - 1) * this.pageSize();
        return this.filteredDoctors().slice(startIndex, startIndex + this.pageSize());
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

    getAvatarInitialsName(name: string): string {
        return name.replace('Dr. ', '').replace(' ', '+');
    }

    onEdit(doctor: DoctorRow): void {
        this.editDoctor.emit(doctor);
    }

    onView(doctor: DoctorRow): void {
        this.viewDoctor.emit(doctor);
    }

    onDelete(doctor: DoctorRow): void {
        if (confirm(`Are you sure you want to delete Dr. "${doctor.name}"?`)) {
            this.deleteDoctor.emit(doctor);
        }
    }

    onDeleteSelected(): void {
        const selected = this.doctors().filter(d => d.selected);
        if (selected.length === 0) return;
        if (confirm(`Are you sure you want to delete ${selected.length} selected doctor(s)?`)) {
            this.deleteSelected.emit(selected);
            this.selectAll = false;
        }
    }

    getStatusClasses(status: string | undefined): string {
        switch (status) {
            case 'Available': return 'bg-emerald-50 text-emerald-700';
            case 'On Leave': return 'bg-red-50 text-red-600';
            default: return 'bg-gray-50 text-gray-700';
        }
    }
}
