import { Component, ChangeDetectionStrategy, signal, computed, effect, untracked, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Search, Filter, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, MoreHorizontal, Eye, Pencil, Trash2 } from 'lucide-angular';

export interface Prescription {
    id: number;
    no: number;
    medication: string;
    dosage: string;
    frequency: string;
    doctorName: string;
    startDate: string;
    endDate: string;
    status: 'Active' | 'Expired' | 'Completed';
}

@Component({
    selector: 'app-prescriptions-page',
    imports: [CommonModule, FormsModule, LucideAngularModule],
    templateUrl: './prescriptions-page.component.html',
    styleUrl: './prescriptions-page.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        '(document:click)': 'closeAllDropdowns()'
    }
})
export class PrescriptionsPageComponent {
    readonly Search = Search;
    readonly Filter = Filter;
    readonly ChevronLeft = ChevronLeft;
    readonly ChevronRight = ChevronRight;
    readonly ChevronDown = ChevronDown;
    readonly ChevronUp = ChevronUp;
    readonly MoreHorizontal = MoreHorizontal;
    readonly Eye = Eye;
    readonly Pencil = Pencil;
    readonly Trash2 = Trash2;

    prescriptions: Prescription[] = [
        { id: 1, no: 1, medication: 'Amoxicillin', dosage: '500mg', frequency: '3 times/day', doctorName: 'Dr. Mia Kensington', startDate: 'January 5, 2026', endDate: 'January 15, 2026', status: 'Completed' },
        { id: 2, no: 2, medication: 'Lisinopril', dosage: '10mg', frequency: 'Once daily', doctorName: 'Dr. Benjamin Carter', startDate: 'February 1, 2026', endDate: 'August 1, 2026', status: 'Active' },
        { id: 3, no: 3, medication: 'Metformin', dosage: '850mg', frequency: '2 times/day', doctorName: 'Dr. Elijah Stone', startDate: 'January 20, 2026', endDate: 'July 20, 2026', status: 'Active' },
        { id: 4, no: 4, medication: 'Ibuprofen', dosage: '400mg', frequency: 'As needed', doctorName: 'Dr. Amelia Hawthorne', startDate: 'March 1, 2026', endDate: 'March 14, 2026', status: 'Completed' },
        { id: 5, no: 5, medication: 'Omeprazole', dosage: '20mg', frequency: 'Once daily', doctorName: 'Dr. Clara Whitmore', startDate: 'February 15, 2026', endDate: 'May 15, 2026', status: 'Active' },
        { id: 6, no: 6, medication: 'Atorvastatin', dosage: '40mg', frequency: 'Once daily', doctorName: 'Dr. Benjamin Carter', startDate: 'January 10, 2026', endDate: 'January 10, 2027', status: 'Active' },
        { id: 7, no: 7, medication: 'Ciprofloxacin', dosage: '250mg', frequency: '2 times/day', doctorName: 'Dr. Oliver Westwood', startDate: 'November 10, 2025', endDate: 'November 20, 2025', status: 'Expired' },
        { id: 8, no: 8, medication: 'Amlodipine', dosage: '5mg', frequency: 'Once daily', doctorName: 'Dr. Sophia Langley', startDate: 'December 1, 2025', endDate: 'June 1, 2026', status: 'Active' },
        { id: 9, no: 9, medication: 'Prednisone', dosage: '10mg', frequency: 'Once daily', doctorName: 'Dr. Nathaniel Rivers', startDate: 'October 5, 2025', endDate: 'October 15, 2025', status: 'Expired' },
        { id: 10, no: 10, medication: 'Cetirizine', dosage: '10mg', frequency: 'Once daily', doctorName: 'Dr. Lily Fairchild', startDate: 'March 1, 2026', endDate: 'September 1, 2026', status: 'Active' },
        { id: 11, no: 11, medication: 'Sertraline', dosage: '50mg', frequency: 'Once daily', doctorName: 'Dr. Victoria Ashford', startDate: 'January 15, 2026', endDate: 'July 15, 2026', status: 'Active' },
        { id: 12, no: 12, medication: 'Azithromycin', dosage: '250mg', frequency: 'Once daily', doctorName: 'Dr. Mia Kensington', startDate: 'September 1, 2025', endDate: 'September 5, 2025', status: 'Expired' },
    ];

    searchQuery = signal('');
    currentPage = signal(1);
    pageSize = signal(7);
    sortColumn = signal<string>('');
    sortDirection = signal<'asc' | 'desc'>('asc');
    filterStatus = signal<string>('All');
    activeFilterMenu = signal<string | null>(null);
    isPageSizeMenuOpen = false;

    // Action dropdown
    activeItem: Prescription | null = null;
    dropdownPos = { top: 0, right: 0 };

    constructor() {
        effect(() => {
            this.searchQuery();
            untracked(() => this.currentPage.set(1));
        });
    }

    availableStatuses = computed(() => {
        const statuses = this.prescriptions.map(p => p.status).filter(s => !!s);
        return ['All', ...Array.from(new Set(statuses)).sort()];
    });

    filteredPrescriptions = computed(() => {
        let result = [...this.prescriptions];
        const query = this.searchQuery().toLowerCase().trim();

        if (query) {
            result = result.filter(p =>
                p.medication.toLowerCase().includes(query) ||
                p.doctorName.toLowerCase().includes(query) ||
                p.dosage.toLowerCase().includes(query) ||
                p.frequency.toLowerCase().includes(query) ||
                p.status.toLowerCase().includes(query)
            );
        }

        const statFilter = this.filterStatus();
        if (statFilter !== 'All') {
            result = result.filter(p => p.status === statFilter);
        }

        const col = this.sortColumn();
        const dir = this.sortDirection() === 'asc' ? 1 : -1;
        if (col) {
            result = [...result].sort((a, b) => {
                const aVal: any = a[col as keyof Prescription];
                const bVal: any = b[col as keyof Prescription];
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

    totalPages = computed(() => Math.max(1, Math.ceil(this.filteredPrescriptions().length / this.pageSize())));

    paginatedPrescriptions = computed(() => {
        const start = (this.currentPage() - 1) * this.pageSize();
        return this.filteredPrescriptions().slice(start, start + this.pageSize());
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

    setFilter(type: 'status', value: string): void {
        this.filterStatus.set(value);
        this.activeFilterMenu.set(null);
        this.currentPage.set(1);
    }

    toggleDropdown(rx: Prescription, event: Event): void {
        event.stopPropagation();
        if (this.activeItem?.id === rx.id) { this.activeItem = null; return; }
        const btn = (event.currentTarget as HTMLElement).getBoundingClientRect();
        this.dropdownPos = { top: btn.bottom + 4, right: window.innerWidth - btn.right };
        this.activeItem = rx;
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
