import { Component, input, output, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalComponent } from '../../../../shared/modal/modal.component';
import { CustomSelectComponent } from '../../../../shared/custom-select/custom-select.component';
import { CustomTimepickerComponent } from '../../../../shared/custom-timepicker/custom-timepicker.component';
import { Laboratory } from '../../../../../services/laboratory.service';

@Component({
  selector: 'app-laboratory-create-modal',
  standalone: true,
  imports: [ReactiveFormsModule, ModalComponent, CustomSelectComponent, CustomTimepickerComponent],
  templateUrl: './laboratory-create-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LaboratoryCreateModalComponent implements OnInit {
  isOpen = input(false);
  lab = input<Laboratory | null>(null);
  closeModal = output<void>();
  saveLab = output<any>();

  private fb = inject(FormBuilder);

  statusOptions = [
    { value: 'Available', label: 'Available' },
    { value: 'Occupied', label: 'Occupied' },
    { value: 'Maintenance', label: 'Maintenance' }
  ];

  labForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    location: ['', Validators.required],
    status: ['Available', Validators.required],
    type: ['Other', Validators.required],
    headOfLab: ['', Validators.required],
    phone: ['', Validators.required],
    startTime: ['08:00', Validators.required],
    endTime: ['20:00', Validators.required]
  });

  laboratoryTypeOptions = [
    { value: 'Blood', label: 'Blood' },
    { value: 'Urine', label: 'Urine' },
    { value: 'Biochemistry', label: 'Biochemistry' },
    { value: 'Immunology', label: 'Immunology' },
    { value: 'Microbiology', label: 'Microbiology' },
    { value: 'Genetics', label: 'Genetics' },
    { value: 'Pathology', label: 'Pathology' },
    { value: 'Other', label: 'Other' }
  ];

  ngOnInit(): void {
    const lab = this.lab();
    if (lab) {
      this.labForm.patchValue(lab);
      
      // Parse "08:00 - 20:00" into startTime and endTime
      if (lab.operatingHours && lab.operatingHours.includes(' - ')) {
        const [start, end] = lab.operatingHours.split(' - ');
        this.labForm.patchValue({
          startTime: start,
          endTime: end
        });
      }
    }
  }

  onCancel(): void {
    this.closeModal.emit();
    this.labForm.reset({ status: 'Available', startTime: '08:00', endTime: '20:00' });
  }

  onSubmit(): void {
    if (this.labForm.valid) {
      const formValue = this.labForm.value;
      
      // Combine startTime and endTime into operatingHours
      const finalPayload = {
        ...formValue,
        operatingHours: `${formValue.startTime} - ${formValue.endTime}`
      };

      // Clean up internal form fields not needed by API
      delete finalPayload.startTime;
      delete finalPayload.endTime;

      this.saveLab.emit(finalPayload);
    } else {
      this.labForm.markAllAsTouched();
    }
  }
}
