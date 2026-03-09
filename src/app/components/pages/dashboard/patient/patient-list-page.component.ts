import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientTableComponent } from './patient-table/patient-table.component';
import { PatientCreateModalComponent } from './patient-create-modal/patient-create-modal.component';

@Component({
    selector: 'app-patient-list-page',
    standalone: true,
    imports: [CommonModule, PatientTableComponent, PatientCreateModalComponent],
    templateUrl: './patient-list-page.component.html',
    styleUrl: './patient-list-page.component.css'
})
export class PatientListPageComponent {
    isAddPatientModalOpen = false;

    openAddPatientModal() {
        this.isAddPatientModalOpen = true;
    }

    closeAddPatientModal() {
        this.isAddPatientModalOpen = false;
    }

    onPatientSaved(patientData: any) {
        // In a real app, we would add this to a shared service or local state.
        console.log('New patient data:', patientData);
        this.isAddPatientModalOpen = false;
    }
}
