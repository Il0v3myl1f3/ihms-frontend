import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, tap, throwError } from 'rxjs';

export interface Doctor {
    id: string;
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
}

export interface DoctorRequest {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    department?: string;
    password?: string;
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

    getDoctors(): Observable<Doctor[]> {
        return this.http.get<any>(this.apiUrl).pipe(
            map(data => {
                // Backend returns PagedResult with Items in PascalCase usually
                const items = Array.isArray(data) ? data : (data?.items || data?.Items || []);
                return items.map((d: any) => this.mapDoctor(d));
            }),
            tap(doctors => this.doctorsSignal.set(doctors)),
            catchError(error => this.handleError(error))
        );
    }

    getDoctorById(id: string): Observable<Doctor | undefined> {
        return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
            map(data => this.mapDoctor(data)),
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

        if (!doctorData['id'] || doctorData['password']) {
            dto.password = doctorData['password'] || 'Password123!';
        }

        if (doctorData['id']) {
            return this.http.put(`${this.apiUrl}/${doctorData['id']}`, dto).pipe(
                tap(() => this.getDoctors().subscribe()),
                catchError(error => this.handleError(error))
            );
        }

        return this.http.post(this.apiUrl, dto).pipe(
            tap(() => this.getDoctors().subscribe()),
            catchError(error => this.handleError(error))
        );
    }

    deleteDoctor(id: string): Observable<boolean> {
        return this.http.delete<boolean>(`${this.apiUrl}/${id}`).pipe(
            tap(() => this.doctorsSignal.update(items => items.filter(item => item.id !== id))),
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

    private mapDoctor(data: any): Doctor {
        const id = data.id || data.Id;
        const firstName = data.firstName || data.FirstName || '';
        const lastName = data.lastName || data.LastName || '';
        const email = data.email || data.Email || '';
        const department = data.department || data.Department || 'General';

        return {
            id,
            name: `Dr. ${`${firstName} ${lastName}`.trim()}`.trim(),
            firstName,
            lastName,
            email,
            role: department,
            image: '',
            specialty: department,
            phone: data.phone || data.Phone || '',
            availability: 'Available',
            cabinet: data.cabinet || data.Cabinet || ''
        };
    }

    private handleError(error: any): Observable<never> {
        let msg = 'Server error';
        if (error.status === 0) msg = 'Backend unreachable. Ensure it is running on port 5275.';
        else if (error.error?.message) msg = error.error.message;
        return throwError(() => msg);
    }
}
