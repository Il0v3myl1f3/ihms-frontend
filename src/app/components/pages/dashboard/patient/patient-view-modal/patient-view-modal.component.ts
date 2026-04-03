import { Component, input, output, signal, computed, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, X, User, Calendar, Droplet, Phone, MapPin } from 'lucide-angular';
import { Patient } from '../patient-table/patient-table.component';
import { Appointment, AppointmentTableComponent } from '../../appointments/appointment-table/appointment-table.component';
import { Payment, PaymentTableComponent } from '../../payments/payment-table/payment-table.component';

type ViewTab = 'General Info' | 'Appointments' | 'Payments';

@Component({
    selector: 'app-patient-view-modal',
    imports: [CommonModule, LucideAngularModule, AppointmentTableComponent, PaymentTableComponent],
    templateUrl: './patient-view-modal.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PatientViewModalComponent implements OnInit, OnDestroy {
    isOpen = input(false);
    patient = input<Patient | null>(null);
    allAppointments = input<Appointment[]>([]);
    allPayments = input<Payment[]>([]);
    closeModal = output<void>();

    readonly X = X;
    readonly User = User;
    readonly Calendar = Calendar;
    readonly Droplet = Droplet;
    readonly Phone = Phone;
    readonly MapPin = MapPin;

    activeTab = signal<ViewTab>('General Info');
    tabs: ViewTab[] = ['General Info', 'Appointments', 'Payments'];

    patientAppointments = computed(() => {
        const name = this.patient()?.name;
        if (!name) return [];
        return this.allAppointments().filter(a => a.patientName === name);
    });

    patientPayments = computed(() => {
        const name = this.patient()?.name;
        if (!name) return [];
        return this.allPayments().filter(p => p.patientName === name);
    });

    ngOnInit(): void {
        document.body.style.overflow = 'hidden';
    }

    ngOnDestroy(): void {
        document.body.style.overflow = '';
    }

    setTab(tab: ViewTab): void {
        this.activeTab.set(tab);
    }

    onClose(): void {
        this.closeModal.emit();
    }

    onBackdropClick(event: MouseEvent): void {
        if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
            this.closeModal.emit();
        }
    }


}
