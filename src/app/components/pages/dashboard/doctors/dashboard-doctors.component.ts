import { Component, OnInit, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { MedicalService, Doctor } from '../../../../services/medical.service';
import { AddDoctorComponent } from './add-doctor/add-doctor.component';
import { DoctorTableComponent } from './doctor-table/doctor-table.component';

@Component({
    selector: 'app-dashboard-doctors',
    imports: [AddDoctorComponent, DoctorTableComponent],
    templateUrl: './dashboard-doctors.component.html',
    styleUrls: ['./dashboard-doctors.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardDoctorsComponent implements OnInit {
    doctors = signal<Doctor[]>([]);
    isAddModalOpen = false;

    private medicalService = inject(MedicalService);

    ngOnInit(): void {
        this.loadDoctors();
    }

    private loadDoctors(): void {
        this.medicalService.getDoctors().subscribe(data => {
            this.doctors.set(data);
        });
    }

    openAddModal(): void {
        this.isAddModalOpen = true;
    }

    closeAddModal(): void {
        this.isAddModalOpen = false;
    }

    handleAddDoctor(doctorData: { name: string; specialty: string; phone: string; availability: string }): void {
        this.medicalService.addDoctor(doctorData as Omit<Doctor, 'id' | 'image' | 'role'>).subscribe(() => {
            this.loadDoctors();
            this.closeAddModal();
        });
    }

    handleEditDoctor(doctor: Doctor): void {
        console.log('Edit doctor:', doctor);
        // Implementation for edit will go here
    }

    handleDeleteDoctor(doctor: Doctor): void {
        if (confirm(`Are you sure you want to delete Dr. ${doctor.name}?`)) {
            // Implementation for delete will go here
        }
    }
}
