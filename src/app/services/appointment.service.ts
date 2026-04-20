import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, tap, throwError } from 'rxjs';
import { Appointment } from '../components/pages/dashboard/appointments/appointment-table/appointment-table.component';
import { PagedResult, PaginatedQuery } from '../core/models/pagination.models';

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
                const items = Array.isArray(data) ? data : data?.items || data?.Items || [];
                return items.map((item: any, index: number) => this.mapAppointment(item, index + 1));
            }),
            tap(items => this.appointmentsSignal.set(items)),
            catchError(error => this.handleError(error))
        );
    }

    getAppointmentsPaged(query: PaginatedQuery): Observable<PagedResult<Appointment>> {
        let params = new HttpParams()
            .set('PageNumber', query.pageNumber.toString())
            .set('PageSize', query.pageSize.toString());

        if (query.searchTerm) params = params.set('SearchTerm', query.searchTerm);
        if (query.sortBy) params = params.set('SortBy', query.sortBy);
        if (query.sortOrder) params = params.set('SortOrder', query.sortOrder);
        if (query.patientId) params = params.set('PatientId', query.patientId);
        if (query.doctorId) params = params.set('DoctorId', query.doctorId);
        if (query.dateFrom) params = params.set('DateFrom', query.dateFrom);
        if (query.dateTo) params = params.set('DateTo', query.dateTo);

        return this.http.get<PagedResult<any>>(this.apiUrl, { params }).pipe(
            map((res: PagedResult<any>) => {
                const mappedItems = res.items.map((item: any, index: number) => 
                    this.mapAppointment(item, (res.pageNumber - 1) * res.pageSize + index + 1)
                );
                return { ...res, items: mappedItems } as PagedResult<Appointment>;
            }),
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

    deleteAppointment(id: string): Observable<boolean> {
        return this.http.delete<boolean>(`${this.apiUrl}/${id}`).pipe(
            tap(() => {
                this.appointmentsSignal.update(apps => apps.filter(a => a.id !== id));
            }),
            catchError(error => this.handleError(error))
        );
    }

    deleteSelectedAppointments(ids: string[]): Observable<void> {
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
        let rawStatus = data.status || data.Status || 'Scheduled';
        // Normalize status to PascalCase (e.g., 'scheduled' -> 'Scheduled')
        let normalizedStatus: 'Scheduled' | 'Cancelled' | 'Completed' = 'Scheduled';
        const s = rawStatus.toLowerCase();
        if (s === 'cancelled') normalizedStatus = 'Cancelled';
        else if (s === 'completed') normalizedStatus = 'Completed';
        else normalizedStatus = 'Scheduled';

        return {
            id: data.id || data.Id,
            no,
            patientId: data.patientId || data.PatientId || '',
            patientName: data.patientName || data.PatientName || '',
            doctorId: data.doctorId || data.DoctorId || '',
            doctorName: data.doctorName || data.DoctorName || '',
            reason: data.reason || data.Reason || '',
            notes: data.notes || data.Notes || '',
            doctorImage: '',
            appointmentDate: this.formatDate(data.appointmentDate || data.AppointmentDate),
            status: normalizedStatus,
            selected: false
        };
    }

    private toAppointmentRequest(data: Record<string, any>): Record<string, any> {
        const rawStatus = data['status'] || 'Scheduled';
        // Backend expects PascalCase enum name (JsonStringEnumConverter default)
        const status = rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1).toLowerCase();
        return {
            PatientId: data['patientId'],
            DoctorId: data['doctorId'],
            AppointmentDate: this.toIsoDate(data['appointmentDate'] || data['date']),
            Status: status,
            Reason: data['reason'] || data['notes'] || 'Consultation',
            RoomNumber: data['roomNumber'] || '',
            Notes: data['notes'] || ''
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
