import { Component, OnInit, inject, ViewChild, ChangeDetectionStrategy, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MedicalService } from '../../../../services/medical.service';
import { AddDoctorComponent } from './add-doctor/add-doctor.component';
import { DoctorTableComponent, DoctorRow } from './doctor-table/doctor-table.component';

@Component({
    selector: 'app-dashboard-doctors',
    imports: [AddDoctorComponent, DoctorTableComponent],
    templateUrl: './dashboard-doctors.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardDoctorsComponent implements OnInit {
    @ViewChild(DoctorTableComponent) doctorTable!: DoctorTableComponent;

    doctors = signal<DoctorRow[]>([]);
    isAddDoctorModalOpen = false;
    selectedDoctorForEdit: DoctorRow | null = null;
    isDoctorReadOnly = signal(false);

    private medicalService = inject(MedicalService);
    private router = inject(Router);

    ngOnInit(): void {
        this.loadDoctors();
    }

    private loadDoctors(): void {
        this.medicalService.getDoctors().subscribe(data => {
            this.doctors.set(
                data.map((d, index) => ({
                    ...d,
                    no: index + 1,
                    selected: false
                }))
            );
        });
    }

    openAddDoctorModal(): void {
        this.selectedDoctorForEdit = null;
        this.isDoctorReadOnly.set(false);
        this.isAddDoctorModalOpen = true;
    }

    closeAddDoctorModal(): void {
        this.isAddDoctorModalOpen = false;
    }

    onEditDoctor(doctor: DoctorRow): void {
        this.selectedDoctorForEdit = doctor;
        this.isDoctorReadOnly.set(false);
        this.isAddDoctorModalOpen = true;
    }

    onViewDoctor(doctor: DoctorRow): void {
        this.router.navigate(['/dashboard/doctors', doctor.id]);
    }

    onDeleteDoctor(doctor: DoctorRow): void {
        this.medicalService.deleteDoctor(doctor.id).subscribe(() => {
            const current = this.doctors();
            const filtered = current.filter(d => d.id !== doctor.id);
            this.doctors.set(filtered.map((d, index) => ({ ...d, no: index + 1 })));

            if (this.doctorTable) {
                const totalPages = this.doctorTable.totalPages();
                if (this.doctorTable.currentPage() > totalPages && totalPages > 0) {
                    this.doctorTable.currentPage.set(totalPages);
                } else if (totalPages === 0) {
                    this.doctorTable.currentPage.set(1);
                }
            }
        });
    }

    onDeleteSelectedDoctors(selectedDoctors: DoctorRow[]): void {
        this.medicalService.deleteSelectedDoctors(selectedDoctors.map(d => d.id)).subscribe(() => {
            const selectedIds = new Set(selectedDoctors.map(d => d.id));
            const current = this.doctors();
            const filtered = current.filter(d => !selectedIds.has(d.id));
            this.doctors.set(filtered.map((d, index) => ({ ...d, no: index + 1 })));

            if (this.doctorTable) {
                const totalPages = this.doctorTable.totalPages();
                if (this.doctorTable.currentPage() > totalPages && totalPages > 0) {
                    this.doctorTable.currentPage.set(totalPages);
                } else if (totalPages === 0) {
                    this.doctorTable.currentPage.set(1);
                }
            }
        });
    }

    onDoctorSaved(doctorData: Record<string, string>): void {
        const payload: Record<string, string | number> = { ...doctorData };
        if (this.selectedDoctorForEdit) {
            payload['id'] = this.selectedDoctorForEdit.id;
        }

        this.medicalService.saveDoctor(payload).subscribe({
            next: () => {
                this.loadDoctors();
                this.isAddDoctorModalOpen = false;
                if (this.doctorTable && !this.selectedDoctorForEdit) {
                    this.doctorTable.goToPage(this.doctorTable.totalPages());
                }
            },
            error: err => {
                console.error('[DashboardDoctorsComponent] Failed to save doctor:', err);
            }
        });
    }
}
