import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, tap, throwError, switchMap, of } from 'rxjs';
import { PaginatedQuery, PagedResult } from '../core/models/pagination.models';

export interface Doctor {
    id: string;
    no: number;
    name: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    image: string;
    specialty: string;
    phone?: string;
    availability?: 'Available' | 'On Leave' | string;
    cabinet?: string;
    selected: boolean;
}

export interface DoctorRequest {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    department?: string;
    password?: string;
    dateOfBirth?: string | null;
}

export interface ResponseDoctorDto {
    id: string;
    firstName: string;
    lastName: string;
    phone?: string;
    email: string;
    department?: string;
}

export interface Service {
    id: number;
    name: string;
    icon: string;
    description: string;
}

@Injectable({
    providedIn: 'root'
})
export class MedicalService {
    private http = inject(HttpClient);
    private apiUrl = 'http://localhost:5275/api/Doctor';
    private doctorsSignal = signal<Doctor[]>([]);
    public doctors = this.doctorsSignal.asReadonly();

    getDoctors(): Observable<Doctor[]> {
        return this.http.get<any>(this.apiUrl, {
            params: new HttpParams().set('PageSize', '999').set('SortOrder', 'desc')
        }).pipe(
            map(data => {
                const items = Array.isArray(data) ? data : (data?.items || data?.Items || []);
                return items.map((d: any, index: number) => this.mapDoctor(d, index + 1));
            }),
            tap(doctors => this.doctorsSignal.set(doctors)),
            catchError(error => this.handleError(error))
        );
    }

    getDoctorsPaged(query: PaginatedQuery): Observable<PagedResult<Doctor>> {
        let params = new HttpParams()
            .set('PageNumber', query.pageNumber.toString())
            .set('PageSize', query.pageSize.toString());

        if (query.searchTerm) params = params.set('SearchTerm', query.searchTerm);
        if (query.sortBy) params = params.set('SortBy', query.sortBy);
        if (query.sortOrder) params = params.set('SortOrder', query.sortOrder);
        if (query.filtersJson) params = params.set('FiltersJson', query.filtersJson);

        return this.http.get<PagedResult<any>>(this.apiUrl, { params }).pipe(
            map(res => {
                const mappedItems = res.items.map((d: any, index: number) => 
                    this.mapDoctor(d, (res.pageNumber - 1) * res.pageSize + index + 1)
                );
                return { ...res, items: mappedItems } as PagedResult<Doctor>;
            }),
            catchError(error => this.handleError(error))
        );
    }

    getDoctorById(id: string): Observable<Doctor | undefined> {
        return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
            map(data => this.mapDoctor(data, 0)),
            catchError(error => this.handleError(error))
        );
    }

    saveDoctor(doctorData: Record<string, any>): Observable<any> {
        const dto: DoctorRequest = {
            firstName: doctorData['firstName'],
            lastName: doctorData['lastName'],
            email: doctorData['email'],
            phone: doctorData['phone'],
            department: doctorData['specialty'] || doctorData['department']
        };

        const dob = doctorData['dob'];
        if (dob && typeof dob === 'string' && dob.trim() !== '' && dob.includes('-')) {
            dto.dateOfBirth = dob;
        }


        if (!doctorData['id'] || doctorData['password']) {
            dto.password = doctorData['password'] || 'Password123!';
        }

        if (doctorData['id']) {
            return this.http.put(`${this.apiUrl}/${doctorData['id']}`, dto).pipe(
                switchMap(() => this.getDoctors()),
                catchError(error => this.handleError(error))
            );
        }

        return this.http.post(this.apiUrl, dto).pipe(
            switchMap(() => this.getDoctors()),
            catchError(error => this.handleError(error))
        );
    }

    deleteDoctor(id: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${id}`).pipe(
            switchMap(() => this.getDoctors()),
            catchError(error => this.handleError(error))
        );
    }

    deleteSelectedDoctors(ids: string[]): Observable<void> {
        return new Observable<void>(observer => {
            if (ids.length === 0) {
                observer.next();
                observer.complete();
                return;
            }

            let completed = 0;
            ids.forEach(id => {
                this.deleteDoctor(id).subscribe({
                    next: () => {
                        completed += 1;
                        if (completed === ids.length) {
                            observer.next();
                            observer.complete();
                        }
                    },
                    error: err => observer.error(err)
                });
            });
        });
    }

    private mapDoctor(data: any, no: number): Doctor {
        const firstName = data.firstName || '';
        const lastName = data.lastName || '';
        const department = data.department || 'General';

        return {
            id: data.id,
            no,
            name: `Dr. ${`${firstName} ${lastName}`.trim()}`.trim(),
            firstName,
            lastName,
            email: data.email || '',
            role: department,
            image: '',
            specialty: department,
            phone: data.phone || '',
            availability: 'Available',
            cabinet: data.cabinet || '',
            selected: false
        };
    }

    private handleError(error: any): Observable<never> {
        let msg = 'Server error';
        if (error.status === 0) msg = 'Backend unreachable. Ensure it is running on port 5275.';
        else if (error.error?.message) msg = error.error.message;
        return throwError(() => msg);
    }
}
