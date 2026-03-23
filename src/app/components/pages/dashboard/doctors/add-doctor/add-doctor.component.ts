import { Component, input, output, inject, OnInit, OnChanges, SimpleChanges, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalComponent } from '../../../../shared/modal/modal.component';
import { DoctorRow } from '../doctor-table/doctor-table.component';

@Component({
    selector: 'app-doctor-create-modal',
    imports: [ReactiveFormsModule, ModalComponent],
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
