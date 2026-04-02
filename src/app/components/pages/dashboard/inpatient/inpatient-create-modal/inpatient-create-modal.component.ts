import { Component, input, output, inject, OnInit, OnChanges, SimpleChanges, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalComponent } from '../../../../shared/modal/modal.component';
import { CustomSelectComponent } from '../../../../shared/custom-select/custom-select.component';
import { Inpatient } from '../inpatient-table/inpatient-table.component';

@Component({
    selector: 'app-inpatient-create-modal',
    imports: [ReactiveFormsModule, ModalComponent, CustomSelectComponent],
    templateUrl: './inpatient-create-modal.component.html',
    styleUrl: './inpatient-create-modal.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class InpatientCreateModalComponent implements OnInit, OnChanges {
    isOpen = input(false);
    inpatientToEdit = input<Inpatient | null>(null);
    closeModal = output<void>();
    saveInpatient = output<Record<string, string>>();

    inpatientForm!: FormGroup;

    private fb = inject(FormBuilder);

    statusOptions = [
        { value: '', label: 'Select', disabled: true },
        { value: 'Admitted', label: 'Admitted' },
        { value: 'Discharged', label: 'Discharged' },
        { value: 'Transferred', label: 'Transferred' },
        { value: 'Critical', label: 'Critical' }
    ];

    ngOnInit(): void {
        this.inpatientForm = this.fb.group({
            patientName: ['', Validators.required],
            roomNumber: ['', Validators.required],
            doctorName: ['', Validators.required],
            admissionDate: ['', Validators.required],
            dischargeDate: [''],
            diagnosis: ['', Validators.required],
            status: ['', Validators.required]
        });
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['isOpen'] && this.isOpen()) {
            if (this.inpatientToEdit()) {
                this.inpatientForm?.patchValue(this.inpatientToEdit()!);
            } else {
                this.inpatientForm?.reset({ status: '' });
            }
        }
    }

    onCancel(): void {
        this.closeModal.emit();
        this.inpatientForm.reset({ status: '' });
    }

    onSubmit(): void {
        if (this.inpatientForm.valid) {
            this.saveInpatient.emit(this.inpatientForm.value);
            this.inpatientForm.reset();
        } else {
            this.inpatientForm.markAllAsTouched();
        }
    }
}
