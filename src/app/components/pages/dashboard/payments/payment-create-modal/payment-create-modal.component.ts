import { Component, input, output, inject, OnInit, OnChanges, SimpleChanges, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalComponent } from '../../../../shared/modal/modal.component';
import { CustomSelectComponent } from '../../../../shared/custom-select/custom-select.component';
import { Payment } from '../payment-table/payment-table.component';

@Component({
    selector: 'app-payment-create-modal',
    imports: [ReactiveFormsModule, ModalComponent, CustomSelectComponent],
    templateUrl: './payment-create-modal.component.html',
    styleUrl: './payment-create-modal.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaymentCreateModalComponent implements OnInit, OnChanges {
    isOpen = input(false);
    paymentToEdit = input<Payment | null>(null);
    readOnly = input(false);
    closeModal = output<void>();
    savePayment = output<Record<string, string>>();

    paymentForm!: FormGroup;

    private fb = inject(FormBuilder);

    methodOptions = [
        { value: '', label: 'Select', disabled: true },
        { value: 'Cash', label: 'Cash' },
        { value: 'Credit Card', label: 'Credit Card' },
        { value: 'Debit Card', label: 'Debit Card' },
        { value: 'Insurance', label: 'Insurance' },
        { value: 'Bank Transfer', label: 'Bank Transfer' }
    ];

    statusOptions = [
        { value: '', label: 'Select', disabled: true },
        { value: 'Paid', label: 'Paid' },
        { value: 'Pending', label: 'Pending' },
        { value: 'Failed', label: 'Failed' },
        { value: 'Refunded', label: 'Refunded' }
    ];

    ngOnInit(): void {
        this.paymentForm = this.fb.group({
            invoiceNumber: ['', Validators.required],
            patientName: ['', Validators.required],
            amount: ['', [Validators.required, Validators.min(0)]],
            date: ['', Validators.required],
            method: ['', Validators.required],
            status: ['', Validators.required]
        });
        
        // Initial sync if already open
        if (this.isOpen()) {
            this.syncFormWithInputs();
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (this.paymentForm && (changes['isOpen'] || changes['paymentToEdit'] || changes['readOnly'])) {
            if (this.isOpen()) {
                this.syncFormWithInputs();
            }
        }
    }

    private syncFormWithInputs(): void {
        if (!this.paymentForm) return;

        if (this.paymentToEdit()) {
            this.paymentForm.patchValue(this.paymentToEdit()!);
        } else {
            this.paymentForm.reset({ method: '', status: '' });
        }

        if (this.readOnly()) {
            this.paymentForm.disable();
        } else {
            this.paymentForm.enable();
        }
    }

    onCancel(): void {
        this.closeModal.emit();
        this.paymentForm.reset({ method: '', status: '' });
    }

    onSubmit(): void {
        if (this.paymentForm.valid) {
            this.savePayment.emit(this.paymentForm.value);
            this.paymentForm.reset();
        } else {
            this.paymentForm.markAllAsTouched();
        }
    }
}
