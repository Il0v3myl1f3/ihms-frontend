import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './patient-table.component.html',
    styleUrl: './patient-table.component.css'
})
export class PatientTableComponent implements OnInit {
    @Input() patients: Patient[] = [];
    selectAll = false;
    currentPage = 1;
    readonly pageSize = 5;

    ngOnInit(): void {
    }

    toggleSelectAll(): void {
        this.patients.forEach(p => p.selected = this.selectAll);
    }

    updateSelectAllState(): void {
        this.selectAll = this.patients.every(p => p.selected);
    }

    get totalPages(): number {
        return Math.ceil(this.patients.length / this.pageSize);
    }

    get paginatedPatients(): Patient[] {
        const startIndex = (this.currentPage - 1) * this.pageSize;
        return this.patients.slice(startIndex, startIndex + this.pageSize);
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
}
