import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideAngularModule, Eye, EyeOff } from 'lucide-angular';

@Component({
    selector: 'app-account-settings',
    imports: [ReactiveFormsModule, LucideAngularModule],
    templateUrl: './account-settings.component.html',
    styleUrl: './account-settings.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush
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
