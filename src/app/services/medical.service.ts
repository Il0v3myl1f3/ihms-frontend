import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface Doctor {
    id: number;
    name: string;
    role: string;
    image: string;
    specialty: string;
}

export interface Service {
    id: number;
    name: string;
    icon: string;
    description: string;
}

export const DOCTORS: Doctor[] = [
    { id: 1, name: "Dr. 1", role: "Neurology", specialty: "Neurology", image: "" },
    { id: 2, name: "Dr. 2", role: "Cardiology", specialty: "Cardiology", image: "" },
    { id: 3, name: "Dr. 3", role: "Ophthalmology", specialty: "Ophthalmology", image: "" },
    { id: 4, name: "Dr. 4", role: "Neurology", specialty: "Neurology", image: "" },
    { id: 5, name: "Dr. 5", role: "Cardiology", specialty: "Cardiology", image: "" },
    { id: 6, name: "Dr. 6", role: "Ophthalmology", specialty: "Ophthalmology", image: "" },
];

@Injectable({
    providedIn: 'root'
})
export class MedicalService {

    constructor() { }

    getDoctors(): Observable<Doctor[]> {
        return of(DOCTORS);
    }

    getDoctorById(id: number): Observable<Doctor | undefined> {
        return of(DOCTORS.find(d => d.id === id));
    }

}
