import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface Laboratory {
    id: number;
    no: number;
    name: string;
    location: string;
    status: 'Available' | 'Occupied' | 'Maintenance';
    equipmentCount: number;
    capacity: number;
}

export interface MedicalAnalysis {
    id: number;
    no: number;
    patientName: string;
    analysisType: string;
    labId: number;
    labName: string;
    scheduledDate: string;
    status: 'Scheduled' | 'InProgress' | 'Completed' | 'Cancelled';
    doctorName: string;
    selected?: boolean;
}

export interface AnalysisResult {
    id: number;
    no: number;
    analysisId: number;
    patientName: string;
    analysisType: string;
    resultDate: string;
    values: string;
    normalRange: string;
    status: 'Normal' | 'Abnormal' | 'Critical';
    doctorName: string;
    selected?: boolean;
}

export interface LabEquipment {
    id: number;
    no: number;
    name: string;
    labId: number;
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
    private labs: Laboratory[] = [
        { id: 1, no: 1, name: 'Hematology Lab', location: 'Floor 1, Wing A', status: 'Available', equipmentCount: 12, capacity: 5 },
        { id: 2, no: 2, name: 'Biochemistry Lab', location: 'Floor 1, Wing B', status: 'Occupied', equipmentCount: 15, capacity: 8 },
        { id: 3, no: 3, name: 'Microbiology Lab', location: 'Floor 2, Wing A', status: 'Available', equipmentCount: 10, capacity: 4 },
        { id: 4, no: 4, name: 'Genetics Lab', location: 'Floor 2, Wing C', status: 'Maintenance', equipmentCount: 8, capacity: 3 },
        { id: 5, no: 5, name: 'Pathology Lab', location: 'Floor 3, Wing B', status: 'Available', equipmentCount: 20, capacity: 10 }
    ];

    private analyses: MedicalAnalysis[] = [
        { id: 1, no: 1, patientName: 'John Doe', analysisType: 'Complete Blood Count', labId: 1, labName: 'Hematology Lab', scheduledDate: '2026-04-10 09:00', status: 'Scheduled', doctorName: 'Dr. Mia Kensington' },
        { id: 2, no: 2, patientName: 'Alice Smith', analysisType: 'Lipid Profile', labId: 2, labName: 'Biochemistry Lab', scheduledDate: '2026-04-10 10:30', status: 'InProgress', doctorName: 'Dr. Oliver Westwood' },
        { id: 3, no: 3, patientName: 'Robert Brown', analysisType: 'Urine Culture', labId: 3, labName: 'Microbiology Lab', scheduledDate: '2026-04-11 08:00', status: 'Scheduled', doctorName: 'Dr. Sophia Langley' },
        { id: 4, no: 4, patientName: 'Emily Davis', analysisType: 'Liver Function Test', labId: 2, labName: 'Biochemistry Lab', scheduledDate: '2026-04-08 14:00', status: 'Completed', doctorName: 'Dr. Amelia Hawthorne' },
        { id: 5, no: 5, patientName: 'Michael Wilson', analysisType: 'Blood Glucose', labId: 2, labName: 'Biochemistry Lab', scheduledDate: '2026-04-12 09:15', status: 'Scheduled', doctorName: 'Dr. Clara Whitmore' }
    ];

    private results: AnalysisResult[] = [
        { id: 1, no: 1, analysisId: 4, patientName: 'Emily Davis', analysisType: 'Liver Function Test', resultDate: '2026-04-08 16:30', values: 'ALT: 35, AST: 30', normalRange: 'ALT: <40, AST: <40', status: 'Normal', doctorName: 'Dr. Amelia Hawthorne' },
        { id: 2, no: 2, analysisId: 10, patientName: 'Jane Smith', analysisType: 'Hemoglobin', resultDate: '2026-04-07 10:00', values: 'Hb: 9.5 g/dL', normalRange: '12-16 g/dL', status: 'Abnormal', doctorName: 'Dr. Mia Kensington' },
        { id: 3, no: 3, analysisId: 15, patientName: 'Tom White', analysisType: 'Potassium', resultDate: '2026-04-07 11:45', values: 'K+: 6.8 mmol/L', normalRange: '3.5-5.1 mmol/L', status: 'Critical', doctorName: 'Dr. Nathaniel Rivers' }
    ];

    private equipment: LabEquipment[] = [
        { id: 1, no: 1, name: 'Centrifuge X1', labId: 1, labName: 'Hematology Lab', type: 'Centrifuge', status: 'Operational', lastMaintenanceDate: '2026-01-15', nextMaintenanceDate: '2026-07-15' },
        { id: 2, no: 2, name: 'Microscope Z200', labId: 1, labName: 'Hematology Lab', type: 'Microscope', status: 'Operational', lastMaintenanceDate: '2026-02-10', nextMaintenanceDate: '2026-08-10' },
        { id: 3, no: 3, name: 'Chemistry Analyzer 5000', labId: 2, labName: 'Biochemistry Lab', type: 'Analyzer', status: 'Operational', lastMaintenanceDate: '2025-12-05', nextMaintenanceDate: '2026-06-05' },
        { id: 4, no: 4, name: 'Incubator I-10', labId: 3, labName: 'Microbiology Lab', type: 'Incubator', status: 'Under Maintenance', lastMaintenanceDate: '2026-04-05', nextMaintenanceDate: '2026-10-05' },
        { id: 5, no: 5, name: 'PCR Machine P-2', labId: 4, labName: 'Genetics Lab', type: 'PCR', status: 'Out of Service', lastMaintenanceDate: '2025-11-20', nextMaintenanceDate: '2026-05-20' }
    ];

    getLabs(): Observable<Laboratory[]> {
        return of(this.labs);
    }

    getAnalyses(): Observable<MedicalAnalysis[]> {
        return of(this.analyses);
    }

    getResults(): Observable<AnalysisResult[]> {
        return of(this.results);
    }

    getEquipment(): Observable<LabEquipment[]> {
        return of(this.equipment);
    }

    addAnalysis(analysis: Omit<MedicalAnalysis, 'id' | 'no' | 'status'>): Observable<MedicalAnalysis> {
        const newId = this.analyses.length > 0 ? Math.max(...this.analyses.map(a => a.id)) + 1 : 1;
        const newNo = this.analyses.length > 0 ? Math.max(...this.analyses.map(a => a.no)) + 1 : 1;
        const newAnalysis: MedicalAnalysis = {
            ...analysis,
            id: newId,
            no: newNo,
            status: 'Scheduled'
        };
        this.analyses.push(newAnalysis);
        return of(newAnalysis);
    }

    updateEquipmentStatus(id: number, status: LabEquipment['status']): Observable<boolean> {
        const eq = this.equipment.find(e => e.id === id);
        if (eq) {
            eq.status = status;
            return of(true);
        }
        return of(false);
    }
}
