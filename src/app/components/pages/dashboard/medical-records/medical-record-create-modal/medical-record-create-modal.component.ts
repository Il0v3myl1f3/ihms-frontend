import { Component, input, output, signal, inject, OnInit, ChangeDetectionStrategy, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { LucideAngularModule, Activity, ClipboardList, StickyNote, User, Stethoscope, Pill, Plus, Trash2 } from 'lucide-angular';
import { ModalComponent } from '../../../../shared/modal/modal.component';
import { CustomAutocompleteComponent, AutocompleteOption } from '../../../../shared/custom-autocomplete/custom-autocomplete.component';
import { CustomDatepickerComponent } from '../../../../shared/custom-datepicker/custom-datepicker.component';
import { MedicalRecord } from '../medical-records-page.component';
import { Appointment } from '../../appointments/appointment-table/appointment-table.component';
import { MedicalService, Doctor } from '../../../../../services/medical.service';
import { PatientService } from '../../../../../services/patient.service';
import { AppointmentService } from '../../../../../services/appointment.service';
import { AuthService } from '../../../../../services/auth.service';
import { Patient } from '../../patient/patient-table/patient-table.component';

@Component({
    selector: 'app-medical-record-create-modal',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, LucideAngularModule, ModalComponent, CustomAutocompleteComponent, CustomDatepickerComponent],
    templateUrl: './medical-record-create-modal.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MedicalRecordCreateModalComponent implements OnInit {
    private fb = inject(FormBuilder);
    private medicalService = inject(MedicalService);
    private patientService = inject(PatientService);
    private appointmentService = inject(AppointmentService);
    private authService = inject(AuthService);

    isOpen = input(true);
    currentUser = toSignal(this.authService.currentUser$);
    isPatient = computed(() => this.currentUser()?.role === 'user');
    recordToEdit = input<MedicalRecord | null>(null);
    appointment = input<Appointment | null>(null);
    preselectedPatientId = input<string | null>(null);
    preselectedDoctorId = input<string | null>(null);
    readOnly = input(false);
    
    closeModal = output<void>();
    saveRecord = output<any>();

    recordForm: FormGroup;
    
    // Icons
    Activity = Activity;
    ClipboardList = ClipboardList;
    StickyNote = StickyNote;
    User = User;
    Stethoscope = Stethoscope;
    Pill = Pill;
    Plus = Plus;
    Trash2 = Trash2;

    doctors = signal<Doctor[]>([]);
    patients = signal<Patient[]>([]);

    doctorOptions = computed<AutocompleteOption[]>(() => 
        this.doctors().map(d => ({ value: d.id, label: d.name }))
    );

    patientOptions = computed<AutocompleteOption[]>(() => 
        this.patients().map(p => ({ value: p.id, label: p.name }))
    );

    constructor() {
        this.recordForm = this.fb.group({
            patientId: ['', Validators.required],
            doctorId: ['', Validators.required],
            appointmentId: [''],
            diagnosis: ['', [Validators.required, Validators.minLength(3)]],
            treatment: ['', Validators.required],
            notes: [''],
            prescriptions: this.fb.array([])
        });
    }

    get prescriptions(): FormArray {
        return this.recordForm.get('prescriptions') as FormArray;
    }

    addPrescription(): void {
        const prescriptionForm = this.fb.group({
            medication: ['', Validators.required],
            dosage: ['', Validators.required],
            frequency: ['', Validators.required],
            startDate: [new Date().toISOString().split('T')[0], Validators.required],
            endDate: ['']
        });
        this.prescriptions.push(prescriptionForm);
    }

    removePrescription(index: number): void {
        this.prescriptions.removeAt(index);
    }

    ngOnInit(): void {
        this.loadData();
        
        if (this.recordToEdit()) {
            const record = this.recordToEdit()!;
            // Note: We need the IDs for the form, but MedicalRecord interface has names.
            // When editing, we'll try to find the IDs by name if they aren't provided in the record object.
            this.recordForm.patchValue({
                diagnosis: record.diagnosis,
                treatment: record.treatment,
                notes: record.notes
            });

            if (record.prescriptions) {
                record.prescriptions.forEach(p => {
                    this.prescriptions.push(this.fb.group({
                        medication: [p.medication, Validators.required],
                        dosage: [p.dosage || '', Validators.required],
                        frequency: [p.frequency || '', Validators.required],
                        startDate: [p.startDate?.substring(0, 10), Validators.required],
                        endDate: [p.endDate?.substring(0, 10) || '']
                    }));
                });
            }
        }

        if (this.preselectedPatientId()) {
            this.recordForm.get('patientId')?.setValue(this.preselectedPatientId());
        }

        if (this.preselectedDoctorId()) {
            this.recordForm.get('doctorId')?.setValue(this.preselectedDoctorId());
        }

        if (this.appointment()) {
            const appt = this.appointment()!;
            this.recordForm.patchValue({
                patientId: appt.patientId,
                doctorId: appt.doctorId,
                appointmentId: appt.id
            });
            // Locking these fields since we are creating from a specific appointment
            this.recordForm.get('patientId')?.disable();
            this.recordForm.get('doctorId')?.disable();
        }

        if (this.readOnly()) {
            this.recordForm.disable();
        }
    }

    isUserDoctor(): boolean {
        return this.authService.getCurrentUser()?.role === 'doctor';
    }

    private loadData(): void {
        this.medicalService.getDoctors().subscribe(docs => {
            this.doctors.set(docs);
            
            // Critical fix: Link identity user to clinical doctor profile
            const user = this.authService.getCurrentUser();
            if (user?.role === 'doctor' && !this.recordToEdit()) {
                // We MUST use the id from the doctors table, not the id from the users table
                const myProfile = docs.find(d => d.email.toLowerCase() === user.email.toLowerCase());
                if (myProfile) {
                    this.recordForm.get('doctorId')?.setValue(myProfile.id);
                }
            }
        });
        
        const user = this.authService.getCurrentUser();
        if (user?.role === 'doctor') {
            // Doctors only see their own patients (those they have appointments with)
            this.appointmentService.getAppointmentsByDoctorName(user.name).subscribe(apps => {
                const myPatientIds = new Set(apps.map(a => a.patientId));
                this.patientService.getPatients().subscribe(pats => {
                    this.patients.set(pats.filter(p => myPatientIds.has(p.id)));
                });
            });
        } else {
            // Admins or others see all patients
            this.patientService.getPatients().subscribe(pats => this.patients.set(pats));
        }
    }

    onSubmit(): void {
        if (this.recordForm.valid) {
            // Include disabled fields (patientId, doctorId) in the emitted value
            const formValue = this.recordForm.getRawValue();
            this.saveRecord.emit(formValue);
        }
    }

    onCancel(): void {
        this.recordForm.reset();
        this.closeModal.emit();
    }
}
