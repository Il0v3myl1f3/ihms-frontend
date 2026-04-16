import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService, User } from '../../../../services/auth.service';
import { LucideAngularModule, Users, Stethoscope, CalendarDays, CreditCard, FileText, Activity, ClipboardList, Heart, DoorOpen, BedDouble, Clock, MapPin, Pill, LayoutDashboard, ShieldCheck, AlertCircle } from 'lucide-angular';
import { RouterModule } from '@angular/router';
import { PatientService } from '../../../../services/patient.service';
import { AppointmentService } from '../../../../services/appointment.service';
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
    ];

    // Real-time data for non-admin dashboards
    doctorData = {
        myPatients: 0,
        todayAppointments: 0,
        todaySchedule: [] as any[],
        recentPatients: [] as any[]
    };

    patientData = {
        upcoming: null as any,
        prescriptions: [] as any[]
    };

    // Data for non-admin dashboards (Legacy placeholders, will be shadowed by dynamic data)
    upcomingAppointment: any = null;
    activePrescriptions: any[] = [];

    ngOnInit(): void {
        this.currentUser$ = this.authService.currentUser$;
        this.currentUser$.subscribe((user) => {
            this.currentUser = user;
        });

        // Load real-time stats
        this.patientService.getPatients().subscribe(patients => {
            this.stats.totalPatients = patients.length;
        });
        this.stats.scheduledAppointments = this.appointmentService.getTodayAppointmentCount();

        this.medicalService.getDoctors().subscribe(docs => {
            this.stats.totalDoctors = docs.length;
        });

        this.laboratoryService.getAnalyses().subscribe(ans => {
            this.stats.pendingTests = ans.filter(a => a.status === 'Scheduled' || a.status === 'InProgress').length;
            this.stats.completedTests = ans.filter(a => a.status === 'Completed').length;
        });

        // Load Role-Specific Reality
        this.appointmentService.getAppointments().subscribe(apps => {
            if (this.currentUser?.role === 'doctor') {
                const myApps = apps.filter(a => a.doctorName === this.currentUser?.name);
                this.doctorData.todayAppointments = myApps.length;
                this.doctorData.myPatients = new Set(myApps.map(a => a.patientName)).size;
                this.doctorData.todaySchedule = myApps.slice(0, 3).map(a => ({
                    time: '09:00', // Mock time
                    period: 'AM',
                    title: a.notes.split('.')[0],
                    patient: a.patientName,
                    status: a.status
                }));
                this.doctorData.recentPatients = [...new Set(myApps.map(a => a.patientName))].slice(0, 3).map(name => ({
                    name,
                    specialty: 'General Medicine',
                    time: 'Today'
                }));
            }

            if (this.currentUser?.role === 'user') {
                const myApps = apps.filter(a => a.patientName === this.currentUser?.name);
                if (myApps.length > 0) {
                    const next = myApps[0]; // Simplistic "next"
                    const dateParts = next.appointmentDate.split(' ');
                    this.upcomingAppointment = {
                        day: dateParts[1]?.replace(',', '') || '10',
                        month: dateParts[0]?.substring(0, 3) || 'Jan',
                        title: next.notes.split('.')[0] || 'Medical Consultation',
                        time: '10:00 AM — 10:30 AM',
                        doctorName: next.doctorName,
                        cabinet: 'Cabinet 3, Floor 2'
                    };
                }

                // Active Prescriptions (Still mock until service exists, but linked to patient context)
                this.activePrescriptions = [
                    { name: 'Lisinopril', dosage: '10mg · Once daily', doctor: 'Dr. Benjamin Carter' },
                    { name: 'Metformin', dosage: '850mg · 2x/day', doctor: 'Dr. Elijah Stone' },
                ];
            }
        });
    }

    getModuleMetric(moduleName: string): string {
        switch (moduleName) {
            case 'Doctors Registry': return `${this.stats.totalDoctors} Active`;
            case 'Patient Intake': return `${this.stats.totalPatients} Registered`;
            case 'Appointments': return `${this.stats.scheduledAppointments} Today`;
            case 'Lab Operations': return `${this.stats.pendingTests} Pending`;
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
