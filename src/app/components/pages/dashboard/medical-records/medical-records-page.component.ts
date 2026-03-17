import { Component, ChangeDetectionStrategy, signal, computed, effect, untracked, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Search, Filter, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, MoreHorizontal, Eye } from 'lucide-angular';

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
    styleUrl: './medical-records-page.component.css',
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

    records: MedicalRecord[] = [
        { id: 1, no: 1, recordType: 'Blood Test', date: 'January 8, 2026', doctorName: 'Dr. Mia Kensington', description: 'Complete blood count — all values within normal range', status: 'Reviewed' },
        { id: 2, no: 2, recordType: 'X-Ray', date: 'January 15, 2026', doctorName: 'Dr. Amelia Hawthorne', description: 'Chest X-ray — no abnormalities detected', status: 'Reviewed' },
        { id: 3, no: 3, recordType: 'MRI Scan', date: 'February 3, 2026', doctorName: 'Dr. Sophia Langley', description: 'Brain MRI — follow-up scan for headache diagnosis', status: 'Reviewed' },
        { id: 4, no: 4, recordType: 'Lab Results', date: 'February 18, 2026', doctorName: 'Dr. Elijah Stone', description: 'Thyroid panel — TSH levels slightly elevated', status: 'Reviewed' },
        { id: 5, no: 5, recordType: 'General Checkup', date: 'March 1, 2026', doctorName: 'Dr. Oliver Westwood', description: 'Annual physical examination — overall good health', status: 'Reviewed' },
        { id: 6, no: 6, recordType: 'ECG', date: 'March 10, 2026', doctorName: 'Dr. Benjamin Carter', description: 'Electrocardiogram — normal sinus rhythm', status: 'Reviewed' },
        { id: 7, no: 7, recordType: 'Blood Test', date: 'March 15, 2026', doctorName: 'Dr. Mia Kensington', description: 'Lipid panel — cholesterol slightly above normal', status: 'Pending' },
        { id: 8, no: 8, recordType: 'Vaccination', date: 'March 17, 2026', doctorName: 'Dr. Eleanor Hayes', description: 'Seasonal flu vaccination administered', status: 'Reviewed' },
        { id: 9, no: 9, recordType: 'Ultrasound', date: 'April 2, 2026', doctorName: 'Dr. Clara Whitmore', description: 'Abdominal ultrasound — scheduled follow-up', status: 'Pending' },
        { id: 10, no: 10, recordType: 'Allergy Test', date: 'April 15, 2026', doctorName: 'Dr. Lily Fairchild', description: 'Skin prick test — mild dust mite reaction', status: 'Pending' },
        { id: 11, no: 11, recordType: 'CT Scan', date: 'September 20, 2025', doctorName: 'Dr. Nathaniel Rivers', description: 'Chest CT — cancer screening, all clear', status: 'Archived' },
        { id: 12, no: 12, recordType: 'Blood Test', date: 'August 5, 2025', doctorName: 'Dr. Samuel Brightman', description: 'Metabolic panel — kidney function normal', status: 'Archived' },
        { id: 13, no: 13, recordType: 'Eye Exam', date: 'July 12, 2025', doctorName: 'Dr. Isabella Moore', description: 'Comprehensive eye exam — prescription updated', status: 'Archived' },
        { id: 14, no: 14, recordType: 'Dental Checkup', date: 'June 1, 2025', doctorName: 'Dr. Felix Jenkins', description: 'Routine dental cleaning and exam — no issues', status: 'Archived' },
    ];

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
