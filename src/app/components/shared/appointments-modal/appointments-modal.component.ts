import { Component, input, output, inject, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators, ValidationErrors } from '@angular/forms';
import { LucideAngularModule, X, Calendar, Clock } from 'lucide-angular';

@Component({
  selector: 'app-appointments-modal',
  imports: [CommonModule, ReactiveFormsModule, FormsModule, LucideAngularModule],
  templateUrl: './appointments-modal.component.html',
  styleUrl: './appointments-modal.component.css'
})
export class AppointmentsModalComponent implements OnChanges, OnDestroy {
  isOpen = input(false);
  close = output<void>();
  submit = output<{
    patientName: string;
    email: string;
    phone: string;
    preferredDate: string;
    preferredTime: string;
    specialty: string;
    message: string;
  }>();

  readonly X = X;
  readonly Calendar = Calendar;
  readonly Clock = Clock;

  appointmentForm: FormGroup;
  errorMessage = '';
  successMessage = '';
  isLoading = false;

  specialties = [
    'Cardiology',
    'Neurology',
    'Dermatology',
    'Orthopedics',
    'Pediatrics',
    'General Practice',
    'Dentistry',
    'Psychiatry'
  ];

  private fb = inject(FormBuilder);

  constructor() {
    this.appointmentForm = this.fb.group({
      patientName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\+?1?\d{9,15}$/)]],
      preferredDate: ['', Validators.required],
      preferredTime: ['', Validators.required],
      specialty: ['', Validators.required],
      message: ['', [Validators.maxLength(500)]]
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen']) {
      this.toggleBodyScroll(this.isOpen());
    }
  }

  ngOnDestroy(): void {
    this.toggleBodyScroll(false);
  }

  private toggleBodyScroll(disable: boolean): void {
    if (disable) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }

  onSubmit(): void {
    if (this.appointmentForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      const formData = this.appointmentForm.value;
      this.submit.emit(formData);

      setTimeout(() => {
        this.successMessage = 'Appointment requested successfully! We will contact you soon.';
        this.isLoading = false;

        setTimeout(() => {
          this.onClose();
        }, 2000);
      }, 500);
    }
  }

  onClose(): void {
    this.close.emit();
    this.appointmentForm.reset();
    this.errorMessage = '';
    this.successMessage = '';
    this.isLoading = false;
  }

  setErrorMessage(message: string): void {
    this.errorMessage = message;
    this.isLoading = false;
  }

  clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }

  get patientNameErrors(): ValidationErrors | null {
    return this.appointmentForm.get('patientName')?.errors ?? null;
  }

  get emailErrors(): ValidationErrors | null {
    return this.appointmentForm.get('email')?.errors ?? null;
  }

  get phoneErrors(): ValidationErrors | null {
    return this.appointmentForm.get('phone')?.errors ?? null;
  }

  get preferredDateErrors(): ValidationErrors | null {
    return this.appointmentForm.get('preferredDate')?.errors ?? null;
  }

  get preferredTimeErrors(): ValidationErrors | null {
    return this.appointmentForm.get('preferredTime')?.errors ?? null;
  }

  get specialtyErrors(): ValidationErrors | null {
    return this.appointmentForm.get('specialty')?.errors ?? null;
  }

  getMinDate(): string {
    const today = new Date();
    today.setDate(today.getDate() + 1);
    return today.toISOString().split('T')[0];
  }
}
