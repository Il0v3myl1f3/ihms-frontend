import { Component, input, output, inject, OnChanges, SimpleChanges, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators, ValidationErrors } from '@angular/forms';
import { LucideAngularModule, X } from 'lucide-angular';

@Component({
  selector: 'app-login-modal',
  imports: [ReactiveFormsModule, FormsModule, LucideAngularModule],
  templateUrl: './login-modal.component.html',
  styleUrl: './login-modal.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginModalComponent implements OnChanges, OnDestroy {
  isOpen = input(false);
  close = output<void>();
  login = output<{ email: string; password: string }>();

  readonly X = X;

  loginForm: FormGroup;
  errorMessage = '';
  isLoading = false;

  private fb = inject(FormBuilder);

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
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
    if (this.loginForm.valid) {
      this.isLoading = true;
      const { email, password } = this.loginForm.value;
      this.login.emit({ email, password });
      this.errorMessage = '';
    }
  }

  onClose(): void {
    this.close.emit();
    this.loginForm.reset();
    this.errorMessage = '';
    this.isLoading = false;
  }

  setErrorMessage(message: string): void {
    this.errorMessage = message;
    this.isLoading = false;
  }

  clearLoading(): void {
    this.isLoading = false;
  }

  get emailErrors(): ValidationErrors | null {
    return this.loginForm.get('email')?.errors ?? null;
  }

  get passwordErrors(): ValidationErrors | null {
    return this.loginForm.get('password')?.errors ?? null;
  }
}
