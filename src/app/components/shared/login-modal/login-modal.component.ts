﻿import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LucideAngularModule, X } from 'lucide-angular';

@Component({
  selector: 'app-login-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, LucideAngularModule],
  templateUrl: './login-modal.component.html',
  styleUrl: './login-modal.component.css'
})
export class LoginModalComponent implements OnChanges, OnDestroy {
  @Input() isOpen: boolean = false;
  @Output() close = new EventEmitter<void>();
  @Output() login = new EventEmitter<{ email: string; password: string }>();

  readonly X = X;

  loginForm: FormGroup;
  errorMessage = '';
  isLoading = false;

  constructor(private fb: FormBuilder) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen']) {
      this.toggleBodyScroll(this.isOpen);
    }
  }

  ngOnDestroy(): void {
    // Ensure scroll is re-enabled when component is destroyed
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

  get emailErrors(): any {
    return this.loginForm.get('email')?.errors;
  }

  get passwordErrors(): any {
    return this.loginForm.get('password')?.errors;
  }
}

