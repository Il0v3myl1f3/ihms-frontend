import { Component, OnInit, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { LucideAngularModule, User, Calendar, Droplet, Phone, MapPin, ArrowLeft, MoreHorizontal, Pill, FileText, Paperclip, Eye, Edit2 } from 'lucide-angular';
import { MedicalService, Doctor } from '../../../../../services/medical.service';
import { AppointmentTableComponent, Appointment } from '../../appointments/appointment-table/appointment-table.component';
import { AppointmentCreateModalComponent } from '../../appointments/appointment-create-modal/appointment-create-modal.component';
import { PatientService } from '../../../../../services/patient.service';
import { Patient } from '../patient-table/patient-table.component';
import { AppointmentService } from '../../../../../services/appointment.service';
import { PrescriptionService } from '../../../../../services/prescription.service';
import { MedicalRecordService } from '../../../../../services/medical-record.service';
import { AuthService } from '../../../../../services/auth.service';
import { MedicalRecord } from '../../medical-records/medical-records-page.component';
import { MedicalRecordCreateModalComponent } from '../../medical-records/medical-record-create-modal/medical-record-create-modal.component';

export interface PatientPrescription {
    id: number;
    medication: string;
    dosage: string;
    frequency: string;
    status: 'Active' | 'Expired' | 'Completed';
    refills: number;
    instructions: string;
    startDate: string;
    endDate: string;
}

@Component({
    selector: 'app-patient-details-page',
    standalone: true,
    imports: [CommonModule, LucideAngularModule, AppointmentTableComponent, AppointmentCreateModalComponent, MedicalRecordCreateModalComponent],
    templateUrl: './patient-details-page.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PatientDetailsPageComponent implements OnInit {
    route = inject(ActivatedRoute);
    router = inject(Router);
    medicalService = inject(MedicalService);
    patientService = inject(PatientService);
    appointmentService = inject(AppointmentService);
    prescriptionService = inject(PrescriptionService);
    medicalRecordService = inject(MedicalRecordService);
    authService = inject(AuthService);

    isDoctor = computed(() => this.authService.getCurrentUser()?.role === 'doctor');

    // Icons
    User = User;
    Calendar = Calendar;
    Droplet = Droplet;
    Phone = Phone;
    MapPin = MapPin;
    ArrowLeft = ArrowLeft;
    MoreHorizontal = MoreHorizontal;
    Pill = Pill;
    FileText = FileText;
    Paperclip = Paperclip;
    Eye = Eye;
    Edit2 = Edit2;

    activeTab = signal('General Info');
    tabs = ['General Info', 'Appointments', 'Medical Records', 'Prescriptions'];

    patient = signal<Patient | null>(null);

    // Mock data (we will pull based on route id, ideally from a service)
    patientAppointments = signal<Appointment[]>([]);
    patientPrescriptions = signal<PatientPrescription[]>([]);
    patientMedicalRecords = signal<MedicalRecord[]>([]);;
    doctors: Doctor[] = [];

    // Modal state
    isAppointmentModalOpen = signal(false);
    selectedAppointmentForEdit = signal<Appointment | null>(null);
    selectedAppointmentForRecord = signal<Appointment | null>(null);
    isAppointmentReadOnly = signal(false);

    // Medical Record Modal
    isMedicalRecordModalOpen = signal(false);
    selectedMedicalRecord = signal<MedicalRecord | null>(null);
    isMedicalRecordReadOnly = signal(false);

    totalBookings = computed(() => this.patientAppointments().length);

    lastVisited = computed(() => {
        const completed = this.patientAppointments()
            .filter(a => a.status === 'Completed')
            .sort((a, b) => new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime());
        return completed.length > 0 ? completed[0].appointmentDate : 'No visits yet';
    });

    upcomingAppointments = computed(() =>
        this.patientAppointments().filter(a => a.status === 'Scheduled')
    );

    ngOnInit() {
        this.route.paramMap.subscribe(params => {
            const idParam = params.get('id');
            if (idParam) {
                this.loadPatientData(idParam);
            }
        });

        this.medicalService.getDoctors().subscribe(docs => {
            this.doctors = docs;
        });
    }

    loadPatientData(id: string) {
        this.patientService.getPatientById(id).subscribe(p => {
            this.patient.set(p);
            this.appointmentService.getAppointmentsByPatientName(p.name).subscribe(items => {
                this.patientAppointments.set(items);
            });

            this.medicalRecordService.getMedicalRecords(p.id).subscribe(records => {
                this.patientMedicalRecords.set(records);
            });
        });

        this.prescriptionService.getPrescriptions().subscribe(items => {
            const mapped: PatientPrescription[] = items.map(item => ({
                id: item.id,
                medication: item.medication,
                dosage: item.dosage,
                frequency: item.frequency,
                status: item.status,
                refills: 0,
                instructions: 'Follow doctor recommendation',
                startDate: item.startDate,
                endDate: item.endDate
            }));
            this.patientPrescriptions.set(mapped);
        });
    }

    setTab(tab: string) {
        this.activeTab.set(tab);
    }

    goBack() {
        this.router.navigate(['/dashboard/patient']);
    }

    // Appointment Handlers
    onViewAppointment(appointment: Appointment) {
        this.selectedAppointmentForEdit.set(appointment);
        this.isAppointmentReadOnly.set(true);
        this.isAppointmentModalOpen.set(true);
    }

    onEditAppointment(appointment: Appointment) {
        this.selectedAppointmentForEdit.set(appointment);
        this.isAppointmentReadOnly.set(false);
        this.isAppointmentModalOpen.set(true);
    }

    onDeleteAppointment(appointment: Appointment) {
        if (confirm(`Are you sure you want to delete appointment #${appointment.no}?`)) {
            this.appointmentService.deleteAppointment(appointment.id).subscribe(() => {
                this.patientAppointments.update(list => list.filter(a => a.id !== appointment.id));
            });
        }
    }

    onCreateMedicalRecord(appointment: Appointment) {
        this.selectedAppointmentForRecord.set(appointment);
        this.isMedicalRecordModalOpen.set(true);
    }

    closeRecordModal() {
        this.isMedicalRecordModalOpen.set(false);
        this.selectedAppointmentForRecord.set(null);
    }

    onAppointmentSaved(data: Record<string, any>) {
        if (this.selectedAppointmentForEdit()) {
            // Update existing
            const dateStr = data['date']
                ? new Date(data['date']).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                : this.selectedAppointmentForEdit()!.appointmentDate;

            this.appointmentService.saveAppointment({
                ...data,
                id: this.selectedAppointmentForEdit()!.id,
                appointmentDate: dateStr
            }).subscribe(updated => {
                this.patientAppointments.update(list => list.map(a =>
                    a.id === updated.id ? { ...updated, no: a.no } : a
                ));
            });
        }
        this.isAppointmentModalOpen.set(false);
    }

    onViewMedicalRecord(record: MedicalRecord) {
        this.selectedMedicalRecord.set(record);
        this.isMedicalRecordReadOnly.set(true);
        this.isMedicalRecordModalOpen.set(true);
    }

    onEditMedicalRecord(record: MedicalRecord) {
        this.selectedMedicalRecord.set(record);
        this.isMedicalRecordReadOnly.set(false);
        this.isMedicalRecordModalOpen.set(true);
    }

    onSaveMedicalRecord(formData: any) {
        this.medicalRecordService.createMedicalRecord(formData).subscribe({
            next: (newRecord) => {
                this.patientMedicalRecords.update(list => [...list, newRecord]);
                this.isMedicalRecordModalOpen.set(false);
            },
            error: err => alert(err)
        });
    }
}
