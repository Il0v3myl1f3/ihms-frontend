import { Component, ChangeDetectionStrategy, signal, computed, effect, untracked, HostListener, inject, DestroyRef, NgZone, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { fromEvent, timer } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Search, Filter, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, MoreHorizontal, Eye, Pencil, Trash2 } from 'lucide-angular';
import { PrescriptionService } from '../../../../services/prescription.service';
import { PatientService } from '../../../../services/patient.service';
import { AuthService } from '../../../../services/auth.service';

export interface Prescription {
    id: number;
    no: number;
    medication: string;
    dosage: string;
    frequency: string;
    doctorName: string;
    startDate: string;
    endDate: string;
    status: 'Active' | 'Expired' | 'Completed';
}

@Component({
    selector: 'app-prescriptions-page',
    imports: [CommonModule, FormsModule, LucideAngularModule],
    templateUrl: './prescriptions-page.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        '(document:click)': 'closeAllDropdowns()'
    }
})
export class PrescriptionsPageComponent implements OnInit {
    readonly Search = Search;
    readonly Filter = Filter;
    readonly ChevronLeft = ChevronLeft;
    readonly ChevronRight = ChevronRight;
    readonly ChevronDown = ChevronDown;
    readonly ChevronUp = ChevronUp;
    readonly MoreHorizontal = MoreHorizontal;
    readonly Eye = Eye;
    readonly Pencil = Pencil;
    readonly Trash2 = Trash2;

    private prescriptionService = inject(PrescriptionService);
    private patientService = inject(PatientService);
    private authService = inject(AuthService);
    private destroyRef = inject(DestroyRef);
    private ngZone = inject(NgZone);
    prescriptions = signal<Prescription[]>([]);

    searchQuery = signal('');
    currentPage = signal(1);
    pageSize = signal(7);
    sortColumn = signal<string>('');
    sortDirection = signal<'asc' | 'desc'>('asc');
    filterStatus = signal<string>('All');
    activeFilterMenu = signal<string | null>(null);
    isPageSizeMenuOpen = false;

    // Action dropdown
    activeItem: Prescription | null = null;
    dropdownPos = { top: 0, right: 0 };

    ngOnInit(): void {
        const user = this.authService.getCurrentUser();
        
        // Polling: Refresh from backend every 30 seconds
        timer(0, 10000).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
            if (user?.role === 'user') {
                this.patientService.getMyPatientId().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(id => {
                    this.loadPrescriptions(id);
                });
            } else {
                this.loadPrescriptions();
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

    loadPrescriptions(patientId?: string): void {
        this.prescriptionService.getPrescriptions(patientId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(items => {
            this.prescriptions.set(items);
        });
    }

    constructor() {
        effect(() => {
            this.searchQuery();
            untracked(() => this.currentPage.set(1));
        });
    }

    availableStatuses = computed(() => {
        const statuses = this.prescriptions().map(p => p.status).filter(s => !!s);
        return ['All', ...Array.from(new Set(statuses)).sort()];
    });

    filteredPrescriptions = computed(() => {
        let result = [...this.prescriptions()];
        const query = this.searchQuery().toLowerCase().trim();

        if (query) {
            result = result.filter(p =>
                p.medication.toLowerCase().includes(query) ||
                p.doctorName.toLowerCase().includes(query) ||
                p.dosage.toLowerCase().includes(query) ||
                p.frequency.toLowerCase().includes(query) ||
                p.status.toLowerCase().includes(query)
            );
        }

        const statFilter = this.filterStatus();
        if (statFilter !== 'All') {
            result = result.filter(p => p.status === statFilter);
        }

        const col = this.sortColumn();
        const dir = this.sortDirection() === 'asc' ? 1 : -1;
        if (col) {
            result = [...result].sort((a, b) => {
                const aVal: any = a[col as keyof Prescription];
                const bVal: any = b[col as keyof Prescription];
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

    totalPages = computed(() => Math.max(1, Math.ceil(this.filteredPrescriptions().length / this.pageSize())));

    paginatedPrescriptions = computed(() => {
        const start = (this.currentPage() - 1) * this.pageSize();
        return this.filteredPrescriptions().slice(start, start + this.pageSize());
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

    setFilter(type: 'status', value: string): void {
        this.filterStatus.set(value);
        this.activeFilterMenu.set(null);
        this.currentPage.set(1);
    }

    toggleDropdown(rx: Prescription, event: Event): void {
        event.stopPropagation();
        if (this.activeItem?.id === rx.id) { this.activeItem = null; return; }
        const btn = (event.currentTarget as HTMLElement).getBoundingClientRect();
        this.dropdownPos = { top: btn.bottom + 4, right: window.innerWidth - btn.right };
        this.activeItem = rx;
    }

    closeAllDropdowns(): void {
        this.activeItem = null;
        this.isPageSizeMenuOpen = false;
        this.activeFilterMenu.set(null);
    }


}
