import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap, map, catchError, throwError, switchMap } from 'rxjs';
import { Patient } from '../components/pages/dashboard/patient/patient-table/patient-table.component';



@Injectable({
    providedIn: 'root'
})
export class PatientService {
    private http = inject(HttpClient);
    private apiUrl = 'http://localhost:5275/api/patient';
    private patientsSignal = signal<Patient[]>([]);
    public patients = this.patientsSignal.asReadonly();

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
        const fName = p.firstName || '';
        const lName = p.lastName || '';
        
        return {
            id: p.id,
            no: no,
            name: `${fName} ${lName}`.trim() || 'Unnamed Patient',
            firstName: fName,
            lastName: lName,
            email: p.email || '',
            gender: this.mapGender(p.gender),
            dob: 'N/A', // Keeping as requested
            address: p.address || 'N/A',
            phone: p.phone || 'N/A',
            bloodType: p.bloodType || 'N/A',
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
        const dto: any = {
            firstName: patientData['firstName'],
            lastName: patientData['lastName'],
            email: patientData['email'],
            gender: patientData['gender']?.toUpperCase() || 'OTHER',
            phone: patientData['phone'],
            address: patientData['address'],
            bloodType: patientData['bloodType']
        };

        // On creation, we MUST provide a password
        if (!patientData['id'] || patientData['password']) {
            dto.Password = patientData['password'] || 'Password123!';
        }

        if (patientData['id']) {
            return this.http.put(`${this.apiUrl}/${patientData['id']}`, dto).pipe(
                switchMap(() => this.getPatients()),
                catchError(error => {
                    console.error('[PatientService] Error updating patient:', error);
                    return throwError(() => error);
                })
            );
        } else {
            return this.http.post(this.apiUrl, dto).pipe(
                switchMap(() => this.getPatients()),
                catchError(error => {
                    console.error('[PatientService] Error creating patient:', error);
                    return throwError(() => error);
                })
            );
        }
    }
}
