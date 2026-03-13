import { Component, OnInit, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Pencil, Trash2, MoreHorizontal, Search, Filter } from 'lucide-angular';

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
    imports: [CommonModule, FormsModule, LucideAngularModule],
    templateUrl: './patient-table.component.html',
    styleUrl: './patient-table.component.css',
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

    activeDropdownId: number | null = null;

    selectAll = false;
    currentPage = 1;
    readonly pageSize = 9;

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

    get totalPages(): number {
        return Math.ceil(this.patients().length / this.pageSize);
    }

    get paginatedPatients(): Patient[] {
        const startIndex = (this.currentPage - 1) * this.pageSize;
        return this.patients().slice(startIndex, startIndex + this.pageSize);
    }

    get visiblePages(): (number | string)[] {
        const total = this.totalPages;
        if (total <= 5) {
            return Array.from({ length: total }, (_, i) => i + 1);
        }

        if (this.currentPage <= 3) {
            return [1, 2, 3, '...', total];
        } else if (this.currentPage >= total - 2) {
            return [1, '...', total - 2, total - 1, total];
        } else {
            return [1, '...', this.currentPage, '...', total];
        }
    }

    goToPage(page: number | string): void {
        if (typeof page === 'number' && page >= 1 && page <= this.totalPages && page !== this.currentPage) {
            this.currentPage = page;
        }
    }

    nextPage(): void {
        if (this.currentPage < this.totalPages) {
            this.currentPage++;
        }
    }

    prevPage(): void {
        if (this.currentPage > 1) {
            this.currentPage--;
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
