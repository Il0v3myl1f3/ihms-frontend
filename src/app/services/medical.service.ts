import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface Doctor {
    id: number;
    name: string;
    role: string;
    image: string;
    specialty: string;
    phone?: string;
    availability?: 'Available' | 'On Leave';
}

export interface Service {
    id: number;
    name: string;
    icon: string;
    description: string;
}

export const DOCTORS: Doctor[] = [
    { id: 23, name: "Dr. Mia Kensington", role: "Pediatrics", specialty: "Pediatrics", image: "", phone: "021 1234 5678", availability: "Available" },
    { id: 24, name: "Dr. Oliver Westwood", role: "Dermatology", specialty: "Dermatology", image: "", phone: "021 2345 6789", availability: "Available" },
    { id: 25, name: "Dr. Sophia Langley", role: "Neurology", specialty: "Neurology", image: "", phone: "021 3456 7890", availability: "On Leave" },
    { id: 26, name: "Dr. Amelia Hawthorne", role: "Orthopedics", specialty: "Orthopedics", image: "", phone: "021 4567 8901", availability: "Available" },
    { id: 27, name: "Dr. Clara Whitmore", role: "Gastroenterology", specialty: "Gastroenterology", image: "", phone: "021 5678 9012", availability: "On Leave" },
    { id: 28, name: "Dr. Elijah Stone", role: "Endocrinology", specialty: "Endocrinology", image: "", phone: "021 6789 0123", availability: "Available" },
    { id: 29, name: "Dr. Nathaniel Rivers", role: "Oncology", specialty: "Oncology", image: "", phone: "021 7890 1234", availability: "Available" },
    { id: 30, name: "Dr. Victoria Ashford", role: "Psychiatry", specialty: "Psychiatry", image: "", phone: "021 8901 2345", availability: "On Leave" },
    { id: 31, name: "Dr. Lily Fairchild", role: "Ophthalmology", specialty: "Ophthalmology", image: "", phone: "021 9012 3456", availability: "On Leave" },
    { id: 32, name: "Dr. Samuel Brightman", role: "Urology", specialty: "Urology", image: "", phone: "021 0123 4567", availability: "On Leave" },
    { id: 33, name: "Dr. Lucas Pendleton", role: "Anesthesiology", specialty: "Anesthesiology", image: "", phone: "021 1234 5678", availability: "On Leave" },
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
