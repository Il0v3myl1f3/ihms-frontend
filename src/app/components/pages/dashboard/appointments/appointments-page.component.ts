import { Component, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef, inject, signal } from '@angular/core';
import { MedicalService, Doctor } from '../../../../services/medical.service';
import { AppointmentTableComponent, Appointment } from './appointment-table/appointment-table.component';
import { AppointmentCreateModalComponent } from './appointment-create-modal/appointment-create-modal.component';
import { AppointmentService } from '../../../../services/appointment.service';
import { PatientService } from '../../../../services/patient.service';
import { Patient } from '../patient/patient-table/patient-table.component';

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
    private patientService = inject(PatientService);
    private cdr = inject(ChangeDetectorRef);

    doctors = signal<Doctor[]>([]);
    patients = signal<Patient[]>([]);
    appointments = signal<Appointment[]>([]);

    selectedAppointmentForEdit = signal<Appointment | null>(null);
    isModalOpen = signal(false);
    isAppointmentReadOnly = signal(false);

    constructor() {
        this.medicalService.getDoctors().subscribe((docs: Doctor[]) => {
            this.doctors.set(docs);
        });
        this.patientService.getPatients().subscribe((pats: Patient[]) => {
            this.patients.set(pats);
        });
        this.loadAppointments();
    }

    private loadAppointments() {
        this.appointmentService.getAppointments().subscribe((a: Appointment[]) => {
            this.appointments.set(a);
            this.cdr.markForCheck();
        });
    }

    openCreateModal(): void {
        this.selectedAppointmentForEdit.set(null);
        this.isAppointmentReadOnly.set(false);
        this.isModalOpen.set(true);
    }

    closeModal(): void {
        this.isModalOpen.set(false);
    }

    onEditAppointment(appointment: Appointment): void {
        this.selectedAppointmentForEdit.set(appointment);
        this.isAppointmentReadOnly.set(false);
        this.isModalOpen.set(true);
    }

    onViewAppointment(appointment: Appointment): void {
        this.selectedAppointmentForEdit.set(appointment);
        this.isAppointmentReadOnly.set(true);
        this.isModalOpen.set(true);
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
        const isNew = !this.selectedAppointmentForEdit();
        this.appointmentService.saveAppointment({
            ...data,
            id: this.selectedAppointmentForEdit()?.id
        }).subscribe({
            next: () => {
                this.isModalOpen.set(false);
                this.selectedAppointmentForEdit.set(null);
                this.loadAppointments();
            },
            error: (err) => {
                console.error('Failed to save appointment:', err);
            }
        });
    }
}
