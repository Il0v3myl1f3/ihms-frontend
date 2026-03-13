import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientTableComponent, Patient } from './patient-table/patient-table.component';
import { PatientCreateModalComponent } from './patient-create-modal/patient-create-modal.component';

@Component({
    selector: 'app-patient-list-page',
    imports: [CommonModule, PatientTableComponent, PatientCreateModalComponent],
    templateUrl: './patient-list-page.component.html',
    styleUrl: './patient-list-page.component.css'
})
export class PatientListPageComponent {
    @ViewChild(PatientTableComponent) patientTable!: PatientTableComponent;

    patients: Patient[] = [
        { id: 1, no: 1, name: 'Jane Robertson', gender: 'Female', dob: '11/12/1990', address: '3891 Ranchview Dr.', phone: '(217) 555-0113', bloodType: 'A+', selected: false },
        { id: 2, no: 2, name: 'Jacob Jones', gender: 'Male', dob: '14/10/1984', address: '2464 Royal Ln. Mesa', phone: '(480) 555-0103', bloodType: 'A+', selected: false },
        { id: 3, no: 3, name: 'Eleanor Pena', gender: 'Female', dob: '14/10/1984', address: '6391 Elgin St. Celina', phone: '(704) 555-0127', bloodType: 'A+', selected: false },
        { id: 4, no: 4, name: 'Leslie Alexander', gender: 'Female', dob: '30/12/1987', address: '1901 Thornridge Cir.', phone: '(319) 555-0115', bloodType: 'A+', selected: false },
        { id: 5, no: 5, name: 'Dianne Russell', gender: 'Female', dob: '19/04/1994', address: '4641 Washington Ave.', phone: '(319) 555-0115', bloodType: 'A+', selected: false },
        { id: 6, no: 6, name: 'Devon Lane', gender: 'Male', dob: '21/04/1992', address: '8502 Preston Rd. Inglew.', phone: '(225) 555-0118', bloodType: 'A+', selected: false },
        { id: 7, no: 7, name: 'Kristin Watson', gender: 'Female', dob: '04/09/1996', address: '2972 Westheimer Rd.', phone: '(603) 555-0123', bloodType: 'A+', selected: false },
        { id: 8, no: 8, name: 'Floyd Miles', gender: 'Male', dob: '21/10/1988', address: '4140 Parker Rd. Allent.', phone: '(252) 555-0126', bloodType: 'A+', selected: false },
        { id: 9, no: 9, name: 'Courtney Henry', gender: 'Female', dob: '31/09/1986', address: '8502 Preston Rd. Inglew.', phone: '(208) 555-0112', bloodType: 'A+', selected: false },
        { id: 10, no: 10, name: 'Albert Flores', gender: 'Male', dob: '29/03/1991', address: '2715 Ash Dr. San Jose', phone: '(704) 555-0127', bloodType: 'A+', selected: false },
        { id: 11, no: 11, name: 'Marvin McKinney', gender: 'Male', dob: '21/01/1986', address: '8642 Yake Cervies', phone: '(219) 555-0114', bloodType: 'A+', selected: false }
    ];

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

    onDeletePatient(patient: Patient) {
        this.patients = this.patients.filter(p => p.id !== patient.id);

        this.patients = this.patients.map((p, index) => ({
            ...p,
            no: index + 1
        }));

        if (this.patientTable) {
            const totalPages = this.patientTable.totalPages;
            if (this.patientTable.currentPage > totalPages && totalPages > 0) {
                this.patientTable.currentPage = totalPages;
            } else if (totalPages === 0) {
                this.patientTable.currentPage = 1;
            }
        }
    }

    onDeleteSelectedPatients(selectedPatients: Patient[]) {
        const selectedIds = new Set(selectedPatients.map(p => p.id));
        this.patients = this.patients.filter(p => !selectedIds.has(p.id));

        this.patients = this.patients.map((p, index) => ({
            ...p,
            no: index + 1
        }));

        if (this.patientTable) {
            const totalPages = this.patientTable.totalPages;
            if (this.patientTable.currentPage > totalPages && totalPages > 0) {
                this.patientTable.currentPage = totalPages;
            } else if (totalPages === 0) {
                this.patientTable.currentPage = 1;
            }
        }
    }

    onPatientSaved(patientData: Record<string, string>) {
        if (this.selectedPatientForEdit) {
            const index = this.patients.findIndex(p => p.id === this.selectedPatientForEdit!.id);
            if (index !== -1) {
                const updatedPatients = [...this.patients];
                updatedPatients[index] = { ...updatedPatients[index], ...patientData };
                this.patients = updatedPatients;
            }
        } else {
            const newId = this.patients.length > 0 ? Math.max(...this.patients.map(p => p.id)) + 1 : 1;
            const newNo = this.patients.length > 0 ? Math.max(...this.patients.map(p => p.no)) + 1 : 1;
            const newPatient: Patient = {
                id: newId,
                no: newNo,
                name: patientData['name'],
                gender: patientData['gender'] as 'Male' | 'Female',
                dob: patientData['dob'],
                address: patientData['address'],
                phone: patientData['phone'],
                bloodType: patientData['bloodType'],
                selected: false
            };
            this.patients = [...this.patients, newPatient];
        }

        this.isAddPatientModalOpen = false;

        if (this.patientTable) {
            if (!this.selectedPatientForEdit) {
                this.patientTable.goToPage(this.patientTable.totalPages);
            }
        }
    }
}
