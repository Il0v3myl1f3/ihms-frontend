import { Component, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { PatientTableComponent, Patient } from './patient-table/patient-table.component';
import { PatientCreateModalComponent } from './patient-create-modal/patient-create-modal.component';

@Component({
    selector: 'app-patient-list-page',
    imports: [PatientTableComponent, PatientCreateModalComponent],
    templateUrl: './patient-list-page.component.html',
    styleUrl: './patient-list-page.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush
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
        { id: 11, no: 11, name: 'Marvin McKinney', gender: 'Male', dob: '21/01/1986', address: '8642 Yake Cervies', phone: '(219) 555-0114', bloodType: 'A+', selected: false },
        { id: 12, no: 12, name: 'Jerome Bell', gender: 'Male', dob: '01/05/1980', address: '4140 Parker Rd. Allent.', phone: '(208) 555-0112', bloodType: 'O+', selected: false },
        { id: 13, no: 13, name: 'Kathryn Murphy', gender: 'Female', dob: '05/06/1995', address: '1901 Thornridge Cir.', phone: '(252) 555-0126', bloodType: 'AB-', selected: false },
        { id: 14, no: 14, name: 'Annette Black', gender: 'Female', dob: '02/11/1990', address: '8502 Preston Rd. Inglew.', phone: '(225) 555-0118', bloodType: 'B+', selected: false },
        { id: 15, no: 15, name: 'Bessie Cooper', gender: 'Female', dob: '19/04/1992', address: '2715 Ash Dr. San Jose', phone: '(480) 555-0103', bloodType: 'A-', selected: false },
        { id: 16, no: 16, name: 'Guy Hawkins', gender: 'Male', dob: '14/10/1984', address: '6391 Elgin St. Celina', phone: '(704) 555-0127', bloodType: 'O-', selected: false },
        { id: 17, no: 17, name: 'Wade Warren', gender: 'Male', dob: '21/04/1992', address: '3891 Ranchview Dr.', phone: '(217) 555-0113', bloodType: 'O+', selected: false },
        { id: 18, no: 18, name: 'Esther Howard', gender: 'Female', dob: '30/12/1987', address: '2464 Royal Ln. Mesa', phone: '(480) 555-0103', bloodType: 'A-', selected: false },
        { id: 19, no: 19, name: 'Theresa Webb', gender: 'Female', dob: '29/03/1991', address: '1901 Thornridge Cir.', phone: '(319) 555-0115', bloodType: 'AB+', selected: false },
        { id: 20, no: 20, name: 'Darrell Steward', gender: 'Male', dob: '04/09/1996', address: '8502 Preston Rd. Inglew.', phone: '(208) 555-0112', bloodType: 'O+', selected: false },
        { id: 21, no: 21, name: 'Cody Fisher', gender: 'Male', dob: '21/10/1988', address: '2715 Ash Dr. San Jose', phone: '(704) 555-0127', bloodType: 'B-', selected: false },
        { id: 22, no: 22, name: 'Savannah Nguyen', gender: 'Female', dob: '05/06/1995', address: '4140 Parker Rd. Allent.', phone: '(252) 555-0126', bloodType: 'B+', selected: false },
        { id: 23, no: 23, name: 'Brooklyn Simmons', gender: 'Female', dob: '11/12/1990', address: '6391 Elgin St. Celina', phone: '(704) 555-0127', bloodType: 'A+', selected: false },
        { id: 24, no: 24, name: 'Cameron Williamson', gender: 'Male', dob: '14/10/1984', address: '4641 Washington Ave.', phone: '(319) 555-0115', bloodType: 'O-', selected: false },
        { id: 25, no: 25, name: 'Jenny Wilson', gender: 'Female', dob: '30/12/1987', address: '8502 Preston Rd. Inglew.', phone: '(225) 555-0118', bloodType: 'AB-', selected: false },
        { id: 26, no: 26, name: 'Robert Fox', gender: 'Male', dob: '02/11/1990', address: '2972 Westheimer Rd.', phone: '(603) 555-0123', bloodType: 'A-', selected: false },
        { id: 27, no: 27, name: 'Ralph Edwards', gender: 'Male', dob: '19/04/1992', address: '4140 Parker Rd. Allent.', phone: '(252) 555-0126', bloodType: 'A+', selected: false },
        { id: 28, no: 28, name: 'Arlene McCoy', gender: 'Female', dob: '21/04/1992', address: '2715 Ash Dr. San Jose', phone: '(704) 555-0127', bloodType: 'O+', selected: false },
        { id: 29, no: 29, name: 'Eduardo Miles', gender: 'Male', dob: '31/09/1986', address: '8642 Yake Cervies', phone: '(219) 555-0114', bloodType: 'B+', selected: false },
        { id: 30, no: 30, name: 'Gloria Henry', gender: 'Female', dob: '29/03/1991', address: '3891 Ranchview Dr.', phone: '(217) 555-0113', bloodType: 'A+', selected: false },
        { id: 31, no: 31, name: 'Arthur Jones', gender: 'Male', dob: '14/10/1984', address: '2464 Royal Ln. Mesa', phone: '(480) 555-0103', bloodType: 'AB+', selected: false },
        { id: 32, no: 32, name: 'Hannah Pena', gender: 'Female', dob: '04/09/1996', address: '6391 Elgin St. Celina', phone: '(704) 555-0127', bloodType: 'A+', selected: false },
        { id: 33, no: 33, name: 'Ian Alexander', gender: 'Male', dob: '01/05/1980', address: '1901 Thornridge Cir.', phone: '(319) 555-0115', bloodType: 'O-', selected: false },
        { id: 34, no: 34, name: 'Julia Russell', gender: 'Female', dob: '05/06/1995', address: '4641 Washington Ave.', phone: '(319) 555-0115', bloodType: 'B+', selected: false },
        { id: 35, no: 35, name: 'Kevin Lane', gender: 'Male', dob: '21/10/1988', address: '8502 Preston Rd. Inglew.', phone: '(225) 555-0118', bloodType: 'A+', selected: false },
        { id: 36, no: 36, name: 'Lillian Watson', gender: 'Female', dob: '11/12/1990', address: '2972 Westheimer Rd.', phone: '(603) 555-0123', bloodType: 'O+', selected: false },
        { id: 37, no: 37, name: 'Mason Miles', gender: 'Male', dob: '14/10/1984', address: '4140 Parker Rd. Allent.', phone: '(252) 555-0126', bloodType: 'A+', selected: false },
        { id: 38, no: 38, name: 'Nora Henry', gender: 'Female', dob: '30/12/1987', address: '8502 Preston Rd. Inglew.', phone: '(208) 555-0112', bloodType: 'B+', selected: false },
        { id: 39, no: 39, name: 'Oscar Flores', gender: 'Male', dob: '19/04/1992', address: '2715 Ash Dr. San Jose', phone: '(704) 555-0127', bloodType: 'AB+', selected: false },
        { id: 40, no: 40, name: 'Penelope McKinney', gender: 'Female', dob: '21/04/1992', address: '8642 Yake Cervies', phone: '(219) 555-0114', bloodType: 'A+', selected: false }
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
            const totalPages = this.patientTable.totalPages();
            if (this.patientTable.currentPage() > totalPages && totalPages > 0) {
                this.patientTable.currentPage.set(totalPages);
            } else if (totalPages === 0) {
                this.patientTable.currentPage.set(1);
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
            const totalPages = this.patientTable.totalPages();
            if (this.patientTable.currentPage() > totalPages && totalPages > 0) {
                this.patientTable.currentPage.set(totalPages);
            } else if (totalPages === 0) {
                this.patientTable.currentPage.set(1);
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
                this.patientTable.goToPage(this.patientTable.totalPages());
            }
        }
    }
}
