import { Component, ViewChild, ChangeDetectionStrategy, inject } from '@angular/core';
import { MedicalService, Doctor } from '../../../../services/medical.service';
import { AppointmentTableComponent, Appointment } from './appointment-table/appointment-table.component';
import { AppointmentCreateModalComponent } from './appointment-create-modal/appointment-create-modal.component';


export const MOCK_APPOINTMENTS: Appointment[] = [
    { id: 1, no: 1, patientName: 'Jane Robertson', notes: "I've been feeling unwell for a few days. The symptoms include persistent headaches, fatigue, and a mild fever that comes and goes entirely  entirely  entirely  entirely  entirely  entirely  entirely unpredictably. I've been feeling unwell for a few days. The symptoms include persistent headaches, fatigue, and a mild fever that comes and goes entirely unpredictably.", doctorName: 'Dr. Mia Kensington', doctorImage: '', appointmentDate: 'January 10, 2026', status: 'Scheduled', selected: false },
    { id: 2, no: 2, patientName: 'Jane Robertson', notes: "Recurring headaches and dizziness mostly in the mornings. Patient also reports occasional blurry vision and sensitivity to bright lights over the past two weeks.", doctorName: 'Dr. Oliver Westwood', doctorImage: '', appointmentDate: 'January 25, 2026', status: 'Scheduled', selected: false },
    { id: 3, no: 3, patientName: 'Eleanor Pena', notes: "I've noticed some unusual bruising on my arms and legs even without major trauma. Also feeling quite physically exhausted after doing basic daily activities.", doctorName: 'Dr. Sophia Langley', doctorImage: '', appointmentDate: 'February 8, 2026', status: 'Scheduled', selected: false },
    { id: 4, no: 4, patientName: 'Leslie Alexander', notes: "I feel short of breath even when doing light physical work. There is a slight chest tightness during the night which makes it very hard to get a good sleep.", doctorName: 'Dr. Amelia Hawthorne', doctorImage: '', appointmentDate: 'February 20, 2026', status: 'Scheduled', selected: false },
    { id: 5, no: 5, patientName: 'Dianne Russell', notes: "I've been having stomach pains after every single meal for the past month. The pain is sharp and usually localized to the lower right abdomen, lasting hours.", doctorName: 'Dr. Clara Whitmore', doctorImage: '', appointmentDate: 'March 5, 2026', status: 'Scheduled', selected: false },
    { id: 6, no: 6, patientName: 'Devon Lane', notes: 'I keep experiencing sharp ch...', doctorName: 'Dr. Elijah Stone', doctorImage: '', appointmentDate: 'March 15, 2026', status: 'Scheduled', selected: false },
    { id: 7, no: 7, patientName: 'Kristin Watson', notes: "I've had a cough that lingers...", doctorName: 'Dr. Nathaniel Rivers', doctorImage: '', appointmentDate: 'March 22, 2026', status: 'Scheduled', selected: false },
    { id: 8, no: 8, patientName: 'Floyd Miles', notes: "I'm feeling unusually anxious...", doctorName: 'Dr. Victoria Ashford', doctorImage: '', appointmentDate: 'April 1, 2026', status: 'Cancelled', selected: false },
    { id: 9, no: 9, patientName: 'Courtney Henry', notes: "I've been getting night sweat...", doctorName: 'Dr. Lily Fairchild', doctorImage: '', appointmentDate: 'April 12, 2026', status: 'Scheduled', selected: false },
    { id: 10, no: 10, patientName: 'Albert Flores', notes: 'I feel like my heart is racing f...', doctorName: 'Dr. Samuel Brightman', doctorImage: '', appointmentDate: 'April 23, 2026', status: 'Scheduled', selected: false },
    { id: 11, no: 11, patientName: 'Sabrina Gomez', notes: "I've been feeling really fatigu...", doctorName: 'Dr. Mia Kensington', doctorImage: '', appointmentDate: 'May 5, 2026', status: 'Scheduled', selected: false },
    { id: 12, no: 12, patientName: 'Alexandra Smith', notes: 'I have a persistent headache...', doctorName: 'Dr. Oliver Westwood', doctorImage: '', appointmentDate: 'May 18, 2026', status: 'Cancelled', selected: false },
    { id: 13, no: 13, patientName: 'Benjamin Johnson', notes: "I've noticed some unusual br...", doctorName: 'Dr. Sophia Langley', doctorImage: '', appointmentDate: 'June 2, 2026', status: 'Scheduled', selected: false },
    { id: 14, no: 14, patientName: 'Avery Thompson', notes: 'I feel short of breath even w...', doctorName: 'Dr. Amelia Hawthorne', doctorImage: '', appointmentDate: 'June 15, 2026', status: 'Scheduled', selected: false },
    { id: 15, no: 15, patientName: 'Olivia Brown', notes: "I've been having stomach pa...", doctorName: 'Dr. Clara Whitmore', doctorImage: '', appointmentDate: 'July 1, 2026', status: 'Cancelled', selected: false },
    { id: 16, no: 16, patientName: 'Brandon Davis', notes: 'I keep experiencing sharp ch...', doctorName: 'Dr. Elijah Stone', doctorImage: '', appointmentDate: 'August 30, 2026', status: 'Scheduled', selected: false },
    { id: 17, no: 17, patientName: 'Amelia Wilson', notes: "I've had a cough that lingers...", doctorName: 'Dr. Nathaniel Rivers', doctorImage: '', appointmentDate: 'September 15, 2026', status: 'Cancelled', selected: false },
    { id: 18, no: 18, patientName: 'Charlotte Martinez', notes: "I'm feeling unusually anxious...", doctorName: 'Dr. Victoria Ashford', doctorImage: '', appointmentDate: 'October 22, 2026', status: 'Cancelled', selected: false },
    { id: 19, no: 19, patientName: 'Ethan Garcia', notes: "I've been getting night sweat...", doctorName: 'Dr. Lily Fairchild', doctorImage: '', appointmentDate: 'November 18, 2026', status: 'Scheduled', selected: false },
    { id: 20, no: 20, patientName: 'Sophia Rodriguez', notes: 'I feel like my heart is racing f...', doctorName: 'Dr. Samuel Brightman', doctorImage: '', appointmentDate: 'December 5, 2026', status: 'Scheduled', selected: false },
    { id: 21, no: 21, patientName: 'Lucas Lee', notes: "I've been experiencing frequ...", doctorName: 'Dr. Lucas Pendleton', doctorImage: '', appointmentDate: 'January 12, 2027', status: 'Completed', selected: false },
];

@Component({
    selector: 'app-appointments-page',
    imports: [AppointmentTableComponent, AppointmentCreateModalComponent],
    templateUrl: './appointments-page.component.html',
    styleUrl: './appointments-page.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppointmentsPageComponent {
    @ViewChild(AppointmentTableComponent) appointmentTable!: AppointmentTableComponent;

    private medicalService = inject(MedicalService);

    doctors: Doctor[] = [];

    patientNames: string[] = [
        'Jane Robertson', 'Jacob Jones', 'Eleanor Pena', 'Leslie Alexander',
        'Dianne Russell', 'Devon Lane', 'Kristin Watson', 'Floyd Miles',
        'Courtney Henry', 'Albert Flores', 'Sabrina Gomez', 'Alexandra Smith',
        'Benjamin Johnson', 'Avery Thompson', 'Olivia Brown', 'Brandon Davis',
        'Amelia Wilson', 'Charlotte Martinez', 'Ethan Garcia', 'Sophia Rodriguez',
        'Lucas Lee'
    ];

    appointments: Appointment[] = [...MOCK_APPOINTMENTS];

    selectedAppointmentForEdit: Appointment | null = null;
    isModalOpen = false;

    constructor() {
        this.medicalService.getDoctors().subscribe(docs => {
            this.doctors = docs;
        });
    }

    openCreateModal(): void {
        this.selectedAppointmentForEdit = null;
        this.isModalOpen = true;
    }

    closeModal(): void {
        this.isModalOpen = false;
    }

    onEditAppointment(appointment: Appointment): void {
        this.selectedAppointmentForEdit = appointment;
        this.isModalOpen = true;
    }

    onDeleteAppointment(appointment: Appointment): void {
        this.appointments = this.appointments
            .filter(a => a.id !== appointment.id)
            .map((a, i) => ({ ...a, no: i + 1 }));

        if (this.appointmentTable) {
            const totalPages = this.appointmentTable.totalPages();
            if (this.appointmentTable.currentPage() > totalPages && totalPages > 0) {
                this.appointmentTable.currentPage.set(totalPages);
            } else if (totalPages === 0) {
                this.appointmentTable.currentPage.set(1);
            }
        }
    }

    onDeleteSelectedAppointments(selectedAppointments: Appointment[]): void {
        const selectedIds = new Set(selectedAppointments.map(a => a.id));
        this.appointments = this.appointments
            .filter(a => !selectedIds.has(a.id))
            .map((a, i) => ({ ...a, no: i + 1 }));

        if (this.appointmentTable) {
            const totalPages = this.appointmentTable.totalPages();
            if (this.appointmentTable.currentPage() > totalPages && totalPages > 0) {
                this.appointmentTable.currentPage.set(totalPages);
            } else if (totalPages === 0) {
                this.appointmentTable.currentPage.set(1);
            }
        }
    }

    onAppointmentSaved(data: Record<string, string>): void {
        if (this.selectedAppointmentForEdit) {
            const dateStr = data['date']
                ? new Date(data['date']).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                : this.selectedAppointmentForEdit.appointmentDate;

            this.appointments = this.appointments.map(a =>
                a.id === this.selectedAppointmentForEdit!.id
                    ? {
                        ...a,
                        patientName: data['patientName'],
                        doctorName: data['doctorName'],
                        appointmentDate: dateStr,
                        status: data['status'] as Appointment['status'],
                        notes: data['notes'] || a.notes
                    }
                    : a
            );
        } else {
            const newId = this.appointments.length > 0 ? Math.max(...this.appointments.map(a => a.id)) + 1 : 1;
            const newNo = this.appointments.length > 0 ? Math.max(...this.appointments.map(a => a.no)) + 1 : 1;

            const dateObj = new Date(data['date']);
            const formattedDate = dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

            const newAppointment: Appointment = {
                id: newId,
                no: newNo,
                patientName: data['patientName'],
                notes: data['notes'] || 'No notes provided',
                doctorName: data['doctorName'],
                doctorImage: '',
                appointmentDate: formattedDate,
                status: data['status'] as Appointment['status'],
                selected: false
            };

            this.appointments = [...this.appointments, newAppointment];
        }

        this.isModalOpen = false;

        if (this.appointmentTable && !this.selectedAppointmentForEdit) {
            this.appointmentTable.goToPage(this.appointmentTable.totalPages());
        }
    }
}
