import { Component, OnInit, OnDestroy, input, output, ChangeDetectionStrategy, signal, computed, effect, untracked, NgZone, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { fromEvent } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Search, Filter, MoreHorizontal, ChevronLeft, ChevronRight, Pencil, Trash2, Plus, ChevronDown, ChevronUp, Eye } from 'lucide-angular';
import { Doctor } from '../../../../../services/medical.service';
import { PaginatedQuery, FilterItem } from '../../../../../core/models/pagination.models';



@Component({
    selector: 'app-doctor-table',
    imports: [CommonModule, FormsModule, LucideAngularModule],
    templateUrl: './doctor-table.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        '(document:click)': 'closeDropdown()'
    }
})
export class DoctorTableComponent implements OnInit, OnDestroy {
    doctors = input<Doctor[]>([]);
    editDoctor = output<Doctor>();
    deleteDoctor = output<Doctor>();
    deleteSelected = output<Doctor[]>();
    viewDoctor = output<Doctor>();
    addDoctor = output<void>();
    queryChange = output<PaginatedQuery>();
    totalCount = input<number>(0);

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

    activeItem: Doctor | null = null;
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
    filterSpecialty = signal<string>('All');
    filterStatus = signal<string>('All');
    activeFilterMenu = signal<string | null>(null);

    availableSpecialties = [
        'All', 'Cardiology', 'Neurology', 'Pediatrics', 'Orthopedics', 
        'Dermatology', 'Gastroenterology', 'Ophthalmology', 'Psychiatry', 
        'Oncology', 'Radiology', 'Urology'
    ];

    availableStatuses = ['All', 'Available', 'Away', 'Busy', 'On Vacation'];

    constructor() {
        effect(() => {
            this.emitQuery();
        });
    }

    private emitQuery(): void {
        const filters: FilterItem[] = [];
        if (this.filterSpecialty() && this.filterSpecialty() !== 'All') {
            filters.push({ Field: 'Department', Value: this.filterSpecialty() });
        }
        if (this.filterStatus() && this.filterStatus() !== 'All') {
            filters.push({ Field: 'Availability', Value: this.filterStatus() });
        }

        const query: PaginatedQuery = {
            pageNumber: this.currentPage(),
            pageSize: this.pageSize(),
            searchTerm: this.searchQuery(),
            sortBy: this.sortColumn(),
            sortOrder: this.sortDirection(),
            filtersJson: filters.length > 0 ? JSON.stringify(filters) : undefined
        };
        untracked(() => {
            this.queryChange.emit(query);
        });
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

            fromEvent(window, 'resize', { passive: true })
                .pipe(takeUntilDestroyed(this.destroyRef))
                .subscribe(() => {
                    this.checkResponsiveSettings();
                });
        });
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

    toggleDropdown(doc: Doctor, event: Event): void {
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



    private checkResponsiveSettings(): void {
        if (window.innerWidth < 1024) {
            if (this.pageSize() !== 7) {
                this.ngZone.run(() => this.pageSize.set(7));
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
        return Math.max(1, Math.ceil(this.totalCount() / this.pageSize()));
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


    onEdit(doctor: Doctor): void {
        this.editDoctor.emit(doctor);
    }

    onView(doctor: Doctor): void {
        this.viewDoctor.emit(doctor);
    }

    onDelete(doctor: Doctor): void {
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
