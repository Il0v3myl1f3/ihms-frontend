import { CustomDatepickerComponent } from '../../../../shared/custom-datepicker/custom-datepicker.component';
import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideAngularModule, Eye, EyeOff } from 'lucide-angular';
import { AuthService } from '../../../../../services/auth.service';

@Component({
    selector: 'app-account-settings',
    imports: [ReactiveFormsModule, LucideAngularModule, CustomDatepickerComponent],
    templateUrl: './account-settings.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccountSettingsComponent implements OnInit {
    // Icons
    readonly Eye = Eye;
    readonly EyeOff = EyeOff;

    accountForm!: FormGroup;
    showPassword = false;

    private fb = inject(FormBuilder);
    private authService = inject(AuthService);

    ngOnInit(): void {
        const user = this.authService.getCurrentUser();
        this.accountForm = this.fb.group({
            firstName: [user?.firstName || '', Validators.required],
            lastName: [user?.lastName || '', Validators.required],
            phoneNumber: [''], // TODO: Add phone to User interface if backend supports it
            email: [user?.email || '', [Validators.required, Validators.email]],
            dob: [user?.dateOfBirth ? this.toInputDate(user.dateOfBirth) : ''],
            password: ['••••••••', Validators.required]
        });
    }

    /** Convert DD/MM/YYYY → YYYY-MM-DD (for <input type="date">) */
    private toInputDate(dob: string): string {
        const parts = dob.split('/');
        if (parts.length === 3) {
            return `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
        return dob;
    }

    togglePasswordVisibility(): void {
        this.showPassword = !this.showPassword;
    }
}
