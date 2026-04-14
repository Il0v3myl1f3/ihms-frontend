import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService, User } from '../../../../services/auth.service';
import { LucideAngularModule, Users, Stethoscope, CalendarDays, CreditCard, FileText, Activity, ClipboardList, Heart, DoorOpen, BedDouble, Clock, MapPin, Pill, LayoutDashboard, ShieldCheck, AlertCircle } from 'lucide-angular';
import { RouterModule } from '@angular/router';
import { PatientService } from '../../../../services/patient.service';
import { AppointmentService } from '../../../../services/appointment.service';
import { RoomService } from '../../../../services/room.service';
import { LaboratoryService } from '../../../../services/laboratory.service';
import { MedicalService } from '../../../../services/medical.service';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-dashboard-home',
    imports: [LucideAngularModule, RouterModule, CommonModule],
    templateUrl: './dashboard-home.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardHomeComponent implements OnInit {
    private authService = inject(AuthService);
    private patientService = inject(PatientService);
    private appointmentService = inject(AppointmentService);
    private roomService = inject(RoomService);
    private laboratoryService = inject(LaboratoryService);
    private medicalService = inject(MedicalService);

    currentUser$!: Observable<User | null>;
    currentUser: User | null = null;

    // Icons
    readonly Users = Users;
    readonly Stethoscope = Stethoscope;
    readonly CalendarDays = CalendarDays;
    readonly CreditCard = CreditCard;
    readonly FileText = FileText;
    readonly Activity = Activity;
    readonly ClipboardList = ClipboardList;
    readonly Heart = Heart;
    readonly DoorOpen = DoorOpen;
    readonly BedDouble = BedDouble;
    readonly Clock = Clock;
    readonly MapPin = MapPin;
    readonly Pill = Pill;
    readonly LayoutDashboard = LayoutDashboard;
    readonly ShieldCheck = ShieldCheck;
    readonly AlertCircle = AlertCircle;

    // Stats
    stats = {
        totalPatients: 0,
        totalDoctors: 0,
        scheduledAppointments: 0,
        roomOccupancy: 0,
        pendingTests: 0,
        completedTests: 0
    };

    systemModules = [
        { name: 'Doctors Registry', link: '/dashboard/doctors', icon: Stethoscope, status: 'Healthy', color: 'indigo' },
        { name: 'Patient Intake', link: '/dashboard/patient', icon: Users, status: 'Active', color: 'blue' },
        { name: 'Appointments', link: '/dashboard/appointments', icon: CalendarDays, status: 'Processing', color: 'amber' },
        { name: 'Lab Operations', link: '/dashboard/laboratory', icon: Activity, status: 'Operational', color: 'emerald' },
        { name: 'Bed Management', link: '/dashboard/rooms', icon: DoorOpen, status: 'Monitoring', color: 'rose' },
        { name: 'Financials', link: '/dashboard/payments', icon: CreditCard, status: 'Stable', color: 'emerald' },
    ];

    // Data for non-admin dashboards
    upcomingAppointment = {
        day: '22',
        month: 'Mar',
        title: 'General Checkup',
        time: '10:00 AM — 10:30 AM',
        doctorName: 'Dr. Mia Kensington',
        cabinet: 'Cabinet 3, Floor 2'
    };

    activePrescriptions = [
        { name: 'Lisinopril', dosage: '10mg · Once daily', doctor: 'Dr. Benjamin Carter' },
        { name: 'Metformin', dosage: '850mg · 2x/day', doctor: 'Dr. Elijah Stone' },
        { name: 'Omeprazole', dosage: '20mg · Once daily', doctor: 'Dr. Clara Whitmore' },
    ];

    ngOnInit(): void {
        this.currentUser$ = this.authService.currentUser$;
        this.currentUser$.subscribe((user) => {
            this.currentUser = user;
        });

        // Load real-time stats
        this.stats.totalPatients = this.patientService.getPatientCount();
        this.stats.scheduledAppointments = this.appointmentService.getTodayAppointmentCount();
        
        const roomStats = this.roomService.getRoomStats();
        this.stats.roomOccupancy = Math.round((roomStats.occupied / roomStats.total) * 100);

        this.medicalService.getDoctors().subscribe(docs => {
            this.stats.totalDoctors = docs.length;
        });

        this.laboratoryService.getAnalyses().subscribe(ans => {
            this.stats.pendingTests = ans.filter(a => a.status === 'Scheduled' || a.status === 'InProgress').length;
            this.stats.completedTests = ans.filter(a => a.status === 'Completed').length;
        });
    }

    getModuleMetric(moduleName: string): string {
        switch (moduleName) {
            case 'Doctors Registry': return `${this.stats.totalDoctors} Active`;
            case 'Patient Intake': return `${this.stats.totalPatients} Registered`;
            case 'Appointments': return `${this.stats.scheduledAppointments} Today`;
            case 'Lab Operations': return `${this.stats.pendingTests} Pending`;
            case 'Bed Management': return `${this.stats.roomOccupancy}% Occupied`;
            case 'Financials': return `$52k Total`;
            default: return 'Active';
        }
    }

    getUserFirstName(): string {
        if (!this.currentUser?.name) return 'User';
        return this.currentUser.name.split(' ')[0] || 'User';
    }

    get userRole(): string {
        return this.currentUser?.role ?? 'user';
    }
}
