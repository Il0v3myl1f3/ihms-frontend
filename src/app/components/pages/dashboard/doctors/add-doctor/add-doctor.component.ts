import { Component, input, output, inject, OnInit, OnChanges, SimpleChanges, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalComponent } from '../../../../shared/modal/modal.component';
import { CustomSelectComponent } from '../../../../shared/custom-select/custom-select.component';
import { DoctorRow } from '../doctor-table/doctor-table.component';

@Component({
    selector: 'app-doctor-create-modal',
    imports: [ReactiveFormsModule, ModalComponent, CustomSelectComponent],
    templateUrl: './add-doctor.component.html',
    styleUrl: './add-doctor.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddDoctorComponent implements OnInit, OnChanges {
    isOpen = input(false);
    doctorToEdit = input<DoctorRow | null>(null);
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

    ngOnInit(): void {
        this.doctorForm = this.fb.group({
            name: ['', Validators.required],
            specialty: ['', Validators.required],
            phone: ['', [Validators.required, Validators.pattern(/^[0-9+\s-]+$/)]],
            availability: ['', Validators.required]
        });
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['isOpen'] && this.isOpen()) {
            if (this.doctorToEdit()) {
                this.doctorForm?.patchValue(this.doctorToEdit()!);
            } else {
                this.doctorForm?.reset({ specialty: '', availability: '' });
            }
        }
    }

    onCancel(): void {
        this.closeModal.emit();
        this.doctorForm.reset({ specialty: '', availability: '' });
    }

    onSubmit(): void {
        if (this.doctorForm.valid) {
            this.saveDoctor.emit(this.doctorForm.value);
            this.doctorForm.reset();
        } else {
            this.doctorForm.markAllAsTouched();
        }
    }
}
