import { CustomDatepickerComponent } from '../../../../shared/custom-datepicker/custom-datepicker.component';
import { Component, input, output, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalComponent } from '../../../../shared/modal/modal.component';
import { CustomSelectComponent } from '../../../../shared/custom-select/custom-select.component';
import { Patient } from '../patient-table/patient-table.component';

@Component({
    selector: 'app-patient-create-modal',
    imports: [ReactiveFormsModule, ModalComponent, CustomSelectComponent, CustomDatepickerComponent],
    templateUrl: './patient-create-modal.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PatientCreateModalComponent implements OnInit {
    isOpen = input(false);
    patientToEdit = input<Patient | null>(null);
    closeModal = output<void>();
    savePatient = output<Record<string, string>>();

    private fb = inject(FormBuilder);

    genderOptions = [
        { value: '', label: 'Select', disabled: true },
        { value: 'Male', label: 'Male' },
        { value: 'Female', label: 'Female' },
        { value: 'Other', label: 'Other' }
    ];

    bloodTypeOptions = [
        { value: '', label: 'Select', disabled: true },
        { value: 'A+', label: 'A+' },
        { value: 'A-', label: 'A-' },
        { value: 'B+', label: 'B+' },
        { value: 'B-', label: 'B-' },
        { value: 'O+', label: 'O+' },
        { value: 'O-', label: 'O-' },
        { value: 'AB+', label: 'AB+' },
        { value: 'AB-', label: 'AB-' }
    ];

    patientForm: FormGroup = this.fb.group({
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        password: [''], // Will be validated dynamically
        gender: ['', Validators.required],
        dob: ['', Validators.required],
        bloodType: ['', Validators.required],
        phone: ['', Validators.required],
        address: ['', Validators.required]
    });

    ngOnInit(): void {
        const patient = this.patientToEdit();
        if (patient) {
            this.patientForm.patchValue({
                ...patient,
                firstName: patient.firstName,
                lastName: patient.lastName,
                email: patient.email,
                dob: this.toInputDate(patient.dob)
            });
            // Password is optional during edit
            this.patientForm.get('password')?.setValidators([]);
        } else {
            // Password is required for new patients
            this.patientForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
        }
        this.patientForm.get('password')?.updateValueAndValidity();
    }

    onCancel(): void {
        this.closeModal.emit();
        this.patientForm.reset({ gender: '', bloodType: '' });
    }

    onSubmit(): void {
        if (this.patientForm.valid) {
            const formValue = { ...this.patientForm.value };
            this.savePatient.emit(formValue);
            this.patientForm.reset();
        } else {
            this.patientForm.markAllAsTouched();
        }
    }

    /** Convert DD/MM/YYYY → YYYY-MM-DD (for <input type="date">) */
    private toInputDate(dob: string): string {
        const parts = dob.split('/');
        if (parts.length === 3) {
            return `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
        return dob;
    }

    /** Convert YYYY-MM-DD → DD/MM/YYYY (for storage) */
    private toDisplayDate(dob: string): string {
        const parts = dob.split('-');
        if (parts.length === 3) {
            return `${parts[2]}/${parts[1]}/${parts[0]}`;
        }
        return dob;
    }
}
