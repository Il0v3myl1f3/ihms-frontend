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
                const items = Array.isArray(data) ? data : data?.items || [];
                return items.map((item: any, index: number) => this.mapRecord(item, index + 1));
            }),
            tap(records => this.recordsSignal.set(records)),
            catchError(error => this.handleError(error))
        );
    }

    private mapRecord(data: any, no: number): MedicalRecord {
        const diagnosis = data.diagnosis || data.Diagnosis || 'General Record';
        const treatment = data.treatment || data.Treatment || '';
        const notes = data.notes || data.Notes || '';
        const combined = [treatment, notes].filter(Boolean).join(' - ') || 'No additional notes';

        return {
            id: data.id || data.Id,
            no,
            recordType: diagnosis,
            date: this.formatDate(data.createdAt || data.CreatedAt),
            doctorName: data.doctorName || data.DoctorName || 'Unknown Doctor',
            patientName: data.patientName || data.PatientName || 'Unknown Patient',
            description: combined,
            status: 'Reviewed'
        };
    }

    private formatDate(value: string | undefined): string {
        if (!value) return 'N/A';
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return value;
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    }

    private handleError(error: any): Observable<never> {
        let msg = 'Server error';
        if (error.status === 0) msg = 'Backend unreachable. Ensure it is running on port 5275.';
        else if (error.error?.message) msg = error.error.message;
        return throwError(() => msg);
    }
}
