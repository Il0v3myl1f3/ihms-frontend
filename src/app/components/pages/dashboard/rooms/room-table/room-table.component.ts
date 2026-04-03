import { Component, OnInit, OnDestroy, input, output, ChangeDetectionStrategy, signal, computed, HostListener, effect, untracked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Pencil, Trash2, MoreHorizontal, Search, Filter, ChevronLeft, ChevronRight, Plus, ChevronDown, ChevronUp, Eye } from 'lucide-angular';

export interface Room {
    id: number;
    no: number;
    roomNumber: string;
    type: 'Single' | 'Double' | 'Suite' | 'ICU' | 'Operating';
    floor: number;
    capacity: number;
    status: 'Available' | 'Occupied' | 'Maintenance' | 'Reserved';
    pricePerDay: number;
    selected: boolean;
}

@Component({
    selector: 'app-room-table',
    imports: [FormsModule, LucideAngularModule, CommonModule],
    templateUrl: './room-table.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        '(document:click)': 'closeDropdown()'
    }
})
export class RoomTableComponent implements OnInit, OnDestroy {
    rooms = input<Room[]>([]);
    editRoom = output<Room>();
    deleteRoom = output<Room>();
    deleteSelected = output<Room[]>();
    addRoom = output<void>();
    viewRoom = output<Room>();

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

    activeItem: Room | null = null;
    dropdownPos = { top: 0, right: 0 };
    isPageSizeMenuOpen = false;

    selectAll = false;
    currentPage = signal(1);
    pageSize = signal(7);
    searchQuery = signal('');
    sortColumn = signal<string>('no');
    sortDirection = signal<'asc' | 'desc'>('asc');
    filterType = signal<string>('All');
    filterStatus = signal<string>('All');
    activeFilterMenu = signal<string | null>(null);

    availableTypes = computed(() => {
        const types = this.rooms().map(r => r.type).filter(s => !!s);
        return ['All', ...Array.from(new Set(types)).sort()];
    });

    availableStatuses = computed(() => {
        const statuses = this.rooms().map(r => r.status).filter(s => !!s);
        return ['All', ...Array.from(new Set(statuses)).sort()];
    });

    constructor() {
        effect(() => {
            this.searchQuery();
            untracked(() => this.currentPage.set(1));
        });
    }

    filteredRooms = computed(() => {
        const query = this.searchQuery().toLowerCase().trim();
        let result = this.rooms();

        const typeFilter = this.filterType();
        if (typeFilter !== 'All') {
            result = result.filter(r => r.type === typeFilter);
        }

        const statusFilter = this.filterStatus();
        if (statusFilter !== 'All') {
            result = result.filter(r => r.status === statusFilter);
        }

        if (query) {
            result = result.filter(r =>
                r.roomNumber.toLowerCase().includes(query) ||
                r.type.toLowerCase().includes(query) ||
                r.status.toLowerCase().includes(query) ||
                r.floor.toString().includes(query) ||
                r.capacity.toString().includes(query) ||
                r.pricePerDay.toString().includes(query) ||
                r.no.toString().includes(query)
            );
        }

        const col = this.sortColumn();
        const dir = this.sortDirection() === 'asc' ? 1 : -1;

        if (col) {
            result = [...result].sort((a, b) => {
                let aVal: any = a[col as keyof Room];
                let bVal: any = b[col as keyof Room];

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

    setFilter(type: 'type' | 'status', value: string): void {
        if (type === 'type') this.filterType.set(value);
        if (type === 'status') this.filterStatus.set(value);
        this.activeFilterMenu.set(null);
        this.currentPage.set(1);
    }

    togglePageSizeMenu(event: Event): void {
        event.stopPropagation();
        this.isPageSizeMenuOpen = !this.isPageSizeMenuOpen;
        this.activeItem = null;
    }

    toggleDropdown(room: Room, event: Event): void {
        event.stopPropagation();
        if (this.activeItem?.id === room.id) {
            this.activeItem = null;
            return;
        }
        const btn = (event.currentTarget as HTMLElement).getBoundingClientRect();
        this.dropdownPos = { top: btn.bottom + 4, right: window.innerWidth - btn.right };
        this.activeItem = room;
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
        this.rooms().forEach(r => r.selected = this.selectAll);
    }

    updateSelectAllState(): void {
        this.selectAll = this.rooms().every(r => r.selected);
    }

    get hasSelectedRooms(): boolean {
        return this.rooms().some(r => r.selected);
    }

    totalPages = computed(() => {
        return Math.max(1, Math.ceil(this.filteredRooms().length / this.pageSize()));
    });

    paginatedRooms = computed(() => {
        const startIndex = (this.currentPage() - 1) * this.pageSize();
        return this.filteredRooms().slice(startIndex, startIndex + this.pageSize());
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

    onEdit(room: Room): void {
        this.editRoom.emit(room);
    }

    onView(room: Room): void {
        this.viewRoom.emit(room);
    }

    onDelete(room: Room): void {
        if (confirm(`Are you sure you want to delete room "${room.roomNumber}"?`)) {
            this.deleteRoom.emit(room);
        }
    }

    onDeleteSelected(): void {
        const selected = this.rooms().filter(r => r.selected);
        if (selected.length === 0) return;
        if (confirm(`Are you sure you want to delete ${selected.length} selected room(s)?`)) {
            this.deleteSelected.emit(selected);
            this.selectAll = false;
        }
    }

    getStatusClasses(status: string): string {
        switch (status) {
            case 'Available': return 'bg-emerald-50 text-emerald-700';
            case 'Occupied': return 'bg-blue-50 text-blue-700';
            case 'Maintenance': return 'bg-amber-50 text-amber-700';
            case 'Reserved': return 'bg-purple-50 text-purple-700';
            default: return 'bg-gray-50 text-gray-700';
        }
    }
}
