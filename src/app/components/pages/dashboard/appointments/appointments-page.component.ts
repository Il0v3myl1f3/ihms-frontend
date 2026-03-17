import { Component, ChangeDetectionStrategy, signal, computed, effect, untracked, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Search, Filter, ChevronLeft, ChevronRight, Plus, MoreHorizontal, X, Pencil, Trash2, Eye, ChevronDown, ChevronUp } from 'lucide-angular';
import { MedicalService, Doctor } from '../../../../services/medical.service';

export interface Appointment {
    id: number;
    no: number;
    patientName: string;
    notes: string;
    doctorName: string;
    doctorImage: string;
    appointmentDate: string;
    status: 'Scheduled' | 'Cancelled' | 'Completed';
}

@Component({
    selector: 'app-appointments-page',
    imports: [CommonModule, FormsModule, LucideAngularModule],
    templateUrl: './appointments-page.component.html',
    styleUrl: './appointments-page.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        '(document:click)': 'closeAllDropdowns()'
    }
})
export class AppointmentsPageComponent {
    // Icons
    readonly Search = Search;
    readonly Filter = Filter;
    readonly ChevronLeft = ChevronLeft;
    readonly ChevronRight = ChevronRight;
    readonly Plus = Plus;
    readonly MoreHorizontal = MoreHorizontal;
    readonly X = X;
    readonly Pencil = Pencil;
    readonly Trash2 = Trash2;
    readonly Eye = Eye;
    readonly ChevronDown = ChevronDown;
    readonly ChevronUp = ChevronUp;

    private medicalService = inject(MedicalService);

    // Doctors list for the modal dropdown
    doctors: Doctor[] = [];

    // Patient names for the modal dropdown
    patientNames: string[] = [
        'Jane Robertson', 'Jacob Jones', 'Eleanor Pena', 'Leslie Alexander',
        'Dianne Russell', 'Devon Lane', 'Kristin Watson', 'Floyd Miles',
        'Courtney Henry', 'Albert Flores', 'Sabrina Gomez', 'Alexandra Smith',
        'Benjamin Johnson', 'Avery Thompson', 'Olivia Brown', 'Brandon Davis',
        'Amelia Wilson', 'Charlotte Martinez', 'Ethan Garcia', 'Sophia Rodriguez',
        'Lucas Lee'
    ];

    // Mock data
    appointments: Appointment[] = [
        { id: 1, no: 1, patientName: 'Jane Robertson', notes: "I've been feeling unwell for a few...", doctorName: 'Dr. Mia Kensington', doctorImage: '', appointmentDate: 'January 10, 2026', status: 'Completed' },
        { id: 2, no: 2, patientName: 'Jacob Jones', notes: 'Recurring headaches and dizziness...', doctorName: 'Dr. Oliver Westwood', doctorImage: '', appointmentDate: 'January 25, 2026', status: 'Completed' },
        { id: 3, no: 3, patientName: 'Eleanor Pena', notes: "I've noticed some unusual br...", doctorName: 'Dr. Sophia Langley', doctorImage: '', appointmentDate: 'February 8, 2026', status: 'Completed' },
        { id: 4, no: 4, patientName: 'Leslie Alexander', notes: 'I feel short of breath even w...', doctorName: 'Dr. Amelia Hawthorne', doctorImage: '', appointmentDate: 'February 20, 2026', status: 'Cancelled' },
        { id: 5, no: 5, patientName: 'Dianne Russell', notes: "I've been having stomach pa...", doctorName: 'Dr. Clara Whitmore', doctorImage: '', appointmentDate: 'March 5, 2026', status: 'Scheduled' },
        { id: 6, no: 6, patientName: 'Devon Lane', notes: 'I keep experiencing sharp ch...', doctorName: 'Dr. Elijah Stone', doctorImage: '', appointmentDate: 'March 15, 2026', status: 'Scheduled' },
        { id: 7, no: 7, patientName: 'Kristin Watson', notes: "I've had a cough that lingers...", doctorName: 'Dr. Nathaniel Rivers', doctorImage: '', appointmentDate: 'March 22, 2026', status: 'Scheduled' },
        { id: 8, no: 8, patientName: 'Floyd Miles', notes: "I'm feeling unusually anxious...", doctorName: 'Dr. Victoria Ashford', doctorImage: '', appointmentDate: 'April 1, 2026', status: 'Cancelled' },
        { id: 9, no: 9, patientName: 'Courtney Henry', notes: "I've been getting night sweat...", doctorName: 'Dr. Lily Fairchild', doctorImage: '', appointmentDate: 'April 12, 2026', status: 'Scheduled' },
        { id: 10, no: 10, patientName: 'Albert Flores', notes: 'I feel like my heart is racing f...', doctorName: 'Dr. Samuel Brightman', doctorImage: '', appointmentDate: 'April 23, 2026', status: 'Scheduled' },
        { id: 11, no: 11, patientName: 'Sabrina Gomez', notes: "I've been feeling really fatigu...", doctorName: 'Dr. Mia Kensington', doctorImage: '', appointmentDate: 'May 5, 2026', status: 'Scheduled' },
        { id: 12, no: 12, patientName: 'Alexandra Smith', notes: 'I have a persistent headache...', doctorName: 'Dr. Oliver Westwood', doctorImage: '', appointmentDate: 'May 18, 2026', status: 'Cancelled' },
        { id: 13, no: 13, patientName: 'Benjamin Johnson', notes: "I've noticed some unusual br...", doctorName: 'Dr. Sophia Langley', doctorImage: '', appointmentDate: 'June 2, 2026', status: 'Scheduled' },
        { id: 14, no: 14, patientName: 'Avery Thompson', notes: 'I feel short of breath even w...', doctorName: 'Dr. Amelia Hawthorne', doctorImage: '', appointmentDate: 'June 15, 2026', status: 'Scheduled' },
        { id: 15, no: 15, patientName: 'Olivia Brown', notes: "I've been having stomach pa...", doctorName: 'Dr. Clara Whitmore', doctorImage: '', appointmentDate: 'July 1, 2026', status: 'Cancelled' },
        { id: 16, no: 16, patientName: 'Brandon Davis', notes: 'I keep experiencing sharp ch...', doctorName: 'Dr. Elijah Stone', doctorImage: '', appointmentDate: 'August 30, 2026', status: 'Scheduled' },
        { id: 17, no: 17, patientName: 'Amelia Wilson', notes: "I've had a cough that lingers...", doctorName: 'Dr. Nathaniel Rivers', doctorImage: '', appointmentDate: 'September 15, 2026', status: 'Cancelled' },
        { id: 18, no: 18, patientName: 'Charlotte Martinez', notes: "I'm feeling unusually anxious...", doctorName: 'Dr. Victoria Ashford', doctorImage: '', appointmentDate: 'October 22, 2026', status: 'Cancelled' },
        { id: 19, no: 19, patientName: 'Ethan Garcia', notes: "I've been getting night sweat...", doctorName: 'Dr. Lily Fairchild', doctorImage: '', appointmentDate: 'November 18, 2026', status: 'Scheduled' },
        { id: 20, no: 20, patientName: 'Sophia Rodriguez', notes: 'I feel like my heart is racing f...', doctorName: 'Dr. Samuel Brightman', doctorImage: '', appointmentDate: 'December 5, 2026', status: 'Scheduled' },
        { id: 21, no: 21, patientName: 'Lucas Lee', notes: "I've been experiencing frequ...", doctorName: 'Dr. Lucas Pendleton', doctorImage: '', appointmentDate: 'January 12, 2027', status: 'Completed' },
    ];

    // State
    searchQuery = signal('');
    currentPage = signal(1);
    pageSize = signal(7);
    sortColumn = signal<string>('');
    sortDirection = signal<'asc' | 'desc'>('asc');

    // Filter state
    filterStatus = signal<string>('All');
    filterDoctor = signal<string>('All');
    activeFilterMenu = signal<string | null>(null);
    isPageSizeMenuOpen = false;

    // Modal state
    isModalOpen = signal(false);
    modalPatientName = signal('');
    modalDoctorName = signal('');
    modalDate = signal('');
    modalStatus = signal<'Scheduled' | 'Cancelled' | 'Completed'>('Scheduled');
    modalNotes = signal('');

    // Actions dropdown
    activeItem: Appointment | null = null;
    dropdownPos = { top: 0, right: 0 };

    constructor() {
        this.medicalService.getDoctors().subscribe(docs => {
            this.doctors = docs;
        });

        effect(() => {
            this.searchQuery();
            untracked(() => this.currentPage.set(1));
        });
    }

    // Available filter values
    availableStatuses = computed(() => {
        const statuses = this.appointments.map(a => a.status).filter(s => !!s);
        return ['All', ...Array.from(new Set(statuses)).sort()];
    });

    availableDoctors = computed(() => {
        const docs = this.appointments.map(a => a.doctorName).filter(s => !!s);
        return ['All', ...Array.from(new Set(docs)).sort()];
    });

    // Computed: filtered appointments
    filteredAppointments = computed(() => {
        let result = [...this.appointments];
        const query = this.searchQuery().toLowerCase().trim();

        if (query) {
            result = result.filter(a =>
                a.patientName.toLowerCase().includes(query) ||
                a.doctorName.toLowerCase().includes(query) ||
                a.notes.toLowerCase().includes(query) ||
                a.appointmentDate.toLowerCase().includes(query) ||
                a.status.toLowerCase().includes(query) ||
                a.no.toString().includes(query)
            );
        }

        const statFilter = this.filterStatus();
        if (statFilter !== 'All') {
            result = result.filter(a => a.status === statFilter);
        }

        const docFilter = this.filterDoctor();
        if (docFilter !== 'All') {
            result = result.filter(a => a.doctorName === docFilter);
        }

        // Sorting
        const col = this.sortColumn();
        const dir = this.sortDirection() === 'asc' ? 1 : -1;
        if (col) {
            result = [...result].sort((a, b) => {
                const aVal: any = a[col as keyof Appointment];
                const bVal: any = b[col as keyof Appointment];
                if (aVal < bVal) return -1 * dir;
                if (aVal > bVal) return 1 * dir;
                return 0;
            });
        }

        return result;
    });

    // Sorting
    handleSort(column: string): void {
        if (this.sortColumn() === column) {
            this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
        } else {
            this.sortColumn.set(column);
            this.sortDirection.set('asc');
        }
        this.currentPage.set(1);
    }

    // Pagination
    totalPages = computed(() => Math.max(1, Math.ceil(this.filteredAppointments().length / this.pageSize())));

    paginatedAppointments = computed(() => {
        const start = (this.currentPage() - 1) * this.pageSize();
        return this.filteredAppointments().slice(start, start + this.pageSize());
    });

    visiblePages = computed(() => {
        const total = this.totalPages();
        const current = this.currentPage();
        if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
        if (current <= 3) return [1, 2, 3, '...', total];
        if (current >= total - 2) return [1, '...', total - 2, total - 1, total];
        return [1, '...', current, '...', total];
    });

    goToPage(page: number | string): void {
        if (typeof page === 'number' && page >= 1 && page <= this.totalPages() && page !== this.currentPage()) {
            this.currentPage.set(page);
        }
    }

    nextPage(): void { if (this.currentPage() < this.totalPages()) this.currentPage.update(p => p + 1); }
    prevPage(): void { if (this.currentPage() > 1) this.currentPage.update(p => p - 1); }

    changePageSize(size: number): void {
        this.pageSize.set(size);
        this.currentPage.set(1);
        this.isPageSizeMenuOpen = false;
    }

    togglePageSizeMenu(event: Event): void {
        event.stopPropagation();
        this.isPageSizeMenuOpen = !this.isPageSizeMenuOpen;
        this.activeItem = null;
    }

    // Filter panel
    toggleFilterMenu(menu: string, event: Event): void {
        event.stopPropagation();
        this.activeFilterMenu.set(this.activeFilterMenu() === menu ? null : menu);
        this.activeItem = null;
        this.isPageSizeMenuOpen = false;
    }

    setFilter(type: 'status' | 'doctor', value: string): void {
        if (type === 'status') this.filterStatus.set(value);
        if (type === 'doctor') this.filterDoctor.set(value);
        this.activeFilterMenu.set(null);
        this.currentPage.set(1);
    }

    // Actions dropdown
    toggleDropdown(appointment: Appointment, event: Event): void {
        event.stopPropagation();
        if (this.activeItem?.id === appointment.id) {
            this.activeItem = null;
            return;
        }
        const btn = (event.currentTarget as HTMLElement).getBoundingClientRect();
        this.dropdownPos = { top: btn.bottom + 4, right: window.innerWidth - btn.right };
        this.activeItem = appointment;
    }

    closeAllDropdowns(): void {
        this.activeItem = null;
        this.isPageSizeMenuOpen = false;
        this.activeFilterMenu.set(null);
    }

    @HostListener('window:scroll')
    onWindowScroll(): void {
        this.activeItem = null;
    }

    // Modal
    openCreateModal(): void {
        this.modalPatientName.set('');
        this.modalDoctorName.set('');
        this.modalDate.set('');
        this.modalStatus.set('Scheduled');
        this.modalNotes.set('');
        this.isModalOpen.set(true);
    }

    closeModal(): void {
        this.isModalOpen.set(false);
    }

    createAppointment(): void {
        if (!this.modalPatientName() || !this.modalDoctorName() || !this.modalDate()) return;

        const newId = this.appointments.length > 0 ? Math.max(...this.appointments.map(a => a.id)) + 1 : 1;
        const newNo = this.appointments.length > 0 ? Math.max(...this.appointments.map(a => a.no)) + 1 : 1;

        const dateObj = new Date(this.modalDate());
        const formattedDate = dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

        const newAppointment: Appointment = {
            id: newId,
            no: newNo,
            patientName: this.modalPatientName(),
            notes: this.modalNotes() || 'No notes provided',
            doctorName: this.modalDoctorName(),
            doctorImage: '',
            appointmentDate: formattedDate,
            status: this.modalStatus()
        };

        this.appointments = [...this.appointments, newAppointment];
        this.closeModal();

        const total = Math.max(1, Math.ceil(this.appointments.length / this.pageSize()));
        this.currentPage.set(total);
    }

    deleteAppointment(appointment: Appointment): void {
        if (confirm(`Are you sure you want to delete appointment #${appointment.no}?`)) {
            this.appointments = this.appointments
                .filter(a => a.id !== appointment.id)
                .map((a, i) => ({ ...a, no: i + 1 }));
            this.activeItem = null;
            if (this.currentPage() > this.totalPages()) {
                this.currentPage.set(Math.max(1, this.totalPages()));
            }
        }
    }

    getAvatarInitialsName(name: string): string {
        return name.replace('Dr. ', '').replace(' ', '+');
    }

    get modalNotesLength(): number {
        return this.modalNotes()?.length || 0;
    }
}
