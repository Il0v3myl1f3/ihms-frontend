import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Search, Filter, MoreHorizontal, ChevronLeft, ChevronRight } from 'lucide-angular';
import { MedicalService, Doctor } from '../../../../services/medical.service';

@Component({
    selector: 'app-dashboard-doctors',
    standalone: true,
    imports: [CommonModule, LucideAngularModule],
    templateUrl: './dashboard-doctors.component.html',
    styleUrls: ['./dashboard-doctors.component.css']
})
export class DashboardDoctorsComponent implements OnInit {
    readonly Search = Search;
    readonly Filter = Filter;
    readonly MoreHorizontal = MoreHorizontal;
    readonly ChevronLeft = ChevronLeft;
    readonly ChevronRight = ChevronRight;

    doctors: Doctor[] = [];

    constructor(private medicalService: MedicalService) { }

    ngOnInit(): void {
        this.medicalService.getDoctors().subscribe(data => {
            this.doctors = data;
        });
    }

    getAvatarInitialsName(name: string): string {
        // Return the name formatted for UI avatars, replace spaces with +
        return name.replace('Dr. ', '').replace(' ', '+');
    }
}
