import { Component, input, output, inject, OnInit, OnChanges, SimpleChanges, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalComponent } from '../../../../shared/modal/modal.component';
import { Appointment } from '../appointment-table/appointment-table.component';
import { Doctor } from '../../../../../services/medical.service';

@Component({
    selector: 'app-appointment-create-modal',
    imports: [ReactiveFormsModule, ModalComponent],
    templateUrl: './appointment-create-modal.component.html',
    styleUrl: './appointment-create-modal.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppointmentCreateModalComponent implements OnInit, OnChanges {
    isOpen = input(false);
    appointmentToEdit = input<Appointment | null>(null);
    doctors = input<Doctor[]>([]);
    patientNames = input<string[]>([]);
    closeModal = output<void>();
    saveAppointment = output<Record<string, string>>();

    appointmentForm!: FormGroup;

    private fb = inject(FormBuilder);

    ngOnInit(): void {
        this.appointmentForm = this.fb.group({
            patientName: ['', Validators.required],
            doctorName: ['', Validators.required],
            date: ['', Validators.required],
            status: ['Scheduled', Validators.required],
            notes: ['']
        });
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['isOpen'] && this.isOpen()) {
            if (this.appointmentToEdit()) {
                this.appointmentForm?.patchValue({
                    patientName: this.appointmentToEdit()!.patientName,
                    doctorName: this.appointmentToEdit()!.doctorName,
                    date: '',
                    status: this.appointmentToEdit()!.status,
                    notes: this.appointmentToEdit()!.notes
                });
            } else {
                this.appointmentForm?.reset({ patientName: '', doctorName: '', date: '', status: 'Scheduled', notes: '' });
            }
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
