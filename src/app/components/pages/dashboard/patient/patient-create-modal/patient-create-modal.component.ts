import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalComponent } from '../../../../shared/modal/modal.component';

@Component({
    selector: 'app-patient-create-modal',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, ModalComponent],
    templateUrl: './patient-create-modal.component.html',
    styleUrl: './patient-create-modal.component.css'
})
export class PatientCreateModalComponent implements OnInit {
    @Input() isOpen = false;
    @Output() closeModal = new EventEmitter<void>();
    @Output() savePatient = new EventEmitter<any>();

    patientForm!: FormGroup;

    constructor(private fb: FormBuilder) { }

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

    onCancel(): void {
        this.closeModal.emit();
        this.patientForm.reset();
    }

    onSubmit(): void {
        if (this.patientForm.valid) {
            this.savePatient.emit(this.patientForm.value);
            this.patientForm.reset();
        } else {
            // Mark all as touched to trigger validation UI if needed
            this.patientForm.markAllAsTouched();
        }
    }
}
