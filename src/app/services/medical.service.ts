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
    cabinet?: string;
}

export interface Service {
    id: number;
    name: string;
    icon: string;
    description: string;
}

export const DOCTORS: Doctor[] = [
    { id: 1, name: "Dr. Mia Kensington", role: "Pediatrics", specialty: "Pediatrics", image: "assets/images/doctor-1.jpg", phone: "021 1234 5678", availability: "Available", cabinet: "A1" },
    { id: 2, name: "Dr. Oliver Westwood", role: "Dermatology", specialty: "Dermatology", image: "assets/images/doctor-2.jpg", phone: "021 2345 6789", availability: "Available", cabinet: "A2" },
    { id: 3, name: "Dr. Sophia Langley", role: "Neurology", specialty: "Neurology", image: "assets/images/doctor-3.jpg", phone: "021 3456 7890", availability: "On Leave", cabinet: "A3" },
    { id: 4, name: "Dr. Amelia Hawthorne", role: "Orthopedics", specialty: "Orthopedics", image: "assets/images/doctor-1.jpg", phone: "021 4567 8901", availability: "Available", cabinet: "B1" },
    { id: 5, name: "Dr. Clara Whitmore", role: "Gastroenterology", specialty: "Gastroenterology", image: "assets/images/doctor-2.jpg", phone: "021 5678 9012", availability: "On Leave", cabinet: "B2" },
    { id: 6, name: "Dr. Elijah Stone", role: "Endocrinology", specialty: "Endocrinology", image: "assets/images/doctor-3.jpg", phone: "021 6789 0123", availability: "Available", cabinet: "B3" },
    { id: 7, name: "Dr. Nathaniel Rivers", role: "Oncology", specialty: "Oncology", image: "assets/images/doctor-1.jpg", phone: "021 7890 1234", availability: "Available", cabinet: "C1" },
    { id: 8, name: "Dr. Victoria Ashford", role: "Psychiatry", specialty: "Psychiatry", image: "assets/images/doctor-2.jpg", phone: "021 8901 2345", availability: "On Leave", cabinet: "C2" },
    { id: 9, name: "Dr. Lily Fairchild", role: "Ophthalmology", specialty: "Ophthalmology", image: "assets/images/doctor-3.jpg", phone: "021 9012 3456", availability: "On Leave", cabinet: "C3" },
    { id: 10, name: "Dr. Samuel Brightman", role: "Urology", specialty: "Urology", image: "assets/images/doctor-1.jpg", phone: "021 0123 4567", availability: "On Leave", cabinet: "D1" }
];

@Injectable({
    providedIn: 'root'
})
export class MedicalService {

    getDoctors(): Observable<Doctor[]> {
        return of(DOCTORS);
    }

    getDoctorById(id: number): Observable<Doctor | undefined> {
        return of(DOCTORS.find(d => d.id === id));
    }

    addDoctor(doc: Omit<Doctor, 'id' | 'image' | 'role'>): Observable<Doctor> {
        const newId = DOCTORS.length > 0 ? Math.max(...DOCTORS.map(d => d.id)) + 1 : 1;
        const newDoctor: Doctor = {
            id: newId,
            name: doc.name,
            role: doc.specialty, // Map specialty to role for now
            specialty: doc.specialty,
            image: '', // Avatar handled by UI generator
            phone: doc.phone,
            availability: doc.availability as Doctor['availability'],
            cabinet: doc.cabinet
        };
        DOCTORS.push(newDoctor);
        return of(newDoctor);
    }

}
