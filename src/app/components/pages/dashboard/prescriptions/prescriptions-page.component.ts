import { Component, ChangeDetectionStrategy, signal, inject, DestroyRef, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { timer } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { PrescriptionService } from '../../../../services/prescription.service';
import { PatientService } from '../../../../services/patient.service';
import { AuthService } from '../../../../services/auth.service';
import { PrescriptionTableComponent } from './prescription-table/prescription-table.component';

export interface Prescription {
    id: number;
    no: number;
    medication: string;
    dosage: string;
    frequency: string;
    doctorName: string;
    startDate: string;
    endDate: string;
    status: 'Active' | 'Expired' | 'Completed';
}

@Component({
    selector: 'app-prescriptions-page',
    imports: [CommonModule, FormsModule, LucideAngularModule, PrescriptionTableComponent],
    templateUrl: './prescriptions-page.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PrescriptionsPageComponent implements OnInit {
    private prescriptionService = inject(PrescriptionService);
    private patientService = inject(PatientService);
    private authService = inject(AuthService);
    private destroyRef = inject(DestroyRef);

    prescriptions = signal<Prescription[]>([]);

    ngOnInit(): void {
        const user = this.authService.getCurrentUser();
        timer(0, 10000).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
            if (user?.role === 'user') {
                this.patientService.getMyPatientId().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(id => {
                    this.loadPrescriptions(id);
                });
            } else {
                this.loadPrescriptions();
            }
        });
    }

    loadPrescriptions(patientId?: string): void {
        this.prescriptionService.getPrescriptions(patientId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(items => {
            this.prescriptions.set(items);
        });
    }

    onViewPrescription(_rx: Prescription): void {
        // TODO: open view modal when implemented
    }
}
