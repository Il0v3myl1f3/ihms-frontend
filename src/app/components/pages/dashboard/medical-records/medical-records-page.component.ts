import { Component, ChangeDetectionStrategy, signal, computed, inject, OnInit, DestroyRef, NgZone } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { fromEvent, timer } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { MedicalRecordService } from '../../../../services/medical-record.service';
import { AuthService } from '../../../../services/auth.service';
import { PatientService } from '../../../../services/patient.service';
import { MedicalRecordCreateModalComponent } from './medical-record-create-modal/medical-record-create-modal.component';
import { MedicalRecordTableComponent } from './medical-record-table/medical-record-table.component';


export interface Prescription {
    id: string;
    medication: string;
    dosage: string;
    frequency: string;
    startDate: string;
    endDate?: string;
}

export interface MedicalRecord {
    id: string;
    no: number;
    diagnosis: string;
    treatment: string;
    notes: string;
    date: string;
    doctorName: string;
    patientName: string;
    status: 'Reviewed' | 'Pending' | 'Archived';
    appointmentId?: string;
    prescriptions?: Prescription[];
}

@Component({
    selector: 'app-medical-records-page',
    imports: [CommonModule, FormsModule, LucideAngularModule, MedicalRecordCreateModalComponent, MedicalRecordTableComponent],
    templateUrl: './medical-records-page.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MedicalRecordsPageComponent implements OnInit {
    private medicalRecordService = inject(MedicalRecordService);
    private authService = inject(AuthService);
    private patientService = inject(PatientService);
    private destroyRef = inject(DestroyRef);
    private ngZone = inject(NgZone);

    records = signal<MedicalRecord[]>([]);
    isDoctor = computed(() => this.authService.getCurrentUser()?.role === 'doctor');

    // Modal state
    isModalOpen = signal(false);
    selectedRecord = signal<MedicalRecord | null>(null);
    isReadOnly = signal(false);

    ngOnInit(): void {
        timer(0, 10000).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
            const user = this.authService.getCurrentUser();
            if (user) this.loadRecords(user);
        });
    }

    private loadRecords(user: any): void {
        if (user.role === 'user') {
            this.patientService.getMyPatientId().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
                next: (patientId) => {
                    this.medicalRecordService.getMedicalRecords(patientId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(items => {
                        this.records.set(items);
                    });
                },
                error: () => this.records.set([])
            });
        } else {
            this.medicalRecordService.getMedicalRecords().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(items => {
                this.records.set(items);
            });
        }
    }

    onViewRecord(record: MedicalRecord): void {
        this.selectedRecord.set(record);
        this.isReadOnly.set(true);
        this.isModalOpen.set(true);
    }

    onEditRecord(record: MedicalRecord): void {
        this.selectedRecord.set(record);
        this.isReadOnly.set(false);
        this.isModalOpen.set(true);
    }

    onDeleteRecord(record: MedicalRecord): void {
        if (confirm(`Are you sure you want to delete this medical record?`)) {
            this.medicalRecordService.deleteMedicalRecord(record.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
        }
    }

    onSaveRecord(formData: any): void {
        if (this.selectedRecord()) {
            this.medicalRecordService.updateMedicalRecord(this.selectedRecord()!.id, formData).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
                next: () => this.isModalOpen.set(false),
                error: err => alert(err)
            });
        } else {
            this.medicalRecordService.createMedicalRecord(formData).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
                next: () => this.isModalOpen.set(false),
                error: err => alert(err)
            });
        }
    }
}
