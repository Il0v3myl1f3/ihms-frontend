import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, Mail, KeyRound, ArrowLeft, CheckCircle } from 'lucide-angular';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-forgot-password-page',
  imports: [ReactiveFormsModule, RouterLink, LucideAngularModule],
  templateUrl: './forgot-password-page.component.html',
  styleUrl: './forgot-password-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ForgotPasswordPageComponent {
  readonly Mail = Mail;
  readonly KeyRound = KeyRound;
  readonly ArrowLeft = ArrowLeft;
  readonly CheckCircle = CheckCircle;

  forgotForm: FormGroup;
  errorMessage = signal('');
  isLoading = signal(false);
  emailSent = signal(false);

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  constructor() {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit(): void {
    if (this.forgotForm.valid) {
      this.isLoading.set(true);
      this.errorMessage.set('');

      const { email } = this.forgotForm.value;
      this.authService.forgotPassword(email).subscribe({
        next: () => {
          this.isLoading.set(false);
          this.emailSent.set(true);
        },
        error: (error: { error?: string; message?: string }) => {
          this.isLoading.set(false);
          this.errorMessage.set(error.error || error.message || 'Something went wrong');
        }
      });
    } else {
      this.forgotForm.markAllAsTouched();
    }
  }

  get emailErrors() {
    return this.forgotForm.get('email')?.errors ?? null;
  }
}
