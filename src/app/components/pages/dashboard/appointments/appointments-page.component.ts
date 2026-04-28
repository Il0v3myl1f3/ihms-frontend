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
import { AuthService } from '../../../../services/auth.service';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';

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
    private authService = inject(AuthService);
    private cdr = inject(ChangeDetectorRef);
    private destroyRef = inject(DestroyRef);

    doctors = signal<Doctor[]>([]);
    patients = signal<Patient[]>([]);
    appointments = signal<Appointment[]>([]);
    totalCount = signal<number>(0);
    private lastQuery: any = { pageNumber: 1, pageSize: 7, sortBy: 'no', sortOrder: 'asc' };

    selectedAppointmentForEdit = signal<Appointment | null>(null);
    selectedAppointmentForRecord = signal<Appointment | null>(null);
    isModalOpen = signal(false);
    isRecordModalOpen = signal(false);
    isAppointmentReadOnly = signal(false);

    constructor() {}

    ngOnInit(): void {
        const user = this.authService.getCurrentUser();

        this.medicalService.getDoctors().pipe(
            takeUntilDestroyed(this.destroyRef),
            catchError(() => of([]))
        ).subscribe((docs: Doctor[]) => {
            this.doctors.set(docs);
        });

        // Only fetch all patients if the user is an admin or doctor
        if (user && (user.role === 'admin' || user.role === 'doctor')) {
            this.patientService.getPatients().pipe(
                takeUntilDestroyed(this.destroyRef),
                catchError(() => of([]))
            ).subscribe((pats: Patient[]) => {
                this.patients.set(pats);
            });
        }

        // Polling: Refresh from backend every 10 seconds
        timer(0, 10000).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
            this.refreshData();
        });
    }

    onQueryChange(query: any): void {
        this.lastQuery = query;
        this.refreshData();
    }

    private refreshData(): void {
        this.appointmentService.getAppointmentsPaged(this.lastQuery)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(res => {
                this.appointments.set(res.items);
                this.totalCount.set(res.totalCount);
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
            this.refreshData();
        });
    }

    onDeleteSelectedAppointments(selectedAppointments: Appointment[]): void {
        this.appointmentService.deleteSelectedAppointments(selectedAppointments.map(a => a.id)).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
            this.refreshData();
        });
    }

    onAppointmentSaved(data: Record<string, string>): void {
        this.appointmentService.saveAppointment({
            ...data,
            id: this.selectedAppointmentForEdit()?.id
        }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: () => {
                this.isModalOpen.set(false);
                this.selectedAppointmentForEdit.set(null);
                this.refreshData();
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


