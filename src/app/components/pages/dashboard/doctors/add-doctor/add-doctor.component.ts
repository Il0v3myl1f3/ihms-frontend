import { Component, input, output, inject, OnChanges, SimpleChanges, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalComponent } from '../../../../shared/modal/modal.component';
import { CustomSelectComponent } from '../../../../shared/custom-select/custom-select.component';
import { Doctor } from '../../../../../services/medical.service';

@Component({
    selector: 'app-doctor-create-modal',
    imports: [ReactiveFormsModule, ModalComponent, CustomSelectComponent],
    templateUrl: './add-doctor.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddDoctorComponent implements OnChanges {
    isOpen = input(false);
    doctorToEdit = input<Doctor | null>(null);
    readOnly = input(false);
    closeModal = output<void>();
    saveDoctor = output<Record<string, string>>();

    doctorForm!: FormGroup;

    private fb = inject(FormBuilder);

    specialtyOptions = [
        { value: '', label: 'Select', disabled: true },
        { value: 'Anesthesiology', label: 'Anesthesiology' },
        { value: 'Cardiology', label: 'Cardiology' },
        { value: 'Dermatology', label: 'Dermatology' },
        { value: 'Endocrinology', label: 'Endocrinology' },
        { value: 'Gastroenterology', label: 'Gastroenterology' },
        { value: 'Neurology', label: 'Neurology' },
        { value: 'Oncology', label: 'Oncology' },
        { value: 'Ophthalmology', label: 'Ophthalmology' },
        { value: 'Orthopedics', label: 'Orthopedics' },
        { value: 'Pediatrics', label: 'Pediatrics' },
        { value: 'Psychiatry', label: 'Psychiatry' },
        { value: 'Urology', label: 'Urology' }
    ];

    availabilityOptions = [
        { value: '', label: 'Select', disabled: true },
        { value: 'Available', label: 'Available' },
        { value: 'On Leave', label: 'On Leave' }
    ];

    constructor() {
        this.doctorForm = this.fb.group({
            firstName: ['', Validators.required],
            lastName: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            password: [''],
            specialty: ['', Validators.required],
            phone: ['', [Validators.required, Validators.pattern(/^[0-9+\s-]+$/)]],
            availability: ['']   // Not required — backend doesn't support this field
        });
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['isOpen'] && this.isOpen()) {
            if (this.doctorToEdit()) {
                const doctor = this.doctorToEdit()!;
                this.doctorForm?.patchValue({
                    ...doctor,
                    firstName: doctor.firstName,
                    lastName: doctor.lastName,
                    email: doctor.email,
                    password: ''
                });
                this.doctorForm.get('password')?.setValidators([]);
            } else {
                this.doctorForm?.reset({ specialty: '', availability: '', email: '', password: '' });
                this.doctorForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
            }
            this.doctorForm.get('password')?.updateValueAndValidity();

            if (this.readOnly()) {
                this.doctorForm?.disable();
            } else {
                this.doctorForm?.enable();
            }
        }
    }

    onCancel(): void {
        this.closeModal.emit();
        this.doctorForm.reset({ specialty: '', availability: '' });
    }

    onSubmit(): void {
        console.log('[AddDoctorComponent] Form valid:', this.doctorForm.valid, 'Value:', this.doctorForm.value, 'Errors:', this.doctorForm.errors);
        if (this.doctorForm.valid) {
            this.saveDoctor.emit(this.doctorForm.value);
            this.doctorForm.reset();
        } else {
            this.doctorForm.markAllAsTouched();
            console.warn('[AddDoctorComponent] Form invalid — controls:', Object.fromEntries(
                Object.entries(this.doctorForm.controls).map(([k, c]) => [k, c.errors])
            ));
        }
    }
}
