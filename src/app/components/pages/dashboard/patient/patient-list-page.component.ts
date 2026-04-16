import { Component, ViewChild, ChangeDetectionStrategy, inject, ChangeDetectorRef, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { PatientTableComponent, Patient } from './patient-table/patient-table.component';
import { PatientCreateModalComponent } from './patient-create-modal/patient-create-modal.component';
import { PatientService } from '../../../../services/patient.service';

@Component({
    selector: 'app-patient-list-page',
    imports: [PatientTableComponent, PatientCreateModalComponent],
    templateUrl: './patient-list-page.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PatientListPageComponent {
    private router = inject(Router);
    private patientService = inject(PatientService);
    private cdr = inject(ChangeDetectorRef);
    private destroyRef = inject(DestroyRef);

    @ViewChild(PatientTableComponent) patientTable!: PatientTableComponent;

    patients = this.patientService.patients;

    constructor() {
        this.patientService.getPatients().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
    }



    selectedPatientForEdit: Patient | null = null;
    isAddPatientModalOpen = false;

    openAddPatientModal() {
        this.selectedPatientForEdit = null;
        this.isAddPatientModalOpen = true;
    }

    closeAddPatientModal() {
        this.isAddPatientModalOpen = false;
    }

    onEditPatient(patient: Patient) {
        this.selectedPatientForEdit = patient;
        this.isAddPatientModalOpen = true;
    }

    onViewPatient(patient: Patient) {
        this.router.navigate(['/dashboard/patient', patient.id]);
    }

    onDeletePatient(patient: Patient) {
        this.patientService.deletePatient(patient.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
            if (this.patientTable) {
                const totalPages = this.patientTable.totalPages();
                if (this.patientTable.currentPage() > totalPages && totalPages > 0) {
                    this.patientTable.currentPage.set(totalPages);
                } else if (totalPages === 0) {
                    this.patientTable.currentPage.set(1);
                }
            }
        });
    }

    onDeleteSelectedPatients(selectedPatients: Patient[]) {
        this.patientService.deleteSelectedPatients(selectedPatients.map(p => p.id)).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
            if (this.patientTable) {
                const totalPages = this.patientTable.totalPages();
                if (this.patientTable.currentPage() > totalPages && totalPages > 0) {
                    this.patientTable.currentPage.set(totalPages);
                } else if (totalPages === 0) {
                    this.patientTable.currentPage.set(1);
                }
            }
        });
    }

    onPatientSaved(patientData: Record<string, string>) {
        this.patientService.savePatient({
            ...patientData,
            id: this.selectedPatientForEdit?.id
        }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
            this.isAddPatientModalOpen = false;

            if (this.patientTable) {
                if (!this.selectedPatientForEdit) {
                    this.patientTable.goToPage(this.patientTable.totalPages());
                }
            }
        });
    }
}
