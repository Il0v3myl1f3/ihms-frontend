import { Component, input, output, inject, OnInit, OnChanges, SimpleChanges, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalComponent } from '../../../../shared/modal/modal.component';
import { CustomSelectComponent } from '../../../../shared/custom-select/custom-select.component';
import { Room } from '../room-table/room-table.component';

@Component({
    selector: 'app-room-create-modal',
    imports: [ReactiveFormsModule, ModalComponent, CustomSelectComponent],
    templateUrl: './room-create-modal.component.html',
    styleUrl: './room-create-modal.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RoomCreateModalComponent implements OnInit, OnChanges {
    isOpen = input(false);
    roomToEdit = input<Room | null>(null);
    closeModal = output<void>();
    saveRoom = output<Record<string, string>>();

    typeOptions = [
        { value: '', label: 'Select', disabled: true },
        { value: 'Single', label: 'Single' },
        { value: 'Double', label: 'Double' },
        { value: 'Suite', label: 'Suite' },
        { value: 'ICU', label: 'ICU' },
        { value: 'Operating', label: 'Operating' }
    ];

    statusOptions = [
        { value: '', label: 'Select', disabled: true },
        { value: 'Available', label: 'Available' },
        { value: 'Occupied', label: 'Occupied' },
        { value: 'Maintenance', label: 'Maintenance' },
        { value: 'Reserved', label: 'Reserved' }
    ];

    roomForm!: FormGroup;

    private fb = inject(FormBuilder);

    ngOnInit(): void {
        this.roomForm = this.fb.group({
            roomNumber: ['', Validators.required],
            type: ['', Validators.required],
            floor: ['', [Validators.required, Validators.min(1)]],
            capacity: ['', [Validators.required, Validators.min(1)]],
            status: ['', Validators.required],
            pricePerDay: ['', [Validators.required, Validators.min(0)]]
        });
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['isOpen'] && this.isOpen()) {
            if (this.roomToEdit()) {
                this.roomForm?.patchValue(this.roomToEdit()!);
            } else {
                this.roomForm?.reset({ type: '', status: '' });
            }
        }
    }

    onCancel(): void {
        this.closeModal.emit();
        this.roomForm.reset({ type: '', status: '' });
    }

    onSubmit(): void {
        if (this.roomForm.valid) {
            this.saveRoom.emit(this.roomForm.value);
            this.roomForm.reset();
        } else {
            this.roomForm.markAllAsTouched();
        }
    }
}
