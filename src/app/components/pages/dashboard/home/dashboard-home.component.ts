import { Component, OnInit, inject, ChangeDetectionStrategy, DestroyRef, signal } from '@angular/core';
import { Observable, timer, of } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError } from 'rxjs/operators';
import { AuthService, User } from '../../../../services/auth.service';
import { LucideAngularModule, Users, Stethoscope, CalendarDays, CreditCard, FileText, Activity, ClipboardList, Heart, DoorOpen, BedDouble, Clock, MapPin, Pill, LayoutDashboard, ShieldCheck, AlertCircle } from 'lucide-angular';
import { RouterModule } from '@angular/router';
import { PatientService } from '../../../../services/patient.service';
import { AppointmentService } from '../../../../services/appointment.service';
import { LaboratoryService } from '../../../../services/laboratory.service';
import { MedicalService } from '../../../../services/medical.service';
import { PrescriptionService } from '../../../../services/prescription.service';
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
    private prescriptionService = inject(PrescriptionService);
    private destroyRef = inject(DestroyRef);

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

    // Stats Signal
    stats = signal({
        totalPatients: 0,
        totalDoctors: 0,
        scheduledAppointments: 0,
        roomOccupancy: 0,
        pendingTests: 0,
        completedTests: 0
    });

    systemModules = [
        { name: 'Doctors Registry', link: '/dashboard/doctors', icon: Stethoscope, status: 'Healthy', color: 'indigo' },
        { name: 'Patient Intake', link: '/dashboard/patient', icon: Users, status: 'Active', color: 'blue' },
        { name: 'Appointments', link: '/dashboard/appointments', icon: CalendarDays, status: 'Processing', color: 'amber' },
        { name: 'Lab Operations', link: '/dashboard/laboratory', icon: Activity, status: 'Operational', color: 'emerald' },
    ];

    // Real-time data signals
    doctorData = signal({
        myPatients: 0,
        todayAppointments: 0,
        todaySchedule: [] as any[],
        recentPatients: [] as any[]
    });

    patientData = signal({
        upcoming: null as any,
        prescriptions: [] as any[]
    });

    // Data for non-admin dashboards
    upcomingAppointment: any = null;
    activePrescriptions = signal<any[]>([]);

    ngOnInit(): void {
        this.currentUser$ = this.authService.currentUser$;
        this.currentUser$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((user) => {
            this.currentUser = user;
        });

        // Polling: Refresh all dashboard data every 30 seconds
        timer(0, 10000).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
            this.loadDashboardData();
        });
    }

    private loadDashboardData(): void {
        // Load real-time stats
        if (this.currentUser && (this.currentUser.role === 'admin' || this.currentUser.role === 'doctor')) {
            this.patientService.getPatients().pipe(
                takeUntilDestroyed(this.destroyRef),
                catchError(() => of([]))
            ).subscribe((patients: any[]) => {
                this.stats.update(s => ({ ...s, totalPatients: patients.length }));
            });
        }
        this.stats.update(s => ({ ...s, scheduledAppointments: this.appointmentService.getTodayAppointmentCount() }));

        this.medicalService.getDoctors().pipe(
            takeUntilDestroyed(this.destroyRef),
            catchError(() => of([]))
        ).subscribe((docs: any[]) => {
            this.stats.update(s => ({ ...s, totalDoctors: docs.length }));
        });

        this.laboratoryService.getAnalyses().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(ans => {
            this.stats.update(s => ({
                ...s,
                pendingTests: ans.filter(a => a.status === 'Scheduled' || a.status === 'InProgress').length,
                completedTests: ans.filter(a => a.status === 'Completed').length
            }));
        });

        // Load Role-Specific Reality
        this.appointmentService.getAppointments().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(apps => {
            if (this.currentUser?.role === 'doctor') {
                const myApps = apps.filter(a => a.doctorName === this.currentUser?.name);
                this.doctorData.set({
                    todayAppointments: myApps.length,
                    myPatients: new Set(myApps.map(a => a.patientName)).size,
                    todaySchedule: myApps.slice(0, 3).map(a => {
                        const date = new Date(a.appointmentDate);
                        const timeStr = !isNaN(date.getTime())
                            ? date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }).split(' ')
                            : ['09:00', 'AM'];
                        return {
                            time: timeStr[0],
                            period: timeStr[1],
                            title: a.notes?.split('.')[0] || a.reason || 'Consultation',
                            patient: a.patientName,
                            status: a.status
                        };
                    }),
                    recentPatients: [...new Set(myApps.map(a => a.patientName))].slice(0, 3).map(name => ({
                        name,
                        specialty: 'General Medicine',
                        time: 'Today'
                    }))
                });
            }

            if (this.currentUser?.role === 'user') {
                const myApps = apps.filter(a => a.patientName === this.currentUser?.name);
                if (myApps.length > 0) {
                    const next = myApps[0]; // Simplistic "next"
                    // Extract date and time from the record
                    const rawDate = next.appointmentDate; // e.g. "April 10, 2026" or ISO
                    const dateObj = new Date(rawDate);

                    const day = !isNaN(dateObj.getDate()) ? dateObj.getDate().toString() : '10';
                    const month = !isNaN(dateObj.getTime()) ? dateObj.toLocaleString('en-US', { month: 'short' }) : 'Jan';
                    const timeStr = !isNaN(dateObj.getTime())
                        ? dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                        : '10:00 AM';

                    this.upcomingAppointment = {
                        day,
                        month,
                        title: next.notes?.split('.')[0] || next.reason || 'Medical Consultation',
                        time: timeStr,
                        doctorName: next.doctorName,
                        cabinet: 'Cabinet 2, Floor 1'
                    };
                }

                this.patientService.getMyPatientId().pipe(
                    takeUntilDestroyed(this.destroyRef)
                ).subscribe(patientId => {
                    this.prescriptionService.getPrescriptions(patientId).pipe(
                        takeUntilDestroyed(this.destroyRef)
                    ).subscribe(items => {
                        this.activePrescriptions.set(items
                            .filter(p => p.status === 'Active')
                            .map(p => ({
                                name: p.medication,
                                dosage: p.dosage,
                                doctor: p.doctorName
                            })));
                    });
                });
            }
        });
    }

    getModuleMetric(moduleName: string): string {
        switch (moduleName) {
            case 'Doctors Registry': return `${this.stats().totalDoctors} Active`;
            case 'Patient Intake': return `${this.stats().totalPatients} Registered`;
            case 'Appointments': return `${this.stats().scheduledAppointments} Today`;
            case 'Lab Operations': return `${this.stats().pendingTests} Pending`;
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
