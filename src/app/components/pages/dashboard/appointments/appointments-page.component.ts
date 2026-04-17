import { Component, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef, inject, signal, DestroyRef, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { timer } from 'rxjs';
import { MedicalService, Doctor } from '../../../../services/medical.service';
import { AppointmentTableComponent, Appointment } from './appointment-table/appointment-table.component';
import { AppointmentCreateModalComponent } from './appointment-create-modal/appointment-create-modal.component';
import { AppointmentService } from '../../../../services/appointment.service';
import { PatientService } from '../../../../services/patient.service';
import { MedicalRecordCreateModalComponent } from '../medical-records/medical-record-create-modal/medical-record-create-modal.component';
import { MedicalRecordService } from '../../../../services/medical-record.service';
import { Patient } from '../patient/patient-table/patient-table.component';

@Component({
    selector: 'app-appointments-page',
    imports: [AppointmentTableComponent, AppointmentCreateModalComponent, MedicalRecordCreateModalComponent],
    templateUrl: './appointments-page.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppointmentsPageComponent implements OnInit {
    @ViewChild(AppointmentTableComponent) appointmentTable!: AppointmentTableComponent;
 
    private medicalService = inject(MedicalService);
    private appointmentService = inject(AppointmentService);
    private patientService = inject(PatientService);
    private medicalRecordService = inject(MedicalRecordService);
    private cdr = inject(ChangeDetectorRef);
    private destroyRef = inject(DestroyRef);

    doctors = signal<Doctor[]>([]);
    patients = signal<Patient[]>([]);
    appointments = signal<Appointment[]>([]);

    selectedAppointmentForEdit = signal<Appointment | null>(null);
    selectedAppointmentForRecord = signal<Appointment | null>(null);
    isModalOpen = signal(false);
    isRecordModalOpen = signal(false);
    isAppointmentReadOnly = signal(false);

    constructor() {}

    ngOnInit(): void {
        this.medicalService.getDoctors().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((docs: Doctor[]) => {
            this.doctors.set(docs);
        });
        this.patientService.getPatients().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((pats: Patient[]) => {
            this.patients.set(pats);
        });

        // Polling: Refresh from backend every 30 seconds
        timer(0, 10000).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
            this.loadAppointments();
        });
    }

    private loadAppointments() {
        this.appointmentService.getAppointments().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((a: Appointment[]) => {
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

    onCreateMedicalRecord(appointment: Appointment): void {
        this.selectedAppointmentForRecord.set(appointment);
        this.isRecordModalOpen.set(true);
    }

    closeRecordModal(): void {
        this.isRecordModalOpen.set(false);
        this.selectedAppointmentForRecord.set(null);
    }

    onDeleteAppointment(appointment: Appointment): void {
        this.appointmentService.deleteAppointment(appointment.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
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
        this.appointmentService.deleteSelectedAppointments(selectedAppointments.map(a => a.id)).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
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
        }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
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

    onMedicalRecordSaved(data: any): void {
        this.medicalRecordService.createMedicalRecord(data).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: () => {
                this.closeRecordModal();
                // Optionally show a success toast here
            },
            error: (err) => {
                console.error('Failed to create medical record:', err);
            }
        });
    }
}
