import {
    Component, input, output, signal, computed,
    ChangeDetectionStrategy, HostListener
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
    LucideAngularModule,
    Search, Filter, ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
    MoreHorizontal, Eye, Pencil, Trash2
} from 'lucide-angular';
import { Prescription } from '../prescriptions-page.component';

@Component({
    selector: 'app-prescription-table',
    standalone: true,
    imports: [CommonModule, FormsModule, LucideAngularModule],
    templateUrl: './prescription-table.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PrescriptionTableComponent {
    // Inputs
    prescriptions = input<Prescription[]>([]);
    compactMode = input(false);

    // Outputs
    viewPrescription = output<Prescription>();

    // Icons
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

    // Internal state
    searchQuery = signal('');
    sortColumn = signal('');
    sortDirection = signal<'asc' | 'desc'>('asc');
    filterStatus = signal('All');
    activeFilterMenu = signal<string | null>(null);
    currentPage = signal(1);
    pageSize = signal(7);
    isPageSizeMenuOpen = false;

    // Dropdown
    activeItem: Prescription | null = null;
    dropdownPos = { top: 0, right: 0 };

    @HostListener('document:click')
    closeDropdown() {
        this.activeItem = null;
        this.isPageSizeMenuOpen = false;
        this.activeFilterMenu.set(null);
    }

    availableStatuses = computed(() => {
        const statuses = this.prescriptions().map(p => p.status).filter(s => !!s);
        return ['All', ...Array.from(new Set(statuses)).sort()];
    });

    filteredPrescriptions = computed(() => {
        let result = [...this.prescriptions()];
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
        if (statFilter !== 'All') result = result.filter(p => p.status === statFilter);

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

    handleSort(column: string) {
        if (this.sortColumn() === column) {
            this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
        } else {
            this.sortColumn.set(column);
            this.sortDirection.set('asc');
        }
        this.currentPage.set(1);
    }

    toggleFilterMenu(menu: string, event: Event) {
        event.stopPropagation();
        this.activeFilterMenu.set(this.activeFilterMenu() === menu ? null : menu);
        this.activeItem = null;
        this.isPageSizeMenuOpen = false;
    }

    setFilter(value: string) {
        this.filterStatus.set(value);
        this.activeFilterMenu.set(null);
        this.currentPage.set(1);
    }

    goToPage(page: number | string) {
        if (typeof page === 'number' && page >= 1 && page <= this.totalPages()) this.currentPage.set(page);
    }
    nextPage() { if (this.currentPage() < this.totalPages()) this.currentPage.update(p => p + 1); }
    prevPage() { if (this.currentPage() > 1) this.currentPage.update(p => p - 1); }

    changePageSize(size: number) {
        this.pageSize.set(size);
        this.currentPage.set(1);
        this.isPageSizeMenuOpen = false;
    }

    togglePageSizeMenu(event: Event) {
        event.stopPropagation();
        this.isPageSizeMenuOpen = !this.isPageSizeMenuOpen;
        this.activeItem = null;
    }

    toggleDropdown(rx: Prescription, event: Event) {
        event.stopPropagation();
        if (this.activeItem?.id === rx.id) { this.activeItem = null; return; }
        const btn = (event.currentTarget as HTMLElement).getBoundingClientRect();
        this.dropdownPos = { top: btn.bottom + 4, right: window.innerWidth - btn.right };
        this.activeItem = rx;
    }

    onView(rx: Prescription) { this.viewPrescription.emit(rx); this.activeItem = null; }
}
