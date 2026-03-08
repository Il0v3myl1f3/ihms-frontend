import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Search, Filter, MoreHorizontal, ChevronLeft, ChevronRight } from 'lucide-angular';
import { MedicalService, Doctor } from '../../../../services/medical.service';
import { AddDoctorComponent } from './add-doctor/add-doctor.component';

@Component({
    selector: 'app-dashboard-doctors',
    standalone: true,
    imports: [CommonModule, LucideAngularModule, AddDoctorComponent],
    templateUrl: './dashboard-doctors.component.html',
    styleUrls: ['./dashboard-doctors.component.css']
})
export class DashboardDoctorsComponent implements OnInit {
    readonly Search = Search;
    readonly Filter = Filter;
    readonly MoreHorizontal = MoreHorizontal;
    readonly ChevronLeft = ChevronLeft;
    readonly ChevronRight = ChevronRight;
    doctors: Doctor[] = [];
    currentPage = 1;
    readonly pageSize = 5;
    isAddModalOpen = false;

    constructor(private medicalService: MedicalService) { }

    ngOnInit(): void {
        this.medicalService.getDoctors().subscribe(data => {
            this.doctors = data;
        });
    }

    get totalPages(): number {
        return Math.ceil(this.doctors.length / this.pageSize);
    }

    get paginatedDoctors(): Doctor[] {
        const startIndex = (this.currentPage - 1) * this.pageSize;
        return this.doctors.slice(startIndex, startIndex + this.pageSize);
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

    getAvatarInitialsName(name: string): string {
        // Return the name formatted for UI avatars, replace spaces with +
        return name.replace('Dr. ', '').replace(' ', '+');
    }

    openAddModal(): void {
        this.isAddModalOpen = true;
    }

    closeAddModal(): void {
        this.isAddModalOpen = false;
    }

    handleAddDoctor(doctorData: { name: string; specialty: string; phone: string; availability: string }): void {
        this.medicalService.addDoctor(doctorData as any).subscribe(() => {
            // Re-fetch list to update pagination correctly
            this.medicalService.getDoctors().subscribe(data => {
                this.doctors = data;
                // Go to last page to see new entry potentially
                this.currentPage = this.totalPages;
            });
            this.closeAddModal();
        });
    }
}
