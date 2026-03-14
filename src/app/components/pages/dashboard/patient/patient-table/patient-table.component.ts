import { Component, OnInit, input, output, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Pencil, Trash2, MoreHorizontal, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-angular';

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
export class PatientTableComponent implements OnInit {
    patients = input<Patient[]>([]);
    editPatient = output<Patient>();
    deletePatient = output<Patient>();
    deleteSelected = output<Patient[]>();

    readonly Pencil = Pencil;
    readonly Trash2 = Trash2;
    readonly MoreHorizontal = MoreHorizontal;
    readonly Search = Search;
    readonly Filter = Filter;
    readonly ChevronLeft = ChevronLeft;
    readonly ChevronRight = ChevronRight;

    activeDropdownId: number | null = null;

    selectAll = false;
    currentPage = signal(1);
    readonly pageSize = 10;

    closeDropdown() {
        this.activeDropdownId = null;
    }

    toggleDropdown(patientId: number, event: Event): void {
        event.stopPropagation();
        this.activeDropdownId = this.activeDropdownId === patientId ? null : patientId;
    }

    ngOnInit(): void {
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
        return Math.ceil(this.patients().length / this.pageSize);
    });

    paginatedPatients = computed(() => {
        const startIndex = (this.currentPage() - 1) * this.pageSize;
        return this.patients().slice(startIndex, startIndex + this.pageSize);
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
