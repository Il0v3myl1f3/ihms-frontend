import { Component, OnInit, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { LucideAngularModule, User, Calendar, Droplet, Phone, MapPin, ArrowLeft, MoreHorizontal, Pill, FileText, Paperclip } from 'lucide-angular';
import { MedicalService, Doctor } from '../../../../../services/medical.service';
import { AppointmentTableComponent, Appointment } from '../../appointments/appointment-table/appointment-table.component';
import { AppointmentCreateModalComponent } from '../../appointments/appointment-create-modal/appointment-create-modal.component';
import { MOCK_APPOINTMENTS } from '../../appointments/appointments-page.component';
import { PaymentTableComponent, Payment } from '../../payments/payment-table/payment-table.component';
import { PaymentCreateModalComponent } from '../../payments/payment-create-modal/payment-create-modal.component';
import { Patient } from '../patient-table/patient-table.component';
import { MOCK_PATIENTS } from '../patient-list-page.component';

export interface PatientPrescription {
    id: number;
    medication: string;
    dosage: string;
    frequency: string;
    status: 'Active' | 'Expired' | 'Completed';
    refills: number;
    instructions: string;
    startDate: string;
    endDate: string;
}

@Component({
    selector: 'app-patient-details-page',
    standalone: true,
    imports: [CommonModule, LucideAngularModule, AppointmentTableComponent, PaymentTableComponent, AppointmentCreateModalComponent, PaymentCreateModalComponent],
    templateUrl: './patient-details-page.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PatientDetailsPageComponent implements OnInit {
    route = inject(ActivatedRoute);
    router = inject(Router);
    medicalService = inject(MedicalService);

    // Icons
    User = User;
    Calendar = Calendar;
    Droplet = Droplet;
    Phone = Phone;
    MapPin = MapPin;
    ArrowLeft = ArrowLeft;
    MoreHorizontal = MoreHorizontal;
    Pill = Pill;
    FileText = FileText;
    Paperclip = Paperclip;

    activeTab = signal('General Info');
    tabs = ['General Info', 'Appointments', 'Payments', 'Medical Records', 'Prescriptions'];

    patient = signal<Patient | null>(null);

    // Mock data (we will pull based on route id, ideally from a service)
    patientAppointments = signal<Appointment[]>([]);
    patientPayments = signal<Payment[]>([]);
    patientPrescriptions = signal<PatientPrescription[]>([]);
    doctors: Doctor[] = [];

    // Modal state
    isAppointmentModalOpen = signal(false);
    selectedAppointmentForEdit = signal<Appointment | null>(null);
    isAppointmentReadOnly = signal(false);
    isPaymentModalOpen = signal(false);
    selectedPaymentForEdit = signal<Payment | null>(null);
    isPaymentReadOnly = signal(false);

    totalBookings = computed(() => this.patientAppointments().length);

    lastVisited = computed(() => {
        const completed = this.patientAppointments()
            .filter(a => a.status === 'Completed')
            .sort((a, b) => new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime());
        return completed.length > 0 ? completed[0].appointmentDate : 'No visits yet';
    });

    upcomingAppointments = computed(() =>
        this.patientAppointments().filter(a => a.status === 'Scheduled')
    );

    ngOnInit() {
        this.route.paramMap.subscribe(params => {
            const idParam = params.get('id');
            if (idParam) {
                const id = parseInt(idParam, 10);
                this.loadPatientData(id);
            }
        });

        this.medicalService.getDoctors().subscribe(docs => {
            this.doctors = docs;
        });
    }

    loadPatientData(id: number) {
        // Mock fetch based on ID - normally this would call a PatientService
        // For this UI demo, we'll just populate some static/semi-dynamic data based on the ID.
        const foundPatient = MOCK_PATIENTS.find(p => p.id === id);
        
        const mockPatient: Patient = foundPatient ? { ...foundPatient } : {
            id: id,
            no: id,
            name: 'Unknown Patient',
            gender: 'Female',
            dob: 'N/A',
            address: 'N/A',
            phone: 'N/A',
            bloodType: 'N/A',
            selected: false
        };
        this.patient.set(mockPatient);

        this.patientAppointments.set(
            MOCK_APPOINTMENTS.filter(a => a.patientName === mockPatient.name)
        );

        // Mock payments
        this.patientPayments.set([
            { id: 1, no: 1, invoiceNumber: 'INV-2024-001', patientName: mockPatient.name, amount: 350.00, date: '15/01/2024', method: 'Credit Card', status: 'Paid', selected: false },
            { id: 2, no: 2, invoiceNumber: 'INV-2024-005', patientName: mockPatient.name, amount: 120.00, date: '18/02/2024', method: 'Insurance', status: 'Pending', selected: false }
        ]);

        // Mock prescriptions
        this.patientPrescriptions.set([
            { id: 1, medication: 'Metformin', dosage: '500mg', frequency: 'Once daily', status: 'Active', refills: 3, instructions: 'Take after meals', startDate: 'January 10, 2026', endDate: 'February 10, 2026' },
            { id: 2, medication: 'Lisinopril', dosage: '10mg', frequency: 'Once daily', status: 'Active', refills: 5, instructions: 'Take in the morning', startDate: 'January 15, 2026', endDate: 'March 15, 2026' },
            { id: 3, medication: 'Omeprazole', dosage: '20mg', frequency: 'Once daily', status: 'Active', refills: 2, instructions: 'Take before breakfast', startDate: 'February 1, 2026', endDate: 'February 28, 2026' },
            { id: 4, medication: 'Amoxicillin', dosage: '500mg', frequency: '3 times/day', status: 'Completed', refills: 0, instructions: 'Take with food', startDate: 'January 5, 2026', endDate: 'January 15, 2026' },
        ]);
    }

    setTab(tab: string) {
        this.activeTab.set(tab);
    }

    goBack() {
        this.router.navigate(['/dashboard/patient']);
    }

    // Appointment Handlers
    onViewAppointment(appointment: Appointment) {
        this.selectedAppointmentForEdit.set(appointment);
        this.isAppointmentReadOnly.set(true);
        this.isAppointmentModalOpen.set(true);
    }

    onEditAppointment(appointment: Appointment) {
        this.selectedAppointmentForEdit.set(appointment);
        this.isAppointmentReadOnly.set(false);
        this.isAppointmentModalOpen.set(true);
    }

    onDeleteAppointment(appointment: Appointment) {
        if (confirm(`Are you sure you want to delete appointment #${appointment.no}?`)) {
            this.patientAppointments.update(list => list.filter(a => a.id !== appointment.id));
        }
    }

    onAppointmentSaved(data: Record<string, any>) {
        if (this.selectedAppointmentForEdit()) {
            // Update existing
            const dateStr = data['date']
                ? new Date(data['date']).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                : this.selectedAppointmentForEdit()!.appointmentDate;

            this.patientAppointments.update(list => list.map(a =>
                a.id === this.selectedAppointmentForEdit()!.id
                    ? {
                        ...a,
                        doctorName: data['doctorName'],
                        appointmentDate: dateStr,
                        status: data['status'] as Appointment['status'],
                        notes: data['notes'] || a.notes
                    }
                    : a
            ));
        }
        this.isAppointmentModalOpen.set(false);
    }

    // Payment Handlers
    onViewPayment(payment: Payment) {
        this.selectedPaymentForEdit.set(payment);
        this.isPaymentReadOnly.set(true);
        this.isPaymentModalOpen.set(true);
    }

    onEditPayment(payment: Payment) {
        this.selectedPaymentForEdit.set(payment);
        this.isPaymentReadOnly.set(false);
        this.isPaymentModalOpen.set(true);
    }

    onDeletePayment(payment: Payment) {
        if (confirm(`Are you sure you want to delete payment ${payment.invoiceNumber}?`)) {
            this.patientPayments.update(list => list.filter(p => p.id !== payment.id));
        }
    }

    onPaymentSaved(data: Record<string, any>) {
        if (this.selectedPaymentForEdit()) {
            this.patientPayments.update(list => list.map(p =>
                p.id === this.selectedPaymentForEdit()!.id
                    ? {
                        ...p,
                        amount: parseFloat(data['amount']),
                        date: data['date'] ? new Date(data['date']).toLocaleDateString('en-GB') : p.date,
                        method: data['method'],
                        status: data['status'] as Payment['status']
                    }
                    : p
            ));
        }
        this.isPaymentModalOpen.set(false);
    }
}
