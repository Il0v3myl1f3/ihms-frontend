import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, throwError } from 'rxjs';

export interface Laboratory {
    id: string;
    no?: number;
    name: string;
    location: string;
    status: 'Available' | 'Occupied' | 'Maintenance';
    headOfLab: string;
    phone: string;
    operatingHours: string;
    type: string;
    selected?: boolean;
}

export interface MedicalAnalysis {
    id: string;
    no?: number;
    patientName: string;
    patientId: string;
    analysisType: string;
    labName: string;
    labId: string | number;
    scheduledDate: string;
    status: 'Scheduled' | 'InProgress' | 'Completed' | 'Cancelled';
    doctorName: string;
    doctorId: string;
    selected?: boolean;
}

export interface AnalysisResult {
    id: string;
    no?: number;
    patientName: string;
    analysisType: string;
    doctorName: string;
    resultDate: string;
    status: 'Normal' | 'Abnormal' | 'Critical';
    values: string;
    normalRange: string;
    results: { parameter: string, value: string, unit: string, range: string }[];
    comments: string;
    selected?: boolean;
}

export interface LabEquipment {
    id: string;
    no?: number;
    name: string;
    labId: string | number;
    labName: string;
    type: string;
    status: 'Operational' | 'Under Maintenance' | 'Out of Service';
    lastMaintenanceDate: string;
    nextMaintenanceDate: string;
    selected?: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class LaboratoryService {
    private http = inject(HttpClient);
    private apiUrl = 'http://localhost:5275/api/Laboratory';

    getLabs(): Observable<Laboratory[]> {
        return this.http.get<any>(this.apiUrl).pipe(
            map(data => {
                const items = Array.isArray(data) ? data : (data?.items || data?.Items || []);
                return items.map((l: any, index: number) => this.mapLaboratory(l, index + 1));
            }),
            catchError((error: any) => this.handleError(error))
        );
    }

    private mapLaboratory(data: any, no: number): Laboratory {
        return {
            id: data.id || data.Id,
            no,
            name: data.name || data.Name || '',
            location: data.location || data.Location || '',
            status: data.status || data.Status || 'Available',
            type: data.type || data.Type || 'Other',
            headOfLab: data.headOfLab || data.HeadOfLab || '',
            phone: data.phone || data.Phone || '',
            operatingHours: data.operatingHours || data.OperatingHours || '',
            selected: false
        };
    }

    private handleError(error: any): Observable<never> {
        let msg = 'Server error';
        if (error.status === 0) {
            msg = 'Backend unreachable. Ensure it is running on port 5275.';
        } else if (error.error?.message) {
            msg = error.error.message;
        } else if (typeof error.error === 'string') {
            msg = error.error;
        } else if (error.message) {
            msg = error.message;
        }
        return throwError(() => msg);
    }

    createLaboratory(lab: Omit<Laboratory, 'id' | 'no'>): Observable<Laboratory> {
        return this.http.post<Laboratory>(this.apiUrl, lab).pipe(catchError((error: any) => this.handleError(error)));
    }

    updateLaboratory(id: string, lab: Omit<Laboratory, 'id' | 'no'>): Observable<Laboratory> {
        return this.http.put<Laboratory>(`${this.apiUrl}/${id}`, lab).pipe(catchError((error: any) => this.handleError(error)));
    }

    deleteLaboratory(id: string): Observable<boolean> {
        return this.http.delete<boolean>(`${this.apiUrl}/${id}`).pipe(catchError((error: any) => this.handleError(error)));
    }

    getAnalyses(): Observable<MedicalAnalysis[]> {
        return this.http.get<any[]>(`${this.apiUrl}/analyses`).pipe(
            map(items => {
                const data = Array.isArray(items) ? items : ((items as any).items || (items as any).Items || []);
                return data.map((item: any, index: number) => ({
                    ...item,
                    id: item.id || item.Id,
                    no: index + 1,
                    patientName: item.patientName || item.PatientName || 'Unknown Patient',
                    patientId: item.patientId || item.PatientId,
                    doctorName: item.doctorName || item.DoctorName || 'Unknown Doctor',
                    doctorId: item.doctorId || item.DoctorId,
                    labName: item.labName || item.LabName || '',
                    labId: item.labId || item.LabId,
                    analysisType: item.analysisType || item.AnalysisType || 'Standard Analysis',
                    scheduledDate: item.scheduledDate || item.ScheduledDate || new Date().toISOString(),
                    status: item.status || item.Status || 'Scheduled'
                }));
            }),
            catchError((error: any) => this.handleError(error))
        );
    }

    scheduleAnalysis(analysis: any): Observable<MedicalAnalysis> {
        return this.http.post<MedicalAnalysis>(`${this.apiUrl}/analyses`, analysis).pipe(
            catchError((error: any) => this.handleError(error))
        );
    }

    updateAnalysis(id: string | number, analysis: any): Observable<MedicalAnalysis> {
        return this.http.put<MedicalAnalysis>(`${this.apiUrl}/analyses/${id}`, analysis).pipe(
            catchError((error: any) => this.handleError(error))
        );
    }

    deleteAnalysis(id: string | number): Observable<boolean> {
        return this.http.delete<boolean>(`${this.apiUrl}/analyses/${id}`).pipe(
            catchError((error: any) => this.handleError(error))
        );
    }

    getResults(): Observable<AnalysisResult[]> {
        // Placeholder until backend implements it
        return new Observable<AnalysisResult[]>(subscriber => {
            subscriber.next([]);
            subscriber.complete();
        });
    }

    getEquipment(): Observable<LabEquipment[]> {
        // Placeholder until backend implements it
        return new Observable<LabEquipment[]>(subscriber => {
            subscriber.next([]);
            subscriber.complete();
        });
    }
}
