import { Component, ViewChild, ChangeDetectionStrategy, inject, ChangeDetectorRef, DestroyRef, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { timer } from 'rxjs';
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
export class PatientListPageComponent implements OnInit {
    private router = inject(Router);
    private patientService = inject(PatientService);
    private cdr = inject(ChangeDetectorRef);
    private destroyRef = inject(DestroyRef);

    @ViewChild(PatientTableComponent) patientTable!: PatientTableComponent;

    patients = signal<Patient[]>([]);
    totalCount = signal<number>(0);
    private lastQuery: any = { pageNumber: 1, pageSize: 7, sortBy: 'no', sortOrder: 'asc' };

    ngOnInit(): void {
        // Polling: Refresh from backend every 10 seconds using last query
        timer(0, 10000).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
            this.refreshData();
        });
    }

    onQueryChange(query: any): void {
        this.lastQuery = query;
        this.refreshData();
    }

    private refreshData(): void {
        this.patientService.getPatientsPaged(this.lastQuery)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(res => {
                this.patients.set(res.items);
                this.totalCount.set(res.totalCount);
                this.cdr.markForCheck();
            });
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
            this.refreshData();
        });
    }

    onDeleteSelectedPatients(selectedPatients: Patient[]) {
        this.patientService.deleteSelectedPatients(selectedPatients.map(p => p.id)).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
            this.refreshData();
        });
    }

    onPatientSaved(patientData: Record<string, string>) {
        this.patientService.savePatient({
            ...patientData,
            id: this.selectedPatientForEdit?.id
        }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
            this.isAddPatientModalOpen = false;
            this.refreshData();
        });
    }
}
