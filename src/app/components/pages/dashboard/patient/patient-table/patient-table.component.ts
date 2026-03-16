import { Component, OnInit, OnDestroy, input, output, ChangeDetectionStrategy, signal, computed, HostListener, effect, untracked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Pencil, Trash2, MoreHorizontal, Search, Filter, ChevronLeft, ChevronRight, Plus, ChevronDown } from 'lucide-angular';

export interface Patient {
    id: number;
    no: number;
    name: string;
    gender: 'Male' | 'Female';
    dob: string;
    address: string;
    phone: string;
    bloodType: string;
    selected: boolean;
}

@Component({
    selector: 'app-patient-table',
    imports: [FormsModule, LucideAngularModule],
    templateUrl: './patient-table.component.html',
    styleUrl: './patient-table.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        '(document:click)': 'closeDropdown()'
    }
})
export class PatientTableComponent implements OnInit, OnDestroy {
    patients = input<Patient[]>([]);
    editPatient = output<Patient>();
    deletePatient = output<Patient>();
    deleteSelected = output<Patient[]>();
    addPatient = output<void>();

    readonly Pencil = Pencil;
    readonly Trash2 = Trash2;
    readonly MoreHorizontal = MoreHorizontal;
    readonly Search = Search;
    readonly Filter = Filter;
    readonly ChevronLeft = ChevronLeft;
    readonly ChevronRight = ChevronRight;
    readonly Plus = Plus;
    readonly ChevronDown = ChevronDown;

    activeItem: Patient | null = null;
    dropdownPos = { top: 0, right: 0 };

    selectAll = false;
    currentPage = signal(1);
    pageSize = signal(7);
    searchQuery = signal('');

    constructor() {
        // Reset to page 1 when search query changes
        effect(() => {
            this.searchQuery();
            untracked(() => this.currentPage.set(1));
        });
    }

    filteredPatients = computed(() => {
        const query = this.searchQuery().toLowerCase().trim();
        if (!query) return this.patients();

        return this.patients().filter(p =>
            p.name.toLowerCase().includes(query) ||
            p.gender.toLowerCase().includes(query) ||
            (p.address?.toLowerCase().includes(query)) ||
            (p.phone?.toLowerCase().includes(query)) ||
            (p.bloodType?.toLowerCase().includes(query)) ||
            p.no.toString().includes(query)
        );
    });

    @HostListener('window:resize')
    onResize() {
        this.updatePageSize();
    }

    private updatePageSize(): void {
        const width = window.innerWidth;
        if (width > 1920) {
            this.pageSize.set(10);
        } else if (width > 1024) {
            this.pageSize.set(7);
        } else {
            this.pageSize.set(5);
        }
    }

    closeDropdown() {
        this.activeItem = null;
    }

    toggleDropdown(patient: Patient, event: Event): void {
        event.stopPropagation();
        if (this.activeItem?.id === patient.id) {
            this.activeItem = null;
            return;
        }
        const btn = (event.currentTarget as HTMLElement).getBoundingClientRect();
        this.dropdownPos = { top: btn.bottom + 4, right: window.innerWidth - btn.right };
        this.activeItem = patient;
    }

    ngOnDestroy(): void { }

    @HostListener('window:scroll')
    onWindowScroll(): void {
        this.activeItem = null;
    }

    ngOnInit(): void {
        this.updatePageSize();
    }

    toggleSelectAll(): void {
        this.patients().forEach(p => p.selected = this.selectAll);
    }

    updateSelectAllState(): void {
        this.selectAll = this.patients().every(p => p.selected);
    }

    get hasSelectedPatients(): boolean {
        return this.patients().some(p => p.selected);
    }

    totalPages = computed(() => {
        return Math.max(1, Math.ceil(this.filteredPatients().length / this.pageSize()));
    });

    paginatedPatients = computed(() => {
        const startIndex = (this.currentPage() - 1) * this.pageSize();
        return this.filteredPatients().slice(startIndex, startIndex + this.pageSize());
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

    onEdit(patient: Patient): void {
        this.editPatient.emit(patient);
    }

    onDelete(patient: Patient): void {
        if (confirm(`Are you sure you want to delete patient "${patient.name}"?`)) {
            this.deletePatient.emit(patient);
        }
    }

    onDeleteSelected(): void {
        const selected = this.patients().filter(p => p.selected);
        if (selected.length === 0) return;
        if (confirm(`Are you sure you want to delete ${selected.length} selected patient(s)?`)) {
            this.deleteSelected.emit(selected);
            this.selectAll = false;
        }
    }
}
