import { Component, input, output, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalComponent } from '../../../../shared/modal/modal.component';
import { Patient } from '../patient-table/patient-table.component';

@Component({
    selector: 'app-patient-create-modal',
    imports: [ReactiveFormsModule, ModalComponent],
    templateUrl: './patient-create-modal.component.html',
    styleUrl: './patient-create-modal.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PatientCreateModalComponent implements OnInit {
    isOpen = input(false);
    patientToEdit = input<Patient | null>(null);
    closeModal = output<void>();
    savePatient = output<Record<string, string>>();

    private fb = inject(FormBuilder);

    patientForm: FormGroup = this.fb.group({
        name: ['', Validators.required],
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
                dob: this.toInputDate(patient.dob)
            });
        }
    }

    onCancel(): void {
        this.closeModal.emit();
        this.patientForm.reset({ gender: '', bloodType: '' });
    }

    onSubmit(): void {
        if (this.patientForm.valid) {
            const formValue = { ...this.patientForm.value };
            if (formValue['dob']) {
                formValue['dob'] = this.toDisplayDate(formValue['dob']);
            }
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
