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
    { id: 1, name: "Dr. Mia Kensington", role: "Pediatrics", specialty: "Pediatrics", image: "", phone: "021 1234 5678", availability: "Available" },
    { id: 2, name: "Dr. Oliver Westwood", role: "Dermatology", specialty: "Dermatology", image: "", phone: "021 2345 6789", availability: "Available" },
    { id: 3, name: "Dr. Sophia Langley", role: "Neurology", specialty: "Neurology", image: "", phone: "021 3456 7890", availability: "On Leave" },
    { id: 4, name: "Dr. Amelia Hawthorne", role: "Orthopedics", specialty: "Orthopedics", image: "", phone: "021 4567 8901", availability: "Available" },
    { id: 5, name: "Dr. Clara Whitmore", role: "Gastroenterology", specialty: "Gastroenterology", image: "", phone: "021 5678 9012", availability: "On Leave" },
    { id: 6, name: "Dr. Elijah Stone", role: "Endocrinology", specialty: "Endocrinology", image: "", phone: "021 6789 0123", availability: "Available" },
    { id: 7, name: "Dr. Nathaniel Rivers", role: "Oncology", specialty: "Oncology", image: "", phone: "021 7890 1234", availability: "Available" },
    { id: 8, name: "Dr. Victoria Ashford", role: "Psychiatry", specialty: "Psychiatry", image: "", phone: "021 8901 2345", availability: "On Leave" },
    { id: 9, name: "Dr. Lily Fairchild", role: "Ophthalmology", specialty: "Ophthalmology", image: "", phone: "021 9012 3456", availability: "On Leave" },
    { id: 10, name: "Dr. Samuel Brightman", role: "Urology", specialty: "Urology", image: "", phone: "021 0123 4567", availability: "On Leave" },
    { id: 11, name: "Dr. Lucas Pendleton", role: "Anesthesiology", specialty: "Anesthesiology", image: "", phone: "021 1234 5678", availability: "On Leave" },
    { id: 12, name: "Dr. Benjamin Carter", role: "Cardiology", specialty: "Cardiology", image: "", phone: "021 2345 6700", availability: "Available" },
    { id: 13, name: "Dr. Charlotte Evans", role: "Neurology", specialty: "Neurology", image: "", phone: "021 3456 7800", availability: "Available" },
    { id: 14, name: "Dr. Daniel Foster", role: "Orthopedics", specialty: "Orthopedics", image: "", phone: "021 4567 8900", availability: "On Leave" },
    { id: 15, name: "Dr. Eleanor Hayes", role: "Pediatrics", specialty: "Pediatrics", image: "", phone: "021 5678 9000", availability: "Available" },
    { id: 16, name: "Dr. Felix Jenkins", role: "Dermatology", specialty: "Dermatology", image: "", phone: "021 6789 0100", availability: "Available" },
    { id: 17, name: "Dr. Grace Kelly", role: "Gastroenterology", specialty: "Gastroenterology", image: "", phone: "021 7890 1200", availability: "On Leave" },
    { id: 18, name: "Dr. Henry Lewis", role: "Psychiatry", specialty: "Psychiatry", image: "", phone: "021 8901 2300", availability: "Available" },
    { id: 19, name: "Dr. Isabella Moore", role: "Ophthalmology", specialty: "Ophthalmology", image: "", phone: "021 9012 3400", availability: "Available" },
    { id: 20, name: "Dr. Jack Nelson", role: "Urology", specialty: "Urology", image: "", phone: "021 0123 4500", availability: "On Leave" },
    { id: 21, name: "Dr. Katherine Owen", role: "Anesthesiology", specialty: "Anesthesiology", image: "", phone: "021 1234 5600", availability: "Available" },
    { id: 22, name: "Dr. Liam Parker", role: "Oncology", specialty: "Oncology", image: "", phone: "021 2345 6711", availability: "Available" },
    { id: 23, name: "Dr. Mia Kensington", role: "Pediatrics", specialty: "Pediatrics", image: "", phone: "021 1234 5611", availability: "Available" },
    { id: 24, name: "Dr. Oliver Westwood", role: "Dermatology", specialty: "Dermatology", image: "", phone: "021 2345 6722", availability: "Available" },
    { id: 25, name: "Dr. Sophia Langley", role: "Neurology", specialty: "Neurology", image: "", phone: "021 3456 7822", availability: "On Leave" },
    { id: 26, name: "Dr. Amelia Hawthorne", role: "Orthopedics", specialty: "Orthopedics", image: "", phone: "021 4567 8922", availability: "Available" },
    { id: 27, name: "Dr. Clara Whitmore", role: "Gastroenterology", specialty: "Gastroenterology", image: "", phone: "021 5678 9022", availability: "On Leave" },
    { id: 28, name: "Dr. Elijah Stone", role: "Endocrinology", specialty: "Endocrinology", image: "", phone: "021 6789 0122", availability: "Available" },
    { id: 29, name: "Dr. Nathaniel Rivers", role: "Oncology", specialty: "Oncology", image: "", phone: "021 7890 1222", availability: "Available" },
    { id: 30, name: "Dr. Victoria Ashford", role: "Psychiatry", specialty: "Psychiatry", image: "", phone: "021 8901 2333", availability: "On Leave" },
    { id: 31, name: "Dr. Lily Fairchild", role: "Ophthalmology", specialty: "Ophthalmology", image: "", phone: "021 9012 3433", availability: "On Leave" },
    { id: 32, name: "Dr. Samuel Brightman", role: "Urology", specialty: "Urology", image: "", phone: "021 0123 4533", availability: "On Leave" },
    { id: 33, name: "Dr. Lucas Pendleton", role: "Anesthesiology", specialty: "Anesthesiology", image: "", phone: "021 1234 5633", availability: "On Leave" },
    { id: 34, name: "Dr. Ryan Cooper", role: "Cardiology", specialty: "Cardiology", image: "", phone: "021 2345 6744", availability: "Available" },
    { id: 35, name: "Dr. Scarlett Brooks", role: "Neurology", specialty: "Neurology", image: "", phone: "021 3456 7844", availability: "Available" },
    { id: 36, name: "Dr. Thomas Clark", role: "Orthopedics", specialty: "Orthopedics", image: "", phone: "021 4567 8944", availability: "On Leave" },
    { id: 37, name: "Dr. Uma Davies", role: "Pediatrics", specialty: "Pediatrics", image: "", phone: "021 5678 9044", availability: "Available" },
    { id: 38, name: "Dr. Victor Elliott", role: "Dermatology", specialty: "Dermatology", image: "", phone: "021 6789 0144", availability: "Available" },
    { id: 39, name: "Dr. Willow Fox", role: "Gastroenterology", specialty: "Gastroenterology", image: "", phone: "021 7890 1255", availability: "On Leave" },
    { id: 40, name: "Dr. Xavier Green", role: "Psychiatry", specialty: "Psychiatry", image: "", phone: "021 8901 2355", availability: "Available" }
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
            availability: doc.availability as Doctor['availability']
        };
        DOCTORS.push(newDoctor);
        return of(newDoctor);
    }

}
