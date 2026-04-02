import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LucideAngularModule, Eye, EyeOff, KeyRound, Lock, ArrowLeft } from 'lucide-angular';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-reset-password-page',
  imports: [ReactiveFormsModule, RouterLink, LucideAngularModule],
  templateUrl: './reset-password-page.component.html',
  styleUrl: './reset-password-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResetPasswordPageComponent {
  readonly Eye = Eye;
  readonly EyeOff = EyeOff;
  readonly KeyRound = KeyRound;
  readonly Lock = Lock;
  readonly ArrowLeft = ArrowLeft;

  resetForm: FormGroup;
  errorMessage = signal('');
  isLoading = signal(false);
  showPassword = signal(false);
  showConfirmPassword = signal(false);

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  constructor() {
    this.resetForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }

    if (confirmPassword?.hasError('passwordMismatch')) {
      confirmPassword.setErrors(null);
    }

    return null;
  }

  togglePasswordVisibility(): void {
    this.showPassword.update(v => !v);
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword.update(v => !v);
  }

  onSubmit(): void {
    if (this.resetForm.valid) {
      this.isLoading.set(true);
      this.errorMessage.set('');

      const { password } = this.resetForm.value;
      this.authService.resetPassword(password).subscribe({
        next: () => {
          this.router.navigate(['/login'], { queryParams: { reset: 'true' } });
        },
        error: (error: { error?: string; message?: string }) => {
          this.isLoading.set(false);
          this.errorMessage.set(error.error || error.message || 'Something went wrong');
        }
      });
    } else {
      this.resetForm.markAllAsTouched();
    }
  }

  get passwordErrors() {
    return this.resetForm.get('password')?.errors ?? null;
  }

  get confirmPasswordErrors() {
    return this.resetForm.get('confirmPassword')?.errors ?? null;
  }
}
