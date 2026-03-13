import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideAngularModule, Eye, EyeOff } from 'lucide-angular';

@Component({
    selector: 'app-account-settings',
    imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
    templateUrl: './account-settings.component.html',
    styleUrl: './account-settings.component.css'
})
export class AccountSettingsComponent implements OnInit {
    // Icons
    readonly Eye = Eye;
    readonly EyeOff = EyeOff;

    accountForm!: FormGroup;
    showPassword = false;

    private fb = inject(FormBuilder);

    ngOnInit(): void {
        this.accountForm = this.fb.group({
            firstName: ['Jane', Validators.required],
            lastName: ['Robertson', Validators.required],
            phoneNumber: ['(217) 555-0113'],
            email: ['jane.robertson@example.com', [Validators.required, Validators.email]],
            dob: ['1990-01-01'],
            password: ['password123', Validators.required]
        });
    }

    togglePasswordVisibility(): void {
        this.showPassword = !this.showPassword;
    }
}
