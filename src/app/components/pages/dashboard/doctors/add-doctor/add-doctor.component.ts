import { Component, input, output, inject, OnChanges, SimpleChanges, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideAngularModule, ChevronDown } from 'lucide-angular';
import { ModalComponent } from '../../../../shared/modal/modal.component';

@Component({
    selector: 'app-add-doctor',
    imports: [ReactiveFormsModule, LucideAngularModule, ModalComponent],
    templateUrl: './add-doctor.component.html',
    styleUrls: ['./add-doctor.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddDoctorComponent implements OnChanges {
    isOpen = input(false);
    save = output<{
        name: string;
        specialty: string;
        phone: string;
        availability: string;
    }>();
    cancel = output<void>();

    doctorForm: FormGroup;
    readonly ChevronDown = ChevronDown;

    private fb = inject(FormBuilder);

    constructor() {
        this.doctorForm = this.fb.group({
            name: ['', Validators.required],
            specialty: ['', Validators.required],
            phone: ['', [Validators.required, Validators.pattern(/^[0-9+\s-]+$/)]],
            availability: ['Available', Validators.required]
        });
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['isOpen'] && changes['isOpen'].currentValue === false) {
            this.doctorForm.reset({ availability: 'Available' });
        }
    }

    onSave(): void {
        if (this.doctorForm.valid) {
            const formValue = this.doctorForm.value;
            this.save.emit({
                name: formValue.name,
                specialty: formValue.specialty,
                phone: formValue.phone,
                availability: formValue.availability
            });
            this.doctorForm.reset({ availability: 'Available' });
        } else {
            this.doctorForm.markAllAsTouched();
        }
    }

    onCancel(): void {
        this.doctorForm.reset({ availability: 'Available' });
        this.cancel.emit();
    }
}
