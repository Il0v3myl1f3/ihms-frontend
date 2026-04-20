import { Component, OnInit, inject, ViewChild, ChangeDetectionStrategy, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { timer } from 'rxjs';
import { Router } from '@angular/router';
import { MedicalService } from '../../../../services/medical.service';
import { AddDoctorComponent } from './add-doctor/add-doctor.component';
import { DoctorTableComponent } from './doctor-table/doctor-table.component';
import { Doctor } from '../../../../services/medical.service';

@Component({
    selector: 'app-dashboard-doctors',
    imports: [AddDoctorComponent, DoctorTableComponent],
    templateUrl: './dashboard-doctors.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardDoctorsComponent implements OnInit {
    @ViewChild(DoctorTableComponent) doctorTable!: DoctorTableComponent;

    isAddDoctorModalOpen = false;
    selectedDoctorForEdit: Doctor | null = null;
    isDoctorReadOnly = signal(false);

    public doctors = signal<Doctor[]>([]);
    public totalCount = signal<number>(0);
    private lastQuery: any = { pageNumber: 1, pageSize: 7, sortBy: 'no', sortOrder: 'asc' };

    public medicalService = inject(MedicalService);
    private router = inject(Router);
    private destroyRef = inject(DestroyRef);

    ngOnInit(): void {
        // Polling: Refresh from backend every 10 seconds
        timer(0, 10000).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
            this.refreshData();
        });
    }

    onQueryChange(query: any): void {
        this.lastQuery = query;
        this.refreshData();
    }

    private refreshData(): void {
        this.medicalService.getDoctorsPaged(this.lastQuery)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(res => {
                this.doctors.set(res.items);
                this.totalCount.set(res.totalCount);
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

    onEditDoctor(doctor: Doctor): void {
        this.selectedDoctorForEdit = doctor;
        this.isDoctorReadOnly.set(false);
        this.isAddDoctorModalOpen = true;
    }

    onViewDoctor(doctor: Doctor): void {
        this.router.navigate(['/dashboard/doctors', doctor.id]);
    }

    onDeleteDoctor(doctor: Doctor): void {
        this.medicalService.deleteDoctor(doctor.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
            this.refreshData();
        });
    }

    onDeleteSelectedDoctors(selectedDoctors: Doctor[]): void {
        this.medicalService.deleteSelectedDoctors(selectedDoctors.map(d => d.id)).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
            this.refreshData();
        });
    }


    onDoctorSaved(doctorData: Record<string, string>): void {
        const payload: Record<string, string | number> = { ...doctorData };
        if (this.selectedDoctorForEdit) {
            payload['id'] = this.selectedDoctorForEdit.id;
        }

        this.medicalService.saveDoctor(payload).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: () => {
                this.isAddDoctorModalOpen = false;
                this.refreshData();
            },
            error: err => {
                console.error('[DashboardDoctorsComponent] Failed to save doctor:', err);
            }
        });
    }
}
