import { Component, ChangeDetectionStrategy, signal, computed, effect, untracked, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Search, Filter, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, MoreHorizontal, Eye } from 'lucide-angular';
import { MedicalRecordService } from '../../../../services/medical-record.service';

export interface MedicalRecord {
    id: number;
    no: number;
    recordType: string;
    date: string;
    doctorName: string;
    description: string;
    status: 'Reviewed' | 'Pending' | 'Archived';
}

@Component({
    selector: 'app-medical-records-page',
    imports: [CommonModule, FormsModule, LucideAngularModule],
    templateUrl: './medical-records-page.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        '(document:click)': 'closeAllDropdowns()'
    }
})
export class MedicalRecordsPageComponent {
    readonly Search = Search;
    readonly Filter = Filter;
    readonly ChevronLeft = ChevronLeft;
    readonly ChevronRight = ChevronRight;
    readonly ChevronDown = ChevronDown;
    readonly ChevronUp = ChevronUp;
    readonly MoreHorizontal = MoreHorizontal;
    readonly Eye = Eye;

    private medicalRecordService = inject(MedicalRecordService);
    records: MedicalRecord[] = [];

    searchQuery = signal('');
    currentPage = signal(1);
    pageSize = signal(7);
    sortColumn = signal<string>('');
    sortDirection = signal<'asc' | 'desc'>('asc');
    filterStatus = signal<string>('All');
    filterType = signal<string>('All');
    activeFilterMenu = signal<string | null>(null);
    isPageSizeMenuOpen = false;

    // Action dropdown
    activeItem: MedicalRecord | null = null;
    dropdownPos = { top: 0, right: 0 };

    constructor() {
        effect(() => {
            this.searchQuery();
            untracked(() => this.currentPage.set(1));
        });
        this.medicalRecordService.getMedicalRecords().subscribe(items => {
            this.records = items;
        });
    }

    availableStatuses = computed(() => {
        const statuses = this.records.map(r => r.status).filter(s => !!s);
        return ['All', ...Array.from(new Set(statuses)).sort()];
    });

    availableTypes = computed(() => {
        const types = this.records.map(r => r.recordType).filter(s => !!s);
        return ['All', ...Array.from(new Set(types)).sort()];
    });

    filteredRecords = computed(() => {
        let result = [...this.records];
        const query = this.searchQuery().toLowerCase().trim();

        if (query) {
            result = result.filter(r =>
                r.recordType.toLowerCase().includes(query) ||
                r.doctorName.toLowerCase().includes(query) ||
                r.description.toLowerCase().includes(query) ||
                r.date.toLowerCase().includes(query) ||
                r.status.toLowerCase().includes(query)
            );
        }

        const statFilter = this.filterStatus();
        if (statFilter !== 'All') {
            result = result.filter(r => r.status === statFilter);
        }

        const typeFilter = this.filterType();
        if (typeFilter !== 'All') {
            result = result.filter(r => r.recordType === typeFilter);
        }

        const col = this.sortColumn();
        const dir = this.sortDirection() === 'asc' ? 1 : -1;
        if (col) {
            result = [...result].sort((a, b) => {
                const aVal: any = a[col as keyof MedicalRecord];
                const bVal: any = b[col as keyof MedicalRecord];
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

    totalPages = computed(() => Math.max(1, Math.ceil(this.filteredRecords().length / this.pageSize())));

    paginatedRecords = computed(() => {
        const start = (this.currentPage() - 1) * this.pageSize();
        return this.filteredRecords().slice(start, start + this.pageSize());
    });

    visiblePages = computed(() => {
        const total = this.totalPages();
        const current = this.currentPage();
        if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
        if (current <= 3) return [1, 2, 3, '...', total];
        if (current >= total - 2) return [1, '...', total - 2, total - 1, total];
        return [1, '...', current, '...', total];
    });

    goToPage(page: number | string): void {
        if (typeof page === 'number' && page >= 1 && page <= this.totalPages()) this.currentPage.set(page);
    }
    nextPage(): void { if (this.currentPage() < this.totalPages()) this.currentPage.update(p => p + 1); }
    prevPage(): void { if (this.currentPage() > 1) this.currentPage.update(p => p - 1); }

    changePageSize(size: number): void {
        this.pageSize.set(size);
        this.currentPage.set(1);
        this.isPageSizeMenuOpen = false;
    }

    togglePageSizeMenu(event: Event): void {
        event.stopPropagation();
        this.isPageSizeMenuOpen = !this.isPageSizeMenuOpen;
        this.activeItem = null;
    }

    toggleFilterMenu(menu: string, event: Event): void {
        event.stopPropagation();
        this.activeFilterMenu.set(this.activeFilterMenu() === menu ? null : menu);
        this.activeItem = null;
        this.isPageSizeMenuOpen = false;
    }

    setFilter(type: 'status' | 'type', value: string): void {
        if (type === 'status') this.filterStatus.set(value);
        if (type === 'type') this.filterType.set(value);
        this.activeFilterMenu.set(null);
        this.currentPage.set(1);
    }

    toggleDropdown(record: MedicalRecord, event: Event): void {
        event.stopPropagation();
        if (this.activeItem?.id === record.id) { this.activeItem = null; return; }
        const btn = (event.currentTarget as HTMLElement).getBoundingClientRect();
        this.dropdownPos = { top: btn.bottom + 4, right: window.innerWidth - btn.right };
        this.activeItem = record;
    }

    closeAllDropdowns(): void {
        this.activeItem = null;
        this.isPageSizeMenuOpen = false;
        this.activeFilterMenu.set(null);
    }

    @HostListener('window:scroll')
    onWindowScroll(): void { this.activeItem = null; }

    getAvatarInitialsName(name: string): string {
        return name.replace('Dr. ', '').replace(' ', '+');
    }
}
