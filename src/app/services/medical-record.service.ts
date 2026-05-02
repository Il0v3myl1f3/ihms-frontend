import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, tap, throwError } from 'rxjs';
import { MedicalRecord } from '../components/pages/dashboard/medical-records/medical-records-page.component';

@Injectable({
    providedIn: 'root'
})
export class MedicalRecordService {
    private http = inject(HttpClient);
    private apiUrl = 'http://localhost:5275/api/MedicalRecord';
    private recordsSignal = signal<MedicalRecord[]>([]);

    getMedicalRecords(patientId?: string, doctorId?: string): Observable<MedicalRecord[]> {
        let url = this.apiUrl;
        const params: string[] = [];
        if (patientId) params.push(`patientId=${patientId}`);
        if (doctorId) params.push(`doctorId=${doctorId}`);
        if (params.length > 0) url += `?${params.join('&')}`;

        return this.http.get<any>(url).pipe(
            map(data => {
                const items = Array.isArray(data) ? data : (data?.items || data?.Items || []);
                return items.map((item: any, index: number) => this.mapRecord(item, index + 1));
            }),
            tap(records => this.recordsSignal.set(records)),
            catchError(error => this.handleError(error))
        );
    }

    createMedicalRecord(record: any): Observable<MedicalRecord> {
        const payload = this.toRecordRequest(record);
        return this.http.post<any>(this.apiUrl, payload).pipe(
            map(data => this.mapRecord(data, this.recordsSignal().length + 1)),
            tap(newRecord => {
                this.recordsSignal.update(list => [...list, newRecord]);
            }),
            catchError(error => this.handleError(error))
        );
    }

    updateMedicalRecord(id: string | number, record: any): Observable<MedicalRecord> {
        const payload = this.toRecordRequest(record);
        return this.http.put<any>(`${this.apiUrl}/${id}`, payload).pipe(
            map(data => this.mapRecord(data, 0)), // Index will be corrected on refresh or update logic
            tap(updated => {
                this.recordsSignal.update(list => list.map(r => r.id === updated.id ? { ...updated, no: r.no } : r));
            }),
            catchError(error => this.handleError(error))
        );
    }

    deleteMedicalRecord(id: string | number): Observable<boolean> {
        return this.http.delete<boolean>(`${this.apiUrl}/${id}`).pipe(
            tap(success => {
                if (success) {
                    this.recordsSignal.update(list => list.filter(r => r.id !== id));
                }
            }),
            catchError(error => this.handleError(error))
        );
    }

    private toRecordRequest(data: any): any {
        const prescriptions = (data.prescriptions || []).map((p: any) => ({
            Medication: p.medication || '',
            StartDate: p.startDate ? p.startDate.substring(0, 10) : new Date().toISOString().split('T')[0],
            EndDate: p.endDate ? p.endDate.substring(0, 10) : null
        }));

        const payload = {
            PatientId: data.patientId,
            DoctorId: data.doctorId,
            AppointmentId: data.appointmentId,
            Diagnosis: data.diagnosis,
            Treatment: data.treatment,
            Notes: data.notes || '',
            Prescriptions: prescriptions
        };
        console.log('[MedicalRecordService] Sending payload:', payload);
        return payload;
    }

    private mapRecord(data: any, no: number): MedicalRecord {
        const diagnosis = data.diagnosis || data.Diagnosis || 'General Record';
        const treatment = data.treatment || data.Treatment || '';
        const notes = data.notes || data.Notes || '';
        const prescriptionsRaw = data.prescriptions || data.Prescriptions || [];
        
        const prescriptions = prescriptionsRaw.map((p: any) => ({
            id: p.id || p.Id,
            medication: p.medication || p.Medication,
            startDate: p.startDate || p.StartDate,
            endDate: p.endDate || p.EndDate
        }));

        return {
            id: data.id || data.Id,
            no,
            diagnosis: diagnosis,
            treatment: treatment,
            notes: notes,
            date: this.formatDate(data.createdAt || data.CreatedAt),
            doctorName: data.doctorName || data.DoctorName || 'Unknown Doctor',
            patientName: data.patientName || data.PatientName || 'Unknown Patient',
            status: 'Reviewed',
            appointmentId: data.appointmentId || data.AppointmentId,
            prescriptions: prescriptions
        };
    }

    private formatDate(value: string | undefined): string {
        if (!value) return 'N/A';
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return value;
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    }

    private handleError(error: any): Observable<never> {
        console.error('[MedicalRecordService] Error:', error);
        let msg = 'Server error';
        if (error.status === 0) {
            msg = 'Backend unreachable. Ensure it is running on port 5275.';
        } else if (typeof error.error === 'string') {
            msg = error.error;
        } else if (error.error?.message) {
            msg = error.error.message;
        } else if (error.error?.title) {
            msg = error.error.title;
        } else if (error.status === 400 && error.error?.errors) {
            msg = Object.values(error.error.errors).flat().join(', ');
        }
        return throwError(() => msg);
    }
}
