import { Component, OnInit, inject, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { LucideAngularModule, Search, Filter, MoreHorizontal, ChevronLeft, ChevronRight, Pencil, Trash2 } from 'lucide-angular';
import { MedicalService, Doctor } from '../../../../services/medical.service';
import { AddDoctorComponent } from './add-doctor/add-doctor.component';

@Component({
    selector: 'app-dashboard-doctors',
    imports: [LucideAngularModule, AddDoctorComponent],
    templateUrl: './dashboard-doctors.component.html',
    styleUrls: ['./dashboard-doctors.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        '(document:click)': 'closeDropdown()'
    }
})
export class DashboardDoctorsComponent implements OnInit {
    readonly Search = Search;
    readonly Filter = Filter;
    readonly MoreHorizontal = MoreHorizontal;
    readonly ChevronLeft = ChevronLeft;
    readonly ChevronRight = ChevronRight;
    readonly Pencil = Pencil;
    readonly Trash2 = Trash2;
    doctors = signal<Doctor[]>([]);
    activeDropdownId: number | null = null;
    currentPage = signal(1);
    readonly pageSize = 5;
    isAddModalOpen = false;

    private medicalService = inject(MedicalService);

    ngOnInit(): void {
        this.medicalService.getDoctors().subscribe(data => {
            this.doctors.set(data);
        });
    }

    totalPages = computed(() => {
        return Math.ceil(this.doctors().length / this.pageSize);
    });

    paginatedDoctors = computed(() => {
        const startIndex = (this.currentPage() - 1) * this.pageSize;
        return this.doctors().slice(startIndex, startIndex + this.pageSize);
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

    getAvatarInitialsName(name: string): string {
        return name.replace('Dr. ', '').replace(' ', '+');
    }

    closeDropdown(): void {
        this.activeDropdownId = null;
    }

    toggleDropdown(docId: number, event: Event): void {
        event.stopPropagation();
        this.activeDropdownId = this.activeDropdownId === docId ? null : docId;
    }

    openAddModal(): void {
        this.isAddModalOpen = true;
    }

    closeAddModal(): void {
        this.isAddModalOpen = false;
    }

    handleAddDoctor(doctorData: { name: string; specialty: string; phone: string; availability: string }): void {
        this.medicalService.addDoctor(doctorData as Omit<Doctor, 'id' | 'image' | 'role'>).subscribe(() => {
            this.medicalService.getDoctors().subscribe(data => {
                this.doctors.set(data);
                this.currentPage.set(this.totalPages());
            });
            this.closeAddModal();
        });
    }
}
