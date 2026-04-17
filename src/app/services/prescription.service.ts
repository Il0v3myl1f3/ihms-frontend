import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, tap, throwError } from 'rxjs';
import { Prescription } from '../components/pages/dashboard/prescriptions/prescriptions-page.component';

@Injectable({
    providedIn: 'root'
})
export class PrescriptionService {
    private http = inject(HttpClient);
    private apiUrl = 'http://localhost:5275/api/Prescription';
    private prescriptionsSignal = signal<Prescription[]>([]);

    getPrescriptions(patientId?: string): Observable<Prescription[]> {
        let url = this.apiUrl;
        if (patientId) {
            url += `?patientId=${patientId}`;
        }
        return this.http.get<any>(url).pipe(
            map(data => {
                const items = Array.isArray(data) ? data : data?.items || [];
                return items.map((item: any, index: number) => this.mapPrescription(item, index + 1));
            }),
            tap(items => this.prescriptionsSignal.set(items)),
            catchError(error => this.handleError(error))
        );
    }

    private mapPrescription(data: any, no: number): Prescription {
        return {
            id: data.id || data.Id,
            no,
            medication: data.medication || data.Medication || 'Unknown Medication',
            dosage: data.dosage || data.Dosage || 'N/A',
            frequency: data.frequency || data.Frequency || 'N/A',
            doctorName: data.doctorName || data.DoctorName || 'Unknown Doctor',
            startDate: this.formatDate(data.startDate || data.StartDate),
            endDate: this.formatDate(data.endDate || data.EndDate),
            status: this.computeStatus(data.endDate || data.EndDate)
        };
    }

    private computeStatus(endDateValue: string | undefined): 'Active' | 'Expired' | 'Completed' {
        if (!endDateValue || endDateValue === 'N/A') return 'Active';
        
        // Normalize date to compare only day/month/year
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const endDate = new Date(endDateValue);
        if (Number.isNaN(endDate.getTime())) return 'Active';
        endDate.setHours(0, 0, 0, 0);

        // If endDate is today or in the future, it's Active
        return endDate >= today ? 'Active' : 'Expired';
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
