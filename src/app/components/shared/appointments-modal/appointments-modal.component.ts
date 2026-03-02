import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LucideAngularModule, X, Calendar, Clock } from 'lucide-angular';

@Component({
  selector: 'app-appointments-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, LucideAngularModule],
  templateUrl: './appointments-modal.component.html',
  styleUrl: './appointments-modal.component.css'
})
export class AppointmentsModalComponent implements OnChanges, OnDestroy {
  @Input() isOpen: boolean = false;
  @Output() close = new EventEmitter<void>();
  @Output() submit = new EventEmitter<{
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

  constructor(private fb: FormBuilder) {
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
      this.toggleBodyScroll(this.isOpen);
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

      // Simulate submission delay
      setTimeout(() => {
        this.successMessage = 'Appointment requested successfully! We will contact you soon.';
        this.isLoading = false;

        // Auto-close after 2 seconds
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

  get patientNameErrors(): any {
    return this.appointmentForm.get('patientName')?.errors;
  }

  get emailErrors(): any {
    return this.appointmentForm.get('email')?.errors;
  }

  get phoneErrors(): any {
    return this.appointmentForm.get('phone')?.errors;
  }

  get preferredDateErrors(): any {
    return this.appointmentForm.get('preferredDate')?.errors;
  }

  get preferredTimeErrors(): any {
    return this.appointmentForm.get('preferredTime')?.errors;
  }

  get specialtyErrors(): any {
    return this.appointmentForm.get('specialty')?.errors;
  }

  getMinDate(): string {
    const today = new Date();
    today.setDate(today.getDate() + 1); // Minimum date is tomorrow
    return today.toISOString().split('T')[0];
  }
}

