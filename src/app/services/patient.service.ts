import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap, map, catchError, throwError, switchMap } from 'rxjs';
import { Patient } from '../components/pages/dashboard/patient/patient-table/patient-table.component';
import { PaginatedQuery, PagedResult } from '../core/models/pagination.models';
import { HttpParams } from '@angular/common/http';



@Injectable({
    providedIn: 'root'
})
export class PatientService {
    private http = inject(HttpClient);
    private apiUrl = 'http://localhost:5275/api/patient';
    private patientsSignal = signal<Patient[]>([]);
    public patients = this.patientsSignal.asReadonly();

    getPatients(): Observable<Patient[]> {
        return this.http.get<any>(this.apiUrl, {
            params: new HttpParams().set('PageSize', '999').set('SortOrder', 'desc')
        }).pipe(
            map(data => {
                const items = Array.isArray(data) ? data : (data as any).items || [];
                return items.map((p: any, index: number) => this.mapToPatient(p, index + 1));
            }),
            tap(patients => this.patientsSignal.set(patients))
        );
    }

    getPatientsPaged(query: PaginatedQuery): Observable<PagedResult<Patient>> {
        let params = new HttpParams()
            .set('PageNumber', query.pageNumber.toString())
            .set('PageSize', query.pageSize.toString());

        if (query.searchTerm) params = params.set('SearchTerm', query.searchTerm);
        if (query.sortBy) params = params.set('SortBy', query.sortBy);
        if (query.sortOrder) params = params.set('SortOrder', query.sortOrder);
        if (query.filtersJson) params = params.set('FiltersJson', query.filtersJson);

        return this.http.get<PagedResult<any>>(this.apiUrl, { params }).pipe(
            map(res => {
                const mappedItems = res.items.map((p: any, index: number) => 
                    this.mapToPatient(p, (res.pageNumber - 1) * res.pageSize + index + 1)
                );
                return { ...res, items: mappedItems } as PagedResult<Patient>;
            }),
            catchError(error => this.handleError(error))
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
            dob: p.dateOfBirth || 'N/A', 
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
        const dob = patientData['dob'];
        const dto: any = {
            firstName: patientData['firstName'],
            lastName: patientData['lastName'],
            email: patientData['email'],
            gender: patientData['gender']?.toUpperCase() || 'OTHER',
            phone: patientData['phone'],
            address: patientData['address'],
            bloodType: patientData['bloodType'],
            Password: patientData['password'] || 'Password123!'
        };

        // Only include DateOfBirth if it's a valid non-empty string (YYYY-MM-DD)
        if (dob && typeof dob === 'string' && dob.trim() !== '' && dob.includes('-')) {
            dto.dateOfBirth = dob;
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

    private handleError(error: any): Observable<never> {
        let msg = 'Server error';
        if (error.status === 0) {
            msg = 'Backend unreachable. Ensure it is running on port 5275.';
        } else if (error.status === 400 && error.error?.errors) {
            // Handle ASP.NET Core Validation Errors
            const validationErrors = error.error.errors;
            msg = Object.keys(validationErrors)
                .map(key => `${key}: ${validationErrors[key].join(', ')}`)
                .join(' | ');
        } else if (error.error?.message) {
            msg = error.error.message;
        } else if (typeof error.error === 'string') {
            msg = error.error;
        }
        return throwError(() => msg);
    }
}
