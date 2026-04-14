import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Appointment } from '../components/pages/dashboard/appointments/appointment-table/appointment-table.component';

export const MOCK_APPOINTMENTS: Appointment[] = [
    { id: 1, no: 1, patientName: 'Jane Robertson', notes: "I've been feeling unwell for a few days. The symptoms include persistent headaches, fatigue, and a mild fever that comes and goes entirely unpredictably.", doctorName: 'Dr. Mia Kensington', doctorImage: '', appointmentDate: 'January 10, 2026', status: 'Scheduled', selected: false },
    { id: 2, no: 2, patientName: 'Jane Robertson', notes: "Recurring headaches and dizziness mostly in the mornings. Patient also reports occasional blurry vision and sensitivity to bright lights over the past two weeks.", doctorName: 'Dr. Oliver Westwood', doctorImage: '', appointmentDate: 'January 25, 2026', status: 'Scheduled', selected: false },
    { id: 3, no: 3, patientName: 'Eleanor Pena', notes: "I've noticed some unusual bruising on my arms and legs even without major trauma. Also feeling quite physically exhausted after doing basic daily activities.", doctorName: 'Dr. Sophia Langley', doctorImage: '', appointmentDate: 'February 8, 2026', status: 'Scheduled', selected: false },
    { id: 4, no: 4, patientName: 'Leslie Alexander', notes: "I feel short of breath even when doing light physical work. There is a slight chest tightness during the night which makes it very hard to get a good sleep.", doctorName: 'Dr. Amelia Hawthorne', doctorImage: '', appointmentDate: 'February 20, 2026', status: 'Scheduled', selected: false },
    { id: 5, no: 5, patientName: 'Dianne Russell', notes: "I've been having stomach pains after every single meal for the past month. The pain is sharp and usually localized to the lower right abdomen, lasting hours.", doctorName: 'Dr. Clara Whitmore', doctorImage: '', appointmentDate: 'March 5, 2026', status: 'Scheduled', selected: false },
    { id: 6, no: 6, patientName: 'Devon Lane', notes: 'I keep experiencing sharp chest pains.', doctorName: 'Dr. Elijah Stone', doctorImage: '', appointmentDate: 'March 15, 2026', status: 'Scheduled', selected: false },
    { id: 7, no: 7, patientName: 'Kristin Watson', notes: "I've had a cough that lingers.", doctorName: 'Dr. Nathaniel Rivers', doctorImage: '', appointmentDate: 'March 22, 2026', status: 'Scheduled', selected: false },
    { id: 8, no: 8, patientName: 'Floyd Miles', notes: "I'm feeling unusually anxious.", doctorName: 'Dr. Victoria Ashford', doctorImage: '', appointmentDate: 'April 1, 2026', status: 'Cancelled', selected: false },
    { id: 9, no: 9, patientName: 'Courtney Henry', notes: "I've been getting night sweats.", doctorName: 'Dr. Lily Fairchild', doctorImage: '', appointmentDate: 'April 12, 2026', status: 'Scheduled', selected: false },
    { id: 10, no: 10, patientName: 'Albert Flores', notes: 'I feel like my heart is racing.', doctorName: 'Dr. Samuel Brightman', doctorImage: '', appointmentDate: 'April 23, 2026', status: 'Scheduled', selected: false }
];

@Injectable({
    providedIn: 'root'
})
export class AppointmentService {
    private appointmentsSignal = signal<Appointment[]>([...MOCK_APPOINTMENTS]);

    getAppointments(): Observable<Appointment[]> {
        return of(this.appointmentsSignal());
    }

    getAppointmentCount(): number {
        return this.appointmentsSignal().length;
    }

    getTodayAppointmentCount(): number {
        // Mocking "today" matching some records or just returning a subset
        return this.appointmentsSignal().filter(a => a.status === 'Scheduled').length;
    }

    deleteAppointment(id: number): void {
        this.appointmentsSignal.update(apps => apps.filter(a => a.id !== id));
    }

    deleteSelectedAppointments(ids: number[]): void {
        const idSet = new Set(ids);
        this.appointmentsSignal.update(apps => apps.filter(a => !idSet.has(a.id)));
    }

    saveAppointment(data: Record<string, any>): void {
        this.appointmentsSignal.update(apps => {
            if (data['id']) {
                const index = apps.findIndex(a => a.id === data['id']);
                if (index !== -1) {
                    const updated = [...apps];
                    updated[index] = { ...updated[index], ...data };
                    return updated;
                }
            } else {
                const newId = apps.length > 0 ? Math.max(...apps.map(a => a.id)) + 1 : 1;
                const newNo = apps.length > 0 ? Math.max(...apps.map(a => a.no)) + 1 : 1;
                const newApp: Appointment = {
                    id: newId,
                    no: newNo,
                    patientName: data['patientName'],
                    notes: data['notes'] || 'No notes',
                    doctorName: data['doctorName'],
                    doctorImage: '',
                    appointmentDate: data['appointmentDate'],
                    status: data['status'],
                    selected: false
                };
                return [...apps, newApp];
            }
            return apps;
        });
    }
}
