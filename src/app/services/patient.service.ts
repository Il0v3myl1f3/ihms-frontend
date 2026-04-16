import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap, map, catchError, throwError } from 'rxjs';
import { Patient } from '../components/pages/dashboard/patient/patient-table/patient-table.component';



@Injectable({
    providedIn: 'root'
})
export class PatientService {
    private http = inject(HttpClient);
    private apiUrl = 'http://localhost:5275/api/patient';
    private patientsSignal = signal<Patient[]>([]);

    getPatients(): Observable<Patient[]> {
        return this.http.get<any[]>(this.apiUrl).pipe(
            map(data => {
                const items = Array.isArray(data) ? data : (data as any).items || [];
                return items.map((p: any, index: number) => this.mapToPatient(p, index + 1));
            }),
            tap(patients => this.patientsSignal.set(patients))
        );
    }

    getPatientById(id: string): Observable<Patient> {
        return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
            map(p => this.mapToPatient(p, 1))
        );
    }

    getMyPatientId(): Observable<string> {
        return this.http.get<any>(`${this.apiUrl}/my-id`).pipe(
            map(res => res.patientId || res.PatientId),
            tap(id => console.log('[PatientService] Resolved my clinical ID:', id)),
            catchError(err => {
                console.error('[PatientService] Error getting my PatientId:', err);
                return throwError(() => err);
            })
        );
    }

    private mapToPatient(p: any, no: number): Patient {
        // Support both camelCase and PascalCase from backend
        const fName = p.firstName || p.FirstName || '';
        const lName = p.lastName || p.LastName || '';
        const email = p.email || p.Email || '';
        const genderVal = p.gender !== undefined ? p.gender : p.Gender;

        return {
            id: p.id || p.Id,
            no: no,
            name: `${fName} ${lName}`.trim() || 'Unnamed Patient',
            firstName: fName,
            lastName: lName,
            email: email,
            gender: this.mapGender(genderVal),
            dob: 'N/A', // Not in backend DTO yet
            address: p.address || p.Address || 'N/A',
            phone: p.phone || p.Phone || 'N/A',
            bloodType: p.bloodType || p.BloodType || 'N/A',
            selected: false
        };
    }

    private mapGender(g: any): 'Male' | 'Female' | 'Other' {
        if (typeof g === 'string') {
            const lower = g.toLowerCase();
            if (lower === 'male') return 'Male';
            if (lower === 'female') return 'Female';
            return 'Other';
        }
        // If numeric enum: 0=Male, 1=Female, 2=Other
        if (g === 0) return 'Male';
        if (g === 1) return 'Female';
        return 'Other';
    }

    getPatientCount(): number {
        return this.patientsSignal().length;
    }

    deletePatient(id: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${id}`).pipe(
            tap(() => {
                this.patientsSignal.update(patients => patients.filter(p => p.id !== id));
            })
        );
    }

    deleteSelectedPatients(ids: string[]): Observable<any> {
        // Simple sequential delete for now if backend doesn't support bulk
        // But for this task, let's just implement the UI-side update for now or a loop
        return of(null).pipe(tap(() => {
            const idSet = new Set(ids);
            this.patientsSignal.update(patients => patients.filter(p => !idSet.has(p.id)));
        }));
    }

    savePatient(patientData: Record<string, any>): Observable<any> {
        // Use PascalCase to match the backend DTO properties precisely
        const dto: any = {
            FirstName: patientData['firstName'],
            LastName: patientData['lastName'],
            Email: patientData['email'],
            Gender: patientData['gender']?.toUpperCase() || 'OTHER',
            Phone: patientData['phone'],
            Address: patientData['address'],
            BloodType: patientData['bloodType']
        };

        // On creation, we MUST provide a password
        if (!patientData['id'] || patientData['password']) {
            dto.Password = patientData['password'] || 'Password123!';
        }

        if (patientData['id']) {
            return this.http.put(`${this.apiUrl}/${patientData['id']}`, dto).pipe(
                tap(() => this.getPatients().subscribe()),
                catchError(error => {
                    console.error('[PatientService] Error updating patient:', error);
                    return throwError(() => error);
                })
            );
        } else {
            return this.http.post(this.apiUrl, dto).pipe(
                tap(() => this.getPatients().subscribe()),
                catchError(error => {
                    console.error('[PatientService] Error creating patient:', error);
                    return throwError(() => error);
                })
            );
        }
    }
}
