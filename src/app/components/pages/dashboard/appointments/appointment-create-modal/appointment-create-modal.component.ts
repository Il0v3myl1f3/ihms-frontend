import { CustomAutocompleteComponent, AutocompleteOption } from '../../../../shared/custom-autocomplete/custom-autocomplete.component';
import { CustomDatepickerComponent } from '../../../../shared/custom-datepicker/custom-datepicker.component';
import { Component, input, output, inject, OnInit, OnChanges, SimpleChanges, ChangeDetectionStrategy, computed } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalComponent } from '../../../../shared/modal/modal.component';
import { CustomSelectComponent } from '../../../../shared/custom-select/custom-select.component';
import { Appointment } from '../appointment-table/appointment-table.component';
import { Doctor } from '../../../../../services/medical.service';
import { Patient } from '../../patient/patient-table/patient-table.component';
import { PatientService } from '../../../../../services/patient.service';
import { AuthService } from '../../../../../services/auth.service';

@Component({
    selector: 'app-appointment-create-modal',
    imports: [ReactiveFormsModule, ModalComponent, CustomSelectComponent, CustomDatepickerComponent, CustomAutocompleteComponent],
    templateUrl: './appointment-create-modal.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppointmentCreateModalComponent implements OnInit, OnChanges {
    isOpen = input(false);
    appointmentToEdit = input<Appointment | null>(null);
    readOnly = input(false);
    doctors = input<Doctor[]>([]);
    patients = input<Patient[]>([]);
    closeModal = output<void>();
    saveAppointment = output<Record<string, string>>();

    appointmentForm!: FormGroup;

    private fb = inject(FormBuilder);
    private authService = inject(AuthService);
    private patientService = inject(PatientService);

    currentUser() { return this.authService.getCurrentUser(); }
    isPatient() { return this.currentUser()?.role === 'user'; } // In this frontend 'user' = PATIENT

    statusOptions = [
        { value: 'Scheduled', label: 'Scheduled' },
        { value: 'Cancelled', label: 'Cancelled' },
        { value: 'Completed', label: 'Completed' }
    ];

    patientOptions = computed<AutocompleteOption[]>(() => 
        this.patients().map(p => ({ value: p.id, label: p.name }))
    );

    doctorOptions = computed<AutocompleteOption[]>(() => 
        this.doctors().map(d => ({ value: d.id, label: d.name }))
    );

     ngOnInit(): void {
        this.appointmentForm = this.fb.group({
            patientId: [''], // Will be validated conditionally or used as dummy for patients
            doctorId: ['', Validators.required],
            date: ['', Validators.required],
            status: ['Scheduled', Validators.required],
            notes: [''],
            reason: ['', Validators.required]
        });

        // Add dynamic validator for patientId if not a patient
        if (!this.isPatient()) {
            this.appointmentForm.get('patientId')?.setValidators(Validators.required);
        }

        if (this.isOpen()) {
            this.syncFormWithInputs();
            this.loadMyPatientIdIfNeeded();
        }
    }

    private loadMyPatientIdIfNeeded(): void {
        if (this.isPatient() && !this.appointmentToEdit()) {
            this.patientService.getMyPatientId().subscribe({
                next: (id) => {
                    this.appointmentForm.patchValue({ patientId: id });
                },
                error: (err) => console.error('[AppointmentModal] Could not fetch my PatientId:', err)
            });
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (this.appointmentForm && (changes['isOpen'] || changes['appointmentToEdit'] || changes['readOnly'])) {
            if (this.isOpen()) {
                this.syncFormWithInputs();
                this.loadMyPatientIdIfNeeded();
            }
        }
    }

    private syncFormWithInputs(): void {
        if (!this.appointmentForm) return;

        if (this.appointmentToEdit()) {
            const appt = this.appointmentToEdit()!;
            // Convert display date back to ISO for the datepicker input using local time
            let isoDate = '';
            if (appt.appointmentDate) {
                const dateObj = new Date(appt.appointmentDate);
                if (!isNaN(dateObj.getTime())) {
                    const y = dateObj.getFullYear();
                    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
                    const d = String(dateObj.getDate()).padStart(2, '0');
                    isoDate = `${y}-${m}-${d}`;
                }
            }

            this.appointmentForm.patchValue({
                patientId: appt.patientId,
                doctorId: appt.doctorId,
                date: isoDate,
                status: appt.status,
                reason: appt.reason || '',
                notes: appt.notes || ''
            });
        } else {
            this.appointmentForm.reset({ patientId: '', doctorId: '', date: '', status: 'Scheduled', notes: '', reason: '' });
        }

        if (this.readOnly()) {
            this.appointmentForm.disable();
        } else {
            this.appointmentForm.enable();
        }
    }

    onCancel(): void {
        this.closeModal.emit();
        this.appointmentForm.reset({ patientId: '', doctorId: '', date: '', status: 'Scheduled', notes: '', reason: '' });
    }

    onSubmit(): void {
        if (this.appointmentForm.valid) {
            const formData = { ...this.appointmentForm.value };
            
            // If the user is a patient, the UI hides the patientId field, meaning it's empty.
            // .NET's model binder crashes (400 Bad Request) if a Guid field receives an empty string.
            // We pass a dummy Guid here to satisfy JSON validation; the backend will securely overwrite it.
            if (this.isPatient() && !formData.patientId) {
                formData.patientId = '00000000-0000-0000-0000-000000000000';
            }

            this.saveAppointment.emit(formData);
            this.appointmentForm.reset();
        } else {
            this.appointmentForm.markAllAsTouched();
        }
    }

    get notesLength(): number {
        return this.appointmentForm?.get('notes')?.value?.length || 0;
    }
}
