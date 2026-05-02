import { Component, ChangeDetectionStrategy, signal, computed, effect, untracked, HostListener, inject, OnInit, DestroyRef, NgZone } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { fromEvent, Subject, timer } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Search, Filter, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, MoreHorizontal, Eye, Plus, Edit2, Trash2 } from 'lucide-angular';
import { MedicalRecordService } from '../../../../services/medical-record.service';
import { AuthService } from '../../../../services/auth.service';
import { PatientService } from '../../../../services/patient.service';
import { MedicalRecordCreateModalComponent } from './medical-record-create-modal/medical-record-create-modal.component';


export interface Prescription {
    id: string;
    medication: string;
    dosage: string;
    frequency: string;
    startDate: string;
    endDate?: string;
}

export interface MedicalRecord {
    id: string;
    no: number;
    diagnosis: string;
    treatment: string;
    notes: string;
    date: string;
    doctorName: string;
    patientName: string;
    status: 'Reviewed' | 'Pending' | 'Archived';
    appointmentId?: string;
    prescriptions?: Prescription[];
}

@Component({
    selector: 'app-medical-records-page',
    imports: [CommonModule, FormsModule, LucideAngularModule, MedicalRecordCreateModalComponent],
    templateUrl: './medical-records-page.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        '(document:click)': 'closeAllDropdowns()'
    }
})
export class MedicalRecordsPageComponent implements OnInit {
    readonly Search = Search;
    readonly Filter = Filter;
    readonly ChevronLeft = ChevronLeft;
    readonly ChevronRight = ChevronRight;
    readonly ChevronDown = ChevronDown;
    readonly ChevronUp = ChevronUp;
    readonly MoreHorizontal = MoreHorizontal;
    readonly Eye = Eye;
    readonly Plus = Plus;
    readonly Edit2 = Edit2;
    readonly Trash2 = Trash2;

    private medicalRecordService = inject(MedicalRecordService);
    private authService = inject(AuthService);
    private patientService = inject(PatientService);
    private destroyRef = inject(DestroyRef);
    private ngZone = inject(NgZone);
    records = signal<MedicalRecord[]>([]);

    isDoctor = computed(() => this.authService.getCurrentUser()?.role === 'doctor');

    searchQuery = signal('');
    currentPage = signal(1);
    pageSize = signal(7);
    sortColumn = signal<string>('');
    sortDirection = signal<'asc' | 'desc'>('asc');
    filterStatus = signal<string>('All');
    filterType = signal<string>('All');
    activeFilterMenu = signal<string | null>(null);
    isPageSizeMenuOpen = false;

    // Action dropdown
    activeItem: MedicalRecord | null = null;
    dropdownPos = { top: 0, right: 0 };

    // Modal state
    isModalOpen = signal(false);
    selectedRecord = signal<MedicalRecord | null>(null);
    isReadOnly = signal(false);

    constructor() {
        effect(() => {
            this.searchQuery();
            untracked(() => this.currentPage.set(1));
        });
    }

    ngOnInit(): void {
        // Polling: Refresh from backend every 30 seconds
        timer(0, 10000).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
            const user = this.authService.getCurrentUser();
            if (user) {
                this.loadRecords(user);
            }
        });

        this.ngZone.runOutsideAngular(() => {
            fromEvent(window, 'scroll', { passive: true })
                .pipe(takeUntilDestroyed(this.destroyRef))
                .subscribe(() => {
                    if (this.activeItem) {
                        this.ngZone.run(() => {
                            this.activeItem = null;
                        });
                    }
                });
        });
    }

    private loadRecords(user: any): void {
        console.log('[MedicalRecordsPage] Loading records for user:', user.email, 'Role:', user.role);
        
        if (user.role === 'user') {
            // Patient user: resolve their clinical PatientId first
            this.patientService.getMyPatientId().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
                next: (patientId) => {
                    console.log('[MedicalRecordsPage] Resolved PatientId:', patientId);
                    this.medicalRecordService.getMedicalRecords(patientId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(items => {
                        this.records.set(items);
                    });
                },
                error: (err) => {
                    console.error('[MedicalRecordsPage] Failed to resolve PatientId:', err);
                    this.records.set([]);
                }
            });
        } else {
            // Admin or Doctor: show all records for now
            this.medicalRecordService.getMedicalRecords().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(items => {
                this.records.set(items);
            });
        }
    }

    availableStatuses = computed(() => {
        const statuses = this.records().map(r => r.status).filter(s => !!s);
        return ['All', ...Array.from(new Set(statuses)).sort()];
    });

    availableTypes = computed(() => {
        const types = this.records().map(r => r.diagnosis).filter(s => !!s);
        return ['All', ...Array.from(new Set(types)).sort()];
    });

    filteredRecords = computed(() => {
        let result = [...this.records()];
        const query = this.searchQuery().toLowerCase().trim();

        if (query) {
            result = result.filter(r =>
                r.diagnosis.toLowerCase().includes(query) ||
                r.doctorName.toLowerCase().includes(query) ||
                r.patientName.toLowerCase().includes(query) ||
                r.treatment.toLowerCase().includes(query) ||
                r.notes.toLowerCase().includes(query) ||
                r.date.toLowerCase().includes(query) ||
                r.status.toLowerCase().includes(query)
            );
        }

        const statFilter = this.filterStatus();
        if (statFilter !== 'All') {
            result = result.filter(r => r.status === statFilter);
        }

        const typeFilter = this.filterType();
        if (typeFilter !== 'All') {
            result = result.filter(r => r.diagnosis === typeFilter);
        }

        const col = this.sortColumn();
        const dir = this.sortDirection() === 'asc' ? 1 : -1;
        if (col) {
            result = [...result].sort((a, b) => {
                const aVal: any = a[col as keyof MedicalRecord];
                const bVal: any = b[col as keyof MedicalRecord];
                if (aVal < bVal) return -1 * dir;
                if (aVal > bVal) return 1 * dir;
                return 0;
            });
        }

        return result;
    });

    handleSort(column: string): void {
        if (this.sortColumn() === column) {
            this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
        } else {
            this.sortColumn.set(column);
            this.sortDirection.set('asc');
        }
        this.currentPage.set(1);
    }

    totalPages = computed(() => Math.max(1, Math.ceil(this.filteredRecords().length / this.pageSize())));

    paginatedRecords = computed(() => {
        const start = (this.currentPage() - 1) * this.pageSize();
        return this.filteredRecords().slice(start, start + this.pageSize());
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
        if (typeof page === 'number' && page >= 1 && page <= this.totalPages()) this.currentPage.set(page);
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

    toggleFilterMenu(menu: string, event: Event): void {
        event.stopPropagation();
        this.activeFilterMenu.set(this.activeFilterMenu() === menu ? null : menu);
        this.activeItem = null;
        this.isPageSizeMenuOpen = false;
    }

    setFilter(type: 'status' | 'type', value: string): void {
        if (type === 'status') this.filterStatus.set(value);
        if (type === 'type') this.filterType.set(value);
        this.activeFilterMenu.set(null);
        this.currentPage.set(1);
    }

    toggleDropdown(record: MedicalRecord, event: Event): void {
        event.stopPropagation();
        if (this.activeItem?.id === record.id) { this.activeItem = null; return; }
        const btn = (event.currentTarget as HTMLElement).getBoundingClientRect();
        this.dropdownPos = { top: btn.bottom + 4, right: window.innerWidth - btn.right };
        this.activeItem = record;
    }

    closeAllDropdowns(): void {
        this.activeItem = null;
        this.isPageSizeMenuOpen = false;
        this.activeFilterMenu.set(null);
    }

    onAddRecord(): void {
        this.selectedRecord.set(null);
        this.isReadOnly.set(false);
        this.isModalOpen.set(true);
    }

    onViewRecord(record: MedicalRecord): void {
        this.selectedRecord.set(record);
        this.isReadOnly.set(true);
        this.isModalOpen.set(true);
        this.activeItem = null;
    }

    onEditRecord(record: MedicalRecord): void {
        this.selectedRecord.set(record);
        this.isReadOnly.set(false);
        this.isModalOpen.set(true);
        this.activeItem = null;
    }

    onDeleteRecord(record: MedicalRecord): void {
        if (confirm(`Are you sure you want to delete this medical record?`)) {
            this.medicalRecordService.deleteMedicalRecord(record.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
            this.activeItem = null;
        }
    }

    onSaveRecord(formData: any): void {
        if (this.selectedRecord()) {
            this.medicalRecordService.updateMedicalRecord(this.selectedRecord()!.id, formData).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
                next: () => this.isModalOpen.set(false),
                error: err => alert(err)
            });
        } else {
            this.medicalRecordService.createMedicalRecord(formData).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
                next: () => this.isModalOpen.set(false),
                error: err => alert(err)
            });
        }
    }


}
