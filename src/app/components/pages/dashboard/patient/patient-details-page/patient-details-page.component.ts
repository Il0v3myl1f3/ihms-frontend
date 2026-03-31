import { Component, OnInit, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { LucideAngularModule, User, Calendar, Droplet, Phone, MapPin, ArrowLeft, MoreHorizontal } from 'lucide-angular';
import { AppointmentTableComponent, Appointment } from '../../appointments/appointment-table/appointment-table.component';
import { PaymentTableComponent, Payment } from '../../payments/payment-table/payment-table.component';
import { Patient } from '../patient-table/patient-table.component';

@Component({
  selector: 'app-patient-details-page',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, AppointmentTableComponent, PaymentTableComponent],
  templateUrl: './patient-details-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PatientDetailsPageComponent implements OnInit {
   route = inject(ActivatedRoute);
   router = inject(Router);

   // Icons
   User = User;
   Calendar = Calendar;
   Droplet = Droplet;
   Phone = Phone;
   MapPin = MapPin;
   ArrowLeft = ArrowLeft;
   MoreHorizontal = MoreHorizontal;

   activeTab = signal('General Info');
   tabs = ['General Info', 'Appointments', 'Payments', 'Medical Records', 'Prescriptions'];

   patient = signal<Patient | null>(null);

   // Mock data (we will pull based on route id, ideally from a service)
   patientAppointments = signal<Appointment[]>([]);
   patientPayments = signal<Payment[]>([]);

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

   historyAppointments = computed(() => 
       this.patientAppointments().filter(a => a.status === 'Completed')
   );

   ngOnInit() {
       this.route.paramMap.subscribe(params => {
           const idParam = params.get('id');
           if (idParam) {
               const id = parseInt(idParam, 10);
               this.loadPatientData(id);
           }
       });
   }

   loadPatientData(id: number) {
       // Mock fetch based on ID - normally this would call a PatientService
       // For this UI demo, we'll just populate some static/semi-dynamic data based on the ID.
       const mockPatient: Patient = { 
           id: id, 
           no: id, 
           name: 'Jane Robertson', // Mocked name
           gender: 'Female', 
           dob: '11/12/1990', 
           address: '3891 Ranchview Dr.', 
           phone: '(217) 555-0113', 
           bloodType: 'A+', 
           selected: false 
       };
       this.patient.set(mockPatient);

       // Mock appointments
       this.patientAppointments.set([
           { id: 1, no: 1, patientName: mockPatient.name, notes: "I've been feeling unwell for a few days...", doctorName: 'Dr. Mia Kensington', doctorImage: '', appointmentDate: 'January 10, 2026', status: 'Completed', selected: false },
           { id: 2, no: 2, patientName: mockPatient.name, notes: "Routine checkup follow-up.", doctorName: 'Dr. Sophia Langley', doctorImage: '', appointmentDate: 'February 8, 2026', status: 'Scheduled', selected: false }
       ]);

       // Mock payments
       this.patientPayments.set([
           { id: 1, no: 1, invoiceNumber: 'INV-2024-001', patientName: mockPatient.name, amount: 350.00, date: '15/01/2024', method: 'Credit Card', status: 'Paid', selected: false },
           { id: 2, no: 2, invoiceNumber: 'INV-2024-005', patientName: mockPatient.name, amount: 120.00, date: '18/02/2024', method: 'Insurance', status: 'Pending', selected: false }
       ]);
   }

   setTab(tab: string) {
       this.activeTab.set(tab);
   }

   goBack() {
       this.router.navigate(['/dashboard/patient']);
   }
}
