import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface Patient {
    id: number;
    no: number;
    name: string;
    gender: 'Male' | 'Female';
    dob: string;
    address: string;
    phone: string;
    bloodType: string;
    selected: boolean;
}

@Component({
    selector: 'app-patient-table',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './patient-table.component.html',
    styleUrl: './patient-table.component.css'
})
export class PatientTableComponent implements OnInit {
    patients: Patient[] = [];
    selectAll = false;

    ngOnInit(): void {
        this.patients = [
            { id: 1, no: 1, name: 'Jane Robertson', gender: 'Female', dob: '11/12/1990', address: '3891 Ranchview Dr.', phone: '(217) 555-0113', bloodType: 'A+', selected: false },
            { id: 2, no: 2, name: 'Jacob Jones', gender: 'Male', dob: '14/10/1984', address: '2464 Royal Ln. Mesa', phone: '(480) 555-0103', bloodType: 'A+', selected: false },
            { id: 3, no: 3, name: 'Eleanor Pena', gender: 'Female', dob: '14/10/1984', address: '6391 Elgin St. Celina', phone: '(704) 555-0127', bloodType: 'A+', selected: false },
            { id: 4, no: 4, name: 'Leslie Alexander', gender: 'Female', dob: '30/12/1987', address: '1901 Thornridge Cir.', phone: '(319) 555-0115', bloodType: 'A+', selected: false },
            { id: 5, no: 5, name: 'Dianne Russell', gender: 'Female', dob: '19/04/1994', address: '4641 Washington Ave.', phone: '(319) 555-0115', bloodType: 'A+', selected: false },
            { id: 6, no: 6, name: 'Devon Lane', gender: 'Male', dob: '21/04/1992', address: '8502 Preston Rd. Inglew.', phone: '(225) 555-0118', bloodType: 'A+', selected: false },
            { id: 7, no: 7, name: 'Kristin Watson', gender: 'Female', dob: '04/09/1996', address: '2972 Westheimer Rd.', phone: '(603) 555-0123', bloodType: 'A+', selected: false },
            { id: 8, no: 8, name: 'Floyd Miles', gender: 'Male', dob: '21/10/1988', address: '4140 Parker Rd. Allent.', phone: '(252) 555-0126', bloodType: 'A+', selected: false },
            { id: 9, no: 9, name: 'Courtney Henry', gender: 'Female', dob: '31/09/1986', address: '8502 Preston Rd. Inglew.', phone: '(208) 555-0112', bloodType: 'A+', selected: false },
            { id: 10, no: 10, name: 'Albert Flores', gender: 'Male', dob: '29/03/1991', address: '2715 Ash Dr. San Jose', phone: '(704) 555-0127', bloodType: 'A+', selected: false },
            { id: 11, no: 11, name: 'Marvin McKinney', gender: 'Male', dob: '21/01/1986', address: '8642 Yake Cervies', phone: '(219) 555-0114', bloodType: 'A+', selected: false }
        ];
    }

    toggleSelectAll(): void {
        this.patients.forEach(p => p.selected = this.selectAll);
    }

    updateSelectAllState(): void {
        this.selectAll = this.patients.every(p => p.selected);
    }
}
