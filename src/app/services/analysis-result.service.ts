import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, throwError } from 'rxjs';

export interface AnalysisResult {
  id: string;
  analysisId: string;
  analysisType: string;
  labName: string;
  patientName: string;
  doctorName: string;
  scheduledDate: string;
  resultValue: string | null;
  unit: string | null;
  referenceRange: string | null;
  interpretation: string | null;
  notes: string | null;
  status: string;
  completedAt: string;
  createdAt: string;
  // UI-only
  no?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AnalysisResultService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5275/api/analysis-result';

  getResults(): Observable<AnalysisResult[]> {
    return this.http.get<any>(this.apiUrl).pipe(
      map(data => {
        const items = Array.isArray(data) ? data : (data?.items || data?.Items || []);
        return items.map((item: any, index: number) => this.mapResult(item, index + 1));
      }),
      catchError((error: any) => this.handleError(error))
    );
  }

  getResultById(id: string): Observable<AnalysisResult> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map((item: any) => this.mapResult(item, 1)),
      catchError((error: any) => this.handleError(error))
    );
  }

  private mapResult(data: any, no: number): AnalysisResult {
    return {
      id:              data.id              || data.Id              || '',
      analysisId:      data.analysisId      || data.AnalysisId      || '',
      analysisType:    data.analysisType    || data.AnalysisType    || '',
      labName:         data.labName         || data.LabName         || '',
      patientName:     data.patientName     || data.PatientName     || '',
      doctorName:      data.doctorName      || data.DoctorName      || '',
      scheduledDate:   data.scheduledDate   || data.ScheduledDate   || '',
      resultValue:     data.resultValue     ?? data.ResultValue     ?? null,
      unit:            data.unit            ?? data.Unit            ?? null,
      referenceRange:  data.referenceRange  ?? data.ReferenceRange  ?? null,
      interpretation:  data.interpretation  ?? data.Interpretation  ?? null,
      notes:           data.notes           ?? data.Notes           ?? null,
      status:          data.status          || data.Status          || '',
      completedAt:     data.completedAt     || data.CompletedAt     || '',
      createdAt:       data.createdAt       || data.CreatedAt       || '',
      no
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
}
