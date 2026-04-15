import { Component, ViewChild, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { MedicalService, Doctor } from '../../../../services/medical.service';
import { AppointmentTableComponent, Appointment } from './appointment-table/appointment-table.component';
import { AppointmentCreateModalComponent } from './appointment-create-modal/appointment-create-modal.component';
import { AppointmentService } from '../../../../services/appointment.service';

@Component({
    selector: 'app-appointments-page',
    imports: [AppointmentTableComponent, AppointmentCreateModalComponent],
    templateUrl: './appointments-page.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppointmentsPageComponent {
    @ViewChild(AppointmentTableComponent) appointmentTable!: AppointmentTableComponent;

    private medicalService = inject(MedicalService);
    private appointmentService = inject(AppointmentService);

    doctors: Doctor[] = [];

    patientNames: string[] = [
        'Jane Robertson', 'Jacob Jones', 'Eleanor Pena', 'Leslie Alexander',
        'Dianne Russell', 'Devon Lane', 'Kristin Watson', 'Floyd Miles',
        'Courtney Henry', 'Albert Flores', 'Sabrina Gomez', 'Alexandra Smith',
        'Benjamin Johnson', 'Avery Thompson', 'Olivia Brown', 'Brandon Davis',
        'Amelia Wilson', 'Charlotte Martinez', 'Ethan Garcia', 'Sophia Rodriguez',
        'Lucas Lee'
    ];

    appointments: Appointment[] = [];

    selectedAppointmentForEdit: Appointment | null = null;
    isModalOpen = false;
    isAppointmentReadOnly = signal(false);

    constructor() {
        this.medicalService.getDoctors().subscribe(docs => {
            this.doctors = docs;
        });
        this.loadAppointments();
    }

    private loadAppointments() {
        this.appointmentService.getAppointments().subscribe((a: Appointment[]) => this.appointments = a);
    }

    openCreateModal(): void {
        this.selectedAppointmentForEdit = null;
        this.isAppointmentReadOnly.set(false);
        this.isModalOpen = true;
    }

    closeModal(): void {
        this.isModalOpen = false;
    }

    onEditAppointment(appointment: Appointment): void {
        this.selectedAppointmentForEdit = appointment;
        this.isAppointmentReadOnly.set(false);
        this.isModalOpen = true;
    }

    onViewAppointment(appointment: Appointment): void {
        this.selectedAppointmentForEdit = appointment;
        this.isAppointmentReadOnly.set(true);
        this.isModalOpen = true;
    }

    onDeleteAppointment(appointment: Appointment): void {
        this.appointmentService.deleteAppointment(appointment.id).subscribe(() => {
            this.loadAppointments();
            if (this.appointmentTable) {
                const totalPages = this.appointmentTable.totalPages();
                if (this.appointmentTable.currentPage() > totalPages && totalPages > 0) {
                    this.appointmentTable.currentPage.set(totalPages);
                } else if (totalPages === 0) {
                    this.appointmentTable.currentPage.set(1);
                }
            }
        });
    }

    onDeleteSelectedAppointments(selectedAppointments: Appointment[]): void {
        this.appointmentService.deleteSelectedAppointments(selectedAppointments.map(a => a.id)).subscribe(() => {
            this.loadAppointments();
            if (this.appointmentTable) {
                const totalPages = this.appointmentTable.totalPages();
                if (this.appointmentTable.currentPage() > totalPages && totalPages > 0) {
                    this.appointmentTable.currentPage.set(totalPages);
                } else if (totalPages === 0) {
                    this.appointmentTable.currentPage.set(1);
                }
            }
        });
    }

    onAppointmentSaved(data: Record<string, string>): void {
        const dateStr = data['date'] && !data['date'].includes(',')
            ? new Date(data['date']).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
            : (data['date'] || this.selectedAppointmentForEdit?.appointmentDate || '');

        this.appointmentService.saveAppointment({
            ...data,
            id: this.selectedAppointmentForEdit?.id,
            appointmentDate: dateStr
        }).subscribe(() => {
            this.loadAppointments();
            this.isModalOpen = false;
            if (this.appointmentTable && !this.selectedAppointmentForEdit) {
                this.appointmentTable.goToPage(this.appointmentTable.totalPages());
            }
        });
    }
}
