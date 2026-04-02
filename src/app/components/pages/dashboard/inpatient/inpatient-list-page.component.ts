import { Component, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { InpatientTableComponent, Inpatient } from './inpatient-table/inpatient-table.component';
import { InpatientCreateModalComponent } from './inpatient-create-modal/inpatient-create-modal.component';

@Component({
    selector: 'app-inpatient-list-page',
    imports: [InpatientTableComponent, InpatientCreateModalComponent],
    templateUrl: './inpatient-list-page.component.html',
    styleUrl: './inpatient-list-page.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class InpatientListPageComponent {
    @ViewChild(InpatientTableComponent) inpatientTable!: InpatientTableComponent;

    inpatients: Inpatient[] = [
        { id: 1, no: 1, patientName: 'Jane Robertson', roomNumber: 'A-102', doctorName: 'Dr. Mia Kensington', admissionDate: '02/01/2026', dischargeDate: '', status: 'Admitted', diagnosis: 'Pneumonia', selected: false },
        { id: 2, no: 2, patientName: 'Jacob Jones', roomNumber: 'B-201', doctorName: 'Dr. Oliver Westwood', admissionDate: '05/01/2026', dischargeDate: '12/01/2026', status: 'Discharged', diagnosis: 'Appendectomy recovery', selected: false },
        { id: 3, no: 3, patientName: 'Eleanor Pena', roomNumber: 'B-204', doctorName: 'Dr. Sophia Langley', admissionDate: '08/01/2026', dischargeDate: '', status: 'Critical', diagnosis: 'Cardiac arrhythmia', selected: false },
        { id: 4, no: 4, patientName: 'Leslie Alexander', roomNumber: 'C-301', doctorName: 'Dr. Amelia Hawthorne', admissionDate: '10/01/2026', dischargeDate: '18/01/2026', status: 'Discharged', diagnosis: 'Knee replacement surgery', selected: false },
        { id: 5, no: 5, patientName: 'Dianne Russell', roomNumber: 'A-104', doctorName: 'Dr. Clara Whitmore', admissionDate: '12/01/2026', dischargeDate: '', status: 'Admitted', diagnosis: 'Severe dehydration', selected: false },
        { id: 6, no: 6, patientName: 'Devon Lane', roomNumber: 'B-202', doctorName: 'Dr. Elijah Stone', admissionDate: '14/01/2026', dischargeDate: '', status: 'Admitted', diagnosis: 'Fractured femur', selected: false },
        { id: 7, no: 7, patientName: 'Kristin Watson', roomNumber: 'C-304', doctorName: 'Dr. Nathaniel Rivers', admissionDate: '15/01/2026', dischargeDate: '', status: 'Transferred', diagnosis: 'Renal failure — transferred to ICU', selected: false },
        { id: 8, no: 8, patientName: 'Floyd Miles', roomNumber: 'E-501', doctorName: 'Dr. Victoria Ashford', admissionDate: '17/01/2026', dischargeDate: '24/01/2026', status: 'Discharged', diagnosis: 'Post-surgery observation', selected: false },
        { id: 9, no: 9, patientName: 'Courtney Henry', roomNumber: 'B-203', doctorName: 'Dr. Lily Fairchild', admissionDate: '18/01/2026', dischargeDate: '', status: 'Critical', diagnosis: 'Acute respiratory distress', selected: false },
        { id: 10, no: 10, patientName: 'Albert Flores', roomNumber: 'D-403', doctorName: 'Dr. Samuel Brightman', admissionDate: '20/01/2026', dischargeDate: '', status: 'Admitted', diagnosis: 'Diabetic ketoacidosis', selected: false },
        { id: 11, no: 11, patientName: 'Marvin McKinney', roomNumber: 'A-101', doctorName: 'Dr. Mia Kensington', admissionDate: '21/01/2026', dischargeDate: '28/01/2026', status: 'Discharged', diagnosis: 'Bronchitis treatment', selected: false },
        { id: 12, no: 12, patientName: 'Jerome Bell', roomNumber: 'B-201', doctorName: 'Dr. Oliver Westwood', admissionDate: '23/01/2026', dischargeDate: '', status: 'Admitted', diagnosis: 'Hip replacement surgery', selected: false },
        { id: 13, no: 13, patientName: 'Kathryn Murphy', roomNumber: 'C-302', doctorName: 'Dr. Sophia Langley', admissionDate: '25/01/2026', dischargeDate: '', status: 'Transferred', diagnosis: 'Neurological assessment', selected: false },
        { id: 14, no: 14, patientName: 'Annette Black', roomNumber: 'D-401', doctorName: 'Dr. Amelia Hawthorne', admissionDate: '27/01/2026', dischargeDate: '', status: 'Critical', diagnosis: 'Sepsis', selected: false },
        { id: 15, no: 15, patientName: 'Bessie Cooper', roomNumber: 'E-502', doctorName: 'Dr. Clara Whitmore', admissionDate: '28/01/2026', dischargeDate: '05/02/2026', status: 'Discharged', diagnosis: 'Gallbladder removal', selected: false },
        { id: 16, no: 16, patientName: 'Guy Hawkins', roomNumber: 'F-602', doctorName: 'Dr. Elijah Stone', admissionDate: '30/01/2026', dischargeDate: '', status: 'Admitted', diagnosis: 'Spinal cord compression', selected: false },
        { id: 17, no: 17, patientName: 'Wade Warren', roomNumber: 'A-103', doctorName: 'Dr. Nathaniel Rivers', admissionDate: '01/02/2026', dischargeDate: '', status: 'Admitted', diagnosis: 'Chronic obstructive pulmonary disease', selected: false },
        { id: 18, no: 18, patientName: 'Esther Howard', roomNumber: 'C-303', doctorName: 'Dr. Victoria Ashford', admissionDate: '03/02/2026', dischargeDate: '', status: 'Transferred', diagnosis: 'Liver biopsy — transferred to specialist', selected: false },
        { id: 19, no: 19, patientName: 'Theresa Webb', roomNumber: 'B-204', doctorName: 'Dr. Lily Fairchild', admissionDate: '05/02/2026', dischargeDate: '12/02/2026', status: 'Discharged', diagnosis: 'Urinary tract infection', selected: false },
        { id: 20, no: 20, patientName: 'Darrell Steward', roomNumber: 'D-402', doctorName: 'Dr. Samuel Brightman', admissionDate: '07/02/2026', dischargeDate: '', status: 'Admitted', diagnosis: 'Hypertensive crisis', selected: false },
        { id: 21, no: 21, patientName: 'Cody Fisher', roomNumber: 'E-503', doctorName: 'Dr. Mia Kensington', admissionDate: '09/02/2026', dischargeDate: '', status: 'Critical', diagnosis: 'Multiple organ dysfunction', selected: false },
        { id: 22, no: 22, patientName: 'Savannah Nguyen', roomNumber: 'F-603', doctorName: 'Dr. Oliver Westwood', admissionDate: '10/02/2026', dischargeDate: '17/02/2026', status: 'Discharged', diagnosis: 'Postpartum hemorrhage', selected: false },
        { id: 23, no: 23, patientName: 'Brooklyn Simmons', roomNumber: 'A-104', doctorName: 'Dr. Sophia Langley', admissionDate: '12/02/2026', dischargeDate: '', status: 'Admitted', diagnosis: 'Asthma exacerbation', selected: false },
        { id: 24, no: 24, patientName: 'Cameron Williamson', roomNumber: 'B-202', doctorName: 'Dr. Amelia Hawthorne', admissionDate: '14/02/2026', dischargeDate: '', status: 'Admitted', diagnosis: 'Deep vein thrombosis', selected: false },
        { id: 25, no: 25, patientName: 'Jenny Wilson', roomNumber: 'C-301', doctorName: 'Dr. Clara Whitmore', admissionDate: '15/02/2026', dischargeDate: '', status: 'Transferred', diagnosis: 'Cerebral hemorrhage — ICU transfer', selected: false },
    ];

    selectedInpatientForEdit: Inpatient | null = null;
    isAddInpatientModalOpen = false;

    openAddInpatientModal() {
        this.selectedInpatientForEdit = null;
        this.isAddInpatientModalOpen = true;
    }

    closeAddInpatientModal() {
        this.isAddInpatientModalOpen = false;
    }

    onEditInpatient(inpatient: Inpatient) {
        this.selectedInpatientForEdit = inpatient;
        this.isAddInpatientModalOpen = true;
    }

    onDeleteInpatient(inpatient: Inpatient) {
        this.inpatients = this.inpatients.filter(i => i.id !== inpatient.id);

        this.inpatients = this.inpatients.map((i, index) => ({
            ...i,
            no: index + 1
        }));

        if (this.inpatientTable) {
            const totalPages = this.inpatientTable.totalPages();
            if (this.inpatientTable.currentPage() > totalPages && totalPages > 0) {
                this.inpatientTable.currentPage.set(totalPages);
            } else if (totalPages === 0) {
                this.inpatientTable.currentPage.set(1);
            }
        }
    }

    onDeleteSelectedInpatients(selectedInpatients: Inpatient[]) {
        const selectedIds = new Set(selectedInpatients.map(i => i.id));
        this.inpatients = this.inpatients.filter(i => !selectedIds.has(i.id));

        this.inpatients = this.inpatients.map((i, index) => ({
            ...i,
            no: index + 1
        }));

        if (this.inpatientTable) {
            const totalPages = this.inpatientTable.totalPages();
            if (this.inpatientTable.currentPage() > totalPages && totalPages > 0) {
                this.inpatientTable.currentPage.set(totalPages);
            } else if (totalPages === 0) {
                this.inpatientTable.currentPage.set(1);
            }
        }
    }

    onInpatientSaved(inpatientData: Record<string, string>) {
        if (this.selectedInpatientForEdit) {
            const index = this.inpatients.findIndex(i => i.id === this.selectedInpatientForEdit!.id);
            if (index !== -1) {
                const updatedInpatients = [...this.inpatients];
                updatedInpatients[index] = { ...updatedInpatients[index], ...inpatientData };
                this.inpatients = updatedInpatients;
            }
        } else {
            const newId = this.inpatients.length > 0 ? Math.max(...this.inpatients.map(i => i.id)) + 1 : 1;
            const newNo = this.inpatients.length > 0 ? Math.max(...this.inpatients.map(i => i.no)) + 1 : 1;
            const newInpatient: Inpatient = {
                id: newId,
                no: newNo,
                patientName: inpatientData['patientName'],
                roomNumber: inpatientData['roomNumber'],
                doctorName: inpatientData['doctorName'],
                admissionDate: inpatientData['admissionDate'],
                dischargeDate: inpatientData['dischargeDate'] || '',
                status: inpatientData['status'] as Inpatient['status'],
                diagnosis: inpatientData['diagnosis'],
                selected: false
            };
            this.inpatients = [...this.inpatients, newInpatient];
        }

        this.isAddInpatientModalOpen = false;

        if (this.inpatientTable) {
            if (!this.selectedInpatientForEdit) {
                this.inpatientTable.goToPage(this.inpatientTable.totalPages());
            }
        }
    }
}
