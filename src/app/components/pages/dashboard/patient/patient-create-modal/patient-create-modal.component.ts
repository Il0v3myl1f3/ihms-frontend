import { Component, input, output, inject, OnInit, OnChanges, SimpleChanges, ChangeDetectionStrategy } from '@angular/core';
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
export class PatientCreateModalComponent implements OnInit, OnChanges {
    isOpen = input(false);
    patientToEdit = input<Patient | null>(null);
    closeModal = output<void>();
    savePatient = output<Record<string, string>>();

    patientForm!: FormGroup;

    private fb = inject(FormBuilder);

    ngOnInit(): void {
        this.patientForm = this.fb.group({
            name: ['', Validators.required],
            gender: ['', Validators.required],
            dob: ['', Validators.required],
            bloodType: ['', Validators.required],
            phone: ['', Validators.required],
            emergencyContact: ['', Validators.required],
            address: ['', Validators.required]
        });
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['isOpen'] && this.isOpen()) {
            if (this.patientToEdit()) {
                this.patientForm?.patchValue(this.patientToEdit()!);
            } else {
                this.patientForm?.reset({ gender: '', bloodType: '' });
            }
        }
    }

    onCancel(): void {
        this.closeModal.emit();
        this.patientForm.reset({ gender: '', bloodType: '' });
    }

    onSubmit(): void {
        if (this.patientForm.valid) {
            this.savePatient.emit(this.patientForm.value);
            this.patientForm.reset();
        } else {
            this.patientForm.markAllAsTouched();
        }
    }
}
