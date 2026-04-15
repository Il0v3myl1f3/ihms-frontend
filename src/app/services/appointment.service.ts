import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, tap, throwError } from 'rxjs';
import { Appointment } from '../components/pages/dashboard/appointments/appointment-table/appointment-table.component';

@Injectable({
    providedIn: 'root'
})
export class AppointmentService {
    private http = inject(HttpClient);
    private apiUrl = 'http://localhost:5275/api/Appointment';
    private appointmentsSignal = signal<Appointment[]>([]);

    getAppointments(): Observable<Appointment[]> {
        return this.http.get<any>(this.apiUrl).pipe(
            map(data => {
                const items = Array.isArray(data) ? data : data?.items || [];
                return items.map((item: any, index: number) => this.mapAppointment(item, index + 1));
            }),
            tap(items => this.appointmentsSignal.set(items)),
            catchError(error => this.handleError(error))
        );
    }

    getAppointmentsByDoctorName(doctorName: string): Observable<Appointment[]> {
        return this.getAppointments().pipe(
            map(items => items.filter(item => item.doctorName === doctorName))
        );
    }

    getAppointmentsByPatientName(patientName: string): Observable<Appointment[]> {
        return this.getAppointments().pipe(
            map(items => items.filter(item => item.patientName === patientName))
        );
    }

    getAppointmentCount(): number {
        return this.appointmentsSignal().length;
    }

    getTodayAppointmentCount(): number {
        return this.appointmentsSignal().filter(a => a.status === 'Scheduled').length;
    }

    deleteAppointment(id: number): Observable<boolean> {
        return this.http.delete<boolean>(`${this.apiUrl}/${id}`).pipe(
            tap(() => {
                this.appointmentsSignal.update(apps => apps.filter(a => a.id !== id));
            }),
            catchError(error => this.handleError(error))
        );
    }

    deleteSelectedAppointments(ids: number[]): Observable<void> {
        return new Observable<void>(observer => {
            if (ids.length === 0) {
                observer.next();
                observer.complete();
                return;
            }

            let completed = 0;
            ids.forEach(id => {
                this.deleteAppointment(id).subscribe({
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

    saveAppointment(data: Record<string, any>): Observable<Appointment> {
        const payload = this.toAppointmentRequest(data);
        if (data['id']) {
            return this.http.put<any>(`${this.apiUrl}/${data['id']}`, payload).pipe(
                map(item => this.mapAppointment(item, data['no'] || 1)),
                tap(updated => {
                    this.appointmentsSignal.update(apps =>
                        apps.map(app => app.id === updated.id ? { ...updated, no: app.no } : app)
                    );
                }),
                catchError(error => this.handleError(error))
            );
        }

        return this.http.post<any>(this.apiUrl, payload).pipe(
            map(item => this.mapAppointment(item, this.appointmentsSignal().length + 1)),
            tap(created => this.appointmentsSignal.update(apps => [...apps, created])),
            catchError(error => this.handleError(error))
        );
    }

    private mapAppointment(data: any, no: number): Appointment {
        return {
            id: data.id || data.Id,
            no,
            patientName: data.patientName || data.PatientName || '',
            notes: data.notes || data.Notes || '',
            doctorName: data.doctorName || data.DoctorName || '',
            doctorImage: '',
            appointmentDate: this.formatDate(data.appointmentDate || data.AppointmentDate),
            status: data.status || data.Status || 'Scheduled',
            selected: false
        };
    }

    private toAppointmentRequest(data: Record<string, any>): Record<string, any> {
        return {
            patientId: Number(data['patientId'] || data['id'] || 1),
            doctorId: Number(data['doctorId'] || 1),
            appointmentDate: this.toIsoDate(data['appointmentDate'] || data['date']),
            status: data['status'] || 'Scheduled',
            reason: data['notes'] || 'Consultation',
            roomNumber: data['roomNumber'] || '',
            notes: data['notes'] || ''
        };
    }

    private formatDate(value: string | undefined): string {
        if (!value) return '';
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return value;
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    }

    private toIsoDate(value: string | undefined): string {
        if (!value) return new Date().toISOString();
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return new Date().toISOString();
        return date.toISOString();
    }

    private handleError(error: any): Observable<never> {
        let msg = 'Server error';
        if (error.status === 0) msg = 'Backend unreachable. Ensure it is running on port 5275.';
        else if (error.error?.message) msg = error.error.message;
        return throwError(() => msg);
    }
}
