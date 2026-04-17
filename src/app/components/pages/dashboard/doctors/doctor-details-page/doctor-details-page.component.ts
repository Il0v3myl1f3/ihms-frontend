import { Component, OnInit, ChangeDetectionStrategy, inject, signal, computed, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { LucideAngularModule, User, Calendar, Droplet, Phone, MapPin, ArrowLeft, MoreHorizontal, Mail, Eye, Edit2, GraduationCap, Award, Building2, Clock, Coffee, DoorOpen, Info, ShieldCheck, Printer } from 'lucide-angular';
import { MedicalService, Doctor } from '../../../../../services/medical.service';
import { AppointmentTableComponent, Appointment } from '../../appointments/appointment-table/appointment-table.component';
import { AppointmentCreateModalComponent } from '../../appointments/appointment-create-modal/appointment-create-modal.component';
import { PatientTableComponent, Patient } from '../../patient/patient-table/patient-table.component';
import { PatientService } from '../../../../../services/patient.service';
import { AppointmentService } from '../../../../../services/appointment.service';
import { MedicalRecordService } from '../../../../../services/medical-record.service';
import { AuthService } from '../../../../../services/auth.service';
import { MedicalRecord } from '../../medical-records/medical-records-page.component';
import { MedicalRecordCreateModalComponent } from '../../medical-records/medical-record-create-modal/medical-record-create-modal.component';

@Component({
    selector: 'app-doctor-details-page',
    standalone: true,
    imports: [CommonModule, LucideAngularModule, AppointmentTableComponent, PatientTableComponent, AppointmentCreateModalComponent, MedicalRecordCreateModalComponent],
    templateUrl: './doctor-details-page.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DoctorDetailsPageComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private medicalService = inject(MedicalService);
    private patientService = inject(PatientService);
    private appointmentService = inject(AppointmentService);
    private medicalRecordService = inject(MedicalRecordService);
    private authService = inject(AuthService);
    private destroyRef = inject(DestroyRef);

    isDoctor = computed(() => this.authService.getCurrentUser()?.role === 'doctor');

    // Icons
    User = User;
    Calendar = Calendar;
    Droplet = Droplet;
    Phone = Phone;
    MapPin = MapPin;
    ArrowLeft = ArrowLeft;
    MoreHorizontal = MoreHorizontal;
    GraduationCap = GraduationCap;
    Award = Award;
    Building2 = Building2;
    Clock = Clock;
    Coffee = Coffee;
    DoorOpen = DoorOpen;
    Info = Info;
    ShieldCheck = ShieldCheck;
    Printer = Printer;
    Mail = Mail;
    Eye = Eye;
    Edit2 = Edit2;

    doctor = signal<Doctor | null>(null);
    activeTab = signal('General Info');
    tabs = ['General Info', 'Schedule', 'Appointments', 'Patients', 'Medical Records'];
    doctorMedicalRecords = signal<MedicalRecord[]>([]);

    doctorAppointments = signal<Appointment[]>([]);
    doctorPatients = signal<Patient[]>([]);

    // Modal state
    isAppointmentModalOpen = signal(false);
    selectedAppointmentForEdit = signal<Appointment | null>(null);
    isAppointmentReadOnly = signal(false);

    // Medical Record Modal
    isMedicalRecordModalOpen = signal(false);
    selectedMedicalRecord = signal<MedicalRecord | null>(null);
    isMedicalRecordReadOnly = signal(false);

    // Dropdown data for modal
    allDoctors = signal<Doctor[]>([]);
    allPatients = signal<Patient[]>([]);

    totalAppointments = computed(() => this.doctorAppointments().length);
    uniquePatientsCount = computed(() => this.doctorPatients().length);

    ngOnInit() {
        this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
            const idParam = params.get('id');
            if (idParam) {
                this.loadDoctorData(idParam);
            }
        });

        this.medicalService.getDoctors().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(docs => {
            this.allDoctors.set(docs);
        });

        this.patientService.getPatients().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(patients => {
            this.allPatients.set(patients);
        });
    }

    loadDoctorData(id: string) {
        this.medicalService.getDoctorById(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(doc => {
            if (doc) {
                this.doctor.set(doc);

                this.appointmentService.getAppointmentsByDoctorName(doc.name).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(filteredApps => {
                    this.doctorAppointments.set(filteredApps);

                    const patientNames = Array.from(new Set(filteredApps.map(a => a.patientName)));
                    this.patientService.getPatients().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(patients => {
                        const associatedPatients = patients.filter(p => patientNames.includes(p.name));
                        this.doctorPatients.set(associatedPatients.map((p, index) => ({
                            ...p,
                            no: index + 1
                        })));
                    });
                });

                this.medicalRecordService.getMedicalRecords(undefined, doc.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((records: MedicalRecord[]) => {
                    this.doctorMedicalRecords.set(records);
                });
            }
        });
    }

    setTab(tab: string) {
        this.activeTab.set(tab);
    }

    goBack() {
        this.router.navigate(['/dashboard/doctors']);
    }

    getStatusClasses(status: string | undefined): string {
        switch (status) {
            case 'Available': return 'bg-emerald-50 text-emerald-700';
            case 'On Leave': return 'bg-red-50 text-red-600';
            default: return 'bg-gray-50 text-gray-700';
        }
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
            this.appointmentService.deleteAppointment(appointment.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
                this.doctorAppointments.update(list => list.filter(a => a.id !== appointment.id));
            });
        }
    }

    onAppointmentSaved(data: Record<string, any>) {
        if (this.selectedAppointmentForEdit()) {
            const dateStr = data['date']
                ? new Date(data['date']).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                : this.selectedAppointmentForEdit()!.appointmentDate;

            this.appointmentService.saveAppointment({
                ...data,
                id: this.selectedAppointmentForEdit()!.id,
                appointmentDate: dateStr
            }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(updated => {
                this.doctorAppointments.update(list => list.map(a =>
                    a.id === updated.id ? { ...updated, no: a.no } : a
                ));
            });
        }
        this.isAppointmentModalOpen.set(false);
    }

    onAddMedicalRecord() {
        this.selectedMedicalRecord.set(null);
        this.isMedicalRecordReadOnly.set(false);
        this.isMedicalRecordModalOpen.set(true);
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
        this.medicalRecordService.createMedicalRecord(formData).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((newRecord: MedicalRecord) => {
            this.doctorMedicalRecords.update(list => [...list, newRecord]);
            this.isMedicalRecordModalOpen.set(false);
        });
    }
}
