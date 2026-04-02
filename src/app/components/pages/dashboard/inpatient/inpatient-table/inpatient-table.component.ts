import { Component, OnInit, OnDestroy, input, output, ChangeDetectionStrategy, signal, computed, HostListener, effect, untracked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Pencil, Trash2, MoreHorizontal, Search, Filter, ChevronLeft, ChevronRight, Plus, ChevronDown, ChevronUp, Eye } from 'lucide-angular';

export interface Inpatient {
    id: number;
    no: number;
    patientName: string;
    roomNumber: string;
    doctorName: string;
    admissionDate: string;
    dischargeDate: string;
    status: 'Admitted' | 'Discharged' | 'Transferred' | 'Critical';
    diagnosis: string;
    selected: boolean;
}

@Component({
    selector: 'app-inpatient-table',
    imports: [FormsModule, LucideAngularModule, CommonModule],
    templateUrl: './inpatient-table.component.html',
    styleUrl: './inpatient-table.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        '(document:click)': 'closeDropdown()'
    }
})
export class InpatientTableComponent implements OnInit, OnDestroy {
    inpatients = input<Inpatient[]>([]);
    editInpatient = output<Inpatient>();
    deleteInpatient = output<Inpatient>();
    deleteSelected = output<Inpatient[]>();
    addInpatient = output<void>();

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

    activeItem: Inpatient | null = null;
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
        const statuses = this.inpatients().map(i => i.status).filter(s => !!s);
        return ['All', ...Array.from(new Set(statuses)).sort()];
    });

    availableDoctors = computed(() => {
        const doctors = this.inpatients().map(i => i.doctorName).filter(s => !!s);
        return ['All', ...Array.from(new Set(doctors)).sort()];
    });

    constructor() {
        effect(() => {
            this.searchQuery();
            untracked(() => this.currentPage.set(1));
        });
    }

    filteredInpatients = computed(() => {
        const query = this.searchQuery().toLowerCase().trim();
        let result = this.inpatients();

        const statusFilter = this.filterStatus();
        if (statusFilter !== 'All') {
            result = result.filter(i => i.status === statusFilter);
        }

        const doctorFilter = this.filterDoctor();
        if (doctorFilter !== 'All') {
            result = result.filter(i => i.doctorName === doctorFilter);
        }

        if (query) {
            result = result.filter(i =>
                i.patientName.toLowerCase().includes(query) ||
                i.roomNumber.toLowerCase().includes(query) ||
                i.doctorName.toLowerCase().includes(query) ||
                i.diagnosis.toLowerCase().includes(query) ||
                i.admissionDate.toLowerCase().includes(query) ||
                i.dischargeDate.toLowerCase().includes(query) ||
                i.status.toLowerCase().includes(query) ||
                i.no.toString().includes(query)
            );
        }

        const col = this.sortColumn();
        const dir = this.sortDirection() === 'asc' ? 1 : -1;

        if (col) {
            result = [...result].sort((a, b) => {
                let aVal: any = a[col as keyof Inpatient];
                let bVal: any = b[col as keyof Inpatient];

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

    closeDropdown() {
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

    toggleDropdown(inpatient: Inpatient, event: Event): void {
        event.stopPropagation();
        if (this.activeItem?.id === inpatient.id) {
            this.activeItem = null;
            return;
        }
        const btn = (event.currentTarget as HTMLElement).getBoundingClientRect();
        this.dropdownPos = { top: btn.bottom + 4, right: window.innerWidth - btn.right };
        this.activeItem = inpatient;
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
        this.inpatients().forEach(i => i.selected = this.selectAll);
    }

    updateSelectAllState(): void {
        this.selectAll = this.inpatients().every(i => i.selected);
    }

    get hasSelectedInpatients(): boolean {
        return this.inpatients().some(i => i.selected);
    }

    totalPages = computed(() => {
        return Math.max(1, Math.ceil(this.filteredInpatients().length / this.pageSize()));
    });

    paginatedInpatients = computed(() => {
        const startIndex = (this.currentPage() - 1) * this.pageSize();
        return this.filteredInpatients().slice(startIndex, startIndex + this.pageSize());
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

    onEdit(inpatient: Inpatient): void {
        this.editInpatient.emit(inpatient);
    }

    onDelete(inpatient: Inpatient): void {
        if (confirm(`Are you sure you want to delete inpatient record for "${inpatient.patientName}"?`)) {
            this.deleteInpatient.emit(inpatient);
        }
    }

    onDeleteSelected(): void {
        const selected = this.inpatients().filter(i => i.selected);
        if (selected.length === 0) return;
        if (confirm(`Are you sure you want to delete ${selected.length} selected inpatient record(s)?`)) {
            this.deleteSelected.emit(selected);
            this.selectAll = false;
        }
    }

    getStatusClasses(status: string): string {
        switch (status) {
            case 'Admitted': return 'bg-blue-50 text-blue-700';
            case 'Discharged': return 'bg-emerald-50 text-emerald-700';
            case 'Transferred': return 'bg-purple-50 text-purple-700';
            case 'Critical': return 'bg-red-50 text-red-700';
            default: return 'bg-gray-50 text-gray-700';
        }
    }
}
