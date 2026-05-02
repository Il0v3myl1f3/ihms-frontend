import {
    Component, input, output, signal, computed,
    ChangeDetectionStrategy, HostListener
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
    LucideAngularModule,
    Search, Filter, ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
    MoreHorizontal, Eye, Edit2, Trash2, ChevronRight as ChevRight
} from 'lucide-angular';
import { MedicalRecord } from '../medical-records-page.component';

@Component({
    selector: 'app-medical-record-table',
    standalone: true,
    imports: [CommonModule, FormsModule, LucideAngularModule],
    templateUrl: './medical-record-table.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MedicalRecordTableComponent {
    // Inputs
    records = input<MedicalRecord[]>([]);
    isDoctor = input(false);
    compactMode = input(false); // hide search/filters when embedded

    // Outputs
    viewRecord = output<MedicalRecord>();
    editRecord = output<MedicalRecord>();
    deleteRecord = output<MedicalRecord>();

    // Icons
    readonly Search = Search;
    readonly Filter = Filter;
    readonly ChevronLeft = ChevronLeft;
    readonly ChevronRight = ChevronRight;
    readonly ChevronDown = ChevronDown;
    readonly ChevronUp = ChevronUp;
    readonly MoreHorizontal = MoreHorizontal;
    readonly Eye = Eye;
    readonly Edit2 = Edit2;
    readonly Trash2 = Trash2;

    // Internal state
    searchQuery = signal('');
    sortColumn = signal('');
    sortDirection = signal<'asc' | 'desc'>('asc');
    currentPage = signal(1);
    pageSize = signal(7);
    isPageSizeMenuOpen = false;

    // Dropdown
    activeItem: MedicalRecord | null = null;
    dropdownPos = { top: 0, right: 0 };

    @HostListener('document:click')
    closeDropdown() {
        this.activeItem = null;
        this.isPageSizeMenuOpen = false;
    }

    filteredRecords = computed(() => {
        let result = [...this.records()];
        const query = this.searchQuery().toLowerCase().trim();
        if (query) {
            result = result.filter(r =>
                r.diagnosis.toLowerCase().includes(query) ||
                r.doctorName.toLowerCase().includes(query) ||
                r.treatment.toLowerCase().includes(query) ||
                r.date.toLowerCase().includes(query)
            );
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

    handleSort(column: string) {
        if (this.sortColumn() === column) {
            this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
        } else {
            this.sortColumn.set(column);
            this.sortDirection.set('asc');
        }
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

    toggleDropdown(record: MedicalRecord, event: Event) {
        event.stopPropagation();
        if (this.activeItem?.id === record.id) { this.activeItem = null; return; }
        const btn = (event.currentTarget as HTMLElement).getBoundingClientRect();
        this.dropdownPos = { top: btn.bottom + 4, right: window.innerWidth - btn.right };
        this.activeItem = record;
    }

    onView(record: MedicalRecord) { this.viewRecord.emit(record); this.activeItem = null; }
    onEdit(record: MedicalRecord) { this.editRecord.emit(record); this.activeItem = null; }
    onDelete(record: MedicalRecord) { this.deleteRecord.emit(record); this.activeItem = null; }
}
