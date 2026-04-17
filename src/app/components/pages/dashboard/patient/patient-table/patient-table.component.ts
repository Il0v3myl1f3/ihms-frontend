import { Component, OnInit, OnDestroy, input, output, ChangeDetectionStrategy, signal, computed, HostListener, effect, untracked, NgZone, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { fromEvent } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Pencil, Trash2, MoreHorizontal, Search, Filter, ChevronLeft, ChevronRight, Plus, ChevronDown, ChevronUp, Eye } from 'lucide-angular';

export interface Patient {
    id: string;
    no: number;
    name: string;
    firstName: string;
    lastName: string;
    email: string;
    gender: 'Male' | 'Female' | 'Other';
    dob: string;
    address: string;
    phone: string;
    bloodType: string;
    selected: boolean;
}

@Component({
    selector: 'app-patient-table',
    imports: [FormsModule, LucideAngularModule, CommonModule],
    templateUrl: './patient-table.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        '(document:click)': 'closeDropdown()'
    }
})
export class PatientTableComponent implements OnInit, OnDestroy {
    patients = input<Patient[]>([]);
    readOnly = input<boolean>(false);
    editPatient = output<Patient>();
    deletePatient = output<Patient>();
    deleteSelected = output<Patient[]>();
    addPatient = output<void>();
    viewPatient = output<Patient>();

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

    activeItem: Patient | null = null;
    dropdownPos = { top: 0, right: 0 };
    isPageSizeMenuOpen = false;

    private ngZone = inject(NgZone);
    private destroyRef = inject(DestroyRef);

    selectAll = false;
    currentPage = signal(1);
    pageSize = signal(7);
    searchQuery = signal('');
    sortColumn = signal<string>('no');
    sortDirection = signal<'asc' | 'desc'>('asc');
    filterGender = signal<string>('All');
    filterBloodType = signal<string>('All');
    activeFilterMenu = signal<string | null>(null);

    availableGenders = computed(() => {
        const genders = this.patients().map(p => p.gender).filter(s => !!s);
        return ['All', ...Array.from(new Set(genders)).sort()];
    });

    availableBloodTypes = computed(() => {
        const types = this.patients().map(p => p.bloodType).filter(s => !!s);
        return ['All', ...Array.from(new Set(types)).sort()];
    });

    constructor() {
        // Reset to page 1 when search query changes
        effect(() => {
            this.searchQuery();
            untracked(() => this.currentPage.set(1));
        });

        this.ngZone.runOutsideAngular(() => {
            fromEvent(window, 'scroll', { passive: true })
                .pipe(takeUntilDestroyed(this.destroyRef))
                .subscribe(() => {
                    if (this.activeItem) {
                        this.ngZone.run(() => {
                            this.activeItem = null;
                        });
                    }
                });
        });
    }

    filteredPatients = computed(() => {
        const query = this.searchQuery().toLowerCase().trim();
        const genderFilter = this.filterGender();
        const typeFilter = this.filterBloodType();
        const patients = this.patients();

        // Single-pass filtering
        let result = patients.filter(p => {
            const matchesGender = genderFilter === 'All' || p.gender === genderFilter;
            const matchesType = typeFilter === 'All' || p.bloodType === typeFilter;
            const matchesQuery = !query || 
                p.name.toLowerCase().includes(query) ||
                p.gender.toLowerCase().includes(query) ||
                (p.address?.toLowerCase().includes(query)) ||
                (p.phone?.toLowerCase().includes(query)) ||
                (p.bloodType?.toLowerCase().includes(query)) ||
                p.no.toString().includes(query);
            
            return matchesGender && matchesType && matchesQuery;
        });

        const col = this.sortColumn();
        const dir = this.sortDirection() === 'asc' ? 1 : -1;

        if (col) {
            result.sort((a, b) => {
                let aVal: any = a[col as keyof Patient];
                let bVal: any = b[col as keyof Patient];

                if (col === 'dob') {
                    aVal = this.parseDate(aVal);
                    bVal = this.parseDate(bVal);
                }

                if (aVal < bVal) return -1 * dir;
                if (aVal > bVal) return 1 * dir;
                return 0;
            });
        }

        return result;
    });

    private parseDate(d: string): number {
        if (!d || d === 'N/A') return 0;
        const parts = d.split('/');
        if (parts.length === 3) {
            return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0])).getTime();
        }
        const t = new Date(d).getTime();
        return isNaN(t) ? 0 : t;
    }

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

    setFilter(type: 'gender' | 'bloodType', value: string): void {
        if (type === 'gender') this.filterGender.set(value);
        if (type === 'bloodType') this.filterBloodType.set(value);
        this.activeFilterMenu.set(null);
        this.currentPage.set(1);
    }

    togglePageSizeMenu(event: Event): void {
        event.stopPropagation();
        this.isPageSizeMenuOpen = !this.isPageSizeMenuOpen;
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

    onView(patient: Patient): void {
        this.viewPatient.emit(patient);
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
