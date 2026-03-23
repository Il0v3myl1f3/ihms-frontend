import { Component, OnInit, OnDestroy, input, output, ChangeDetectionStrategy, signal, computed, HostListener, effect, untracked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Pencil, Trash2, MoreHorizontal, Search, Filter, ChevronLeft, ChevronRight, Plus, ChevronDown, ChevronUp, Eye } from 'lucide-angular';

export interface Payment {
    id: number;
    no: number;
    invoiceNumber: string;
    patientName: string;
    amount: number;
    date: string;
    method: 'Cash' | 'Credit Card' | 'Debit Card' | 'Insurance' | 'Bank Transfer';
    status: 'Paid' | 'Pending' | 'Failed' | 'Refunded';
    selected: boolean;
}

@Component({
    selector: 'app-payment-table',
    imports: [FormsModule, LucideAngularModule, CommonModule],
    templateUrl: './payment-table.component.html',
    styleUrl: './payment-table.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        '(document:click)': 'closeDropdown()'
    }
})
export class PaymentTableComponent implements OnInit, OnDestroy {
    payments = input<Payment[]>([]);
    editPayment = output<Payment>();
    deletePayment = output<Payment>();
    deleteSelected = output<Payment[]>();
    addPayment = output<void>();
    viewPayment = output<Payment>();

    readonly Pencil = Pencil;
    readonly Trash2 = Trash2;
    readonly MoreHorizontal = MoreHorizontal;
    readonly Search = Search;
    readonly Filter = Filter;
    readonly ChevronLeft = ChevronLeft;
    readonly ChevronRight = ChevronRight;
    readonly Plus = Plus;
    readonly ChevronDown = ChevronDown;
    readonly ChevronUp = ChevronUp;
    readonly Eye = Eye;

    activeItem: Payment | null = null;
    dropdownPos = { top: 0, right: 0 };
    isPageSizeMenuOpen = false;

    selectAll = false;
    currentPage = signal(1);
    pageSize = signal(7);
    searchQuery = signal('');
    sortColumn = signal<string>('no');
    sortDirection = signal<'asc' | 'desc'>('asc');
    filterMethod = signal<string>('All');
    filterStatus = signal<string>('All');
    activeFilterMenu = signal<string | null>(null);

    availableMethods = computed(() => {
        const methods = this.payments().map(p => p.method).filter(s => !!s);
        return ['All', ...Array.from(new Set(methods)).sort()];
    });

    availableStatuses = computed(() => {
        const statuses = this.payments().map(p => p.status).filter(s => !!s);
        return ['All', ...Array.from(new Set(statuses)).sort()];
    });

    constructor() {
        effect(() => {
            this.searchQuery();
            untracked(() => this.currentPage.set(1));
        });
    }

    filteredPayments = computed(() => {
        const query = this.searchQuery().toLowerCase().trim();
        let result = this.payments();

        const methodFilter = this.filterMethod();
        if (methodFilter !== 'All') {
            result = result.filter(p => p.method === methodFilter);
        }

        const statusFilter = this.filterStatus();
        if (statusFilter !== 'All') {
            result = result.filter(p => p.status === statusFilter);
        }

        if (query) {
            result = result.filter(p =>
                p.invoiceNumber.toLowerCase().includes(query) ||
                p.patientName.toLowerCase().includes(query) ||
                p.method.toLowerCase().includes(query) ||
                p.status.toLowerCase().includes(query) ||
                p.amount.toString().includes(query) ||
                p.no.toString().includes(query)
            );
        }

        const col = this.sortColumn();
        const dir = this.sortDirection() === 'asc' ? 1 : -1;

        if (col) {
            result = [...result].sort((a, b) => {
                let aVal: any = a[col as keyof Payment];
                let bVal: any = b[col as keyof Payment];

                if (col === 'date') {
                    const parseDate = (d: string) => {
                        if (!d) return 0;
                        const parts = d.split('/');
                        if (parts.length === 3) {
                            return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0])).getTime();
                        }
                        return new Date(d).getTime();
                    };
                    aVal = parseDate(aVal);
                    bVal = parseDate(bVal);
                }

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

    ngOnInit(): void {
        this.checkResponsiveSettings();
    }

    changePageSize(size: number | string): void {
        this.pageSize.set(Number(size));
        this.currentPage.set(1);
        this.isPageSizeMenuOpen = false;
    }

    closeDropdown() {
        this.activeItem = null;
        this.isPageSizeMenuOpen = false;
        this.activeFilterMenu.set(null);
    }

    toggleFilterMenu(menu: string, event: Event): void {
        event.stopPropagation();
        this.activeFilterMenu.set(this.activeFilterMenu() === menu ? null : menu);
        this.activeItem = null;
        this.isPageSizeMenuOpen = false;
    }

    setFilter(type: 'method' | 'status', value: string): void {
        if (type === 'method') this.filterMethod.set(value);
        if (type === 'status') this.filterStatus.set(value);
        this.activeFilterMenu.set(null);
        this.currentPage.set(1);
    }

    togglePageSizeMenu(event: Event): void {
        event.stopPropagation();
        this.isPageSizeMenuOpen = !this.isPageSizeMenuOpen;
        this.activeItem = null;
    }

    toggleDropdown(payment: Payment, event: Event): void {
        event.stopPropagation();
        if (this.activeItem?.id === payment.id) {
            this.activeItem = null;
            return;
        }
        const btn = (event.currentTarget as HTMLElement).getBoundingClientRect();
        this.dropdownPos = { top: btn.bottom + 4, right: window.innerWidth - btn.right };
        this.activeItem = payment;
    }

    ngOnDestroy(): void { }

    @HostListener('window:scroll')
    onWindowScroll(): void {
        this.activeItem = null;
    }

    @HostListener('window:resize')
    onResize(): void {
        this.checkResponsiveSettings();
    }

    private checkResponsiveSettings(): void {
        if (window.innerWidth < 1024) {
            if (this.pageSize() !== 7) {
                this.pageSize.set(7);
            }
        }
    }

    toggleSelectAll(): void {
        this.payments().forEach(p => p.selected = this.selectAll);
    }

    updateSelectAllState(): void {
        this.selectAll = this.payments().every(p => p.selected);
    }

    get hasSelectedPayments(): boolean {
        return this.payments().some(p => p.selected);
    }

    totalPages = computed(() => {
        return Math.max(1, Math.ceil(this.filteredPayments().length / this.pageSize()));
    });

    paginatedPayments = computed(() => {
        const startIndex = (this.currentPage() - 1) * this.pageSize();
        return this.filteredPayments().slice(startIndex, startIndex + this.pageSize());
    });

    visiblePages = computed(() => {
        const total = this.totalPages();
        const current = this.currentPage();
        if (total <= 5) {
            return Array.from({ length: total }, (_, i) => i + 1);
        }

        if (current <= 3) {
            return [1, 2, 3, '...', total];
        } else if (current >= total - 2) {
            return [1, '...', total - 2, total - 1, total];
        } else {
            return [1, '...', current, '...', total];
        }
    });

    goToPage(page: number | string): void {
        if (typeof page === 'number' && page >= 1 && page <= this.totalPages() && page !== this.currentPage()) {
            this.currentPage.set(page);
        }
    }

    nextPage(): void {
        if (this.currentPage() < this.totalPages()) {
            this.currentPage.update(p => p + 1);
        }
    }

    prevPage(): void {
        if (this.currentPage() > 1) {
            this.currentPage.update(p => p - 1);
        }
    }

    onEdit(payment: Payment): void {
        this.editPayment.emit(payment);
    }

    onView(payment: Payment): void {
        this.viewPayment.emit(payment);
    }

    onDelete(payment: Payment): void {
        if (confirm(`Are you sure you want to delete payment "${payment.invoiceNumber}"?`)) {
            this.deletePayment.emit(payment);
        }
    }

    onDeleteSelected(): void {
        const selected = this.payments().filter(p => p.selected);
        if (selected.length === 0) return;
        if (confirm(`Are you sure you want to delete ${selected.length} selected payment(s)?`)) {
            this.deleteSelected.emit(selected);
            this.selectAll = false;
        }
    }

    getStatusClasses(status: string): string {
        switch (status) {
            case 'Paid': return 'bg-emerald-50 text-emerald-700';
            case 'Pending': return 'bg-amber-50 text-amber-700';
            case 'Failed': return 'bg-red-50 text-red-600';
            case 'Refunded': return 'bg-blue-50 text-blue-700';
            default: return 'bg-gray-50 text-gray-700';
        }
    }
}
