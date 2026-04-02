import { Component, input, output, inject, OnInit, OnChanges, SimpleChanges, ChangeDetectionStrategy, computed } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalComponent } from '../../../../shared/modal/modal.component';
import { CustomSelectComponent } from '../../../../shared/custom-select/custom-select.component';
import { Appointment } from '../appointment-table/appointment-table.component';
import { Doctor } from '../../../../../services/medical.service';

@Component({
    selector: 'app-appointment-create-modal',
    imports: [ReactiveFormsModule, ModalComponent, CustomSelectComponent],
    templateUrl: './appointment-create-modal.component.html',
    styleUrl: './appointment-create-modal.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppointmentCreateModalComponent implements OnInit, OnChanges {
    isOpen = input(false);
    appointmentToEdit = input<Appointment | null>(null);
    readOnly = input(false);
    doctors = input<Doctor[]>([]);
    patientNames = input<string[]>([]);
    closeModal = output<void>();
    saveAppointment = output<Record<string, string>>();

    appointmentForm!: FormGroup;

    private fb = inject(FormBuilder);

    statusOptions = [
        { value: 'Scheduled', label: 'Scheduled' },
        { value: 'Cancelled', label: 'Cancelled' },
        { value: 'Completed', label: 'Completed' }
    ];

    patientOptions = computed(() => {
        const opts: {value: string, label: string, disabled?: boolean}[] = [
            { value: '', label: 'Select Patient', disabled: true }
        ];
        this.patientNames().forEach(n => opts.push({ value: n, label: n }));
        return opts;
    });

    doctorOptions = computed(() => {
        const opts: {value: string, label: string, disabled?: boolean}[] = [
            { value: '', label: 'Select Doctor', disabled: true }
        ];
        this.doctors().forEach(d => opts.push({ value: d.name, label: d.name }));
        return opts;
    });

    ngOnInit(): void {
        this.appointmentForm = this.fb.group({
            patientName: ['', Validators.required],
            doctorName: ['', Validators.required],
            date: ['', Validators.required],
            status: ['Scheduled', Validators.required],
            notes: ['']
        });

        if (this.isOpen()) {
            this.syncFormWithInputs();
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (this.appointmentForm && (changes['isOpen'] || changes['appointmentToEdit'] || changes['readOnly'])) {
            if (this.isOpen()) {
                this.syncFormWithInputs();
            }
        }
    }

    private syncFormWithInputs(): void {
        if (!this.appointmentForm) return;

        if (this.appointmentToEdit()) {
            this.appointmentForm.patchValue({
                patientName: this.appointmentToEdit()!.patientName,
                doctorName: this.appointmentToEdit()!.doctorName,
                date: '', // Date is usually not in the table, would need it from some source
                status: this.appointmentToEdit()!.status,
                notes: this.appointmentToEdit()!.notes
            });
        } else {
            this.appointmentForm.reset({ patientName: '', doctorName: '', date: '', status: 'Scheduled', notes: '' });
        }

        if (this.readOnly()) {
            this.appointmentForm.disable();
        } else {
            this.appointmentForm.enable();
        }
    }

    onCancel(): void {
        this.closeModal.emit();
        this.appointmentForm.reset({ patientName: '', doctorName: '', date: '', status: 'Scheduled', notes: '' });
    }

    onSubmit(): void {
        if (this.appointmentForm.valid) {
            this.saveAppointment.emit(this.appointmentForm.value);
            this.appointmentForm.reset();
        } else {
            this.appointmentForm.markAllAsTouched();
        }
    }

    get notesLength(): number {
        return this.appointmentForm?.get('notes')?.value?.length || 0;
    }
}
